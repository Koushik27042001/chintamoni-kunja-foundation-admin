/**
 * Automated Database Backup Script for Sri Sri Chintamoni Kunja Foundation
 * Dumps all MongoDB Atlas collections to a timestamped JSON archive.
 * Rotates and retains the 30 most recent backups.
 * 
 * Usage:
 *   node src/scripts/backupDB.js
 *   npm run backup
 */

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment from server/.env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const Member = require('../models/Member');
const Donation = require('../models/Donation');
const CollectionAgent = require('../models/CollectionAgent');
const Event = require('../models/Event');
const Blog = require('../models/Blog');
const Gallery = require('../models/Gallery');
const Contact = require('../models/Contact');
const Item = require('../models/Item');
const User = require('../models/User');

const BACKUP_DIR = path.join(__dirname, '../../backups');
const MAX_BACKUPS = 30;

async function runBackup() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

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

    const filePath = path.join(BACKUP_DIR, `ckf-db-backup-${timestamp}.json`);
    fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), 'utf-8');

    // Auto-prune old backups exceeding MAX_BACKUPS
    const files = fs
      .readdirSync(BACKUP_DIR)
      .filter((f) => f.startsWith('ckf-db-backup-') && f.endsWith('.json'))
      .map((f) => ({
        name: f,
        time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length > MAX_BACKUPS) {
      const toDelete = files.slice(MAX_BACKUPS);
      for (const item of toDelete) {
        fs.unlinkSync(path.join(BACKUP_DIR, item.name));
      }
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

runBackup();
