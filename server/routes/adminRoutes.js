import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import cookieParser from 'cookie-parser';
import multer from 'multer';

import { validate } from '../middleware/validation.js';
import { requireAdminAuth } from '../middleware/adminAuth.js';
import { login, logout } from '../controllers/adminAuthController.js';
import { getDashboardStats } from '../controllers/adminDashboardController.js';
import {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse
} from '../controllers/adminCourseController.js';
import {
  listTracks,
  listPdfs,
  uploadPdf,
  replacePdf,
  deletePdf
} from '../controllers/adminInternshipController.js';

const router = Router();

// ── Parse cookies (admin routes only) ──────────────────────────────────────
router.use(cookieParser());

// ── Multer: buffer storage, PDF only, 10 MB max ────────────────────────────
const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter(_req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are accepted'), false);
    }
  }
});

// ── Brute-force protection on login ────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts, please try again in 15 minutes.' }
});

// ── Validation schemas ─────────────────────────────────────────────────────
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
];

const courseValidation = [
  body('name').notEmpty().trim().withMessage('Course name is required'),
  body('slug').notEmpty().trim().toLowerCase().withMessage('Slug is required'),
  body('description').notEmpty().trim().withMessage('Description is required'),
  body('duration').notEmpty().trim().withMessage('Duration is required'),
  body('fees').isNumeric().withMessage('Fees must be a number')
];

const courseUpdateValidation = [
  body('name').optional().notEmpty().trim().withMessage('Name cannot be empty'),
  body('slug').optional().notEmpty().trim().toLowerCase().withMessage('Slug cannot be empty'),
  body('fees').optional().isNumeric().withMessage('Fees must be a number')
];

const pdfTitleValidation = [
  body('title').optional().notEmpty().trim().withMessage('Title cannot be empty if provided')
];

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────
router.post('/login', loginLimiter, loginValidation, validate, login);
router.post('/logout', logout);

// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED — all routes below require a valid admin JWT
// ─────────────────────────────────────────────────────────────────────────────
router.use(requireAdminAuth);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Courses CRUD
router.get('/courses', listCourses);
router.get('/courses/:id', getCourse);
router.post('/courses', courseValidation, validate, createCourse);
router.put('/courses/:id', courseUpdateValidation, validate, updateCourse);
router.delete('/courses/:id', deleteCourse);

// Internship tracks
router.get('/internships', listTracks);

// PDFs scoped to a track
router.get('/internships/:trackId/pdfs', listPdfs);
router.post('/internships/:trackId/pdfs', pdfUpload.single('file'), pdfTitleValidation, validate, uploadPdf);
router.put('/internships/:trackId/pdfs/:pdfId', pdfUpload.single('file'), pdfTitleValidation, validate, replacePdf);
router.delete('/internships/:trackId/pdfs/:pdfId', deletePdf);

export default router;
