import React, { useState, useEffect } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Download, Eye, Package, Truck, MapPin, User, Phone, 
  Calendar, Clock, FileText, Printer, ArrowUpDown, ArrowUp, ArrowDown
} from "lucide-react";
import api from "../../api";

// Add custom scrollbar styles
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f8f1ec;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #d5bfae;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #a4785a;
  }
`;

// Add print styles
const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    .print-content, .print-content * {
      visibility: visible;
    }
    .print-content {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
    .no-print {
      display: none !important;
    }
  }
`;

const EReceiptWaybill = () => {
  const [ordersWithTracking, setOrdersWithTracking] = useState([]);
  const [ordersWithoutTracking, setOrdersWithoutTracking] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('latest'); // 'latest' or 'oldest'
  const [activeTab, setActiveTab] = useState('waybill'); // 'waybill' or 'receipts'
  const previewRef = React.useRef(null);

  // Function to handle order selection and scroll to preview on mobile
  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
    // Check if we're on mobile/tablet (screen width < 1024px for lg breakpoint)
    if (window.innerWidth < 1024 && previewRef.current) {
      // Add a small delay to ensure the preview content is rendered
      setTimeout(() => {
        previewRef.current.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/seller');
      console.log('E-Receipt Orders response:', response.data);
      
      // Log payment methods for debugging
      console.log('=== PAYMENT METHOD CHECK ===');
      response.data.forEach(order => {
        console.log(`Order ${order.order_number}: payment_method="${order.payment_method}", paymentStatus="${order.paymentStatus}", tracking="${order.trackingNumber || 'none'}"`);
      });
      
      // Split orders into two groups:
      // 1. Orders WITH tracking numbers (for waybills - shipping documents)
      const withTracking = response.data.filter(order => 
        order.trackingNumber && order.trackingNumber.trim() !== ''
      );
      
      // 2. Orders WITHOUT tracking but PAID via GCash/PayMaya (for customer e-receipts)
      const withoutTracking = response.data.filter(order => 
        (!order.trackingNumber || order.trackingNumber.trim() === '') &&
        (order.payment_method === 'gcash' || order.payment_method === 'paymaya') &&
        order.paymentStatus === 'paid'
      );
      
      // Sort both arrays
      const sortWithTracking = withTracking.sort((a, b) => {
        const dateA = new Date(a.created_at || a.orderDate || a.date);
        const dateB = new Date(b.created_at || b.orderDate || b.date);
        return sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
      });
      
      const sortWithoutTracking = withoutTracking.sort((a, b) => {
        const dateA = new Date(a.created_at || a.orderDate || a.date);
        const dateB = new Date(b.created_at || b.orderDate || b.date);
        return sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
      });
      
      console.log('Orders WITH tracking (waybills):', sortWithTracking.length);
      console.log('Orders WITHOUT tracking (customer receipts):', sortWithoutTracking.length);
      console.log('Sample order with tracking:', sortWithTracking[0]);
      console.log('Sample order without tracking:', sortWithoutTracking[0]);
      
      setOrdersWithTracking(sortWithTracking);
      setOrdersWithoutTracking(sortWithoutTracking);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSellerInfo = async () => {
    try {
      const response = await api.get('/sellers/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching seller info:', error);
      return null;
    }
  };


  const handlePrint = () => {
    window.print();
  };

  const handleSortToggle = () => {
    const newSortOrder = sortOrder === 'latest' ? 'oldest' : 'latest';
    setSortOrder(newSortOrder);
    
    // Re-sort both order arrays
    const sortWithTracking = [...ordersWithTracking].sort((a, b) => {
      const dateA = new Date(a.created_at || a.orderDate || a.date);
      const dateB = new Date(b.created_at || b.orderDate || b.date);
      return newSortOrder === 'latest' ? dateB - dateA : dateA - dateB;
    });
    
    const sortWithoutTracking = [...ordersWithoutTracking].sort((a, b) => {
      const dateA = new Date(a.created_at || a.orderDate || a.date);
      const dateB = new Date(b.created_at || b.orderDate || b.date);
      return newSortOrder === 'latest' ? dateB - dateA : dateA - dateB;
    });
    
    setOrdersWithTracking(sortWithTracking);
    setOrdersWithoutTracking(sortWithoutTracking);
  };

  const handleDownloadPDF = async (order) => {
    try {
      // In a real app, this would generate and download a PDF
      const element = document.createElement('a');
      const file = new Blob([generateReceiptHTML(order)], { type: 'text/html' });
      element.href = URL.createObjectURL(file);
      element.download = `receipt-${order.orderID}.html`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const generateReceiptHTML = (order) => {
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>E-Receipt & Waybill - Order #${order.orderID}</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none; }
          }
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #faf9f8 0%, #ffffff 100%);
            padding: 40px 20px;
          }
          
          .receipt-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border: 3px solid #a4785a;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          }
          
          .header {
            background: linear-gradient(135deg, #a4785a 0%, #7b5a3b 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 100%;
            background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><pattern id="pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="white" opacity="0.1"/></pattern><rect width="100" height="100" fill="url(%23pattern)"/></svg>');
            opacity: 0.3;
          }
          
          .header h1 {
            font-size: 42px;
            font-weight: 800;
            margin-bottom: 10px;
            letter-spacing: 2px;
            position: relative;
            z-index: 1;
          }
          
          .header .subtitle {
            font-size: 18px;
            opacity: 0.9;
            position: relative;
            z-index: 1;
          }
          
          .tracking-banner {
            background: linear-gradient(90deg, #e5ded7 0%, #faf9f8 50%, #e5ded7 100%);
            padding: 20px;
            text-align: center;
            border-bottom: 2px dashed #a4785a;
          }
          
          .tracking-number {
            font-size: 28px;
            font-weight: 800;
            color: #5c3d28;
            letter-spacing: 3px;
            font-family: 'Courier New', monospace;
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .section {
            margin-bottom: 30px;
            padding-bottom: 25px;
            border-bottom: 1px solid #e5ded7;
          }
          
          .section:last-child {
            border-bottom: none;
          }
          
          .section-title {
            font-size: 16px;
            font-weight: 700;
            color: #a4785a;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
          
          .info-item {
            background: #faf9f8;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #a4785a;
          }
          
          .label {
            font-size: 12px;
            font-weight: 600;
            color: #7b5a3b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
          }
          
          .value {
            font-size: 16px;
            font-weight: 600;
            color: #5c3d28;
          }
          
          .status-badge {
            display: inline-block;
            padding: 8px 16px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            border-radius: 20px;
            font-weight: 700;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          
          .footer {
            background: #5c3d28;
            color: white;
            padding: 30px;
            text-align: center;
          }
          
          .footer-logo {
            font-size: 24px;
            font-weight: 800;
            margin-bottom: 10px;
          }
          
          .footer-text {
            font-size: 12px;
            opacity: 0.8;
          }
          
          .divider {
            height: 2px;
            background: linear-gradient(90deg, transparent 0%, #a4785a 50%, transparent 100%);
            margin: 20px 0;
          }
          
          .total-amount {
            background: linear-gradient(135deg, #a4785a 0%, #7b5a3b 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            margin: 20px 0;
          }
          
          .total-label {
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 5px;
          }
          
          .total-value {
            font-size: 36px;
            font-weight: 800;
            letter-spacing: 1px;
          }
          
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 120px;
            font-weight: 900;
            color: rgba(164, 120, 90, 0.03);
            z-index: 0;
            pointer-events: none;
          }
        </style>
      </head>
      <body>
        <div class="watermark">CRAFTCONNECT</div>
        
        <div class="receipt-container">
          <!-- Header -->
          <div class="header">
            <h1> CRAFTCONNECT</h1>
            <div class="subtitle">E-Receipt & Waybill</div>
          </div>
          
          <!-- Tracking Banner -->
          <div class="tracking-banner">
            <div style="font-size: 14px; color: #7b5a3b; margin-bottom: 8px; font-weight: 600;">TRACKING NUMBER</div>
            <div class="tracking-number">${order.trackingNumber || 'N/A'}</div>
          </div>
          
          <!-- Content -->
          <div class="content">
            <!-- Order Information -->
            <div class="section">
              <div class="section-title">📦 Order Information</div>
              <div class="info-grid">
                <div class="info-item">
                  <div class="label">Order Number</div>
                  <div class="value" style="font-family: 'Courier New', monospace;">${order.order_number}</div>
                </div>
                <div class="info-item">
                  <div class="label">Order Date</div>
                  <div class="value">${new Date(order.created_at || order.orderDate || order.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</div>
                </div>
                <div class="info-item">
                  <div class="label">Customer Name</div>
                  <div class="value">${order.customer || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="label">Order Status</div>
                  <div class="value">${order.status || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="label">💳 Payment Method</div>
                  <div class="value" style="font-weight: 700; ${order.payment_method === 'cod' ? 'color: #dc2626;' : 'color: #16a34a;'}">
                    ${order.payment_method ? order.payment_method.toUpperCase() : 'COD'}
                    ${order.paymentStatus === 'paid' ? ' <span style="color: #16a34a; font-size: 14px;">✓ PAID</span>' : order.payment_method === 'cod' ? ' <span style="color: #dc2626; font-size: 14px;">⚠ COLLECT ON DELIVERY</span>' : ' <span style="color: #f59e0b; font-size: 14px;">⏳ PENDING</span>'}
                  </div>
                </div>
                <div class="info-item" style="grid-column: 1 / -1;">
                  <div class="label">📍 Delivery Location</div>
                  <div class="value" style="font-size: 14px;">${order.location || 'N/A'}</div>
                </div>
              </div>
            </div>
            
            <!-- Products Ordered -->
            <div class="section">
              <div class="section-title">📦 Products Ordered</div>
              <div style="background: white; border: 2px solid #e5ded7; border-radius: 12px; overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background: linear-gradient(135deg, #a4785a 0%, #7b5a3b 100%); color: white;">
                      <th style="padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Product Name</th>
                      <th style="padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">SKU</th>
                      <th style="padding: 12px; text-align: center; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Qty</th>
                      <th style="padding: 12px; text-align: right; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Price</th>
                      <th style="padding: 12px; text-align: right; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${(order.products || []).map((product, index) => `
                      <tr style="border-bottom: 1px solid #e5ded7; ${index % 2 === 0 ? 'background: #faf9f8;' : 'background: white;'}">
                        <td style="padding: 15px; font-weight: 600; color: #5c3d28;">${product.product_name || 'N/A'}</td>
                        <td style="padding: 15px; font-family: 'Courier New', monospace; color: #7b5a3b; font-weight: 600;">${product.sku || 'N/A'}</td>
                        <td style="padding: 15px; text-align: center; font-weight: 700; color: #a4785a;">${product.quantity || 0}</td>
                        <td style="padding: 15px; text-align: right; color: #5c3d28;">₱${parseFloat(product.price || 0).toFixed(2)}</td>
                        <td style="padding: 15px; text-align: right; font-weight: 700; color: #5c3d28;">₱${parseFloat(product.total_amount || 0).toFixed(2)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
            
            <!-- Seller Information -->
            <div class="section">
              <div class="section-title">👤 Seller Information</div>
              <div class="info-item" style="grid-column: 1 / -1; background: linear-gradient(135deg, #faf9f8 0%, #ffffff 100%); border: 3px solid #a4785a; border-radius: 12px; padding: 25px; box-shadow: 0 4px 6px rgba(164, 120, 90, 0.1);">
                <div class="label" style="font-size: 14px; margin-bottom: 10px;">🏪 Seller Name</div>
                <div class="value" style="font-size: 22px; margin-bottom: 20px; color: #a4785a;">${order.seller_name || 'CraftConnect Seller'}</div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                  <div>
                    <div class="label" style="font-size: 12px; margin-bottom: 5px;">📞 Contact Number</div>
                    <div class="value" style="font-size: 16px;">${order.seller_contact || 'N/A'}</div>
                  </div>
                  <div>
                    <div class="label" style="font-size: 12px; margin-bottom: 5px;">📧 Email</div>
                    <div class="value" style="font-size: 14px;">${order.seller_email || 'N/A'}</div>
                  </div>
                </div>
                
                <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #7b5a3b;">
                  <div class="label" style="font-size: 14px; margin-bottom: 10px; display: flex; align-items: center; gap: 5px;">
                    📍 Complete Seller Address
                  </div>
                  <div class="value" style="font-size: 16px; line-height: 1.6; color: #5c3d28; font-weight: 700;">
                    ${order.seller_address || 'Address not available'}
                  </div>
                  ${order.seller_city || order.seller_province ? `
                  <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5ded7; font-size: 14px; color: #7b5a3b;">
                    <div style="margin-bottom: 5px;">City: <strong>${order.seller_city || 'N/A'}</strong></div>
                    <div>Province: <strong>${order.seller_province || 'N/A'}</strong></div>
                  </div>
                  ` : ''}
                </div>
              </div>
            </div>
            
            <!-- Total Amount -->
            <div class="total-amount">
              <div class="total-label">Total Amount</div>
              <div class="total-value">₱${parseFloat(order.totalAmount || order.total || 0).toFixed(2)}</div>
            </div>
            
            <!-- Payment Notice for Rider -->
            <div class="section" style="margin-top: 20px;">
              <div style="background: ${order.payment_method === 'cod' ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' : 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)'}; border: 3px solid ${order.payment_method === 'cod' ? '#dc2626' : '#16a34a'}; border-radius: 12px; padding: 20px; text-align: center;">
                <div style="font-size: 18px; font-weight: 700; color: ${order.payment_method === 'cod' ? '#991b1b' : '#166534'}; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">
                  ⚠️ RIDER - PAYMENT NOTICE
                </div>
                ${order.paymentStatus === 'paid' ? `
                  <div style="font-size: 24px; font-weight: 800; color: #166534; margin-bottom: 8px;">
                    ✅ ALREADY PAID
                  </div>
                  <div style="font-size: 16px; color: #16a34a; font-weight: 600;">
                    Payment Method: ${order.payment_method ? order.payment_method.toUpperCase() : 'ONLINE'}
                  </div>
                  <div style="font-size: 14px; color: #166534; margin-top: 8px; font-weight: 500;">
                    ℹ️ No collection needed. Customer has already paid ₱${parseFloat(order.totalAmount || order.total || 0).toFixed(2)} via ${order.payment_method ? order.payment_method.toUpperCase() : 'Online Payment'}.
                  </div>
                ` : order.payment_method === 'cod' ? `
                  <div style="font-size: 24px; font-weight: 800; color: #991b1b; margin-bottom: 8px;">
                    💰 COLLECT CASH ON DELIVERY
                  </div>
                  <div style="font-size: 20px; color: #dc2626; font-weight: 700; background: white; padding: 10px; border-radius: 8px; display: inline-block; margin-top: 5px;">
                    Amount to Collect: ₱${parseFloat(order.totalAmount || order.total || 0).toFixed(2)}
                  </div>
                  <div style="font-size: 14px; color: #991b1b; margin-top: 10px; font-weight: 600;">
                    ⚠️ Please collect the exact amount upon delivery and issue a receipt.
                  </div>
                ` : `
                  <div style="font-size: 20px; font-weight: 700; color: #f59e0b; margin-bottom: 8px;">
                    ⏳ PAYMENT PENDING
                  </div>
                  <div style="font-size: 14px; color: #92400e; font-weight: 500;">
                    Payment via ${order.payment_method ? order.payment_method.toUpperCase() : 'Online'} is still being processed. Please verify before delivery.
                  </div>
                `}
              </div>
            </div>
            
            <div class="divider"></div>
            
            <!-- Print Info -->
            <div style="text-align: center; color: #7b5a3b; font-size: 12px;">
              <div style="margin-bottom: 5px;">Printed on: ${currentDate}</div>
              <div>This is a computer-generated document. No signature is required.</div>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <div class="footer-logo">CRAFTCONNECT</div>
            <div class="footer-text">Connecting Artisans with the World</div>
            <div class="footer-text" style="margin-top: 10px;">
              📧 craftconnect49@gmail.com | 📞 +63 123 456 7890 | 🌐 www.craftconnect.com
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'packing': return 'bg-orange-100 text-orange-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a4785a] mx-auto mb-4"></div>
          <p className="text-[#5c3d28]">Loading receipts...</p>
        </div>
      </div>
    );
  }

  // Get current orders array based on active tab
  const currentOrders = activeTab === 'waybill' ? ordersWithTracking : ordersWithoutTracking;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-[405px] mx-auto sm:max-w-none px-2 sm:px-0">

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 border-b-2 border-[#e5ded7]">
        <button
          onClick={() => {
            setActiveTab('waybill');
            setSelectedOrder(null);
          }}
          className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold transition-all duration-200 border-b-4 text-xs sm:text-sm md:text-base ${
            activeTab === 'waybill'
              ? 'border-[#a4785a] text-[#5c3d28] bg-gradient-to-b from-[#faf9f8] to-transparent'
              : 'border-transparent text-[#7b5a3b] hover:text-[#5c3d28] hover:bg-[#faf9f8]/50'
          }`}
        >
          <Truck className="h-3 w-3 sm:h-4 sm:w-4 inline mr-2" />
          Waybills ({ordersWithTracking.length})
          <span className="ml-2 text-xs bg-[#a4785a]/10 px-2 py-1 rounded hidden sm:inline">With Tracking</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('receipts');
            setSelectedOrder(null);
          }}
          className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold transition-all duration-200 border-b-4 text-xs sm:text-sm md:text-base ${
            activeTab === 'receipts'
              ? 'border-[#a4785a] text-[#5c3d28] bg-gradient-to-b from-[#faf9f8] to-transparent'
              : 'border-transparent text-[#7b5a3b] hover:text-[#5c3d28] hover:bg-[#faf9f8]/50'
          }`}
        >
          <FileText className="h-3 w-3 sm:h-4 sm:w-4 inline mr-2" />
          Customer E-Receipts ({ordersWithoutTracking.length})
          <span className="ml-2 text-xs bg-green-600/10 text-green-700 px-2 py-1 rounded hidden sm:inline">Paid Online</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 h-[calc(100vh-16rem)]">
        {/* Orders List */}
        <Card className="border-2 border-[#e5ded7] shadow-xl h-full flex flex-col rounded-lg sm:rounded-xl overflow-hidden">
          <CardHeader className="border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white p-3 sm:p-6 flex-none">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div>
                <CardTitle className="text-[#5c3d28] flex items-center text-base sm:text-lg md:text-xl">
                  <div className="p-1.5 sm:p-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg mr-2 sm:mr-3">
                    {activeTab === 'waybill' ? <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-white" /> : <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />}
                  </div>
                  {activeTab === 'waybill' ? 'Waybills (With Tracking)' : 'Customer E-Receipts (Paid Online)'}
                </CardTitle>
                <CardDescription className="text-[#7b5a3b] ml-0 sm:ml-11 text-xs sm:text-sm">
                  {activeTab === 'waybill' 
                    ? 'Orders with tracking numbers - for rider delivery documents'
                    : 'Paid GCash/PayMaya orders - send these receipts to customers'}
                </CardDescription>
              </div>
              <Button
                onClick={handleSortToggle}
                variant="outline"
                size="sm"
                className="border-[#e5ded7] text-[#5c3d28] hover:bg-[#faf9f8] hover:border-[#a4785a] transition-all"
              >
                {sortOrder === 'latest' ? (
                  <>
                    <ArrowUp className="h-4 w-4 mr-1" />
                    Latest First
                  </>
                ) : (
                  <>
                    <ArrowDown className="h-4 w-4 mr-1" />
                    Oldest First
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3 flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto custom-scrollbar pr-2 space-y-2">
              {currentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  {activeTab === 'waybill' ? (
                    <>
                      <p className="text-[#7b5a3b] font-semibold">No waybills available</p>
                      <p className="text-[#7b5a3b] text-sm mt-1">Orders need tracking numbers to generate waybills</p>
                      <p className="text-[#7b5a3b] text-xs mt-1">Assign riders in "Shipping Simulation" to generate tracking</p>
                    </>
                  ) : (
                    <>
                      <p className="text-[#7b5a3b] font-semibold">No customer e-receipts available</p>
                      <p className="text-[#7b5a3b] text-sm mt-1">Paid GCash/PayMaya orders without tracking will appear here</p>
                      <p className="text-[#7b5a3b] text-xs mt-1">These receipts can be sent to customers via messages</p>
                    </>
                  )}
                </div>
              ) : (
                currentOrders.map((order) => (
                  <div
                    key={order.orderID}
                    className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                      selectedOrder?.orderID === order.orderID
                        ? 'border-[#a4785a] bg-gradient-to-r from-[#a4785a]/10 to-[#7b5a3b]/10'
                        : 'border-[#e5ded7] hover:border-[#a4785a]/50 hover:shadow-md'
                    }`}
                    onClick={() => handleOrderSelect(order)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-bold text-[#5c3d28] bg-white px-2 py-1 rounded border border-[#e5ded7]">
                            {order.order_number}
                          </h3>
                          <Badge className="bg-[#a4785a]/10 text-[#5c3d28] border-[#a4785a]/30">
                            {order.status || 'Unknown'}
                          </Badge>
                          {order.payment_method && (
                            <Badge className={`${
                              order.payment_method === 'cod' ? 'bg-yellow-100 text-yellow-800' :
                              order.payment_method === 'gcash' ? 'bg-blue-100 text-blue-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {order.payment_method.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mb-2">Order ID: #{order.orderID}</p>
                        <p className="text-[#7b5a3b] text-sm">
                          <User className="h-3 w-3 inline mr-1" />
                          Customer: {order.customer || 'Unknown'}
                        </p>
                        <p className="text-[#7b5a3b] text-sm">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          Order Date: {new Date(order.created_at || order.orderDate || order.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className="text-[#7b5a3b] text-sm">
                          💰 Total: ₱{parseFloat(order.totalAmount || order.total || 0).toFixed(2)}
                        </p>
                        {activeTab === 'waybill' && order.trackingNumber && (
                          <p className="text-[#a4785a] text-sm font-medium">
                            📦 Tracking: {order.trackingNumber}
                          </p>
                        )}
                        {activeTab === 'receipts' && (
                          <div className="flex gap-2 mt-1">
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              ✓ Paid via {order.payment_method?.toUpperCase()}
                            </Badge>
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              No Tracking Yet
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOrderSelect(order);
                          }}
                          className="border-[#e5ded7] text-[#5c3d28] hover:bg-[#faf9f8] hover:border-[#a4785a]"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Receipt Preview */}
        <Card className="border-2 border-[#e5ded7] shadow-xl h-full flex flex-col rounded-lg sm:rounded-xl overflow-hidden" ref={previewRef}>
          <CardHeader className="border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white flex-none p-3 sm:p-6">
            <CardTitle className="text-[#5c3d28] flex items-center text-xl">
              <div className="p-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg mr-3">
                {activeTab === 'waybill' ? <Truck className="h-5 w-5 text-white" /> : <FileText className="h-5 w-5 text-white" />}
              </div>
              {activeTab === 'waybill' ? 'Waybill Preview' : 'Customer E-Receipt Preview'}
            </CardTitle>
            <CardDescription className="text-[#7b5a3b] ml-11">
              {selectedOrder 
                ? `${activeTab === 'waybill' ? 'Waybill' : 'E-Receipt'} for Order #${selectedOrder.orderID}` 
                : `Select an order to preview ${activeTab === 'waybill' ? 'waybill' : 'e-receipt'}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 flex-1 overflow-hidden">
            <style>{scrollbarStyles}</style>
            <style>{printStyles}</style>
            {selectedOrder ? (
              <div className="h-full overflow-y-auto custom-scrollbar pr-2 space-y-4">
                {/* Add print styles */}
                
                {/* Receipt Content - Print Ready */}
                <div className="print-content bg-white border-2 border-[#e5ded7] rounded-xl overflow-hidden shadow-lg">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white p-6 text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{
                      backgroundImage: 'radial-gradient(circle at 20px 20px, white 1px, transparent 1px)',
                      backgroundSize: '40px 40px'
                    }}></div>
                    <div className="relative z-10">
                      <h2 className="text-3xl font-bold mb-2 tracking-wide"> CRAFTCONNECT</h2>
                      <h3 className="text-lg font-semibold opacity-90">E-Receipt & Waybill</h3>
                      <div className="mt-3 inline-block bg-white/20 px-4 py-2 rounded-full">
                        <p className="text-sm font-bold">Order #{selectedOrder.orderID}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tracking Banner - Only show for waybills */}
                  {activeTab === 'waybill' && selectedOrder.trackingNumber && (
                    <div className="bg-gradient-to-r from-[#e5ded7] via-[#faf9f8] to-[#e5ded7] p-4 text-center border-b-2 border-dashed border-[#a4785a]">
                      <p className="text-xs font-semibold text-[#7b5a3b] mb-1 tracking-wider">TRACKING NUMBER</p>
                      <p className="text-2xl font-bold text-[#5c3d28] font-mono tracking-widest">
                        {selectedOrder.trackingNumber}
                      </p>
                    </div>
                  )}
                  
                  {/* Payment Status Banner - For customer receipts without tracking */}
                  {activeTab === 'receipts' && (
                    <div className="bg-gradient-to-r from-green-100 via-green-50 to-green-100 p-4 text-center border-b-2 border-dashed border-green-500">
                      <p className="text-xs font-semibold text-green-700 mb-1 tracking-wider">PAYMENT CONFIRMED</p>
                      <div className="flex items-center justify-center gap-2">
                        <p className="text-2xl font-bold text-green-700">
                          ✓ PAID VIA {selectedOrder.payment_method?.toUpperCase()}
                        </p>
                      </div>
                      <p className="text-xs text-green-600 mt-1">Customer E-Receipt - Send to customer via messages</p>
                    </div>
                  )}

                  {/* Order Details */}
                  <div className="p-6 space-y-6 relative">
                    {/* CraftConnect Watermark */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
                      <p className="text-[140px] font-black text-[#a4785a] opacity-[0.03] transform rotate-[-45deg] select-none whitespace-nowrap">
                        CRAFTCONNECT
                      </p>
                    </div>

                    {/* Order Information Section */}
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#e5ded7]">
                        <div className="p-1 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded">
                          <Package className="h-4 w-4 text-white" />
                        </div>
                        <h4 className="text-sm font-bold text-[#a4785a] uppercase tracking-wide">Order Information</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#faf9f8] p-3 rounded-lg border-l-4 border-[#a4785a]">
                          <p className="text-xs font-semibold text-[#7b5a3b] uppercase tracking-wide mb-1">Order Number</p>
                          <p className="text-sm font-bold text-[#5c3d28] font-mono">{selectedOrder.order_number}</p>
                        </div>
                        <div className="bg-[#faf9f8] p-3 rounded-lg border-l-4 border-[#a4785a]">
                          <p className="text-xs font-semibold text-[#7b5a3b] uppercase tracking-wide mb-1">Order Date</p>
                          <p className="text-sm font-bold text-[#5c3d28]">{new Date(selectedOrder.created_at || selectedOrder.orderDate || selectedOrder.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</p>
                        </div>
                        <div className="bg-[#faf9f8] p-3 rounded-lg border-l-4 border-[#a4785a]">
                          <p className="text-xs font-semibold text-[#7b5a3b] uppercase tracking-wide mb-1">Customer Name</p>
                          <p className="text-base font-bold text-[#5c3d28]">{selectedOrder.customer || 'N/A'}</p>
                        </div>
                        <div className="bg-[#faf9f8] p-3 rounded-lg border-l-4 border-[#a4785a]">
                          <p className="text-xs font-semibold text-[#7b5a3b] uppercase tracking-wide mb-1">Status</p>
                          <p className="text-sm font-bold text-[#5c3d28]">{selectedOrder.status || 'N/A'}</p>
                        </div>
                        <div className={`p-3 rounded-lg border-l-4 col-span-2 ${
                          selectedOrder.payment_method === 'cod' 
                            ? 'bg-red-50 border-red-500' 
                            : 'bg-green-50 border-green-500'
                        }`}>
                          <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{
                            color: selectedOrder.payment_method === 'cod' ? '#991b1b' : '#166534'
                          }}>💳 Payment Method</p>
                          <div className="flex items-center justify-between">
                            <p className={`text-lg font-bold ${
                              selectedOrder.payment_method === 'cod' ? 'text-red-700' : 'text-green-700'
                            }`}>
                              {selectedOrder.payment_method?.toUpperCase() || 'COD'}
                            </p>
                            {selectedOrder.paymentStatus === 'paid' ? (
                              <Badge className="bg-green-600 text-white">✓ PAID</Badge>
                            ) : selectedOrder.payment_method === 'cod' ? (
                              <Badge className="bg-red-600 text-white">⚠ COLLECT</Badge>
                            ) : (
                              <Badge className="bg-orange-600 text-white">⏳ PENDING</Badge>
                            )}
                          </div>
                        </div>
                        <div className="bg-[#faf9f8] p-3 rounded-lg border-l-4 border-[#a4785a] col-span-2">
                          <p className="text-xs font-semibold text-[#7b5a3b] uppercase tracking-wide mb-1">📍 Delivery Location</p>
                          <p className="text-base font-bold text-[#5c3d28]">{selectedOrder.location || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Products Ordered Section */}
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#e5ded7]">
                        <div className="p-1 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded">
                          <Package className="h-4 w-4 text-white" />
                        </div>
                        <h4 className="text-sm font-bold text-[#a4785a] uppercase tracking-wide">Products Ordered</h4>
                      </div>
                      <div className="bg-white border-2 border-[#e5ded7] rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white">
                              <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide">Product Name</th>
                              <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide">SKU</th>
                              <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wide">Qty</th>
                              <th className="px-3 py-3 text-right text-xs font-bold uppercase tracking-wide">Price</th>
                              <th className="px-3 py-3 text-right text-xs font-bold uppercase tracking-wide">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(selectedOrder.products || []).map((product, index) => (
                              <tr key={index} className={`border-b border-[#e5ded7] ${index % 2 === 0 ? 'bg-[#faf9f8]' : 'bg-white'}`}>
                                <td className="px-3 py-4 font-semibold text-[#5c3d28] text-sm">{product.product_name || 'N/A'}</td>
                                <td className="px-3 py-4 font-mono text-[#7b5a3b] font-semibold text-xs">{product.sku || 'N/A'}</td>
                                <td className="px-3 py-4 text-center font-bold text-[#a4785a]">{product.quantity || 0}</td>
                                <td className="px-3 py-4 text-right text-[#5c3d28] text-sm">₱{parseFloat(product.price || 0).toFixed(2)}</td>
                                <td className="px-3 py-4 text-right font-bold text-[#5c3d28] text-sm">₱{parseFloat(product.total_amount || 0).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Seller Information Section */}
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#e5ded7]">
                        <div className="p-1 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <h4 className="text-sm font-bold text-[#a4785a] uppercase tracking-wide">Seller Information</h4>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-[#faf9f8] p-4 rounded-lg border-l-4 border-[#a4785a]">
                          <p className="text-xs font-semibold text-[#7b5a3b] uppercase tracking-wide mb-2">
                            <User className="h-3 w-3 inline mr-1" />
                            Seller Name
                          </p>
                          <p className="text-lg font-bold text-[#5c3d28]">{selectedOrder.seller_name || 'CraftConnect Seller'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-[#faf9f8] p-3 rounded-lg border-l-4 border-[#a4785a]">
                            <p className="text-xs font-semibold text-[#7b5a3b] uppercase tracking-wide mb-2">
                              <Phone className="h-3 w-3 inline mr-1" />
                              Contact
                            </p>
                            <p className="text-sm font-bold text-[#5c3d28]">{selectedOrder.seller_contact || 'N/A'}</p>
                          </div>
                          <div className="bg-[#faf9f8] p-3 rounded-lg border-l-4 border-[#a4785a]">
                            <p className="text-xs font-semibold text-[#7b5a3b] uppercase tracking-wide mb-2">
                              📧 Email
                            </p>
                            <p className="text-xs font-bold text-[#5c3d28] truncate">{selectedOrder.seller_email || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-[#faf9f8] to-white p-4 rounded-lg border-2 border-[#a4785a] shadow-md">
                          <p className="text-xs font-semibold text-[#7b5a3b] uppercase tracking-wide mb-2 flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-[#a4785a]" />
                            Seller Address (Complete)
                          </p>
                          <p className="text-base font-bold text-[#5c3d28] leading-relaxed">
                            {selectedOrder.seller_address || 'Address not available'}
                          </p>
                          <div className="mt-2 text-sm text-[#7b5a3b]">
                            <p>City: {selectedOrder.seller_city || 'N/A'}</p>
                            <p>Province: {selectedOrder.seller_province || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Total Amount - Highlighted */}
                    <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] p-5 rounded-xl text-center shadow-md">
                      <p className="text-sm font-semibold text-white/90 mb-1">TOTAL AMOUNT</p>
                      <p className="text-4xl font-bold text-white tracking-wide">
                        ₱{parseFloat(selectedOrder.totalAmount || selectedOrder.total || 0).toFixed(2)}
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-[#a4785a] to-transparent"></div>

                    {/* Footer Info */}
                    <div className="text-center space-y-2">
                      <p className="text-xs text-[#7b5a3b]">
                        Printed on: {new Date().toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-xs text-[#7b5a3b] italic">
                        This is a computer-generated document. No signature is required.
                      </p>
                    </div>
                  </div>

                  {/* Footer Banner */}
                  <div className="bg-[#5c3d28] text-white p-6 text-center">
                    <p className="text-xl font-bold mb-2">CRAFTCONNECT</p>
                    <p className="text-sm opacity-80 mb-2">Connecting Artisans with the World</p>
                    <p className="text-xs opacity-70">
                      📧 craftconnect49@gmail.com | 📞 +63 123 456 7890 | 🌐 www.craftconnect.com
                    </p>
                  </div>
                </div>

                {/* Action Buttons - No Print */}
                <div className="flex gap-3 no-print">
                  <Button
                    onClick={() => handleDownloadPDF(selectedOrder)}
                    className="flex-1 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white hover:from-[#8a6b4a] hover:to-[#6b4a2f] shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    onClick={handlePrint}
                    variant="outline"
                    className="flex-1 border-2 border-[#a4785a] text-[#5c3d28] hover:bg-gradient-to-r hover:from-[#a4785a] hover:to-[#7b5a3b] hover:text-white hover:border-[#a4785a] transition-all duration-200"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Receipt
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-[#7b5a3b] text-lg">Select an order to preview receipt</p>
                <p className="text-[#7b5a3b] text-sm mt-2">Choose from the orders list to generate receipt</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EReceiptWaybill;
