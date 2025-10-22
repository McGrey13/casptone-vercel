import React, { useState, useEffect } from "react";
import { X, Save, User, Mail, Phone, MapPin, Calendar, Store, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const SellerEdit = ({ seller, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (seller) {
      setFormData({
        userName: seller.user?.userName || "",
        userEmail: seller.user?.userEmail || "",
        userContactNumber: seller.user?.userContactNumber || "",
        userAddress: seller.user?.userAddress || "",
        userBirthday: seller.user?.userBirthday ? seller.user.userBirthday.split('T')[0] : "",
        userAge: seller.user?.userAge || "",
        businessName: seller.businessName || "",
        specialty: seller.specialty || "",
        website: seller.website || "",
        story: seller.story || "",
        status: seller.status || "active",
        featured: seller.featured || false,
      });
    }
  }, [seller]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.put(`/sellers/${seller.sellerID}`, formData);
      const updatedSeller = response.data;
      onSave(updatedSeller);
      onClose();
    } catch (err) {
      console.error("Error updating seller:", err);
      setError(err.response?.data?.message || "Failed to update seller");
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
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (!seller) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white border-2 border-[#d5bfae] rounded-xl shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-[#f8f6f4] to-[#f0ebe7] rounded-t-xl p-6 border-b border-[#e5ddd4]">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-[#5c3d28] flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-full flex items-center justify-center">
                <Store className="h-4 w-4 text-white" />
              </div>
              Edit Seller
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-6">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-[#f8f6f4] to-[#f0ebe7] rounded-xl p-6 border border-[#e5ddd4] mb-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-full flex items-center justify-center shadow-lg">
                {seller.profile_image_url ? (
                  <img
                    src={seller.profile_image_url}
                    alt={seller.user?.userName}
                    className="w-16 h-16 object-cover rounded-full"
                  />
                ) : (
                  <Store className="h-8 w-8 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-[#5c3d28]">Editing: {seller.user?.userName}</h2>
                <p className="text-[#7b5a3b]">{seller.businessName}</p>
                <div className="mt-2">{getStatusBadge(seller.status)}</div>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#7b5a3b]">Seller ID</p>
                <p className="text-lg font-bold text-[#5c3d28]">#{seller.sellerID}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-800 font-medium">Error</p>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card className="border-2 border-[#d5bfae] rounded-xl shadow-lg">
              <CardHeader className="bg-gradient-to-r from-[#f8f6f4] to-[#f0ebe7] rounded-t-xl border-b border-[#e5ddd4]">
                <CardTitle className="text-xl font-bold text-[#5c3d28] flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-full flex items-center justify-center">
                    <User className="h-3 w-3 text-white" />
                  </div>
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="userName" className="text-[#7b5a3b] font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </Label>
                    <Input
                      id="userName"
                      name="userName"
                      value={formData.userName}
                      onChange={handleInputChange}
                      className="border-[#d5bfae] focus:border-[#a4785a] focus:ring-[#a4785a]/20 bg-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userEmail" className="text-[#7b5a3b] font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <Input
                      id="userEmail"
                      name="userEmail"
                      type="email"
                      value={formData.userEmail}
                      onChange={handleInputChange}
                      className="border-[#d5bfae] focus:border-[#a4785a] focus:ring-[#a4785a]/20 bg-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userContactNumber" className="text-[#7b5a3b] font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="userContactNumber"
                      name="userContactNumber"
                      value={formData.userContactNumber}
                      onChange={handleInputChange}
                      className="border-[#d5bfae] focus:border-[#a4785a] focus:ring-[#a4785a]/20 bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userAge" className="text-[#7b5a3b] font-medium">
                      Age
                    </Label>
                    <Input
                      id="userAge"
                      name="userAge"
                      type="number"
                      value={formData.userAge}
                      onChange={handleInputChange}
                      className="border-[#d5bfae] focus:border-[#a4785a] focus:ring-[#a4785a]/20 bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userBirthday" className="text-[#7b5a3b] font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Birthday
                    </Label>
                    <Input
                      id="userBirthday"
                      name="userBirthday"
                      type="date"
                      value={formData.userBirthday}
                      onChange={handleInputChange}
                      className="border-[#d5bfae] focus:border-[#a4785a] focus:ring-[#a4785a]/20 bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-[#7b5a3b] font-medium">
                      Status
                    </Label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-[#d5bfae] rounded-lg focus:border-[#a4785a] focus:ring-[#a4785a]/20 bg-white text-[#5c3d28]"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                  <div className="space-y-2">
                    <Label htmlFor="businessName" className="text-[#7b5a3b] font-medium flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      Business Name
                    </Label>
                    <Input
                      id="businessName"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      className="border-[#d5bfae] focus:border-[#a4785a] focus:ring-[#a4785a]/20 bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialty" className="text-[#7b5a3b] font-medium">
                      Specialty
                    </Label>
                    <Input
                      id="specialty"
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleInputChange}
                      className="border-[#d5bfae] focus:border-[#a4785a] focus:ring-[#a4785a]/20 bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-[#7b5a3b] font-medium">
                      Website
                    </Label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="border-[#d5bfae] focus:border-[#a4785a] focus:ring-[#a4785a]/20 bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="featured" className="text-[#7b5a3b] font-medium flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="featured"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-[#a4785a] border-[#d5bfae] rounded focus:ring-[#a4785a]"
                      />
                      Featured Seller
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card className="border-2 border-[#d5bfae] rounded-xl shadow-lg">
              <CardHeader className="bg-gradient-to-r from-[#f8f6f4] to-[#f0ebe7] rounded-t-xl border-b border-[#e5ddd4]">
                <CardTitle className="text-xl font-bold text-[#5c3d28] flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-full flex items-center justify-center">
                    <MapPin className="h-3 w-3 text-white" />
                  </div>
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Label htmlFor="userAddress" className="text-[#7b5a3b] font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address
                  </Label>
                  <Input
                    id="userAddress"
                    name="userAddress"
                    value={formData.userAddress}
                    onChange={handleInputChange}
                    className="border-[#d5bfae] focus:border-[#a4785a] focus:ring-[#a4785a]/20 bg-white"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Story Section */}
            <Card className="border-2 border-[#d5bfae] rounded-xl shadow-lg">
              <CardHeader className="bg-gradient-to-r from-[#f8f6f4] to-[#f0ebe7] rounded-t-xl border-b border-[#e5ddd4]">
                <CardTitle className="text-xl font-bold text-[#5c3d28] flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-full flex items-center justify-center">
                    <User className="h-3 w-3 text-white" />
                  </div>
                  Seller Story
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Label htmlFor="story" className="text-[#7b5a3b] font-medium">
                    Tell your story
                  </Label>
                  <Textarea
                    id="story"
                    name="story"
                    value={formData.story}
                    onChange={handleInputChange}
                    rows={4}
                    className="border-[#d5bfae] focus:border-[#a4785a] focus:ring-[#a4785a]/20 bg-white"
                    placeholder="Share your journey as an artisan..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-[#e5ddd4]">
              <Button
                type="button"
                onClick={onClose}
                className="bg-white border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f6f4] px-6 py-3 rounded-lg shadow-md transition-all"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white px-6 py-3 rounded-lg shadow-md transition-all flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SellerEdit;