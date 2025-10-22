import React, { useState, useEffect } from "react";
import { X, Edit, User, Mail, Phone, MapPin, Calendar, Store, Package, TrendingUp, Award, Star } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import api from "../../api";

const SellerDetail = ({ sellerId, isOpen, onClose, onEdit }) => {
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && sellerId) {
      fetchSellerDetails();
    }
  }, [isOpen, sellerId]);

  const fetchSellerDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching seller details for ID:', sellerId);
      const response = await api.get(`/sellers/${sellerId}`);
      console.log('✅ Seller details received:', response.data);
      console.log('📊 Seller Statistics:', {
        products_count: response.data.products_count,
        total_revenue: response.data.total_revenue,
        total_orders: response.data.total_orders,
        average_rating: response.data.average_rating,
        total_reviews: response.data.total_reviews
      });
      setSeller(response.data);
    } catch (err) {
      console.error("❌ Error fetching seller details:", err);
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
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "suspended":
        return <Badge className="bg-red-500">Suspended</Badge>;
      case "dormant":
        return <Badge variant="outline" className="text-orange-500">Dormant</Badge>;
      default:
        return null; // Don't show badge if status is unknown
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl bg-white border-2 border-[#d5bfae] rounded-xl shadow-2xl">
          <DialogHeader className="bg-gradient-to-r from-[#f8f6f4] to-[#f0ebe7] rounded-t-xl p-6 border-b border-[#e5ddd4]">
            <DialogTitle className="text-2xl font-bold text-[#5c3d28] flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-full flex items-center justify-center">
                <Store className="h-4 w-4 text-white" />
              </div>
              Seller Details
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a4785a] mx-auto"></div>
              <p className="mt-4 text-[#7b5a3b] text-lg">Loading seller details...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl bg-white border-2 border-[#d5bfae] rounded-xl shadow-2xl">
          <DialogHeader className="bg-gradient-to-r from-[#f8f6f4] to-[#f0ebe7] rounded-t-xl p-6 border-b border-[#e5ddd4]">
            <DialogTitle className="text-2xl font-bold text-[#5c3d28] flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-full flex items-center justify-center">
                <Store className="h-4 w-4 text-white" />
              </div>
              Seller Details
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-red-600 text-lg mb-6">Error loading seller details: {error}</p>
            <Button 
              onClick={fetchSellerDetails} 
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
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto bg-white border-2 border-[#d5bfae] rounded-xl shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-[#f8f6f4] to-[#f0ebe7] rounded-t-xl p-6 border-b border-[#e5ddd4]">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-[#5c3d28] flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-full flex items-center justify-center">
                <Store className="h-4 w-4 text-white" />
              </div>
              Seller Details
            </DialogTitle>
            <div className="flex gap-3">
              <Button 
                onClick={() => onEdit(seller)} 
                className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white px-4 py-2 rounded-lg shadow-md transition-all"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Seller
              </Button>
            </div>
          </div>
        </DialogHeader>

        {seller && (
          <div className="p-6 space-y-8">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-[#f8f6f4] to-[#f0ebe7] rounded-xl p-6 border border-[#e5ddd4]">
              <div className="flex items-center gap-6">
                <div className="w-90 h-20 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-full flex items-center justify-center shadow-lg">
                  {seller.profile_image_url ? (
                    <img
                      src={seller.profile_image_url}
                      alt={seller.user?.userName}
                      className="w-20 h-20 object-cover rounded-full"
                    />
                  ) : (
                    <Store className="h-10 w-10 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[#5c3d28]">{seller.user?.userName || "N/A"}</h2>
                  <p className="text-[#7b5a3b] text-lg">{seller.businessName || "No Business Name"}</p>
                  {seller.status && <div className="mt-2">{getStatusBadge(seller.status)}</div>}
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-[#f8f6f4] to-[#f0ebe7] rounded-xl p-4 border border-[#e5ddd4] text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-[#5c3d28]">{seller.products_count || 0}</p>
                <p className="text-[#7b5a3b] text-sm">Products</p>
              </div>
              <div className="bg-gradient-to-br from-[#f8f6f4] to-[#f0ebe7] rounded-xl p-4 border border-[#e5ddd4] text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-[#5c3d28]">₱{(seller.total_revenue || 0).toLocaleString()}</p>
                <p className="text-[#7b5a3b] text-sm">Total Revenue</p>
              </div>
              <div className="bg-gradient-to-br from-[#f8f6f4] to-[#f0ebe7] rounded-xl p-4 border border-[#e5ddd4] text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-[#5c3d28]">{seller.total_orders || 0}</p>
                <p className="text-[#7b5a3b] text-sm">Total Orders</p>
              </div>
              <div className="bg-gradient-to-br from-[#f8f6f4] to-[#f0ebe7] rounded-xl p-4 border border-[#e5ddd4] text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center justify-center gap-1">
                  <p className="text-2xl font-bold text-[#5c3d28]">{seller.average_rating?.toFixed(1) || "0.0"}</p>
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                </div>
                <p className="text-[#7b5a3b] text-sm">({seller.total_reviews || 0} reviews)</p>
              </div>
            </div>

            {/* Business Information */}
            <Card className="border-2 border-[#d5bfae] rounded-xl shadow-lg">
              <CardHeader className="bg-gradient-to-r from-[#f8f6f4] to-[#f0ebe7] rounded-t-xl border-b border-[#e5ddd4]">
                <CardTitle className="text-xl font-bold text-[#5c3d28] flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-full flex items-center justify-center">
                    <Store className="h-3 w-3 text-white" />
                  </div>
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-[#7b5a3b] flex items-center gap-2 mb-2">
                        <Store className="h-4 w-4" />
                        Business Name
                      </label>
                      <p className="text-lg text-[#5c3d28] bg-[#f8f6f4] p-3 rounded-lg border border-[#e5ddd4]">
                        {seller.businessName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#7b5a3b] flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4" />
                        Location
                      </label>
                      <p className="text-lg text-[#5c3d28] bg-[#f8f6f4] p-3 rounded-lg border border-[#e5ddd4]">
                        {seller.user?.userAddress || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-[#7b5a3b] flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4" />
                        Join Date
                      </label>
                      <p className="text-lg text-[#5c3d28] bg-[#f8f6f4] p-3 rounded-lg border border-[#e5ddd4]">
                        {seller.created_at ? new Date(seller.created_at).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-[#7b5a3b] flex items-center gap-2 mb-2">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </label>
                      <p className="text-lg text-[#5c3d28] bg-[#f8f6f4] p-3 rounded-lg border border-[#e5ddd4]">
                        {seller.user?.userEmail || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#7b5a3b] flex items-center gap-2 mb-2">
                        <Phone className="h-4 w-4" />
                        Phone Number
                      </label>
                      <p className="text-lg text-[#5c3d28] bg-[#f8f6f4] p-3 rounded-lg border border-[#e5ddd4]">
                        {seller.user?.userContactNumber || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-[#7b5a3b] flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4" />
                        Address
                      </label>
                      <p className="text-lg text-[#5c3d28] bg-[#f8f6f4] p-3 rounded-lg border border-[#e5ddd4]">
                        {seller.user?.userAddress || "N/A"}
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

export default SellerDetail;