const Member = require('../models/Member');
const Donation = require('../models/Donation');
const CollectionAgent = require('../models/CollectionAgent');
const Event = require('../models/Event');
const Blog = require('../models/Blog');
const Gallery = require('../models/Gallery');
const Contact = require('../models/Contact');
const Item = require('../models/Item');
const User = require('../models/User');

// @desc    Generate and download complete database snapshot backup
// @route   GET /api/backup/download
// @access  Private (Admin Only)
const downloadBackup = async (req, res) => {
  try {
    const [members, donations, agents, events, blogs, gallery, contacts, items, users] = await Promise.all([
      Member.find().lean(),
      Donation.find().lean(),
      CollectionAgent.find().lean(),
      Event.find().lean(),
      Blog.find().lean(),
      Gallery.find().lean(),
      Contact.find().lean(),
      Item.find().lean(),
      User.find().select('-password').lean(),
    ]);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupData = {
      meta: {
        organization: 'Sri Sri Chintamoni Kunja Foundation',
        createdAt: new Date().toISOString(),
        version: '1.0.0',
        generatedBy: req.user ? req.user.email : 'System Admin',
        counts: {
          members: members.length,
          donations: donations.length,
          agents: agents.length,
          events: events.length,
          blogs: blogs.length,
          gallery: gallery.length,
          contacts: contacts.length,
          items: items.length,
          users: users.length,
        },
      },
      data: {
        members,
        donations,
        agents,
        events,
        blogs,
        gallery,
        contacts,
        items,
        users,
      },
    };

    const filename = `ckf-db-backup-${timestamp}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(JSON.stringify(backupData, null, 2));
  } catch (error) {
    return res.status(500).json({ success: false, message: `Backup generation failed: ${error.message}` });
  }
};

// @desc    Get backup status & collection statistics summary
// @route   GET /api/backup/status
// @access  Private (Admin Only)
const getBackupStatus = async (req, res) => {
  try {
    const [membersCount, donationsCount, agentsCount, eventsCount, blogsCount, galleryCount] = await Promise.all([
      Member.countDocuments(),
      Donation.countDocuments(),
      CollectionAgent.countDocuments(),
      Event.countDocuments(),
      Blog.countDocuments(),
      Gallery.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        serverTime: new Date().toISOString(),
        collections: {
          members: membersCount,
          donations: donationsCount,
          agents: agentsCount,
          events: eventsCount,
          blogs: blogsCount,
          gallery: galleryCount,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  downloadBackup,
  getBackupStatus,
};
