import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../server.js';
import { env } from '../../config/env.js';
import { Admin } from '../../models/Admin.js';
import { Course } from '../../models/Course.js';
import { Subject } from '../../models/Subject.js';
import { Student } from '../../models/Student.js';
import { PdfMaterial } from '../../models/PdfMaterial.js';

vi.mock('../../models/Admin.js', () => ({
  Admin: {
    findOne: vi.fn(),
  },
}));

vi.mock('../../models/Course.js', () => ({
  Course: {
    find: vi.fn(),
    findById: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

vi.mock('../../models/Subject.js', () => ({
  Subject: {
    find: vi.fn(),
    findById: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    countDocuments: vi.fn(),
    deleteMany: vi.fn(),
  },
}));

vi.mock('../../models/Student.js', () => ({
  Student: {
    find: vi.fn(),
    findById: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    countDocuments: vi.fn(),
    findByIdAndDelete: vi.fn(),
  },
}));

vi.mock('../../models/PdfMaterial.js', () => ({
  PdfMaterial: {
    find: vi.fn(),
    findById: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    countDocuments: vi.fn(),
    deleteMany: vi.fn(),
  },
}));

describe('Admin REST API Endpoints', () => {
  const testSecret = env.jwtSecret || 'mindvisiontech-dev-test-secret-key-at-least-32-chars';
  const validToken = jwt.sign({ id: 'admin-123', role: 'admin' }, testSecret, { expiresIn: '1h' });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/admin/login', () => {
    it('should reject invalid credentials with 401', async () => {
      Admin.findOne.mockReturnValue({
        select: vi.fn().mockResolvedValue(null),
      });

      const response = await request(app)
        .post('/api/admin/login')
        .send({ email: 'admin@test.com', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Invalid email or password' });
    });

    it('should log in successfully with valid credentials and return cookie', async () => {
      const mockAdmin = {
        _id: 'admin-123',
        email: 'admin@test.com',
        role: 'admin',
        verifyPassword: vi.fn().mockResolvedValue(true),
      };

      Admin.findOne.mockReturnValue({
        select: vi.fn().mockResolvedValue(mockAdmin),
      });

      const response = await request(app)
        .post('/api/admin/login')
        .send({ email: 'admin@test.com', password: 'correctpassword' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logged in successfully');
      expect(response.body.data.email).toBe('admin@test.com');
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/admin_token=/);
    });
  });

  describe('GET /api/admin/dashboard', () => {
    it('should return 401 when no token provided', async () => {
      const response = await request(app).get('/api/admin/dashboard');
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Authentication required');
    });

    it('should return dashboard stats when authenticated with Bearer token', async () => {
      Course.countDocuments.mockResolvedValue(6);
      Subject.countDocuments.mockResolvedValue(18);
      Student.countDocuments.mockResolvedValue(42);
      PdfMaterial.countDocuments.mockResolvedValue(12);

      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({
        totalCourses: 6,
        totalSubjects: 18,
        totalStudents: 42,
        totalStudyMaterials: 12,
      });
    });
  });

  describe('GET /api/admin/courses', () => {
    it('should list all courses for admin', async () => {
      const mockCourses = [
        { _id: 'c1', name: 'Course 1', slug: 'course-1', fees: 20000 },
      ];
      Course.find.mockReturnValue({
        sort: vi.fn().mockResolvedValue(mockCourses),
      });

      const response = await request(app)
        .get('/api/admin/courses')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockCourses);
    });
  });

  describe('POST /api/admin/courses', () => {
    it('should create a course with valid payload', async () => {
      Course.findOne.mockResolvedValue(null);
      const createdCourse = {
        _id: 'c2',
        name: 'New Course',
        slug: 'new-course',
        description: 'Course description',
        duration: '3 Months',
        fees: 15000,
        isActive: true,
      };
      Course.create.mockResolvedValue(createdCourse);

      const response = await request(app)
        .post('/api/admin/courses')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          title: 'New Course',
          description: 'Course description',
          duration: '3 Months',
          price: 15000,
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toEqual(createdCourse);
    });
  });

  describe('GET /api/admin/students', () => {
    it('should list students when authenticated', async () => {
      const mockStudents = [
        { _id: 's1', name: 'John Doe', courseFees: 20000, discount: 2000, finalFees: 18000 },
      ];
      Student.find.mockReturnValue({
        populate: vi.fn().mockReturnValue({
          sort: vi.fn().mockResolvedValue(mockStudents),
        }),
      });

      const response = await request(app)
        .get('/api/admin/students')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockStudents);
    });
  });
});
