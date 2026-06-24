import { render, screen } from '@testing-library/react';
import LoginPage from '../pages/Login/LoginPage';

describe('Smoke test', () => {
  it('renders the login page', () => {
    render(<LoginPage onLoginSuccess={() => {}} />);
    expect(screen.getByRole('heading', { name: /logg inn/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/fødselsnummer/i)).toBeInTheDocument();
  });
});
