import React from "react";
import { X, Package, User, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";

const RequestDetailsModal = ({ request, onClose, onRefresh }) => {
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-gray-100 text-gray-600 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Request Details</h2>
            <p className="text-sm text-gray-600">ID: {request.request_id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Status Banner */}
          <div className={`p-4 rounded-lg border-2 flex items-center gap-3 ${getStatusColor(request.status)}`}>
            {getStatusIcon(request.status)}
            <div>
              <p className="font-semibold capitalize">Status: {request.status}</p>
              <p className="text-sm">
                {request.status === 'pending' && 'Your request is being reviewed'}
                {request.status === 'approved' && 'Your request has been approved'}
                {request.status === 'rejected' && 'Your request has been rejected'}
                {request.status === 'processing' && 'Your request is being processed'}
                {request.status === 'completed' && 'Your request has been completed'}
                {request.status === 'cancelled' && 'This request was cancelled'}
              </p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Request Type</p>
                <p className="font-semibold capitalize">{request.request_type}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Subject</p>
                <p className="font-semibold">{request.subject}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="font-semibold">#{request.order?.orderID || 'N/A'}</p>
              </div>

              {request.reason && (
                <div>
                  <p className="text-sm text-gray-600">Reason</p>
                  <p className="font-semibold capitalize">{request.reason.replace('_', ' ')}</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Seller</p>
                <p className="font-semibold">{request.seller?.user?.userName || 'N/A'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Created At</p>
                <p className="font-semibold">{new Date(request.created_at).toLocaleString()}</p>
              </div>

              {request.responded_at && (
                <div>
                  <p className="text-sm text-gray-600">Responded At</p>
                  <p className="font-semibold">{new Date(request.responded_at).toLocaleString()}</p>
                </div>
              )}

              {request.resolved_at && (
                <div>
                  <p className="text-sm text-gray-600">Resolved At</p>
                  <p className="font-semibold">{new Date(request.resolved_at).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Description</p>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-800 whitespace-pre-wrap">{request.description}</p>
            </div>
          </div>

          {/* Images */}
          {request.images && request.images.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Attached Images</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {request.images.map((image, index) => (
                  <img
                    key={index}
                    src={`https://craftconnect-laravel-backend-1.onrender.com/storage/${image}`}
                    alt={`Attachment ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-80"
                    onClick={() => window.open(`https://craftconnect-laravel-backend-1.onrender.com/storage/${image}`, '_blank')}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Seller Response */}
          {request.seller_response && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Seller Response</p>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium text-blue-900">
                      {request.seller?.user?.userName || 'Seller'}
                    </p>
                    <p className="text-blue-800 mt-1 whitespace-pre-wrap">{request.seller_response}</p>
                    {request.responded_at && (
                      <p className="text-xs text-blue-600 mt-2">
                        Responded on {new Date(request.responded_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Admin Notes */}
          {request.admin_notes && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Admin Notes</p>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-purple-600 mt-1" />
                  <p className="text-purple-800 whitespace-pre-wrap">{request.admin_notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Product Info (if available) */}
          {request.product && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Related Product</p>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                {request.product.productImage && (
                  <img
                    src={`https://craftconnect-laravel-backend-1.onrender.com/storage/${request.product.productImage}`}
                    alt={request.product.productName}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div>
                  <p className="font-semibold">{request.product.productName}</p>
                  <p className="text-sm text-gray-600">₱{request.product.productPrice}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t">
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsModal;

