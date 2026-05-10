const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    registration_id: {
      type: String,
      required: true,
      unique: true,
    },

    user_id: {
      type: String,
      required: true,
    },

    event_id: {
      type: String,
      required: true,
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Registration", registrationSchema);
