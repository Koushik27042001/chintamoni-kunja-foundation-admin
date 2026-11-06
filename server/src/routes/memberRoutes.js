const express = require('express');
const router = express.Router();
const {
  getMembers,
  getMemberById,
  createMember,
  bulkCreateMembers,
  updateMember,
  deleteMember,
  bulkDeleteMembers,
} = require('../controllers/memberController');

router.route('/')
  .get(getMembers)
  .post(createMember);

router.post('/bulk', bulkCreateMembers);
router.post('/bulk-delete', bulkDeleteMembers);

router.route('/:id')
  .get(getMemberById)
  .put(updateMember)
  .delete(deleteMember);

module.exports = router;

