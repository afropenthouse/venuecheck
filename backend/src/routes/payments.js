const express = require('express');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const router = express.Router();
const prisma = new PrismaClient();

// Constants
const MONTHLY_PRICE = 30000; // 30k in Naira
const MIN_MONTHS = 6;
const MAX_MONTHS = 12;

// Initialize Paystack
const paystack = require('paystack')(process.env.PAYSTACK_SECRET_KEY);

// Initialize transaction
router.post('/initialize', async (req, res) => {
  try {
    const { months, email, callback_url } = req.body;
    
    // Validate months
    if (months < MIN_MONTHS || months > MAX_MONTHS) {
      return res.status(400).json({ 
        error: `Subscription duration must be between ${MIN_MONTHS} and ${MAX_MONTHS} months` 
      });
    }

    // Calculate amount (in kobo for Paystack)
    const amount = MONTHLY_PRICE * months * 100;
    
    // Get user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Initialize Paystack transaction
    const response = await paystack.transaction.initialize({
      amount: amount,
      email: email,
      callback_url: callback_url || `${process.env.FRONTEND_URL}/payment/verify`,
      metadata: {
        userId: user.id,
        months: months,
        amount: amount / 100,
        purpose: 'venue_subscription'
      }
    });

    res.json({
      success: true,
      authorization_url: response.data.authorization_url,
      reference: response.data.reference,
      amount: amount / 100,
      months: months
    });

  } catch (error) {
    console.error('Payment initialization error:', error);
    res.status(500).json({ error: 'Failed to initialize payment' });
  }
});

// Verify payment
router.post('/verify', async (req, res) => {
  try {
    const { reference } = req.body;
    
    if (!reference) {
      return res.status(400).json({ error: 'Reference is required' });
    }

    // Verify transaction with Paystack
    const response = await paystack.transaction.verify(reference);
    
    if (!response.data.status || response.data.status !== 'success') {
      return res.status(400).json({ error: 'Payment not successful' });
    }
    const metadata = response.data.metadata;
    const userId = metadata.userId;
    const months = metadata.months;
    const amount = metadata.amount;

    // Get user
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date(startDate);
    
    // Properly calculate end date by adding months
    // This handles edge cases like adding months to the last day of a month
    const targetMonth = endDate.getMonth() + parseInt(months);
    const targetYear = endDate.getFullYear() + Math.floor(targetMonth / 12);
    const finalMonth = targetMonth % 12;
    
    endDate.setFullYear(targetYear, finalMonth, endDate.getDate());
    
    // If the date gets adjusted (e.g., April 31 -> April 30), keep the last day of the target month
    if (endDate.getDate() !== startDate.getDate()) {
      endDate.setDate(0); // Set to last day of previous month
    }

    
    // Update user subscription
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'ACTIVE',
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate,
        subscriptionDuration: parseInt(months),
        paymentMethod: 'paystack',
        paystackReference: reference,
        manuallyActivated: false
      }
    });

    res.json({
      success: true,
      message: 'Subscription activated successfully',
      subscription: {
        status: updatedUser.subscriptionStatus,
        startDate: updatedUser.subscriptionStartDate,
        endDate: updatedUser.subscriptionEndDate,
        duration: updatedUser.subscriptionDuration,
        amount: amount
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Webhook handler
router.post('/webhook', async (req, res) => {
  try {
    const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body.event;
    const data = req.body.data;

    if (event === 'charge.success') {
      const metadata = data.metadata;
      
      if (metadata && metadata.purpose === 'venue_subscription') {
        const userId = metadata.userId;
        const months = metadata.months;
        
        // Calculate subscription dates
        const startDate = new Date();
        const endDate = new Date(startDate);
        
        // Properly calculate end date by adding months
        const targetMonth = endDate.getMonth() + parseInt(months);
        const targetYear = endDate.getFullYear() + Math.floor(targetMonth / 12);
        const finalMonth = targetMonth % 12;
        
        endDate.setFullYear(targetYear, finalMonth, endDate.getDate());
        
        // If the date gets adjusted (e.g., April 31 -> April 30), keep the last day of the target month
        if (endDate.getDate() !== startDate.getDate()) {
          endDate.setDate(0); // Set to last day of previous month
        }

        // Update user subscription
        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: 'ACTIVE',
            subscriptionStartDate: startDate,
            subscriptionEndDate: endDate,
            subscriptionDuration: parseInt(months),
            paymentMethod: 'paystack',
            paystackReference: data.reference,
            manuallyActivated: false
          }
        });
      }
    }

    res.sendStatus(200);

  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
});

// Get subscription status
router.get('/subscription/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionStatus: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
        subscriptionDuration: true,
        paymentMethod: true,
        manuallyActivated: true,
        activatedBy: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if subscription has expired
    if (user.subscriptionStatus === 'ACTIVE' && user.subscriptionEndDate) {
      const now = new Date();
      const endDate = new Date(user.subscriptionEndDate);
      
      if (now > endDate) {
        // Update status to expired
        await prisma.user.update({
          where: { id: userId },
          data: { subscriptionStatus: 'EXPIRED' }
        });
        
        user.subscriptionStatus = 'EXPIRED';
      }
    }

    
    res.json({
      subscription: {
        status: user.subscriptionStatus,
        endDate: user.subscriptionEndDate,
        duration: user.subscriptionDuration,
        paymentMethod: user.paymentMethod,
        startDate: user.subscriptionStartDate
      }
    });

  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
});


// Manual activation (admin only)
router.post('/manual-activate', async (req, res) => {
  try {
    const { userId, months, activatedBy } = req.body;
    
    // Validate months
    if (months < MIN_MONTHS || months > MAX_MONTHS) {
      return res.status(400).json({ 
        error: `Subscription duration must be between ${MIN_MONTHS} and ${MAX_MONTHS} months` 
      });
    }

    // Get user
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date(startDate);
    
    // Properly calculate end date by adding months
    const targetMonth = endDate.getMonth() + parseInt(months);
    const targetYear = endDate.getFullYear() + Math.floor(targetMonth / 12);
    const finalMonth = targetMonth % 12;
    
    endDate.setFullYear(targetYear, finalMonth, endDate.getDate());
    
    // If the date gets adjusted (e.g., April 31 -> April 30), keep the last day of the target month
    if (endDate.getDate() !== startDate.getDate()) {
      endDate.setDate(0); // Set to last day of previous month
    }

    // Update user subscription
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'ACTIVE',
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate,
        subscriptionDuration: parseInt(months),
        paymentMethod: 'manual',
        manuallyActivated: true,
        activatedBy: activatedBy
      }
    });

    res.json({
      success: true,
      message: 'Subscription activated manually',
      subscription: {
        status: updatedUser.subscriptionStatus,
        startDate: updatedUser.subscriptionStartDate,
        endDate: updatedUser.subscriptionEndDate,
        duration: updatedUser.subscriptionDuration,
        manuallyActivated: updatedUser.manuallyActivated
      }
    });

  } catch (error) {
    console.error('Manual activation error:', error);
    res.status(500).json({ error: 'Failed to activate subscription' });
  }
});

module.exports = router;
