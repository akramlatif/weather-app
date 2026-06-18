const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cityName: {
    type: String,
    required: [true, 'Please add a city name'],
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  latitude: {
    type: Number,
    required: [true, 'Please add latitude']
  },
  longitude: {
    type: Number,
    required: [true, 'Please add longitude']
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for unique cities per user
FavoriteSchema.index({ userId: 1, cityName: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', FavoriteSchema);
