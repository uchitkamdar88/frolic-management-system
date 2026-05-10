const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    event_id: {
      type: String,
      required: true,
      unique: true
    },
    eventName: {
      type: String,
      required: true,
      trim: true
    },
    eventTagline: {
      type: String,
      required: true
    },
    eventImage: {
      type: String,
      required: true
    },
    eventDescription: {
      type: String,
      required: true
    },
    groupMinParticipants: {
      type: Number,
      required: true
    },
    groupMaxParticipants: {
      type: Number,
      required: true
    },
    eventFees: {
      type: Number,
      required: true
    },
    eventFirstPrize: {
      type: String
    },
    eventSecondPrize: {
      type: String
    },
    eventThirdPrize: {
      type: String
    },
    isTechnical: {
      type: Boolean,
      required: true
    },
    eventCoordinator_id: {
      type: String,
      required: true
    },
    eventMainStudentCoordinatorName: {
      type: String
    },
    eventMainStudentCoordinatorPhone: {
      type: String
    },
    eventMainStudentCoordinatorEmail: {
      type: String
    },
    eventLocation: {
      type: String,
      required: true
    },
    maxGroupsAllowed: {
      type: Number
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Event', eventSchema);
