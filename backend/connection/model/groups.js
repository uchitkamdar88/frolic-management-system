const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    group_id: {
      type: String,
      required: true,
      unique: true
    },
    groupName: {
      type: String,
      required: true
    },
    event_id: {
      type: String,
      required: true
    },
    leader_id: {
      type: String,
      required: true
    },
    totalMembers: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Group', groupSchema);
