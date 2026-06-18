const SearchHistory = require('../models/SearchHistory');

/**
 * @desc    Get user search history
 * @route   GET /api/history
 * @access  Private
 */
async function getHistory(req, res) {
  try {
    const history = await SearchHistory.find({ userId: req.user.id })
      .sort({ searchedAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * @desc    Log a city search
 * @route   POST /api/history
 * @access  Private
 */
async function addHistory(req, res) {
  try {
    const { cityName, country, latitude, longitude } = req.body;

    const newHistory = await SearchHistory.create({
      userId: req.user.id,
      cityName,
      country,
      latitude,
      longitude
    });

    // Auto-cleanup: limit total history entries to 50
    const count = await SearchHistory.countDocuments({ userId: req.user.id });
    if (count > 50) {
      const oldest = await SearchHistory.find({ userId: req.user.id })
        .sort({ searchedAt: 1 })
        .limit(count - 50);

      const idsToDelete = oldest.map(doc => doc._id);
      await SearchHistory.deleteMany({ _id: { $in: idsToDelete } });
    }

    res.status(201).json({
      success: true,
      data: newHistory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * @desc    Clear entire search history
 * @route   DELETE /api/history
 * @access  Private
 */
async function clearHistory(req, res) {
  try {
    await SearchHistory.deleteMany({ userId: req.user.id });

    res.status(200).json({
      success: true,
      message: 'Search history cleared successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = {
  getHistory,
  addHistory,
  clearHistory
};
