const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  validateRegistration,
  validateLogin,
  handleValidationErrors
} = require('../middleware/validate');

router.post('/register', validateRegistration, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);
router.get('/me', protect, getMe);

module.exports = router;
