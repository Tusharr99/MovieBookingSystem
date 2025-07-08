import { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

function Review() {
  const { movieId } = useParams();
  const [rating, setRating] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');
  const decoded = token ? jwtDecode(token) : {};
  const userId = decoded.userId || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      setError('Please log in to submit a review.');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/reviews', {
        user_id: userId,
        movie_id: parseInt(movieId),
        rating: parseInt(rating),
        review_text: reviewText,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Review submitted!');
      setRating('');
      setReviewText('');
      setError(null);
    } catch (error) {
      console.error('Review error:', error.response?.data || error.message);
      setError(error.response?.data?.error || 'Failed to submit review.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Submit Review</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="Rating (1-5)"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          min="1"
          max="5"
        />
        <textarea
          placeholder="Your review"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Submit Review
        </button>
      </form>
    </div>
  );
}

export default Review;