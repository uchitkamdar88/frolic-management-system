const express = require('express');
const router = express.Router();
const Events = require('../Model/events');

// =======================
// ADD EVENT
// =======================
router.post('/add', async (req, res) => {
  try {
    const data = new Events(req.body);
    await data.save();
    res.status(201).json({ message: 'Event added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// GET ALL EVENTS
// =======================
router.get('/', async (req, res) => {
  try {
    const data = await Events.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// GET EVENT BY event_id
// =======================
router.get('/:id', async (req, res) => {
  try {
    const data = await Events.findOne({ event_id: req.params.id });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// UPDATE EVENT
// =======================
router.put('/:id', async (req, res) => {
  try {
    const data = await Events.findOneAndUpdate(
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
// DELETE EVENT
// =======================
router.delete('/:id', async (req, res) => {
  try {
    await Events.findOneAndDelete({ event_id: req.params.id });
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
