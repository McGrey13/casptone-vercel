import React, { useState, useEffect } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  User, Mail, Phone, Shield,
} from "lucide-react";
import api from "../../api";
import "./AdminTableDesign.css";

const AdminSettings = () => {
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch admin profile
  const fetchAdminData = async () => {

    try {
      const response = await api.get("/auth/profile");
      setAdmin(response.data);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch profile");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeactivate = async () => {
    if (!window.confirm("Are you sure you want to deactivate your account?")) return;

    try {
      await api.patch("/user/deactivate");
      alert("Account deactivated successfully!");
    } catch (err) {
      alert(err.message || "Failed to deactivate account");
    }
  };


  if (isLoading) return (
    <div className="admin-table-container">
      <div className="admin-table-loading">
        <div className="admin-table-loading-spinner"></div>
        <span>Loading admin settings...</span>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="admin-table-container">
      <div className="admin-table-empty">
        <div className="admin-table-empty-icon">⚠️</div>
        <h3 className="admin-table-empty-title">Failed to load settings</h3>
        <p className="admin-table-empty-description">{error}</p>
        <button 
          onClick={fetchAdminData}
          className="admin-table-filter-btn"
        >
          Retry
        </button>
      </div>
    </div>
  );
  
  if (!admin) return (
    <div className="admin-table-container">
      <div className="admin-table-empty">
        <User className="admin-table-empty-icon" />
        <h3 className="admin-table-empty-title">No admin data available</h3>
        <p className="admin-table-empty-description">Unable to load admin profile information.</p>
        <button 
          onClick={fetchAdminData}
          className="admin-table-filter-btn"
        >
          Reload Data
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="admin-table-container">
        <div className="admin-table-header">
          <h1 className="admin-table-title">Admin Settings</h1>
          <p className="admin-table-description">
            Manage your admin profile, account security, and preferences
          </p>
          <div className="flex items-center justify-between mt-4">
            <div className="admin-table-stats">
              <div className="admin-table-stat">
                <User className="admin-table-stat-icon" />
                <div>
                  <div className="admin-table-stat-label">Profile Status</div>
                  <div className="text-xs text-gray-500">Active & Secure</div>
                </div>
              </div>
            </div>
            <Button className="admin-table-filter-btn">
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <div className="admin-table-container">
        <Tabs defaultValue="profile" className="w-full">
          <div className="admin-table-header">
            <TabsList className="grid w-full grid-cols-2 bg-gray-50 p-1 rounded-lg">
              <TabsTrigger 
                value="profile" 
                className="data-[state=active]:bg-[#a4785a] data-[state=active]:text-white transition-all duration-300"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="account"
                className="data-[state=active]:bg-[#a4785a] data-[state=active]:text-white transition-all duration-300"
              >
                Account
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Enhanced Profile Tab */}
          <TabsContent value="profile" className="space-y-4 pt-4">
            <div className="admin-table-container">
              <div className="admin-table-header">
                <h3 className="admin-table-title">Profile Information</h3>
                <p className="admin-table-description">
                  Update your profile information and personal details
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <Avatar className="h-32 w-32 border-4 border-[#a4785a]/20 shadow-lg">
                        <AvatarImage
                          src={admin.profileImage || "https://api.dicebear.com/7.x/avataaars/svg?seed=admin"}
                          alt="Profile Image"
                        />
                        <AvatarFallback className="text-2xl font-bold bg-[#a4785a]/10 text-[#a4785a]">
                          {admin.userName ? admin.userName.slice(0, 2).toUpperCase() : "NA"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 -right-2 bg-[#a4785a] text-white rounded-full p-2 shadow-lg">
                        <User className="h-4 w-4" />
                      </div>
                    </div>
                    <Button className="admin-table-filter-btn" size="sm">
                      Change Photo
                    </Button>
                  </div>

                  <div className="flex-1 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="display-name" className="text-sm font-semibold text-gray-700">Display Name</Label>
                        <Input
                          id="display-name"
                          defaultValue={admin.userName || ""}
                          className="border-2 border-gray-200 focus:border-[#a4785a] focus:ring-[#a4785a]/20 transition-all duration-300"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="role" className="text-sm font-semibold text-gray-700">Role</Label>
                        <Input 
                          id="role" 
                          defaultValue={admin.role || "Admin"} 
                          readOnly 
                          className="bg-gray-50 border-2 border-gray-200 text-gray-600"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="bio" className="text-sm font-semibold text-gray-700">Bio</Label>
                      <Textarea
                        id="bio"
                        defaultValue={admin.bio || ""}
                        rows={4}
                        className="border-2 border-gray-200 focus:border-[#a4785a] focus:ring-[#a4785a]/20 transition-all duration-300"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="location" className="text-sm font-semibold text-gray-700">Location</Label>
                        <Input 
                          id="location" 
                          defaultValue={admin.userAddress || ""} 
                          className="border-2 border-gray-200 focus:border-[#a4785a] focus:ring-[#a4785a]/20 transition-all duration-300"
                          placeholder="Your location..."
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="website" className="text-sm font-semibold text-gray-700">Website</Label>
                        <Input 
                          id="website" 
                          defaultValue={admin.website || ""} 
                          className="border-2 border-gray-200 focus:border-[#a4785a] focus:ring-[#a4785a]/20 transition-all duration-300"
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Enhanced Account Tab */}
          <TabsContent value="account" className="space-y-4 pt-4">
            <div className="admin-table-container">
              <div className="admin-table-header">
                <h3 className="admin-table-title">Account Information</h3>
                <p className="admin-table-description">
                  Manage your account details and security settings
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                    <div className="flex items-center">
                      <div className="admin-table-stat-icon mr-3">
                        <Mail className="h-5 w-5" />
                      </div>
                      <Input 
                        id="email" 
                        defaultValue={admin.userEmail || ""} 
                        className="border-2 border-gray-200 focus:border-[#a4785a] focus:ring-[#a4785a]/20 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone Number</Label>
                    <div className="flex items-center">
                      <div className="admin-table-stat-icon mr-3">
                        <Phone className="h-5 w-5" />
                      </div>
                      <Input 
                        id="phone" 
                        defaultValue={admin.userContactNumber || ""} 
                        className="border-2 border-gray-200 focus:border-[#a4785a] focus:ring-[#a4785a]/20 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button className="admin-table-filter-btn">
                      <Shield className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="admin-table-container">
              <div className="admin-table-header">
                <h3 className="admin-table-title text-red-600">Danger Zone</h3>
                <p className="admin-table-description">
                  Irreversible account management actions
                </p>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between p-4 border-2 border-red-200 rounded-lg bg-red-50">
                  <div>
                    <h4 className="font-semibold text-red-800">Deactivate Account</h4>
                    <p className="text-sm text-red-600">This will deactivate your admin account permanently.</p>
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeactivate}
                    className="bg-red-600 hover:bg-red-700 transition-all duration-300"
                  >
                    Deactivate Account
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminSettings;
