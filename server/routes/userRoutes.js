const express = require('express');
const router = express.Router();
const {
  updateProfile,
  updateProfilePicture,
  changePassword,
  upload
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.put('/profile', protect, updateProfile);
router.put('/profile/picture', protect, upload.single('profilePicture'), updateProfilePicture);
router.put('/password', protect, changePassword);

module.exports = router;
