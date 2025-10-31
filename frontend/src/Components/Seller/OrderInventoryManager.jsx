/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Search, Filter, Plus, Download, RefreshCw, Edit, Trash2, Image as ImageIcon, ShoppingBag, Share2, MoreHorizontal, Package, Truck } from "lucide-react";
import { AddProductModal } from "./AddProductModal";
import EditProductModal from "./EditProductModal";
import { useOrdersData } from "../../hooks/useOrdersData";
import LoadingSpinner from "../ui/LoadingSpinner";
import api from "../../api";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import ShippingSimulation from "./ShippingSimulation";

const ShippingTab = () => {
  return <ShippingSimulation />;
};

const OrdersTab = () => {
  const { ordersData, loading, error, refetch } = useOrdersData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isStatusChangeOpen, setIsStatusChangeOpen] = useState(false);
  const [orderToUpdate, setOrderToUpdate] = useState(null);
  const [openActionMenu, setOpenActionMenu] = useState(null);

  // Auto-refresh functionality (silent background refresh)
  useEffect(() => {
    const interval = setInterval(() => {
      // Silent refresh - call refetch from the hook
      refetch();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "processing": return "bg-yellow-100 text-yellow-800";
      case "shipped": return "bg-blue-100 text-blue-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "packing": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const statusOptions = [
    { value: "all", label: "All Orders" },
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "packing", label: "Packing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" }
  ];

  // Filter orders based on search term and status
  const filteredOrders = ordersData ? ordersData.filter(order => {
    const matchesSearch = order.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  }) : [];

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleStatusChange = (order) => {
    setOrderToUpdate(order);
    setIsStatusChangeOpen(true);
  };


  const updateOrderStatus = async (newStatus) => {
    try {
      console.log('Full order object:', orderToUpdate);
      console.log(`Updating order ${orderToUpdate.id} to ${newStatus}`);
      
      // The backend updateStatus method expects the database ID, not the order_number
      // We need to use orderToUpdate.orderID (which is the database ID)
      let orderId = orderToUpdate.orderID;
      
      if (!orderId) {
        console.error('Could not find order ID from:', orderToUpdate);
        alert('Error: Could not find order ID');
        return;
      }
      
      console.log('Using database order ID:', orderId);
      console.log('API endpoint:', `/orders/${orderId}/status`);
      
      // Use the correct API endpoint: PUT /orders/{orderId}/status
      const response = await api.put(`/orders/${orderId}/status`, {
        status: newStatus
      });
      
      console.log('Order status update response:', response.data);
      
      if (response.data.success || response.data.order) {
        alert(`Order status updated to ${newStatus} successfully!`);
        setIsStatusChangeOpen(false);
        setOrderToUpdate(null);
        refetch();
      } else {
        alert('Failed to update order status. Please try again.');
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      console.error("Error response:", error.response?.data);
      alert(error.response?.data?.message || error.response?.data?.error || "Error updating order status. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="w-full pt-4">
        <LoadingSpinner message="Loading orders..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full pt-4">
        <ErrorState message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Search and Filters - Mobile First */}
      <div className="flex flex-col gap-2">
        <div className="relative w-full">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#a4785a]" />
          <Input 
            placeholder="Search orders..." 
            className="pl-7 pr-2 py-1.5 text-xs border border-[#d5bfae] rounded focus:border-[#a4785a] focus:ring-1 focus:ring-[#a4785a]/20 transition-all h-8" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="h-7 border border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] hover:border-[#a4785a] transition-all duration-200 text-[10px] px-2"
          >
            <Filter className="mr-1 h-3 w-3" />Filter
            {statusFilter !== "all" && (
              <Badge className="ml-1 bg-[#a4785a] text-white text-[10px] px-1">1</Badge>
            )}
          </Button>
          {isFilterOpen && (
            <div className="absolute top-[6.5rem] left-0 right-0 bg-white border border-[#d5bfae] rounded shadow-lg z-10 p-2">
              <div className="text-[10px] font-semibold text-[#5c3d28] mb-1">Filter by Status</div>
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setStatusFilter(option.value);
                    setIsFilterOpen(false);
                  }}
                  className={`w-full text-left px-2 py-1 rounded transition-all text-[10px] ${
                    statusFilter === option.value
                      ? "bg-[#7b5a3b] text-white"
                      : "hover:bg-[#f8f1ec] text-[#5c3d28]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm"
            className="h-7 border border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] hover:border-[#a4785a] transition-all duration-200 text-[10px] px-2"
          >
            <Download className="h-3 w-3" />Export
          </Button>
        </div>
      </div>

        <Card className="border-[#e5ded7] shadow overflow-visible">
          <CardHeader className="pb-2 border-b border-[#e5ded7] bg-[#faf9f8] px-2">
            <CardTitle className="text-[#5c3d28] text-sm">Recent Orders</CardTitle>
            <CardDescription className="text-[#7b5a3b] text-[10px]">Manage your customer orders and track their status</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 px-2 overflow-visible">
            <div className="overflow-x-auto -mx-2 overflow-y-visible">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px] px-2 py-2">ID</TableHead>
                <TableHead className="text-[10px] px-2 py-2">Customer</TableHead>
                <TableHead className="text-[10px] px-2 py-2">Total</TableHead>
                <TableHead className="text-[10px] px-2 py-2">Status</TableHead>
                <TableHead className="w-8 px-1 py-2"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    <EmptyState
                      icon="📦"
                      title="No Orders"
                      description={searchTerm ? "No matching orders" : "No orders yet"}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order, index) => (
                  <TableRow key={order.id || `order-${index}`}>
                    <TableCell className="font-medium text-[10px] px-2 py-2">{order.id}</TableCell>
                    <TableCell className="text-[10px] px-2 py-2 truncate max-w-[80px]">{order.customer}</TableCell>
                    <TableCell className="text-[10px] px-2 py-2 font-semibold">{order.total}</TableCell>
                    <TableCell className="px-2 py-2">
                      <Badge className={`${getStatusColor(order.status)} text-[10px]`} variant="outline">
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-2 py-2">
                      {/* Desktop: Show all actions directly */}
                      <div className="hidden sm:flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('View button clicked for order:', order.id);
                            handleViewOrder(order);
                          }}
                          className="px-3 py-1 text-[10px] bg-white border border-[#a4785a] text-[#a4785a] rounded hover:!bg-[#a4785a] hover:!text-white cursor-pointer transition-all duration-200"
                          style={{ backgroundColor: 'white', color: '#a4785a' }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#a4785a';
                            e.target.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.color = '#a4785a';
                          }}
                        >
                          View Details
                        </button>
                        {(order.status?.toLowerCase() === "pending" || order.status?.toLowerCase() === "processing") && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Pack button clicked for order:', order.id);
                              handleStatusChange(order);
                            }}
                            className="px-3 py-1 text-[10px] bg-white border border-[#a4785a] text-[#a4785a] rounded hover:!bg-[#a4785a] hover:!text-white cursor-pointer transition-all duration-200"
                            style={{ backgroundColor: 'white', color: '#a4785a' }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#a4785a';
                              e.target.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'white';
                              e.target.style.color = '#a4785a';
                            }}
                          >
                            Pack
                          </button>
                        )}
                      </div>
                      
                      {/* Mobile: Show dropdown */}
                      <div className="sm:hidden flex items-center justify-end">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const orderKey = order.id || `order-${index}`;
                            console.log('Mobile menu clicked for order:', orderKey);
                            setOpenActionMenu(openActionMenu === orderKey ? null : orderKey);
                          }}
                          className="p-2 bg-gray-200 hover:bg-gray-300 rounded cursor-pointer"
                        >
                          <MoreHorizontal className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                      
                      {/* Dropdown positioned relative to TableCell */}
                      {openActionMenu === (order.id || `order-${index}`) && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setOpenActionMenu(null)} />
                          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 min-w-[120px] py-1">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('View clicked in dropdown for order:', order.id);
                                handleViewOrder(order);
                                setOpenActionMenu(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-[10px] bg-white text-[#a4785a] hover:!bg-[#a4785a] hover:!text-white cursor-pointer transition-all duration-200"
                              style={{ backgroundColor: 'white', color: '#a4785a' }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#a4785a';
                                e.target.style.color = 'white';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'white';
                                e.target.style.color = '#a4785a';
                              }}
                            >
                              View Details
                            </button>
                            {(order.status?.toLowerCase() === "pending" || order.status?.toLowerCase() === "processing") && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('Pack clicked in dropdown for order:', order.id);
                                  handleStatusChange(order);
                                  setOpenActionMenu(null);
                                }}
                                className="w-full text-left px-3 py-1.5 text-[10px] bg-white text-[#a4785a] hover:!bg-[#a4785a] hover:!text-white cursor-pointer transition-all duration-200"
                                style={{ backgroundColor: 'white', color: '#a4785a' }}
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor = '#a4785a';
                                  e.target.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor = 'white';
                                  e.target.style.color = '#a4785a';
                                }}
                              >
                                Pack Order
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Order Modal */}
      {isViewModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg sm:rounded-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] p-4 sm:p-6 rounded-t-lg sm:rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-2xl font-bold text-white">Order Details</h2>
                <button 
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-white hover:bg-white/20 rounded-full p-1.5 sm:p-2 transition-all text-lg sm:text-xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">Order ID</p>
                  <p className="text-base sm:text-lg font-semibold text-[#5c3d28]">{selectedOrder.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">Status</p>
                  <Badge className={`${getStatusColor(selectedOrder.status)} text-xs`}>
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">Customer</p>
                  <p className="text-base sm:text-lg font-semibold text-[#5c3d28]">{selectedOrder.customer}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">Date</p>
                  <p className="text-base sm:text-lg font-semibold text-[#5c3d28]">{selectedOrder.date}</p>
                </div>
              </div>

              {/* Products List */}
              <div className="border-t border-[#e5ded7] pt-3 sm:pt-4">
                <h3 className="text-base sm:text-lg font-semibold text-[#5c3d28] mb-2 sm:mb-3">Order Items</h3>
                <div className="bg-[#faf9f8] rounded-lg border border-[#e5ded7] overflow-hidden">
                  <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-[#f8f1ec] to-[#faf9f8] hover:bg-gradient-to-r">
                        <TableHead className="font-semibold">Product</TableHead>
                        <TableHead className="font-semibold">SKU</TableHead>
                        <TableHead className="font-semibold text-center">Qty</TableHead>
                        <TableHead className="font-semibold text-right">Price</TableHead>
                        <TableHead className="font-semibold text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.products && selectedOrder.products.length > 0 ? (
                        selectedOrder.products.map((product, index) => (
                          <TableRow key={index} className="hover:bg-white/50">
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {product.product_image && (
                                  <img 
                                    src={product.product_image} 
                                    alt={product.product_name}
                                    className="h-10 w-10 rounded object-cover"
                                  />
                                )}
                                <span className="font-medium text-[#5c3d28]">{product.product_name || 'Unknown Product'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <code className="text-xs bg-[#e5ded7] px-2 py-1 rounded text-[#7b5a3b]">
                                {product.sku || 'N/A'}
                              </code>
                            </TableCell>
                            <TableCell className="text-center font-medium">
                              {product.quantity}
                            </TableCell>
                            <TableCell className="text-right text-[#5c3d28]">
                              ₱{parseFloat(product.price || 0).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-[#5c3d28]">
                              ₱{parseFloat(product.total_amount || 0).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                            No product details available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  </div>
                </div>
              </div>

              {/* Total Summary */}
              <div className="border-t border-[#e5ded7] pt-3 sm:pt-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">Total Items</p>
                  <p className="text-base sm:text-lg font-semibold text-[#5c3d28]">{selectedOrder.items}</p>
                </div>
                <div className="flex justify-between items-center bg-gradient-to-r from-[#f8f1ec] to-[#faf9f8] p-2 sm:p-3 rounded-lg">
                  <p className="text-sm sm:text-base font-semibold text-[#5c3d28]">Total Amount</p>
                  <p className="text-xl sm:text-2xl font-bold text-[#a4785a]">{selectedOrder.total}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-[#e5ded7]">
                <Button 
                  onClick={() => setIsViewModalOpen(false)}
                  variant="outline"
                  className="w-full sm:flex-1 border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] text-sm"
                >
                  Close
                </Button>
                {(selectedOrder.status?.toLowerCase() === "pending" || selectedOrder.status?.toLowerCase() === "processing") && (
                  <Button 
                    onClick={() => {
                      setIsViewModalOpen(false);
                      handleStatusChange(selectedOrder);
                    }}
                    className="w-full sm:flex-1 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white hover:from-[#8f674a] hover:to-[#6a4c34] text-sm"
                  >
                    Mark as Packed
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {isStatusChangeOpen && orderToUpdate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg sm:rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] p-4 sm:p-6 rounded-t-lg sm:rounded-t-2xl">
              <h2 className="text-lg sm:text-2xl font-bold text-white">Update Order Status</h2>
            </div>
            
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="bg-[#f8f1ec] border-2 border-[#e5ded7] rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Order ID</p>
                <p className="text-base sm:text-lg font-bold text-[#5c3d28]">{orderToUpdate.id}</p>
                <p className="text-xs sm:text-sm text-gray-600 mt-2">Current Status</p>
                <Badge className={`mt-1 text-xs ${getStatusColor(orderToUpdate.status)}`}>
                  {orderToUpdate.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-xs sm:text-sm font-semibold text-[#5c3d28]">Change status to:</p>
                <Button
                  onClick={() => updateOrderStatus("packing")}
                  className="w-full bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white hover:from-[#8f674a] hover:to-[#6a4c34] justify-start text-sm"
                >
                  📦 Packing
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-[#e5ded7]">
                <Button 
                  onClick={() => {
                    setIsStatusChangeOpen(false);
                    setOrderToUpdate(null);
                  }}
                  variant="outline"
                  className="w-full sm:flex-1 border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] text-sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// InventoryTab moved to InventoryManager.jsx - not used here anymore
const InventoryTab_DEPRECATED = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    productName: "",
    productDescription: "",
    productPrice: "",
    productQuantity: "",
    category: "",
    productImage: null,
    productVideo: null,
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isViewProductOpen, setIsViewProductOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [productToShare, setProductToShare] = useState(null);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [quantityChange, setQuantityChange] = useState(0);

  // Fetch products from backend
  useEffect(() => {
    fetchProducts(true); // Show loading on initial fetch
  }, []);

  // Auto-refresh functionality for inventory (silent background refresh)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchProducts(false); // Silent refresh - no loading state
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      console.log("Fetching products with cookie-based authentication");

      const response = await api.get("/seller/products");

      console.log("Response status:", response.status);

      if (response.data) {
        const result = response.data;
        console.log("API Response:", result);

        // Check if the response has the expected data structure
        if (result.status === 'success' && Array.isArray(result.data)) {
          setInventory(result.data);
        } else if (Array.isArray(result)) {
          // Fallback in case the API returns the array directly
          setInventory(result);
        } else {
          console.error('Unexpected response format:', result);
          setInventory([]);
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      if (showLoading) {
        setError(`Failed to fetch products: ${error.message}`);
      }
      setInventory([]);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setNewProduct({
      productName: "",
      productDescription: "",
      productPrice: "",
      productQuantity: "",
      category: "",
      productImage: null,
      productVideo: null,
    });
  };

  const handleAddProduct = async (formData) => {
    try {
      console.log("Adding new product:", Object.fromEntries(formData));

      const response = await api.post("/products", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("Upload response status:", response.status);

      if (response.data) {
        const result = response.data;
        console.log("Product added successfully:", result.message || "Product added successfully");
        alert("Product added successfully!");
        
        setIsAddDialogOpen(false);
        resetForm();
        fetchProducts(); // Refresh the list
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Error adding product. Please try again.");
    }
  };

  const handleUpdateProduct = async (formData, productId) => {
    try {
      // Use the productId parameter or fall back to currentProduct
      const idToUse = productId || currentProduct?.product_id || currentProduct?.id;
      
      if (!idToUse) {
        alert("Product ID not found. Please try again.");
        return;
      }

      // Ensure _method is set to PUT for Laravel
      if (!formData.has('_method')) {
        formData.append('_method', 'PUT');
      }

      console.log("Updating product with ID:", idToUse);
      const response = await api.post(`/products/${idToUse}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        const result = response.data;
        console.log("Product updated successfully:", result);
        alert("Product updated successfully!");
        setIsEditDialogOpen(false);
        fetchProducts(); // Refresh the list
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Error updating product. Please try again.");
    }
  };


  const handleEditClick = (product) => {
    setCurrentProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleViewProduct = (product) => {
    setCurrentProduct(product);
    setIsViewProductOpen(true);
  };

  const handleShareProduct = (product) => {
    setProductToShare(product);
    setIsShareModalOpen(true);
  };

  const handleQuantityClick = (product) => {
    setCurrentProduct(product);
    setQuantityChange(0);
    setIsQuantityModalOpen(true);
  };

  const handleUpdateQuantity = async () => {
    if (!currentProduct) return;
    
    try {
      const newQuantity = (currentProduct.productQuantity || 0) + quantityChange;
      
      if (newQuantity < 0) {
        alert('Quantity cannot be negative!');
        return;
      }

      const formData = new FormData();
      // Send all required fields
      formData.append('productName', currentProduct.productName);
      formData.append('productDescription', currentProduct.productDescription || '');
      formData.append('productPrice', currentProduct.productPrice);
      formData.append('productQuantity', newQuantity);
      formData.append('category', currentProduct.category);
      formData.append('status', currentProduct.status || 'in stock');
      formData.append('publish_status', currentProduct.publish_status || 'draft');
      formData.append('_method', 'PUT');

      const idToUse = currentProduct.product_id || currentProduct.id;
      const response = await api.post(`/products/${idToUse}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        alert(`Quantity updated successfully! New quantity: ${newQuantity}`);
        setIsQuantityModalOpen(false);
        setCurrentProduct(null);
        setQuantityChange(0);
        fetchProducts(false); // Silent refresh
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Error updating quantity. Please try again.");
    }
  };

  const copyProductLink = () => {
    if (productToShare) {
      // Use product_id for the customer-facing product detail page
      const productId = productToShare.product_id || productToShare.id;
      const baseUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
      const productLink = `${baseUrl}/product/${productId}`;
      navigator.clipboard.writeText(productLink).then(() => {
        alert('Product link copied to clipboard!');
      }).catch(() => {
        alert('Failed to copy link. Please try again.');
      });
    }
  };

  const handlePostToSocialMedia = async (platform) => {
    if (!productToShare) return;

    try {
      // Generate preview image first
      const previewCanvas = await generateProductPreviewCanvas();
      
      if (!previewCanvas) {
        alert('Failed to generate preview image. Please try again.');
        return;
      }

      // Convert canvas to blob
      const previewBlob = await new Promise((resolve) => {
        previewCanvas.toBlob(resolve, 'image/png');
      });

      // Prepare post data
      const productId = productToShare.product_id || productToShare.id;
      const baseUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
      const productLink = `${baseUrl}/product/${productId}`;
      const message = `Check out this handcrafted product: ${productToShare.productName}\n\n${productToShare.productDescription || 'Handmade with love and care!'}\n\nCategory: ${productToShare.category}`;

      // Store data in sessionStorage to pass to SocialMedia page
      const postData = {
        message: message,
        link: productLink,
        platform: platform,
        productName: productToShare.productName,
      };

      // Store preview image as base64
      const reader = new FileReader();
      reader.onloadend = () => {
        postData.imageData = reader.result;
        sessionStorage.setItem('pendingPost', JSON.stringify(postData));
        
        // Navigate to Social Media page
        window.location.href = '/seller/social-media?tab=posts&platform=' + platform;
      };
      reader.readAsDataURL(previewBlob);

    } catch (error) {
      console.error('Error preparing post:', error);
      alert('Failed to prepare post. Please try again.');
    }
  };

  const generateProductPreviewCanvas = async () => {
    if (!productToShare) return null;

    try {
      // Fetch seller and store information
      const [sellerResponse, storeResponse] = await Promise.all([
        api.get('/sellers/profile').catch(() => ({ data: null })),
        api.get('/store/me').catch(() => ({ data: null }))
      ]);

      const sellerData = sellerResponse.data;
      const storeData = storeResponse.data;

      // Create a canvas element for the preview
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Add roundRect method to canvas context (not available by default)
      if (!ctx.roundRect) {
        ctx.roundRect = function(x, y, width, height, radius) {
          this.beginPath();
          this.moveTo(x + radius, y);
          this.lineTo(x + width - radius, y);
          this.quadraticCurveTo(x + width, y, x + width, y + radius);
          this.lineTo(x + width, y + height - radius);
          this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
          this.lineTo(x + radius, y + height);
          this.quadraticCurveTo(x, y + height, x, y + height - radius);
          this.lineTo(x, y + radius);
          this.quadraticCurveTo(x, y, x + radius, y);
          this.closePath();
        };
      }
      
      // Set canvas size (Instagram post size: 1080x1080)
      canvas.width = 1080;
      canvas.height = 1080;
      
      // Professional background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#f8f6f0');
      gradient.addColorStop(0.3, '#e8e2d5');
      gradient.addColorStop(1, '#d4c4a8');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add subtle pattern overlay
      ctx.fillStyle = 'rgba(164, 120, 90, 0.05)';
      for (let i = 0; i < canvas.width; i += 40) {
        for (let j = 0; j < canvas.height; j += 40) {
          ctx.fillRect(i, j, 1, 1);
        }
      }
      
      // Load store logo if available
      let storeLogo = null;
      if (storeData?.logo_url) {
        try {
          storeLogo = await loadImage(storeData.logo_url);
        } catch (error) {
          console.warn('Could not load store logo:', error);
        }
      }
      
      // Add store logo at top
      if (storeLogo) {
        const logoSize = 80;
        const logoX = 50;
        const logoY = 50;
        ctx.drawImage(storeLogo, logoX, logoY, logoSize, logoSize);
      }
      
      // Add product image if available
      if (productToShare.productImage) {
        try {
          let imageUrl = productToShare.productImage;
          if (imageUrl.includes('/storage/')) {
            imageUrl = imageUrl.replace('/storage/', '/images/');
          }
          
          const productImg = await loadImage(imageUrl);
          
          const imageSize = 500;
          const x = (canvas.width - imageSize) / 2;
          const y = 180;
          
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = 20;
          ctx.shadowOffsetX = 10;
          ctx.shadowOffsetY = 10;
          
          ctx.fillStyle = '#ffffff';
          ctx.roundRect(x - 20, y - 20, imageSize + 40, imageSize + 40, 20);
          ctx.fill();
          
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          
          ctx.drawImage(productImg, x, y, imageSize, imageSize);
          
        } catch (error) {
          console.warn('Could not load image:', error);
          
          const placeholderSize = 500;
          const x = (canvas.width - placeholderSize) / 2;
          const y = 180;
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.roundRect(x, y, placeholderSize, placeholderSize, 20);
          ctx.fill();
          
          ctx.fillStyle = '#a4785a';
          ctx.font = '48px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('📦', canvas.width / 2, canvas.height / 2 - 20);
          
          ctx.fillStyle = '#7b5a3b';
          ctx.font = '24px Arial';
          ctx.fillText('Product Image', canvas.width / 2, canvas.height / 2 + 40);
        }
      }
      
      // Add professional text overlay
      await addProfessionalTextOverlay(ctx, canvas, sellerData, storeData);
      
      return canvas;
    } catch (error) {
      console.error('Error generating preview canvas:', error);
      return null;
    }
  };

  const shareProductViaSocial = (platform) => {
    if (!productToShare) return;
    
    // Use product_id for the customer-facing product detail page
    const productId = productToShare.product_id || productToShare.id;
    const baseUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
    const productLink = `${baseUrl}/product/${productId}`;
    const shareText = `Check out this handcrafted product: ${productToShare.productName}`;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productLink)}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct URL sharing, so we'll copy the link
        navigator.clipboard.writeText(productLink).then(() => {
          alert('Product link copied! Paste it in your Instagram post caption.');
        }).catch(() => {
          alert('Failed to copy link. Please try again.');
        });
        return;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(productLink)}`;
        break;
      case 'messenger':
        shareUrl = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(productLink)}&app_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(window.location.origin)}`;
        break;
      default:
        return;
    }
    
    // Open in a properly sized popup window
    const width = 600;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    window.open(
      shareUrl, 
      'share-dialog',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  };

  const generateProductPreview = async () => {
    if (!productToShare) return;

    try {
      // Fetch seller and store information
      const [sellerResponse, storeResponse] = await Promise.all([
        api.get('/sellers/profile').catch(() => ({ data: null })),
        api.get('/store/me').catch(() => ({ data: null }))
      ]);

      const sellerData = sellerResponse.data;
      const storeData = storeResponse.data;

      // Create a canvas element for the preview
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Add roundRect method to canvas context (not available by default)
      if (!ctx.roundRect) {
        ctx.roundRect = function(x, y, width, height, radius) {
          this.beginPath();
          this.moveTo(x + radius, y);
          this.lineTo(x + width - radius, y);
          this.quadraticCurveTo(x + width, y, x + width, y + radius);
          this.lineTo(x + width, y + height - radius);
          this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
          this.lineTo(x + radius, y + height);
          this.quadraticCurveTo(x, y + height, x, y + height - radius);
          this.lineTo(x, y + radius);
          this.quadraticCurveTo(x, y, x + radius, y);
          this.closePath();
        };
      }
      
      // Set canvas size (Instagram post size: 1080x1080)
      canvas.width = 1080;
      canvas.height = 1080;
      
      // Professional background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#f8f6f0');
      gradient.addColorStop(0.3, '#e8e2d5');
      gradient.addColorStop(1, '#d4c4a8');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add subtle pattern overlay
      ctx.fillStyle = 'rgba(164, 120, 90, 0.05)';
      for (let i = 0; i < canvas.width; i += 40) {
        for (let j = 0; j < canvas.height; j += 40) {
          ctx.fillRect(i, j, 1, 1);
        }
      }
      
      // Load store logo if available
      let storeLogo = null;
      if (storeData?.logo_url) {
        try {
          storeLogo = await loadImage(storeData.logo_url);
        } catch (error) {
          console.warn('Could not load store logo:', error);
        }
      }
      
      // Add store logo at top
      if (storeLogo) {
        const logoSize = 80;
        const logoX = 50;
        const logoY = 50;
        ctx.drawImage(storeLogo, logoX, logoY, logoSize, logoSize);
      }
      
      // Add product image if available
      if (productToShare.productImage) {
        try {
          // Convert storage URL to our CORS-enabled URL
          let imageUrl = productToShare.productImage;
          if (imageUrl.includes('/storage/')) {
            imageUrl = imageUrl.replace('/storage/', '/images/');
          }
          
          // Try to load image with CORS
          const productImg = await loadImage(imageUrl);
          
          // Draw product image with professional styling
          const imageSize = 500;
          const x = (canvas.width - imageSize) / 2;
          const y = 180;
          
          // Add shadow effect
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = 20;
          ctx.shadowOffsetX = 10;
          ctx.shadowOffsetY = 10;
          
          // Draw rounded rectangle background
          ctx.fillStyle = '#ffffff';
          ctx.roundRect(x - 20, y - 20, imageSize + 40, imageSize + 40, 20);
          ctx.fill();
          
          // Reset shadow
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          
          // Draw product image
          ctx.drawImage(productImg, x, y, imageSize, imageSize);
          
        } catch (error) {
          console.warn('Could not load image with CORS, generating preview without image:', error);
          
          // Add elegant placeholder
          const placeholderSize = 500;
          const x = (canvas.width - placeholderSize) / 2;
          const y = 180;
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.roundRect(x, y, placeholderSize, placeholderSize, 20);
          ctx.fill();
          
          ctx.fillStyle = '#a4785a';
          ctx.font = '48px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('📦', canvas.width / 2, canvas.height / 2 - 20);
          
          ctx.fillStyle = '#7b5a3b';
          ctx.font = '24px Arial';
          ctx.fillText('Product Image', canvas.width / 2, canvas.height / 2 + 40);
        }
      }
      
      // Add professional text overlay
      await addProfessionalTextOverlay(ctx, canvas, sellerData, storeData);
      
      // Trigger download
      downloadPreview(canvas);
    } catch (error) {
      console.error('Error generating preview:', error);
      alert('Error generating preview image. Please try again.');
    }
  };

  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const addProfessionalTextOverlay = async (ctx, canvas, sellerData, storeData) => {
    const startY = 720;
    let currentY = startY;
    
    // Product name with elegant styling
    ctx.fillStyle = '#2c1810';
    ctx.font = 'bold 42px "Arial", sans-serif';
    ctx.textAlign = 'center';
    
    // Add text shadow for depth
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    // Split long product names into multiple lines
    const productName = productToShare.productName;
    const maxWidth = canvas.width - 100;
    const words = productName.split(' ');
    let line = '';
    let lines = [];
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        lines.push(line);
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);
    
    // Draw product name lines
    lines.forEach((line, index) => {
      ctx.fillText(line.trim(), canvas.width / 2, currentY + (index * 50));
    });
    currentY += (lines.length * 50) + 20;
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Category with elegant styling
    ctx.font = '28px "Arial", sans-serif';
    ctx.fillStyle = '#a4785a';
    ctx.fillText(productToShare.category.toUpperCase(), canvas.width / 2, currentY);
    currentY += 60;
    
    // Store name and seller info
    const storeName = storeData?.store?.store_name || sellerData?.businessName || 'CraftConnect Store';
    const sellerName = sellerData?.userName || 'Artisan';
    
    ctx.font = '24px "Arial", sans-serif';
    ctx.fillStyle = '#7b5a3b';
    ctx.fillText(`by ${sellerName}`, canvas.width / 2, currentY);
    currentY += 40;
    
    ctx.font = '22px "Arial", sans-serif';
    ctx.fillStyle = '#8b6f47';
    ctx.fillText(storeName, canvas.width / 2, currentY);
    currentY += 50;
    
    // Decorative line
    ctx.strokeStyle = '#d4c4a8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 100, currentY);
    ctx.lineTo(canvas.width / 2 + 100, currentY);
    ctx.stroke();
    currentY += 30;
    
    // CraftConnect branding
    ctx.font = '26px "Arial", sans-serif';
    ctx.fillStyle = '#a4785a';
    ctx.fillText('CraftConnect', canvas.width / 2, currentY);
    currentY += 35;
    
    ctx.font = '18px "Arial", sans-serif';
    ctx.fillStyle = '#8b6f47';
    ctx.fillText('Handmade with Love & Care', canvas.width / 2, currentY);
    
    // Add QR code placeholder area (optional)
    const qrSize = 60;
    const qrX = canvas.width - qrSize - 50;
    const qrY = canvas.height - qrSize - 50;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.roundRect(qrX, qrY, qrSize, qrSize, 8);
    ctx.fill();
    
    ctx.fillStyle = '#a4785a';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('QR', qrX + qrSize/2, qrY + qrSize/2 + 3);
  };

  const downloadPreview = (canvas) => {
    const link = document.createElement('a');
    link.download = `${productToShare.productName}-preview.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleTogglePublishStatus = async (product) => {
    try {
      console.log("Full product object:", product);
      console.log("Updating product ID:", product.product_id || product.id);
      
      const response = await api.post(`/products/${product.product_id || product.id}/toggle-publish`);

      if (response.data) {
        const result = response.data;
        console.log("Product publish status updated successfully:", result);
        const newStatus = result.publish_status;
        alert(`Product ${newStatus === 'published' ? 'published' : 'saved as draft'} successfully!`);
        fetchProducts(); // Refresh the list
      }
    } catch (error) {
      console.error("Error updating publish status:", error);
      alert("Error updating publish status. Please try again.");
    }
  };

  const handleInputChange = (field, value) => {
    console.log(`Setting ${field} to:`, value);
    if (isAddDialogOpen) {
      setNewProduct((prev) => ({
        ...prev,
        [field]: value,
      }));
    } else if (isEditDialogOpen) {
      setCurrentProduct((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleFileChange = (field, file) => {
    if (isAddDialogOpen) {
      setNewProduct((prev) => ({
        ...prev,
        [field]: file,
      }));
    } else if (isEditDialogOpen) {
      setCurrentProduct((prev) => ({
        ...prev,
        [field]: file,
      }));
    }
  };

  const stockStatusOptions = [
    { value: "all", label: "All Products" },
    { value: "in stock", label: "In Stock" },
    { value: "low stock", label: "Low Stock" },
    { value: "out of stock", label: "Out of Stock" }
  ];

  const filteredInventory = inventory.filter((product) => {
    const matchesSearch = product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStock = stockFilter === "all" || product.status?.toLowerCase() === stockFilter.toLowerCase();
    
    return matchesSearch && matchesStock;
  });

  const getStockColor = (status) => {
    switch (status) {
      case "in stock":
        return "bg-green-100 text-green-800";
      case "low stock":
        return "bg-yellow-100 text-yellow-800";
      case "out of stock":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPublishColor = (publish_status) => {
    switch (publish_status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getApprovalColor = (approval_status) => {
    switch (approval_status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (error) {
    return (
      <div className="w-full pt-4">
        <ErrorState message={error} onRetry={fetchProducts} />
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="relative w-full sm:flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-[#a4785a]" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 text-sm sm:text-base border-2 border-[#d5bfae] rounded-lg focus:border-[#a4785a] focus:ring-2 focus:ring-[#a4785a]/20 transition-all w-full"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="relative">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] hover:border-[#a4785a] transition-all duration-200 text-xs sm:text-sm"
            >
              <Filter className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Filter
              {stockFilter !== "all" && (
                <Badge className="ml-1 sm:ml-2 bg-[#a4785a] text-white text-xs">1</Badge>
              )}
            </Button>
            {isFilterOpen && (
              <div className="absolute top-full mt-2 right-0 bg-white border-2 border-[#d5bfae] rounded-lg shadow-xl z-10 min-w-[180px] sm:min-w-[200px] p-2">
                <div className="text-xs sm:text-sm font-semibold text-[#5c3d28] mb-2 px-2">Filter by Stock Status</div>
                {stockStatusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setStockFilter(option.value);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded-md transition-all text-xs sm:text-sm ${
                      stockFilter === option.value
                        ? "bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white"
                        : "hover:bg-[#f8f1ec] text-[#5c3d28]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Add Product Button */}
          <Button 
            className="w-full sm:w-auto ml-auto bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Add Product
          </Button>
          
          {/* Add Product Modal */}
          <AddProductModal 
            isOpen={isAddDialogOpen} 
            onClose={() => setIsAddDialogOpen(false)} 
            onSave={handleAddProduct}
          />
        </div>
      </div>
      
      <Card className="border-[#e5ded7] shadow-xl overflow-visible">
        <CardHeader className="pb-3 sm:pb-4 border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white px-3 sm:px-6">
          <CardTitle className="text-[#5c3d28] text-lg sm:text-xl">Product Inventory</CardTitle>
          <CardDescription className="text-[#7b5a3b] text-xs sm:text-sm">Manage your product inventory and stock levels</CardDescription>
        </CardHeader>
        <CardContent className="pt-4 sm:pt-6 px-0 sm:px-6 overflow-visible">
          {/* Mobile: Scrollable wrapper */}
          <div className="overflow-x-auto -mx-3 sm:mx-0 overflow-y-visible">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sm:text-sm w-12 sm:w-16">Image</TableHead>
                <TableHead className="text-xs sm:text-sm">Name</TableHead>
                <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Category</TableHead>
                <TableHead className="text-xs sm:text-sm">Price</TableHead>
                <TableHead className="text-xs sm:text-sm">Stock</TableHead>
                <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Status</TableHead>
                <TableHead className="text-right text-xs sm:text-sm">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <LoadingSpinner message="Loading products..." size="small" />
                  </TableCell>
                </TableRow>
              ) : filteredInventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <EmptyState
                      icon="📦"
                      title="No Products Found"
                      description={searchTerm ? "No products match your search criteria" : "You haven't added any products yet"}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredInventory.map((product) => (
                  <TableRow key={product.id || product.product_id || `product-${Math.random().toString(36).substr(2, 9)}`}>
                    <TableCell className="w-12 sm:w-16">
                      {product.productImage ? (
                        <img 
                          src={product.productImage.includes('/storage/') 
                            ? product.productImage.replace('/storage/', '/images/')
                            : product.productImage
                          } 
                          alt={product.productName} 
                          className="h-8 w-8 sm:h-10 sm:w-10 object-cover rounded"
                          onError={(e) => {
                            console.warn('Image failed to load:', product.productImage);
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) {
                              e.target.nextSibling.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div 
                        className={`h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 rounded flex items-center justify-center ${product.productImage ? 'hidden' : ''}`}
                      >
                        <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      </div>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-none">
                      <div>
                        <div className="font-medium">{product.productName}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm hidden lg:table-cell">{product.category}</TableCell>
                    <TableCell className="text-xs sm:text-sm font-semibold whitespace-nowrap">₱{product.productPrice}</TableCell>
                    <TableCell className="text-xs sm:text-sm whitespace-nowrap">{product.productQuantity}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge className={`${getStockColor(product.status)} text-xs`} variant="outline">
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-3 py-3 relative">
                      {/* Desktop: Show all actions directly */}
                      <div className="hidden sm:flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => handleViewProduct(product)}
                          className="px-3 py-1.5 text-xs font-medium bg-white border-2 border-[#a4785a] text-[#a4785a] rounded-md hover:!bg-[#a4785a] hover:!text-white cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
                          style={{ backgroundColor: 'white', color: '#a4785a' }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#a4785a';
                            e.target.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.color = '#a4785a';
                          }}
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleShareProduct(product)}
                          className="px-3 py-1.5 text-xs font-medium bg-white border-2 border-[#a4785a] text-[#a4785a] rounded-md hover:!bg-[#a4785a] hover:!text-white cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
                          style={{ backgroundColor: 'white', color: '#a4785a' }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#a4785a';
                            e.target.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.color = '#a4785a';
                          }}
                        >
                          Share
                        </button>
                        <button
                          onClick={() => handleQuantityClick(product)}
                          className="px-3 py-1.5 text-xs font-medium bg-white border-2 border-[#a4785a] text-[#a4785a] rounded-md hover:!bg-[#a4785a] hover:!text-white cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
                          style={{ backgroundColor: 'white', color: '#a4785a' }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#a4785a';
                            e.target.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.color = '#a4785a';
                          }}
                        >
                          Stock
                        </button>
                        {(!product.hasOrders || product.hasOrders === 0) && (
                          <button
                            onClick={() => handleTogglePublishStatus(product)}
                            className="px-3 py-1.5 text-xs font-medium bg-white border-2 border-[#a4785a] text-[#a4785a] rounded-md hover:!bg-[#a4785a] hover:!text-white cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
                            style={{ backgroundColor: 'white', color: '#a4785a' }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#a4785a';
                              e.target.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'white';
                              e.target.style.color = '#a4785a';
                            }}
                          >
                            {product.publish_status === 'published' ? 'Draft' : 'Publish'}
                          </button>
                        )}
                        <button
                          onClick={() => handleEditClick(product)}
                          className="px-3 py-1.5 text-xs font-medium bg-white border-2 border-[#a4785a] text-[#a4785a] rounded-md hover:!bg-[#a4785a] hover:!text-white cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
                          style={{ backgroundColor: 'white', color: '#a4785a' }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#a4785a';
                            e.target.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.color = '#a4785a';
                          }}
                        >
                          Edit
                        </button>
                      </div>
                      
                      {/* Mobile: Show dropdown */}
                      <div className="sm:hidden flex items-center justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setOpenActionMenu(openActionMenu === product.id ? null : product.id)}
                          className="h-6 w-6 p-0.5 hover:bg-[#f8f1ec]"
                        >
                          <MoreHorizontal className="h-4 w-4 text-[#7b5a3b]" />
                        </Button>
                      </div>
                      
                      {/* Dropdown positioned relative to TableCell */}
                      {openActionMenu === product.id && (
                        <>
                          <div className="fixed inset-0 z-[9998]" onClick={() => setOpenActionMenu(null)} />
                          <div className="absolute right-0 top-full mt-1 bg-white border border-[#e5ded7] rounded-lg shadow-lg z-[9999] min-w-[120px] py-1">
                            <button
                              onClick={() => {
                                handleViewProduct(product);
                                setOpenActionMenu(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-[10px] bg-white text-[#a4785a] hover:!bg-[#a4785a] hover:!text-white cursor-pointer transition-all duration-200"
                              style={{ backgroundColor: 'white', color: '#a4785a' }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#a4785a';
                                e.target.style.color = 'white';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'white';
                                e.target.style.color = '#a4785a';
                              }}
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => {
                                handleShareProduct(product);
                                setOpenActionMenu(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-[10px] bg-white text-[#a4785a] hover:!bg-[#a4785a] hover:!text-white cursor-pointer transition-all duration-200"
                              style={{ backgroundColor: 'white', color: '#a4785a' }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#a4785a';
                                e.target.style.color = 'white';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'white';
                                e.target.style.color = '#a4785a';
                              }}
                            >
                              Share Product
                            </button>
                            <button
                              onClick={() => {
                                handleQuantityClick(product);
                                setOpenActionMenu(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-[10px] bg-white text-[#a4785a] hover:!bg-[#a4785a] hover:!text-white cursor-pointer transition-all duration-200"
                              style={{ backgroundColor: 'white', color: '#a4785a' }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#a4785a';
                                e.target.style.color = 'white';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'white';
                                e.target.style.color = '#a4785a';
                              }}
                            >
                              Update Stock
                            </button>
                            {(!product.hasOrders || product.hasOrders === 0) && (
                              <button
                                onClick={() => {
                                  handleTogglePublishStatus(product);
                                  setOpenActionMenu(null);
                                }}
                                className="w-full text-left px-3 py-1.5 text-[10px] bg-white text-[#a4785a] hover:!bg-[#a4785a] hover:!text-white cursor-pointer transition-all duration-200"
                                style={{ backgroundColor: 'white', color: '#a4785a' }}
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor = '#a4785a';
                                  e.target.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor = 'white';
                                  e.target.style.color = '#a4785a';
                                }}
                              >
                                {product.publish_status === 'published' ? 'Save as Draft' : 'Publish Product'}
                              </button>
                            )}
                            <button
                              onClick={() => {
                                handleEditClick(product);
                                setOpenActionMenu(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-[10px] bg-white text-[#a4785a] hover:!bg-[#a4785a] hover:!text-white cursor-pointer transition-all duration-200"
                              style={{ backgroundColor: 'white', color: '#a4785a' }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#a4785a';
                                e.target.style.color = 'white';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'white';
                                e.target.style.color = '#a4785a';
                              }}
                            >
                              Edit Product
                            </button>
                          </div>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
          
          {/* Edit Product Modal */}
          <EditProductModal
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            product={currentProduct}
            onSave={handleUpdateProduct}
          />

          {/* View Product Modal */}
          {isViewProductOpen && currentProduct && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
              <div className="bg-white rounded-lg sm:rounded-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="sticky top-0 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] p-4 sm:p-6 rounded-t-lg sm:rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg sm:text-2xl font-bold text-white">Product Details</h2>
                    <button 
                      onClick={() => setIsViewProductOpen(false)}
                      className="text-white hover:bg-white/20 rounded-full p-1.5 sm:p-2 transition-all text-lg sm:text-xl"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  {/* Product Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm text-gray-500 font-medium">Product Name</p>
                        <p className="text-base sm:text-lg font-semibold text-[#5c3d28]">{currentProduct.productName}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm text-gray-500 font-medium">SKU</p>
                        <p className="text-sm sm:text-base font-semibold text-[#5c3d28]">{currentProduct.sku || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm text-gray-500 font-medium">Category</p>
                        <p className="text-sm sm:text-base font-semibold text-[#5c3d28]">{currentProduct.category}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm text-gray-500 font-medium">Price</p>
                        <p className="text-xl sm:text-2xl font-bold text-[#a4785a]">₱{currentProduct.productPrice}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm text-gray-500 font-medium">Stock Quantity</p>
                        <p className="text-base sm:text-lg font-semibold text-[#5c3d28]">{currentProduct.productQuantity}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 sm:space-y-4">
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm text-gray-500 font-medium">Stock Status</p>
                        <Badge className={`${getStockColor(currentProduct.status)} text-xs`} variant="outline">
                          {currentProduct.status}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm text-gray-500 font-medium">Publish Status</p>
                        <Badge className={`${getPublishColor(currentProduct.publish_status)} text-xs`} variant="outline">
                          {currentProduct.publish_status || 'draft'}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm text-gray-500 font-medium">Approval Status</p>
                        <Badge className={`${getApprovalColor(currentProduct.approval_status)} text-xs`} variant="outline">
                          {currentProduct.approval_status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Product Image */}
                  {currentProduct.productImage && (
                    <div className="border-t border-[#e5ded7] pt-3 sm:pt-4">
                      <h3 className="text-base sm:text-lg font-semibold text-[#5c3d28] mb-2 sm:mb-3">Product Image</h3>
                      <div className="flex justify-center">
                        <img 
                          src={currentProduct.productImage.includes('/storage/') 
                            ? currentProduct.productImage.replace('/storage/', '/images/')
                            : currentProduct.productImage
                          } 
                          alt={currentProduct.productName}
                          className="max-w-full h-48 sm:h-64 object-cover rounded-lg border border-[#e5ded7]"
                          onError={(e) => {
                            console.warn('Image failed to load:', currentProduct.productImage);
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) {
                              e.target.nextSibling.style.display = 'flex';
                            }
                          }}
                        />
                        <div 
                          className="hidden h-48 sm:h-64 w-full bg-gray-200 rounded-lg border border-[#e5ded7] items-center justify-center text-gray-500"
                          style={{display: 'none'}}
                        >
                          <div className="text-center">
                            <div className="text-3xl sm:text-4xl mb-2">📷</div>
                            <div className="text-xs sm:text-sm">Image not available</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Product Description */}
                  {currentProduct.productDescription && (
                    <div className="border-t border-[#e5ded7] pt-3 sm:pt-4">
                      <h3 className="text-base sm:text-lg font-semibold text-[#5c3d28] mb-2 sm:mb-3">Description</h3>
                      <div className="bg-[#faf9f8] rounded-lg border border-[#e5ded7] p-3 sm:p-4">
                        <p className="text-[#5c3d28] whitespace-pre-wrap text-xs sm:text-sm">{currentProduct.productDescription}</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-[#e5ded7]">
                    <Button 
                      onClick={() => setIsViewProductOpen(false)}
                      variant="outline"
                      className="w-full sm:flex-1 border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] text-sm"
                    >
                      Close
                    </Button>
                    <Button 
                      onClick={() => {
                        setIsViewProductOpen(false);
                        handleShareProduct(currentProduct);
                      }}
                      variant="outline"
                      className="w-full sm:flex-1 border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] flex items-center justify-center gap-2 text-sm"
                    >
                      <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      Share Product
                    </Button>
                    <Button 
                      onClick={() => {
                        setIsViewProductOpen(false);
                        handleEditClick(currentProduct);
                      }}
                      className="w-full sm:flex-1 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white hover:from-[#8f674a] hover:to-[#6a4c34] flex items-center justify-center gap-2 text-sm"
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                      Edit Product
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quantity Update Modal */}
          {isQuantityModalOpen && currentProduct && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
              <div className="bg-white rounded-lg sm:rounded-2xl max-w-md w-full shadow-2xl">
                <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] p-4 sm:p-6 rounded-t-lg sm:rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
                      📦 Update Quantity
                    </h2>
                    <button 
                      onClick={() => {
                        setIsQuantityModalOpen(false);
                        setCurrentProduct(null);
                        setQuantityChange(0);
                      }}
                      className="text-white hover:bg-white/20 rounded-full p-1.5 sm:p-2 transition-all text-lg sm:text-xl"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  {/* Product Info */}
                  <div className="bg-[#f8f1ec] border-2 border-[#e5ded7] rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Product Name</p>
                    <p className="text-base sm:text-lg font-bold text-[#5c3d28]">{currentProduct.productName}</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2">Current Quantity</p>
                    <p className="text-xl sm:text-2xl font-bold text-[#a4785a]">{currentProduct.productQuantity || 0}</p>
                  </div>

                  {/* Quantity Change Input */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-semibold text-[#5c3d28]">Adjust Quantity</label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantityChange(quantityChange - 1)}
                        className="border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] text-sm px-3"
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        value={quantityChange}
                        onChange={(e) => setQuantityChange(parseInt(e.target.value) || 0)}
                        className="text-center border-2 border-[#d5bfae] text-base sm:text-lg font-bold"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantityChange(quantityChange + 1)}
                        className="border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] text-sm px-3"
                      >
                        +
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Enter positive number to add, negative to remove
                    </p>
                  </div>

                  {/* Preview New Quantity */}
                  <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-green-700 font-medium mb-1">New Quantity Will Be:</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-700">
                      {(currentProduct.productQuantity || 0) + quantityChange}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-[#e5ded7]">
                    <Button 
                      onClick={() => {
                        setIsQuantityModalOpen(false);
                        setCurrentProduct(null);
                        setQuantityChange(0);
                      }}
                      variant="outline"
                      className="w-full sm:flex-1 border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] text-sm"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleUpdateQuantity}
                      className="w-full sm:flex-1 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white hover:from-[#8f674a] hover:to-[#6a4c34] text-sm"
                    >
                      Update Quantity
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Share Product Modal */}
          {isShareModalOpen && productToShare && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
              <div className="bg-white rounded-lg sm:rounded-2xl max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] p-4 sm:p-6 rounded-t-lg sm:rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
                      <Share2 className="h-5 w-5 sm:h-6 sm:w-6" />
                      Share Product
                    </h2>
                    <button 
                      onClick={() => setIsShareModalOpen(false)}
                      className="text-white hover:bg-white/20 rounded-full p-1.5 sm:p-2 transition-all text-lg sm:text-xl"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  {/* Product Info */}
                  <div className="bg-[#f8f1ec] border-2 border-[#e5ded7] rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Product Name</p>
                    <p className="text-base sm:text-lg font-bold text-[#5c3d28]">{productToShare.productName}</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2">Category</p>
                    <p className="text-sm sm:text-base font-semibold text-[#5c3d28]">{productToShare.category}</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2">Product Link</p>
                    <div className="bg-white px-2 sm:px-3 py-1.5 sm:py-2 rounded border border-[#d5bfae] mt-1">
                      <p className="text-xs text-[#7b5a3b] break-all">
                        {`${import.meta.env.VITE_FRONTEND_URL || window.location.origin}/product/${productToShare.product_id || productToShare.id}`}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      This link will take customers to your product detail page
                    </p>
                  </div>

                  {/* Share Options */}
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="text-base sm:text-lg font-semibold text-[#5c3d28]">Share Options</h3>
                    
                    {/* Generate Preview Image */}
                    <Button
                      onClick={generateProductPreview}
                      className="w-full bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white hover:from-[#8f674a] hover:to-[#6a4c34] justify-start text-sm"
                    >
                      🖼️ Generate & Save Preview Image
                    </Button>

                    {/* Copy Link */}
                    <Button
                      onClick={copyProductLink}
                      variant="outline"
                      className="w-full border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] justify-start text-sm"
                    >
                      📋 Copy Product Link
                    </Button>

                    <div className="border-t border-[#e5ded7] my-2 sm:my-3"></div>
                    
                    {/* Post to Social Media */}
                    <h3 className="text-xs sm:text-sm font-semibold text-[#5c3d28]">Post to Your Social Media</h3>
                    <p className="text-xs text-gray-500">Create a post with product image and link</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Button
                        onClick={() => handlePostToSocialMedia('facebook')}
                        variant="outline"
                        className="border-2 border-[#1877f2] text-[#1877f2] hover:bg-[#1877f2] hover:text-white justify-start text-sm"
                      >
                        📘 Post to Facebook
                      </Button>
                      <Button
                        onClick={() => handlePostToSocialMedia('instagram')}
                        variant="outline"
                        className="border-2 border-[#E4405F] text-[#E4405F] hover:bg-[#E4405F] hover:text-white justify-start text-sm"
                      >
                        📷 Post to Instagram
                      </Button>
                    </div>

                    <div className="border-t border-[#e5ded7] my-2 sm:my-3"></div>
                    
                    <h3 className="text-xs sm:text-sm font-semibold text-[#5c3d28]">Quick Share via Link</h3>
                    <p className="text-xs text-gray-500">Share product link on other platforms</p>
                    
                    {/* Social Media Quick Share */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => shareProductViaSocial('facebook')}
                        variant="outline"
                        className="border-2 border-[#1877f2] text-[#1877f2] hover:bg-[#1877f2] hover:text-white justify-start text-xs sm:text-sm"
                      >
                        📘 Facebook
                      </Button>
                      <Button
                        onClick={() => shareProductViaSocial('instagram')}
                        variant="outline"
                        className="border-2 border-[#E4405F] text-[#E4405F] hover:bg-[#E4405F] hover:text-white justify-start text-xs sm:text-sm"
                      >
                        📷 Instagram
                      </Button>
                      <Button
                        onClick={() => shareProductViaSocial('twitter')}
                        variant="outline"
                        className="border-2 border-[#1da1f2] text-[#1da1f2] hover:bg-[#1da1f2] hover:text-white justify-start text-xs sm:text-sm"
                      >
                        🐦 Twitter
                      </Button>
                      <Button
                        onClick={() => shareProductViaSocial('messenger')}
                        variant="outline"
                        className="border-2 border-[#0084FF] text-[#0084FF] hover:bg-[#0084FF] hover:text-white justify-start text-xs sm:text-sm"
                      >
                        💬 Messenger
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-[#e5ded7]">
                    <Button 
                      onClick={() => setIsShareModalOpen(false)}
                      variant="outline"
                      className="flex-1 border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] text-sm"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
};

const OrderInventoryManager = () => {
  return (
    <div className="space-y-2 sm:space-y-3 max-w-[412px] sm:max-w-none mx-auto px-2 sm:px-0">
      {/* Header Section with Craft Theme */}
      <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg p-3">
        <h1 className="text-base font-bold text-white flex items-center">
          <ShoppingBag className="h-5 w-5 mr-2" />
          Orders & Shipping
        </h1>
        <p className="text-white/90 mt-1 text-xs">
          Manage your orders, shipping, and deliveries in one place.
        </p>
      </div>

      {/* Tabs with Craft Theme */}
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="w-full grid grid-cols-2 bg-white border border-[#e5ded7] rounded-md p-1">
          <TabsTrigger 
            value="orders" 
            className="rounded-sm bg-white text-[#a4785a] data-[state=active]:!bg-[#a4785a] data-[state=active]:!text-white data-[state=active]:shadow-sm transition-all duration-200 text-sm font-medium py-2"
          >
            Orders
          </TabsTrigger>
          <TabsTrigger 
            value="shipping"
            className="rounded-sm bg-white text-[#a4785a] data-[state=active]:!bg-[#a4785a] data-[state=active]:!text-white data-[state=active]:shadow-sm transition-all duration-200 text-sm font-medium py-2"
          >
            Shipping
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-4 sm:mt-6">
          <OrdersTab />
        </TabsContent>
        <TabsContent value="shipping" className="mt-4 sm:mt-6">
          <ShippingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderInventoryManager;

// Export InventoryTab for use in standalone InventoryManager component
export const InventoryTab = InventoryTab_DEPRECATED;