const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const nodemailer = require('nodemailer');
const { format } = require('date-fns');

const router = express.Router();
const prisma = new PrismaClient();

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false // Ignore self-signed certificate issues
    }
  });
};

// Send approval email
const sendApprovalEmail = async (email, guestName, venueName, bookingDate, inspectionDate) => {
  try {
    const transporter = createTransporter();
    
    const currentYear = new Date().getFullYear();
    const mailOptions = {
      from: `"Venue Check" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '🎉 Your Venue Inspection Has Been Approved!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 15px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">Venue Check</h1>
            <div style="background: rgba(255,255,255,0.2); border-radius: 50%; width: 80px; height: 80px; margin: 20px auto; display: flex; align-items: center; justify-content: center;">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <h2 style="color: white; margin: 0; font-size: 24px;">Request Approved!</h2>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your venue inspection has been confirmed</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h3 style="color: #333; margin: 0 0 20px 0; font-size: 20px;">Hello ${guestName},</h3>
            <p style="color: #666; margin: 0 0 25px 0; line-height: 1.6; font-size: 16px;">
              Great news! Your venue inspection for <strong>${venueName}</strong> has been approved by the venue host. You're all set for your visit.
            </p>
            
            <div style="background: white; border: 2px solid #667eea; padding: 25px; border-radius: 10px; margin: 25px 0;">
              <h4 style="color: #667eea; margin: 0 0 15px 0; font-size: 18px; text-align: center;">📅 Inspection Details</h4>
              <div style="space-y: 15px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                  <div style="background: #667eea; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px;">📍</div>
                  <div>
                    <strong style="color: #333;">Venue:</strong> ${venueName}
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                  <div style="background: #667eea; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px;">📅</div>
                  <div>
                    <strong style="color: #333;">Requested Date:</strong> ${bookingDate}
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="background: #667eea; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px;">⏰</div>
                  <div>
                    <strong style="color: #333;">Inspection Date:</strong> ${inspectionDate}
                  </div>
                </div>
              </div>
            </div>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; text-align: center; margin: 25px 0;">
              <p style="color: white; margin: 0; font-size: 16px; font-weight: 500;">
                🎉 We're excited to have you visit! Make sure to arrive on time for your inspection.
              </p>
            </div>
            
            <p style="color: #666; margin: 25px 0 0 0; line-height: 1.6; font-size: 14px;">
              If you have any questions or need to reschedule, please don't hesitate to contact us or the venue host directly.
            </p>
          </div>
          
          <div style="text-align: center; color: #999; font-size: 12px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="margin: 0 0 10px 0;">This is an automated notification from Venue Check</p>
            <p style="margin: 0;">© ${currentYear} Venue Check. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Approval email sent to ${email}:`, result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending approval email:', error);
    throw new Error('Failed to send approval email');
  }
};

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
      if (host?.email) {
        const transporter = createTransporter();
        await transporter.sendMail({
          from: `"Venue Check" <${process.env.SMTP_USER}>`,
          to: host.email,
          subject: '🔔 New Inspection Request',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Venue Check</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">New Inspection Request</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 10px;">
                <h3 style="color: #333; margin: 0 0 20px 0; font-size: 20px;">Hello Host,</h3>
                <p style="color: #666; margin: 0 0 25px 0; line-height: 1.6;">
                  You have a new inspection request for <strong>${venue.name}</strong> from <strong>${guestName}</strong>.
                </p>
                
                <div style="background: white; border: 2px solid #667eea; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h4 style="color: #667eea; margin: 0 0 15px 0;">📋 Inspection Details</h4>
                  <div style="space-y: 10px;">
                    <p style="margin: 0;"><strong>Guest:</strong> ${guestName}</p>
                    <p style="margin: 0;"><strong>Email:</strong> ${guestEmail}</p>
                    <p style="margin: 0;"><strong>Phone:</strong> ${guestPhone}</p>
                    <p style="margin: 0;"><strong>Guests:</strong> ${guests}</p>
                    <p style="margin: 0;"><strong>Requested Date:</strong> ${format(new Date(bookingDate), "MMM d, yyyy h:mm a")}</p>
                    ${inspectionDate ? `<p style="margin: 0;"><strong>Inspection Date:</strong> ${format(new Date(inspectionDate), "MMM d, yyyy h:mm a")}</p>` : ''}
                  </div>
                </div>
                
                <p style="color: #666; margin: 25px 0 0 0; font-size: 14px;">
                  Please review this inspection request and approve or decline it in your dashboard.
                </p>
              </div>
              
              <div style="text-align: center; color: #999; font-size: 12px; padding-top: 20px; border-top: 1px solid #eee;">
                <p>This is an automated notification from Venue Check</p>
              </div>
            </div>
          `
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
    console.log('Approving booking:', req.params.id);
    
    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: 'APPROVED' }
    });

    const bookingDetails = await prisma.booking.findUnique({ 
      where: { id: req.params.id },
      include: { venue: true }
    });

    if (!bookingDetails) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    console.log('Sending approval email to:', bookingDetails.guestEmail);

    // Send approval email
    try {
      await sendApprovalEmail(
        bookingDetails.guestEmail,
        bookingDetails.guestName,
        bookingDetails.venue.name,
        format(new Date(bookingDetails.bookingDate), "MMM d, yyyy h:mm a"),
        bookingDetails.inspectionDate ? format(new Date(bookingDetails.inspectionDate), "MMM d, yyyy h:mm a") : 'TBD'
      );
      console.log('Approval email sent successfully');
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
      // Don't fail the approval if email fails
    }

    res.json(booking);
  } catch (err) {
    console.error('Approval error:', err);
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