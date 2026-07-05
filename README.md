# 🎓 StudyMaster

> **A full-stack MERN academic productivity platform designed to help students organize tasks, stay focused with Pomodoro sessions, visualize learning progress, and boost motivation through gamification.**

🌐 **Live Demo:** https://study-master-henna.vercel.app/

---

## 📖 Overview

StudyMaster is a modern academic productivity platform built using the **MERN Stack**. It enables students to efficiently manage their study schedules through task management, Pomodoro focus sessions, interactive analytics, and a gamified reward system.

The platform provides a responsive and intuitive interface for tracking academic progress, improving productivity, and maintaining consistent study habits.

---

## ✨ Key Features

### 📊 Dashboard

* Personalized dashboard with study progress overview
* Weekly productivity statistics
* Quick access to frequently used features

### 📋 Task Management

* Create, edit, and delete tasks
* Kanban Board and List View
* Task prioritization and due dates
* Subject categorization
* Confetti animation on task completion

### ⏱️ Pomodoro Timer

* 25-minute focus sessions with 5-minute breaks
* Play, pause, and reset controls
* Circular countdown timer
* Ambient sounds (Rain, Forest, Wind Chimes)
* Daily focus session tracking

### 📈 Learning Analytics

* Subject-wise task distribution
* Completed vs Pending task visualization
* Interactive charts using Chart.js

### 📚 Resource Hub

* Store study notes and learning resources
* Organize materials by category
* Fast local storage support

### 🏆 Gamification

* Dynamic level progression
* Achievement badges
* Productivity milestones

### ⚙️ Settings

* Productivity goals
* Notification preferences
* Language settings
* Secure password management

---

## 🛠️ Tech Stack

| Category           | Technologies                                   |
| ------------------ | ---------------------------------------------- |
| **Frontend**       | React 18, Vite, Tailwind CSS, React Router DOM |
| **Backend**        | Node.js, Express.js                            |
| **Database**       | MongoDB, Mongoose                              |
| **Authentication** | JWT, BcryptJS                                  |
| **Charts**         | Chart.js, React-Chartjs-2                      |
| **Animations**     | Framer Motion, Canvas Confetti                 |
| **Icons**          | Lucide React, React Icons                      |

---

## 📂 Project Structure

```text
StudyMaster/
├── backend/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── utils/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## 🚀 Installation

### Clone the Repository

```bash
git clone https://github.com/your-username/StudyMaster.git
cd StudyMaster
```

### Install Dependencies

**Frontend**

```bash
npm install
npm run dev
```

**Backend**

```bash
cd backend
npm install
npm start
```

---

## 🔐 Environment Variables

Create a `.env` file inside the **backend** directory.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint             |
| ------ | -------------------- |
| POST   | `/api/auth/register` |
| POST   | `/api/auth/login`    |
| GET    | `/api/auth/me`       |
| PUT    | `/api/auth/password` |

### Tasks

| Method | Endpoint         |
| ------ | ---------------- |
| GET    | `/api/tasks`     |
| POST   | `/api/tasks`     |
| PUT    | `/api/tasks/:id` |
| DELETE | `/api/tasks/:id` |

### Settings

| Method | Endpoint        |
| ------ | --------------- |
| GET    | `/api/settings` |
| PUT    | `/api/settings` |

---

## 🚀 Future Enhancements

* 🤖 AI-powered Study Planner
* 📅 Google Calendar Integration
* 🌙 Dark Mode
* 👥 Collaborative Study Groups
* ☁️ Cloud File Storage
* 📱 Mobile Application
* 📊 Advanced Productivity Insights

---

## 📄 License

This project is licensed under the **ISC License**.
