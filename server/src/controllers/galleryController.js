const Gallery = require('../models/Gallery');

// @desc    Get all gallery items
// @route   GET /api/gallery
const getGallery = async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category && category !== 'All') query.category = category;

    const items = await Gallery.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add gallery item
// @route   POST /api/gallery
const createGalleryItem = async (req, res) => {
  try {
    const { title, category, image, caption } = req.body;
    if (!title || !image) {
      return res.status(400).json({ success: false, message: 'Title and image are required' });
    }

    const item = await Gallery.create({
      title,
      category: category || 'Temple & Altar',
      image,
      caption: caption || '',
    });

    res.status(201).json({ success: true, data: item, message: 'Image added to gallery' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete gallery item
// @route   DELETE /api/gallery/:id
const deleteGalleryItem = async (req, res) => {
  try {
    const item = await Gallery.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.status(200).json({ success: true, message: 'Item removed from gallery' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getGallery,
  createGalleryItem,
  deleteGalleryItem,
};
