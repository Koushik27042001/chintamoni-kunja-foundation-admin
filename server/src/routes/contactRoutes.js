const express = require('express');
const router = express.Router();
const {
  createContact,
  getContacts,
} = require('../controllers/contactController');

router.route('/')
  .post(createContact)
  .get(getContacts);

module.exports = router;

