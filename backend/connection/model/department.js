const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    dept_id: {
      type: String,
      required: true,
      unique: true
    },
    departmentName: {
      type: String,
      required: true,
      trim: true
    },
    departmentDescription: {
      type: String,
      required: true
    },
    institute_id: {
      type: String,
      required: true
    },
    coordinator_id: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Department', departmentSchema);
