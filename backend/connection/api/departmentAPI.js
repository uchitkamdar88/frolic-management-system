const express = require('express');
const router = express.Router();
const Department = require('../Model/department');

// =======================
// ADD DEPARTMENT
// =======================
router.post('/add', async (req, res) => {
  try {
    const data = new Department(req.body);
    await data.save();
    res.status(201).json({ message: 'Department added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// GET ALL DEPARTMENTS
// =======================
router.get('/', async (req, res) => {
  try {
    const data = await Department.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// GET DEPARTMENT BY dept_id
// =======================
router.get('/:id', async (req, res) => {
  try {
    const data = await Department.findOne({ dept_id: req.params.id });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// UPDATE DEPARTMENT
// =======================
router.put('/:id', async (req, res) => {
  try {
    const data = await Department.findOneAndUpdate(
      { dept_id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// DELETE DEPARTMENT
// =======================
router.delete('/:id', async (req, res) => {
  try {
    await Department.findOneAndDelete({ dept_id: req.params.id });
    res.json({ message: 'Department deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
