import React, { useState, useEffect } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  User, Mail, Phone, Shield, Eye, EyeOff,
} from "lucide-react";
import api from "../../api";
import "./AdminTableDesign.css";

const AdminSettings = () => {
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Change Password States
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // Deactivate Account States
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  
  // Profile Image States
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // Profile Form States
  const [profileFormData, setProfileFormData] = useState({
    userName: "",
    userAddress: "",
    userEmail: "",
    userContactNumber: ""
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  // Fetch admin profile
  const fetchAdminData = async () => {

    try {
      const response = await api.get("/auth/profile");
      setAdmin(response.data);
      // Initialize form data with fetched data
      setProfileFormData({
        userName: response.data.userName || "",
        userAddress: response.data.userAddress || "",
        userEmail: response.data.userEmail || "",
        userContactNumber: response.data.userContactNumber || ""
      });
      setIsFormInitialized(true);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch profile");
      setIsFormInitialized(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Update profile image preview when admin data changes
  useEffect(() => {
    if (admin?.profileImage && !profileImagePreview && !profileImageFile) {
      setProfileImagePreview(admin.profileImage);
    }
  }, [admin?.profileImage]);

  // Handle profile image selection
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    setProfileImageFile(file);
  };

  // Handle profile image upload
  const handleImageUpload = async () => {
    if (!profileImageFile) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('profile_picture', profileImageFile);

      // Try the profile endpoint with FormData
      const response = await api.post('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        // Get the profile image URL from response
        const imageUrl = response.data.profileImage || response.data.profile_image_url || response.data.user?.profileImage;
        
        if (imageUrl) {
          setProfileImagePreview(imageUrl);
          setAdmin(prev => ({
            ...prev,
            profileImage: imageUrl
          }));
        }
        
        // Refresh admin data to get updated profile image
        await fetchAdminData();
        setProfileImageFile(null);
        
        // Show success message
        alert('Profile picture updated successfully!');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert(error.response?.data?.message || 'Failed to upload profile picture. The backend may need to support image uploads for admin profiles.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Reset image selection
  const handleCancelImageUpload = () => {
    setProfileImageFile(null);
    setProfileImagePreview(admin?.profileImage || "");
  };

  // Handle password field changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Validate password form
  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordData.currentPassword.trim()) {
      errors.currentPassword = "Current password is required";
    }
    
    if (!passwordData.newPassword.trim()) {
      errors.newPassword = "New password is required";
    } else {
      // Check minimum length
      if (passwordData.newPassword.length < 8) {
        errors.newPassword = "Password must be at least 8 characters";
      }
      // Check for uppercase letter
      else if (!/[A-Z]/.test(passwordData.newPassword)) {
        errors.newPassword = "Password must contain at least one uppercase letter";
      }
      // Check for lowercase letter
      else if (!/[a-z]/.test(passwordData.newPassword)) {
        errors.newPassword = "Password must contain at least one lowercase letter";
      }
      // Check for number
      else if (!/[0-9]/.test(passwordData.newPassword)) {
        errors.newPassword = "Password must contain at least one number";
      }
      // Check for special character
      else if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(passwordData.newPassword)) {
        errors.newPassword = "Password must contain at least one special character";
      }
    }
    
    if (!passwordData.confirmPassword.trim()) {
      errors.confirmPassword = "Please confirm your new password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword = "New password must be different from current password";
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle change password
  const handleChangePassword = async () => {
    if (!validatePasswordForm()) {
      return;
    }

    setIsChangingPassword(true);
    setPasswordSuccess("");

    try {
      const response = await api.post("/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        newPassword_confirmation: passwordData.confirmPassword
      });

      if (response.data) {
        setPasswordSuccess("Password changed successfully! Please log in again.");
        setTimeout(() => {
          setShowChangePassword(false);
          setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
          });
          setPasswordErrors({});
          setPasswordSuccess("");
          // Redirect to login after 2 seconds
          window.location.href = "/login";
        }, 2000);
      }

    } catch (error) {
      console.error("Error changing password:", error);
      setPasswordErrors({
        submit: error.response?.data?.message || "Failed to change password. Please try again."
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Cancel password change
  const cancelPasswordChange = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setPasswordErrors({});
    setPasswordSuccess("");
    setShowChangePassword(false);
  };

  // Handle profile form field changes
  const handleProfileFieldChange = (field, value) => {
    setProfileFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Check if there are unsaved profile changes
  const hasProfileChanges = () => {
    if (!admin) return false;
    return (
      profileFormData.userName !== (admin.userName || "") ||
      profileFormData.userAddress !== (admin.userAddress || "") ||
      profileFormData.userEmail !== (admin.userEmail || "") ||
      profileFormData.userContactNumber !== (admin.userContactNumber || "")
    );
  };

  // Handle save profile changes
  const handleSaveProfile = async () => {
    if (!hasProfileChanges()) {
      alert("No changes to save");
      return;
    }

    setIsSavingProfile(true);
    setError(null);

    try {
      const response = await api.post("/auth/profile", {
        userName: profileFormData.userName,
        userAddress: profileFormData.userAddress,
        userEmail: profileFormData.userEmail,
        userContactNumber: profileFormData.userContactNumber
      });

      if (response.data) {
        // Update admin state with new data
        setAdmin(prev => ({
          ...prev,
          ...response.data.user || response.data,
          userName: profileFormData.userName,
          userAddress: profileFormData.userAddress,
          userEmail: profileFormData.userEmail,
          userContactNumber: profileFormData.userContactNumber
        }));

        // Refresh admin data to ensure everything is in sync
        await fetchAdminData();
        
        alert("Profile updated successfully!");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to update profile. Please try again.";
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
      setTimeout(() => setError(""), 5000);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle deactivate account
  const handleDeactivate = async () => {
    setIsDeactivating(true);

    try {
      await api.patch("/user/deactivate");
      setShowDeactivateDialog(false);
      // Redirect to login after deactivation
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    } catch (err) {
      console.error("Error deactivating account:", err);
      alert(err.response?.data?.message || "Failed to deactivate account");
    } finally {
      setIsDeactivating(false);
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
          <div className="flex justify-end mt-4">
            <Button 
              className="admin-table-filter-btn"
              onClick={handleSaveProfile}
              disabled={isSavingProfile || !hasProfileChanges()}
            >
              {isSavingProfile ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <div className="admin-table-container">
        <Tabs defaultValue="profile" className="w-full">
          <div className="admin-table-header">
            <TabsList className="grid w-full grid-cols-2 bg-white p-1 rounded-lg border border-gray-200">
              <TabsTrigger 
                value="profile" 
                className="admin-settings-tab-trigger data-[state=active]:!bg-[#a4785a] data-[state=active]:!text-white transition-all duration-300"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="account"
                className="admin-settings-tab-trigger data-[state=active]:!bg-[#a4785a] data-[state=active]:!text-white transition-all duration-300"
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
                          src={profileImagePreview || admin.profileImage || "https://api.dicebear.com/7.x/avataaars/svg?seed=admin"}
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
                    <input
                      type="file"
                      id="profile-image-upload"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center space-y-2 w-full">
                      <Button 
                        type="button"
                        className="admin-table-filter-btn" 
                        size="sm"
                        onClick={() => document.getElementById('profile-image-upload')?.click()}
                      >
                      Change Photo
                    </Button>
                      {profileImageFile && (
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={handleImageUpload}
                            disabled={isUploadingImage}
                            className="bg-[#a4785a] hover:bg-[#8b6248] text-white text-xs px-3 py-1"
                            size="sm"
                          >
                            {isUploadingImage ? "Uploading..." : "Upload"}
                          </Button>
                          <Button
                            type="button"
                            onClick={handleCancelImageUpload}
                            disabled={isUploadingImage}
                            variant="outline"
                            className="text-xs px-3 py-1"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="display-name" className="text-sm font-semibold text-gray-700">Display Name</Label>
                        <Input
                          id="display-name"
                          value={profileFormData.userName || ""}
                          onChange={(e) => handleProfileFieldChange("userName", e.target.value)}
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
                      <Label htmlFor="location" className="text-sm font-semibold text-gray-700">Location</Label>
                      <Input 
                        id="location" 
                        value={profileFormData.userAddress || ""}
                        onChange={(e) => handleProfileFieldChange("userAddress", e.target.value)}
                        className="border-2 border-gray-200 focus:border-[#a4785a] focus:ring-[#a4785a]/20 transition-all duration-300"
                        placeholder="Your location..."
                      />
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
                        value={profileFormData.userEmail || ""}
                        onChange={(e) => handleProfileFieldChange("userEmail", e.target.value)}
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
                        value={profileFormData.userContactNumber || ""}
                        onChange={(e) => handleProfileFieldChange("userContactNumber", e.target.value)}
                        className="border-2 border-gray-200 focus:border-[#a4785a] focus:ring-[#a4785a]/20 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button 
                      className="admin-table-filter-btn"
                      onClick={() => setShowChangePassword(true)}
                    >
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
                    onClick={() => setShowDeactivateDialog(true)}
                    className="!bg-red-600 hover:!bg-red-700 !text-white font-semibold px-6 py-2 transition-all duration-300 shadow-sm"
                  >
                    Deactivate Account
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800">
              Change Password
            </DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new secure password.
            </DialogDescription>
          </DialogHeader>
          
          {passwordSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
              {passwordSuccess}
            </div>
          )}
          
          {passwordErrors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {passwordErrors.submit}
            </div>
          )}

          <div className="space-y-4 py-4">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-sm font-semibold text-gray-700">
                Current Password
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showPasswordFields.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={`border-2 ${passwordErrors.currentPassword ? "border-red-300" : "border-gray-200"} focus:border-[#a4785a] focus:ring-[#a4785a]/20 transition-all duration-300 pr-12`}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordFields(prev => ({ ...prev, current: !prev.current }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPasswordFields.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="text-xs text-red-600">{passwordErrors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-700">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPasswordFields.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={`border-2 ${passwordErrors.newPassword ? "border-red-300" : "border-gray-200"} focus:border-[#a4785a] focus:ring-[#a4785a]/20 transition-all duration-300 pr-12`}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordFields(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPasswordFields.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <p className="text-xs text-red-600">{passwordErrors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPasswordFields.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`border-2 ${passwordErrors.confirmPassword ? "border-red-300" : "border-gray-200"} focus:border-[#a4785a] focus:ring-[#a4785a]/20 transition-all duration-300 pr-12`}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordFields(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPasswordFields.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <p className="text-xs text-red-600">{passwordErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={cancelPasswordChange}
              disabled={isChangingPassword}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword}
              className="bg-[#a4785a] hover:bg-[#8b6248] text-white"
            >
              {isChangingPassword ? "Changing..." : "Change Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Account Alert Dialog */}
      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Deactivate Account</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to deactivate your admin account? This action cannot be undone.
              You will be logged out immediately and will need to contact support to reactivate your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeactivating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              disabled={isDeactivating}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeactivating ? "Deactivating..." : "Deactivate Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminSettings;
