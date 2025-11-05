import React, { useState, useEffect, useMemo } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { 
  Eye, RefreshCw, X, AlertTriangle, 
  ShoppingBag, Filter, Calendar, Clock, 
  CheckCircle, XCircle, Package, 
  RotateCcw, DollarSign, MessageSquare,
  Download, ArrowLeft, ArrowRight,
  Video, Image as ImageIcon, Play
} from "lucide-react";
import api from "../../api";
import "./AdminTableDesign.css";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

function ReturnRefundRequests() {
  const [requests, setRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [filters, setFilters] = useState({
    status: 'all',
    requestType: 'all',
    searchTerm: '',
    dateFilter: 'all',
    startDate: '',
    endDate: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch all return and refund requests
  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/after-sale/admin/requests');
      const data = response.data || [];
      setAllRequests(data);
      setRequests(data);
    } catch (err) {
      console.error('Error fetching return/refund requests:', err);
      setError(err.response?.data?.error || 'Failed to fetch return/refund requests');
      setAllRequests([]);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...allRequests];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(req => req.status?.toLowerCase() === filters.status.toLowerCase());
    }

    // Request type filter
    if (filters.requestType !== 'all') {
      filtered = filtered.filter(req => req.request_type?.toLowerCase() === filters.requestType.toLowerCase());
    }

    // Search filter
    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(req => 
        req.request_id?.toLowerCase().includes(search) ||
        req.order?.order_number?.toLowerCase().includes(search) ||
        req.customer?.user?.userName?.toLowerCase().includes(search) ||
        req.seller?.user?.userName?.toLowerCase().includes(search) ||
        req.subject?.toLowerCase().includes(search)
      );
    }

    // Date filter
    if (filters.dateFilter !== 'all') {
      const now = new Date();
      let startDate, endDate;

      switch (filters.dateFilter) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          endDate = new Date();
          break;
        case 'thisWeek':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          startDate = weekStart;
          endDate = new Date();
          break;
        case 'thisMonth':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date();
          break;
        case 'lastMonth':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
          break;
        case 'custom':
          if (filters.startDate && filters.endDate) {
            startDate = new Date(filters.startDate + 'T00:00:00');
            endDate = new Date(filters.endDate + 'T23:59:59');
          } else {
            startDate = null;
            endDate = null;
          }
          break;
        default:
          startDate = null;
          endDate = null;
      }

      if (startDate && endDate) {
        filtered = filtered.filter(req => {
          const requestDate = new Date(req.created_at);
          return requestDate >= startDate && requestDate <= endDate;
        });
      }
    }

    setRequests(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters, allRequests]);

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved": return "bg-green-100 text-green-800 border-green-200";
      case "rejected": return "bg-red-100 text-red-800 border-red-200";
      case "processing": return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed": return "bg-gray-100 text-gray-800 border-gray-200";
      case "cancelled": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get request type badge color
  const getRequestTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "return": return "bg-orange-100 text-orange-800 border-orange-200";
      case "refund": return "bg-purple-100 text-purple-800 border-purple-200";
      case "exchange": return "bg-blue-100 text-blue-800 border-blue-200";
      case "support": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "complaint": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return <Clock className="h-3 w-3" />;
      case "approved": return <CheckCircle className="h-3 w-3" />;
      case "rejected": return <XCircle className="h-3 w-3" />;
      case "processing": return <RefreshCw className="h-3 w-3" />;
      case "completed": return <CheckCircle className="h-3 w-3" />;
      default: return <Package className="h-3 w-3" />;
    }
  };

  // Get request type icon
  const getRequestTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "return": return <RotateCcw className="h-4 w-4" />;
      case "refund": return <DollarSign className="h-4 w-4" />;
      case "exchange": return <RefreshCw className="h-4 w-4" />;
      case "support": return <MessageSquare className="h-4 w-4" />;
      case "complaint": return <AlertTriangle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: 'all',
      requestType: 'all',
      searchTerm: '',
      dateFilter: 'all',
      startDate: '',
      endDate: ''
    });
  };

  // Handle view request
  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setViewModalOpen(true);
  };

  // Handle update status
  const handleUpdateStatus = (request) => {
    setSelectedRequest(request);
    setNewStatus(request.status || '');
    setAdminNotes(request.admin_notes || '');
    setUpdateDialogOpen(true);
  };

  // Submit status update
  const submitStatusUpdate = async () => {
    if (!selectedRequest || !newStatus) {
      alert('Please select a status');
      return;
    }

    try {
      const requestId = selectedRequest.id || selectedRequest.request_id;
      const response = await api.put(`/after-sale/admin/requests/${requestId}/status`, {
        status: newStatus,
        admin_notes: adminNotes
      });

      if (response.data) {
        // Success - the toast will be handled by the context if available
        alert('Request status updated successfully!');
        setUpdateDialogOpen(false);
        setSelectedRequest(null);
        setNewStatus('');
        setAdminNotes('');
        fetchRequests();
      }
    } catch (error) {
      console.error('Error updating request status:', error);
      alert(error.response?.data?.error || 'Failed to update request status');
    }
  };

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.requestType !== 'all') count++;
    if (filters.searchTerm) count++;
    if (filters.dateFilter !== 'all') count++;
    return count;
  }, [filters]);

  // Pagination
  const totalPages = Math.ceil(requests.length / itemsPerPage);
  const paginatedRequests = requests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to get proper storage URL
  const getStorageUrl = (path) => {
    if (!path) return null;
    // If already a full URL, return as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    // Use relative path which will be proxied by Vite
    if (path.startsWith('storage/') || path.startsWith('/storage/')) {
      return path.startsWith('/') ? path : `/${path}`;
    }
    // Add storage prefix if missing
    return `/storage/${path}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="admin-table-container">
          <div className="admin-table-loading">
            <div className="admin-table-loading-spinner"></div>
            <span>Loading return/refund requests...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && requests.length === 0) {
    return (
      <div className="space-y-6">
        <div className="admin-table-container">
          <div className="admin-table-empty">
            <div className="admin-table-empty-icon">⚠️</div>
            <h3 className="admin-table-empty-title">Failed to load requests</h3>
            <p className="admin-table-empty-description">{error}</p>
            <button 
              onClick={fetchRequests}
              className="admin-table-filter-btn"
            >
              Retry
            </button>
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
              <RotateCcw className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="admin-table-title">Return & Refund Requests</h1>
              <p className="admin-table-description">
                View and manage all return, refund, exchange, and support requests
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-semibold">Total Requests:</span>
              <Badge variant="outline" className="text-[#a4785a] border-[#a4785a]">
                {allRequests.length}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={fetchRequests}
                variant="outline"
                size="sm"
                className="admin-table-filter-btn"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="admin-table-filter-btn bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white hover:from-[#8f674a] hover:to-[#6a4c34] relative">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter Requests
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
                        Search Requests
                      </label>
                      <input
                        type="text"
                        placeholder="Search by Request ID, Order, Customer, or Seller..."
                        value={filters.searchTerm}
                        onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-[#d5bfae] rounded-lg text-sm text-[#5c3d28] focus:border-[#a4785a] focus:ring-2 focus:ring-[#a4785a]/20 transition-all duration-200"
                      />
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-[#5c3d28] mb-2">
                        Status
                      </label>
                      <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-[#d5bfae] rounded-lg text-sm text-[#5c3d28] bg-white focus:border-[#a4785a] focus:ring-2 focus:ring-[#a4785a]/20 transition-all duration-200"
                      >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    {/* Request Type Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-[#5c3d28] mb-2">
                        Request Type
                      </label>
                      <select
                        value={filters.requestType}
                        onChange={(e) => handleFilterChange('requestType', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-[#d5bfae] rounded-lg text-sm text-[#5c3d28] bg-white focus:border-[#a4785a] focus:ring-2 focus:ring-[#a4785a]/20 transition-all duration-200"
                      >
                        <option value="all">All Types</option>
                        <option value="return">Return</option>
                        <option value="refund">Refund</option>
                        <option value="exchange">Exchange</option>
                        <option value="support">Support</option>
                        <option value="complaint">Complaint</option>
                      </select>
                    </div>

                    {/* Date Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-[#5c3d28] mb-2">
                        Date Range
                      </label>
                      <select
                        value={filters.dateFilter}
                        onChange={(e) => handleFilterChange('dateFilter', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-[#d5bfae] rounded-lg text-sm text-[#5c3d28] bg-white focus:border-[#a4785a] focus:ring-2 focus:ring-[#a4785a]/20 transition-all duration-200"
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="thisWeek">This Week</option>
                        <option value="thisMonth">This Month</option>
                        <option value="lastMonth">Last Month</option>
                        <option value="custom">Custom Range</option>
                      </select>
                    </div>

                    {/* Custom Date Range */}
                    {filters.dateFilter === 'custom' && (
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs font-medium text-[#5c3d28] mb-1">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-[#d5bfae] rounded-lg text-sm text-[#5c3d28] focus:border-[#a4785a] focus:ring-2 focus:ring-[#a4785a]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#5c3d28] mb-1">
                            End Date
                          </label>
                          <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-[#d5bfae] rounded-lg text-sm text-[#5c3d28] focus:border-[#a4785a] focus:ring-2 focus:ring-[#a4785a]/20"
                          />
                        </div>
                      </div>
                    )}

                    {/* Clear Filters */}
                    {activeFilterCount > 0 && (
                      <button
                        onClick={resetFilters}
                        className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all duration-200 text-sm font-medium"
                      >
                        Clear All Filters
                      </button>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="admin-table-container">
        {requests.length === 0 ? (
          <div className="admin-table-empty">
            <Package className="admin-table-empty-icon" />
            <h3 className="admin-table-empty-title">No requests found</h3>
            <p className="admin-table-empty-description">
              {activeFilterCount > 0 
                ? 'Try adjusting your filters to see more results'
                : 'No return or refund requests have been submitted yet'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Type</th>
                    <th>Customer</th>
                    <th>Seller</th>
                    <th>Order #</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRequests.map((request) => (
                    <tr key={request.id || request.request_id}>
                      <td>
                        <span className="font-mono text-xs text-[#a4785a] font-semibold">
                          #{request.request_id || request.id}
                        </span>
                      </td>
                      <td>
                        <Badge 
                          variant="outline" 
                          className={`${getRequestTypeColor(request.request_type)} flex items-center gap-1 w-fit`}
                        >
                          {getRequestTypeIcon(request.request_type)}
                          {request.request_type?.toUpperCase() || 'N/A'}
                        </Badge>
                      </td>
                      <td>
                        <div className="flex flex-col">
                          <span className="font-medium text-[#5c3d28]">
                            {request.customer?.user?.userName || 'N/A'}
                          </span>
                          {request.customer?.user?.userEmail && (
                            <span className="text-xs text-gray-500">
                              {request.customer.user.userEmail}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col">
                          <span className="font-medium text-[#5c3d28]">
                            {request.seller?.user?.userName || 'N/A'}
                          </span>
                          {request.seller?.store_name && (
                            <span className="text-xs text-gray-500">
                              {request.seller.store_name}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-sm text-gray-600">
                          {request.order?.order_number || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-[#5c3d28] line-clamp-1">
                          {request.subject || 'No subject'}
                        </span>
                      </td>
                      <td>
                        <Badge 
                          variant="outline" 
                          className={`${getStatusColor(request.status)} flex items-center gap-1 w-fit`}
                        >
                          {getStatusIcon(request.status)}
                          {request.status?.toUpperCase() || 'N/A'}
                        </Badge>
                      </td>
                      <td>
                        <span className="text-sm text-gray-600">
                          {formatDate(request.created_at)}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewRequest(request)}
                            className="admin-table-action-btn view"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(request)}
                            className="admin-table-action-btn edit"
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Update
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="admin-table-pagination">
                <div className="admin-table-pagination-info">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, requests.length)} of {requests.length} requests
                </div>
                <div className="admin-table-pagination-controls">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="admin-table-pagination-btn"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </button>
                  <span className="px-4 text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="admin-table-pagination-btn"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* View Request Dialog */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mt-20 mb-8 rounded-xl shadow-2xl border border-[#d5bfae] bg-white [&>button]:hidden">
          <DialogHeader className="relative pb-4 border-b border-[#d5bfae] mb-6">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-semibold text-[#5c3d28] mb-2">
                  Request Details - #{selectedRequest?.request_id || selectedRequest?.id}
                </DialogTitle>
                <DialogDescription className="text-sm text-[#7b5a3b]">
                  Complete information about this return/refund request
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewModalOpen(false)}
                className="absolute right-0 top-0 h-8 w-8 rounded-full hover:bg-[#f5f0eb] text-[#5c3d28] hover:text-[#a4785a] transition-colors"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6 py-2">
              {/* Request Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#5c3d28]">Request Type</label>
                  <Badge className={`${getRequestTypeColor(selectedRequest.request_type)} text-sm px-3 py-1`}>
                    {getRequestTypeIcon(selectedRequest.request_type)}
                    {selectedRequest.request_type?.toUpperCase() || 'N/A'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#5c3d28]">Status</label>
                  <Badge className={`${getStatusColor(selectedRequest.status)} text-sm px-3 py-1`}>
                    {getStatusIcon(selectedRequest.status)}
                    {selectedRequest.status?.toUpperCase() || 'N/A'}
                  </Badge>
                </div>
              </div>

              {/* Customer & Seller Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#5c3d28]">Customer</label>
                  <div className="p-3 bg-white rounded-md border border-[#d5bfae]">
                    <p className="font-medium text-[#5c3d28]">{selectedRequest.customer?.user?.userName || 'N/A'}</p>
                    <p className="text-sm text-[#7b5a3b] mt-1">{selectedRequest.customer?.user?.userEmail || 'N/A'}</p>
                    <p className="text-sm text-[#7b5a3b]">{selectedRequest.customer?.user?.userContactNumber || 'N/A'}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#5c3d28]">Seller</label>
                  <div className="p-3 bg-white rounded-md border border-[#d5bfae]">
                    <p className="font-medium text-[#5c3d28]">{selectedRequest.seller?.user?.userName || 'N/A'}</p>
                    <p className="text-sm text-[#7b5a3b] mt-1">{selectedRequest.seller?.store_name || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#5c3d28]">Order Information</label>
                <div className="p-3 bg-white rounded-md border border-[#d5bfae]">
                  <p className="font-medium text-[#5c3d28]">Order #{selectedRequest.order?.order_number || 'N/A'}</p>
                  <p className="text-sm text-[#7b5a3b] mt-1">Date: {formatDate(selectedRequest.order?.created_at)}</p>
                  <p className="text-sm text-[#7b5a3b]">Status: {selectedRequest.order?.status || 'N/A'}</p>
                </div>
              </div>

              {/* Product Info */}
              {selectedRequest.product && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#5c3d28]">Product</label>
                  <div className="p-3 bg-white rounded-md border border-[#d5bfae]">
                    <p className="font-medium text-[#5c3d28]">{selectedRequest.product.product_name || 'N/A'}</p>
                    <p className="text-sm text-[#7b5a3b] mt-1">SKU: {selectedRequest.product.product_sku || 'N/A'}</p>
                  </div>
                </div>
              )}

              {/* Subject & Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#5c3d28]">Subject</label>
                <div className="p-3 bg-white rounded-md border border-[#d5bfae]">
                  <p className="text-[#5c3d28]">{selectedRequest.subject || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#5c3d28]">Description</label>
                <div className="p-3 bg-white rounded-md border border-[#d5bfae]">
                  <p className="text-[#5c3d28] whitespace-pre-wrap leading-relaxed">{selectedRequest.description || 'N/A'}</p>
                </div>
              </div>

              {/* Reason */}
              {selectedRequest.reason && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#5c3d28]">Reason</label>
                  <div className="p-3 bg-white rounded-md border border-[#d5bfae]">
                    <p className="text-[#5c3d28]">{selectedRequest.reason}</p>
                  </div>
                </div>
              )}

              {/* Attachments Section - Images and Videos */}
              {((selectedRequest.images && selectedRequest.images.length > 0) || selectedRequest.video_path) && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-[#5c3d28] flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Attachments
                  </label>
                  
                  {/* Video */}
                  {selectedRequest.video_path && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-[#7b5a3b] flex items-center gap-2">
                        <Video className="h-3 w-3" />
                        Unboxing Video
                      </label>
                      <div className="relative rounded-lg overflow-hidden border border-[#d5bfae] shadow-md">
                        <video
                          src={getStorageUrl(selectedRequest.video_path)}
                          controls
                          controlsList="nodownload"
                          className="w-full max-h-96 object-contain bg-black"
                          preload="metadata"
                          crossOrigin="anonymous"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </div>
                  )}

                  {/* Images */}
                  {selectedRequest.images && selectedRequest.images.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-[#7b5a3b] flex items-center gap-2">
                        <ImageIcon className="h-3 w-3" />
                        Attached Images ({selectedRequest.images.length})
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {selectedRequest.images.map((image, idx) => {
                          const imageUrl = getStorageUrl(image);
                          return (
                            <div key={idx} className="relative group">
                              <img
                                src={imageUrl}
                                alt={`Attachment ${idx + 1}`}
                                className="w-full h-40 object-cover rounded-lg border border-[#d5bfae] shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                                onClick={() => window.open(imageUrl, '_blank')}
                                onError={(e) => {
                                  console.error('Failed to load image:', image);
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Seller Response */}
              {selectedRequest.seller_response && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#5c3d28]">Seller Response</label>
                  <div className="p-3 bg-white rounded-md border border-[#d5bfae]">
                    <p className="text-[#5c3d28] whitespace-pre-wrap leading-relaxed">{selectedRequest.seller_response}</p>
                    <p className="text-xs text-[#7b5a3b] mt-3 pt-3 border-t border-[#d5bfae]">Responded: {formatDate(selectedRequest.responded_at)}</p>
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {selectedRequest.admin_notes && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#5c3d28]">Admin Notes</label>
                  <div className="p-3 bg-white rounded-md border border-[#d5bfae]">
                    <p className="text-[#5c3d28] whitespace-pre-wrap leading-relaxed">{selectedRequest.admin_notes}</p>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-white rounded-md border border-[#d5bfae]">
                <div className="text-sm">
                  <span className="font-medium text-[#5c3d28]">Created:</span>
                  <span className="text-[#7b5a3b] ml-2">{formatDate(selectedRequest.created_at)}</span>
                </div>
                {selectedRequest.updated_at && (
                  <div className="text-sm">
                    <span className="font-medium text-[#5c3d28]">Last Updated:</span>
                    <span className="text-[#7b5a3b] ml-2">{formatDate(selectedRequest.updated_at)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="pt-4 border-t border-[#d5bfae]">
            <Button 
              variant="outline" 
              onClick={() => setViewModalOpen(false)}
              className="border border-[#d5bfae] hover:bg-[#f5f0eb] text-[#5c3d28] font-medium px-6"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="max-w-2xl mt-20 mb-8 rounded-xl shadow-2xl border border-[#d5bfae] bg-white [&>button]:hidden">
          <DialogHeader className="relative pb-4 border-b border-[#d5bfae] mb-6">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-semibold text-[#5c3d28] mb-2">
                  Update Request Status
                </DialogTitle>
                <DialogDescription className="text-sm text-[#7b5a3b]">
                  Update the status and add admin notes for this request
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setUpdateDialogOpen(false)}
                className="absolute right-0 top-0 h-8 w-8 rounded-full hover:bg-[#f5f0eb] text-[#5c3d28] hover:text-[#a4785a] transition-colors"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#5c3d28]">
                Status <span className="text-red-500">*</span>
              </label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="h-10 border border-[#d5bfae] focus:border-[#a4785a] rounded-md bg-white text-[#5c3d28]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-[#d5bfae]">
                  <SelectItem value="pending" className="hover:bg-[#f5f0eb]">Pending</SelectItem>
                  <SelectItem value="approved" className="hover:bg-[#f5f0eb]">Approved</SelectItem>
                  <SelectItem value="rejected" className="hover:bg-[#f5f0eb]">Rejected</SelectItem>
                  <SelectItem value="processing" className="hover:bg-[#f5f0eb]">Processing</SelectItem>
                  <SelectItem value="completed" className="hover:bg-[#f5f0eb]">Completed</SelectItem>
                  <SelectItem value="cancelled" className="hover:bg-[#f5f0eb]">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#5c3d28]">
                Admin Notes <span className="text-[#7b5a3b] text-xs font-normal">(Optional)</span>
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add admin notes or comments..."
                className="w-full px-3 py-2 border border-[#d5bfae] rounded-md text-sm text-[#5c3d28] focus:border-[#a4785a] focus:outline-none focus:ring-2 focus:ring-[#a4785a]/20 min-h-[100px] resize-none bg-white placeholder-[#7b5a3b]"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-[#d5bfae] gap-3">
            <Button 
              variant="outline" 
              onClick={() => setUpdateDialogOpen(false)}
              className="border border-[#d5bfae] hover:bg-[#f5f0eb] text-[#5c3d28] font-medium px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={submitStatusUpdate}
              disabled={!newStatus}
              className={`px-6 py-2 font-medium text-white rounded-md shadow-md transition-all duration-200 ${
                newStatus
                  ? 'bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] hover:shadow-lg'
                  : 'bg-gray-400 cursor-not-allowed opacity-60'
              }`}
            >
              <CheckCircle className="h-4 w-4 mr-2 inline" />
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ReturnRefundRequests;

