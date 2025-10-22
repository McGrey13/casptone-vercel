import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { RefreshCw, TrendingUp, Package, AlertTriangle, Tag } from "lucide-react";
import { Button } from "../ui/button";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorState from "../ui/ErrorState";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import api from "../../api";

const SellerAnalytics = ({ sellerId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async (showLoading = true) => {
    if (!sellerId) {
      setError('Please wait while loading seller information...');
      setLoading(true);
      return;
    }

    if (showLoading) {
      setLoading(true);
    }
    try {
      const response = await api.get(`/analytics/seller/${sellerId}`);
      
      if (response.data) {
        setAnalytics(response.data);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      if (showLoading) {
        setError(err.message || 'Failed to fetch analytics');
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [sellerId]);

  useEffect(() => {
    if (sellerId) {
      fetchAnalytics(true); // Show loading on initial fetch
    }
  }, [sellerId]);

  // Auto-refresh functionality (silent background refresh)
  useEffect(() => {
    if (!sellerId) return;

    const interval = setInterval(() => {
      fetchAnalytics(false); // Silent refresh - no loading state
    }, 15000); // Refresh every 15 seconds for analytics

    return () => clearInterval(interval);
  }, [sellerId, fetchAnalytics]);

  if (loading) {
    return (
      <div className="w-full pt-4">
        <LoadingSpinner message="Loading analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full pt-4">
        <ErrorState message={`Error loading analytics: ${error}`} onRetry={fetchAnalytics} />
      </div>
    );
  }

  if (!analytics) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(value);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with craft theme */}
      <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center">
              <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 mr-2 sm:mr-3" />
              Sales Analytics
            </h1>
            <p className="text-white/90 mt-2 text-sm sm:text-base md:text-lg">
              Track your store's performance and sales metrics
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-[#e5ded7] bg-gradient-to-br from-white to-[#faf9f8] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 md:p-6">
            <CardTitle className="text-xs sm:text-sm font-semibold text-[#5c3d28]">Total Revenue</CardTitle>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
            <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
              {formatCurrency(analytics.total_revenue)}
            </div>
            <p className="text-xs text-[#7b5a3b] mt-1">
              {analytics.order_metrics.total_orders} total orders
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#e5ded7] bg-gradient-to-br from-white to-[#faf9f8] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 md:p-6">
            <CardTitle className="text-xs sm:text-sm font-semibold text-[#5c3d28]">Best Selling Product</CardTitle>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] flex items-center justify-center shadow-lg flex-shrink-0">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
            <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] bg-clip-text text-transparent">
              {analytics.best_sellers[0]?.units_sold || 0} units
            </div>
            <p className="text-xs text-[#7b5a3b] mt-1 truncate">
              {analytics.best_sellers[0]?.name || 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#e5ded7] bg-gradient-to-br from-white to-[#faf9f8] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 md:p-6">
            <CardTitle className="text-xs sm:text-sm font-semibold text-[#5c3d28]">Order Completion</CardTitle>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
            <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              {analytics.order_metrics.completion_rate.toFixed(1)}%
            </div>
            <p className="text-xs text-[#7b5a3b] mt-1">
              {analytics.order_metrics.completed} completed orders
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#e5ded7] bg-gradient-to-br from-white to-[#faf9f8] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 md:p-6">
            <CardTitle className="text-xs sm:text-sm font-semibold text-[#5c3d28]">Active Discounts</CardTitle>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
            <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
              {analytics.discount_stats.active_codes}
            </div>
            <p className="text-xs text-[#7b5a3b] mt-1">
              Used {analytics.discount_stats.codes_used} times
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Overview */}
      <Card className="border-[#e5ded7] shadow-xl">
        <CardHeader className="border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white p-4 sm:p-6">
          <CardTitle className="text-[#5c3d28] flex items-center text-base sm:text-lg md:text-xl">
            <Package className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-[#a4785a]" />
            Order Status Overview
          </CardTitle>
          <CardDescription className="text-[#7b5a3b] text-xs sm:text-sm">Current status of all orders and performance metrics</CardDescription>
        </CardHeader>
        <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
            {/* Status Cards with Progress Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg sm:rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm font-semibold text-blue-700">Pending</p>
                  <span className="text-xs font-medium text-blue-600">
                    {analytics.order_metrics.total_orders > 0 
                      ? Math.round((analytics.order_metrics.pending / analytics.order_metrics.total_orders) * 100)
                      : 0}%
                  </span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  {analytics.order_metrics.pending}
                </p>
                <div className="w-full bg-blue-200 rounded-full h-2 sm:h-2.5">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 sm:h-2.5 rounded-full transition-all duration-300 shadow-sm"
                    style={{ 
                      width: `${analytics.order_metrics.total_orders > 0 
                        ? (analytics.order_metrics.pending / analytics.order_metrics.total_orders) * 100 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg sm:rounded-xl border-2 border-yellow-200 hover:border-yellow-400 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm font-semibold text-yellow-700">Packing</p>
                  <span className="text-xs font-medium text-yellow-600">
                    {analytics.order_metrics.total_orders > 0 
                      ? Math.round((analytics.order_metrics.packing / analytics.order_metrics.total_orders) * 100)
                      : 0}%
                  </span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">
                  {analytics.order_metrics.packing}
                </p>
                <div className="w-full bg-yellow-200 rounded-full h-2 sm:h-2.5">
                  <div 
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 sm:h-2.5 rounded-full transition-all duration-300 shadow-sm"
                    style={{ 
                      width: `${analytics.order_metrics.total_orders > 0 
                        ? (analytics.order_metrics.packing / analytics.order_metrics.total_orders) * 100 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-purple-700">Shipped</p>
                  <span className="text-xs font-medium text-purple-600">
                    {analytics.order_metrics.total_orders > 0 
                      ? Math.round((analytics.order_metrics.shipped / analytics.order_metrics.total_orders) * 100)
                      : 0}%
                  </span>
                </div>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                  {analytics.order_metrics.shipped}
                </p>
                <div className="w-full bg-purple-200 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-2.5 rounded-full transition-all duration-300 shadow-sm"
                    style={{ 
                      width: `${analytics.order_metrics.total_orders > 0 
                        ? (analytics.order_metrics.shipped / analytics.order_metrics.total_orders) * 100 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-3 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 hover:border-green-400 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-green-700">Completed</p>
                  <span className="text-xs font-medium text-green-600">
                    {analytics.order_metrics.total_orders > 0 
                      ? Math.round((analytics.order_metrics.completed / analytics.order_metrics.total_orders) * 100)
                      : 0}%
                  </span>
                </div>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                  {analytics.order_metrics.completed}
                </p>
                <div className="w-full bg-green-200 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full transition-all duration-300 shadow-sm"
                    style={{ 
                      width: `${analytics.order_metrics.total_orders > 0 
                        ? (analytics.order_metrics.completed / analytics.order_metrics.total_orders) * 100 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="border-t border-[#e5ded7] pt-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-5 bg-gradient-to-br from-[#faf9f8] to-white rounded-xl border-2 border-[#e5ded7] hover:border-[#a4785a] transition-all duration-200 hover:shadow-md">
                  <p className="text-sm font-semibold text-[#7b5a3b]">Total Orders</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] bg-clip-text text-transparent mt-2">
                    {analytics.order_metrics.total_orders}
                  </p>
                </div>
                <div className="text-center p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 hover:border-green-400 transition-all duration-200 hover:shadow-md">
                  <p className="text-sm font-semibold text-green-700">Completion Rate</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mt-2">
                    {Math.round(analytics.order_metrics.completion_rate)}%
                  </p>
                </div>
                <div className="text-center p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all duration-200 hover:shadow-md">
                  <p className="text-sm font-semibold text-blue-700">Processing Orders</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mt-2">
                    {analytics.order_metrics.pending + analytics.order_metrics.packing + analytics.order_metrics.shipped}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Flow Visualization */}
            <div className="border-t border-[#e5ded7] pt-6 mt-6">
              <h4 className="text-sm font-semibold text-[#5c3d28] mb-4 flex items-center">
                <div className="h-1 w-8 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded mr-2"></div>
                Order Flow Journey
              </h4>
              <div className="flex items-center justify-between bg-gradient-to-r from-[#faf9f8] to-white p-4 rounded-xl border-2 border-[#e5ded7]">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="text-xs text-gray-600">Pending</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-200 mx-2">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-yellow-600"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                  <span className="text-xs text-gray-600">Packing</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-200 mx-2">
                  <div className="h-full bg-gradient-to-r from-yellow-600 to-purple-600"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                  <span className="text-xs text-gray-600">Shipped</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-200 mx-2">
                  <div className="h-full bg-gradient-to-r from-purple-600 to-green-600"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="text-xs text-gray-600">Completed</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Peak Selling Periods */}
      <Card className="border-2 border-[#e5ded7] shadow-xl">
        <CardHeader className="border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white">
          <CardTitle className="text-[#5c3d28] flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-[#a4785a]" />
            Peak Selling Periods
          </CardTitle>
          <CardDescription className="text-[#7b5a3b]">Top performing months with detailed insights</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {analytics.peak_periods.map((period, index) => {
              // Get top products for this period (simulate based on best_sellers)
              const topProducts = analytics.best_sellers.slice(0, 3);
              const topCategories = Object.entries(analytics.revenue_by_category)
                .sort(([,a], [,b]) => (b.revenue || 0) - (a.revenue || 0))
                .slice(0, 3);

              return (
                <TooltipProvider key={period.month}>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-between p-5 rounded-xl border-2 border-[#e5ded7] hover:border-[#a4785a] bg-gradient-to-r from-white to-[#faf9f8] hover:shadow-md cursor-pointer transition-all duration-200">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] flex items-center justify-center text-white font-bold shadow-lg">
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-[#5c3d28]">{period.month}</p>
                            <p className="text-sm text-[#7b5a3b]">{period.orders} orders</p>
                          </div>
                        </div>
                        <p className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                          {formatCurrency(period.revenue)}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-md">
                      <div className="p-4">
                        <h4 className="font-semibold text-lg mb-3">{period.month} Performance Details</h4>
                        
                        <div className="space-y-3">
                          <div>
                            <h5 className="font-medium text-blue-600 mb-2">📊 Key Metrics</h5>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>Revenue: <span className="font-semibold">{formatCurrency(period.revenue)}</span></div>
                              <div>Orders: <span className="font-semibold">{period.orders}</span></div>
                              <div>Avg Order: <span className="font-semibold">{formatCurrency(period.revenue / period.orders || 0)}</span></div>
                              <div>Rank: <span className="font-semibold">#{index + 1}</span></div>
                            </div>
                          </div>

                          <div>
                            <h5 className="font-medium text-green-600 mb-2">🏆 Top Products</h5>
                            <div className="space-y-1">
                              {topProducts.map((product, idx) => (
                                <div key={idx} className="text-sm flex justify-between">
                                  <span className="truncate max-w-[120px]">{product.name}</span>
                                  <span className="font-semibold">{product.units_sold} units</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h5 className="font-medium text-purple-600 mb-2">📦 Top Categories</h5>
                            <div className="space-y-1">
                              {topCategories.map(([category, data], idx) => (
                                <div key={idx} className="text-sm flex justify-between">
                                  <span className="truncate max-w-[120px]">{category}</span>
                                  <span className="font-semibold">{formatCurrency(data.revenue || 0)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Trends */}
      <Card className="border-2 border-[#e5ded7] shadow-xl">
        <CardHeader className="border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white">
          <CardTitle className="text-[#5c3d28] flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-[#a4785a]" />
            Revenue Trends
          </CardTitle>
          <CardDescription className="text-[#7b5a3b]">Monthly revenue over the past year</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.monthly_trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#a4785a"
                  strokeWidth={3}
                  name="Revenue"
                  dot={{ fill: '#7b5a3b', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Combined Product Performance & Revenue Analysis */}
      <Card className="border-2 border-[#e5ded7] shadow-xl">
        <CardHeader className="border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white">
          <CardTitle className="text-[#5c3d28] flex items-center">
            <Package className="h-5 w-5 mr-2 text-[#a4785a]" />
            Product Performance & Revenue Analysis
          </CardTitle>
          <CardDescription className="text-[#7b5a3b]">Combined view of best selling products and revenue by category</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  ...analytics.best_sellers.map(product => ({
                    name: product.name,
                    type: 'Product',
                    units_sold: product.units_sold,
                    revenue: product.revenue || 0,
                    category: product.category || 'N/A'
                  })),
                  ...Object.entries(analytics.revenue_by_category).map(([category, data]) => ({
                    name: category,
                    type: 'Category',
                    units_sold: data.units_sold || 0,
                    revenue: data.revenue || 0,
                    category: category
                  }))
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis yAxisId="units" orientation="left" />
                <YAxis yAxisId="revenue" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'revenue') {
                      return [formatCurrency(value), 'Revenue'];
                    }
                    return [value, 'Units Sold'];
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      const data = payload[0].payload;
                      return `${data.name} (${data.type})`;
                    }
                    return label;
                  }}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Bar 
                  yAxisId="units"
                  dataKey="units_sold" 
                  fill="#a4785a" 
                  name="Units Sold"
                  radius={[8, 8, 0, 0]}
                />
                <Bar 
                  yAxisId="revenue"
                  dataKey="revenue" 
                  fill="#7b5a3b" 
                  name="Revenue"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Discount Code Stats */}
      <Card className="border-2 border-[#e5ded7] shadow-xl">
        <CardHeader className="border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white">
          <CardTitle className="text-[#5c3d28] flex items-center">
            <Tag className="h-5 w-5 mr-2 text-[#a4785a]" />
            Discount Code Performance
          </CardTitle>
          <CardDescription className="text-[#7b5a3b]">Overview of your discount codes usage</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-gradient-to-br from-white to-[#faf9f8] rounded-xl border-2 border-[#e5ded7] hover:border-[#a4785a] transition-all duration-200 hover:shadow-md">
              <p className="text-sm font-semibold text-[#7b5a3b]">Total Codes</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] bg-clip-text text-transparent mt-2">
                {analytics.discount_stats.total_codes}
              </p>
            </div>
            <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-200 hover:shadow-md">
              <p className="text-sm font-semibold text-purple-700">Times Used</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent mt-2">
                {analytics.discount_stats.codes_used}
              </p>
            </div>
            <div className="p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 hover:border-green-400 transition-all duration-200 hover:shadow-md">
              <p className="text-sm font-semibold text-green-700">Total Discount Amount</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mt-2">
                {formatCurrency(analytics.discount_stats.total_discount_amount)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Low Performing Products */}
      <Card className="border-2 border-[#e5ded7] shadow-xl">
        <CardHeader className="border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white">
          <CardTitle className="text-[#5c3d28] flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-[#a4785a]" />
            Products Needing Attention
          </CardTitle>
          <CardDescription className="text-[#7b5a3b]">Products with low inventory turnover</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {analytics.low_performers.map((product) => (
              <div
                key={product.product_id}
                className="flex items-center justify-between p-5 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200 hover:border-orange-400 transition-all duration-200 hover:shadow-md"
              >
                <div>
                  <p className="font-semibold text-[#5c3d28]">{product.name}</p>
                  <p className="text-sm text-[#7b5a3b] mt-1">
                    {product.units_sold} units sold • {formatCurrency(product.revenue)} revenue
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-orange-700">
                    {(product.conversion_rate).toFixed(1)}% conversion
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    {(product.inventory_turnover).toFixed(2)}x turnover
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerAnalytics;
