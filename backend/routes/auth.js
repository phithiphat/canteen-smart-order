const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Mock University Email Login
router.post('/login/customer', async (req, res) => {
  const { email } = req.body;
  
  if (!email || !email.endsWith('@bu.ac.th')) { // Assuming Bangkok University from the PDF
    return res.status(400).json({ error: 'Must use a valid university email' });
  }

  try {
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Mock SSO: Auto-create user if they don't exist
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0],
          role: 'CUSTOMER'
        }
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ error: 'Your account is suspended' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mock System Login (Vendor/Admin)
router.post('/login/system', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.role === 'CUSTOMER') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // In a real app, compare hashed passwords. For mock, plain text comparison is used.
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ error: 'Your account is suspended' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
