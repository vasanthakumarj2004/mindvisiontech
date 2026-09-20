import { describe, it, expect } from 'vitest';
import { formatPhone } from '../../utils/format.js';

describe('formatPhone utility', () => {
  it('should strip all non-digit and non-plus characters', () => {
    expect(formatPhone('+91 93443-52881')).toBe('+919344352881');
    expect(formatPhone('(123) 456-7890')).toBe('1234567890');
  });

  it('should preserve + sign at start', () => {
    expect(formatPhone('+1-800-555-0199')).toBe('+18005550199');
  });

  it('should return empty string if no digits present', () => {
    expect(formatPhone('abc-def')).toBe('');
  });
});
