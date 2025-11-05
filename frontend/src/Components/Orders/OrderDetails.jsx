import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle2, XCircle, RotateCcw, Clock, MessageSquare, Calendar, MapPin, X, User, List } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import MessengerPopup from '../Messenger/MessengerPopup';
import api from '../../api';

const OrderDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [showContactSeller, setShowContactSeller] = useState(false);

  useEffect(() => {
    // Get order from location state
    if (location.state?.order) {
      const orderData = location.state.order;
      // Debug: Log the order structure to see customer data
      console.log('Order data received:', orderData);
      console.log('Customer data:', orderData.customer);
      setOrder(orderData);
    } else {
      // If no order in state, redirect back
      navigate('/orders');
    }
  }, [location.state, navigate]);

  const fixImageUrl = (url) => {
    if (!url) return url;
    if (url.includes('localhost:8000') || url.includes('localhost:8080') || url.includes('craftconnect-laravel-backend-1.onrender.com')) {
      const path = new URL(url).pathname;
      return path;
    }
    if (url.startsWith('/storage/') || url.startsWith('/images/')) {
      return url;
    }
    if (url && !url.startsWith('http') && !url.startsWith('/')) {
      return `/storage/${url}`;
    }
    return url;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusInfo = (status, paymentStatus) => {
    const statusMap = {
      'pending': {
        title: 'To Pay',
        icon: Clock,
        color: 'bg-yellow-500',
        textColor: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      },
      'processing': {
        title: 'To Package',
        icon: Package,
        color: 'bg-yellow-500',
        textColor: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      },
      'packing': {
        title: 'To Ship',
        icon: Truck,
        color: 'bg-blue-500',
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      'shipped': {
        title: 'To Receive',
        icon: Truck,
        color: 'bg-purple-500',
        textColor: 'text-purple-700',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
      },
      'delivered': {
        title: 'Completed',
        icon: CheckCircle2,
        color: 'bg-green-500',
        textColor: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      },
      'cancelled': {
        title: 'Cancelled',
        icon: XCircle,
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      },
      'payment_failed': {
        title: 'Return/Refund',
        icon: XCircle,
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      },
      'returned': {
        title: 'Return/Refund',
        icon: RotateCcw,
        color: 'bg-orange-500',
        textColor: 'text-orange-700',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      }
    };

    return statusMap[status] || statusMap['pending'];
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Loading order details...</p>
          <Button onClick={() => navigate('/orders')}>Back to Orders</Button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status, order.paymentStatus);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-[#e5ded7] sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/orders')}
                className="hover:bg-[#f5f0eb]"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-[#5c3d28]">Order Details</h1>
                <p className="text-sm text-[#7b5a3b]">Order #{order.order_number || order.orderNumber || `ORD-${order.orderID}` || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Information */}
          <Card className="border border-[#d5bfae] bg-white shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-[#5c3d28] mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-[#a4785a]" />
                Order Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#5c3d28] mb-1">Order ID</label>
                  <p className="text-base font-semibold text-[#7b5a3b] bg-[#faf9f8] px-3 py-2 rounded-lg border border-[#d5bfae]">
                    {order.order_number || order.orderNumber || `ORD-${order.orderID}` || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5c3d28] mb-1">Order Status</label>
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`h-4 w-4 ${statusInfo.textColor}`} />
                    <span className={`text-base font-semibold ${statusInfo.textColor}`}>
                      {statusInfo.title}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5c3d28] mb-1">Order Time</label>
                  <p className="text-base text-[#7b5a3b] bg-[#faf9f8] px-3 py-2 rounded-lg border border-[#d5bfae]">
                    {formatDateTime(order.orderDate || order.created_at)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5c3d28] mb-1">Payment Method</label>
                  <p className="text-base text-[#7b5a3b] bg-[#faf9f8] px-3 py-2 rounded-lg border border-[#d5bfae]">
                    {order.payment_method === 'cod' ? 'Cash on Delivery (COD)' : 
                     order.payment_method === 'gcash' ? 'GCash' :
                     order.payment_method === 'paymaya' ? 'PayMaya' :
                     order.payment_method?.toUpperCase() || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5c3d28] mb-1">Payment Status</label>
                  <p className="text-base text-[#7b5a3b] bg-[#faf9f8] px-3 py-2 rounded-lg border border-[#d5bfae]">
                    {order.paymentStatus === 'paid' ? 'Paid' : 
                     order.paymentStatus === 'pending' ? 'Pending' : 
                     'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5c3d28] mb-1">Payment Time</label>
                  <p className="text-base text-[#7b5a3b] bg-[#faf9f8] px-3 py-2 rounded-lg border border-[#d5bfae]">
                    {order.payment_method === 'cod' ? '-' : 
                     (order.paymentStatus === 'paid' && (order.payment_date || order.paid_at || order.paymentDate)) 
                     ? formatDateTime(order.payment_date || order.paid_at || order.paymentDate) 
                     : order.paymentStatus === 'paid' ? formatDateTime(order.orderDate || order.created_at)
                     : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card className="border border-[#d5bfae] bg-white shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-[#5c3d28] mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5 text-[#a4785a]" />
                Shipping Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Name */}
                <div>
                  <label className="block text-sm font-medium text-[#5c3d28] mb-1 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Customer Name
                  </label>
                  <p className="text-base text-[#7b5a3b] bg-[#faf9f8] px-3 py-2 rounded-lg border border-[#d5bfae]">
                    {order.customer?.userName || 
                     order.customer?.user?.userName || 
                     (typeof order.customer === 'string' ? order.customer : 'N/A')}
                  </p>
                </div>
                
                {/* Delivery Status */}
                <div>
                  <label className="block text-sm font-medium text-[#5c3d28] mb-1">Delivery Status</label>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const statusInfo = getStatusInfo(order.status, order.paymentStatus);
                      const StatusIcon = statusInfo.icon;
                      return (
                        <>
                          <StatusIcon className={`h-4 w-4 ${statusInfo.textColor}`} />
                          <span className={`text-base font-semibold ${statusInfo.textColor}`}>
                            {statusInfo.title}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>
                
                {/* Delivery Address */}
                <div>
                  <label className="block text-sm font-medium text-[#5c3d28] mb-1 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Delivery Address
                  </label>
                  <p className="text-base text-[#7b5a3b] bg-[#faf9f8] px-3 py-2 rounded-lg border border-[#d5bfae]">
                    {order.shipping?.delivery_address || 
                     order.location || 
                     (order.customer?.userAddress || order.customer?.user?.userAddress ? [
                       order.customer?.userAddress || order.customer?.user?.userAddress,
                       order.customer?.userCity || order.customer?.user?.userCity,
                       order.customer?.userProvince || order.customer?.user?.userProvince
                     ].filter(Boolean).join(', ') : null) || 
                     'N/A'}
                    {order.shipping?.delivery_city && !order.shipping?.delivery_address && !order.location && `, ${order.shipping.delivery_city}`}
                    {order.shipping?.delivery_province && !order.shipping?.delivery_address && !order.location && `, ${order.shipping.delivery_province}`}
                  </p>
                </div>
                
                {/* Tracking Number */}
                <div>
                  <label className="block text-sm font-medium text-[#5c3d28] mb-1">Tracking Number</label>
                  <p className="text-base font-mono text-[#7b5a3b] bg-[#faf9f8] px-3 py-2 rounded-lg border border-[#d5bfae]">
                    {order.tracking_number || 'Not yet assigned'}
                  </p>
                </div>
              </div>
              
              {/* Estimated Delivery - Full width if available */}
              {order.shipping?.estimated_delivery && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-[#5c3d28] mb-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Estimated Delivery
                  </label>
                  <p className="text-base text-[#7b5a3b] bg-[#faf9f8] px-3 py-2 rounded-lg border border-[#d5bfae]">
                    {formatDate(order.shipping.estimated_delivery)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Products */}
          <Card className="border border-[#d5bfae] bg-white shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-[#5c3d28] mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-[#a4785a]" />
                Products ({order.items?.length || 0})
              </h3>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {order.items && order.items.map((item, index) => {
                  // Get seller name from various possible locations (API provides seller_name directly)
                  const sellerName = item.seller_name || 
                                   item.product?.seller?.businessName || 
                                   item.product?.seller?.user?.userName || 
                                   item.seller?.businessName || 
                                   item.seller?.userName ||
                                   item.seller?.user?.userName ||
                                   item.product?.seller?.businessName ||
                                   'Unknown Seller';
                  
                  // Get SKU from various possible locations (API provides sku directly)
                  const sku = item.sku || 
                            item.product?.sku ||
                            'N/A';
                  
                  return (
                    <div key={item.order_product_id || index} className="bg-[#faf9f8] p-4 rounded-lg border border-[#d5bfae]">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-[#d5bfae]">
                          {item.product_image ? (
                            <img
                              src={fixImageUrl(item.product_image)}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-bold text-[#5c3d28] text-lg mb-2">{item.product_name}</h4>
                          {sku && sku !== 'N/A' && (
                            <p className="text-xs text-[#7b5a3b] font-mono bg-white px-2 py-1 rounded inline-block mb-2">
                              SKU: {sku}
                            </p>
                          )}
                          <p className="text-sm text-[#7b5a3b] mb-2">
                            <span className="font-medium">Seller:</span> <span className="text-[#5c3d28]">{sellerName}</span>
                          </p>
                          <div className="flex items-center gap-4 text-sm text-[#7b5a3b]">
                            <span>Quantity: <span className="font-semibold">{item.quantity}</span></span>
                            <span>Price: <span className="font-semibold">₱{parseFloat(item.price || 0).toFixed(2)}</span></span>
                            <span className="ml-auto font-bold text-[#5c3d28]">
                              Subtotal: ₱{(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Total Amount */}
              <div className="mt-4 pt-4 border-t border-[#d5bfae]">
                <div className="flex justify-between items-center">
                  <label className="text-lg font-semibold text-[#5c3d28]">Total Amount:</label>
                  <p className="text-2xl font-bold text-[#5c3d28] bg-[#faf9f8] px-4 py-2 rounded-lg border border-[#d5bfae]">
                    ₱{parseFloat(order.totalAmount || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support Center */}
          <Card className="border border-[#d5bfae] bg-white shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-[#5c3d28] mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#a4785a]" />
                Support Center
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(order.sellerID || order.items?.[0]?.product?.seller_id || order.items?.[0]?.seller_id) && (
                    <>
                      <Button
                        onClick={() => {
                          setShowContactSeller(true);
                        }}
                        className="w-full bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white font-semibold py-3"
                      >
                        <MessageSquare className="h-5 w-5 mr-2" />
                        Contact Seller
                      </Button>
                      <Button
                        onClick={async () => {
                          try {
                            // Fetch customer conversations
                            const response = await api.get('/chat/conversations');
                            if (response.data && response.data.length > 0) {
                              // Store conversations and navigate to home to view chat list
                              // The home page or chat component should handle displaying the conversations
                              sessionStorage.setItem('showChatList', 'true');
                              sessionStorage.setItem('chatConversations', JSON.stringify(response.data));
                              navigate('/home');
                            } else {
                              alert('You have no conversations yet. Click "Contact Seller" to start a conversation.');
                            }
                          } catch (error) {
                            console.error('Error fetching conversations:', error);
                            if (error.response?.status === 404) {
                              // API endpoint might not exist, try alternative
                              try {
                                const altResponse = await api.get('/chat/customer/conversations');
                                if (altResponse.data && altResponse.data.length > 0) {
                                  sessionStorage.setItem('showChatList', 'true');
                                  sessionStorage.setItem('chatConversations', JSON.stringify(altResponse.data));
                                  navigate('/home');
                                } else {
                                  alert('You have no conversations yet. Click "Contact Seller" to start a conversation.');
                                }
                              } catch (altError) {
                                console.error('Error with alternative endpoint:', altError);
                                alert('Unable to load chat list. Please try "Contact Seller" instead.');
                              }
                            } else {
                              alert('Unable to load chat list. Please try "Contact Seller" instead.');
                            }
                          }
                        }}
                        variant="outline"
                        className="w-full border-2 border-[#a4785a] text-[#a4785a] hover:bg-[#f5f0eb] font-semibold py-3"
                      >
                        <List className="h-5 w-5 mr-2" />
                        View All Chats
                      </Button>
                    </>
                  )}
                </div>
                <p className="text-sm text-[#7b5a3b]">
                  Need help with your order? Contact the seller directly through our messaging system or view all your conversations.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact Seller Messenger */}
      {showContactSeller && order && (
        <MessengerPopup
          isOpen={showContactSeller}
          onClose={() => setShowContactSeller(false)}
          sellerId={order.sellerID || order.items?.[0]?.product?.seller_id || order.items?.[0]?.seller_id}
          sellerUserId={order.seller?.user_id || order.items?.[0]?.seller?.user_id || order.items?.[0]?.product?.seller?.user_id || order.items?.[0]?.product?.seller?.user?.userID}
          sellerName={order.seller?.businessName || order.items?.[0]?.seller?.businessName || order.items?.[0]?.product?.seller?.businessName || order.items?.[0]?.product?.seller?.user?.userName || 'Seller'}
          sellerAvatar={order.seller?.logo_url || order.items?.[0]?.seller?.logo_url || order.items?.[0]?.product?.seller?.logo_url}
        />
      )}
    </div>
  );
};

export default OrderDetails;

