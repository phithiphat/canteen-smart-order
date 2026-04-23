const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middlewares/auth');
const prisma = new PrismaClient();

// Public: List all vendors
router.get('/', authenticate, async (req, res) => {
  try {
    const vendors = await prisma.vendorProfile.findMany({
      where: { isOpen: true }
    });
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Public: Get menus for a specific vendor
router.get('/:id/menus', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const menus = await prisma.menu.findMany({
      where: { vendorId: parseInt(id), isAvailable: true }
    });
    res.json(menus);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Vendor: Get own profile
router.get('/me', authenticate, authorize(['VENDOR']), async (req, res) => {
  try {
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.user.id },
      include: { user: { select: { name: true, email: true } } }
    });
    res.json(vendorProfile);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Vendor: Get own menus
router.get('/my-menus', authenticate, authorize(['VENDOR']), async (req, res) => {
  try {
    const vendorProfile = await prisma.vendorProfile.findUnique({ where: { userId: req.user.id } });
    if (!vendorProfile) return res.status(404).json({ error: 'Profile not found' });
    const menus = await prisma.menu.findMany({
      where: { vendorId: vendorProfile.id }
    });
    res.json(menus);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Vendor: Get incoming orders
router.get('/orders/incoming', authenticate, authorize(['VENDOR']), async (req, res) => {
  try {
    const vendorProfile = await prisma.vendorProfile.findUnique({ where: { userId: req.user.id } });
    if (!vendorProfile) return res.status(404).json({ error: 'Vendor profile not found' });

    const orders = await prisma.order.findMany({
      where: { vendorId: vendorProfile.id, status: { in: ['PENDING', 'ACCEPTED', 'PREPARING', 'READY'] } },
      include: { orderItems: { include: { menu: true } }, customer: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'asc' }
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Vendor: Accept/Reject order
router.post('/orders/:id/accept', authenticate, authorize(['VENDOR']), async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'ACCEPT' or 'REJECT'

  try {
    const vendorProfile = await prisma.vendorProfile.findUnique({ where: { userId: req.user.id } });
    const order = await prisma.order.findUnique({ where: { id: parseInt(id) } });

    if (!order || order.vendorId !== vendorProfile.id) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (action === 'ACCEPT') {
      const updated = await prisma.order.update({
        where: { id: parseInt(id) },
        data: { status: 'ACCEPTED' }
      });
      res.json(updated);
    } else if (action === 'REJECT') {
      const updated = await prisma.order.update({
        where: { id: parseInt(id) },
        data: { status: 'CANCELLED' }
      });
      // In a real system, process refund here
      res.json(updated);
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Vendor: Get orders grouped by menu (UC-11)
router.get('/orders/grouped', authenticate, authorize(['VENDOR']), async (req, res) => {
  try {
    const vendorProfile = await prisma.vendorProfile.findUnique({ where: { userId: req.user.id } });
    
    // Get all order items for orders that are COOKING
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: { vendorId: vendorProfile.id, status: 'PREPARING' }
      },
      include: { menu: true, order: { select: { id: true, customer: { select: { name: true } } } } }
    });

    const grouped = {};
    orderItems.forEach(item => {
      if (!grouped[item.menu.name]) {
        grouped[item.menu.name] = { totalQuantity: 0, items: [] };
      }
      grouped[item.menu.name].totalQuantity += item.quantity;
      grouped[item.menu.name].items.push({
        orderId: item.order.id,
        customerName: item.order.customer.name,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions
      });
    });

    res.json(grouped);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Vendor: Update order status (UC-12)
router.patch('/orders/:id/status', authenticate, authorize(['VENDOR']), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // e.g. 'READY', 'COMPLETED'

  try {
    const vendorProfile = await prisma.vendorProfile.findUnique({ where: { userId: req.user.id } });
    const order = await prisma.order.findUnique({ where: { id: parseInt(id) } });

    if (!order || order.vendorId !== vendorProfile.id) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updated = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Vendor: Get daily sales report
router.get('/reports/daily-sales', authenticate, authorize(['VENDOR']), async (req, res) => {
  try {
    const vendorProfile = await prisma.vendorProfile.findUnique({ where: { userId: req.user.id } });
    
    // Simplistic daily sales (fetching all COMPLETED for today)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
      where: {
        vendorId: vendorProfile.id,
        status: 'COMPLETED',
        createdAt: { gte: startOfDay }
      }
    });

    const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
    
    res.json({ date: startOfDay, totalOrders: orders.length, totalSales });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
