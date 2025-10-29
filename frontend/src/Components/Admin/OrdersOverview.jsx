import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Eye, RefreshCw, MoreHorizontal, X, AlertTriangle } from "lucide-react";
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
  const [loading, setLoading] = useState(true);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Handle viewing order details
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setViewModalOpen(true);
  };

  // Cancel order function
  const cancelOrder = async (orderId) => {
    setCancellingOrder(orderId);
    try {
      const response = await fetch(`http://127.0.0.1:8080/api/orders-test/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Order cancelled:', result);
        // Refresh orders list
        await fetchOrders();
        alert('Order cancelled successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to cancel order: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Error cancelling order. Please try again.');
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
      'COD': 'bg-gray-100 text-gray-800',
      'GCASH': 'bg-green-100 text-green-800',
      'PAYMAYA': 'bg-blue-100 text-blue-800',
      'CARD': 'bg-purple-100 text-purple-800'
    };
    
    return (
      <Badge className={`${methodColors[paymentMethod?.toUpperCase()] || 'bg-gray-100 text-gray-800'} text-xs`}>
        {paymentMethod?.toUpperCase() || 'COD'} {isPaid ? '✓' : '⏳'}
      </Badge>
    );
  };

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      console.log('Fetching orders from API...');
      
      // Try the API first
      try {
        const response = await fetch('http://127.0.0.1:8080/api/orders-test', {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Orders data received:', data);
          setOrders(data);
          return;
        }
      } catch (apiError) {
        console.log('API not available, using mock data:', apiError.message);
      }
      
      // Fallback to mock data if API is not available
      const mockData = [
        { id: 'ORD001', customer: 'John Doe', date: '2024-01-15', amount: '₱500.00', status: 'Pending', items: 2, paymentMethod: 'COD', paymentStatus: 'pending', canCancel: true },
        { id: 'ORD002', customer: 'Jane Smith', date: '2024-01-14', amount: '₱750.00', status: 'Processing', items: 1, paymentMethod: 'GCASH', paymentStatus: 'paid', canCancel: false },
        { id: 'ORD003', customer: 'Bob Johnson', date: '2024-01-13', amount: '₱1,200.00', status: 'Shipped', items: 3, paymentMethod: 'PAYMAYA', paymentStatus: 'paid', canCancel: false },
        { id: 'ORD004', customer: 'Alice Brown', date: '2024-01-12', amount: '₱300.00', status: 'Delivered', items: 1, paymentMethod: 'COD', paymentStatus: 'paid', canCancel: false },
        { id: 'ORD005', customer: 'Charlie Wilson', date: '2024-01-11', amount: '₱900.00', status: 'Cancelled', items: 2, paymentMethod: 'GCASH', paymentStatus: 'cancelled', canCancel: false },
        { id: 'ORD006', customer: 'Gio Mc Gre Calugas', date: '2024-01-10', amount: '₱1,500.00', status: 'Delivered', items: 4, paymentMethod: 'GCASH', paymentStatus: 'paid', canCancel: false }
      ];
      
      console.log('Using mock data:', mockData);
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
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading orders...</span>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Order Management</h1>
            <p className="text-gray-500 mt-1">
              View and manage all customer orders
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={fetchOrders}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No orders found</p>
            <Button onClick={fetchOrders} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order Management</h1>
          <p className="text-gray-500 mt-1">
            View and manage all customer orders
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchOrders}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => {
            console.log('Testing API connection...');
            fetch('http://127.0.0.1:8080/api/orders-test')
              .then(response => response.json())
              .then(data => console.log('CORS test result:', data))
              .catch(error => console.error('CORS test error:', error));
          }}>
            Test API
          </Button>
          <Button variant="outline">Export</Button>
          <Button>Filter Orders</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders ({orders.length})</CardTitle>
          <CardDescription>
            Manage and review the latest orders from customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Order ID</th>
                  <th className="text-left py-3 px-4 font-medium">Customer</th>
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Items</th>
                  <th className="text-left py-3 px-4 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 font-medium">Payment</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">{order.id}</td>
                    <td className="py-3 px-4">{order.customer}</td>
                    <td className="py-3 px-4">{order.date}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-xs">
                        {order.items} item{order.items !== 1 ? 's' : ''}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-medium">{order.amount}</td>
                    <td className="py-3 px-4">
                      {getPaymentMethodBadge(order.paymentMethod, order.paymentStatus)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          order.status === "Delivered"
                            ? "default"
                            : order.status === "Packing"
                            ? "secondary"
                            : order.status === "Shipped"
                            ? "secondary"
                            : order.status === "Pending"
                            ? "outline"
                            : "destructive"
                        }
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {order.canCancel && (
                            <DropdownMenuItem 
                              onClick={() => {
                                setOrderToCancel(order);
                                setCancelDialogOpen(true);
                              }}
                              className="text-red-600 focus:text-red-600"
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
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {viewModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Order Details</h2>
                <button 
                  onClick={() => setViewModalOpen(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-all text-xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Order Header */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Order ID</h3>
                  <p className="text-lg font-mono">{selectedOrder.id}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Order Date</h3>
                  <p className="text-lg">{selectedOrder.date}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Customer</h3>
                  <p className="text-lg">{selectedOrder.customer}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Total Amount</h3>
                  <p className="text-lg font-bold text-green-600">{selectedOrder.amount}</p>
                </div>
              </div>

              {/* Status and Payment */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Order Status</h3>
                  <Badge
                    variant={
                      selectedOrder.status === "Delivered"
                        ? "default"
                        : selectedOrder.status === "Packing"
                        ? "secondary"
                        : selectedOrder.status === "Shipped"
                        ? "secondary"
                        : selectedOrder.status === "Pending"
                        ? "outline"
                        : "destructive"
                    }
                    className="text-sm"
                  >
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Payment Method</h3>
                  {getPaymentMethodBadge(selectedOrder.paymentMethod, selectedOrder.paymentStatus)}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Order Items</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Items</span>
                    <Badge variant="outline">
                      {selectedOrder.items} item{selectedOrder.items !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  {selectedOrder.products && selectedOrder.products.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {selectedOrder.products.map((product, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span>{product.name}</span>
                          <span>Qty: {product.quantity} × ₱{product.price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              {selectedOrder.location && (
                <div>
                  <h3 className="font-semibold text-gray-700">Delivery Location</h3>
                  <p className="text-gray-600">{selectedOrder.location}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setViewModalOpen(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                {selectedOrder.canCancel && (
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      setViewModalOpen(false);
                      setOrderToCancel(selectedOrder);
                      setCancelDialogOpen(true);
                    }}
                    className="flex-1"
                  >
                    Cancel Order
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Cancel Order #{orderToCancel?.id}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
              <br />
              <br />
              <strong>Order Details:</strong>
              <br />
              Customer: {orderToCancel?.customer}
              <br />
              Amount: {orderToCancel?.amount}
              <br />
              Payment Method: {orderToCancel?.paymentMethod}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Order</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => orderToCancel && cancelOrder(orderToCancel.id)}
              className="bg-red-600 hover:bg-red-700"
              disabled={cancellingOrder === orderToCancel?.id}
            >
              {cancellingOrder === orderToCancel?.id ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel Order'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default OrdersOverview;
