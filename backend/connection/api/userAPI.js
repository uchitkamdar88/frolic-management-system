const express = require('express');
const router = express.Router();
const User = require('../model/user');

// =======================
// ADD USER (REGISTRATION)
// =======================
router.post('/add', async (req, res) => {
  try {
    const { userName, email, phone, password } = req.body;

    // Validation
    if (!userName || !email || !phone || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check existing email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Generate auto-increment user_id
    const lastUser = await User.findOne().sort({ createdAt: -1 });

    let nextNumber = 1;
    if (lastUser && lastUser.user_id) {
      nextNumber = parseInt(lastUser.user_id.replace("U", "")) + 1;
    }

    const user_id = `U${String(nextNumber).padStart(3, "0")}`;

    // Create user
    const newUser = new User({
      user_id,
      userName,
      email,
      phone,
      password,       // (plain text for now)
      isAdmin: false  // NEVER from frontend
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: newUser
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// LOGIN USER
// =======================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        user_id: user.user_id,
        userName: user.userName,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =======================
// GET ALL USERS
// =======================
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// GET USER BY MONGO ID
// =======================
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// UPDATE USER
// =======================
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// DELETE USER
// =======================
router.delete('/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// GET NON-ADMIN USER COUNT (ADMIN DASHBOARD)
// =======================
router.get('/stats/non-admin-count', async (req, res) => {
  try {
    const count = await User.countDocuments({ isAdmin: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// FORGOT PASSWORD
// =======================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not registered" });
    }

    res.json({ message: "Email verified" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
