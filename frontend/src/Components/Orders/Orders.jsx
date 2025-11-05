import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, ArrowLeft, Clock, Package, Truck, CheckCircle2, RotateCcw, XCircle, Star, MessageSquare, Calendar, UploadCloud, Image as ImageIcon, Video as VideoIcon, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import api from '../../api';
import { useUser } from '../Context/UserContext';
import { useCart } from '../Cart/CartContext';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('To Package');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useUser();
  const { addToCart } = useCart();
  
  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '' });
  
  // Rating & Review states
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productRating, setProductRating] = useState(0);
  const [sellerRating, setSellerRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userReviewedMap, setUserReviewedMap] = useState({});
  const [afterSaleDialog, setAfterSaleDialog] = useState({ open: false, order: null });
  const [afterSaleType, setAfterSaleType] = useState('return');
  const [afterSaleReason, setAfterSaleReason] = useState('');
  const [afterSaleDescription, setAfterSaleDescription] = useState('');
  const [afterSaleStep, setAfterSaleStep] = useState(1);
  const [selectedIssue, setSelectedIssue] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [imageFiles, setImageFiles] = useState([]); // File[]
  const [imagePreviews, setImagePreviews] = useState([]); // string[]

  // Helper function to convert image URLs to relative paths
  const fixImageUrl = (url) => {
    if (!url) return url;
    // If it's already a full URL with localhost, convert to relative path
    if (url.includes('localhost:8000') || url.includes('localhost:8080') || url.includes('craftconnect-laravel-backend-1.onrender.com')) {
      const path = new URL(url).pathname;
      return path;
    }
    // If it's already a relative path, return as is
    if (url.startsWith('/storage/') || url.startsWith('/images/')) {
      return url;
    }
    // If it's just a filename, prepend /storage/
    if (url && !url.startsWith('http') && !url.startsWith('/')) {
      return `/storage/${url}`;
    }
    return url;
  };

  // Show toast notification
  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 10000); // 10 seconds
  };

  const reasonOptions = {
    received_damaged_items: [
      'Box/package damaged',
      'Product scratched or dented',
      'Product not functioning',
      'Signs of tampering',
    ],
    receive_incorrect_item: [
      'Wrong color/variant',
      'Wrong size',
      'Completely different item',
      'Missing accessories',
    ],
    did_not_receive_some_or_all_items: [
      'Some items missing',
      'All items missing',
      'Received empty box',
    ],
    others: [
      'Other issue (please describe)'
    ],
  };

  useEffect(() => {
    // Check for payment status in URL query params
    const searchParams = new URLSearchParams(location.search);
    const paymentStatus = searchParams.get('payment');
    const sourceId = searchParams.get('source_id');

    if (paymentStatus === 'success') {
      alert('Payment successful! Your order has been confirmed.');
      // Clean up URL
      navigate('/orders', { replace: true });
    } else if (paymentStatus === 'failed') {
      alert('Payment failed. Please try again or choose a different payment method.');
      // Clean up URL
      navigate('/orders', { replace: true });
    } else if (paymentStatus === 'error') {
      alert('There was an error processing your payment. Please contact support if the issue persists.');
      // Clean up URL
      navigate('/orders', { replace: true });
    }
  }, [location, navigate]);

  const fetchOrders = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const response = await api.get('/orders');
      
      // Handle different response structures
      const ordersData = Array.isArray(response.data) ? response.data : response.data.data || [];
      
      setOrders(ordersData);
      // Build product id list from delivered orders for review check
      const productIds = ordersData
        .filter(o => o.status === 'delivered')
        .flatMap(o => (o.items || []).map(i => i.product_id))
        .filter(Boolean);
      if (productIds.length) {
        try {
          const res = await api.post('/reviews/user-reviewed', { product_ids: Array.from(new Set(productIds)) });
          if (res.data?.reviewed) {
            setUserReviewedMap(res.data.reviewed);
          }
        } catch (e) {
          // Failed to fetch user reviewed map
        }
      } else {
        setUserReviewedMap({});
      }
    } catch (error) {
      if (error.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
        navigate('/login');
      } else {
        alert('Failed to load orders. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [navigate, isAuthenticated, user]);

  // Inject styles for active tab to ensure they override everything
  useEffect(() => {
    const styleId = 'active-order-tab-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        button.active-order-tab[data-active-tab="true"] {
          background-color: var(--active-bg-color) !important;
          background: var(--active-bg-color) !important;
          color: #ffffff !important;
        }
        button.active-order-tab[data-active-tab="true"] *,
        button.active-order-tab[data-active-tab="true"] > * {
          color: #ffffff !important;
        }
        button.active-order-tab[data-active-tab="true"] svg,
        button.active-order-tab[data-active-tab="true"] .active-tab-icon {
          color: #ffffff !important;
          stroke: #ffffff !important;
          fill: none !important;
        }
        button.active-order-tab[data-active-tab="true"] .active-tab-text,
        button.active-order-tab[data-active-tab="true"] > span:first-of-type {
          color: #ffffff !important;
        }
      `;
      document.head.appendChild(style);
    }
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusInfo = (status, paymentStatus) => {
    const statusMap = {
      'pending': {
        title: 'To Pay',
        description: paymentStatus === 'paid' ? 'Payment received, ready to ship' : 'Payment pending',
        icon: Clock,
        color: 'bg-yellow-500',
        textColor: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      },
      'processing': {
        title: 'To Package',
        description: 'Payment received - Ready to package',
        icon: Package,
        color: 'bg-yellow-500',
        textColor: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      },
      'packing': {
        title: 'To Ship',
        description: 'Seller is packing your order',
        icon: Truck,
        color: 'bg-blue-500',
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      'shipped': {
        title: 'To Receive',
        description: 'Out for delivery',
        icon: Truck,
        color: 'bg-purple-500',
        textColor: 'text-purple-700',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
      },
      'delivered': {
        title: 'Completed',
        description: 'Order delivered',
        icon: CheckCircle2,
        color: 'bg-green-500',
        textColor: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      },
      'cancelled': {
        title: 'Cancelled',
        description: 'Order cancelled',
        icon: XCircle,
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      },
      'payment_failed': {
        title: 'Return/Refund',
        description: 'Payment failed',
        icon: XCircle,
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      },
      'returned': {
        title: 'Return/Refund',
        description: 'Return processed',
        icon: RotateCcw,
        color: 'bg-orange-500',
        textColor: 'text-orange-700',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      }
    };

    return statusMap[status] || statusMap['pending'];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#a36b4f]" />
      </div>
    );
  }

  // Group orders by status
  const groupedOrders = {
    'To Package': orders.filter(order => {
      const shouldShow = 
        order.status === 'processing' ||
        (order.status === 'pending' && order.paymentStatus === 'paid') ||
        (order.status === 'pending' && order.payment_method === 'cod') ||
        (order.status === 'pending' && (order.payment_method === 'gcash' || order.payment_method === 'paymaya'));
      
      return shouldShow;
    }),
    'To Ship': orders.filter(order => 
      order.status === 'packing'
    ),
    'To Receive': orders.filter(order => order.status === 'shipped'),
    'Completed': orders.filter(order => order.status === 'delivered'),
    'Rating & Review': orders.filter(order => order.status === 'delivered').map(order => ({
      ...order,
      items: (order.items || []).filter(item => !userReviewedMap[item.product_id])
    })).filter(order => (order.items || []).length > 0), // Hide if all products reviewed
    'Return/Refund': orders.filter(order => 
      order.status === 'returned' || 
      order.status === 'cancelled' ||
      order.status === 'payment_failed' ||
      order.status === 'failed' || // Orders with failed status
      order.hasActiveAfterSaleRequest === true // Orders with active after-sale requests (return/refund/exchange)
      // Don't include pending online payments here anymore - they show in To Package
    )
  };

  const statusColumns = [
    { key: 'To Package', title: 'To Package', icon: Package, color: 'yellow' },
    { key: 'To Ship', title: 'To Ship', icon: Truck, color: 'blue' },
    { key: 'To Receive', title: 'To Receive', icon: Truck, color: 'purple' },
    { key: 'Completed', title: 'Completed', icon: CheckCircle2, color: 'green' },
    { key: 'Rating & Review', title: 'Rating & Review', icon: Star, color: 'amber' },
    { key: 'Return/Refund', title: 'Return/Refund', icon: RotateCcw, color: 'orange' }
  ];

  const handleMarkAsReceived = async (orderId) => {
    try {
      const response = await api.post(`/orders/${orderId}/mark-received`);
      if (response.data.success) {
        showToast('Order marked as received! Thank you for your purchase.');
        // Refresh orders
        fetchOrders();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to mark order as received');
    }
  };

  const handleOpenReview = (order, product = null) => {
    setSelectedOrder(order);
    setSelectedProduct(product);
    setProductRating(0);
    setSellerRating(0);
    setReviewText('');
    setShowReviewDialog(true);
  };

  const handleBuyAgain = async (order) => {
    try {
      // Add all items back to cart using CartContext
      let successCount = 0;
      let errorCount = 0;
      
      for (const item of (order.items || [])) {
        try {
          // Prepare product data for addToCart
          const productForCart = {
            id: item.product_id,
            product_id: item.product_id,
            title: item.product_name,
            price: item.price,
            image: item.product_image
          };
          
          const result = await addToCart(productForCart, Math.max(1, item.quantity || 1));
          if (result.success) {
            successCount++;
          } else {
            errorCount++;
            console.error(`Failed to add ${item.product_name} to cart:`, result.error);
          }
        } catch (error) {
          errorCount++;
          console.error(`Error adding ${item.product_name} to cart:`, error);
        }
      }
      
      if (successCount > 0) {
        showToast(`${successCount} item(s) added to cart successfully!`);
        navigate('/cart');
      } else {
        alert('Failed to add items to cart. Please try again.');
      }
      
      if (errorCount > 0) {
        console.warn(`${errorCount} items failed to be added to cart`);
      }
    } catch (error) {
      console.error('Error in handleBuyAgain:', error);
      alert('Failed to add items to cart. Please try again.');
    }
  };

  const openAfterSale = (order) => {
    // Prevent opening if there's already an active request
    if (order.hasActiveAfterSaleRequest) {
      alert('You already have an active after-sale request for this order.');
      return;
    }
    setAfterSaleDialog({ open: true, order });
    setAfterSaleType('return');
    setAfterSaleReason('');
    setAfterSaleDescription('');
    setAfterSaleStep(1);
    setSelectedIssue('');
    setSelectedReason('');
    setCustomReason('');
    setVideoFile(null);
    setVideoPreview('');
    setImageFiles([]);
    setImagePreviews([]);
  };

  const submitAfterSale = async () => {
    try {
      const orderId = afterSaleDialog.order?.orderID;
      if (!orderId) return;
      // Frontend validation
      if (!selectedIssue) {
        alert('Please select what happened to the product.');
        return;
      }
      const resolvedReason = selectedIssue === 'others' ? (customReason || '').trim() : (selectedReason || '').trim();
      if (!resolvedReason) {
        alert('Please select or enter a reason.');
        return;
      }
      // Ensure description meets minimum requirement (20 characters)
      const description = afterSaleDescription?.trim() || 'No additional details provided for this request';
      if (description.length < 20) {
        alert('Description must be at least 20 characters long.');
        return;
      }
      
      const form = new FormData();
      form.append('order_id', String(orderId).trim());
      form.append('request_type', afterSaleType);
      form.append('subject', 'After-sale request');
      form.append('description', description);
      form.append('reason', resolvedReason);
      // Append files from state
      const hasVideo = !!videoFile;
      const imageCount = imageFiles.length;
      if (videoFile) {
        form.append('video', videoFile);
      }
      imageFiles.forEach((file) => form.append('images[]', file));
      if ((afterSaleType === 'return' || afterSaleType === 'refund') && (!hasVideo || imageCount === 0)) {
        alert('Unboxing video and at least one photo are required for return/refund requests.');
        return;
      }
      const res = await api.post('/after-sale/requests', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.success !== false) {
        alert('After-sale request submitted. We will get back to you.');
        setAfterSaleDialog({ open: false, order: null });
        // Reset form
        setAfterSaleType('return');
        setAfterSaleReason('');
        setAfterSaleDescription('');
        setAfterSaleStep(1);
        setSelectedIssue('');
        setSelectedReason('');
        setCustomReason('');
        setVideoFile(null);
        setVideoPreview('');
        setImageFiles([]);
        setImagePreviews([]);
        // Refresh orders to show the new after-sale request
        fetchOrders();
      } else {
        alert(res.data?.message || 'Failed to submit after-sale request');
      }
    } catch (e) {
      console.error('Error submitting after-sale request:', e);
      console.error('Error response:', e.response?.data);
      if (e.response?.status === 409) {
        // Conflict - request already exists
        const errorMsg = e.response.data?.error || 'An after-sale request for this order already exists.';
        alert(errorMsg);
        // Close dialog and refresh orders
        setAfterSaleDialog({ open: false, order: null });
        fetchOrders();
      } else if (e.response?.status === 422) {
        const errors = e.response.data?.errors || {};
        const errorMessages = Object.values(errors).flat();
        alert(errorMessages.join(', ') || e.response.data?.message || 'Validation failed. Please check your input.');
      } else {
        alert(e.response?.data?.message || e.response?.data?.error || 'Failed to submit after-sale request');
      }
    }
  };

  const handleSubmitReview = async () => {
    if (productRating === 0 && sellerRating === 0) {
      alert('Please provide at least one rating');
      return;
    }

    try {
      setSubmittingReview(true);
      
      // Submit product review if rating provided
      if (productRating > 0 && selectedProduct) {
        await api.post(`/products/${selectedProduct.product_id}/reviews`, {
          rating: productRating,
          comment: reviewText,
          order_id: selectedOrder.orderID
        });
      }

      // Submit seller review if rating provided
      if (sellerRating > 0 && selectedOrder.seller_id) {
        await api.post(`/sellers/${selectedOrder.seller_id}/reviews`, {
          rating: sellerRating,
          comment: reviewText,
          order_id: selectedOrder.orderID
        });
      }

      showToast('Thank you for your review!');
      setShowReviewDialog(false);
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const StarRating = ({ rating, onRatingChange, readonly = false }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !readonly && onRatingChange(star)}
            disabled={readonly}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform duration-200`}
          >
            <Star
              className={`h-8 w-8 ${
                star <= rating
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const renderReviewCard = (order) => {
    return (
      <Card key={order.orderID} className="border-2 border-[#d5bfae] overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 mb-4">
        <div className="bg-gradient-to-r from-[#f5f0eb] to-[#ede5dc] px-6 py-4 border-b-2 border-[#d5bfae]">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-[#7b5a3b] font-medium">Order Number:</span>
                <span className="font-bold text-[#5c3d28] bg-white px-3 py-1 rounded-lg border-2 border-[#d5bfae] shadow-sm">
                  {order.order_number || order.orderNumber || `ORD-${order.orderID}` || 'N/A'}
                </span>
              </div>
              <div className="text-xs text-[#7b5a3b] mt-2 flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                {formatDate(order.orderDate)}
              </div>
            </div>
            <div className="text-sm text-right">
              <span className="text-[#7b5a3b]">Total:</span>{' '}
              <span className="font-bold text-xl text-[#5c3d28]">₱{parseFloat(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="space-y-4">
            {order.items && order.items.map((item) => (
              <div key={item.order_product_id} className="bg-gradient-to-br from-white to-[#faf9f8] p-5 rounded-xl border-2 border-[#d5bfae] hover:shadow-md transition-all duration-200">
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden border-2 border-[#d5bfae] shadow-sm">
                    {item.product_image ? (
                      <img
                        src={fixImageUrl(item.product_image)}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow">
                    <h4 className="font-bold text-[#5c3d28] text-lg mb-2">{item.product_name}</h4>
                    <p className="text-sm text-[#7b5a3b] mb-3">Qty: {item.quantity} × ₱{parseFloat(item.price).toFixed(2)}</p>
                    <Button
                      onClick={() => handleOpenReview(order, item)}
                      className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                    >
                      <Star className="h-5 w-5 mr-2" />
                      Rate This Product
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderOrderCard = (order, currentActiveTab = activeTab) => {
    const statusInfo = getStatusInfo(order.status, order.paymentStatus);
    const StatusIcon = statusInfo.icon;
    
    // Check if this tab allows clicking to view details
    const canViewDetails = ['To Package', 'To Ship', 'To Receive', 'Completed'].includes(currentActiveTab);
    
    return (
      <Card 
        key={order.orderID} 
        className={`border-[#e5ded7] overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 mb-4 ${canViewDetails ? 'cursor-pointer' : ''}`}
        onClick={canViewDetails ? () => navigate('/orders/details', { state: { order } }) : undefined}
      >
        <div className="bg-[#f8f5f2] px-4 py-3 border-b border-[#e5ded7]">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-gray-500">Order Number:</span>
                <span className="font-bold text-[#5c3d28] bg-white px-2 py-1 rounded border border-[#e5ded7]">
                  {order.order_number || order.orderNumber || `ORD-${order.orderID}` || 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* After-Sale Request Badge */}
                {order.hasActiveAfterSaleRequest && order.afterSaleRequest && (
                  <Badge className={
                    order.afterSaleRequest.status === 'approved' 
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : 'bg-orange-100 text-orange-800 border-orange-300'
                  }>
                    {order.afterSaleRequest.request_type.charAt(0).toUpperCase() + order.afterSaleRequest.request_type.slice(1)} Request ({order.afterSaleRequest.status})
                  </Badge>
                )}
                {/* Payment Status Badge */}
                {order.paymentStatus === 'paid' && (
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    ✓ Paid ({order.payment_method?.toUpperCase() || 'Online'})
                  </Badge>
                )}
                {order.paymentStatus === 'pending' && order.payment_method === 'cod' && (
                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                    COD
                  </Badge>
                )}
                {order.paymentStatus === 'pending' && order.payment_method === 'gcash' && (
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    GCash (Pending)
                  </Badge>
                )}
                {order.paymentStatus === 'pending' && order.payment_method === 'paymaya' && (
                  <Badge className="bg-purple-100 text-purple-800 text-xs">
                    PayMaya (Pending)
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-sm text-right">
              <span className="text-gray-500">Total:</span>{' '}
              <span className="font-bold text-lg">₱{parseFloat(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2 flex items-center gap-3">
            <span>
              <span className="mr-1">📅</span>
              {formatDate(order.orderDate)}
            </span>
            {order.tracking_number && (
              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono text-xs">
                📦 {order.tracking_number}
              </span>
            )}
          </div>
        </div>
        
        <CardContent className="p-3">
          {order.items && order.items.slice(0, 2).map((item) => (
            <div key={item.order_product_id} className="flex items-center gap-3 py-2">
              <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                {item.product_image ? (
                  <img
                    src={fixImageUrl(item.product_image)}
                    alt={item.product_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No image</span>
                  </div>
                )}
              </div>
              
              <div className="flex-grow min-w-0">
                <h4 className="font-medium text-[#4b3832] text-sm truncate">{item.product_name}</h4>
                {item.sku && (
                  <p className="text-xs text-[#7b5a3b] font-mono bg-[#faf9f8] px-2 py-0.5 rounded inline-block mt-1">
                    SKU: {item.sku}
                  </p>
                )}
                <p className="text-xs text-gray-600 mt-1">Qty: {item.quantity}</p>
                <p className="text-xs text-[#a36b4f] font-medium">
                  ₱{parseFloat(item.price).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
          {order.items && order.items.length > 2 && (
            <div className="text-xs text-gray-500 text-center py-1">
              +{order.items.length - 2} more items
            </div>
          )}
          
          {/* Order Received Button - Only show for shipped orders */}
          {order.status === 'shipped' && (
            <div className="mt-4 pt-3 border-t border-[#e5ded7]">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkAsReceived(order.orderID);
                }}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Order Received
              </Button>
            </div>
          )}

          {/* Completed actions: Buy Again / Return-Refund - Only show in Completed tab, not in Return/Refund tab */}
          {order.status === 'delivered' && currentActiveTab !== 'Return/Refund' && (
            <div className="mt-4 pt-3 border-t border-[#e5ded7]">
              {order.hasActiveAfterSaleRequest ? (
                <div className={
                  order.afterSaleRequest?.status === 'approved'
                    ? 'bg-green-50 border border-green-200 rounded-lg p-3 mb-2'
                    : 'bg-orange-50 border border-orange-200 rounded-lg p-3 mb-2'
                }>
                  <p className={`text-sm font-semibold mb-1 ${
                    order.afterSaleRequest?.status === 'approved'
                      ? 'text-green-800'
                      : 'text-orange-800'
                  }`}>
                    After-Sale Request Submitted
                  </p>
                  {order.afterSaleRequest && (
                    <p className={`text-xs ${
                      order.afterSaleRequest.status === 'approved'
                        ? 'text-green-700'
                        : 'text-orange-700'
                    }`}>
                      {order.afterSaleRequest.request_type.charAt(0).toUpperCase() + order.afterSaleRequest.request_type.slice(1)} request is {order.afterSaleRequest.status}. Request ID: {order.afterSaleRequest.request_id}
                    </p>
                  )}
                </div>
              ) : null}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBuyAgain(order);
                }}
                className="w-full bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white hover:from-[#8f674a] hover:to-[#6a4c34] shadow-md hover:shadow-lg"
              >
                Buy Again
              </Button>
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    openAfterSale(order);
                  }}
                  disabled={order.hasActiveAfterSaleRequest}
                  className={`w-full border-2 ${order.hasActiveAfterSaleRequest ? 'border-gray-300 text-gray-400 cursor-not-allowed' : 'border-[#d5bfae] hover:bg-[#f5f0eb]'}`}
                >
                  {order.hasActiveAfterSaleRequest ? 'Request Already Submitted' : 'Return / Refund'}
                </Button>
              </div>
            </div>
          )}
          
          {/* Return/Refund tab actions - Only show request info, no Buy Again button */}
          {currentActiveTab === 'Return/Refund' && (
            <div className="mt-4 pt-3 border-t border-[#e5ded7]">
              {order.hasActiveAfterSaleRequest ? (
                <div className={
                  order.afterSaleRequest?.status === 'approved'
                    ? 'bg-green-50 border border-green-200 rounded-lg p-3 mb-2'
                    : 'bg-orange-50 border border-orange-200 rounded-lg p-3 mb-2'
                }>
                  <p className={`text-sm font-semibold mb-1 ${
                    order.afterSaleRequest?.status === 'approved'
                      ? 'text-green-800'
                      : 'text-orange-800'
                  }`}>
                    After-Sale Request Submitted
                  </p>
                  {order.afterSaleRequest && (
                    <p className={`text-xs ${
                      order.afterSaleRequest.status === 'approved'
                        ? 'text-green-700'
                        : 'text-orange-700'
                    }`}>
                      {order.afterSaleRequest.request_type.charAt(0).toUpperCase() + order.afterSaleRequest.request_type.slice(1)} request is {order.afterSaleRequest.status}. Request ID: {order.afterSaleRequest.request_id}
                    </p>
                  )}
                </div>
              ) : null}
              {order.status === 'delivered' && !order.hasActiveAfterSaleRequest && (
              <Button
                variant="outline"
                onClick={() => openAfterSale(order)}
                className="w-full border-2 border-[#d5bfae] hover:bg-[#f5f0eb]"
              >
                Return / Refund
              </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-[#4b3832]">My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
          <Button onClick={() => navigate('/products')}>
            Start Shopping
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Horizontal Navigation Tabs */}
          <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
            {statusColumns.map((column) => {
              const ColumnIcon = column.icon;
              const ordersInColumn = groupedOrders[column.key];
              const isActive = activeTab === column.key;
              
              // Get button classes based on column
              const getButtonClasses = () => {
                if (isActive) {
                  switch (column.key) {
                    case 'To Package': return 'bg-yellow-500 hover:bg-yellow-600 text-white border-2 border-yellow-600 shadow-lg';
                    case 'To Ship': return 'bg-blue-500 hover:bg-blue-600 text-white border-2 border-blue-600 shadow-lg';
                    case 'To Receive': return 'bg-purple-500 hover:bg-purple-600 text-white border-2 border-purple-600 shadow-lg';
                    case 'Completed': return 'bg-green-500 hover:bg-green-600 text-white border-2 border-green-600 shadow-lg';
                    case 'Rating & Review': return 'bg-amber-500 hover:bg-amber-600 text-white border-2 border-amber-600 shadow-lg';
                    case 'Return/Refund': return 'bg-orange-500 hover:bg-orange-600 text-white border-2 border-orange-600 shadow-lg';
                    default: return 'bg-gray-500 hover:bg-gray-600 text-white border-2 border-gray-600 shadow-lg';
                  }
                } else {
                  switch (column.key) {
                    case 'To Package': return 'border-2 border-yellow-300 text-yellow-600 hover:bg-yellow-50 bg-white';
                    case 'To Ship': return 'border-2 border-blue-300 text-blue-600 hover:bg-blue-50 bg-white';
                    case 'To Receive': return 'border-2 border-purple-300 text-purple-600 hover:bg-purple-50 bg-white';
                    case 'Completed': return 'border-2 border-green-300 text-green-600 hover:bg-green-50 bg-white';
                    case 'Rating & Review': return 'border-2 border-amber-300 text-amber-600 hover:bg-amber-50 bg-white';
                    case 'Return/Refund': return 'border-2 border-orange-300 text-orange-600 hover:bg-orange-50 bg-white';
                    default: return 'border-2 border-gray-300 text-gray-600 hover:bg-gray-50 bg-white';
                  }
                }
              };
              
              const getBadgeClasses = () => {
                if (isActive) {
                  switch (column.key) {
                    case 'To Package': return 'bg-yellow-600 text-white font-bold border border-yellow-700';
                    case 'To Ship': return 'bg-blue-600 text-white font-bold border border-blue-700';
                    case 'To Receive': return 'bg-purple-600 text-white font-bold border border-purple-700';
                    case 'Completed': return 'bg-green-600 text-white font-bold border border-green-700';
                    case 'Rating & Review': return 'bg-amber-600 text-white font-bold border border-amber-700';
                    case 'Return/Refund': return 'bg-orange-600 text-white font-bold border border-orange-700';
                    default: return 'bg-gray-600 text-white font-bold border border-gray-700';
                  }
                } else {
                  switch (column.key) {
                    case 'To Package': return 'bg-white text-yellow-600 border border-yellow-300';
                    case 'To Ship': return 'bg-white text-blue-600 border border-blue-300';
                    case 'To Receive': return 'bg-white text-purple-600 border border-purple-300';
                    case 'Completed': return 'bg-white text-green-600 border border-green-300';
                    case 'Rating & Review': return 'bg-white text-amber-600 border border-amber-300';
                    case 'Return/Refund': return 'bg-white text-orange-600 border border-orange-300';
                    default: return 'bg-white text-gray-600 border border-gray-300';
                  }
                }
              };
              
              const getActiveTabStyles = () => {
                if (!isActive) return {};
                const bgColor = column.key === 'To Package' ? '#eab308' : 
                               column.key === 'To Ship' ? '#2563eb' :
                               column.key === 'To Receive' ? '#9333ea' :
                               column.key === 'Completed' ? '#16a34a' :
                               column.key === 'Rating & Review' ? '#f59e0b' :
                               column.key === 'Return/Refund' ? '#ea580c' : '#6b7280';
                const borderColor = column.key === 'To Package' ? '#ca8a04' : 
                                   column.key === 'To Ship' ? '#1d4ed8' :
                                   column.key === 'To Receive' ? '#7e22ce' :
                                   column.key === 'Completed' ? '#15803d' :
                                   column.key === 'Rating & Review' ? '#d97706' :
                                   column.key === 'Return/Refund' ? '#c2410c' : '#4b5563';
                return {
                  backgroundColor: bgColor,
                  color: 'white',
                  borderColor: borderColor,
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  fontWeight: '600',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                };
              };

              if (isActive) {
                // Use plain button for active tabs to ensure full control
                const activeStyles = getActiveTabStyles();
                // Use a slightly darker shade for the badge to create contrast
                const badgeBgColor = column.key === 'To Package' ? '#ca8a04' : 
                                   column.key === 'To Ship' ? '#1d4ed8' :
                                   column.key === 'To Receive' ? '#7e22ce' :
                                   column.key === 'Completed' ? '#15803d' :
                                   column.key === 'Rating & Review' ? '#d97706' :
                                   column.key === 'Return/Refund' ? '#c2410c' : '#4b5563';
                return (
                  <button
                    key={column.key}
                    type="button"
                    onClick={() => setActiveTab(column.key)}
                    className="active-order-tab"
                    data-active-tab="true"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      transition: 'all 0.3s',
                      fontWeight: '600',
                      borderRadius: '0.375rem',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      cursor: 'pointer',
                      backgroundColor: activeStyles.backgroundColor,
                      background: activeStyles.backgroundColor,
                      color: '#ffffff',
                      borderColor: activeStyles.borderColor,
                      border: `2px solid ${activeStyles.borderColor}`,
                      borderWidth: '2px',
                      borderStyle: 'solid',
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      outline: 'none',
                      '--active-bg-color': activeStyles.backgroundColor
                    }}
                  >
                    <ColumnIcon className="active-tab-icon" style={{ width: '1rem', height: '1rem', color: '#ffffff', flexShrink: 0, stroke: '#ffffff' }} />
                    <span className="active-tab-text" style={{ fontWeight: '600', color: '#ffffff' }}>{column.title}</span>
                    <span 
                      style={{
                        marginLeft: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '0.375rem',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        padding: '0.125rem 0.5rem',
                        backgroundColor: badgeBgColor,
                        color: '#ffffff',
                        borderColor: activeStyles.borderColor
                      }}
                    >
                      {ordersInColumn.length} {ordersInColumn.length === 1 ? 'order' : 'orders'}
                    </span>
                  </button>
                );
              }

              return (
                <Button
                  key={column.key}
                  onClick={() => setActiveTab(column.key)}
                  variant="outline"
                  className={`flex items-center gap-2 px-4 py-2 transition-all duration-300 font-semibold ${getButtonClasses()}`}
                >
                  <ColumnIcon className="h-4 w-4" />
                  <span className="font-semibold">{column.title}</span>
                  <span 
                    className={`ml-1 text-xs font-bold inline-flex items-center justify-center rounded-md border px-2 py-0.5 ${getBadgeClasses()}`}
                    style={{
                      backgroundColor: 'white',
                      color: column.key === 'To Package' ? '#ca8a04' : 
                             column.key === 'To Ship' ? '#2563eb' :
                             column.key === 'To Receive' ? '#9333ea' :
                             column.key === 'Completed' ? '#16a34a' :
                             column.key === 'Rating & Review' ? '#f59e0b' :
                             column.key === 'Return/Refund' ? '#ea580c' : '#6b7280',
                      borderColor: column.key === 'To Package' ? '#fbbf24' : 
                                  column.key === 'To Ship' ? '#93c5fd' :
                                  column.key === 'To Receive' ? '#c084fc' :
                                  column.key === 'Completed' ? '#86efac' :
                                  column.key === 'Rating & Review' ? '#fcd34d' :
                                  column.key === 'Return/Refund' ? '#fdba74' : '#d1d5db'
                    }}
                  >
                    {ordersInColumn.length} {ordersInColumn.length === 1 ? 'order' : 'orders'}
                  </span>
                </Button>
              );
            })}
          </div>

          {/* Active Column Content */}
          <div className="bg-white rounded-lg border border-[#e5ded7] shadow-sm">
            {(() => {
              const activeColumn = statusColumns.find(col => col.key === activeTab);
              const ColumnIcon = activeColumn.icon;
              const ordersInColumn = groupedOrders[activeTab];
              
              // Get color classes based on active tab
              const getHeaderClasses = () => {
                switch (activeTab) {
                  case 'To Package': return 'bg-yellow-50 border-b border-yellow-200';
                  case 'To Ship': return 'bg-blue-50 border-b border-blue-200';
                  case 'To Receive': return 'bg-purple-50 border-b border-purple-200';
                  case 'Completed': return 'bg-green-50 border-b border-green-200';
                  case 'Rating & Review': return 'bg-amber-50 border-b border-amber-200';
                  case 'Return/Refund': return 'bg-orange-50 border-b border-orange-200';
                  default: return 'bg-gray-50 border-b border-gray-200';
                }
              };
              
              const getIconClasses = () => {
                switch (activeTab) {
                  case 'To Package': return 'h-6 w-6 text-yellow-600';
                  case 'To Ship': return 'h-6 w-6 text-blue-600';
                  case 'To Receive': return 'h-6 w-6 text-purple-600';
                  case 'Completed': return 'h-6 w-6 text-green-600';
                  case 'Rating & Review': return 'h-6 w-6 text-amber-600';
                  case 'Return/Refund': return 'h-6 w-6 text-orange-600';
                  default: return 'h-6 w-6 text-gray-600';
                }
              };
              
              const getTitleClasses = () => {
                switch (activeTab) {
                  case 'To Package': return 'text-xl font-bold text-yellow-800';
                  case 'To Ship': return 'text-xl font-bold text-blue-800';
                  case 'To Receive': return 'text-xl font-bold text-purple-800';
                  case 'Completed': return 'text-xl font-bold text-green-800';
                  case 'Rating & Review': return 'text-xl font-bold text-amber-800';
                  case 'Return/Refund': return 'text-xl font-bold text-orange-800';
                  default: return 'text-xl font-bold text-gray-800';
                }
              };
              
              const getBadgeClasses = () => {
                switch (activeTab) {
                  case 'To Package': return 'bg-yellow-200 text-yellow-800';
                  case 'To Ship': return 'bg-blue-200 text-blue-800';
                  case 'To Receive': return 'bg-purple-200 text-purple-800';
                  case 'Completed': return 'bg-green-200 text-green-800';
                  case 'Rating & Review': return 'bg-amber-200 text-amber-800';
                  case 'Return/Refund': return 'bg-orange-200 text-orange-800';
                  default: return 'bg-gray-200 text-gray-800';
                }
              };
              
              const getDescriptionClasses = () => {
                switch (activeTab) {
                  case 'To Package': return 'text-sm text-yellow-600 mt-1';
                  case 'To Ship': return 'text-sm text-blue-600 mt-1';
                  case 'To Receive': return 'text-sm text-purple-600 mt-1';
                  case 'Completed': return 'text-sm text-green-600 mt-1';
                  case 'Rating & Review': return 'text-sm text-amber-600 mt-1';
                  case 'Return/Refund': return 'text-sm text-orange-600 mt-1';
                  default: return 'text-sm text-gray-600 mt-1';
                }
              };
              
              const getEmptyIconClasses = () => {
                switch (activeTab) {
                  case 'To Package': return 'h-16 w-16 text-yellow-300 mx-auto mb-4';
                  case 'To Ship': return 'h-16 w-16 text-blue-300 mx-auto mb-4';
                  case 'To Receive': return 'h-16 w-16 text-purple-300 mx-auto mb-4';
                  case 'Completed': return 'h-16 w-16 text-green-300 mx-auto mb-4';
                  case 'Rating & Review': return 'h-16 w-16 text-amber-300 mx-auto mb-4';
                  case 'Return/Refund': return 'h-16 w-16 text-orange-300 mx-auto mb-4';
                  default: return 'h-16 w-16 text-gray-300 mx-auto mb-4';
                }
              };
              
              const getEmptyTitleClasses = () => {
                switch (activeTab) {
                  case 'To Package': return 'text-lg font-semibold text-yellow-600 mb-2';
                  case 'To Ship': return 'text-lg font-semibold text-blue-600 mb-2';
                  case 'To Receive': return 'text-lg font-semibold text-purple-600 mb-2';
                  case 'Completed': return 'text-lg font-semibold text-green-600 mb-2';
                  case 'Rating & Review': return 'text-lg font-semibold text-amber-600 mb-2';
                  case 'Return/Refund': return 'text-lg font-semibold text-orange-600 mb-2';
                  default: return 'text-lg font-semibold text-gray-600 mb-2';
                }
              };
              
              const getEmptyTextClasses = () => {
                switch (activeTab) {
                  case 'To Package': return 'text-sm text-yellow-500 mb-6';
                  case 'To Ship': return 'text-sm text-blue-500 mb-6';
                  case 'To Receive': return 'text-sm text-purple-500 mb-6';
                  case 'Completed': return 'text-sm text-green-500 mb-6';
                  case 'Rating & Review': return 'text-sm text-amber-500 mb-6';
                  case 'Return/Refund': return 'text-sm text-orange-500 mb-6';
                  default: return 'text-sm text-gray-500 mb-6';
                }
              };
              
              return (
                <>
                  {/* Column Header */}
                  <div className={`${getHeaderClasses()} px-6 py-4 rounded-t-lg`}>
                    <div className="flex items-center gap-3">
                      <ColumnIcon className={getIconClasses()} />
                      <h2 className={getTitleClasses()}>
                        {activeTab}
                      </h2>
                      <Badge 
                        variant="secondary" 
                        className={getBadgeClasses()}
                      >
                        {ordersInColumn.length} order{ordersInColumn.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <p className={getDescriptionClasses()}>
                      {activeTab === 'To Package' && 'Paid orders ready to be packaged by seller'}
                      {activeTab === 'To Ship' && 'Orders being packed and ready to ship'}
                      {activeTab === 'To Receive' && 'Orders on their way to you'}
                      {activeTab === 'Completed' && 'Orders successfully delivered'}
                      {activeTab === 'Rating & Review' && 'Share your experience and help other shoppers'}
                      {activeTab === 'Return/Refund' && 'Cancelled, failed, or COD unpaid orders'}
                    </p>
                  </div>
                  
                  {/* Column Content */}
                  <div className="p-6">
                    {ordersInColumn.length === 0 ? (
                      <div className="text-center py-12">
                        <ColumnIcon className={getEmptyIconClasses()} />
                        <h3 className={getEmptyTitleClasses()}>
                          No orders in this status
                        </h3>
                        <p className={getEmptyTextClasses()}>
                          {activeTab === 'To Package' && 'No paid orders waiting to be packaged right now!'}
                          {activeTab === 'To Ship' && 'Orders will appear here once seller starts packing.'}
                          {activeTab === 'To Receive' && 'Your orders will appear here once they ship.'}
                          {activeTab === 'Completed' && 'Completed orders will appear here after delivery.'}
                          {activeTab === 'Rating & Review' && 'No orders available for review yet.'}
                          {activeTab === 'Return/Refund' && 'Orders with return/refund requests, cancelled, failed, or unpaid orders will appear here.'}
                        </p>
                        <Button 
                          onClick={() => navigate('/products')}
                          className="bg-[#a36b4f] hover:bg-[#8b5a47] text-white"
                        >
                          Continue Shopping
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ordersInColumn.map(order => activeTab === 'Rating & Review' ? renderReviewCard(order) : renderOrderCard(order, activeTab))}
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-white to-[#faf9f8] border-2 border-[#d5bfae]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#5c3d28] flex items-center gap-2">
              <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
              Rate Your Experience
            </DialogTitle>
            <DialogDescription className="text-[#7b5a3b]">
              Share your honest feedback to help other shoppers make informed decisions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Order Info */}
            {selectedOrder && (
              <div className="bg-gradient-to-r from-[#f5f0eb] to-[#ede5dc] p-4 rounded-xl border-2 border-[#d5bfae]">
                <p className="text-sm text-[#7b5a3b] font-medium">
                  Order: <span className="font-bold text-[#5c3d28]">{selectedOrder.order_number || selectedOrder.orderNumber || `ORD-${selectedOrder.orderID}` || 'N/A'}</span>
                </p>
              </div>
            )}

            {/* Product Info */}
            {selectedProduct && (
              <div className="bg-white p-4 rounded-xl border-2 border-[#d5bfae] shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border-2 border-[#d5bfae]">
                    {selectedProduct.product_image ? (
                      <img
                        src={fixImageUrl(selectedProduct.product_image)}
                        alt={selectedProduct.product_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#5c3d28]">{selectedProduct.product_name}</h4>
                    <p className="text-sm text-[#7b5a3b]">₱{parseFloat(selectedProduct.price).toFixed(2)}</p>
                  </div>
                </div>

                {/* Product Rating */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#5c3d28] flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Product Rating
                  </label>
                  <StarRating rating={productRating} onRatingChange={setProductRating} />
                  <p className="text-xs text-[#7b5a3b]">
                    {productRating === 0 && 'Select a rating'}
                    {productRating === 1 && '⭐ Poor'}
                    {productRating === 2 && '⭐⭐ Fair'}
                    {productRating === 3 && '⭐⭐⭐ Good'}
                    {productRating === 4 && '⭐⭐⭐⭐ Very Good'}
                    {productRating === 5 && '⭐⭐⭐⭐⭐ Excellent'}
                  </p>
                </div>
              </div>
            )}

            {/* Seller Rating */}
            <div className="bg-gradient-to-br from-white to-[#faf9f8] p-4 rounded-xl border-2 border-[#d5bfae]">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#5c3d28] flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Seller Service Rating
                </label>
                <StarRating rating={sellerRating} onRatingChange={setSellerRating} />
                <p className="text-xs text-[#7b5a3b]">
                  {sellerRating === 0 && 'Select a rating'}
                  {sellerRating === 1 && '⭐ Poor'}
                  {sellerRating === 2 && '⭐⭐ Fair'}
                  {sellerRating === 3 && '⭐⭐⭐ Good'}
                  {sellerRating === 4 && '⭐⭐⭐⭐ Very Good'}
                  {sellerRating === 5 && '⭐⭐⭐⭐⭐ Excellent'}
                </p>
              </div>
            </div>

            {/* Review Text */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#5c3d28] flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Your Review (Optional)
              </label>
              <Textarea
                placeholder="Share your experience with this product and seller..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
                className="border-2 border-[#d5bfae] focus:border-[#a4785a] resize-none"
              />
              <p className="text-xs text-[#7b5a3b]">
                Help other shoppers by sharing your honest feedback
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                onClick={() => setShowReviewDialog(false)}
                variant="outline"
                className="flex-1 border-2 border-[#d5bfae] hover:bg-[#f5f0eb]"
                disabled={submittingReview}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReview}
                disabled={submittingReview || (productRating === 0 && sellerRating === 0)}
                className="flex-1 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
              >
                {submittingReview ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4 mr-2" />
                    Submit Review
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* After-Sale Dialog */}
      <Dialog open={afterSaleDialog.open} onOpenChange={(open) => setAfterSaleDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-xl bg-gradient-to-br from-white to-[#faf9f8] border-2 border-[#d5bfae]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#5c3d28]">Return / Refund Request</DialogTitle>
            <DialogDescription className="text-[#7b5a3b]">
              Please provide details about your concern so we can assist you promptly
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-3 text-sm">
              <div className={`px-3 py-1 rounded-full border ${afterSaleStep === 1 ? 'bg-[#a4785a] text-white border-[#a4785a]' : 'bg-white text-[#5c3d28] border-[#d5bfae]'}`}>1. Select Issue</div>
              <div className={`px-3 py-1 rounded-full border ${afterSaleStep === 2 ? 'bg-[#a4785a] text-white border-[#a4785a]' : 'bg-white text-[#5c3d28] border-[#d5bfae]'}`}>2. Provide Details</div>
            </div>

            {afterSaleStep === 1 && (
              <div className="space-y-4">
                <label className="text-sm font-semibold text-[#5c3d28]">What happened to the product?</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'received_damaged_items', label: 'Received damaged items' },
                    { key: 'receive_incorrect_item', label: 'Received incorrect item' },
                    { key: 'did_not_receive_some_or_all_items', label: 'Did not receive some or all items' },
                    { key: 'others', label: 'Others' },
                  ].map(opt => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => { setSelectedIssue(opt.key); setSelectedReason(''); setCustomReason(''); }}
                      className={`p-4 rounded-xl border-2 text-left ${selectedIssue === opt.key ? 'border-[#a4785a] bg-[#f5f0eb]' : 'border-[#d5bfae] hover:border-[#a4785a]'}`}
                    >
                      <div className="font-semibold text-[#5c3d28]">{opt.label}</div>
                      <div className="text-xs text-[#7b5a3b] mt-1">{opt.key === 'others' ? 'Describe your concern on the next step' : 'We will ask for specific reason next'}</div>
                    </button>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" className="border-2 border-[#d5bfae]" onClick={() => setAfterSaleDialog({ open: false, order: null })}>Cancel</Button>
                  <Button onClick={() => {
                    if (!selectedIssue) { alert('Please select an issue first.'); return; }
                    setAfterSaleStep(2);
                  }} className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white">Next</Button>
                </div>
              </div>
            )}

            {afterSaleStep === 2 && (
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-[#5c3d28]">Specific Reason</label>
                  {selectedIssue !== 'others' ? (
                    <select
                      className="mt-2 w-full border-2 border-[#d5bfae] rounded-md p-2 text-sm"
                      value={selectedReason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                    >
                      <option value="">Select a reason</option>
                      {(reasonOptions[selectedIssue] || []).map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  ) : (
                    <Textarea
                      placeholder="Describe your issue"
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      rows={3}
                      className="mt-2 border-2 border-[#d5bfae] focus:border-[#a4785a]"
                    />
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#5c3d28]">Request Type</label>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {['return','exchange','refund','support'].map(t => (
                      <Button key={t} variant={afterSaleType === t ? 'default' : 'outline'} onClick={() => setAfterSaleType(t)}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>

                <Card className="bg-white border-2 border-[#d5bfae] shadow-sm">
                  <CardContent className="p-4">
                    <label className="text-sm font-semibold text-[#5c3d28]">Describe the issue</label>
                    <Textarea
                      placeholder="Provide details that will help us resolve your concern promptly..."
                      value={afterSaleDescription}
                      onChange={(e) => setAfterSaleDescription(e.target.value)}
                      rows={4}
                      className="mt-2 border-2 border-[#d5bfae] focus:border-[#a4785a] resize-none"
                    />
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Video uploader */}
                  <div>
                    <label className="text-sm font-semibold text-[#5c3d28] flex items-center gap-2">
                      <VideoIcon className="h-4 w-4" /> Unboxing/Proof Video {['return','refund'].includes(afterSaleType) && <span className="text-red-600">(required)</span>}
                    </label>
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          setVideoFile(file);
                          setVideoPreview(URL.createObjectURL(file));
                        }
                      }}
                      className="mt-2 border-2 border-dashed border-[#d5bfae] rounded-xl p-4 bg-[#f9f7f5] hover:border-[#a4785a] transition-colors"
                    >
                      {videoPreview ? (
                        <div className="relative">
                          <video src={videoPreview} controls className="w-full rounded-lg border border-[#d5bfae]" />
                          <button
                            type="button"
                            onClick={() => { setVideoFile(null); setVideoPreview(''); }}
                            className="absolute top-2 right-2 bg-white/90 border border-[#d5bfae] rounded-full p-1 text-[#5c3d28] hover:bg-white"
                            aria-label="Remove video"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <label htmlFor="afterSaleVideo" className="flex flex-col items-center justify-center cursor-pointer text-center">
                          <UploadCloud className="h-8 w-8 text-[#a4785a]" />
                          <span className="mt-2 text-sm text-[#5c3d28] font-medium">Drag & drop or click to upload</span>
                          <span className="text-xs text-[#7b5a3b]">Max 50MB • mp4, webm, mov, avi</span>
                          <input
                            id="afterSaleVideo"
                            type="file"
                            accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) {
                                setVideoFile(f);
                                setVideoPreview(URL.createObjectURL(f));
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Images uploader */}
                  <div>
                    <label className="text-sm font-semibold text-[#5c3d28] flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" /> Photos (up to 5) {['return','refund'].includes(afterSaleType) && <span className="text-red-600">(required)</span>}
                    </label>
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith('image/'));
                        if (!files.length) return;
                        const next = [...imageFiles, ...files].slice(0, 5);
                        setImageFiles(next);
                        setImagePreviews(next.map(f => URL.createObjectURL(f)));
                      }}
                      className="mt-2 border-2 border-dashed border-[#d5bfae] rounded-xl p-4 bg-[#f9f7f5] hover:border-[#a4785a] transition-colors"
                    >
                      <label htmlFor="afterSaleImages" className="flex flex-col items-center justify-center cursor-pointer text-center">
                        <UploadCloud className="h-8 w-8 text-[#a4785a]" />
                        <span className="mt-2 text-sm text-[#5c3d28] font-medium">Drag & drop or click to upload</span>
                        <span className="text-xs text-[#7b5a3b]">Max 5 images • 4MB each • jpg, png</span>
                        <input
                          id="afterSaleImages"
                          type="file"
                          accept="image/jpeg,image/png"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            const next = [...imageFiles, ...files].slice(0, 5);
                            setImageFiles(next);
                            setImagePreviews(next.map(f => URL.createObjectURL(f)));
                          }}
                        />
                      </label>
                      {imagePreviews.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 gap-2">
                          {imagePreviews.map((src, idx) => (
                            <div key={idx} className="relative group">
                              <img src={src} alt={`evidence-${idx}`} className="w-full h-24 object-cover rounded-lg border border-[#d5bfae]" />
                              <button
                                type="button"
                                onClick={() => {
                                  const nextFiles = imageFiles.filter((_, i) => i !== idx);
                                  setImageFiles(nextFiles);
                                  setImagePreviews(nextFiles.map(f => URL.createObjectURL(f)));
                                }}
                                className="absolute top-1 right-1 bg-white/90 border border-[#d5bfae] rounded-full p-1 text-[#5c3d28] opacity-0 group-hover:opacity-100 transition"
                                aria-label="Remove image"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between gap-3">
                  <Button variant="outline" className="border-2 border-[#d5bfae]" onClick={() => setAfterSaleStep(1)}>Back</Button>
                  <div className="flex gap-3">
                    <Button variant="outline" className="border-2 border-[#d5bfae] hover:bg-[#f5f0eb]" onClick={() => setAfterSaleDialog({ open: false, order: null })}>Cancel</Button>
                    <Button className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white" onClick={submitAfterSale}>Submit</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-24 right-4 z-50 animate-in slide-in-from-top-5 fade-in duration-500">
          <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 border-2 border-[#5c3d28]">
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-green-600 fill-green-600" />
            </div>
            <span className="font-semibold text-base">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
