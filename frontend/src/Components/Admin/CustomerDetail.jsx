import React, { useState, useEffect } from "react";
import { X, Edit, User, Mail, Phone, MapPin, Calendar, ShoppingBag, TrendingUp, Star, Award } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import api from "../../api";

const CustomerDetail = ({ customerId, isOpen, onClose, onEdit }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && customerId) {
      fetchCustomerDetails();
    }
  }, [isOpen, customerId]);

  const fetchCustomerDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching customer details for ID:', customerId);
      const response = await api.get(`/customers/${customerId}`);
      console.log('✅ Customer details received:', response.data);
      console.log('📊 Orders count:', response.data.orders_count);
      console.log('💰 Total spent:', response.data.total_spent);
      console.log('📅 Last purchase:', response.data.last_purchase);
      console.log('🖼️ Profile image URL:', response.data.profile_image_url);
      setCustomer(response.data);
    } catch (err) {
      console.error("❌ Error fetching customer details:", err);
      console.error("Error details:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "inactive":
        return <Badge variant="outline" className="text-gray-500">Inactive</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[120vw] bg-white border-2 border-[#d5bfae] rounded-xl shadow-2xl">
          <DialogHeader className="bg-gradient-to-r from-[#f8f6f4] to-[#f0ebe7] rounded-t-xl p-6 border-b border-[#e5ddd4]">
            <DialogTitle className="text-2xl font-bold text-[#5c3d28] flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              Customer Details
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a4785a] mx-auto"></div>
              <p className="mt-4 text-[#7b5a3b] text-lg">Loading customer details...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[120vw] bg-white border-2 border-[#d5bfae] rounded-xl shadow-2xl">
          <DialogHeader className="bg-gradient-to-r from-[#f8f6f4] to-[#f0ebe7] rounded-t-xl p-6 border-b border-[#e5ddd4]">
            <DialogTitle className="text-2xl font-bold text-[#5c3d28] flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              Customer Details
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-red-600 text-lg mb-6">Error loading customer details: {error}</p>
            <Button 
              onClick={fetchCustomerDetails} 
              className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white px-6 py-3 rounded-lg shadow-md transition-all"
            >
              Try Again
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[120vw] max-h-[90vh] overflow-y-auto bg-white border-2 border-[#d5bfae] rounded-xl shadow-2xl mt-10">
        <DialogHeader className="bg-gradient-to-r from-[#f8f6f4] to-[#f0ebe7] rounded-t-xl p-6 border-b border-[#e5ddd4]">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-[#5c3d28] flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              Customer Details
            </DialogTitle>
            <div className="flex gap-3">
              <Button 
                onClick={() => onEdit(customer)} 
                className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white px-4 py-2 rounded-lg shadow-md transition-all"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Customer
              </Button>
            </div>
          </div>
        </DialogHeader>

        {customer && (
          <div className="p-6 space-y-8">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-[#f8f6f4] to-[#f0ebe7] rounded-xl p-6 border border-[#e5ddd4]">
              <div className="flex items-center gap-6">
                <div className="w-100 h-20 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-full flex items-center justify-center shadow-lg">
                  {customer.profile_image_url ? (
                    <img
                      src={customer.profile_image_url}
                      alt={customer.userName}
                      className="w-20 h-20 object-cover rounded-full"
                    />
                  ) : (
                    <User className="h-10 w-10 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[#5c3d28]">{customer.userName || "N/A"}</h2>
                  <p className="text-[#7b5a3b] text-lg">{customer.userEmail}</p>
                  <div className="mt-2">{getStatusBadge(customer.status)}</div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-[#f8f6f4] to-[#f0ebe7] rounded-xl p-4 border border-[#e5ddd4] text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="h-6 w-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-[#5c3d28]">{customer.orders_count || 0}</p>
                <p className="text-[#7b5a3b] text-sm">Total Orders</p>
              </div>
              <div className="bg-gradient-to-br from-[#f8f6f4] to-[#f0ebe7] rounded-xl p-4 border border-[#e5ddd4] text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-[#5c3d28]">₱{(customer.total_spent || 0).toLocaleString()}</p>
                <p className="text-[#7b5a3b] text-sm">Total Spent</p>
              </div>
              <div className="bg-gradient-to-br from-[#f8f6f4] to-[#f0ebe7] rounded-xl p-5 border border-[#e5ddd4] text-center min-w-0">
                <div className="w-12 h-12 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <p className="text-lg font-bold text-[#5c3d28] break-words">
                  {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : "N/A"}
                </p>
                <p className="text-[#7b5a3b] text-sm">Join Date</p>
              </div>
              <div className="bg-gradient-to-br from-[#f8f6f4] to-[#f0ebe7] rounded-xl p-5 border border-[#e5ddd4] text-center min-w-0">
                <div className="w-12 h-12 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <p className="text-lg font-bold text-[#5c3d28] break-words">
                  {customer.last_purchase ? new Date(customer.last_purchase).toLocaleDateString() : "Never"}
                </p>
                <p className="text-[#7b5a3b] text-sm">Last Purchase</p>
              </div>
            </div>

            {/* Contact Information */}
            <Card className="border-2 border-[#d5bfae] rounded-xl shadow-lg">
              <CardHeader className="bg-gradient-to-r from-[#f8f6f4] to-[#f0ebe7] rounded-t-xl border-b border-[#e5ddd4]">
                <CardTitle className="text-xl font-bold text-[#5c3d28] flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-full flex items-center justify-center">
                    <User className="h-3 w-3 text-white" />
                  </div>
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-[#7b5a3b] flex items-center gap-2 mb-2">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </label>
                      <p className="text-lg text-[#5c3d28] bg-[#f8f6f4] p-4 rounded-lg border border-[#e5ddd4] min-w-0 break-all">
                        {customer.userEmail || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#7b5a3b] flex items-center gap-2 mb-2">
                        <Phone className="h-4 w-4" />
                        Phone Number
                      </label>
                      <p className="text-lg text-[#5c3d28] bg-[#f8f6f4] p-4 rounded-lg border border-[#e5ddd4]">
                        {customer.userContactNumber || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-[#7b5a3b] flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4" />
                        Address
                      </label>
                      <p className="text-lg text-[#5c3d28] bg-[#f8f6f4] p-4 rounded-lg border border-[#e5ddd4]">
                        {customer.userAddress || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#7b5a3b] flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4" />
                        Birthday
                      </label>
                      <p className="text-lg text-[#5c3d28] bg-[#f8f6f4] p-4 rounded-lg border border-[#e5ddd4]">
                        {customer.userBirthday ? new Date(customer.userBirthday).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetail;