const mongoose = require('mongoose');

const eventWinnersSchema = new mongoose.Schema(
  {
    event_id: {
      type: String,
      required: true
    },
    group_id: {
      type: String,
      required: true
    },
    position: {
      type: Number,
      required: true   // 1, 2, 3
    },
    prizeAmount: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('EventWinner', eventWinnersSchema);
