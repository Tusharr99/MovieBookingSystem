const Movie = require('./models/Movie');

async function testPost() {
  try {
    const movieData = {
      title: 'Test Movie',
      genre: 'Action',
      duration: 120,
      image_url: 'http://example.com/image.jpg'
    };
    console.log('Attempting to create movie:', movieData);
    const movieId = await Movie.create(movieData);
    console.log('Movie created with ID:', movieId);
  } catch (err) {
    console.error('Error creating movie:', err);
  }
}

testPost();
