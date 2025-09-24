# MovieBookingSystem

MovieBookingSystem: A full-stack app for movie ticket booking & cinema management. Built with React, Node.js, Express, MySQL. Features JWT auth, Admin Dashboard for movies/theaters, and responsive UI with Tailwind CSS.

## Features
- **User Authentication**: Secure login/registration for users and admins using JWT and bcrypt.
- **Admin Dashboard**: Manage movies, theaters, and screenings with RESTful APIs.
- **Movie Booking**: Browse movies, select screenings, and book tickets with a responsive UI.
- **Database**: MySQL with Sequelize ORM for efficient data management.

## Tech Stack
- **Frontend**: React, React Router, Axios, Tailwind CSS
- **Backend**: Node.js, Express, Sequelize, JWT, bcrypt
- **Database**: MySQL
- **Tools**: Git, VS Code, npm, PowerShell

## Installation

### Prerequisites
- Node.js (v18.x or higher)
- MySQL (8.x or higher)
- Git

### Setup
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Tusharr99/MovieBookingSystem.git
   cd MovieBookingSystem
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in `backend/`:
   ```
   PORT=5000
   DB_HOST=localhost
   DB_USER=movie_user
   DB_PASSWORD=your_password
   DB_NAME=movie_booking
   JWT_SECRET=your_jwt_secret
   ```
   Set up MySQL:
   ```bash
   mysql -u root -p
   CREATE DATABASE movie_booking;
   CREATE USER 'movie_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON movie_booking.* TO 'movie_user'@'localhost';
   EXIT;
   ```
   Run migrations (if using Sequelize):
   ```bash
   npx sequelize db:migrate
   ```
   Start the backend:
   ```bash
   npm start
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   npm start
   ```

4. **Access the Application**:
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:5000`

## Usage
- **Admin**: Log in with `admin@gmail.com` and `admin123` to manage movies, theaters, and screenings.
- **Users**: Register/login to browse movies and book tickets.
- **Key Endpoints**:
  - `POST /api/auth/login`: Authenticate users/admins.
  - `POST /api/admin/movies`: Add movies (admin only).
  - `GET /api/theatres`: List theaters.
  - `GET /api/screenings`: List screenings.

