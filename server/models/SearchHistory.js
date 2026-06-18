const mongoose = require('mongoose');

const SearchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cityName: {
    type: String,
    required: [true, 'Please add city name'],
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  },
  searchedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient retrieval of recent searches
SearchHistorySchema.index({ userId: 1, searchedAt: -1 });

module.exports = mongoose.model('SearchHistory', SearchHistorySchema);
