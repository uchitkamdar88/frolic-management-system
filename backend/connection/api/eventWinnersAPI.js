const express = require('express');
const router = express.Router();
const EventWinners = require('../Model/eventwinners');

// =======================
// ADD EVENT WINNER
// =======================
router.post('/add', async (req, res) => {
  try {
    const data = new EventWinners(req.body);
    await data.save();
    res.status(201).json({ message: 'Event winner added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// GET ALL EVENT WINNERS
// =======================
router.get('/', async (req, res) => {
  try {
    const data = await EventWinners.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// GET EVENT WINNER BY event_id
// =======================
router.get('/:id', async (req, res) => {
  try {
    const data = await EventWinners.findOne({ event_id: req.params.id });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// UPDATE EVENT WINNER
// =======================
router.put('/:id', async (req, res) => {
  try {
    const data = await EventWinners.findOneAndUpdate(
      { event_id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// DELETE EVENT WINNER
// =======================
router.delete('/:id', async (req, res) => {
  try {
    await EventWinners.findOneAndDelete({ event_id: req.params.id });
    res.json({ message: 'Event winner deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
