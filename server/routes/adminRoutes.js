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
  listSubjects,
  createSubject,
  updateSubject,
  deleteSubject
} from '../controllers/adminSubjectController.js';
import {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent
} from '../controllers/adminStudentController.js';
import {
  listPdfs,
  uploadPdf,
  updatePdf,
  deletePdf
} from '../controllers/adminPdfController.js';

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
      const err = new Error('Only PDF files are accepted');
      err.status = 400;
      cb(err, false);
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
  body('name')
    .custom((val, { req }) => {
      const name = val || req.body.title;
      if (!name || !name.trim()) throw new Error('Course name or title is required');
      return true;
    }),
  body('slug')
    .optional()
    .trim()
    .toLowerCase(),
  body('description').notEmpty().trim().withMessage('Description is required'),
  body('duration').notEmpty().trim().withMessage('Duration is required'),
  body('fees')
    .custom((val, { req }) => {
      const price = val !== undefined ? val : req.body.price;
      if (price === undefined || isNaN(Number(price))) throw new Error('Fees or price must be a valid number');
      return true;
    })
];

const courseUpdateValidation = [
  body('name').optional().notEmpty().trim().withMessage('Name cannot be empty'),
  body('title').optional().notEmpty().trim().withMessage('Title cannot be empty'),
  body('slug').optional().notEmpty().trim().toLowerCase().withMessage('Slug cannot be empty'),
  body('fees').optional().isNumeric().withMessage('Fees must be a number'),
  body('price').optional().isNumeric().withMessage('Price must be a number')
];

const subjectValidation = [
  body('name').notEmpty().trim().withMessage('Subject name is required'),
  body('order').optional().isNumeric().withMessage('Order must be a number')
];

const studentValidation = [
  body('name').notEmpty().trim().withMessage('Student name is required'),
  body('course').notEmpty().trim().withMessage('Course is required'),
  body('courseFees').isNumeric().withMessage('Course fees must be a number'),
  body('discount').optional().isNumeric().withMessage('Discount must be a number')
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

// Subjects CRUD
router.get('/courses/:courseId/subjects', listSubjects);
router.post('/courses/:courseId/subjects', subjectValidation, validate, createSubject);
router.put('/courses/:courseId/subjects/:subjectId', subjectValidation, validate, updateSubject);
router.delete('/courses/:courseId/subjects/:subjectId', deleteSubject);

// Students CRUD
router.get('/students', listStudents);
router.get('/students/:id', getStudent);
router.post('/students', studentValidation, validate, createStudent);
router.put('/students/:id', studentValidation, validate, updateStudent);
router.delete('/students/:id', deleteStudent);

// PDFs scoped to a subject
// Note: express-validator body() doesn't work with multipart/form-data,
// so title validation is handled manually in the controller.
router.get('/subjects/:subjectId/pdfs', listPdfs);
router.post('/subjects/:subjectId/pdfs', pdfUpload.single('file'), uploadPdf);
router.put('/subjects/:subjectId/pdfs/:pdfId', pdfUpload.single('file'), updatePdf);
router.delete('/subjects/:subjectId/pdfs/:pdfId', deletePdf);

export default router;
