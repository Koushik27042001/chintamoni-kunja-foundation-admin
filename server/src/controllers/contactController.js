const Contact = require('../models/Contact');

// @desc    Submit a new contact / pilgrimage inquiry
// @route   POST /api/contact
const createContact = async (req, res) => {
  try {
    const { name, email, phone, address, purpose, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and message.',
      });
    }

    const contact = await Contact.create({
      name,
      email,
      phone,
      address,
      purpose,
      message,
    });

    res.status(201).json({
      success: true,
      data: contact,
      message: 'Hare Krishna! Your inquiry has been received. Our seva desk will respond soon.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while submitting inquiry.',
    });
  }
};

// @desc    Get all contact inquiries (admin/seva desk review)
// @route   GET /api/contact
const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching inquiries.',
    });
  }
};

module.exports = {
  createContact,
  getContacts,
};

