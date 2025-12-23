import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AdminDashboard = () => {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [duration, setDuration] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [screenings, setScreenings] = useState([{ theatre_id: '', show_time: '' }]);
  const [theatres, setTheatres] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatreName, setTheatreName] = useState('');
  const [theatreLocation, setTheatreLocation] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const decoded = token ? jwtDecode(token) : {};

  useEffect(() => {
    if (!token || !decoded.isAdmin) {
      setError('Please log in as admin.');
      navigate('/login');
      return;
    }
    const fetchData = async () => {
      try {
        const [moviesResponse, theatresResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/movies', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/admin/theatres', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        console.log('Fetched movies:', moviesResponse.data);
        console.log('Fetched theatres:', theatresResponse.data);
        setMovies(moviesResponse.data || []);
        setTheatres(theatresResponse.data || []);
      } catch (err) {
        console.error('Fetch data error:', err.response?.data || err.message);
        setError(
          err.response?.data?.error || err.message || 'Failed to load movies or theatres.'
        );
      }
    };
    fetchData();
  }, [navigate, token]);

  const handleScreeningChange = (index, field, value) => {
    const newScreenings = [...screenings];
    newScreenings[index][field] = field === 'theatre_id' ? parseInt(value) || '' : value;
    setScreenings(newScreenings);
  };

  const addScreening = () => {
    setScreenings([...screenings, { theatre_id: '', show_time: '' }]);
  };

  const removeScreening = (index) => {
    setScreenings(screenings.filter((_, i) => i !== index));
  };

  const handleMovieSubmit = async () => {
    setError(null);
    setSuccess(null);
    try {
      if (!title.trim()) {
        throw new Error('Title is required');
      }
      if (!genre.trim()) {
        throw new Error('Genre is required');
      }
      if (!duration || isNaN(duration) || parseInt(duration) <= 0) {
        throw new Error('Duration must be a positive number');
      }
      const validScreenings = screenings.filter((s) => s.theatre_id && s.show_time);
      if (validScreenings.length > 0) {
        for (const { theatre_id, show_time } of validScreenings) {
          if (!theatres.find((t) => t.theatre_id === theatre_id)) {
            throw new Error(`Invalid theatre ID: ${theatre_id}`);
          }
          if (isNaN(Date.parse(show_time))) {
            throw new Error(`Invalid show time: ${show_time}`);
          }
        }
      }

      const payload = {
        title: title.trim(),
        genre: genre.trim(),
        duration: parseInt(duration),
        image_url: imageUrl.trim() || null,
        screenings: validScreenings,
      };
      console.log('Adding movie:', payload);
      const response = await axios.post('http://localhost:5000/api/admin/movies', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Movie and screenings added successfully!');
      setTitle('');
      setGenre('');
      setDuration('');
      setImageUrl('');
      setScreenings([{ theatre_id: '', show_time: '' }]);
      const { data } = await axios.get('http://localhost:5000/api/admin/movies', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMovies(data || []);
    } catch (error) {
      console.error('Add movie error:', error.response?.data || error.message);
      setError(error.response?.data?.error || error.message || 'Failed to add movie.');
    }
  };

  const handleTheatreSubmit = async () => {
    setError(null);
    setSuccess(null);
    try {
      if (!theatreName.trim()) {
        throw new Error('Theatre name is required');
      }
      if (!theatreLocation.trim()) {
        throw new Error('Theatre location is required');
      }
      const payload = {
        name: theatreName.trim(),
        location: theatreLocation.trim(),
      };
      console.log('Adding theatre:', payload);
      await axios.post('http://localhost:5000/api/admin/theatres', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Theatre added successfully!');
      setTheatreName('');
      setTheatreLocation('');
      const { data } = await axios.get('http://localhost:5000/api/admin/theatres', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTheatres(data || []);
    } catch (error) {
      console.error('Add theatre error:', error.response?.data || error.message);
      setError(error.response?.data?.error || error.message || 'Failed to add theatre.');
    }
  };

  const handleDeleteMovie = async (movie_id) => {
    setError(null);
    setSuccess(null);
    try {
      console.log(`Attempting to delete movie_id: ${movie_id}`);
      await axios.delete(`http://localhost:5000/api/admin/movies/${movie_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Movie and related data deleted successfully!');
      setMovies(movies.filter((movie) => movie.movie_id !== movie_id));
    } catch (error) {
      console.error('Delete movie error:', error.response?.data || error.message);
      setError(error.response?.data?.error || 'Failed to delete movie.');
    }
  };

  const handleDeleteTheatre = async (theatre_id) => {
    setError(null);
    setSuccess(null);
    try {
      console.log(`Attempting to delete theatre_id: ${theatre_id}`);
      await axios.delete(`http://localhost:5000/api/admin/theatres/${theatre_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Theatre and related data deleted successfully!');
      setTheatres(theatres.filter((theatre) => theatre.theatre_id !== theatre_id));
    } catch (error) {
      console.error('Delete theatre error:', error.response?.data || error.message);
      setError(error.response?.data?.error || 'Failed to delete theatre.');
    }
  };

  if (error && !movies.length && !theatres.length) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Add New Theatre</h3>
        <input
          type="text"
          placeholder="Theatre Name"
          value={theatreName}
          onChange={(e) => setTheatreName(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="text"
          placeholder="Location"
          value={theatreLocation}
          onChange={(e) => setTheatreLocation(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <button
          onClick={handleTheatreSubmit}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          disabled={!theatreName.trim() || !theatreLocation.trim()}
        >
          Add Theatre
        </button>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Manage Theatres</h3>
        {theatres.length === 0 ? (
          <p>No theatres available.</p>
        ) : (
          <div className="grid gap-4">
            {theatres.map((theatre) => (
              <div
                key={theatre.theatre_id}
                className="flex justify-between items-center p-4 bg-gray-100 rounded"
              >
                <div>
                  <p className="font-medium">{theatre.name}</p>
                  <p>Location: {theatre.location}</p>
                </div>
                <button
                  onClick={() => handleDeleteTheatre(theatre.theatre_id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Add New Movie</h3>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="text"
          placeholder="Genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="number"
          placeholder="Duration (minutes)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="text"
          placeholder="Image URL (e.g., https://example.com/image.jpg)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <h4 className="text-lg font-medium mb-2">Screenings</h4>
        {screenings.map((screening, index) => (
          <div key={index} className="flex gap-4 mb-4 items-center">
            <select
              value={screening.theatre_id}
              onChange={(e) => handleScreeningChange(index, 'theatre_id', e.target.value)}
              className="w-1/2 p-2 border rounded"
            >
              <option value="">Select Theatre</option>
              {theatres.map((theatre) => (
                <option key={theatre.theatre_id} value={theatre.theatre_id}>
                  {theatre.name} ({theatre.location})
                </option>
              ))}
            </select>
            <input
              type="datetime-local"
              value={screening.show_time}
              onChange={(e) => handleScreeningChange(index, 'show_time', e.target.value)}
              className="w-1/2 p-2 border rounded"
            />
            {screenings.length > 1 && (
              <button
                onClick={() => removeScreening(index)}
                className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addScreening}
          className="mb-4 bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Add Another Screening
        </button>
        <button
          onClick={handleMovieSubmit}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          disabled={!title.trim() || !genre.trim() || !duration || isNaN(duration) || parseInt(duration) <= 0}
        >
          Add Movie
        </button>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Manage Movies</h3>
        {movies.length === 0 ? (
          <p>No movies available.</p>
        ) : (
          <div className="grid gap-4">
            {movies.map((movie) => (
              <div
                key={movie.movie_id}
                className="flex justify-between items-center p-4 bg-gray-100 rounded"
              >
                <div>
                  <p className="font-medium">{movie.title}</p>
                  <p>Genre: {movie.genre}</p>
                  <p>Duration: {movie.duration} mins</p>
                  {movie.image_url && (
                    <p>
                      Image:{' '}
                      <a
                        href={movie.image_url}
                        className="text-blue-500"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View
                      </a>
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteMovie(movie.movie_id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;