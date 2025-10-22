import React, { useState } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import {
  Package, Truck, MapPin, Clock, CheckCircle, Search, 
  Calendar, User, Phone, AlertCircle
} from "lucide-react";
import api from "../../api";

const OrderTracking = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingData, setTrackingData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setIsLoading(true);
    setError("");
    setTrackingData(null);

    try {
      const response = await api.get(`/shipping/tracking/${trackingNumber}`);
      setTrackingData(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to track order");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'to_ship': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'to_ship': return <Package className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Truck className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Track Your Order</h1>
            <p className="text-white/90 mt-1">Enter your tracking number to see delivery status</p>
          </div>
        </div>
      </div>

      {/* Tracking Form */}
      <Card className="border-2 border-[#e5ded7] shadow-xl">
        <CardHeader className="border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white">
          <CardTitle className="text-[#5c3d28] flex items-center text-xl">
            <div className="p-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg mr-3">
              <Search className="h-5 w-5 text-white" />
            </div>
            Enter Tracking Number
          </CardTitle>
          <CardDescription className="text-[#7b5a3b] ml-11">
            Find your tracking number in your order confirmation email
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleTrackOrder} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="trackingNumber" className="text-[#5c3d28] font-medium">
                Tracking Number
              </Label>
              <div className="flex gap-3">
                <Input
                  id="trackingNumber"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                  placeholder="Enter tracking number (e.g., CC20251008ABC123)"
                  className="flex-1 border-[#e5ded7] focus:border-[#a4785a] bg-[#faf9f8] text-[#5c3d28]"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !trackingNumber.trim()}
                  className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white hover:from-[#8a6b4a] hover:to-[#6b4a2f] shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Track
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tracking Results */}
      {trackingData && (
        <div className="space-y-6">
          {/* Order Summary */}
          <Card className="border-2 border-[#e5ded7] shadow-xl">
            <CardHeader className="border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white">
              <CardTitle className="text-[#5c3d28] flex items-center text-xl">
                <div className="p-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg mr-3">
                  <Package className="h-5 w-5 text-white" />
                </div>
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-[#5c3d28]">Order Number:</p>
                    <p className="text-lg font-bold text-[#a4785a]">#{trackingData.order?.orderID}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#5c3d28]">Tracking Number:</p>
                    <p className="text-lg font-bold text-[#a4785a]">{trackingData.tracking_number}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#5c3d28]">Current Status:</p>
                    <Badge className={`${getStatusColor(trackingData.status)} flex items-center gap-1 w-fit`}>
                      {getStatusIcon(trackingData.status)}
                      {trackingData.status?.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-[#5c3d28]">Customer:</p>
                    <p className="text-[#7b5a3b]">{trackingData.order?.customer?.userName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#5c3d28]">Total Amount:</p>
                    <p className="text-lg font-bold text-[#a4785a]">
                      ₱{trackingData.order?.totalAmount?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#5c3d28]">Order Date:</p>
                    <p className="text-[#7b5a3b]">
                      {trackingData.order?.created_at ? 
                        new Date(trackingData.order.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card className="border-2 border-[#e5ded7] shadow-xl">
            <CardHeader className="border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white">
              <CardTitle className="text-[#5c3d28] flex items-center text-xl">
                <div className="p-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg mr-3">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-[#5c3d28]">Delivery Address:</p>
                    <p className="text-[#7b5a3b]">{trackingData.delivery_address}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#5c3d28]">City:</p>
                    <p className="text-[#7b5a3b]">{trackingData.delivery_city}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#5c3d28]">Province:</p>
                    <p className="text-[#7b5a3b]">{trackingData.delivery_province}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-[#5c3d28]">Rider Name:</p>
                    <p className="text-[#7b5a3b]">{trackingData.rider_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#5c3d28]">Rider Phone:</p>
                    <p className="text-[#7b5a3b]">{trackingData.rider_phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#5c3d28]">Vehicle:</p>
                    <p className="text-[#7b5a3b]">{trackingData.vehicle_type} - {trackingData.vehicle_number}</p>
                  </div>
                </div>
              </div>
              {trackingData.delivery_notes && (
                <div className="mt-4 p-4 bg-[#faf9f8] rounded-lg border border-[#e5ded7]">
                  <p className="text-sm font-semibold text-[#5c3d28] mb-2">Delivery Notes:</p>
                  <p className="text-[#7b5a3b]">{trackingData.delivery_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tracking History */}
          <Card className="border-2 border-[#e5ded7] shadow-xl">
            <CardHeader className="border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white">
              <CardTitle className="text-[#5c3d28] flex items-center text-xl">
                <div className="p-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg mr-3">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                Tracking History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {trackingData.histories && trackingData.histories.length > 0 ? (
                  trackingData.histories.map((history, index) => (
                    <div
                      key={history.id}
                      className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all duration-200 ${
                        index === 0 
                          ? 'border-[#a4785a] bg-gradient-to-r from-[#a4785a]/10 to-[#7b5a3b]/10' 
                          : 'border-[#e5ded7] bg-white'
                      }`}
                    >
                      <div className={`p-2 rounded-full ${
                        index === 0 
                          ? 'bg-gradient-to-r from-[#a4785a] to-[#7b5a3b]' 
                          : 'bg-gray-200'
                      }`}>
                        {getStatusIcon(history.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getStatusColor(history.status)}>
                            {history.status?.toUpperCase()}
                          </Badge>
                          {index === 0 && (
                            <Badge className="bg-green-100 text-green-800">
                              Latest
                            </Badge>
                          )}
                        </div>
                        <p className="text-[#5c3d28] font-medium">{history.description}</p>
                        {history.location && (
                          <p className="text-[#7b5a3b] text-sm flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {history.location}
                          </p>
                        )}
                        <p className="text-[#7b5a3b] text-sm flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(history.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-[#7b5a3b]">No tracking history available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
