const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middlewares/auth');
const prisma = new PrismaClient();

// Customer: Create a new order (Pre-order Food)
router.post('/', authenticate, authorize(['CUSTOMER']), async (req, res) => {
  const { vendorId, items, pickupTime } = req.body;
  // items array: [{ menuId, quantity, specialInstructions }]

  try {
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const menu = await prisma.menu.findUnique({ where: { id: item.menuId } });
      if (!menu || !menu.isAvailable) {
        return res.status(400).json({ error: `Menu item ${item.menuId} is not available.` });
      }
      totalAmount += parseFloat(menu.price) * item.quantity;
      orderItemsData.push({
        menuId: item.menuId,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions
      });
    }

    const order = await prisma.order.create({
      data: {
        customerId: req.user.id,
        vendorId,
        totalAmount,
        pickupTime: new Date(pickupTime),
        orderItems: {
          create: orderItemsData
        }
      },
      include: { orderItems: true }
    });

    // Mock QR Code generated
    const qrCodeMockUrl = `https://mock-qr-code.com/pay/${order.id}`;

    res.status(201).json({ order, qrCodeMockUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Customer: Mock Payment Success
router.post('/:id/pay', authenticate, authorize(['CUSTOMER']), async (req, res) => {
  const { id } = req.params;

  try {
    const order = await prisma.order.findUnique({ where: { id: parseInt(id) } });
    if (!order || order.customerId !== req.user.id) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status: 'PAID', paymentStatus: 'SUCCESS' }
    });

    res.json(updatedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Customer: Get my orders
router.get('/my-orders', authenticate, authorize(['CUSTOMER']), async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId: req.user.id },
      include: { orderItems: { include: { menu: true } }, vendor: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Customer: Cancel Order
router.post('/:id/cancel', authenticate, authorize(['CUSTOMER']), async (req, res) => {
  const { id } = req.params;

  try {
    const order = await prisma.order.findUnique({ where: { id: parseInt(id) } });
    if (!order || order.customerId !== req.user.id) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'PENDING' && order.status !== 'PAID') {
      return res.status(400).json({ error: 'Cannot cancel. Food is being prepared or completed.' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status: 'CANCELLED' }
    });

    res.json(updatedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Customer: Reschedule Order
router.patch('/:id/reschedule', authenticate, authorize(['CUSTOMER']), async (req, res) => {
  const { id } = req.params;
  const { newPickupTime } = req.body;

  try {
    const order = await prisma.order.findUnique({ where: { id: parseInt(id) } });
    if (!order || order.customerId !== req.user.id) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'PENDING' && order.status !== 'PAID') {
      return res.status(400).json({ error: 'Cannot reschedule. Food is being prepared or completed.' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { pickupTime: new Date(newPickupTime) }
    });

    res.json(updatedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Customer: Complete Order (Customer picked up food)
router.post('/:id/complete', authenticate, authorize(['CUSTOMER']), async (req, res) => {
  const { id } = req.params;

  try {
    const order = await prisma.order.findUnique({ where: { id: parseInt(id) } });
    if (!order || order.customerId !== req.user.id) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'READY') {
      return res.status(400).json({ error: 'Order is not ready for pickup yet.' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status: 'COMPLETED' }
    });

    res.json(updatedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
