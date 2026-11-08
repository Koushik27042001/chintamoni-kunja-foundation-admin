const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const {
  getDevotees,
  getDevoteeById,
  createDevotee,
  updateDevotee,
  bulkImportDevotees,
  exportDevoteesExcel,
} = require('../controllers/devoteeController');

router.get('/', getDevotees);
router.get('/export', exportDevoteesExcel);
router.get('/:memberId', getDevoteeById);
router.post('/', createDevotee);
router.put('/:memberId', updateDevotee);
router.post('/bulk-import', upload.single('file'), bulkImportDevotees);

module.exports = router;
