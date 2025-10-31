import React, { useState, useEffect, useMemo } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Eye, RefreshCw, MoreHorizontal, X, AlertTriangle, ShoppingBag, Filter, Calendar } from "lucide-react";
import api from "../../api";
import "./AdminTableDesign.css";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

function OrdersOverview() {
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]); // Store all orders for filtering
  const [loading, setLoading] = useState(true);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    paymentMethod: 'all',
    paymentStatus: 'all',
    searchTerm: ''
  });

  // Handle viewing order details
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setViewModalOpen(true);
  };

  // Cancel order function
  const cancelOrder = async (orderId) => {
    setCancellingOrder(orderId);
    try {
      const response = await api.post(`/orders-test/${orderId}/cancel`);
      
      if (response.data.success || response.status === 200) {
        console.log('Order cancelled:', response.data);
        // Refresh orders list
        await fetchOrders();
        alert('Order cancelled successfully!');
      } else {
        alert(`Failed to cancel order: ${response.data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      alert(`Error cancelling order: ${errorMessage}`);
    } finally {
      setCancellingOrder(null);
      setCancelDialogOpen(false);
      setOrderToCancel(null);
    }
  };

  // Get payment method badge
  const getPaymentMethodBadge = (paymentMethod, paymentStatus) => {
    const isPaid = paymentStatus === 'paid';
    const methodColors = {
      'COD': 'bg-gray-100 text-gray-800 border-gray-200',
      'GCASH': 'bg-green-100 text-green-800 border-green-200',
      'PAYMAYA': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    
    return (
      <Badge 
        variant="outline"
        className={`${methodColors[paymentMethod?.toUpperCase()] || 'bg-gray-100 text-gray-800 border-gray-200'} text-xs`}
      >
        {paymentMethod?.toUpperCase() || 'COD'} {isPaid ? '✓' : '⏳'}
      </Badge>
    );
  };

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      console.log('Fetching all orders from API...');
      
      try {
        // Use the api instance for proper authentication
        const response = await api.get('/orders-test');
        const data = response.data;
        
        console.log('Orders data received:', data);
        console.log('Total orders fetched:', Array.isArray(data) ? data.length : 'Not an array');
        
        if (Array.isArray(data) && data.length > 0) {
          setAllOrders(data);
          setOrders(data);
          return;
        } else if (Array.isArray(data)) {
          // Empty array is valid
          setAllOrders([]);
          setOrders([]);
          return;
        }
      } catch (apiError) {
        console.error('API error fetching orders:', apiError);
        if (apiError.response) {
          console.error('Response status:', apiError.response.status);
          console.error('Response data:', apiError.response.data);
        }
      }
      
      // Fallback to mock data if API is not available
      console.log('Falling back to mock data');
      const mockData = [
        { id: 'ORD001', customer: 'John Doe', date: '2024-01-15', amount: '₱500.00', status: 'Pending', items: 2, paymentMethod: 'COD', paymentStatus: 'pending', canCancel: true },
        { id: 'ORD002', customer: 'Jane Smith', date: '2024-01-14', amount: '₱750.00', status: 'Processing', items: 1, paymentMethod: 'GCASH', paymentStatus: 'paid', canCancel: false },
        { id: 'ORD003', customer: 'Bob Johnson', date: '2024-01-13', amount: '₱1,200.00', status: 'Shipped', items: 3, paymentMethod: 'PAYMAYA', paymentStatus: 'paid', canCancel: false },
        { id: 'ORD004', customer: 'Alice Brown', date: '2024-01-12', amount: '₱300.00', status: 'Delivered', items: 1, paymentMethod: 'COD', paymentStatus: 'paid', canCancel: false },
        { id: 'ORD005', customer: 'Charlie Wilson', date: '2024-01-11', amount: '₱900.00', status: 'Cancelled', items: 2, paymentMethod: 'GCASH', paymentStatus: 'cancelled', canCancel: false },
        { id: 'ORD006', customer: 'Gio Mc Gre Calugas', date: '2024-01-10', amount: '₱1,500.00', status: 'Delivered', items: 4, paymentMethod: 'GCASH', paymentStatus: 'paid', canCancel: false }
      ];
      
      setAllOrders(mockData);
      setOrders(mockData);
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      console.error('Error details:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...allOrders];

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(order => 
        order.status.toLowerCase() === filters.status.toLowerCase()
      );
    }

    // Filter by payment method
    if (filters.paymentMethod !== 'all') {
      filtered = filtered.filter(order => 
        order.paymentMethod?.toUpperCase() === filters.paymentMethod.toUpperCase()
      );
    }

    // Filter by payment status
    if (filters.paymentStatus !== 'all') {
      filtered = filtered.filter(order => 
        order.paymentStatus?.toLowerCase() === filters.paymentStatus.toLowerCase()
      );
    }

    // Filter by search term (Order ID, Customer name)
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.id?.toLowerCase().includes(searchLower) ||
        order.customer?.toLowerCase().includes(searchLower)
      );
    }

    setOrders(filtered);
  }, [filters, allOrders]);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: 'all',
      paymentMethod: 'all',
      paymentStatus: 'all',
      searchTerm: ''
    });
  };

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.paymentMethod !== 'all') count++;
    if (filters.paymentStatus !== 'all') count++;
    if (filters.searchTerm) count++;
    return count;
  }, [filters]);
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="admin-table-container">
          <div className="admin-table-loading">
            <div className="admin-table-loading-spinner"></div>
            <span>Loading orders...</span>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0 && !loading) {
    return (
      <div className="space-y-6">
        <div className="admin-table-container">
          <div className="admin-table-header">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-xl shadow-lg">
                <ShoppingBag className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="admin-table-title">Order Management</h1>
                <p className="admin-table-description">
              View and manage all customer orders
            </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 flex-wrap">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="admin-table-filter-btn bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white hover:from-[#8f674a] hover:to-[#6a4c34] relative"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filter Orders
                    {activeFilterCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-white border border-[#d5bfae] shadow-xl rounded-lg p-4 z-50">
                  <div className="space-y-4">
                    {/* Search */}
                    <div>
                      <label className="block text-sm font-semibold text-[#5c3d28] mb-2">
                        Search Orders
                      </label>
                      <input
                        type="text"
                        placeholder="Search by Order ID or Customer..."
                        value={filters.searchTerm}
                        onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-[#d5bfae] rounded-lg text-sm text-[#5c3d28] focus:border-[#a4785a] focus:ring-2 focus:ring-[#a4785a]/20 transition-all duration-200"
                      />
                    </div>

                    {/* Order Status Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-[#5c3d28] mb-2">
                        Order Status
                      </label>
                      <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-[#d5bfae] rounded-lg text-sm text-[#5c3d28] bg-white focus:border-[#a4785a] focus:ring-2 focus:ring-[#a4785a]/20 transition-all duration-200"
                      >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    {/* Payment Method Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-[#5c3d28] mb-2">
                        Payment Method
                      </label>
                      <select
                        value={filters.paymentMethod}
                        onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-[#d5bfae] rounded-lg text-sm text-[#5c3d28] bg-white focus:border-[#a4785a] focus:ring-2 focus:ring-[#a4785a]/20 transition-all duration-200"
                      >
                        <option value="all">All Payment Methods</option>
                        <option value="COD">Cash on Delivery (COD)</option>
                        <option value="GCASH">GCash</option>
                        <option value="PAYMAYA">PayMaya</option>
                      </select>
                    </div>

                    {/* Payment Status Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-[#5c3d28] mb-2">
                        Payment Status
                      </label>
                      <select
                        value={filters.paymentStatus}
                        onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-[#d5bfae] rounded-lg text-sm text-[#5c3d28] bg-white focus:border-[#a4785a] focus:ring-2 focus:ring-[#a4785a]/20 transition-all duration-200"
                      >
                        <option value="all">All Payment Statuses</option>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    {/* Active Filters Display */}
                    {activeFilterCount > 0 && (
                      <div className="bg-gradient-to-r from-[#faf9f8] to-[#fff4ea] rounded-lg p-3 border border-[#e5ded7]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-[#5c3d28]">Active Filters:</span>
                          <button
                            onClick={resetFilters}
                            className="text-xs text-[#a4785a] hover:text-[#7b5a3b] font-medium underline"
                          >
                            Clear All
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {filters.status !== 'all' && (
                            <Badge className="bg-[#a4785a] text-white border-0 text-xs">
                              {filters.status}
                              <X 
                                className="h-3 w-3 ml-1 cursor-pointer inline" 
                                onClick={() => handleFilterChange('status', 'all')}
                              />
                            </Badge>
                          )}
                          {filters.paymentMethod !== 'all' && (
                            <Badge className="bg-[#a4785a] text-white border-0 text-xs">
                              {filters.paymentMethod}
                              <X 
                                className="h-3 w-3 ml-1 cursor-pointer inline" 
                                onClick={() => handleFilterChange('paymentMethod', 'all')}
                              />
                            </Badge>
                          )}
                          {filters.paymentStatus !== 'all' && (
                            <Badge className="bg-[#a4785a] text-white border-0 text-xs">
                              {filters.paymentStatus}
                              <X 
                                className="h-3 w-3 ml-1 cursor-pointer inline" 
                                onClick={() => handleFilterChange('paymentStatus', 'all')}
                              />
                            </Badge>
                          )}
                          {filters.searchTerm && (
                            <Badge className="bg-[#a4785a] text-white border-0 text-xs">
                              {filters.searchTerm.substring(0, 10)}
                              <X 
                                className="h-3 w-3 ml-1 cursor-pointer inline" 
                                onClick={() => handleFilterChange('searchTerm', '')}
                              />
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Reset Button */}
                    {activeFilterCount > 0 && (
                      <div className="pt-2 border-t border-[#e5ded7]">
                        <button 
                          onClick={resetFilters}
                          className="w-full px-3 py-2 border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#faf9f8] hover:border-[#a4785a] rounded-lg text-sm font-medium transition-all duration-200"
                        >
                          Reset Filters
                        </button>
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        <div className="admin-table-container">
          <div className="admin-table-empty">
            <ShoppingBag className="admin-table-empty-icon" />
            <h3 className="admin-table-empty-title">No Orders Found</h3>
            <p className="admin-table-empty-description">
              {activeFilterCount > 0 
                ? "No orders match your current filters. Try adjusting your filter criteria."
                : "No orders available at this time"
              }
            </p>
            {activeFilterCount > 0 && (
              <button onClick={resetFilters} className="admin-table-filter-btn mt-4">
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="admin-table-container">
        <div className="admin-table-header">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-xl shadow-lg">
              <ShoppingBag className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="admin-table-title">Order Management</h1>
              <p className="admin-table-description">
            View and manage all customer orders
          </p>
        </div>
          </div>
          <div className="flex items-center justify-end gap-3 flex-wrap">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="admin-table-filter-btn bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white hover:from-[#8f674a] hover:to-[#6a4c34] relative"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter Orders
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-white border border-[#d5bfae] shadow-xl rounded-lg p-4 z-50">
                <div className="space-y-4">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-semibold text-[#5c3d28] mb-2">
                      Search Orders
                    </label>
                    <input
                      type="text"
                      placeholder="Search by Order ID or Customer..."
                      value={filters.searchTerm}
                      onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-[#d5bfae] rounded-lg text-sm text-[#5c3d28] focus:border-[#a4785a] focus:ring-2 focus:ring-[#a4785a]/20 transition-all duration-200"
                    />
                  </div>

                  {/* Order Status Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-[#5c3d28] mb-2">
                      Order Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-[#d5bfae] rounded-lg text-sm text-[#5c3d28] bg-white focus:border-[#a4785a] focus:ring-2 focus:ring-[#a4785a]/20 transition-all duration-200"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Payment Method Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-[#5c3d28] mb-2">
                      Payment Method
                    </label>
                    <select
                      value={filters.paymentMethod}
                      onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-[#d5bfae] rounded-lg text-sm text-[#5c3d28] bg-white focus:border-[#a4785a] focus:ring-2 focus:ring-[#a4785a]/20 transition-all duration-200"
                    >
                      <option value="all">All Payment Methods</option>
                      <option value="COD">Cash on Delivery (COD)</option>
                      <option value="GCASH">GCash</option>
                      <option value="PAYMAYA">PayMaya</option>
                    </select>
                  </div>

                  {/* Payment Status Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-[#5c3d28] mb-2">
                      Payment Status
                    </label>
                    <select
                      value={filters.paymentStatus}
                      onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-[#d5bfae] rounded-lg text-sm text-[#5c3d28] bg-white focus:border-[#a4785a] focus:ring-2 focus:ring-[#a4785a]/20 transition-all duration-200"
                    >
                      <option value="all">All Payment Statuses</option>
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Active Filters Display */}
                  {activeFilterCount > 0 && (
                    <div className="bg-gradient-to-r from-[#faf9f8] to-[#fff4ea] rounded-lg p-3 border border-[#e5ded7]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-[#5c3d28]">Active Filters:</span>
                        <button
                          onClick={resetFilters}
                          className="text-xs text-[#a4785a] hover:text-[#7b5a3b] font-medium underline"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {filters.status !== 'all' && (
                          <Badge className="bg-[#a4785a] text-white border-0 text-xs">
                            {filters.status}
                            <X 
                              className="h-3 w-3 ml-1 cursor-pointer inline" 
                              onClick={() => handleFilterChange('status', 'all')}
                            />
                          </Badge>
                        )}
                        {filters.paymentMethod !== 'all' && (
                          <Badge className="bg-[#a4785a] text-white border-0 text-xs">
                            {filters.paymentMethod}
                            <X 
                              className="h-3 w-3 ml-1 cursor-pointer inline" 
                              onClick={() => handleFilterChange('paymentMethod', 'all')}
                            />
                          </Badge>
                        )}
                        {filters.paymentStatus !== 'all' && (
                          <Badge className="bg-[#a4785a] text-white border-0 text-xs">
                            {filters.paymentStatus}
                            <X 
                              className="h-3 w-3 ml-1 cursor-pointer inline" 
                              onClick={() => handleFilterChange('paymentStatus', 'all')}
                            />
                          </Badge>
                        )}
                        {filters.searchTerm && (
                          <Badge className="bg-[#a4785a] text-white border-0 text-xs">
                            {filters.searchTerm.substring(0, 10)}
                            <X 
                              className="h-3 w-3 ml-1 cursor-pointer inline" 
                              onClick={() => handleFilterChange('searchTerm', '')}
                            />
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Reset Button */}
                  {activeFilterCount > 0 && (
                    <div className="pt-2 border-t border-[#e5ded7]">
                      <button 
                        onClick={resetFilters}
                        className="w-full px-3 py-2 border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#faf9f8] hover:border-[#a4785a] rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        Reset Filters
                      </button>
                    </div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-table-container">
        <div className="admin-table-header">
          <h2 className="admin-table-title">Recent Orders ({orders.length})</h2>
          <p className="admin-table-description">
            Manage and review the latest orders from customers
          </p>
        </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
              <tr className="border-b border-[#d5bfae] bg-gradient-to-r from-[#faf9f8] to-[#fff4ea]">
                <th className="text-left py-4 px-6 font-semibold text-[#5c3d28]">Order ID</th>
                <th className="text-left py-4 px-6 font-semibold text-[#5c3d28]">Customer</th>
                <th className="text-left py-4 px-6 font-semibold text-[#5c3d28]">Date</th>
                <th className="text-left py-4 px-6 font-semibold text-[#5c3d28]">Items</th>
                <th className="text-left py-4 px-6 font-semibold text-[#5c3d28]">Amount</th>
                <th className="text-left py-4 px-6 font-semibold text-[#5c3d28]">Payment</th>
                <th className="text-left py-4 px-6 font-semibold text-[#5c3d28]">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-[#5c3d28]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                <tr key={order.id} className="border-b border-[#e5ded7] hover:bg-[#faf9f8] transition-colors duration-200">
                  <td className="py-4 px-6 font-mono text-sm font-medium text-[#5c3d28]">{order.id}</td>
                  <td className="py-4 px-6 text-[#5c3d28]">{order.customer}</td>
                  <td className="py-4 px-6 text-gray-600">{order.date}</td>
                  <td className="py-4 px-6">
                    <Badge variant="outline" className="text-xs border-[#d5bfae] text-[#7b5a3b] bg-[#faf9f8]">
                        {order.items} item{order.items !== 1 ? 's' : ''}
                      </Badge>
                    </td>
                  <td className="py-4 px-6 font-semibold text-[#a4785a]">{order.amount}</td>
                  <td className="py-4 px-6">
                      {getPaymentMethodBadge(order.paymentMethod, order.paymentStatus)}
                    </td>
                  <td className="py-4 px-6">
                      <Badge
                      className={
                          order.status === "Delivered"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : order.status === "Processing" || order.status === "Packing"
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                            : order.status === "Shipped"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                            : order.status === "Pending"
                          ? "bg-gray-100 text-gray-800 border-gray-200"
                          : "bg-red-100 text-red-800 border-red-200"
                        }
                      variant="outline"
                      >
                        {order.status}
                      </Badge>
                    </td>
                  <td className="py-4 px-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <button className="p-2 rounded-md hover:bg-[#faf9f8] text-[#5c3d28] hover:text-[#a4785a] transition-colors">
                            <MoreHorizontal className="h-4 w-4" />
                        </button>
                        </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border border-[#d5bfae] shadow-lg rounded-lg">
                        <DropdownMenuItem 
                          onClick={() => handleViewOrder(order)}
                          className="text-[#5c3d28] hover:bg-[#faf9f8] cursor-pointer"
                        >
                          <Eye className="h-4 w-4 mr-2 text-[#a4785a]" />
                            View Details
                          </DropdownMenuItem>
                          {order.canCancel && (
                            <DropdownMenuItem 
                              onClick={() => {
                                setOrderToCancel(order);
                                setCancelDialogOpen(true);
                              }}
                            className="text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancel Order
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>

      {/* Order Details Modal */}
      {viewModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 pt-24">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-[#d5bfae]">
            <div className="sticky top-0 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] p-6 rounded-t-2xl shadow-lg z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-6 w-6 text-white" />
                <h2 className="text-2xl font-bold text-white">Order Details</h2>
                </div>
                <button 
                  onClick={() => setViewModalOpen(false)}
                  className="bg-white text-[#a4785a] hover:bg-[#fff4ea] rounded-full p-2 transition-all duration-200 hover:scale-110 shadow-md ring-1 ring-[#e5ded7]"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Order Header */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-[#faf9f8] to-[#fff4ea] rounded-lg p-4 border border-[#e5ded7]">
                  <h3 className="font-semibold text-[#7b5a3b] text-sm mb-1">Order ID</h3>
                  <p className="text-lg font-mono font-bold text-[#5c3d28]">{selectedOrder.id}</p>
                </div>
                <div className="bg-gradient-to-r from-[#faf9f8] to-[#fff4ea] rounded-lg p-4 border border-[#e5ded7]">
                  <h3 className="font-semibold text-[#7b5a3b] text-sm mb-1">Order Date</h3>
                  <p className="text-lg font-medium text-[#5c3d28]">{selectedOrder.date}</p>
                </div>
                <div className="bg-gradient-to-r from-[#faf9f8] to-[#fff4ea] rounded-lg p-4 border border-[#e5ded7]">
                  <h3 className="font-semibold text-[#7b5a3b] text-sm mb-1">Customer</h3>
                  <p className="text-lg font-medium text-[#5c3d28]">{selectedOrder.customer}</p>
                </div>
                <div className="bg-gradient-to-r from-[#faf9f8] to-[#fff4ea] rounded-lg p-4 border border-[#e5ded7]">
                  <h3 className="font-semibold text-[#7b5a3b] text-sm mb-1">Total Amount</h3>
                  <p className="text-lg font-bold text-[#a4785a]">{selectedOrder.amount}</p>
                </div>
              </div>

              {/* Status and Payment */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-[#faf9f8] to-[#fff4ea] rounded-lg p-4 border border-[#e5ded7]">
                  <h3 className="font-semibold text-[#7b5a3b] text-sm mb-2">Order Status</h3>
                  <Badge
                    className={
                      selectedOrder.status === "Delivered"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : selectedOrder.status === "Processing" || selectedOrder.status === "Packing"
                        ? "bg-blue-100 text-blue-800 border-blue-200"
                        : selectedOrder.status === "Shipped"
                        ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                        : selectedOrder.status === "Pending"
                        ? "bg-gray-100 text-gray-800 border-gray-200"
                        : "bg-red-100 text-red-800 border-red-200"
                    }
                    variant="outline"
                    className="text-sm"
                  >
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div className="bg-gradient-to-r from-[#faf9f8] to-[#fff4ea] rounded-lg p-4 border border-[#e5ded7]">
                  <h3 className="font-semibold text-[#7b5a3b] text-sm mb-2">Payment Method</h3>
                  {getPaymentMethodBadge(selectedOrder.paymentMethod, selectedOrder.paymentStatus)}
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-gradient-to-r from-[#faf9f8] to-[#fff4ea] rounded-lg p-4 border border-[#e5ded7]">
                <h3 className="font-semibold text-[#5c3d28] mb-3 flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-[#a4785a]" />
                  Order Items
                </h3>
                <div className="bg-white rounded-lg p-4 border border-[#d5bfae]">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-[#5c3d28]">Total Items</span>
                    <Badge variant="outline" className="border-[#d5bfae] text-[#7b5a3b] bg-[#faf9f8]">
                      {selectedOrder.items} item{selectedOrder.items !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  {selectedOrder.products && selectedOrder.products.length > 0 && (
                    <div className="mt-3 space-y-2 border-t border-[#e5ded7] pt-3">
                      {selectedOrder.products.map((product, index) => (
                        <div key={index} className="flex justify-between items-center text-sm py-2 border-b border-[#f5f0eb] last:border-0">
                          <span className="text-[#5c3d28]">{product.name}</span>
                          <span className="font-medium text-[#a4785a]">Qty: {product.quantity} × ₱{product.price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              {selectedOrder.location && (
                <div className="bg-gradient-to-r from-[#faf9f8] to-[#fff4ea] rounded-lg p-4 border border-[#e5ded7]">
                  <h3 className="font-semibold text-[#7b5a3b] text-sm mb-1">Delivery Location</h3>
                  <p className="text-[#5c3d28]">{selectedOrder.location}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-[#e5ded7]">
                <button 
                  onClick={() => setViewModalOpen(false)}
                  className="flex-1 px-4 py-2 border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#faf9f8] hover:border-[#a4785a] rounded-lg font-medium transition-all duration-200"
                >
                  Close
                </button>
                {selectedOrder.canCancel && (
                  <button 
                    onClick={() => {
                      setViewModalOpen(false);
                      setOrderToCancel(selectedOrder);
                      setCancelDialogOpen(true);
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent className="bg-white border border-[#d5bfae] rounded-2xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3 text-[#5c3d28]">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              Cancel Order #{orderToCancel?.id}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 pt-4">
              Are you sure you want to cancel this order? This action cannot be undone.
              <div className="mt-4 bg-gradient-to-r from-[#faf9f8] to-[#fff4ea] rounded-lg p-4 border border-[#e5ded7]">
                <strong className="text-[#5c3d28] block mb-2">Order Details:</strong>
                <div className="space-y-1 text-sm">
                  <div><span className="font-medium text-[#7b5a3b]">Customer:</span> <span className="text-[#5c3d28]">{orderToCancel?.customer}</span></div>
                  <div><span className="font-medium text-[#7b5a3b]">Amount:</span> <span className="text-[#a4785a] font-semibold">{orderToCancel?.amount}</span></div>
                  <div><span className="font-medium text-[#7b5a3b]">Payment Method:</span> <span className="text-[#5c3d28]">{orderToCancel?.paymentMethod}</span></div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#faf9f8] hover:border-[#a4785a] rounded-lg font-medium transition-all duration-200">
              Keep Order
            </AlertDialogCancel>
            <button
              onClick={() => {
                if (orderToCancel) {
                  cancelOrder(orderToCancel.id);
                }
              }}
              disabled={cancellingOrder === orderToCancel?.id}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: '#dc2626',
                color: 'white'
              }}
            >
              {cancellingOrder === orderToCancel?.id ? (
                <span className="flex items-center justify-center">
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </span>
              ) : (
                'Cancel Order'
              )}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

export default OrdersOverview;
