const express = require('express');
const router = express.Router();
const {
  getBooks,
  proposeBooksForIssue,
  getAlternativeBook,
  confirmIssueBooks,
} = require('../controllers/bookController');

router.get('/', getBooks);
router.get('/alternative', getAlternativeBook);
router.post('/propose-issue', proposeBooksForIssue);
router.post('/confirm-issue', confirmIssueBooks);

module.exports = router;
