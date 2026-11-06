const Event = require('../models/Event');
const cloudinary = require('cloudinary').v2;

// @desc    Get all events
// @route   GET /api/events
const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new event (with Cloudinary cloud storage & MongoDB persistence)
// @route   POST /api/events
const createEvent = async (req, res) => {
  try {
    const { title, bengali, season, time, category, desc, seva, image, date, featured } = req.body;
    if (!title || !desc) {
      return res.status(400).json({ success: false, message: 'Title and description required' });
    }

    let finalImageUrl = image || '/assets/Krishna’s Golden Riverside Devotion.png';
    let publicId = '';
    let storageProvider = finalImageUrl.startsWith('data:image/') ? 'database' : 'local_asset';

    // If image is a base64 Data URL and Cloudinary is configured, upload to Cloudinary CDN
    if (finalImageUrl.startsWith('data:image/') && process.env.CLOUDINARY_URL) {
      try {
        const uploadResult = await cloudinary.uploader.upload(finalImageUrl, {
          folder: 'chintamoni_kunja/events',
          resource_type: 'image',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        });

        if (uploadResult && uploadResult.secure_url) {
          finalImageUrl = uploadResult.secure_url;
          publicId = uploadResult.public_id;
          storageProvider = 'cloudinary';
        }
      } catch (cloudErr) {
        console.warn('Cloudinary upload warning for event (falling back to database storage):', cloudErr.message);
      }
    }

    const event = await Event.create({
      title,
      bengali: bengali || '',
      season: season || '',
      time: time || '',
      category: category || 'Major Utsav',
      desc,
      seva: seva || 'Anna Daan Seva',
      image: finalImageUrl,
      date: date || '',
      featured: Boolean(featured),
    });

    res.status(201).json({ success: true, data: event, message: 'Event added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.status(200).json({ success: true, data: event, message: 'Event updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.status(200).json({ success: true, message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
};

