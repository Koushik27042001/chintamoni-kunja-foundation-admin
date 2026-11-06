const express = require('express');
const router = express.Router();
const {
  createContact,
  getContacts,
  updateContactStatus,
} = require('../controllers/contactController');

router.route('/')
  .post(createContact)
  .get(getContacts);

router.route('/:id')
  .patch(updateContactStatus);

module.exports = router;

