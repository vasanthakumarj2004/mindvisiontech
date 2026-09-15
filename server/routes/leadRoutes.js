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
  [body('name').trim().notEmpty(), body('email').isEmail(), body('phone').trim().notEmpty()],
  validate,
  postLead
);
export default router;