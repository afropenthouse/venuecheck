const express = require('express');
const cloudinary = require('cloudinary').v2;
const { authenticate } = require('../middleware/auth');

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

router.post('/', authenticate, (req, res) => {
  const file = req.body.file;
  const folder = req.body.folder || 'venue-connect';

  cloudinary.uploader.upload(file, { folder }, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ url: result.secure_url, publicId: result.public_id });
  });
});

router.delete('/:publicId', authenticate, (req, res) => {
  cloudinary.uploader.destroy(req.params.publicId, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

module.exports = router;