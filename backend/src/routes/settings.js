const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, email: true, name: true, brand: true }
    });
    const settings = await prisma.settings.findUnique({
      where: { userId: req.user.userId }
    });
    res.json({ user, settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', authenticate, async (req, res) => {
  try {
    const { name, brand } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { name, brand }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/notifications', authenticate, async (req, res) => {
  try {
    const { notificationNewBooking, notificationInspection, notificationFeedback, notificationWeekly } = req.body;
    const settings = await prisma.settings.upsert({
      where: { userId: req.user.userId },
      update: { notificationNewBooking, notificationInspection, notificationFeedback, notificationWeekly },
      create: { userId: req.user.userId, notificationNewBooking, notificationInspection, notificationFeedback, notificationWeekly }
    });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;