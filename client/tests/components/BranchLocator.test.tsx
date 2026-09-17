import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BranchLocator } from '@/components/BranchLocator';
import type { Branch } from '@/lib/api';

describe('BranchLocator Component', () => {
  const mockBranches: Branch[] = [
    {
      _id: 'b1',
      name: 'Coimbatore Campus (HQ)',
      city: 'Coimbatore',
      address: '56, 472, Marudhamalai Road, P N Pudur, Coimbatore, Tamil Nadu - 641041',
      phone: '+91 93443 52881',
    },
    {
      _id: 'b2',
      name: 'Chennai Tech Hub',
      city: 'Chennai',
      address: '12, OMR Road, Guindy, Chennai, Tamil Nadu - 600032',
      phone: '+91 98765 43210',
    },
  ];

  it('should render all branch names, cities, and addresses', () => {
    render(<BranchLocator branches={mockBranches} />);

    expect(screen.getByText('Coimbatore Campus (HQ)')).toBeInTheDocument();
    expect(screen.getByText(/56, 472, Marudhamalai Road/i)).toBeInTheDocument();
    expect(screen.getByText('Chennai Tech Hub')).toBeInTheDocument();
    expect(screen.getByText(/OMR Road/i)).toBeInTheDocument();
  });

  it('should render direct phone call links for each branch', () => {
    render(<BranchLocator branches={mockBranches} />);

    const coimbatoreCallLink = screen.getByRole('link', { name: /Call Coimbatore Campus \(HQ\)/i });
    expect(coimbatoreCallLink).toHaveAttribute('href', 'tel:+91 93443 52881');

    const chennaiCallLink = screen.getByRole('link', { name: /Call Chennai Tech Hub/i });
    expect(chennaiCallLink).toHaveAttribute('href', 'tel:+91 98765 43210');
  });
});
