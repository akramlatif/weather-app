const express = require('express');
const router = express.Router();
const {
  getHistory,
  addHistory,
  clearHistory
} = require('../controllers/historyController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getHistory)
  .post(protect, addHistory)
  .delete(protect, clearHistory);

module.exports = router;
