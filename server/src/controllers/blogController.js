const Blog = require('../models/Blog');

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

// @desc    Create blog
// @route   POST /api/blogs
const createBlog = async (req, res) => {
  try {
    const { title, bengali, category, excerpt, content, author, readTime, image, status } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const blog = await Blog.create({
      title,
      bengali: bengali || '',
      category: category || 'Katha & Philosophy',
      excerpt: excerpt || content.substring(0, 160) + '...',
      content,
      author: author || 'Sri Sri Chintamoni Kunja Foundation',
      readTime: readTime || '5 min read',
      image: image || '/assets/Opulent Gaura-Nitai and Madan Mohan Altar.png',
      status: status || 'published',
    });

    res.status(201).json({ success: true, data: blog, message: 'Article published successfully' });
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

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Article not found' });
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

