const express = require('express');
const router = express.Router();
const Participant = require('../Model/participant');

// =======================
// ADD PARTICIPANT
// =======================
router.post('/add', async (req, res) => {
  try {
    const data = new Participant(req.body);
    await data.save();
    res.status(201).json({ message: 'Participant added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// GET ALL PARTICIPANTS
// =======================
router.get('/', async (req, res) => {
  try {
    const data = await Participant.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// GET PARTICIPANT BY participant_id
// =======================
router.get('/:id', async (req, res) => {
  try {
    const data = await Participant.findOne({ participant_id: req.params.id });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// UPDATE PARTICIPANT
// =======================
router.put('/:id', async (req, res) => {
  try {
    const data = await Participant.findOneAndUpdate(
      { participant_id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// DELETE PARTICIPANT
// =======================
router.delete('/:id', async (req, res) => {
  try {
    await Participant.findOneAndDelete({ participant_id: req.params.id });
    res.json({ message: 'Participant deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
