
# Frolic Management 2026

## Overview
Frolic Management 2026 is a full-stack web application developed for the annual cultural and technical event "Frolic" at Darshan University, Rajkot.

The project is built using React.js for the frontend and Node.js + Express.js + MongoDB for the backend. The system helps manage event registrations, participants, departments, institutes, groups, winners, feedback, and user authentication through a centralized platform.

This project is developed for educational and academic purposes.

---

# Technologies Used

## Frontend
- React.js
- React Router DOM
- Bootstrap 5
- Axios
- CSS

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs
- dotenv
- CORS

---

# Main Features

## Authentication System
- User Registration
- User Login
- Forgot Password Page
- JWT-based Authentication

## User Panel
- User Dashboard
- Event Registration
- Payment Section

## Admin Panel
- Dashboard
- Event Management
- Department Management
- Institute Management
- Group Management
- Participants Management
- Winners Management
- User Management
- Feedback Management

## Backend APIs
The backend includes APIs for:
- Users
- Departments
- Events
- Winners
- Groups
- Institutes
- Participants
- Registrations
- Contact / Feedback

---

# Project Structure

```text
Frolic_Management_2026/
│
├── frontend/
│   │
│   ├── public/
│   │
│   ├── src/
│   │   │
│   │   ├── admin/
│   │   │   ├── AdminLayout.js
│   │   │   ├── dashboard.js
│   │   │   ├── departments.js
│   │   │   ├── events.js
│   │   │   ├── feedback.js
│   │   │   ├── groups.js
│   │   │   ├── institutes.js
│   │   │   ├── participants.js
│   │   │   ├── userlist.js
│   │   │   └── winners.js
│   │   │
│   │   ├── auth/
│   │   │   ├── forgot-password.js
│   │   │   ├── login.js
│   │   │   └── registration.js
│   │   │
│   │   ├── user/
│   │   │   ├── dashboard.js
│   │   │   ├── payment.js
│   │   │   └── registerEvent.js
│   │   │
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   │
│   ├── package.json
│   └── package-lock.json
│
├── backend/
│   │
│   ├── connection/
│   │   │
│   │   ├── api/
│   │   │   ├── contactAPI.js
│   │   │   ├── departmentAPI.js
│   │   │   ├── eventsAPI.js
│   │   │   ├── eventWinnersAPI.js
│   │   │   ├── groupsAPI.js
│   │   │   ├── instituteAPI.js
│   │   │   ├── participantsAPI.js
│   │   │   ├── registrationAPI.js
│   │   │   └── userAPI.js
│   │   │
│   │   └── model/
│   │       ├── contact.js
│   │       ├── department.js
│   │       ├── events.js
│   │       ├── eventwinners.js
│   │       ├── groups.js
│   │       ├── institute.js
│   │       ├── participant.js
│   │       ├── registration.js
│   │       └── user.js
│   │
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── package.json
├── package-lock.json
├── CURDAPI.txt
└── Frolic_SRS.pdf
```

---

# Important Note Before Uploading to GitHub

This project currently contains:
- node_modules folders
- package-lock files
- environment files

You should NOT upload node_modules to GitHub because it contains thousands of unnecessary files.

Before uploading the project:

## Delete These Folders
```bash
frontend/node_modules
backend/node_modules
node_modules
```

---

# Create .gitignore File

Create a `.gitignore` file in the root directory and add the following:

```gitignore
node_modules/
.env
build/
dist/
coverage/
```

This prevents unnecessary and sensitive files from being uploaded.

---

# Requirements

Install the following software before running the project:

## Required Software
- Node.js
- npm
- MongoDB
- Git (Optional)

---

# Installation Guide

## Step 1: Download the Project

### Option 1: Download ZIP
Download the ZIP file and extract it.

### Option 2: Clone Using Git

```bash
git clone <repository-url>
```

---

# Backend Setup

## Step 2: Open Backend Folder

```bash
cd backend
```

## Step 3: Install Backend Dependencies

```bash
npm install
```

## Step 4: Configure Environment Variables

Create a `.env` file inside the backend folder.

Example:

```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Replace:
- `your_mongodb_connection_string`
- `your_secret_key`

with your actual values.

---

# MongoDB Setup

## Local MongoDB

Start MongoDB locally before running the backend.

Example:

```bash
mongod
```

## MongoDB Atlas

You can also use MongoDB Atlas cloud database.

---

# Run Backend Server

## Step 5: Start Backend

```bash
node server.js
```

or

```bash
npx nodemon server.js
```

If everything is correct, the server will run on:

```text
http://localhost:8000
```

---

# Frontend Setup

## Step 6: Open Frontend Folder

Open a new terminal and run:

```bash
cd frontend
```

## Step 7: Install Frontend Dependencies

```bash
npm install
```

---

# Run Frontend

## Step 8: Start React Application

```bash
npm start
```

The React application will run on:

```text
http://localhost:3000
```

---

# Available Routes

## Authentication Routes

| Route | Description |
|---|---|
| / | Login Page |
| /login | Login |
| /register | Registration |
| /forgot-password | Forgot Password |

## User Routes

| Route | Description |
|---|---|
| /user/dashboard | User Dashboard |
| /user/registerEvent | Event Registration |
| /user/payment | Payment |

## Admin Routes

| Route | Description |
|---|---|
| /admin/dashboard | Admin Dashboard |
| /admin/events | Manage Events |
| /admin/groups | Manage Groups |
| /admin/departments | Manage Departments |
| /admin/institutes | Manage Institutes |
| /admin/participants | Manage Participants |
| /admin/winners | Manage Winners |
| /admin/users | Manage Users |
| /admin/feedback | View Feedback |

---

# Backend API Endpoints

| Endpoint | Purpose |
|---|---|
| /users | User APIs |
| /department | Department APIs |
| /events | Event APIs |
| /event-winners | Winners APIs |
| /groups | Group APIs |
| /institute | Institute APIs |
| /participants | Participant APIs |
| /contact | Contact APIs |
| /registration | Registration APIs |

---

# Health Check API

Backend includes a health check route:

```text
GET /health-check
```

Response Example:

```json
{
  "status": "online"
}
```

---

# Testing the Project

## Backend Test
Open browser:

```text
http://localhost:8000
```

Expected Output:

```text
Backend is running
```

## Frontend Test
Open browser:

```text
http://localhost:3000
```

Expected Output:
- Login Page
- React Application UI

---

# Common Errors and Solutions

## Error: node_modules missing

Run:

```bash
npm install
```

---

## Error: MongoDB connection failed

Check:
- MongoDB is running
- Correct MONGO_URI
- Internet connection (if using Atlas)

---

## Error: Port already in use

Change the port in:
- backend .env file
- React configuration if needed

---

# Recommended GitHub Upload Steps

## Step 1
Delete all node_modules folders.

## Step 2
Check `.gitignore`.

## Step 3
Initialize Git.

```bash
git init
```

## Step 4
Add files.

```bash
git add .
```

## Step 5
Commit files.

```bash
git commit -m "Initial Commit"
```

## Step 6
Push to GitHub.

```bash
git remote add origin <repository-url>
git branch -M main
git push -u origin main
```

---

# Educational Purpose Notice

This project is created for:
- Educational learning
- College submission
- Practice of MERN stack development

This project is not intended for commercial production use.

---

# Author

Project developed for Frolic Event Management at Darshan University, Rajkot.

