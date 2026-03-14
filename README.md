# 💰Expense Tracker API

A RESTful Expense Tracker Backend built with Node.js, Express, MongoDB (Mongoose), and JWT Authentication.
It allows users to register, log in, and manage their expenses — including filtering, monthly reports, and category breakdowns.

# 🚀 Features

✅ User Authentication (JWT)

✅ Create, Read, Update, Delete (CRUD) Expenses

✅ Filter by date, month, or category

✅ Generate Monthly Spending Reports

✅ Passwords securely hashed with bcrypt

✅ Protected Routes (only logged-in users can access their data)

# ⚙️Tech Stack
Node.js	Backend

Express.js

MongoDB + Mongoose	Database & ODM

JWT (jsonwebtoken)	Authentication

bcryptjs	Password hashing

dotenv	Environment variables

morgan	HTTP request logging

cors	Cross-origin requests

# 🔐API Endpoints
👤 Auth Routes
Method ||	Endpoint ||	Description

POST	/api/users/register	Register a new user

POST	/api/users/login	Login and get JWT

# 💸Expense Routes (Protected)
Method ||	Endpoint ||	Description

POST	/api/expenses	Create a new expense

GET	/api/expenses	Get all expenses

GET	/api/expenses/filter	Filter by date/month/category

GET	/api/expenses/report	Get monthly report

PUT	/api/expenses/:id	Update expense

DELETE	/api/expenses/:id	Delete expense

# 🧑‍💻Development Scripts
npm run dev	Run with nodemon (development)

npm start	Run normally (production)
