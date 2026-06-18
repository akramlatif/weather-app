const path = require('path');
const multer = require('multer');
const User = require('../models/User');

// Configure Multer Storage for Profile Pictures
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure File Filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images only (jpeg, jpg, png, gif)'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

/**
 * @desc    Update user profile details
 * @route   PUT /api/users/profile
 * @access  Private
 */
async function updateProfile(req, res) {
  try {
    const { name, email, preferences } = req.body;
    const fieldsToUpdate = {};

    if (name) fieldsToUpdate.name = name;
    if (email) fieldsToUpdate.email = email;
    if (preferences) {
      fieldsToUpdate.preferences = {
        ...req.user.preferences.toObject(),
        ...preferences
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: fieldsToUpdate },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        preferences: updatedUser.preferences,
        profilePicture: updatedUser.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * @desc    Upload profile picture
 * @route   PUT /api/users/profile/picture
 * @access  Private
 */
async function updateProfilePicture(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    // Save profile picture file path (or relative url) in user record
    const relativePath = `/uploads/${req.file.filename}`;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { profilePicture: relativePath } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * @desc    Change password
 * @route   PUT /api/users/password
 * @access  Private
 */
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new passwords'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    // Check if current password is correct
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect current password'
      });
    }

    // Set new password (will be hashed by UserSchema pre-save hook)
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = {
  updateProfile,
  updateProfilePicture,
  changePassword,
  upload
};
