import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { postLead } from '../controllers/leadController.js';
import { validate } from '../middleware/validation.js';

const leadSubmissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Max 10 enquiries per hour per IP to prevent spam bots
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many enquiries submitted from this IP. Please try again after an hour.' }
});

const router = Router();
router.post(
  '/',
  leadSubmissionLimiter,
  [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters')
      .escape(),
    body('email')
      .trim()
      .isEmail().withMessage('Valid email address is required')
      .normalizeEmail(),
    body('phone')
      .trim()
      .notEmpty().withMessage('Phone number is required')
      .isLength({ min: 10, max: 20 }).withMessage('Phone number must be between 10 and 20 digits'),
    body('message')
      .optional()
      .trim()
      .isLength({ max: 1000 }).withMessage('Message cannot exceed 1000 characters')
      .escape(),
    body('course').optional().isMongoId().withMessage('Invalid course ID'),
    body('branch').optional().isMongoId().withMessage('Invalid branch ID')
  ],
  validate,
  postLead
);
export default router;