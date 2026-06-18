const Favorite = require('../models/Favorite');

/**
 * @desc    Get all user favorite cities
 * @route   GET /api/favorites
 * @access  Private
 */
async function getFavorites(req, res) {
  try {
    const favorites = await Favorite.find({ userId: req.user.id }).sort({ addedAt: -1 });
    
    res.status(200).json({
      success: true,
      data: favorites
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * @desc    Add a city to favorites
 * @route   POST /api/favorites
 * @access  Private
 */
async function addFavorite(req, res) {
  try {
    const { cityName, country, latitude, longitude } = req.body;

    // Check how many favorites the user has
    const favoriteCount = await Favorite.countDocuments({ userId: req.user.id });
    if (favoriteCount >= 10) {
      return res.status(400).json({
        success: false,
        message: 'You have reached the maximum limit of 10 favorite cities'
      });
    }

    // Check if duplicate favorite exists
    const duplicate = await Favorite.findOne({
      userId: req.user.id,
      cityName: cityName
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'City is already in your favorites list'
      });
    }

    // Create favorite
    const favorite = await Favorite.create({
      userId: req.user.id,
      cityName,
      country,
      latitude,
      longitude
    });

    res.status(201).json({
      success: true,
      data: favorite
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * @desc    Remove a favorite city
 * @route   DELETE /api/favorites/:id
 * @access  Private
 */
async function removeFavorite(req, res) {
  try {
    const favorite = await Favorite.findOne({
      _id: req.params.id,
      userId: req.user.id // Security check
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite city not found'
      });
    }

    await favorite.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Favorite city removed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite
};
