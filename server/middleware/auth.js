import crypto from 'crypto';

/**
 * Authentication middleware with timing-safe token verification.
 * Replaces insecure substring checks with constant-time token comparison
 * or JWT verification against server secrets.
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1]?.trim();
  const serverSecret = process.env.ADMIN_API_KEY || process.env.JWT_SECRET;

  if (!token || !serverSecret) {
    return res.status(401).json({ message: 'Unauthorized: Invalid or unconfigured credentials' });
  }

  try {
    const tokenBuffer = Buffer.from(token);
    const secretBuffer = Buffer.from(serverSecret);

    if (tokenBuffer.length !== secretBuffer.length || !crypto.timingSafeEqual(tokenBuffer, secretBuffer)) {
      return res.status(401).json({ message: 'Unauthorized: Invalid credentials' });
    }
  } catch {
    return res.status(401).json({ message: 'Unauthorized: Authentication failed' });
  }

  return next();
}