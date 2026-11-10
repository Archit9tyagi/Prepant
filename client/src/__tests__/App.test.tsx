import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App.js';

describe('Prepant Client App', () => {
  it('renders without crashing and displays the Prepant brand', async () => {
    render(<App />);
    const brandElements = await screen.findAllByText(/Prep/i);
    expect(brandElements.length).toBeGreaterThan(0);
  });
});
