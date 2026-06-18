const express = require('express');
const router = express.Router();
const {
  getFavorites,
  addFavorite,
  removeFavorite
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');
const { validateFavorite, handleValidationErrors } = require('../middleware/validate');

router.route('/')
  .get(protect, getFavorites)
  .post(protect, validateFavorite, handleValidationErrors, addFavorite);

router.route('/:id')
  .delete(protect, removeFavorite);

module.exports = router;
