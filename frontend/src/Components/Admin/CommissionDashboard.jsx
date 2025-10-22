import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  TrendingUp,
  DollarSign,
  Users,
  CreditCard,
  Download,
  RefreshCw,
  Calendar,
  BarChart3,
  PieChart,
  AlertCircle,
  Key,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import "./AdminTableDesign.css";
import { getAuthToken, testAuthentication, setupTestAuth } from '../../utils/authHelper';

const CommissionDashboard = () => {
  const [commissionData, setCommissionData] = useState(null);
  const [itemCommissionData, setItemCommissionData] = useState(null);
  const [categoryCommissionData, setCategoryCommissionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  const fetchCommissionData = async () => {
    try {
      setLoading(true);
      let token = getAuthToken();
      
      if (!token) {
        console.log('No authentication token found, setting up test token...');
        setupTestAuth();
        token = getAuthToken();
        
        if (!token) {
          console.error('Failed to set up authentication token');
          setLoading(false);
          setAuthError(true);
          return;
        }
      }

      // Test authentication first
      const authTest = await testAuthentication();
      if (!authTest) {
        console.error('Authentication test failed');
        setLoading(false);
        setAuthError(true);
        return;
      }
      
      const params = new URLSearchParams({
        from_date: dateRange.from,
        to_date: dateRange.to
      });

      const baseURL = 'http://localhost:8080';
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      };

      // Fetch system commission data
      const commissionResponse = await fetch(`${baseURL}/api/admin/reports/system-commission?${params}`, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });

      if (commissionResponse.status === 401) {
        console.error('Authentication failed - token may be expired');
        // Redirect to login or show error message
        window.location.href = '/login';
        return;
      }

      if (!commissionResponse.ok) {
        throw new Error(`Failed to fetch commission data: ${commissionResponse.status} ${commissionResponse.statusText}`);
      }

      const commissionResult = await commissionResponse.json();
      setCommissionData(commissionResult.data);

      // Fetch item-level commission data
      const itemResponse = await fetch(`${baseURL}/api/admin/reports/item-commission?${params}`, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });

      if (itemResponse.ok) {
        const itemResult = await itemResponse.json();
        setItemCommissionData(itemResult.data);
      }

      // Fetch category commission data
      const categoryResponse = await fetch(`${baseURL}/api/admin/reports/category-commission?${params}`, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });

      if (categoryResponse.ok) {
        const categoryResult = await categoryResponse.json();
        setCategoryCommissionData(categoryResult.data);
      }

    } catch (error) {
      console.error('Error fetching commission data:', error);
      setAuthError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupTestAuth = () => {
    setupTestAuth();
    setAuthError(false);
    // Retry fetching data
    setTimeout(() => {
      fetchCommissionData();
    }, 1000);
  };

  useEffect(() => {
    fetchCommissionData();
  }, [dateRange]);

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    const now = new Date();
    let from, to;

    switch (period) {
      case 'today':
        from = to = now.toISOString().split('T')[0];
        break;
      case 'weekly':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        from = weekStart.toISOString().split('T')[0];
        to = new Date().toISOString().split('T')[0];
        break;
      case 'monthly':
        from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        to = new Date().toISOString().split('T')[0];
        break;
      case 'yearly':
        from = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        to = new Date().toISOString().split('T')[0];
        break;
      default:
        from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        to = new Date().toISOString().split('T')[0];
    }

    setDateRange({ from, to });
  };

  const exportCommissionData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Please log in to export data');
        return;
      }
      
      const params = new URLSearchParams({
        from_date: dateRange.from,
        to_date: dateRange.to,
        type: 'revenue'
      });

      const baseURL = 'http://localhost:8080';
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      };

      const response = await fetch(`${baseURL}/api/admin/reports/export?${params}`, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `commission_report_${dateRange.from}_to_${dateRange.to}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export commission data');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-[#a4785a]" />
            <span className="ml-2 text-gray-600">Loading commission data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-6">
              You need to be authenticated to view the commission dashboard.
            </p>
            <div className="space-y-4">
              <Button 
                onClick={handleSetupTestAuth}
                className="bg-[#a4785a] hover:bg-[#8a6a5a] text-white px-6 py-3"
              >
                <Key className="h-5 w-5 mr-2" />
                Setup Test Authentication
              </Button>
              <p className="text-sm text-gray-500">
                This will set up a test authentication token for development purposes.
              </p>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg text-left max-w-2xl mx-auto">
                <h3 className="font-semibold text-blue-900 mb-2">Alternative Setup (Browser Console)</h3>
                <p className="text-sm text-blue-800 mb-2">
                  If the button doesn't work, open your browser console (F12) and run:
                </p>
                <code className="block bg-blue-100 p-2 rounded text-xs text-blue-900 font-mono">
                  setupCommissionAuth()
                </code>
                <p className="text-xs text-blue-700 mt-2">
                  Then refresh this page to load the commission data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!commissionData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Commission Data</h3>
            <p className="text-gray-500">No commission data available for the selected period.</p>
          </div>
        </div>
      </div>
    );
  }

  const { summary, payment_methods, top_sellers } = commissionData;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Commission Dashboard</h1>
              <p className="text-gray-600">Monitor platform commission earnings and payment analytics</p>
            </div>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <Button onClick={fetchCommissionData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportCommissionData} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="weekly">This Week</SelectItem>
                <SelectItem value="monthly">This Month</SelectItem>
                <SelectItem value="yearly">This Year</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{dateRange.from} to {dateRange.to}</span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="admin-table-container">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₱{summary.total_gross_revenue?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="admin-table-container">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Platform Commission</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₱{summary.total_admin_fees?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-gray-500">{summary.commission_rate}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="admin-table-container">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Seller Payments</p>
                  <p className="text-2xl font-bold text-purple-600">
                    ₱{summary.total_seller_payments?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="admin-table-container">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Transactions</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {summary.transaction_count || 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    Avg: ₱{summary.average_transaction_value?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="admin-table-container">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Payment Methods
              </CardTitle>
              <CardDescription>Online payment breakdown by method</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payment_methods?.map((method, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{method.display_name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          ₱{method.total_amount?.toLocaleString()}
                        </span>
                        <Badge variant="secondary">
                          {method.percentage}%
                        </Badge>
                      </div>
                    </div>
                    <Progress value={method.percentage} className="h-2" />
                    <div className="text-xs text-gray-500">
                      {method.transaction_count} transactions • 
                      Avg: ₱{method.average_amount?.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Sellers */}
          <Card className="admin-table-container">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top Earning Sellers
              </CardTitle>
              <CardDescription>Highest earning sellers this period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {top_sellers?.slice(0, 5).map((seller, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-[#a4785a] text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{seller.seller_name}</p>
                        <p className="text-sm text-gray-500">
                          {seller.transaction_count} transactions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        ₱{seller.total_earnings?.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Commission: ₱{seller.admin_fees_paid?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Item-Level Commission Breakdown */}
        {itemCommissionData && itemCommissionData.items && itemCommissionData.items.length > 0 && (
          <Card className="admin-table-container">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top Products by Commission
              </CardTitle>
              <CardDescription>Individual item commission tracking (2% per item)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {itemCommissionData.items.slice(0, 10).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-[#a4785a] text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.product_name}</p>
                        <p className="text-sm text-gray-500">
                          {item.total_quantity_sold} items sold • Avg: ₱{item.average_price?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        ₱{item.total_commission?.toFixed(2)} commission
                      </p>
                      <p className="text-sm text-gray-500">
                        Revenue: ₱{item.total_revenue?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {itemCommissionData.summary && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{itemCommissionData.summary.total_products}</p>
                      <p className="text-sm text-blue-800">Products</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{itemCommissionData.summary.total_items_sold}</p>
                      <p className="text-sm text-green-800">Items Sold</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">₱{itemCommissionData.summary.total_commission?.toFixed(2)}</p>
                      <p className="text-sm text-purple-800">Total Commission</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-600">₱{itemCommissionData.summary.average_commission_per_item?.toFixed(2)}</p>
                      <p className="text-sm text-orange-800">Avg per Item</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Category Commission Breakdown */}
        {categoryCommissionData && categoryCommissionData.categories && categoryCommissionData.categories.length > 0 && (
          <Card className="admin-table-container">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Commission by Category
              </CardTitle>
              <CardDescription>2% commission breakdown by product category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryCommissionData.categories.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{category.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          ₱{category.total_commission?.toFixed(2)}
                        </span>
                        <Badge variant="secondary">
                          {category.items_sold} items
                        </Badge>
                      </div>
                    </div>
                    <Progress 
                      value={(category.total_commission / categoryCommissionData.summary.total_commission) * 100} 
                      className="h-2" 
                    />
                    <div className="text-xs text-gray-500">
                      Revenue: ₱{category.total_revenue?.toFixed(2)} • 
                      {category.transaction_count} transactions
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
};

export default CommissionDashboard;
