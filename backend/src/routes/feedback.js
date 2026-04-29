const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Submit feedback for a venue
router.post('/venues/:venueId/feedback', async (req, res) => {
  try {
    const { venueId } = req.params;
    const { rating, comment, guestName, guestEmail } = req.body;

    // Validate required fields
    if (!rating || !guestName) {
      return res.status(400).json({ error: 'Rating and guest name are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if venue exists
    const venue = await prisma.venue.findUnique({
      where: { id: venueId }
    });

    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        venueId,
        rating: parseInt(rating),
        comment: comment || null,
        guestName,
        guestEmail: guestEmail || null
      },
      include: {
        venue: {
          select: {
            name: true,
            location: true
          }
        }
      }
    });

    res.status(201).json(feedback);
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Get all feedback for a venue (public view)
router.get('/venues/:venueId/feedback', async (req, res) => {
  try {
    const { venueId } = req.params;

    // Check if venue exists
    const venue = await prisma.venue.findUnique({
      where: { id: venueId }
    });

    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    // Get feedback for this venue
    const feedback = await prisma.feedback.findMany({
      where: { venueId },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to recent 50 feedbacks
    });

    // Calculate average rating
    const avgRating = feedback.length > 0 
      ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length 
      : 0;

    res.json({
      feedback,
      averageRating: Math.round(avgRating * 10) / 10,
      totalFeedback: feedback.length
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// Get feedback for host's venues (temporary - without auth for testing)
router.get('/host/feedback', async (req, res) => {
  try {
    // For now, get all feedback (remove this in production)
    const feedback = await prisma.feedback.findMany({
      include: {
        venue: {
          select: {
            name: true,
            location: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(feedback);
  } catch (error) {
    console.error('Error fetching host feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

module.exports = router;
