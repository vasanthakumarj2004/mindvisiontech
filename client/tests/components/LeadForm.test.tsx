import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LeadForm } from '@/components/LeadForm';

describe('LeadForm Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // jsdom doesn't implement window.open — stub it to prevent unhandled errors
    vi.stubGlobal('open', vi.fn());
  });

  it('should render form input fields and submit buttons', () => {
    render(<LeadForm />);

    expect(screen.getByPlaceholderText(/your full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/\+91 98765 43210/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start a conversation/i })).toBeInTheDocument();
  });

  it('should show error message when submitting empty required fields', async () => {
    render(<LeadForm />);

    const submitBtn = screen.getByRole('button', { name: /start a conversation/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/please enter your name/i)).toBeInTheDocument();
  });

  it('should submit form successfully when inputs are valid', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Your enquiry has been received.' }),
    } as Response);

    render(<LeadForm />);

    fireEvent.change(screen.getByPlaceholderText(/your full name/i), { target: { value: 'Alex Smith' } });
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), { target: { value: 'alex@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/\+91 98765 43210/i), { target: { value: '9876543210' } });

    const submitBtn = screen.getByRole('button', { name: /start a conversation/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/thank you, alex!/i)).toBeInTheDocument();
    });
  });
});
