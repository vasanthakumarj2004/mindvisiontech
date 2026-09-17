import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../server.js';

// Mock services to isolate API route & controller testing
vi.mock('../../services/courseService.js', () => ({
  listCourses: vi.fn(),
  getCourseBySlug: vi.fn(),
}));

vi.mock('../../services/branchService.js', () => ({
  listBranches: vi.fn(),
}));

vi.mock('../../services/leadService.js', () => ({
  createLead: vi.fn(),
}));

import { listCourses, getCourseBySlug } from '../../services/courseService.js';
import { listBranches } from '../../services/branchService.js';
import { createLead } from '../../services/leadService.js';

describe('Server REST API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('should return 200 OK with status ok', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('GET /api/courses', () => {
    it('should return 200 and list of courses', async () => {
      const mockCourses = [
        { _id: '1', name: 'Embedded Systems', slug: 'embedded-systems' },
        { _id: '2', name: 'Python Full Stack', slug: 'python-full-stack' },
      ];
      listCourses.mockResolvedValue(mockCourses);

      const response = await request(app).get('/api/courses');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: mockCourses });
      expect(listCourses).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/courses/:slug', () => {
    it('should return 200 and single course when found', async () => {
      const mockCourse = { _id: '1', name: 'Embedded Systems', slug: 'embedded-systems' };
      getCourseBySlug.mockResolvedValue(mockCourse);

      const response = await request(app).get('/api/courses/embedded-systems');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: mockCourse });
      expect(getCourseBySlug).toHaveBeenCalledWith('embedded-systems');
    });

    it('should return 404 when course is not found', async () => {
      getCourseBySlug.mockResolvedValue(null);

      const response = await request(app).get('/api/courses/non-existent-course');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Course not found' });
    });
  });

  describe('GET /api/branches', () => {
    it('should return 200 and list of branches', async () => {
      const mockBranches = [
        { _id: 'b1', name: 'Coimbatore HQ', city: 'Coimbatore' },
      ];
      listBranches.mockResolvedValue(mockBranches);

      const response = await request(app).get('/api/branches');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: mockBranches });
    });
  });

  describe('POST /api/leads', () => {
    it('should validate missing required fields and return 422', async () => {
      const response = await request(app)
        .post('/api/leads')
        .send({ name: 'John' }); // missing email and phone

      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty('errors');
    });

    it('should validate invalid email and return 422', async () => {
      const response = await request(app)
        .post('/api/leads')
        .send({ name: 'John', email: 'invalid-email', phone: '9876543210' });

      expect(response.status).toBe(422);
      expect(response.body.errors.some((err) => err.path === 'email')).toBe(true);
    });

    it('should submit lead successfully and return 201', async () => {
      const leadPayload = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '9876543210',
        message: 'Interested in Embedded Systems',
      };
      createLead.mockResolvedValue({ _id: 'lead-123', ...leadPayload });

      const response = await request(app)
        .post('/api/leads')
        .send(leadPayload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Your enquiry has been received.');
      expect(response.body.data).toHaveProperty('_id', 'lead-123');
    });
  });
});
