const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get all users for admin
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionStatus: true,
        subscriptionEndDate: true,
        subscriptionStartDate: true,
        subscriptionDuration: true,
        paymentMethod: true,
        manuallyActivated: true,
        activatedBy: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user details with subscription info
router.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionStatus: true,
        subscriptionEndDate: true,
        subscriptionStartDate: true,
        subscriptionDuration: true,
        paymentMethod: true,
        manuallyActivated: true,
        activatedBy: true,
        createdAt: true,
        updatedAt: true,
        venues: {
          select: {
            id: true,
            name: true,
            createdAt: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// Get subscription statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await prisma.user.groupBy({
      by: ['subscriptionStatus'],
      _count: {
        id: true
      }
    });

    const totalUsers = await prisma.user.count();
    const activeSubscriptions = await prisma.user.count({
      where: {
        subscriptionStatus: 'ACTIVE',
        subscriptionEndDate: {
          gt: new Date()
        }
      }
    });

    const manuallyActivated = await prisma.user.count({
      where: {
        manuallyActivated: true
      }
    });

    res.json({
      totalUsers,
      activeSubscriptions,
      manuallyActivated,
      statusBreakdown: stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
