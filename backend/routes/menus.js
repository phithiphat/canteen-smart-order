const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middlewares/auth');
const prisma = new PrismaClient();

// Public: Get all available menus
router.get('/', authenticate, async (req, res) => {
  try {
    const menus = await prisma.menu.findMany({
      where: { isAvailable: true },
      include: { vendor: { select: { storeName: true, isOpen: true } } }
    });
    res.json(menus);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new menu (Vendor only)
router.post('/', authenticate, authorize(['VENDOR']), async (req, res) => {
  const { name, price, description, imageUrl } = req.body;

  try {
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!vendorProfile) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }

    const newMenu = await prisma.menu.create({
      data: {
        vendorId: vendorProfile.id,
        name,
        price,
        description,
        imageUrl,
      }
    });

    res.status(201).json(newMenu);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update menu availability (Vendor only)
router.patch('/:id/availability', authenticate, authorize(['VENDOR']), async (req, res) => {
  const { isAvailable } = req.body;
  const { id } = req.params;

  try {
    const menu = await prisma.menu.findUnique({ where: { id: parseInt(id) } });

    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (menu.vendorId !== vendorProfile.id) {
      return res.status(403).json({ error: 'Unauthorized to modify this menu' });
    }

    const updatedMenu = await prisma.menu.update({
      where: { id: parseInt(id) },
      data: { isAvailable }
    });

    res.json(updatedMenu);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
