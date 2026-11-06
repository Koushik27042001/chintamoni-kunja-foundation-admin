const express = require('express');
const router = express.Router();
const {
  getGallery,
  createGalleryItem,
  deleteGalleryItem,
} = require('../controllers/galleryController');

router.route('/')
  .get(getGallery)
  .post(createGalleryItem);

router.route('/:id')
  .delete(deleteGalleryItem);

module.exports = router;

