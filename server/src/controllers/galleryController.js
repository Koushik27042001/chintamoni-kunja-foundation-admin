const Gallery = require('../models/Gallery');
const cloudinary = require('cloudinary').v2;

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

// @desc    Add gallery item (with Cloudinary cloud storage & MongoDB persistence)
// @route   POST /api/gallery
const createGalleryItem = async (req, res) => {
  try {
    const { title, category, image, caption } = req.body;
    if (!title || !image) {
      return res.status(400).json({ success: false, message: 'Title and image are required' });
    }

    let finalImageUrl = image;
    let publicId = '';
    let storageProvider = image.startsWith('data:image/') ? 'database' : 'local_asset';

    // If image is a base64 Data URL and Cloudinary is configured, upload to Cloudinary CDN
    if (image.startsWith('data:image/') && process.env.CLOUDINARY_URL) {
      try {
        const uploadResult = await cloudinary.uploader.upload(image, {
          folder: 'chintamoni_kunja/gallery',
          resource_type: 'image',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        });

        if (uploadResult && uploadResult.secure_url) {
          finalImageUrl = uploadResult.secure_url;
          publicId = uploadResult.public_id;
          storageProvider = 'cloudinary';
        }
      } catch (cloudErr) {
        console.warn('Cloudinary upload warning (falling back to database storage):', cloudErr.message);
      }
    }

    const item = await Gallery.create({
      title,
      category: category || 'Temple & Altar',
      image: finalImageUrl,
      public_id: publicId,
      storageProvider,
      caption: caption || '',
    });

    res.status(201).json({
      success: true,
      data: item,
      storage: storageProvider,
      message: `Image added to gallery and stored in ${storageProvider === 'cloudinary' ? 'Cloudinary Cloud CDN' : 'MongoDB Atlas Database'}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete gallery item (cleans up from Cloudinary and MongoDB)
// @route   DELETE /api/gallery/:id
const deleteGalleryItem = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    // Clean up from Cloudinary if stored in cloud
    if (item.public_id && item.storageProvider === 'cloudinary') {
      try {
        await cloudinary.uploader.destroy(item.public_id);
      } catch (cloudErr) {
        console.warn('Could not remove asset from Cloudinary:', cloudErr.message);
      }
    }

    await Gallery.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Item removed from gallery and storage' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getGallery,
  createGalleryItem,
  deleteGalleryItem,
};

