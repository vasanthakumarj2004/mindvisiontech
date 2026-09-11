export function requireAuth(req, res, next) {
  if (!req.headers.authorization?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  return next();
}