// SellerDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Users,
  ShoppingBag,
  Star,
  RefreshCw,
  AlertCircle,
  DollarSign,
  CreditCard,
  Clock,
  TrendingUp,
  Percent,
  Key,
  LayoutDashboard,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
// import { useDashboardData } from "../../hooks/useDashboardData";
import EmptyState from "../ui/EmptyState";
import { useUser } from '../Context/UserContext';
import api from "../../api";

// Backend returns seller-specific data at GET /seller/{sellerId}/dashboard

// Reusable stat card component with craft-themed design
const StatCard = ({ title, value, description, icon, trend, trendValue }) => (
  <Card className="w-full border-[#e5ded7] bg-gradient-to-br from-white to-[#faf9f8] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-semibold text-[#5c3d28]">{title}</CardTitle>
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] flex items-center justify-center shadow-lg">
        <div className="text-white">
          {icon}
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] bg-clip-text text-transparent">
        {value}
      </div>
      <p className="text-xs text-[#7b5a3b] mt-1">{description}</p>
      <div className="mt-3 flex items-center text-xs">
        {trend === "up" && (
          <div className="flex items-center px-2 py-1 rounded-full bg-green-50">
            <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
            <span className="text-green-600 font-medium">{trendValue}</span>
          </div>
        )}
        {trend === "down" && (
          <div className="flex items-center px-2 py-1 rounded-full bg-red-50">
            <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
            <span className="text-red-600 font-medium">{trendValue}</span>
          </div>
        )}
        {!trend && (
          <span className="text-[#7b5a3b]">{trendValue}</span>
        )}
      </div>
    </CardContent>
  </Card>
);

// Status color helper
const getStatusStyle = (status) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-800";
    case "Processing":
      return "bg-blue-100 text-blue-800";
    case "Shipped":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
const SellerDashboard = () => {
  const { user } = useUser ? useUser() : { user: undefined };
  const [sellerId, setSellerId] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [ordersFallback, setOrdersFallback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const resolveSellerId = useCallback(async () => {
    // Prefer sellerId from context if present
    const idFromContext = user?.sellerId || user?.sellerID;
    if (idFromContext) return idFromContext;
    // Fallback to profile API
    try {
      const res = await api.get('/sellers/profile');
      return res?.data?.sellerID || null;
    } catch (_) {
      return null;
    }
  }, [user]);

  const fetchDashboard = useCallback(async (id) => {
    if (!id) return;
    try {
      setError(null);
      console.log('Fetching dashboard for seller ID:', id);
      const response = await api.get(`/seller/${id}/dashboard`);
      console.log('Dashboard API response:', response.data);
      
      if (response?.data?.success) {
        const data = response.data.data;
        console.log('Dashboard data received:', data);
        console.log('Recent orders from API:', data.recentOrders);
        console.log('Top rated products from API:', data.topRatedProducts);
        
        // Even if transaction_summary is empty, we still have orders and products
        setDashboardData((prev) => ({
          ...prev,
          ...data,
          // Ensure transaction_summary always exists with defaults
          transaction_summary: data.transaction_summary || (prev?.transaction_summary || {
            total_transactions: 0,
            successful_transactions: 0,
            total_gross_amount: 0,
            total_admin_fee: 0,
            total_seller_amount: 0,
            average_transaction: 0,
            commission_rate: '2%',
            payment_methods: [],
            pending_payments: { count: 0, total_amount: 0 },
            online_payment_count: 0,
          })
        }));
      } else {
        console.warn('Dashboard API returned success=false:', response.data);
        setError(response.data?.message || 'Failed to load dashboard');
      }
    } catch (e) {
      console.error('Dashboard fetch error:', e);
      console.error('Error response:', e.response?.data);
      setError(e.response?.data?.message || 'Failed to load dashboard');
    }
  }, []);

  // Fallback: fetch seller orders and compute simple summary
  const fetchOrdersFallback = useCallback(async (id) => {
    try {
      console.log('Fetching orders fallback for seller ID:', id);
      const res = await api.get('/orders/seller');
      console.log('Orders API response:', res.data);
      
      const orders = Array.isArray(res?.data) ? res.data : [];
      console.log('Orders found:', orders.length);
      
      // Keep only this seller's orders if API returns more
      const normalized = orders.map((o) => ({
        id: o.orderID || o.order_id || o.id,
        date: o.orderDate || o.created_at || o.date,
        amount: typeof o.totalAmount === 'number' ? o.totalAmount : parseFloat((o.totalAmount || '0').toString().replace(/[^0-9.]/g, '')) || 0,
        status: (o.status || '').charAt(0).toUpperCase() + (o.status || '').slice(1),
        paymentMethod: (o.payment_method || '').toLowerCase(),
        paymentStatus: (o.paymentStatus || '').toLowerCase(),
      }));
      setOrdersFallback(normalized);
      console.log('Normalized orders:', normalized);

      // Calculate online payment count (GCash/PayMaya that are paid)
      const onlinePayments = normalized.filter(o => {
        const method = o.paymentMethod;
        const status = o.paymentStatus;
        const isOnline = method === 'gcash' || method === 'paymaya';
        const isPaid = status === 'paid' || status === 'succeeded' || status === 'completed';
        return isOnline && isPaid;
      });
      console.log('Online payments (paid):', onlinePayments.length);

      // Calculate pending payment count (orders with pending payment status)
      const pendingPayments = normalized.filter(o => {
        const status = o.paymentStatus;
        return status === 'pending';
      });
      const pendingAmount = pendingPayments.reduce((sum, o) => sum + (o.amount || 0), 0);
      console.log('Pending payments:', pendingPayments.length, 'Amount:', pendingAmount);

      // Merge with existing dashboard data or create new
      setDashboardData((prev) => {
        const totalGross = normalized.reduce((s, o) => s + (o.amount || 0), 0);
        const newOrders = normalized.slice(0, 5).map((o) => ({
          id: o.id?.toString().startsWith('ORD-') ? o.id.toString() : `ORD-${o.id}`,
          date: (o.date || '').toString().slice(0, 10),
          amount: `₱${Number(o.amount || 0).toLocaleString()}`,
          status: o.status || 'Processing',
        }));
        
        return {
          ...(prev || {}),
          transaction_summary: {
            ...(prev?.transaction_summary || {}),
            // Only update if we don't have transaction data, or if orders show more
            total_transactions: prev?.transaction_summary?.total_transactions || normalized.length,
            successful_transactions: prev?.transaction_summary?.successful_transactions || normalized.length,
            total_gross_amount: prev?.transaction_summary?.total_gross_amount || Math.round(totalGross * 100) / 100,
            total_admin_fee: prev?.transaction_summary?.total_admin_fee || Math.round(totalGross * 0.02 * 100) / 100,
            total_seller_amount: prev?.transaction_summary?.total_seller_amount || Math.round(totalGross * 0.98 * 100) / 100,
            average_transaction: prev?.transaction_summary?.average_transaction || (normalized.length ? Math.round((totalGross / normalized.length) * 100) / 100 : 0),
            commission_rate: prev?.transaction_summary?.commission_rate || '2%',
            payment_methods: prev?.transaction_summary?.payment_methods || [],
            // Use calculated values from orders if backend doesn't provide them or if calculated is higher
            pending_payments: {
              count: (prev?.transaction_summary?.pending_payments?.count ?? 0) > 0 
                ? prev.transaction_summary.pending_payments.count 
                : pendingPayments.length,
              total_amount: (prev?.transaction_summary?.pending_payments?.total_amount ?? 0) > 0
                ? prev.transaction_summary.pending_payments.total_amount
                : Math.round(pendingAmount * 100) / 100,
            },
            // Use calculated online payment count from orders if backend doesn't provide it
            online_payment_count: (prev?.transaction_summary?.online_payment_count ?? 0) > 0
              ? prev.transaction_summary.online_payment_count
              : onlinePayments.length,
          },
          // Use backend orders if available, otherwise use fallback
          recentOrders: (prev?.recentOrders && prev.recentOrders.length > 0)
            ? prev.recentOrders
            : newOrders,
        };
      });
    } catch (err) {
      console.error('Error fetching orders fallback:', err);
      // Don't ignore errors, log them for debugging
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const id = await resolveSellerId();
      console.log('Resolved seller ID:', id);
      setSellerId(id);
      if (id) {
        try {
          // Fetch both in parallel
          await Promise.all([
            fetchDashboard(id),
            fetchOrdersFallback(id)
          ]);
        } catch (err) {
          console.error('Error fetching dashboard data:', err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setError('Unable to determine seller ID. Please make sure you are logged in as a seller.');
      }
    })();
  }, [resolveSellerId, fetchDashboard, fetchOrdersFallback]);

  const sellerOrders = dashboardData?.recentOrders || ordersFallback.slice(0, 5).map((o) => ({
    id: `ORD-${o.id}`,
    amount: `₱${Number(o.amount || 0).toLocaleString()}`,
    date: (o.date || '').slice(0, 10),
    status: o.status || 'Processing',
  }));
  const sellerProducts = dashboardData?.topRatedProducts || [];
  return (
    <div className="w-full pt-4">
      {loading && (
        <div className="mb-4 text-[#7b5a3b]">Loading your dashboard…</div>
      )}
      {error && (
        <div className="mb-4 text-red-600">{error}</div>
      )}
      {/* Page Header with craft-themed design */}
      <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-2xl shadow-xl p-8 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <LayoutDashboard className="h-8 w-8 mr-3" />
              Seller Dashboard
            </h1>
            <p className="text-white/90 mt-2 text-lg">Welcome back! Here's what's happening with your store today.</p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <StatCard
          title="Total Revenue"
          value={`₱${(dashboardData?.transaction_summary?.total_gross_amount || 0).toLocaleString()}`}
          description={"Revenue (selected period)"}
          icon={<span className="h-8 w-8 text-2xl">₱</span>}
          trend={undefined}
          trendValue={''}
        />
        <StatCard
          title="Commission Rate"
          value={dashboardData?.transaction_summary?.commission_rate || "-"}
          description="Platform commission rate"
          icon={<Percent className="h-4 w-4 text-primary" />}
        />
        <StatCard
          title="Online Payments"
          value={dashboardData?.transaction_summary?.online_payment_count || "0"}
          description={`${dashboardData?.transaction_summary?.online_payment_count || 0} orders paid via GCash/PayMaya`}
          icon={<CreditCard className="h-4 w-4 text-primary" />}
        />
        <StatCard
          title="Pending Payments"
          value={dashboardData?.transaction_summary?.pending_payments?.count || "0"}
          description={`${dashboardData?.transaction_summary?.pending_payments?.count || 0} orders waiting for payment (₱${(dashboardData?.transaction_summary?.pending_payments?.total_amount || 0).toLocaleString()})`}
          icon={<Clock className="h-4 w-4 text-primary" />}
        />
      </div>

      {/* Payment Method Breakdown */}
      {dashboardData?.transaction_summary?.payment_methods && dashboardData.transaction_summary.payment_methods.length > 0 && (
        <Card className="mt-6 border-[#e5ded7] bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white">
            <CardTitle className="text-[#5c3d28] flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-[#a4785a]" />
              Payment Method Breakdown
            </CardTitle>
            <CardDescription className="text-[#7b5a3b]">
              Revenue breakdown by payment method
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {dashboardData.transaction_summary.payment_methods.map((method, index) => (
                <div key={index} className="flex items-center justify-between p-4 border-2 border-[#e5ded7] rounded-xl hover:border-[#a4785a] hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-[#faf9f8]">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] flex items-center justify-center shadow-lg">
                      {method.method === 'gcash' && <CreditCard className="h-6 w-6 text-white" />}
                      {method.method === 'paymaya' && <CreditCard className="h-6 w-6 text-white" />}
                      {method.method === 'cod' && <DollarSign className="h-6 w-6 text-white" />}
                    </div>
                    <div>
                      <div className="font-semibold text-[#5c3d28]">{method.display_name}</div>
                      <div className="text-sm text-[#7b5a3b]">
                        {method.transaction_count} transactions
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-[#a4785a]">₱{method.total_amount.toLocaleString()}</div>
                    <div className="text-sm text-[#7b5a3b] font-medium">
                      {method.percentage}% of total
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Commission Details */}
      {dashboardData?.transaction_summary && (
        <Card className="mt-6 border-[#e5ded7] bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white">
            <CardTitle className="text-[#5c3d28] flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-[#a4785a]" />
              Commission & Revenue Details
            </CardTitle>
            <CardDescription className="text-[#7b5a3b]">
              Detailed breakdown of your earnings and platform fees
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 border-2 border-[#e5ded7] rounded-xl bg-gradient-to-br from-green-50 to-white hover:border-green-400 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-semibold text-[#5c3d28]">Total Revenue</span>
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  ₱{dashboardData.transaction_summary.total_gross_amount?.toLocaleString() || "0.00"}
                </div>
                <div className="text-sm text-[#7b5a3b] font-medium">
                  {dashboardData.transaction_summary.total_transactions || 0} transactions
                </div>
              </div>
              
              <div className="p-6 border-2 border-[#e5ded7] rounded-xl bg-gradient-to-br from-blue-50 to-white hover:border-blue-400 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <Percent className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-semibold text-[#5c3d28]">Platform Fee</span>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  ₱{dashboardData.transaction_summary.total_admin_fee?.toLocaleString() || "0.00"}
                </div>
                <div className="text-sm text-[#7b5a3b] font-medium">
                  {dashboardData.transaction_summary.commission_rate} commission rate
                </div>
              </div>
              
              <div className="p-6 border-2 border-[#e5ded7] rounded-xl bg-gradient-to-br from-[#a4785a]/10 to-white hover:border-[#a4785a] hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] flex items-center justify-center shadow-lg">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-semibold text-[#5c3d28]">Your Earnings</span>
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] bg-clip-text text-transparent mb-2">
                  ₱{dashboardData.transaction_summary.total_seller_amount?.toLocaleString() || "0.00"}
                </div>
                <div className="text-sm text-[#7b5a3b] font-medium">
                  After commission deduction
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Recent Orders */}
        <Card className="border-[#e5ded7] bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white">
            <CardTitle className="text-[#5c3d28] flex items-center">
              <ShoppingBag className="h-5 w-5 mr-2 text-[#a4785a]" />
              Recent Orders
            </CardTitle>
            <CardDescription className="text-[#7b5a3b]">Latest 5 orders from your customers only</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {sellerOrders.length > 0 ? (
                sellerOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border-2 border-[#e5ded7] rounded-xl hover:border-[#a4785a] hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-[#faf9f8]"
                  >
                    <div>
                      <div className="font-semibold text-[#5c3d28]">{order.id}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#a4785a]">{order.amount}</div>
                      <div className="text-xs text-[#7b5a3b]">{order.date}</div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium shadow-sm ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon="🛍️"
                  title="No Recent Orders"
                  description="Your recent orders will appear here once your store receives purchases."
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Rated Products */}
        <Card className="border-[#e5ded7] bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white">
            <CardTitle className="text-[#5c3d28] flex items-center">
              <Star className="h-5 w-5 mr-2 text-[#a4785a]" />
              Top Rated Products
            </CardTitle>
            <CardDescription className="text-[#7b5a3b]">Top 5 highest rated products from your store</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {sellerProducts.length > 0 ? (
                sellerProducts.map((product, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-4 border-2 border-[#e5ded7] rounded-xl hover:border-[#a4785a] hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-[#faf9f8]"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-[#5c3d28]">{product.name}</div>
                      <div className="text-sm text-[#7b5a3b]">{product.reviews} reviews</div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-full border border-yellow-200">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      <span className="font-bold text-yellow-700">{product.rating}</span>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon="⭐"
                  title="No Rated Products"
                  description="Product ratings will show here once your customers review your products."
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SellerDashboard;
