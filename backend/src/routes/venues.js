const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticate, async (req, res) => {
  console.log('GET /api/venues - User:', req.user.userId);
  try {
    const venues = await prisma.venue.findMany({
      where: { hostId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    console.log('Found venues:', venues.length);
    res.json(venues);
  } catch (err) {
    console.error('Error fetching venues:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/public', async (req, res) => {
  console.log('GET /api/venues/public');
  try {
    const venues = await prisma.venue.findMany({
      select: {
        id: true, name: true, location: true, maxGuests: true,
        pricePerDay: true, description: true, images: true, amenities: true,
        unavailableDates: true, hostId: false
      }
    });
    console.log('Public venues found:', venues.length);
    res.json(venues);
  } catch (err) {
    console.error('Error fetching public venues:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const venue = await prisma.venue.findUnique({
      where: { id: req.params.id }
    });
    if (!venue) return res.status(404).json({ error: 'Venue not found' });
    res.json(venue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  console.log('POST /api/venues - User:', req.user.userId);
  console.log('Request body:', req.body);
  try {
    const { name, location, maxGuests, pricePerDay, description, images, amenities } = req.body;
    
    const venue = await prisma.venue.create({
      data: {
        name, 
        location, 
        maxGuests: parseInt(maxGuests), 
        pricePerDay: parseInt(pricePerDay), 
        description,
        images: images || [],
        amenities: amenities || [],
        hostId: req.user.userId
      }
    });
    
    console.log('Created venue:', venue.id);
    res.json(venue);
  } catch (err) {
    console.error('Error creating venue:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, location, maxGuests, pricePerDay, description, images, amenities, unavailableDates } = req.body;
    
    const venue = await prisma.venue.update({
      where: { id: req.params.id },
      data: {
        name, location, maxGuests, pricePerDay, description, images, amenities, unavailableDates
      }
    });
    res.json(venue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    await prisma.venue.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;