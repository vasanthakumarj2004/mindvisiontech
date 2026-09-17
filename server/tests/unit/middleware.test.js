import { describe, it, expect, vi } from 'vitest';
import { errorHandler } from '../../middleware/errorHandler.js';

describe('Middleware Unit Tests', () => {
  describe('errorHandler', () => {
    it('should handle custom error status and message', () => {
      const err = new Error('Custom Error');
      err.statusCode = 400;

      const req = {};
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Custom Error' });

      consoleSpy.mockRestore();
    });

    it('should default to status 500 and generic message', () => {
      const err = new Error();

      const req = {};
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });

      consoleSpy.mockRestore();
    });
  });
});
