import React, { useState, useEffect } from "react";
import { X, Upload, Package, RefreshCw, DollarSign, HelpCircle, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import api from "../../api";

const CreateRequestModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    order_id: '',
    product_id: '',
    request_type: 'support',
    subject: 'After-sale request',
    description: '',
    reason: '',
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await api.get('/orders');
      console.log('Orders API response:', response.data);
      // Filter to only show delivered/completed orders
      const completedOrders = (Array.isArray(response.data) ? response.data : []).filter(order => 
        order && ['delivered', 'completed'].includes(order.status)
      );
      console.log('Completed orders:', completedOrders);
      setOrders(completedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    setImages(prev => [...prev, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.order_id || !String(formData.order_id).trim()) {
      setError('Please select an order');
      return;
    }

    const descriptionText = formData.description.trim();
    if (!descriptionText || descriptionText.length < 20) {
      setError(`Description must be at least 20 characters. Current: ${descriptionText.length} characters`);
      return;
    }
    
    if (!formData.subject || !formData.subject.trim()) {
      setError('Subject is required');
      return;
    }

    try {
      setLoading(true);
      const submitData = new FormData();
      
      // Ensure all required fields are present and valid
      const orderId = String(formData.order_id).trim();
      if (!orderId) {
        setError('Order ID is required');
        setLoading(false);
        return;
      }
      
      const description = formData.description.trim();
      if (!description || description.length < 20) {
        setError('Description must be at least 20 characters. Current length: ' + (description.length || 0));
        setLoading(false);
        return;
      }
      
      const subject = (formData.subject || 'After-sale request').trim();
      if (!subject || subject.length === 0) {
        setError('Subject is required');
        setLoading(false);
        return;
      }
      
      // Append all form fields - ensure required fields are always present
      submitData.append('order_id', orderId);
      submitData.append('request_type', formData.request_type || 'support');
      submitData.append('subject', subject);
      submitData.append('description', description);
      
      if (formData.product_id) {
        submitData.append('product_id', String(formData.product_id));
      }
      if (formData.reason) {
        submitData.append('reason', formData.reason.trim());
      }

      // Append images with proper array format
      images.forEach((image) => {
        submitData.append('images[]', image);
      });

      // Debug: Log FormData contents
      console.log('Submitting after-sale request with:', {
        order_id: formData.order_id,
        request_type: formData.request_type,
        subject: formData.subject || 'After-sale request',
        description_length: description.length,
        description_preview: description.substring(0, 50) + '...',
        images_count: images.length,
        has_reason: !!formData.reason
      });

      // Log FormData entries for debugging
      for (let pair of submitData.entries()) {
        console.log('FormData:', pair[0], '=', pair[1]);
      }

      const response = await api.post('/after-sale/requests', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Success response:', response.data);
      onSuccess();
    } catch (error) {
      console.error('Error creating request:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 422) {
        const errors = error.response.data?.errors || {};
        const errorMessages = Object.values(errors).flat();
        const errorText = errorMessages.length > 0 
          ? errorMessages.join(', ') 
          : error.response.data?.message || 'Validation failed. Please check your input.';
        setError(errorText);
        console.error('Validation errors:', errors);
      } else {
        setError(error.response?.data?.message || error.response?.data?.error || 'Failed to create request');
      }
    } finally {
      setLoading(false);
    }
  };

  const requestTypes = [
    { value: 'return', label: 'Return Item', icon: <Package className="h-4 w-4" />, desc: 'Return received item' },
    { value: 'exchange', label: 'Exchange Item', icon: <RefreshCw className="h-4 w-4" />, desc: 'Exchange for another item' },
    { value: 'refund', label: 'Request Refund', icon: <DollarSign className="h-4 w-4" />, desc: 'Get money back' },
    { value: 'support', label: 'Support', icon: <HelpCircle className="h-4 w-4" />, desc: 'General inquiry' },
    { value: 'complaint', label: 'Complaint', icon: <AlertCircle className="h-4 w-4" />, desc: 'Report an issue' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-3xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Create After-Sale Request</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Select Order */}
          <div className="space-y-2">
            <Label htmlFor="order_id">Select Order *</Label>
            {loadingOrders ? (
              <p className="text-sm text-gray-600">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-sm text-gray-600">No completed orders found. You can only create requests for delivered orders.</p>
            ) : (
              <select
                id="order_id"
                name="order_id"
                value={formData.order_id}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-md"
              >
                <option value="">Choose an order...</option>
                {orders.map(order => {
                  // Handle both orderID and id field names
                  const orderId = order.orderID || order.id || order.order_id;
                  return (
                    <option key={orderId} value={orderId}>
                      Order #{orderId} - {new Date(order.created_at || order.orderDate || order.date).toLocaleDateString()} - ₱{order.totalAmount || order.total || 0}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          {/* Request Type */}
          <div className="space-y-2">
            <Label>Request Type *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {requestTypes.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, request_type: type.value }))}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    formData.request_type === type.value
                      ? 'border-[#a47c68] bg-[#a47c68]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      formData.request_type === type.value ? 'bg-[#a47c68] text-white' : 'bg-gray-100'
                    }`}>
                      {type.icon}
                    </div>
                    <div>
                      <p className="font-medium">{type.label}</p>
                      <p className="text-sm text-gray-600">{type.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Brief description of your request"
              required
              maxLength={255}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description *
              <span className="ml-2 text-sm font-normal text-gray-500">
                (Minimum 20 characters)
              </span>
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide detailed information about your request..."
              rows={5}
              required
            />
            <p className="text-xs text-gray-500">
              Character count: {formData.description.trim().length} / 20 minimum
            </p>
          </div>

          {/* Reason (for return/exchange/refund) */}
          {['return', 'exchange', 'refund'].includes(formData.request_type) && (
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <select
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select a reason...</option>
                <option value="defective">Defective/Damaged item</option>
                <option value="wrong_item">Wrong item received</option>
                <option value="not_as_described">Not as described</option>
                <option value="size_issue">Size/fit issue</option>
                <option value="quality_issue">Quality issue</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}

          {/* Images */}
          <div className="space-y-2">
            <Label>Upload Images (Optional, max 5)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Upload images to support your request
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
                disabled={images.length >= 5}
              />
              <label htmlFor="image-upload">
                <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('image-upload').click()} disabled={images.length >= 5}>
                  Choose Files
                </Button>
              </label>
              <p className="text-xs text-gray-500 mt-2">
                {images.length}/5 images selected
              </p>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mt-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading || loadingOrders || orders.length === 0}
            >
              {loading ? 'Creating...' : 'Create Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRequestModal;

