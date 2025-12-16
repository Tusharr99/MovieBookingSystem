# MovieBookingSystem (Node.js + Express + MongoDB + EJS + Tailwind)

Full-stack movie ticket booking app with JWT-based auth, admin dashboard, BookMyShow-style booking flow, and reviews.

## Stack
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, bcrypt, cookie-based auth
- **Views**: EJS server-rendered pages, Tailwind CSS
- **Auth**: User/admin roles with httpOnly JWT cookie, role-guarded admin routes

## Features
- **Movie discovery**: Home page with search, movie cards linking to detailed movie pages
- **Movie detail page**: Poster, description, duration, genres, status, showtimes listing, Book tickets CTA
- **Booking flow**: Per-movie booking page with theatre/time selection, seat map (booked seats disabled), and payment-style confirmation
- **Payments & tickets**: Mock payment page that creates bookings and redirects to a ticket view with payment reference
- **User area**: “My Bookings” page showing booking history and deep links to tickets/booking again
- **Admin dashboard**: Manage movies, theatres, screenings; view users, recent reviews, and per-movie rating analytics
- **Reviews & ratings**: Users can rate and review movies; movie pages show average rating and review list

## Quick start
1) Install deps
```bash
npm install
```
2) Configure environment  
Create a `.env` with:
```bash
PORT=5000
MONGO_URI=mongodb://localhost:27017/movie_booking
JWT_SECRET=supersecretjwt
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=changeme
```
3) Build CSS (one-time for dev)
```bash
npm run build:css
```
4) Run server
```bash
npm run dev
```
Visit `http://localhost:5000`

## Key API routes
- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
- **Movies**: `GET /api/movies`, `POST/PUT/DELETE /api/movies` (admin)
- **Theatres**: `GET /api/theatres`, `POST/PUT/DELETE /api/theatres` (admin)
- **Screenings**: `GET /api/screenings`, `POST/PUT/DELETE /api/screenings` (admin)
- **Bookings**: `GET /api/bookings` (user/admin filtered), `POST /api/bookings`
- **Reviews**: `GET /api/reviews?movie=:movieId`, `POST /api/reviews` (auth)

## Views overview
- `GET /`: Home (movies + search)
- `GET /movies/:id`: Movie detail + reviews and Book tickets CTA
- `GET /book` and `GET /book/:movieId`: Showtime + seat selection
- `POST /payment`: Payment-style step before booking confirmation
- `GET /ticket/:id`: Ticket view
- `GET /bookings`: My Bookings (requires login)
- `GET /admin`: Admin dashboard (requires admin)

## Notes
- JWT is stored in an httpOnly cookie; admin routes are protected by role checks.
- Seat booking does optimistic checks in Mongo; for strict guarantees you can add transactions or per-seat documents.
