const express = require("express");
const router = express.Router();
const Registration = require("../model/registration");

// =======================
// ADD REGISTRATION
// =======================
router.post("/add", async (req, res) => {
  try {
    const { user_id, event_id } = req.body;

    if (!user_id || !event_id) {
      return res.status(400).json({
        message: "User ID and Event ID are required"
      });
    }

    // Prevent duplicate registration
    const existing = await Registration.findOne({
      user_id,
      event_id
    });

    if (existing) {
      return res.status(400).json({
        message: "You are already registered for this event"
      });
    }

    // Generate auto registration_id (R001, R002...)
    const lastRegistration = await Registration.findOne().sort({ createdAt: -1 });

    let nextNumber = 1;

    if (lastRegistration && lastRegistration.registration_id) {
      nextNumber =
        parseInt(lastRegistration.registration_id.replace("R", "")) + 1;
    }

    const registration_id = `R${String(nextNumber).padStart(3, "0")}`;

    const newRegistration = new Registration({
      registration_id,
      user_id,
      event_id
    });

    await newRegistration.save();

    res.status(201).json({
      message: "Registration successful",
      registration: newRegistration
    });

  } catch (err) {
    console.error("REGISTRATION ERROR:", err);
    res.status(500).json({
      message: "Server error"
    });
  }
});


// =======================
// GET ALL REGISTRATIONS
// =======================
router.get("/", async (req, res) => {
  try {
    const registrations = await Registration.find();
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// =======================
// GET REGISTRATIONS BY USER
// =======================
router.get("/user/:user_id", async (req, res) => {
  try {
    const registrations = await Registration.find({
      user_id: req.params.user_id
    });

    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// =======================
// DELETE REGISTRATION
// =======================
router.delete("/:id", async (req, res) => {
  try {
    await Registration.findByIdAndDelete(req.params.id);
    res.json({ message: "Registration deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
