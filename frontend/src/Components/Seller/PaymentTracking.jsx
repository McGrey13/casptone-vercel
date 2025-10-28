import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { 
  Wallet, 
  Search, 
  Download, 
  RefreshCw, 
  TrendingUp,
  DollarSign,
  CreditCard,
  Eye,
  Filter,
  Calendar,
  Check,
  Package
} from "lucide-react";
import api from "../../api";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";

const PaymentTracking = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingPayouts: 0,
    gcashPayments: 0,
    paymayaPayments: 0
  });
  const [codOrders, setCodOrders] = useState([]);
  const [codStats, setCodStats] = useState({
    totalCOD: 0,
    totalPaid: 0,
    totalPending: 0,
    totalOrders: 0
  });
  const [activeTab, setActiveTab] = useState("ewallet");

  const fetchPayments = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      const response = await api.get("/seller/payments");
      
      if (response.data && response.data.success) {
        setPayments(response.data.payments || []);
        setStats(s => response.data.stats || s);
        setCodOrders(response.data.cod_orders || []);
        setCodStats(cs => response.data.cod_stats || cs);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      console.error("Error response:", error.response?.data);
      if (showLoading) {
        setError("Failed to fetch payments. Please try again.");
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchPayments(true); // Show loading on initial fetch
  }, [fetchPayments]);

  // Auto-refresh functionality (silent background refresh)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPayments(false); // Silent refresh - no loading state
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [fetchPayments]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid": return "bg-green-100 text-green-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "out_for_delivery": return "bg-blue-100 text-blue-800";
      case "pending_delivery": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentMethodBadge = (method) => {
    const methodLower = method?.toLowerCase();
    if (methodLower === "gcash") {
      return <Badge className="bg-blue-500 text-white">GCash</Badge>;
    } else if (methodLower === "paymaya") {
      return <Badge className="bg-green-500 text-white">PayMaya</Badge>;
    }
    return <Badge>{method}</Badge>;
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.order_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = paymentTypeFilter === "all" || 
      payment.payment_method?.toLowerCase() === paymentTypeFilter.toLowerCase();
    
    const matchesStatus = statusFilter === "all" || 
      payment.payment_status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const filteredCodOrders = codOrders.filter(order => {
    const matchesSearch = 
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = paymentTypeFilter === "all" || 
      order.payment_method?.toLowerCase() === paymentTypeFilter.toLowerCase();
    
    const matchesStatus = statusFilter === "all" || 
      order.payment_status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setIsViewModalOpen(true);
  };

  const exportPayments = () => {
    // CSV export functionality
    const csvContent = [
      ["Payment Reference", "Order ID", "Customer", "Amount", "Method", "Status", "Date"],
      ...filteredPayments.map(p => [
        p.reference_number,
        p.order_id,
        p.customer_name,
        `₱${parseFloat(p.amount).toFixed(2)}`,
        p.payment_method,
        p.payment_status,
        new Date(p.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="w-full pt-4">
        <LoadingSpinner message="Loading payments..." />
      </div>
    );
  }

  return (
    <div className="space-y-2 sm:space-y-3 max-w-[412px] sm:max-w-none mx-auto px-2 sm:px-0">

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-[#f8f1ec] border border-[#e5ded7] text-[10px]">
          <TabsTrigger 
            value="ewallet" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#a4785a] data-[state=active]:to-[#7b5a3b] data-[state=active]:text-white py-1.5"
          >
            E-Wallet
          </TabsTrigger>
          <TabsTrigger 
            value="cod" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#a4785a] data-[state=active]:to-[#7b5a3b] data-[state=active]:text-white py-1.5"
          >
            COD
          </TabsTrigger>
        </TabsList>

        {/* E-Wallet Tab */}
        <TabsContent value="ewallet" className="space-y-2">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 gap-2">
            <Card className="border-[#e5ded7] shadow">
              <CardContent className="p-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-600">Total Earnings</p>
                    <p className="text-sm font-bold text-[#5c3d28]">
                      ₱{parseFloat(stats.totalEarnings).toFixed(2)}
                    </p>
                  </div>
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] flex items-center justify-center">
                    <TrendingUp className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#e5ded7] shadow">
              <CardContent className="p-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-600">Pending</p>
                    <p className="text-sm font-bold text-[#5c3d28]">
                      ₱{parseFloat(stats.pendingPayouts).toFixed(2)}
                    </p>
                  </div>
                  <div className="h-7 w-7 rounded-full bg-yellow-100 flex items-center justify-center">
                    <span className="text-sm">₱</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#e5ded7] shadow">
              <CardContent className="p-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-600">GCash</p>
                    <p className="text-sm font-bold text-blue-600">
                      ₱{parseFloat(stats.gcashPayments).toFixed(2)}
                    </p>
                  </div>
                  <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
                    <Wallet className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#e5ded7] shadow">
              <CardContent className="p-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-600">PayMaya</p>
                    <p className="text-sm font-bold text-green-600">
                      ₱{parseFloat(stats.paymayaPayments).toFixed(2)}
                    </p>
                  </div>
                  <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center">
                    <CreditCard className="h-3.5 w-3.5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-2">
        <div className="relative w-full">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#a4785a]" />
          <Input
            placeholder="Search payment, order ID, or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-7 pr-2 py-1.5 text-xs border border-[#d5bfae] rounded focus:border-[#a4785a] focus:ring-1 focus:ring-[#a4785a]/20 transition-all h-8"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full h-7 border border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] hover:border-[#a4785a] transition-all duration-200 text-[10px]"
            >
              <Filter className="mr-1 h-3 w-3" />
              Filter
              {(paymentTypeFilter !== "all" || statusFilter !== "all") && (
                <Badge className="ml-1 bg-[#a4785a] text-white text-[10px] px-1">
                  {(paymentTypeFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0)}
                </Badge>
              )}
            </Button>
            {isFilterOpen && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-[#d5bfae] rounded shadow-lg z-10 p-2">
                <div className="space-y-2">
                  <div>
                    <p className="text-[10px] font-semibold text-[#5c3d28] mb-1">Payment Method</p>
                    {["all", "gcash", "paymaya"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setPaymentTypeFilter(type)}
                        className={`w-full text-left px-2 py-1 rounded transition-all mb-0.5 text-[10px] ${
                          paymentTypeFilter === type
                            ? "bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white"
                            : "hover:bg-[#f8f1ec] text-[#5c3d28]"
                        }`}
                      >
                        {type === "all" ? "All Methods" : type === "gcash" ? "GCash" : "PayMaya"}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-[#e5ded7] pt-1.5">
                    <p className="text-[10px] font-semibold text-[#5c3d28] mb-1">Status</p>
                    {["all", "paid", "processing", "pending"].map((status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`w-full text-left px-2 py-1 rounded transition-all mb-0.5 capitalize text-[10px] ${
                          statusFilter === status
                            ? "bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white"
                            : "hover:bg-[#f8f1ec] text-[#5c3d28]"
                        }`}
                      >
                        {status === "all" ? "All Status" : status}
                      </button>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setPaymentTypeFilter("all");
                      setStatusFilter("all");
                      setIsFilterOpen(false);
                    }}
                    className="w-full h-7 text-[10px]"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={exportPayments}
            className="h-7 border border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] hover:border-[#a4785a] transition-all duration-200 text-[10px] px-2"
          >
            <Download className="h-3 w-3" />
          </Button>
          <Button
            onClick={fetchPayments}
            className="h-7 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white shadow hover:shadow-md transition-all duration-200 text-[10px] px-2"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Payments Table */}
      <Card className="border-[#e5ded7] shadow">
        <CardHeader className="pb-2 border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white px-2">
          <CardTitle className="text-[#5c3d28] text-sm">E-Wallet Payments</CardTitle>
          <CardDescription className="text-[#7b5a3b] text-[10px]">
            GCash and PayMaya payments
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 px-2">
          <div className="overflow-x-auto -mx-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px] px-2 py-2">Order ID</TableHead>
                <TableHead className="text-[10px] px-2 py-2">Amount</TableHead>
                <TableHead className="text-[10px] px-2 py-2">Status</TableHead>
                <TableHead className="text-right text-[10px] px-2 py-2">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    <EmptyState
                      icon="💳"
                      title="No Payments"
                      description={searchTerm ? "No matching payments" : "No payments yet"}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium text-[10px] px-2 py-2">
                      <div>{payment.order_id}</div>
                      <div className="text-[#7b5a3b]">{payment.customer_name}</div>
                    </TableCell>
                    <TableCell className="text-[10px] px-2 py-2">
                      <div className="font-semibold text-[#5c3d28]">₱{parseFloat(payment.amount).toFixed(2)}</div>
                      <div>{getPaymentMethodBadge(payment.payment_method)}</div>
                    </TableCell>
                    <TableCell className="text-[10px] px-2 py-2">
                      <Badge className={getStatusColor(payment.payment_status)} variant="outline">
                        {payment.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-2 py-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewPayment(payment)}
                        className="h-6 px-2 text-[#a4785a] hover:bg-[#f8f1ec] hover:text-[#5c3d28] transition-all duration-200"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        {/* COD Tracking Tab */}
        <TabsContent value="cod" className="space-y-4 sm:space-y-6">
          {/* COD Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="border-[#e5ded7] shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4 sm:p-5 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Total COD Amount</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#5c3d28]">
                      ₱{parseFloat(codStats.totalCOD).toFixed(2)}
                    </p>
                  </div>
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#e5ded7] shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4 sm:p-5 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Paid COD</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
                      ₱{parseFloat(codStats.totalPaid).toFixed(2)}
                    </p>
                  </div>
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#e5ded7] shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4 sm:p-5 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Pending COD</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-600">
                      ₱{parseFloat(codStats.totalPending).toFixed(2)}
                    </p>
                  </div>
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#e5ded7] shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4 sm:p-5 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Total COD Orders</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#5c3d28]">
                      {codStats.totalOrders}
                    </p>
                  </div>
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] flex items-center justify-center">
                    <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* COD Filters and Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-[#a4785a]" />
              <Input
                placeholder="Search by order ID or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base border-2 border-[#d5bfae] rounded-lg focus:border-[#a4785a] focus:ring-2 focus:ring-[#a4785a]/20 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                onClick={fetchPayments}
                className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm"
              >
                <RefreshCw className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>

          {/* COD Orders Table */}
          <Card className="border-[#e5ded7] shadow-xl">
            <CardHeader className="pb-3 sm:pb-4 border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white px-3 sm:px-6">
              <CardTitle className="text-[#5c3d28] text-base sm:text-lg md:text-xl">COD Payments</CardTitle>
              <CardDescription className="text-[#7b5a3b] text-xs sm:text-sm">
                Track all Cash on Delivery orders
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
              <div className="overflow-x-auto -mx-3 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Order ID</TableHead>
                    <TableHead className="text-xs sm:text-sm">Customer</TableHead>
                    <TableHead className="text-xs sm:text-sm">Amount</TableHead>
                    <TableHead className="text-xs sm:text-sm">Payment Method</TableHead>
                    <TableHead className="text-xs sm:text-sm">Payment Status</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden md:table-cell">Order Date</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCodOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 sm:py-8">
                        <EmptyState
                          icon="📦"
                          title="No Orders Found"
                          description={searchTerm ? "No orders match your search criteria" : "You haven't received any orders yet"}
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCodOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium text-xs sm:text-sm">{order.order_id}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{order.customer_name}</TableCell>
                        <TableCell className="font-semibold text-[#5c3d28] text-xs sm:text-sm">
                          ₱{parseFloat(order.amount).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {order.payment_method === 'cod' ? (
                            <Badge className="bg-amber-500 text-white">COD</Badge>
                          ) : (
                            getPaymentMethodBadge(order.payment_method)
                          )}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          <Badge className={getStatusColor(order.payment_status)} variant="outline">
                            {order.payment_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm hidden md:table-cell">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPayment(order);
                              setIsViewModalOpen(true);
                            }}
                            className="text-[#a4785a] hover:bg-[#f8f1ec] hover:text-[#5c3d28] transition-all duration-200 text-xs sm:text-sm"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Payment Modal */}
      {isViewModalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-1">
          <div className="bg-white rounded-lg w-full max-h-[98vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] p-2 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white">
                  {activeTab === "ewallet" ? "Payment Details" : "COD Details"}
                </h2>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-white hover:bg-white/20 rounded-full p-1 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-3 space-y-3">
              {activeTab === "ewallet" ? (
                <>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 font-medium">Payment Reference</p>
                      <p className="text-sm font-bold text-[#a4785a]">
                        {selectedPayment.reference_number || 'N/A - Payment not completed'}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-500 font-medium">Order ID</p>
                        <p className="text-xs font-semibold text-[#5c3d28]">{selectedPayment.order_id}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-500 font-medium">Customer</p>
                        <p className="text-xs font-semibold text-[#5c3d28]">{selectedPayment.customer_name}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-500 font-medium">Method</p>
                        {getPaymentMethodBadge(selectedPayment.payment_method)}
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-500 font-medium">Status</p>
                        <Badge className={getStatusColor(selectedPayment.payment_status)}>
                          {selectedPayment.payment_status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#e5ded7] pt-2">
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] text-gray-500 font-medium">Amount Paid</p>
                      <p className="text-base font-bold text-[#a4785a]">
                        ₱{parseFloat(selectedPayment.amount).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-[10px] text-gray-500 font-medium">Date & Time</p>
                      <p className="text-[10px] text-[#5c3d28]">
                        {new Date(selectedPayment.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 font-medium">Order ID</p>
                      <p className="text-sm font-bold text-[#a4785a]">{selectedPayment.order_id}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-500 font-medium">Customer</p>
                        <p className="text-xs font-semibold text-[#5c3d28]">{selectedPayment.customer_name}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-500 font-medium">Method</p>
                        {selectedPayment.payment_method === 'cod' ? (
                          <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5">COD</Badge>
                        ) : (
                          getPaymentMethodBadge(selectedPayment.payment_method)
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-500 font-medium">Payment</p>
                        <Badge className={getStatusColor(selectedPayment.payment_status)}>
                          {selectedPayment.payment_status}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-500 font-medium">Order</p>
                        <Badge className={getStatusColor(selectedPayment.order_status)} variant="outline">
                          {selectedPayment.order_status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#e5ded7] pt-2">
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] text-gray-500 font-medium">Amount</p>
                      <p className="text-base font-bold text-[#a4785a]">
                        ₱{parseFloat(selectedPayment.amount).toFixed(2)}
                      </p>
                    </div>
                    {selectedPayment.payment_method === 'cod' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-1.5 mt-2">
                        <p className="text-[10px] text-yellow-800">
                          <strong>Note:</strong> Payment will be collected upon delivery
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="flex gap-1.5 pt-2 border-t border-[#e5ded7]">
                <Button
                  onClick={() => setIsViewModalOpen(false)}
                  variant="outline"
                  className="flex-1 h-7 border border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] text-[10px]"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentTracking;

