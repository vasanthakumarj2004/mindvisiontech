import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCourseBySlug } from '@/lib/course';

describe('Course Library Utilities', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should return course from API when API fetch succeeds', async () => {
    const mockCourse = {
      _id: 'c1',
      name: 'Embedded Systems',
      slug: 'embedded-systems',
      description: 'Master embedded C',
      duration: '6 months',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockCourse }),
    } as Response);

    const result = await getCourseBySlug('embedded-systems');
    expect(result).toEqual(mockCourse);
  });

  it('should fallback to local course data when API fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const result = await getCourseBySlug('embedded-systems');
    expect(result).toBeDefined();
    expect(result?.slug).toBe('embedded-systems');
    expect(result?.name).toBe('Embedded Systems');
  });

  it('should return null if course slug does not exist in API or fallback data', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const result = await getCourseBySlug('unknown-slug-xyz');
    expect(result).toBeNull();
  });
});
