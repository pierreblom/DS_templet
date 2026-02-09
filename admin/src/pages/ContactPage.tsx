import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import { contactApi } from '../services/api';
import type { ContactSubmission } from '../types';

export default function ContactPage() {
    const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });

    useEffect(() => {
        fetchSubmissions();
    }, [pagination.page]);

    const fetchSubmissions = async () => {
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                offset: (pagination.page - 1) * pagination.limit
            };

            const response = await contactApi.list(params);
            const { data, meta } = response.data;

            setSubmissions(data || []);
            setPagination(prev => ({
                ...prev,
                total: meta.total,
                totalPages: Math.ceil(meta.total / meta.limit),
            }));
        } catch (error) {
            console.error('Failed to fetch contact submissions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-ZA', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-800';
            case 'read': return 'bg-gray-100 text-gray-800';
            case 'responded': return 'bg-green-100 text-green-800';
            case 'archived': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
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
                title="Contact Submissions"
                subtitle={`${pagination.total} messages received`}
            />

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="table-header">Date</th>
                                <th className="table-header">Name & Contact</th>
                                <th className="table-header w-1/3">Message</th>
                                <th className="table-header">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {submissions.map((submission) => (
                                <tr key={submission.id} className="hover:bg-gray-50">
                                    <td className="table-cell whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(submission.created_at)}
                                    </td>
                                    <td className="table-cell">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{submission.name}</span>
                                            <span className="text-sm text-gray-500">{submission.email}</span>
                                            {submission.phone && <span className="text-xs text-gray-400">{submission.phone}</span>}
                                        </div>
                                    </td>
                                    <td className="table-cell">
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap max-h-24 overflow-y-auto">
                                            {submission.message || '-'}
                                        </p>
                                    </td>
                                    <td className="table-cell">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(submission.status)}`}>
                                            {submission.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {submissions.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="table-cell text-center text-gray-400">
                                        No submissions found
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
