console.log('Testing Roku API...'); window.RokuAPI.getFallbackMovies().then(movies => console.log('Fallback movies:', movies)).catch(err => console.error('Error:', err));
