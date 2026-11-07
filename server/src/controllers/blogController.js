const Blog = require('../models/Blog');
const cloudinary = require('cloudinary').v2;

// @desc    Get all blogs
// @route   GET /api/blogs
const getBlogs = async (req, res) => {
  try {
    const { category, status } = req.query;
    let query = {};
    if (category && category !== 'All') query.category = category;
    if (status) query.status = status;

    const blogs = await Blog.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: blogs.length, data: blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get blog by ID
// @route   GET /api/blogs/:id
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Article not found' });
    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create blog (with Cloudinary cloud storage & MongoDB persistence)
// @route   POST /api/blogs
const createBlog = async (req, res) => {
  try {
    const {
      title,
      bengali,
      category,
      excerpt,
      content,
      author,
      readTime,
      image,
      status,
      slug,
      metaTitle,
      metaDescription,
      metaKeywords,
      canonicalUrl,
      ogImage,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    let finalImageUrl = image || '/assets/Opulent Gaura-Nitai and Madan Mohan Altar.png';
    let publicId = '';
    let storageProvider = finalImageUrl.startsWith('data:image/') ? 'database' : 'local_asset';

    // If image is a base64 Data URL and Cloudinary is configured, upload to Cloudinary CDN
    if (finalImageUrl.startsWith('data:image/') && process.env.CLOUDINARY_URL) {
      try {
        const uploadResult = await cloudinary.uploader.upload(finalImageUrl, {
          folder: 'chintamoni_kunja/blogs',
          resource_type: 'image',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        });

        if (uploadResult && uploadResult.secure_url) {
          finalImageUrl = uploadResult.secure_url;
          publicId = uploadResult.public_id;
          storageProvider = 'cloudinary';
        }
      } catch (cloudErr) {
        console.warn('Cloudinary upload warning for blog (falling back to database storage):', cloudErr.message);
      }
    }

    // Auto-generate clean URL slug if not provided
    const cleanSlug = (slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Parse keywords into array if provided as comma-separated string or array
    let parsedKeywords = [];
    if (Array.isArray(metaKeywords)) {
      parsedKeywords = metaKeywords.map((k) => String(k).trim()).filter(Boolean);
    } else if (typeof metaKeywords === 'string' && metaKeywords.trim()) {
      parsedKeywords = metaKeywords.split(',').map((k) => k.trim()).filter(Boolean);
    } else {
      parsedKeywords = [category || 'Gaudiya Vaishnav', 'Nabadwip Dham', 'Chintamoni Kunja', 'Katha'];
    }

    const finalExcerpt = excerpt || content.substring(0, 160) + '...';
    const finalMetaTitle = metaTitle ? metaTitle.trim() : `${title} | Sri Sri Chintamoni Kunja`;
    const finalMetaDesc = metaDescription ? metaDescription.trim() : finalExcerpt;

    const blog = await Blog.create({
      title,
      bengali: bengali || '',
      category: category || 'Katha & Philosophy',
      excerpt: finalExcerpt,
      content,
      author: author || 'Sri Sri Chintamoni Kunja Foundation',
      readTime: readTime || '5 min read',
      image: finalImageUrl,
      public_id: publicId,
      storageProvider,
      status: status || 'published',
      slug: cleanSlug,
      metaTitle: finalMetaTitle,
      metaDescription: finalMetaDesc,
      metaKeywords: parsedKeywords,
      canonicalUrl: canonicalUrl || '',
      ogImage: ogImage || finalImageUrl,
    });

    res.status(201).json({ success: true, data: blog, message: 'Article published with SEO meta tags successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!blog) return res.status(404).json({ success: false, message: 'Article not found' });
    res.status(200).json({ success: true, data: blog, message: 'Article updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete blog (cleans up from Cloudinary and MongoDB)
// @route   DELETE /api/blogs/:id
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');
    let blog = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      blog = await Blog.findById(id);
    }
    if (!blog) {
      blog = await Blog.findOne({ title: id });
    }

    if (blog) {
      if (blog.public_id && blog.storageProvider === 'cloudinary') {
        try {
          await cloudinary.uploader.destroy(blog.public_id);
        } catch (cloudErr) {
          console.warn('Cloudinary blog delete warning:', cloudErr.message);
        }
      }
      await Blog.deleteOne({ _id: blog._id });
    }

    res.status(200).json({ success: true, message: 'Article deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
};

