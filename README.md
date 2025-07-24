# 🗺️ Tourist Attraction Recommendation System

This is a fullstack web application built as a bachelor's qualification project. The goal of the project is to help users discover tourist attractions based on personalized recommendations. It addresses the challenge of information overload by suggesting relevant places using collaborative filtering techniques.

The application consists of a React.js frontend and a Node.js + MySQL backend. The recommendation engine is based on matrix factorization using stochastic gradient descent (SGD).

---

## ✨ Key Features

- Personalized recommendation system
- User registration and authentication
- Responsive and user-friendly interface
- RESTful API for frontend-backend communication

---

## 🧰 Technologies Used

**Frontend:**  
- React.js  
- HTML5, CSS3  
- Axios

**Backend:**  
- Node.js  
- Express.js  
- MySQL

**Other Tools:**  
- phpMyAdmin (for database management)  
- Vite (for React dev server)  
- Git & GitHub

## 🚀 How to Run the Project

### 🧩 Prerequisites

Make sure the following are installed:

- [Node.js & npm](https://nodejs.org/)
- MySQL Server (e.g., via XAMPP or standalone)
- phpMyAdmin (optional, for easier DB management)

### ⚙️ Local Setup Instructions

1. **Start your MySQL server**  
   Ensure MySQL is running and a database for the app is created (you can use `phpMyAdmin` to do this manually).

2. **Clone the repository**

```bash
git clone https://github.com/ferax3/project_WEBSITE.git
cd project

In one terminal:
cd client
npm install        # only once
npm run dev

In another terminal:
cd server
npm install        # only once
node index.js

