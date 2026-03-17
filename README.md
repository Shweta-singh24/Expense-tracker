📌 Expense Tracker App

A full-stack Expense Tracker application that allows users to manage their daily expenses efficiently with secure authentication and file upload support.

🚀 Features

🔐 User Authentication (JWT आधारित login/signup)

💰 Add, update, delete expenses (CRUD operations)

📊 Monthly expense report

📎 Receipt upload (Cloudinary integration)

🧾 Category-wise expense tracking

🔒 Secure password hashing using bcrypt

🛠️ Tech Stack

Backend:
Node.js
Express.js
MongoDB (Mongoose)
JWT Authentication
Bcrypt (Password hashing)
Multer (File handling)
Cloudinary (Cloud storage)
Frontend:
React.js
Tailwind CSS

📂 Project Structure

backend/
 ├── config/
 ├── controllers/
 ├── models/
 ├── routes/
 ├── middleware/
 ├── utils/
 └── server.js



📡 API Endpoints


🔐 Auth Routes


POST /api/auth/signup
POST /api/auth/login

💰 Expense Routes

GET    /api/expenses       → Get all expenses
POST   /api/expenses       → Create expense (with file upload)
PUT    /api/expenses/:id   → Update expense
DELETE /api/expenses/:id   → Delete expense




📊 Reports


GET /api/expenses/monthly?month=MM&year=YYYY




📎 File Upload




Uses Multer for handling files


Uploads receipts to Cloudinary


Stores secure URL in database





🔐 Authentication Flow




User signup/login


JWT token generated


Token sent in headers:




Authorization: Bearer <token>





Protected routes verify token





🧪 Testing


Use Postman:




Select form-data for file upload


Add fields:



receipt → File


other fields → Text




💡 Future Improvements




📊 Graphs & analytics dashboard


🔍 Search & filter


📱 Responsive UI improvements


💳 Payment integration





👩‍💻 Author

Shweta Singh
📧 shwetasingh02415@gmail.com
