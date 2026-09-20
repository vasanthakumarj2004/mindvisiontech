import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CourseCard } from '@/components/CourseCard';
import type { Course } from '@/lib/api';

describe('CourseCard Component', () => {
  const mockCourse: Course = {
    _id: 'c1',
    name: 'Embedded Systems',
    slug: 'embedded-systems',
    category: 'Electrical & Electronics',
    description: 'Master 8-bit, 16-bit, and 32-bit microcontrollers, RTOS',
    duration: '6 months',
    fees: 50000,
    topics: ['8051', 'STM32', 'Embedded C'],
  };

  it('should render course details correctly', () => {
    render(<CourseCard course={mockCourse} index={0} />);

    expect(screen.getByText('Embedded Systems')).toBeInTheDocument();
    expect(screen.getByText(/Electrical & Electronics/i)).toBeInTheDocument();
    expect(screen.getByText(/6 months/i)).toBeInTheDocument();
    expect(screen.getByText('8051')).toBeInTheDocument();
    expect(screen.getByText('STM32')).toBeInTheDocument();
    expect(screen.getByText('Embedded C')).toBeInTheDocument();
  });

  it('should render link to course detail page', () => {
    render(<CourseCard course={mockCourse} index={0} />);

    const link = screen.getByRole('link', { name: /explore course/i });
    expect(link).toHaveAttribute('href', '/courses/embedded-systems');
  });
});
