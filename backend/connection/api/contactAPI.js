const express = require("express");
const router = express.Router();
const Contact = require("../model/contact");

// =======================
// ADD CONTACT MESSAGE
// =======================
router.post("/add", async (req, res) => {
  try {
    const data = new Contact(req.body);
    await data.save();
    res.status(201).json({ message: "Contact message added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// GET ALL CONTACT MESSAGES
// =======================
router.get("/", async (req, res) => {
  try {
    const data = await Contact.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// GET CONTACT BY contact_id
// =======================
router.get("/:id", async (req, res) => {
  try {
    const data = await Contact.findOne({ contact_id: req.params.id });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// UPDATE CONTACT (status / reply etc.)
// =======================
router.put("/:id", async (req, res) => {
  try {
    const data = await Contact.findOneAndUpdate(
      { contact_id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// DELETE CONTACT
// =======================
router.delete("/:id", async (req, res) => {
  try {
    await Contact.findOneAndDelete({ contact_id: req.params.id });
    res.json({ message: "Contact deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
