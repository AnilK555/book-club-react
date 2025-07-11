import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from './Login';
import { AuthProvider } from './AuthProvider';

describe('Login Component', () => {
  const renderComponent = (props = {}) => {
    const defaultProps = {
      setExistingUser: vi.fn(),
      ...props,
    };

    return render(
      <AuthProvider>
        <Login {...defaultProps} />
      </AuthProvider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render login form with all required fields', () => {
      renderComponent();

      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(document.querySelector('input[type="password"]')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });

    it('should render email input with correct type', () => {
      renderComponent();

      const emailInput = screen.getByRole('textbox');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toBeRequired();
    });

    it('should render password input with correct type', () => {
      renderComponent();

      const passwordInput = document.querySelector('input[type="password"]');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toBeRequired();
    });
  });

  describe('User Interactions', () => {
    it('should update email input value when user types', () => {
      renderComponent();

      const emailInput = screen.getByRole('textbox');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should update password input value when user types', () => {
      renderComponent();

      const passwordInput = document.querySelector('input[type="password"]');
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(passwordInput).toHaveValue('password123');
    });

    it('should call setExistingUser when signup button is clicked', () => {
      const mockSetExistingUser = vi.fn();
      renderComponent({ setExistingUser: mockSetExistingUser });

      const signupButton = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(signupButton);

      expect(mockSetExistingUser).toHaveBeenCalledWith(false);
    });
  });

  describe('Form Submission', () => {
    it('should prevent form submission when email is empty', () => {
      renderComponent();

      const passwordInput = document.querySelector('input[type="password"]');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      expect(fetch).not.toHaveBeenCalled();
    });

    it('should prevent form submission when password is empty', () => {
      renderComponent();

      const emailInput = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      expect(fetch).not.toHaveBeenCalled();
    });

    it('should prevent form submission when both fields are empty', () => {
      renderComponent();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      expect(fetch).not.toHaveBeenCalled();
    });

    it('should prevent form submission when fields contain only whitespace', () => {
      renderComponent();

      const emailInput = screen.getByRole('textbox');
      const passwordInput = document.querySelector('input[type="password"]');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: '   ' } });
      fireEvent.change(passwordInput, { target: { value: '   ' } });
      fireEvent.click(submitButton);

      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('API Integration', () => {
    it('should make API call with correct data when form is submitted with valid inputs', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: 'fake-token',
          message: 'Login successful',
          user: { id: 1, email: 'test@example.com' },
        }),
      });

      renderComponent();

      const emailInput = screen.getByRole('textbox');
      const passwordInput = document.querySelector('input[type="password"]');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });
    });

    it('should store token in localStorage on successful login', async () => {
      const mockResponse = {
        token: 'fake-auth-token',
        message: 'Login successful',
        user: { id: 1, email: 'test@example.com' },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      renderComponent();

      const emailInput = screen.getByRole('textbox');
      const passwordInput = document.querySelector('input[type="password"]');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith('authToken', 'fake-auth-token');
      });
    });

    it('should not store token when login response is missing token', async () => {
      const mockResponse = {
        message: 'Login failed',
        user: null,
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      renderComponent();

      const emailInput = screen.getByRole('textbox');
      const passwordInput = document.querySelector('input[type="password"]');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(localStorage.setItem).not.toHaveBeenCalled();
      });
    });

    it('should not store token when login message is not "Login successful"', async () => {
      const mockResponse = {
        token: 'fake-token',
        message: 'Invalid credentials',
        user: null,
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      renderComponent();

      const emailInput = screen.getByRole('textbox');
      const passwordInput = document.querySelector('input[type="password"]');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(localStorage.setItem).not.toHaveBeenCalled();
      });
    });

    it('should handle API errors gracefully', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      renderComponent();

      const emailInput = screen.getByRole('textbox');
      const passwordInput = document.querySelector('input[type="password"]');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(localStorage.setItem).not.toHaveBeenCalled();
      });
    });
  });

  describe('Form Behavior', () => {
    it('should maintain form values after failed submission', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      renderComponent();

      const emailInput = screen.getByRole('textbox');
      const passwordInput = document.querySelector('input[type="password"]');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('wrongpassword');
      });
    });
  });
});
