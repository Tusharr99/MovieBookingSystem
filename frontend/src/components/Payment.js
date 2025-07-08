import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';

const Payment = () => {
  const { bookingId } = useParams();
  const { state } = useLocation();
  const { paymentId, amount } = state || {};
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handlePaymentConfirmation = async () => {
    setError(null);
    try {
      const response = await axios.post('http://localhost:5000/api/bookings/confirm', {
        booking_id: parseInt(bookingId),
        payment_id: paymentId,
      });
      console.log('Payment confirmation response:', response.data);
      setSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (error) {
      console.error('Payment confirmation error:', error.response?.data || error.message);
      setError('Failed to confirm payment. Please try again.');
    }
  };

  if (!paymentId || !amount) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6">Error</h2>
        <p className="text-red-500">Invalid payment details. Please try booking again.</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-green-500">Payment Successful!</h2>
        <p>Your booking has been confirmed. Redirecting to home...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Payment</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <p className="mb-4">Amount: ${amount}</p>
      <div className="flex justify-center mb-6">
        <QRCodeCanvas value={`payment://movie-booking?bookingId=${bookingId}&amount=${amount}`} />
      </div>
      <p className="text-center mb-4">Scan the QR code with your payment app to pay.</p>
      <button
        onClick={handlePaymentConfirmation}
        className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
      >
        Paid
      </button>
    </div>
  );
};

export default Payment;