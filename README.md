<p align="center">
  <img src="./banner.png" alt="MERN Secure Notes Banner"/>
</p>

<h1 align="center">🚀 MERN Secure Notes</h1>

<p align="center">
  A Secure Multi-user Notes Application built using the MERN Stack
</p>

<p align="center">

<img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white"/>

<img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge"/>

<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>

<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>

<img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens"/>

<img src="https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white"/>

</p>

---

# 📌 Overview

MERN Secure Notes is a full-stack Notes Management application that allows users to securely create, manage, search, and organize notes with authentication and role-based authorization.

The project focuses on:
- JWT Authentication
- Protected CRUD Operations
- Search & Pagination
- Owner-only Authorization
- Secure Backend APIs
- Modern React UI

---

# ✨ Features

## 🔐 Authentication & Security
- User Signup & Login
- JWT-based Authentication
- Password Hashing using bcrypt
- Protected Routes
- Secure API Access

---

## 📝 Notes Management
- Create Notes
- Edit Notes
- Delete Notes
- View Notes Dashboard
- Owner-only CRUD access

---

## 🔎 Search & Pagination
- Search notes by title/content
- MongoDB Regex Search
- Tag Filtering
- Pagination support

---

## 👮 Authorization
- User Role Management
- Admin Access Control
- Owner-only Update/Delete

---

# 🛠 Tech Stack

## Frontend
- React.js
- Axios
- React Router DOM
- Tailwind CSS

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt.js

---

# 📂 Project Structure

```bash
mern-secure-notes/
│
├── client/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── context/
│   └── services/
│
├── server/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   └── utils/
│
├── screenshots/
├── README.md
├── banner.png
└── .env.example
