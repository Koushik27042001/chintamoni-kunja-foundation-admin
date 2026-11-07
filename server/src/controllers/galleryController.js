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

// @desc    Add gallery item (with Cloudinary cloud storage, deduplication & MongoDB persistence)
// @route   POST /api/gallery
const createGalleryItem = async (req, res) => {
  try {
    const { title, category, image, caption, type } = req.body;
    if (!title || !image) {
      return res.status(400).json({ success: false, message: 'Title and image are required' });
    }

    let finalImageUrl = image;
    let publicId = '';
    const isVideo = type === 'video' || image.startsWith('data:video/') || image.endsWith('.mp4');
    let storageProvider = (image.startsWith('data:image/') || image.startsWith('data:video/')) ? 'database' : 'local_asset';

    // If media is a base64 Data URL and Cloudinary is configured, upload to Cloudinary CDN
    if ((image.startsWith('data:image/') || image.startsWith('data:video/')) && process.env.CLOUDINARY_URL) {
      try {
        const uploadResult = await cloudinary.uploader.upload(image, {
          folder: 'chintamoni_kunja/gallery',
          resource_type: isVideo ? 'video' : 'image',
          transformation: !isVideo ? [{ quality: 'auto', fetch_format: 'auto' }] : undefined,
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

    // Check if an item with the same title or image already exists to prevent duplicate rows
    const trimmedTitle = title.trim();
    const existing = await Gallery.findOne({
      $or: [
        { title: trimmedTitle },
        { image: finalImageUrl }
      ]
    });

    if (existing) {
      existing.title = trimmedTitle;
      existing.category = category || existing.category;
      existing.type = isVideo ? 'video' : (type || existing.type);
      existing.image = finalImageUrl;
      if (publicId) existing.public_id = publicId;
      existing.storageProvider = storageProvider;
      existing.caption = caption !== undefined ? caption : existing.caption;
      await existing.save();

      return res.status(200).json({
        success: true,
        data: existing,
        storage: storageProvider,
        message: 'Existing gallery visual updated with latest details',
      });
    }

    const item = await Gallery.create({
      title: trimmedTitle,
      category: category || (isVideo ? 'Videos' : 'Temple & Altar'),
      type: isVideo ? 'video' : (type || 'image'),
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

// @desc    Delete gallery item (cleans up from Cloudinary and MongoDB, handles ObjectId and title IDs)
// @route   DELETE /api/gallery/:id
const deleteGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');
    let item = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      item = await Gallery.findById(id);
    }
    if (!item) {
      item = await Gallery.findOne({ title: id });
    }

    if (item) {
      // Clean up from Cloudinary if stored in cloud
      if (item.public_id && item.storageProvider === 'cloudinary') {
        try {
          await cloudinary.uploader.destroy(item.public_id);
        } catch (cloudErr) {
          console.warn('Could not remove asset from Cloudinary:', cloudErr.message);
        }
      }

      await Gallery.deleteOne({ _id: item._id });
    }

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

