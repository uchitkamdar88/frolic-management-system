const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const userAPI = require("./connection/api/userAPI");
const departmentAPI = require('./connection/api/departmentAPI');
const eventsAPI = require('./connection/api/eventsAPI');
const eventWinnersAPI = require('./connection/api/eventWinnersAPI');
const groupsAPI = require('./connection/api/groupsAPI');
const instituteAPI = require('./connection/api/instituteAPI');
const participantsAPI = require('./connection/api/participantsAPI');
const contactAPI = require("./connection/api/contactAPI");
const registrationAPI = require("./connection/api/registrationAPI");

const app = express();

/* ---------- Middleware ---------- */
app.use(express.json());
app.use(cors());

/* ---------- Routes ---------- */
app.use("/users", userAPI);
app.use('/department', departmentAPI);
app.use('/events', eventsAPI);
app.use('/event-winners', eventWinnersAPI);
app.use('/groups', groupsAPI);
app.use('/institute', instituteAPI);
app.use('/participants', participantsAPI);
app.use("/contact", contactAPI);
app.use("/registration", registrationAPI);

app.get('/health-check', (req, res) => {
  res.status(200).json({ 
    status: 'online', 
    timestamp: new Date().toISOString() 
  });
});

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.post("/test", (req, res) => {
  res.json({ message: "Server routes are working!" });
});

app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

app.use((req, res) => {
  console.log(`404 occurred for: ${req.method} ${req.url}`);
  res.status(404).send("Route not found on server");
});

/* ---------- Database + Server ---------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Database Connected");

    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
  });
