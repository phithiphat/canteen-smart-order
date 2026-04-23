const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middlewares/auth');
const prisma = new PrismaClient();

// Admin: Get Dashboard Stats
router.get('/dashboard', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const totalVendors = await prisma.vendorProfile.count();
    const totalOrders = await prisma.order.count();
    const completedOrders = await prisma.order.count({ where: { status: 'COMPLETED' } });
    
    res.json({ totalVendors, totalOrders, completedOrders });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Manage Vendors (Create new vendor)
router.post('/vendors', authenticate, authorize(['ADMIN']), async (req, res) => {
  const { email, name, password, storeName } = req.body;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    const vendorUser = await prisma.user.create({
      data: {
        email,
        name,
        password, // In real app, hash this!
        role: 'VENDOR',
        vendorProfile: {
          create: { storeName }
        }
      },
      include: { vendorProfile: true }
    });

    res.status(201).json(vendorUser);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Suspend Vendor Account
router.patch('/vendors/:id/suspend', authenticate, authorize(['ADMIN']), async (req, res) => {
  const { id } = req.params; // Vendor's User ID

  try {
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { status: 'SUSPENDED' }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Export Order History (mocked CSV data)
router.get('/orders/export', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { customer: true, vendor: true }
    });
    
    // Simplistic CSV mock
    let csv = 'OrderID,CustomerName,VendorName,TotalAmount,Status\n';
    orders.forEach(o => {
      csv += `${o.id},${o.customer.name},${o.vendor.storeName},${o.totalAmount},${o.status}\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('orders.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Manage Announcements
router.post('/announcements', authenticate, authorize(['ADMIN']), async (req, res) => {
  const { title, content, targetGroup } = req.body;

  try {
    const announcement = await prisma.announcement.create({
      data: {
        title,
        content
      }
    });
    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Get all vendors
router.get('/vendors', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const vendors = await prisma.vendorProfile.findMany({
      include: { user: { select: { email: true, name: true, status: true } } }
    });
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Public: Get Announcements
router.get('/announcements', authenticate, async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
