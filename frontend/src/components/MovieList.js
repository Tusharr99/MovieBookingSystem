import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [screenings, setScreenings] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    let decoded = null;
    if (token) {
      try {
        decoded = jwtDecode(token);
        console.log('Decoded token:', { userId: decoded.userId, isAdmin: decoded.isAdmin });
        setIsAdmin(decoded.isAdmin || false);
        setIsLoggedIn(true);
      } catch (err) {
        console.error('Invalid token:', err.message);
        setError('Invalid session. Please log in again.');
      }
    } else {
      console.log('No token found in localStorage');
    }

    const fetchData = async () => {
      try {
        setError(null);

        let moviesData = [];
        try {
          const moviesResponse = await axios.get('http://localhost:5000/api/movies');
          console.log('Fetched movies:', moviesResponse.data);
          moviesData = moviesResponse.data || [];
        } catch (err) {
          console.error('Movies fetch error:', err.response?.data || err.message);
          throw new Error('Failed to load movies.');
        }

        let screeningsData = [];
        try {
          const screeningsResponse = await axios.get('http://localhost:5000/api/screenings');
          console.log('Fetched screenings:', screeningsResponse.data);
          screeningsData = screeningsResponse.data || [];
        } catch (err) {
          console.error('Screenings fetch error:', err.response?.data || err.message);
          throw new Error('Failed to load screenings.');
        }

        let theatresData = [];
        try {
          const theatresResponse = await axios.get('http://localhost:5000/api/theatres');
          console.log('Fetched theatres:', theatresResponse.data);
          theatresData = theatresResponse.data || [];
        } catch (err) {
          console.error('Theatres fetch error:', err.response?.data || err.message);
          throw new Error('Failed to load theatres.');
        }

        let bookingsData = [];
        if (token && decoded) {
          try {
            console.log('Attempting to fetch bookings with token');
            const bookingsResponse = await axios.get('http://localhost:5000/api/bookings/user/bookings', {
              headers: { Authorization: `Bearer ${token}` },
            });
            console.log('Bookings response:', {
              status: bookingsResponse.status,
              data: bookingsResponse.data,
            });
            bookingsData = Array.isArray(bookingsResponse.data) ? bookingsResponse.data : [];
          } catch (err) {
            console.error('Bookings fetch error:', {
              message: err.message,
              status: err.response?.status,
              data: err.response?.data,
            });
            console.warn('Continuing without bookings data.');
            bookingsData = [];
          }
        } else {
          console.log('Skipping bookings fetch: no valid token or decoded user');
        }

        setMovies(moviesData);
        setScreenings(screeningsData);
        setTheatres(theatresData);
        setBookings(bookingsData);
      } catch (err) {
        console.error('Fetch data error:', err.message);
        setError(err.message || 'Failed to load data. Please try again.');
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAdmin(false);
    setIsLoggedIn(false);
    setBookings([]);
    navigate('/login');
  };

  const getScreeningsForMovie = (movieId) => {
    return screenings.filter((screening) => screening.movie_id === movieId);
  };

  const getTheatreName = (theatreId) => {
    const theatre = theatres.find((t) => t.theatre_id === theatreId);
    return theatre ? `${theatre.name} (${theatre.location})` : 'Unknown Theatre';
  };

  const formatShowTime = (showTime) => {
    return new Date(showTime).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (error && movies.length === 0 && screenings.length === 0 && theatres.length === 0) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Movies</h2>
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Login
          </Link>
        )}
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {isLoggedIn && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Your Booked Movies</h3>
          {bookings.length === 0 ? (
            <p>No bookings yet.</p>
          ) : (
            <div className="grid gap-4">
              {bookings.map((booking) => (
                <div
                  key={booking.booking_id}
                  className="p-4 bg-gray-100 rounded-lg shadow"
                >
                  <h4 className="font-medium text-lg">{booking.movie_title}</h4>
                  <p>Theatre: {booking.theatre_name} ({booking.theatre_location})</p>
                  <p>Show Time: {formatShowTime(booking.show_time)}</p>
                  <p>Seats: {booking.seat_numbers || booking.seats_booked || 'N/A'}</p>
                  <p>Amount: ${booking.amount ? booking.amount.toFixed(2) : 'N/A'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <h3 className="text-xl font-semibold mb-4">Available Movies</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {movies.map((movie) => {
          const movieScreenings = getScreeningsForMovie(movie.movie_id);
          const screeningsByTheatre = movieScreenings.reduce((acc, screening) => {
            if (!acc[screening.theatre_id]) {
              acc[screening.theatre_id] = [];
            }
            acc[screening.theatre_id].push(screening);
            return acc;
          }, {});

          return (
            <div key={movie.movie_id} className="p-6 bg-white rounded-lg shadow">
              {movie.image_url && (
                <img
                  src={movie.image_url}
                  alt={movie.title}
                  className="w-full h-48 object-cover rounded mb-4"
                  onError={(e) => (e.target.src = 'https://via.placeholder.com/150')}
                />
              )}
              <h3 className="text-xl font-semibold mb-2">{movie.title}</h3>
              <p className="mb-1">Genre: {movie.genre || 'N/A'}</p>
              <p className="mb-4">Duration: {movie.duration ? `${movie.duration} mins` : 'N/A'}</p>
              {movieScreenings.length > 0 ? (
                <div>
                  <h4 className="text-lg font-medium mb-2">Available Screenings</h4>
                  {Object.entries(screeningsByTheatre).map(([theatreId, screenings]) => (
                    <div key={theatreId} className="mb-4">
                      <p className="font-medium">{getTheatreName(parseInt(theatreId))}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {screenings.map((screening) => (
                          <Link
                            key={screening.screening_id}
                            to={`/seats/${screening.screening_id}`}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                          >
                            {formatShowTime(screening.show_time)}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-red-500">No screenings available</p>
              )}
            </div>
          );
        })}
      </div>
      {isAdmin && (
        <Link
          to="/admin"
          className="mt-6 inline-block bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Admin Dashboard
        </Link>
      )}
    </div>
  );
};

export default MovieList;