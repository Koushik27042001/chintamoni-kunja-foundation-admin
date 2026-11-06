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

// @desc    Update contact inquiry status or reply notes
// @route   PATCH /api/contact/:id
const updateContactStatus = async (req, res) => {
  try {
    const { status, replyNotes } = req.body;
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { $set: { ...(status && { status }), ...(replyNotes !== undefined && { replyNotes }) } },
      { new: true }
    );
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }
    res.status(200).json({ success: true, data: contact, message: 'Inquiry updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createContact,
  getContacts,
  updateContactStatus,
};

