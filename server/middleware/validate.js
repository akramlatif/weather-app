const { check, validationResult } = require('express-validator');

// Validation rules for Registration
const validateRegistration = [
  check('name', 'Name is required (2-50 characters)').notEmpty().isLength({ min: 2, max: 50 }),
  check('email', 'Please include a valid email address').isEmail().normalizeEmail(),
  check('password', 'Password is required (min 6 characters)').isLength({ min: 6 })
];

// Validation rules for Login
const validateLogin = [
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('password', 'Password is required').notEmpty()
];

// Validation rules for Favorite
const validateFavorite = [
  check('cityName', 'City name is required').notEmpty().trim(),
  check('latitude', 'Latitude must be a valid number').isFloat(),
  check('longitude', 'Longitude must be a valid number').isFloat()
];

// Middleware to handle validation results
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }
  next();
}

module.exports = {
  validateRegistration,
  validateLogin,
  validateFavorite,
  handleValidationErrors
};
