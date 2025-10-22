import React, { useState, useEffect } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Users,
  ShoppingBag,
  Star,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import api from "../../api";
import "./AdminTableDesign.css";

// Enhanced Stat Card Component
const StatCard = ({ title, value, description, icon, trend, trendValue }) => (
  <div className="admin-dashboard-card">
    <div className="admin-dashboard-card-header">
      <div className="admin-dashboard-card-title">{title}</div>
      <div className="admin-dashboard-card-icon">
        {icon}
      </div>
    </div>
    <div className="admin-dashboard-card-value">{value}</div>
    <div className="admin-dashboard-card-description">{description}</div>
    <div className="admin-dashboard-card-trend">
      {trend === "up" ? (
        <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
      ) : trend === "down" ? (
        <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
      ) : null}
      <span className={trend === "up" ? "positive" : trend === "down" ? "negative" : ""}>
        {trendValue}
      </span>
    </div>
  </div>
);

// Helper for status badge styles
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

const Dashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const now = new Date();

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        // console.log('Fetching analytics data...', { token: sessionStorage.getItem('auth_token') });
        
        // Add retry logic for timeout errors
        let retries = 3;
        let lastError;
        
        while (retries > 0) {
          try {
            const response = await api.get('/analytics/admin');
            // console.log('Analytics data response:', response.data);
            setAnalyticsData(response.data);
            return; // Success, exit retry loop
          } catch (error) {
            lastError = error;
            console.error(`Error fetching analytics data (${4-retries}/3):`, error);
            
            if (error.code === 'ECONNABORTED' && retries > 1) {
              // Timeout error, wait and retry
              await new Promise(resolve => setTimeout(resolve, 1000));
              retries--;
            } else {
              break; // Other errors, don't retry
            }
          }
        }
        
        // If we get here, all retries failed
        console.error('All retries failed for analytics data:', lastError);
        setError(lastError.message || 'Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="admin-table-container">
        <div className="admin-table-loading">
          <div className="admin-table-loading-spinner"></div>
          <span>Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-table-container">
        <div className="admin-table-empty">
          <div className="admin-table-empty-icon">⚠️</div>
          <h3 className="admin-table-empty-title">Failed to load dashboard data</h3>
          <p className="admin-table-empty-description">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="admin-table-filter-btn"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Extract data from analytics response
  const summary = analyticsData?.summary || {};
  const revenue = analyticsData?.revenue || {};
  const orders = analyticsData?.orders || {};
  const products = analyticsData?.products || {};
  const reviews = analyticsData?.reviews || {};
  
  // Calculate current month revenue from trend data
  const getCurrentMonthRevenue = () => {
    if (revenue.trend_data && revenue.trend_data.length > 0) {
      // Get the latest month from trend data
      const latestMonth = revenue.trend_data[revenue.trend_data.length - 1];
      const monthlyRevenue = parseFloat(latestMonth.revenue) || 0;
      return monthlyRevenue;
    }
    // Fallback to summary total revenue if no trend data
    const fallbackRevenue = summary.total_revenue || 0;
    return fallbackRevenue;
  };
  
  const currentMonthRevenue = getCurrentMonthRevenue();

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="admin-table-container">
        <div className="admin-table-header">
          <h1 className="admin-table-title">Admin Dashboard</h1>
          <p className="admin-table-description">
            Welcome back, Admin User! Here's what's happening on your platform today.
          </p>
          <div className="flex items-center justify-between mt-4">
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="admin-dashboard-grid">
        <StatCard
          title="Total Revenue"
          value={`₱${summary.total_revenue?.toLocaleString() || '0'}`}
          description="Total platform revenue"
          icon={<span className="h-4 w-4 text-primary">₱</span>}
          trend={revenue.growth_percentage > 0 ? "up" : "down"}
          trendValue={`${Math.abs(revenue.growth_percentage || 0)}% from last period`}
        />
        <StatCard
          title="Total Customers"
          value={summary.total_customers?.toLocaleString() || '0'}
          description="Registered customers"
          icon={<Users className="h-4 w-4 text-primary" />}
          trend="up"
          trendValue="Active users"
        />
        <StatCard
          title="Active Artisans"
          value={summary.total_sellers?.toLocaleString() || '0'}
          description="Registered sellers"
          icon={<Users className="h-4 w-4 text-primary" />}
          trend="up"
          trendValue="With active listings"
        />
        <StatCard
          title="Total Products"
          value={summary.total_products?.toLocaleString() || '0'}
          description="Products in catalog"
          icon={<ShoppingBag className="h-4 w-4 text-primary" />}
          trend="up"
          trendValue="Available for sale"
        />
      </div>

      {/* Enhanced Bottom Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Platform Statistics */}
        <div className="admin-table-container">
          <div className="admin-table-header">
            <h3 className="admin-table-title">Platform Statistics</h3>
            <p className="admin-table-description">
              Key metrics and performance insights
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div className="admin-table-stat">
                <ShoppingBag className="admin-table-stat-icon" />
                <div className="flex-1">
                  <div className="admin-table-stat-value">{summary.total_orders?.toLocaleString() || '0'}</div>
                  <div className="admin-table-stat-label">Total Orders</div>
                  <div className="text-xs text-gray-500 mt-1">All time orders</div>
                </div>
              </div>
              
              <div className="admin-table-stat">
                <DollarSign className="admin-table-stat-icon" />
                <div className="flex-1">
                  <div className="admin-table-stat-value">₱{summary.average_order_value?.toFixed(2) || '0.00'}</div>
                  <div className="admin-table-stat-label">Average Order Value</div>
                  <div className="text-xs text-gray-500 mt-1">Platform average</div>
                </div>
              </div>
              
              <div className="admin-table-stat">
                <Star className="admin-table-stat-icon" />
                <div className="flex-1">
                  <div className="admin-table-stat-value flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 mr-1" />
                    {summary.average_rating?.toFixed(1) || '0.0'}
                  </div>
                  <div className="admin-table-stat-label">Average Rating</div>
                  <div className="text-xs text-gray-500 mt-1">Platform average</div>
                </div>
              </div>
              
              <div className="admin-table-stat">
                <Users className="admin-table-stat-icon" />
                <div className="flex-1">
                  <div className="admin-table-stat-value">{summary.pending_products?.toLocaleString() || '0'}</div>
                  <div className="admin-table-stat-label">Pending Products</div>
                  <div className="text-xs text-gray-500 mt-1">Awaiting approval</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Overview */}
        <div className="admin-table-container">
          <div className="admin-table-header">
            <h3 className="admin-table-title">Platform Overview</h3>
            <p className="admin-table-description">
              Monthly trends and growth metrics
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div className="admin-table-stat">
                <DollarSign className="admin-table-stat-icon" />
                <div className="flex-1">
                  <div className="admin-table-stat-value">₱{currentMonthRevenue.toLocaleString()}</div>
                  <div className="admin-table-stat-label">Monthly Revenue</div>
                  <div className="text-xs text-gray-500 mt-1">Current month</div>
                </div>
                <div className="admin-dashboard-card-trend positive">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>+12.5%</span>
                </div>
              </div>
              
              <div className="admin-table-stat">
                <Users className="admin-table-stat-icon" />
                <div className="flex-1">
                  <div className="admin-table-stat-value">{summary.new_customers_this_month?.toLocaleString() || '0'}</div>
                  <div className="admin-table-stat-label">New Customers</div>
                  <div className="text-xs text-gray-500 mt-1">This month</div>
                </div>
                <div className="admin-dashboard-card-trend positive">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>+8.2%</span>
                </div>
              </div>
              
              <div className="admin-table-stat">
                <Users className="admin-table-stat-icon" />
                <div className="flex-1">
                  <div className="admin-table-stat-value">{summary.new_sellers_this_month?.toLocaleString() || '0'}</div>
                  <div className="admin-table-stat-label">New Artisans</div>
                  <div className="text-xs text-gray-500 mt-1">This month</div>
                </div>
                <div className="admin-dashboard-card-trend positive">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>+15.3%</span>
                </div>
              </div>
              
              <div className="admin-table-stat">
                <ShoppingBag className="admin-table-stat-icon" />
                <div className="flex-1">
                  <div className="admin-table-stat-value">{summary.new_products_this_month?.toLocaleString() || '0'}</div>
                  <div className="admin-table-stat-label">New Products</div>
                  <div className="text-xs text-gray-500 mt-1">This month</div>
                </div>
                <div className="admin-dashboard-card-trend positive">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>+22.1%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
