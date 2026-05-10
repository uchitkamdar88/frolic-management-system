const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema(
  {
    participant_id: {
      type: String,
      required: true,
      unique: true
    },
    user_id: {
      type: String,
      required: true
    },
    event_id: {
      type: String,
      required: true
    },
    group_id: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Participant', participantSchema);
