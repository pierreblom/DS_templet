import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Modal from '../components/common/Modal';
import { ordersApi } from '../services/api';
import type { Order } from '../types';

const statusOptions = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, pagination.page]);

  const fetchOrders = async () => {
    try {
      const params: Record<string, unknown> = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (statusFilter) params.status = statusFilter;

      const response = await ordersApi.list(params);
      setOrders(response.data.orders || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages,
      }));
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      console.log('Updating order status:', { orderId, newStatus });
      const response = await ordersApi.updateStatus(orderId, newStatus);
      console.log('Status update response:', response.data);

      // Refresh orders list
      await fetchOrders();

      // Update selected order if modal is open
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus as Order['status'] } : null);
      }

      console.log('Order status updated successfully');
    } catch (error: any) {
      console.error('Failed to update order status:', error);
      console.error('Error response:', error.response?.data);
      alert(`Failed to update order status: ${error.response?.data?.error?.message || error.message}`);
    }
  };

  const viewOrderDetails = async (order: Order) => {
    try {
      const response = await ordersApi.get(order.id);
      console.log('Order Details fetched:', response.data);
      setSelectedOrder(response.data);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      setSelectedOrder(order);
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
        title="Orders"
        subtitle={`${pagination.total} total orders`}
        action={
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="input w-40"
          >
            <option value="">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        }
      />

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Order ID</th>
                <th className="table-header">Customer</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Status</th>
                <th className="table-header">Date</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium">#{order.id}</td>
                  <td className="table-cell">
                    <div>
                      <p className="font-medium">
                        {order.User?.name ||
                          (order.shipping_address?.firstName && order.shipping_address?.lastName
                            ? `${order.shipping_address.firstName} ${order.shipping_address.lastName}`
                            : 'Guest Customer')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.User?.email || order.shipping_address?.email || order.shipping_address?.city || 'No email'}
                      </p>
                    </div>
                  </td>
                  <td className="table-cell font-medium">
                    {formatCurrency(Number(order.total_amount))}
                  </td>
                  <td className="table-cell">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium capitalize border-0 cursor-pointer ${statusColors[order.status]}`}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="table-cell text-gray-500">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="table-cell">
                    <button
                      onClick={() => viewOrderDetails(order)}
                      className="text-terracotta hover:underline text-sm"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="table-cell text-center text-gray-400">
                    No orders found
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
              {pagination.total} orders
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

      {/* Order Details Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order #${selectedOrder?.id}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Status */}
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${statusColors[selectedOrder.status]}`}>
                {selectedOrder.status}
              </span>
              <span className="text-gray-500">{formatDate(selectedOrder.created_at)}</span>
            </div>

            {/* Customer Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Shipping Address</h4>
              <p className="text-sm text-gray-600">
                {selectedOrder.shipping_address?.firstName && selectedOrder.shipping_address?.lastName
                  ? `${selectedOrder.shipping_address.firstName} ${selectedOrder.shipping_address.lastName}`
                  : 'Guest Customer'}<br />
                {selectedOrder.shipping_address?.address1}<br />
                {selectedOrder.shipping_address?.address2 && <>{selectedOrder.shipping_address.address2}<br /></>}
                {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} {selectedOrder.shipping_address?.postalCode}<br />
                {selectedOrder.shipping_address?.country}<br />
                <br />
                <strong>Phone:</strong> {selectedOrder.shipping_address?.phone}<br />
                <strong>Email:</strong> {selectedOrder.shipping_address?.email}
              </p>
            </div>

            {/* Supplier Ordering Section */}
            {selectedOrder.OrderItems?.some(item => item.Product?.supplier_url) && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                    <span className="text-lg">📦</span> Supplier Ordering
                  </h4>
                  <button
                    onClick={() => {
                      const urls = selectedOrder.OrderItems
                        ?.filter(item => item.Product?.supplier_url)
                        .map(item => item.Product!.supplier_url) || [];
                      urls.forEach(url => window.open(url, '_blank'));
                    }}
                    className="btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                  >
                    🔗 Open All Supplier Links ({selectedOrder.OrderItems?.filter(item => item.Product?.supplier_url).length})
                  </button>
                </div>
                <div className="space-y-3">
                  {selectedOrder.OrderItems?.filter(item => item.Product?.supplier_url).map((item) => (
                    <div key={item.id} className="bg-white rounded-lg p-3 border border-blue-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {item.Product?.image_url ? (
                          <img
                            src={item.Product.image_url}
                            alt={item.Product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{item.Product?.name}</p>
                          <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">
                              Qty: {item.quantity}
                            </span>
                            {item.size && (
                              <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-medium">
                                Size: {item.size}
                              </span>
                            )}
                            {item.color && (
                              <span className="bg-pink-100 text-pink-800 px-2 py-0.5 rounded font-medium">
                                Color: {item.color}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <a
                        href={item.Product!.supplier_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
                      >
                        🛒 Order from Supplier
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Items Table */}
            <div>
              <h4 className="font-medium mb-2">Order Items</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="table-header">Product</th>
                      <th className="table-header">Size/Color</th>
                      <th className="table-header text-right">Qty</th>
                      <th className="table-header text-right">Price</th>
                      <th className="table-header text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedOrder.OrderItems?.map((item) => (
                      <tr key={item.id}>
                        <td className="table-cell">
                          <div className="flex items-center gap-3">
                            {item.Product?.image_url ? (
                              <img
                                src={item.Product.image_url}
                                alt={item.Product.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-100 rounded" />
                            )}
                            <span>{item.Product?.name || item.product_name}</span>
                          </div>
                        </td>
                        <td className="table-cell text-sm text-gray-600">
                          {item.size && <span className="block">{item.size}</span>}
                          {item.color && <span className="block">{item.color}</span>}
                          {!item.size && !item.color && <span className="text-gray-400">-</span>}
                        </td>
                        <td className="table-cell text-right">{item.quantity}</td>
                        <td className="table-cell text-right">
                          {formatCurrency(Number(item.price))}
                        </td>
                        <td className="table-cell text-right font-medium">
                          {formatCurrency(Number(item.price) * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={4} className="table-cell text-right font-medium">
                        Total
                      </td>
                      <td className="table-cell text-right font-bold">
                        {formatCurrency(Number(selectedOrder.total_amount))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Update Status */}
            <div className="flex items-center gap-4 pt-4 border-t">
              <label className="text-sm font-medium">Update Status:</label>
              <select
                value={selectedOrder.status}
                onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                className="input flex-1"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
