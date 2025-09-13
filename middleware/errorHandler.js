const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Supabase error
  if (err.code && err.message) {
    return res.status(400).json({
      success: false,
      message: 'Database error occurred',
      error: err.message
    });
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
};

module.exports = errorHandler;