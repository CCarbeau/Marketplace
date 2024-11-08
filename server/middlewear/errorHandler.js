export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message || err);
    res.status(500).json({ error: err.message || 'An unexpected error occurred' });
  };  