const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');

const router = express.Router();
const prisma = new PrismaClient();

router.post('/register', async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    const { email, password, name } = req.body;
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log('Email already exists:', email);
      return res.status(400).json({ error: 'Email already exists' });
    }

    console.log('Creating user with email:', email);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, emailVerified: false }
    });
    console.log('User created successfully:', user.id);

    console.log('Creating settings for user:', user.id);
    await prisma.settings.create({
      data: { userId: user.id }
    });
    console.log('Settings created successfully');

    // Generate and send verification code
    console.log('Generating verification code');
    const code = generateVerificationCode();
    verificationCodes.set(email, code);
    console.log('Verification code generated:', code);
    
    console.log('Sending verification email to:', email);
    await sendVerificationEmail(email, code);
    console.log('Verification email sent successfully');

    res.json({ 
      success: true, 
      message: 'Account created. Please check your email for verification code.',
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (err) {
    console.error('Registration error details:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate random 6-digit code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store verification codes (in production, use Redis or database)
const verificationCodes = new Map();

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

// Send verification email
const sendVerificationEmail = async (email, code) => {
  try {
    const transporter = createTransporter();
    
    const currentYear = new Date().getFullYear();
    const mailOptions = {
      from: `"Venue Check" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify your Venue Check account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Venue Check</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Verify your email address</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #333; margin: 0 0 20px 0;">Your verification code is:</h2>
            <div style="background: white; border: 2px solid #e9ecef; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 3px;">${code}</span>
            </div>
            <p style="color: #666; margin: 20px 0 0 0; line-height: 1.5;">
              This code will expire in 10 minutes. Enter it in the verification screen to complete your registration.
            </p>
          </div>
          
          <div style="text-align: center; color: #999; font-size: 12px;">
            <p>If you didn't request this code, please ignore this email.</p>
            <p>© ${currentYear} Venue Check. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}:`, result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

// Send approval email
const sendApprovalEmail = async (email, guestName, venueName, bookingDate, inspectionDate) => {
  try {
    const transporter = createTransporter();
    
    const currentYear = new Date().getFullYear();
    const mailOptions = {
      from: `"Venue Check" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '🎉 Your Inspection Request Has Been Approved!',
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
              Great news! Your inspection request for <strong>${venueName}</strong> has been approved by the venue host. You're all set for your visit.
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
                    <strong style="color: #333;">Booking Date:</strong> ${bookingDate}
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

router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;
    
    const storedCode = verificationCodes.get(email);
    if (!storedCode || storedCode !== code) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }
    
    // Mark user as verified (in production, update user record in database)
    await prisma.user.update({
      where: { email },
      data: { emailVerified: true }
    });
    
    // Remove used code
    verificationCodes.delete(email);
    
    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }
    
    const code = generateVerificationCode();
    verificationCodes.set(email, code);
    
    await sendVerificationEmail(email, code);
    
    res.json({ message: 'Verification code sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;