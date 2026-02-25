import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';
import { AuthContext } from '../../context/AuthContext';
import { vi } from 'vitest';

describe('LoginPage', () => {
    const mockLogin = vi.fn();

    const renderWithProviders = (authProps = {}) => {
        return render(
            <BrowserRouter>
                <AuthContext.Provider value={{
                    isAuthenticated: false,
                    isLoading: false,
                    user: null,
                    login: mockLogin,
                    logout: vi.fn(),
                    error: null,
                    ...authProps
                }}>
                    <LoginPage />
                </AuthContext.Provider>
            </BrowserRouter>
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders login form correctly', () => {
        renderWithProviders();
        expect(screen.getByRole('heading', { level: 2, name: /Sign in to your account/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument();
    });

    it('displays error message when provided via context', () => {
        renderWithProviders({ error: 'Invalid credentials' });
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    it('calls login function on form submit', async () => {
        renderWithProviders();

        const emailInput = screen.getByLabelText(/Email address/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const submitBtn = screen.getByRole('button', { name: /Sign in/i });

        fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('admin@test.com', 'password123');
        });
    });

    it('shows loading state during submission', async () => {
        // Mock login to return a promise that never resolves to keep the loading state
        mockLogin.mockImplementation(() => new Promise(() => { }));

        renderWithProviders();
        const submitBtn = screen.getByRole('button', { name: /Sign in/i });

        fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'test@test.com' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'pw' } });
        fireEvent.click(submitBtn);

        expect(screen.getByText(/Signing in.../i)).toBeInTheDocument();
        expect(submitBtn).toBeDisabled();
    });
});
