import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from '../DashboardPage';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { analyticsApi, ordersApi } from '../../services/api';

// Mock the API calls
vi.mock('../../services/api', () => ({
    analyticsApi: {
        dashboard: vi.fn(),
        orders: vi.fn(),
        sales: vi.fn()
    },
    ordersApi: {
        list: vi.fn()
    }
}));

describe('DashboardPage', () => {
    const mockSummaryData = {
        period: 'Last 30 days',
        revenue: 15000,
        pendingRevenue: 2000,
        orders: 45,
        customers: 120,
        products: 50
    };

    const mockOrderStats = {
        byStatus: {
            pending: 5,
            paid: 30,
            shipped: 8,
            delivered: 2
        },
        readyToShip: 8,
        recentOrders: 3
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Set up default mock resolutions
        (analyticsApi.dashboard as any).mockResolvedValue({ data: mockSummaryData });
        (analyticsApi.orders as any).mockResolvedValue({ data: mockOrderStats });
        (analyticsApi.sales as any).mockResolvedValue({ data: { dailyData: [] } });
        (ordersApi.list as any).mockResolvedValue({ data: { orders: [] } });
    });

    const renderDashboard = () => render(
        <BrowserRouter>
            <DashboardPage />
        </BrowserRouter>
    );

    it('renders loading state initially', () => {
        // Delay the resolved values to see the spinner
        (analyticsApi.dashboard as any).mockImplementation(() => new Promise(() => { }));

        renderDashboard();

        // The spinner div doesn't have an explicit ARIA role, but it's an animate-spin div
        // We can just assert that nothing else has loaded yet
        expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });

    it('renders stats cards with fetched data', async () => {
        renderDashboard();

        // Wait for the Dashboard header to appear (meaning loading finished)
        await waitFor(() => {
            expect(screen.getByText('Dashboard')).toBeInTheDocument();
        });

        // Verify stats from mock summary data
        expect(screen.getByText('Last 30 days')).toBeInTheDocument();

        // Revenue formatted as currency (Intl.NumberFormat behavior varies in Node vs Browser)
        const textContent = document.body.textContent || '';
        expect(textContent).toMatch(/15[,\s]*000/);
        expect(textContent).toMatch(/2[,\s]*000/);

        // Other numerical stats
        // screen.getByText won't work well for raw numbers like "45" because it matches exactly, 
        // and there might be multiple "45"s. We can use expect to find the text nodes.
        const allText = document.body.textContent;
        expect(allText).toContain('45'); // orders
        expect(allText).toContain('120'); // customers
        expect(allText).toContain('50'); // products
    });

    it('renders "No orders yet" when order list is empty', async () => {
        renderDashboard();

        await waitFor(() => {
            expect(screen.getByText('No orders yet')).toBeInTheDocument();
        });
    });
});
