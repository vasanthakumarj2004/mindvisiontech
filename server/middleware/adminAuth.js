import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Admin JWT auth middleware.
 *
 * Reads the token from:
 *   1. HttpOnly cookie: admin_token
 *   2. Fallback: Authorization: Bearer <token> header
 *
 * Attaches decoded payload to req.admin.
 * Returns 401 when no/invalid token, 403 when role is wrong.
 */
export function requireAdminAuth(req, res, next) {
  // 1. Cookie (primary — sent automatically by browser)
  let token = req.cookies?.admin_token;

  // 2. Bearer header fallback (for API clients / scripts)
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]?.trim();
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (!env.jwtSecret) {
    return res.status(500).json({ message: 'Server misconfiguration: JWT_SECRET not set' });
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    req.admin = { id: decoded.id, role: decoded.role };
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired, please log in again' });
    }
    return res.status(401).json({ message: 'Invalid or tampered token' });
  }
}
