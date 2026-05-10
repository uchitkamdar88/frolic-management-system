const express = require('express');
const router = express.Router();
const Groups = require('../Model/groups');

// =======================
// ADD GROUP
// =======================
router.post('/add', async (req, res) => {
  try {
    const data = new Groups(req.body);
    await data.save();
    res.status(201).json({ message: 'Group added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// GET ALL GROUPS
// =======================
router.get('/', async (req, res) => {
  try {
    const data = await Groups.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// GET GROUP BY group_id
// =======================
router.get('/:id', async (req, res) => {
  try {
    const data = await Groups.findOne({ group_id: req.params.id });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// UPDATE GROUP
// =======================
router.put('/:id', async (req, res) => {
  try {
    const data = await Groups.findOneAndUpdate(
      { group_id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// DELETE GROUP
// =======================
router.delete('/:id', async (req, res) => {
  try {
    await Groups.findOneAndDelete({ group_id: req.params.id });
    res.json({ message: 'Group deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
