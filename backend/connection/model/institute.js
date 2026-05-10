const mongoose = require('mongoose');

const instituteSchema = new mongoose.Schema(
  {
    institute_id: {
      type: String,
      required: true,
      unique: true
    },
    instituteName: {
      type: String,
      required: true
    },
    instituteAddress: {
      type: String,
      required: true
    },
    instituteEmail: {
      type: String,
      required: true
    },
    institutePhone: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Institute', instituteSchema);
