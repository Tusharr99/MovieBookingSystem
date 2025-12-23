import React, { useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const Booking = () => {
  const { screeningId } = useParams();
  const { state } = useLocation();
  const { selectedSeats } = state || {};
  const [amount] = useState(selectedSeats?.length ? selectedSeats.length * 10 : 0);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const decoded = token ? jwtDecode(token) : {};
  const userId = decoded.userId;

  if (!token || !userId) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6">Error</h2>
        <p className="text-red-500">Please log in to book seats.</p>
        <button
          onClick={() => navigate('/login')}
          className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (!selectedSeats || selectedSeats.length === 0) {
    console.log('No seats selected:', selectedSeats);
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6">Error</h2>
        <p className="text-red-500">No seats selected. Please go back and select seats.</p>
      </div>
    );
  }

  const handlePayment = async () => {
    setError(null);
    const payload = {
      user_id: userId,
      screening_id: parseInt(screeningId),
      seats_booked: selectedSeats.join(','),
      amount,
    };
    console.log('Sending booking data:', payload);
    try {
      const { data } = await axios.post('http://localhost:5000/api/bookings', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Booking response:', data);
      navigate(`/payment/${data.bookingId}`, { state: { paymentId: data.paymentId, amount } });
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      console.error('Booking error:', errorMessage);
      if (errorMessage.includes('Seats already booked')) {
        setError(errorMessage);
      } else if (errorMessage.includes('ER_NO_REFERENCED_ROW')) {
        setError('Invalid user or screening. Please log in again or select a different show.');
      } else if (errorMessage.includes('ECONNREFUSED')) {
        setError('Backend server is not running. Please try again later.');
      } else {
        setError('Failed to create booking. Please try again.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Booking Details</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <p>Seats: {selectedSeats.join(', ')}</p>
      <p>Total Amount: ${amount}</p>
      <button
        onClick={handlePayment}
        className="mt-6 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        disabled={!selectedSeats?.length}
      >
        Confirm Payment
      </button>
    </div>
  );
};

export default Booking;