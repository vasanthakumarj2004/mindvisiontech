import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';
import { env } from '../config/env.js';

const COOKIE_NAME = 'admin_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.isProduction,   // HTTPS-only in prod
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
};

/**
 * POST /api/admin/login
 */
export async function login(req, res) {
  const { email, password } = req.body;

  // Fetch admin + include passwordHash (select: false)
  const admin = await Admin.findOne({ email: email?.toLowerCase()?.trim() }).select('+passwordHash');
  if (!admin) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const valid = await admin.verifyPassword(password);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: admin._id, role: admin.role },
    env.jwtSecret,
    { expiresIn: '7d' }
  );

  res
    .cookie(COOKIE_NAME, token, COOKIE_OPTIONS)
    .json({
      message: 'Logged in successfully',
      data: { id: admin._id, email: admin.email, role: admin.role }
    });
}

/**
 * POST /api/admin/logout
 */
export function logout(_req, res) {
  res
    .clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: 'strict', secure: env.isProduction })
    .json({ message: 'Logged out successfully' });
}
