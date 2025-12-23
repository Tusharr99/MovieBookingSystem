import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SeatSelection = () => {
  const { screeningId } = useParams();
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [screeningDetails, setScreeningDetails] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [error, setError] = useState(null);

  const seats = [
    ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7'],
    ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7'],
    ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7'],
    ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'],
    ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7'],
    ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7'],
    ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7'],
  ];

  useEffect(() => {
    if (!screeningId || isNaN(screeningId)) {
      setError('Invalid screening ID.');
      return;
    }
    const fetchData = async () => {
      try {
        const [screeningResponse, seatsResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/screenings/${screeningId}`),
          axios.get(`http://localhost:5000/api/bookings/seats/${screeningId}`),
        ]);
        console.log('Fetched screening details:', screeningResponse.data);
        console.log('Fetched booked seats:', seatsResponse.data);
        setScreeningDetails(screeningResponse.data);
        setBookedSeats(seatsResponse.data || []);
      } catch (err) {
        console.error('Fetch error:', err.response?.data || err.message);
        setError(
          err.response?.data?.error ||
            'Failed to load screening or seat data. Please try again.'
        );
      }
    };
    console.log('Using screeningId:', screeningId);
    fetchData();
  }, [screeningId]);

  const toggleSeat = (seat) => {
    if (bookedSeats.includes(seat)) {
      return;
    }
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleProceed = () => {
    console.log('Proceeding to booking with screeningId:', screeningId, 'and seats:', selectedSeats);
    navigate(`/booking/${screeningId}`, { state: { selectedSeats } });
  };

  const formatShowTime = (showTime) => {
    return showTime
      ? new Date(showTime).toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      : '';
  };

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6">Error</h2>
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Back to Movies
        </button>
      </div>
    );
  }

  if (!screeningDetails) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Select Seats</h2>
      <div className="mb-6">
        <p className="font-semibold">{screeningDetails.movie_title}</p>
        <p>{screeningDetails.theatre_name} ({screeningDetails.theatre_location})</p>
        <p>{formatShowTime(screeningDetails.show_time)}</p>
      </div>
      <div className="grid gap-2">
        {seats.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-2 justify-center">
            {row.map((seat) => (
              <button
                key={seat}
                onClick={() => toggleSeat(seat)}
                className={`w-10 h-10 rounded text-sm ${
                  bookedSeats.includes(seat)
                    ? 'bg-red-500 text-white cursor-not-allowed'
                    : selectedSeats.includes(seat)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200'
                }`}
                disabled={bookedSeats.includes(seat)}
              >
                {seat}
              </button>
            ))}
          </div>
        ))}
      </div>
      {selectedSeats.length > 0 && (
        <p className="mt-4">Selected: {selectedSeats.join(', ')}</p>
      )}
      <button
        onClick={handleProceed}
        className="mt-6 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        disabled={selectedSeats.length === 0}
      >
        Proceed to Booking
      </button>
    </div>
  );
};

export default SeatSelection;