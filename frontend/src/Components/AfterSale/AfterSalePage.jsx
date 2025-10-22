import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { 
  Package, 
  RefreshCw, 
  DollarSign, 
  HelpCircle, 
  AlertCircle,
  Plus,
  Eye,
  X,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import api from "../../api";
import { useUser } from "../Context/UserContext";
import CreateRequestModal from "./CreateRequestModal";
import RequestDetailsModal from "./RequestDetailsModal";

const AfterSalePage = () => {
  const { user } = useUser();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/after-sale/my-requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching after-sale requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) {
      return;
    }

    try {
      await api.post(`/after-sale/requests/${requestId}/cancel`);
      fetchRequests();
      alert('Request cancelled successfully');
    } catch (error) {
      console.error('Error cancelling request:', error);
      alert('Failed to cancel request');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-gray-100 text-gray-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type) => {
    const icons = {
      return: <Package className="h-5 w-5" />,
      exchange: <RefreshCw className="h-5 w-5" />,
      refund: <DollarSign className="h-5 w-5" />,
      support: <HelpCircle className="h-5 w-5" />,
      complaint: <AlertCircle className="h-5 w-5" />
    };
    return icons[type] || <HelpCircle className="h-5 w-5" />;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="h-5 w-5 text-yellow-600" />,
      approved: <CheckCircle className="h-5 w-5 text-green-600" />,
      rejected: <XCircle className="h-5 w-5 text-red-600" />,
      processing: <Clock className="h-5 w-5 text-blue-600" />,
      completed: <CheckCircle className="h-5 w-5 text-gray-600" />,
      cancelled: <XCircle className="h-5 w-5 text-gray-600" />
    };
    return icons[status] || <Clock className="h-5 w-5" />;
  };

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(req => req.status === filter);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link to="/orders" className="text-gray-500 hover:text-primary">
              My Orders
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium">After-Sale Support</span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">After-Sale Support</h1>
              <p className="text-gray-600">
                Manage returns, exchanges, refunds, and support requests
              </p>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Request
            </Button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-[#a47c68]" />
                <div>
                  <p className="text-sm text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold">{requests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold">
                    {requests.filter(r => r.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold">
                    {requests.filter(r => r.status === 'approved').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">
                    {requests.filter(r => r.status === 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {['all', 'pending', 'approved', 'processing', 'completed', 'rejected', 'cancelled'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              onClick={() => setFilter(status)}
              className="capitalize whitespace-nowrap"
            >
              {status}
            </Button>
          ))}
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#a47c68]"></div>
            <p className="mt-4 text-gray-600">Loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No requests found</h3>
              <p className="text-gray-600 mb-4">
                {filter === 'all' 
                  ? "You haven't created any after-sale requests yet."
                  : `No ${filter} requests found.`}
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                Create Your First Request
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-[#a47c68]/10 rounded-lg">
                          {getTypeIcon(request.request_type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{request.subject}</h3>
                          <p className="text-sm text-gray-600">
                            Request ID: {request.request_id} • Order #{request.order?.orderID}
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-3 line-clamp-2">
                        {request.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="capitalize">Type: {request.request_type}</span>
                        <span>•</span>
                        <span>Created: {new Date(request.created_at).toLocaleDateString()}</span>
                        {request.seller && (
                          <>
                            <span>•</span>
                            <span>Seller: {request.seller.user?.userName || 'N/A'}</span>
                          </>
                        )}
                      </div>

                      {request.seller_response && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-900">Seller Response:</p>
                          <p className="text-sm text-blue-800">{request.seller_response}</p>
                        </div>
                      )}
                    </div>

                    <div className="ml-6 flex flex-col items-end gap-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowDetailsModal(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>

                        {['pending', 'approved', 'processing'].includes(request.status) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelRequest(request.id)}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Request Modal */}
      {showCreateModal && (
        <CreateRequestModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchRequests();
          }}
        />
      )}

      {/* Request Details Modal */}
      {showDetailsModal && selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedRequest(null);
          }}
          onRefresh={fetchRequests}
        />
      )}
    </div>
  );
};

export default AfterSalePage;

