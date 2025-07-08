import React from 'react';
   import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
   import { jwtDecode } from 'jwt-decode';
   import MovieList from './components/MovieList';
   import SeatSelection from './components/SeatSelection';
   import Booking from './components/Booking';
   import AdminDashboard from './components/AdminDashboard';
   import Login from './components/Login';
   import Register from './components/Register';
   import Payment from './components/Payment';
   import "./App.css"

   const ProtectedAdminRoute = ({ children }) => {
     const token = localStorage.getItem('token');
     if (!token) {
       return <Navigate to="/login" replace />;
     }
     try {
       const decoded = jwtDecode(token);
       if (!decoded.isAdmin) {
         return <Navigate to="/" replace />;
       }
       return children;
     } catch (error) {
       console.error('Invalid token:', error);
       return <Navigate to="/login" replace />;
     }
   };

   const App = () => {
     return (
       <Router>
         <Routes>
           <Route path="/" element={<MovieList />} />
           <Route path="/seats/:screeningId" element={<SeatSelection />} />
           <Route path="/booking/:screeningId" element={<Booking />} />
           <Route
             path="/admin"
             element={
               <ProtectedAdminRoute>
                 <AdminDashboard />
               </ProtectedAdminRoute>
             }
           />
           <Route path="/login" element={<Login />} />
           <Route path="/register" element={<Register />} />
           <Route path="/payment/:bookingId" element={<Payment />} />
         </Routes>
       </Router>
     );
   };

   export default App;