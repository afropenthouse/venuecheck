const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const nodemailer = require('nodemailer');

const router = express.Router();
const prisma = new PrismaClient();

let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

router.get('/', authenticate, async (req, res) => {
  try {
    const venues = await prisma.venue.findMany({
      where: { hostId: req.user.userId },
      select: { id: true }
    });
    const venueIds = venues.map(v => v.id);
    
    const bookings = await prisma.booking.findMany({
      where: { venueId: { in: venueIds } },
      include: { venue: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { venueId, guestEmail, guestPhone, guestName, guests, bookingDate, inspectionDate } = req.body;
    
    console.log("Booking request:", req.body);
    
    if (!venueId) return res.status(400).json({ error: 'Venue ID is required' });
    
    const venue = await prisma.venue.findUnique({ where: { id: venueId } });
    if (!venue) return res.status(404).json({ error: 'Venue not found' });

    console.log("Creating booking for venue:", venue.name);

    const booking = await prisma.booking.create({
      data: {
        venueId, guestEmail, guestPhone, guestName, guests,
        bookingDate: new Date(bookingDate),
        inspectionDate: inspectionDate ? new Date(inspectionDate) : null
      }
    });

    console.log("Booking created:", booking.id);

    // Try to send email to host (don't fail if email fails)
    try {
      const host = await prisma.user.findUnique({ where: { id: venue.hostId } });
      if (host?.email && transporter) {
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: host.email,
          subject: 'New Booking Request',
          text: `New booking for ${venue.name} from ${guestName} (${guestEmail})`
        });
        console.log("Email sent to host");
      }
    } catch (emailErr) {
      console.error("Email error:", emailErr.message);
    }

    res.json(booking);
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/approve', authenticate, async (req, res) => {
  try {
    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: 'APPROVED' }
    });

    const b = await prisma.booking.findUnique({ 
      where: { id: req.params.id },
      include: { venue: true }
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: b.guestEmail,
      subject: 'Booking Approved',
      text: `Your inspection for ${b.venue.name} has been approved!`
    });

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/decline', authenticate, async (req, res) => {
  try {
    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: 'DECLINED' }
    });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;