export function errorHandler(error, _req, res, _next) {
  if (process.env.NODE_ENV !== 'test') {
    console.error('[Server Error]', error);
  }

  const statusCode = error.statusCode || error.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Do not disclose internal system/DB stack traces or messages in production for 500s
  const message = (statusCode === 500 && isProduction)
    ? 'Internal server error'
    : (error.message || 'Internal server error');

  res.status(statusCode).json({ message });
}