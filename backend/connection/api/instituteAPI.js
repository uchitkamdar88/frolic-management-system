const express = require('express');
const router = express.Router();
const Institute = require('../Model/institute');

// =======================
// ADD INSTITUTE
// =======================
router.post('/add', async (req, res) => {
  try {
    const data = new Institute(req.body);
    await data.save();
    res.status(201).json({ message: 'Institute added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message }); 
  }
});

// =======================
// GET ALL INSTITUTES
// =======================
router.get('/', async (req, res) => {
  try {
    const data = await Institute.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// GET INSTITUTE BY institute_id
// =======================
router.get('/:id', async (req, res) => {
  try {
    const data = await Institute.findOne({ institute_id: req.params.id });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// UPDATE INSTITUTE
// =======================
router.put('/:id', async (req, res) => {
  try {
    const data = await Institute.findOneAndUpdate(
      { institute_id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// DELETE INSTITUTE
// =======================
router.delete('/:id', async (req, res) => {
  try {
    await Institute.findOneAndDelete({ institute_id: req.params.id });
    res.json({ message: 'Institute deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
