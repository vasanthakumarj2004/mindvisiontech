import { describe, it, expect } from 'vitest';
import { getBlogPost, blogCategories } from '@/lib/blog';

describe('Blog Utility Functions', () => {
  it('should retrieve a blog post by valid slug', () => {
    const post = getBlogPost('getting-started-with-stm32');
    expect(post).toBeDefined();
    expect(post?.title).toBe('Getting Started with STM32: A Practical First Project');
    expect(post?.category).toBe('Embedded Systems');
  });

  it('should return undefined for invalid slug', () => {
    const post = getBlogPost('non-existent-blog-post');
    expect(post).toBeUndefined();
  });

  it('should contain expected categories', () => {
    expect(blogCategories).toContain('All');
    expect(blogCategories).toContain('Embedded Systems');
    expect(blogCategories).toContain('AI & ML');
  });
});
