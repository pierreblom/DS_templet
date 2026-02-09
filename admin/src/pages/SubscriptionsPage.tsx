import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import { subscriptionApi } from '../services/api';
import type { Subscription } from '../types';

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0,
    });

    useEffect(() => {
        fetchSubscriptions();
    }, [pagination.page, filterStatus]);

    const fetchSubscriptions = async () => {
        try {
            const params: any = {
                page: pagination.page,
                limit: pagination.limit,
                offset: (pagination.page - 1) * pagination.limit
            };

            if (filterStatus) params.status = filterStatus;

            const response = await subscriptionApi.list(params);
            const { data, meta } = response.data;

            setSubscriptions(data || []);
            setPagination(prev => ({
                ...prev,
                total: meta.total,
                totalPages: Math.ceil(meta.total / meta.limit),
            }));
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-ZA', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-terracotta border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div>
            <Header
                title="Newsletter Subscriptions"
                subtitle={`${pagination.total} subscribers`}
            />

            <div className="card mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <span className="text-gray-600">Filter by status:</span>
                    <select
                        value={filterStatus}
                        onChange={(e) => {
                            setFilterStatus(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className="input w-full sm:w-40"
                    >
                        <option value="">All</option>
                        <option value="active">Active</option>
                        <option value="unsubscribed">Unsubscribed</option>
                    </select>
                    <div className="flex-1"></div>
                    <button
                        className="btn btn-secondary text-sm"
                        onClick={() => {
                            const csvContent = "data:text/csv;charset=utf-8,"
                                + "Email,Status,Source,Date Joined\n"
                                + subscriptions.map(s => `${s.email},${s.status},${s.source || 'website'},${formatDate(s.created_at)}`).join("\n");
                            const encodedUri = encodeURI(csvContent);
                            const link = document.createElement("a");
                            link.setAttribute("href", encodedUri);
                            link.setAttribute("download", "subscriptions.csv");
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }}
                    >
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="table-header">Email</th>
                                <th className="table-header">Status</th>
                                <th className="table-header">Source</th>
                                <th className="table-header">Date Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {subscriptions.map((sub) => (
                                <tr key={sub.id} className="hover:bg-gray-50">
                                    <td className="table-cell font-medium">{sub.email}</td>
                                    <td className="table-cell">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${sub.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="table-cell text-gray-500">{sub.source || 'website'}</td>
                                    <td className="table-cell text-gray-500">
                                        {formatDate(sub.created_at)}
                                    </td>
                                </tr>
                            ))}
                            {subscriptions.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="table-cell text-center text-gray-400">
                                        No subscriptions found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                            {pagination.total} entries
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page === 1}
                                className="btn btn-secondary disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page === pagination.totalPages}
                                className="btn btn-secondary disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
