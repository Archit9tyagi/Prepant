import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Login, Signup } from '../pages/auth/AuthForms.js';

describe('auth forms', () => {
  it('renders login and signup controls', () => {
    const { rerender } = render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument();
    rerender(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
    expect(screen.getByText('I agree to the Terms and Privacy Policy.')).toBeInTheDocument();
  });
});
