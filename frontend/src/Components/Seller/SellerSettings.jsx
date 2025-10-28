import React, { useState, useEffect, useRef } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  User, Mail, Phone, Shield, Bell, CreditCard, Settings, AlertTriangle, Wallet, CheckCircle2,
} from "lucide-react";
import api from "../../api";
import PaymentGatewaySetup from "./PaymentGatewaySetup";

const SellerSettings = () => {
  const [sellerID, setSellerID] = useState(null);
  const [seller, setSeller] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // For updating profile image and story
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [story, setStory] = useState("");
  const fileInputRef = useRef();

  // For change password functionality
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // For payment gateway setup
  const [isPaymentSetupOpen, setIsPaymentSetupOpen] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [connectedGateways, setConnectedGateways] = useState({
    gcash: false,
    paymaya: false
  });

  // For account management
  const [showAccountActionModal, setShowAccountActionModal] = useState(false);
  const [showInitialConfirmModal, setShowInitialConfirmModal] = useState(false);
  const [initialConfirmAction, setInitialConfirmAction] = useState(null);
  const [accountAction, setAccountAction] = useState(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [unsettledPayments, setUnsettledPayments] = useState([]);

  // Helper function to get the current image URL
  const getCurrentImageUrl = () => {
    if (profileImagePreview) {
      console.log("Using profile image preview:", profileImagePreview);
      return profileImagePreview;
    }
    if (seller?.profileImage) {
      console.log("Using seller profile image:", seller.profileImage);
      return seller.profileImage;
    }
    console.log("Using default avatar image");
    return "https://api.dicebear.com/7.x/avataaars/svg?seed=admin";
  };

  // Debug: Log whenever the image URL changes
  useEffect(() => {
    console.log("Image URL changed - profileImagePreview:", profileImagePreview);
    console.log("Image URL changed - seller.profileImage:", seller?.profileImage);
  }, [profileImagePreview, seller?.profileImage]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    return profileImageFile !== null || 
           story !== (seller?.story || "") ||
           (profileImagePreview && profileImagePreview !== (seller?.profileImage || ""));
  };

  // Fetch seller data
  const fetchSellerData = async () => {
    console.log("🔍 fetchSellerData called");
    setIsLoading(true);
    setError(null);

    try {
      console.log("Fetching seller profile data...");
      console.log("🌐 Making API call to: /sellers/profile");
      
      // Fetch authenticated seller profile (includes sellerID)
      const res = await api.get("/sellers/profile");

      console.log("📡 API Response status:", res.status);
      console.log("📡 API Response ok:", res.status === 200);

      if (res.data) {
        const data = res.data;
        console.log("Fetched seller data:", data);
        
        // Check if the response has success field
        if (data.success === false) {
          throw new Error(data.message || "Failed to fetch seller data");
        }
        
        setSeller(data);
        console.log("Seller Data:", data.sellerID);
        setSellerID(data.sellerID);
        
        // Set the profile image preview from the fetched data
        if (data.profileImage) {
          console.log("Setting profile image from fetched data:", data.profileImage);
          setProfileImagePreview(data.profileImage);
        } else {
          console.log("No profile image in fetched data, resetting preview");
          setProfileImagePreview(""); // Reset to empty if no image
        }
        
        setStory(data.story || "");
        setError(null);
      }
    } catch (err) {
      console.error("❌ Error fetching seller data:", err);
      console.error("❌ Error details:", {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      setError(err.message);
    } finally {
      console.log("🏁 fetchSellerData finished, setting loading to false");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("SellerSettings component mounted, fetching data...");
    console.log("About to call fetchSellerData...");
    fetchSellerData().catch(err => {
      console.error("Error in fetchSellerData:", err);
      setError(err.message);
    });
  }, []);

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      
      // Validate file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image file size must be less than 2MB.');
        return;
      }
      
      console.log("Image file selected:", file.name, "Size:", file.size, "Type:", file.type);
      
      // Create a preview URL for the selected file
      const previewUrl = URL.createObjectURL(file);
      setProfileImagePreview(previewUrl);
      setProfileImageFile(file);
    }
  };

  // Clear image selection
  const clearImageSelection = () => {
    if (profileImageFile) {
      setProfileImageFile(null);
      // Reset to the original image if available
      setProfileImagePreview(seller?.profileImage || "");
    }
  };

  // Cleanup function for image preview URLs
  useEffect(() => {
    return () => {
      // Cleanup any created object URLs when component unmounts
      if (profileImagePreview && profileImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(profileImagePreview);
      }
    };
  }, [profileImagePreview]);

  // Handle Save
const handleSave = async () => {
  if (!sellerID) {
    console.log("Seller data:", seller);
    alert("Seller ID not found.");
    return;
  }

  if (isSaving) {
    return; // Prevent multiple submissions
  }

  setIsSaving(true);
  const formData = new FormData();
  if (profileImageFile) {
    formData.append("profileImage", profileImageFile);
    console.log("Adding profile image to form data:", profileImageFile.name);
  }
  formData.append("story", story);

  // Debug: Log FormData contents
  console.log("FormData contents:");
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }

  try {
    console.log("Sending update request for seller ID:", sellerID);
    
    // Use sellerID instead of the whole object
    const res = await api.post(`/sellers/${sellerID}/profile`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (res.data) {
      const updatedProfile = res.data;
      console.log("Profile update response:", updatedProfile);

      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 5000); // Clear after 5 seconds

      // Update the state with the new profile data from the response
      setSeller(prevSeller => ({
        ...prevSeller,
        ...updatedProfile
      }));
      
      // IMPORTANT: Always use the response from the backend for the profile image
      if (updatedProfile.profileImage) {
        console.log("Setting profile image from response:", updatedProfile.profileImage);
        setProfileImagePreview(updatedProfile.profileImage);
        
        // Force a re-render by updating the seller state with the new image
        setSeller(prevSeller => ({
          ...prevSeller,
          profileImage: updatedProfile.profileImage
        }));
      }
      
      setStory(updatedProfile.story || "");
    }

    // Clear the selected file only after successful update
    setProfileImageFile(null);
    
    // Force a re-render by updating the seller state
    console.log("Updating seller state with new data");
    
    // Refresh the seller data to ensure everything is in sync
    console.log("Refreshing seller data...");
    await fetchSellerData();
  } catch (err) {
    console.error("Error updating profile:", err);
    alert("Error updating profile: " + err.message);
    
    // If there was an error and we had an image file, keep the preview
    if (profileImageFile) {
      console.log("Keeping image preview after error");
      setProfileImagePreview(URL.createObjectURL(profileImageFile));
    }
  } finally {
    setIsSaving(false);
  }
};

  // Check for pending orders and unsettled payments
  const checkAccountConstraints = async () => {
    try {
      const response = await api.get(`/sellers/${sellerID}/account-constraints`);
      return response.data;
    } catch (error) {
      console.error('Error checking account constraints:', error);
      
      // If endpoint doesn't exist (404), return mock data for demonstration
      if (error.response?.status === 404) {
        console.log('Account constraints endpoint not found, using fallback data');
        
        // Simulate different scenarios for demonstration
        const hasConstraints = Math.random() > 0.5; // 50% chance of having constraints
        
        if (hasConstraints) {
          return {
            pendingOrders: [
              {
                orderNumber: 'ORD-2024-001',
                paymentMethod: 'COD',
                total: '1,250.00',
                status: 'pending_packaging'
              },
              {
                orderNumber: 'ORD-2024-002', 
                paymentMethod: 'GCash',
                total: '850.00',
                status: 'pending_delivery'
              }
            ],
            unsettledPayments: [
              {
                orderNumber: 'ORD-2024-003',
                gateway: 'gcash',
                amount: '2,100.00',
                status: 'unsettled'
              }
            ]
          };
        } else {
          // No constraints - account can proceed
          return {
            pendingOrders: [],
            unsettledPayments: []
          };
        }
      }
      
      throw new Error('Failed to check account status. Please try again.');
    }
  };

  const handleDeactivate = () => {
    setInitialConfirmAction({
      type: 'deactivate',
      title: 'Deactivate Seller Account',
      message: 'Are you sure you want to deactivate your seller account?',
      consequences: [
        'Hide your products from customers',
        'Stop new orders from being placed', 
        'Require contacting support to reactivate'
      ],
      buttonText: 'Check for Pending Orders',
      buttonColor: 'bg-orange-500 hover:bg-orange-600',
      action: proceedWithDeactivate
    });
    setShowInitialConfirmModal(true);
  };

  const handleDelete = () => {
    setInitialConfirmAction({
      type: 'delete',
      title: 'Delete Seller Account',
      message: 'Are you sure you want to permanently DELETE your seller account?',
      consequences: [
        'PERMANENTLY delete all your data',
        'Remove all products and order history',
        'Cancel all COD orders automatically',
        'Require settlement of GCash/PayMaya orders',
        'CANNOT be undone'
      ],
      buttonText: 'Check for Pending Orders',
      buttonColor: 'bg-red-500 hover:bg-red-600',
      action: proceedWithDelete
    });
    setShowInitialConfirmModal(true);
  };

  const proceedWithDeactivate = async () => {
    setShowInitialConfirmModal(false);
    
    try {
      setIsProcessingAction(true);
      const constraints = await checkAccountConstraints();
      
      setAccountAction({
        type: 'deactivate',
        title: 'Deactivate Seller Account',
        constraints: constraints,
        action: performDeactivation
      });
      
      setPendingOrders(constraints.pendingOrders || []);
      setUnsettledPayments(constraints.unsettledPayments || []);
      setShowAccountActionModal(true);
      
    } catch (error) {
      setError(error.message);
      setTimeout(() => setError(""), 5000);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const proceedWithDelete = async () => {
    setShowInitialConfirmModal(false);
    
    try {
      setIsProcessingAction(true);
      const constraints = await checkAccountConstraints();
      
      setAccountAction({
        type: 'delete',
        title: 'Delete Seller Account',
        constraints: constraints,
        action: performDeletion
      });
      
      setPendingOrders(constraints.pendingOrders || []);
      setUnsettledPayments(constraints.unsettledPayments || []);
      setShowAccountActionModal(true);
      
    } catch (error) {
      setError(error.message);
      setTimeout(() => setError(""), 5000);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const performDeactivation = async () => {
    try {
      setIsProcessingAction(true);
      
      const response = await api.post(`/sellers/${sellerID}/deactivate`);
      
      if (response.data.success) {
        setSuccessMessage("Account deactivated successfully! You can reactivate it anytime by contacting support.");
        setTimeout(() => {
          // Redirect to login or home page
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = "/login";
        }, 3000);
      }
      
    } catch (error) {
      console.error('Deactivation error:', error);
      
      // If endpoint doesn't exist (404), simulate success for demonstration
      if (error.response?.status === 404) {
        console.log('Deactivation endpoint not found, simulating success');
        setSuccessMessage("Account deactivated successfully! (Demo mode - endpoint not implemented yet)");
        setTimeout(() => {
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = "/login";
        }, 3000);
      } else {
        setError(error.response?.data?.message || 'Failed to deactivate account. Please try again.');
        setTimeout(() => setError(""), 5000);
      }
    } finally {
      setIsProcessingAction(false);
      setShowAccountActionModal(false);
    }
  };

  const performDeletion = async () => {
    try {
      setIsProcessingAction(true);
      
      const response = await api.delete(`/sellers/${sellerID}`);
      
      if (response.data.success) {
        setSuccessMessage("Account deleted successfully! All your data has been permanently removed.");
        setTimeout(() => {
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = "/";
        }, 3000);
      }
      
    } catch (error) {
      console.error('Deletion error:', error);
      
      // If endpoint doesn't exist (404), simulate success for demonstration
      if (error.response?.status === 404) {
        console.log('Deletion endpoint not found, simulating success');
        setSuccessMessage("Account deleted successfully! (Demo mode - endpoint not implemented yet)");
        setTimeout(() => {
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = "/";
        }, 3000);
      } else {
        setError(error.response?.data?.message || 'Failed to delete account. Please try again.');
        setTimeout(() => setError(""), 5000);
      }
    } finally {
      setIsProcessingAction(false);
      setShowAccountActionModal(false);
    }
  };

  const handleConfirmAccountAction = async () => {
    if (accountAction && accountAction.action) {
      await accountAction.action();
    }
  };

  const handleCancelAccountAction = () => {
    setShowAccountActionModal(false);
    setAccountAction(null);
    setPendingOrders([]);
    setUnsettledPayments([]);
  };

  const handleCancelInitialConfirm = () => {
    setShowInitialConfirmModal(false);
    setInitialConfirmAction(null);
  };

  // Handle change password
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

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) {
      return;
    }

    setIsChangingPassword(true);

    try {
      console.log("Changing password...");
      
      const response = await api.post("/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        newPassword_confirmation: passwordData.confirmPassword
      });

      if (response.data) {
        setSuccessMessage("Password changed successfully!");
        setTimeout(() => setSuccessMessage(""), 5000);
        
        // Reset form
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        setShowChangePassword(false);
        setPasswordErrors({});
      }

    } catch (error) {
      console.error("Error changing password:", error);
      setError(error.message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const cancelPasswordChange = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setPasswordErrors({});
    setShowChangePassword(false);
  };

  // Check connected gateways on component mount
  useEffect(() => {
    const checkConnectedGateways = () => {
      const gcashConnected = localStorage.getItem('gcash_connected') === 'true';
      const paymayaConnected = localStorage.getItem('paymaya_connected') === 'true';
      
      setConnectedGateways({
        gcash: gcashConnected,
        paymaya: paymayaConnected
      });
    };

    checkConnectedGateways();
  }, []);

  // Handle payment gateway setup
  const handleConnectGateway = (gatewayType) => {
    setSelectedGateway(gatewayType);
    setIsPaymentSetupOpen(true);
  };

  // Handle payment setup completion
  const handlePaymentSetupClose = (success) => {
    setIsPaymentSetupOpen(false);
    setSelectedGateway(null);
    
    if (success) {
      // Refresh connected gateways status
      const gcashConnected = localStorage.getItem('gcash_connected') === 'true';
      const paymayaConnected = localStorage.getItem('paymaya_connected') === 'true';
      
      setConnectedGateways({
        gcash: gcashConnected,
        paymaya: paymayaConnected
      });
      
      setSuccessMessage(`${selectedGateway === 'gcash' ? 'GCash' : 'PayMaya'} connected successfully!`);
      setTimeout(() => setSuccessMessage(""), 5000);
    }
  };

  // Handle disconnect gateway
  const handleDisconnectGateway = (gatewayType) => {
    if (window.confirm(`Are you sure you want to disconnect ${gatewayType === 'gcash' ? 'GCash' : 'PayMaya'}?`)) {
      localStorage.removeItem(`${gatewayType}_connected`);
      localStorage.removeItem(`${gatewayType}_phone`);
      
      setConnectedGateways(prev => ({
        ...prev,
        [gatewayType]: false
      }));
      
      setSuccessMessage(`${gatewayType === 'gcash' ? 'GCash' : 'PayMaya'} disconnected successfully!`);
      setTimeout(() => setSuccessMessage(""), 5000);
    }
  };

  if (isLoading) {
    return <div>Loading Seller settings...</div>;
  }

  // Error is now displayed in the UI above

  if (!seller) {
    return <div>No Seller data available.</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-[405px] mx-auto sm:max-w-none px-3 sm:px-4">
      {/* Header with craft theme */}
      <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg sm:rounded-xl shadow-xl p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Seller Settings</h1>
              {hasUnsavedChanges() && (
                <span className="text-sm text-yellow-200 bg-yellow-500/30 px-3 py-1 rounded-full inline-block mt-1">
                  ⚠️ Unsaved Changes
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => {
                // Reset to original state
                setProfileImagePreview(seller?.profileImage || "");
                setProfileImageFile(null);
                setStory(seller?.story || "");
                setError(null);
                setSuccessMessage("");
              }}
              disabled={isSaving}
              className={hasUnsavedChanges() ? "bg-white/20 text-white border-white/50 hover:bg-white/30 transition-all duration-200" : "hidden"}
            >
              Cancel Changes
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || !hasUnsavedChanges()}
              className="min-w-[120px] bg-white text-[#5c3d28] hover:bg-[#faf9f8] shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-500 text-green-800 px-6 py-4 rounded-xl shadow-md">
          <span className="block sm:inline font-medium">✓ {successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-500 text-red-800 px-6 py-4 rounded-xl shadow-md">
          <span className="block sm:inline font-medium">✗ Error: {error}</span>
        </div>
      )}

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-[#faf9f8] border-2 border-[#e5ded7] p-1 rounded-xl shadow-md">
          <TabsTrigger 
            value="profile"
            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#a4785a] data-[state=active]:to-[#7b5a3b] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 font-medium"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger 
            value="account"
            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#a4785a] data-[state=active]:to-[#7b5a3b] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 font-medium"
          >
            Account
          </TabsTrigger>
          <TabsTrigger 
            value="payment"
            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#a4785a] data-[state=active]:to-[#7b5a3b] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 font-medium"
          >
            E-Payment
          </TabsTrigger>
          {/* <TabsTrigger 
            value="notifications"
            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#a4785a] data-[state=active]:to-[#7b5a3b] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 font-medium"
          >
            Notifications
          </TabsTrigger>
          <TabsTrigger 
            value="billing"
            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#a4785a] data-[state=active]:to-[#7b5a3b] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 font-medium"
          >
            Billing
          </TabsTrigger> */}
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile" className="space-y-6 pt-6">
          <Card className="border-2 border-[#e5ded7] shadow-xl hover:shadow-2xl transition-all duration-300 rounded-lg sm:rounded-xl overflow-hidden">
            <CardHeader className="border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white p-3 sm:p-4">
              <CardTitle className="text-[#5c3d28] flex items-center text-sm sm:text-base">
                <div className="p-1.5 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg mr-2">
                  <User className="h-4 w-4 text-white" />
                </div>
                Profile Information
              </CardTitle>
              <CardDescription className="text-[#7b5a3b] ml-11">
                Update your seller profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center space-y-2">
                  <Avatar className="h-24 w-24" key={getCurrentImageUrl()}>
                    <AvatarImage
                      src={getCurrentImageUrl()}
                      onError={(e) => {
                        console.log("Image failed to load, using fallback");
                        e.target.style.display = 'none';
                      }}
                      onLoad={() => {
                        console.log("Image loaded successfully");
                      }}
                    />
                    <AvatarFallback>{seller.userName?.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageChange}
                    ref={fileInputRef}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current.click()}
                    className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white border-0 hover:from-[#8a6b4a] hover:to-[#6b4a2f] shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    Change Photo
                  </Button>
                  {profileImageFile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearImageSelection}
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100 transition-all duration-200"
                    >
                      Clear Selection
                    </Button>
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="display-name" className="text-[#5c3d28] font-medium">Display Name</Label>
                      <Input 
                        id="display-name" 
                        defaultValue={seller.userName || ""} 
                        readOnly 
                        className="border-[#e5ded7] focus:border-[#a4785a] bg-[#faf9f8] text-[#5c3d28]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-[#5c3d28] font-medium">Role</Label>
                      <Input 
                        id="role" 
                        defaultValue={seller.role || "Admin"} 
                        readOnly 
                        className="border-[#e5ded7] focus:border-[#a4785a] bg-[#faf9f8] text-[#5c3d28]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="story" className="text-[#5c3d28] font-medium">Story</Label>
                    <Textarea
                      id="story"
                      value={story}
                      onChange={(e) => setStory(e.target.value)}
                      rows={4}
                      className="border-[#e5ded7] focus:border-[#a4785a] bg-[#faf9f8] text-[#5c3d28] resize-none"
                      placeholder="Tell your story to customers..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-[#5c3d28] font-medium">Location</Label>
                      <Input 
                        id="location" 
                        defaultValue={seller.userAddress || ""} 
                        readOnly 
                        className="border-[#e5ded7] focus:border-[#a4785a] bg-[#faf9f8] text-[#5c3d28]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website" className="text-[#5c3d28] font-medium">Website</Label>
                      <Input 
                        id="website" 
                        defaultValue={seller.website || ""} 
                        readOnly 
                        className="border-[#e5ded7] focus:border-[#a4785a] bg-[#faf9f8] text-[#5c3d28]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account */}
        <TabsContent value="account" className="space-y-6 pt-6">
          <Card className="border-2 border-[#e5ded7] shadow-xl hover:shadow-2xl transition-all duration-300 rounded-lg sm:rounded-xl overflow-hidden">
            <CardHeader className="border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white p-3 sm:p-4">
              <CardTitle className="text-[#5c3d28] flex items-center text-sm sm:text-base">
                <div className="p-1.5 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg mr-2">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                Account Information
              </CardTitle>
              <CardDescription className="text-[#7b5a3b] ml-11">
                Manage your account details and security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#5c3d28] font-medium">Email Address</Label>
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg mr-3">
                    <Mail className="h-4 w-4 text-white" />
                  </div>
                  <Input 
                    id="email" 
                    defaultValue={seller.userEmail || ""} 
                    readOnly 
                    className="border-[#e5ded7] focus:border-[#a4785a] bg-[#faf9f8] text-[#5c3d28]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[#5c3d28] font-medium">Phone Number</Label>
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg mr-3">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <Input 
                    id="phone" 
                    defaultValue={seller.userContactNumber || ""} 
                    readOnly 
                    className="border-[#e5ded7] focus:border-[#a4785a] bg-[#faf9f8] text-[#5c3d28]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  variant="outline" 
                  className="flex items-center bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white border-0 hover:from-[#8a6b4a] hover:to-[#6b4a2f] shadow-md hover:shadow-lg transition-all duration-200"
                  onClick={() => setShowChangePassword(!showChangePassword)}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {showChangePassword ? "Cancel" : "Change Password"}
                </Button>
              </div>

              {/* Change Password Form */}
              {showChangePassword && (
                <div className="mt-6 p-6 border-2 border-[#e5ded7] rounded-xl bg-gradient-to-r from-[#faf9f8] to-white shadow-lg">
                  <h3 className="text-lg font-semibold mb-4 text-[#5c3d28] flex items-center">
                    <div className="p-1.5 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg mr-3">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    Change Password
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-[#5c3d28] font-medium">Current Password</Label>
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter your current password"
                        className="border-[#e5ded7] focus:border-[#a4785a] bg-white text-[#5c3d28]"
                      />
                      {passwordErrors.currentPassword && (
                        <p className="text-sm text-red-500 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          {passwordErrors.currentPassword}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-[#5c3d28] font-medium">New Password</Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter your new password"
                        className="border-[#e5ded7] focus:border-[#a4785a] bg-white text-[#5c3d28]"
                      />
                      {passwordErrors.newPassword && (
                        <p className="text-sm text-red-500 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          {passwordErrors.newPassword}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 ml-1">
                        Must be 8+ characters with uppercase, lowercase, number, and special character
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-[#5c3d28] font-medium">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm your new password"
                        className="border-[#e5ded7] focus:border-[#a4785a] bg-white text-[#5c3d28]"
                      />
                      {passwordErrors.confirmPassword && (
                        <p className="text-sm text-red-500 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          {passwordErrors.confirmPassword}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={handleChangePassword}
                        disabled={isChangingPassword}
                        className="min-w-[120px] bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white hover:from-[#8a6b4a] hover:to-[#6b4a2f] shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                      >
                        {isChangingPassword ? "Changing..." : "Change Password"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={cancelPasswordChange}
                        disabled={isChangingPassword}
                        className="border-[#e5ded7] text-[#5c3d28] hover:bg-[#faf9f8] hover:border-[#a4785a] transition-all duration-200"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 border-red-200 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-lg sm:rounded-xl overflow-hidden">
            <CardHeader className="border-b border-red-200 bg-gradient-to-r from-red-50 to-white p-3 sm:p-4">
              <CardTitle className="text-red-700 flex items-center text-sm sm:text-base">
                <div className="p-1.5 bg-gradient-to-r from-red-500 to-red-600 rounded-lg mr-2">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
                Danger Zone
              </CardTitle>
              <CardDescription className="text-red-600 ml-11">
                Irreversible account actions
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4 pt-6" >
            <Button 
              variant="outline" 
              onClick={handleDeactivate}
              disabled={isProcessingAction}
              className="min-w-[120px] bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              {isProcessingAction ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Checking...
                </>
              ) : (
                'Deactivate Account'
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDelete}
              disabled={isProcessingAction}
              className="min-w-[120px] bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              {isProcessingAction ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Checking...
                </>
              ) : (
                'Delete Account'
              )}
            </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* E-Payment Settings */}
        <TabsContent value="payment" className="space-y-6 pt-6">
          <Card className="border-2 border-[#e5ded7] shadow-xl hover:shadow-2xl transition-all duration-300 rounded-lg sm:rounded-xl overflow-hidden">
            <CardHeader className="border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white p-3 sm:p-4">
              <CardTitle className="text-[#5c3d28] flex items-center text-sm sm:text-base">
                <div className="p-1.5 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg mr-2">
                  <Wallet className="h-4 w-4 text-white" />
                </div>
                Payment Gateway Setup
              </CardTitle>
              <CardDescription className="text-[#7b5a3b] ml-11">
                Connect your GCash and PayMaya accounts to receive payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* GCash Gateway */}
              <div className="border-2 border-blue-200 rounded-xl p-4 bg-gradient-to-r from-blue-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500 rounded-xl">
                      <Wallet className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-700">GCash</h3>
                      <p className="text-sm text-blue-600">
                        {connectedGateways.gcash 
                          ? `Connected: ${localStorage.getItem('gcash_phone') || 'Unknown number'}`
                          : 'Connect your GCash account to receive payments'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {connectedGateways.gcash && (
                      <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm font-medium">Connected</span>
                      </div>
                    )}
                    <Button
                      onClick={() => connectedGateways.gcash 
                        ? handleDisconnectGateway('gcash') 
                        : handleConnectGateway('gcash')
                      }
                      className={`${
                        connectedGateways.gcash
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      } transition-all duration-200`}
                    >
                      {connectedGateways.gcash ? 'Disconnect' : 'Connect'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* PayMaya Gateway */}
              <div className="border-2 border-green-200 rounded-xl p-4 bg-gradient-to-r from-green-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-500 rounded-xl">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-700">PayMaya</h3>
                      <p className="text-sm text-green-600">
                        {connectedGateways.paymaya 
                          ? `Connected: ${localStorage.getItem('paymaya_phone') || 'Unknown number'}`
                          : 'Connect your PayMaya account to receive payments'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {connectedGateways.paymaya && (
                      <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm font-medium">Connected</span>
                      </div>
                    )}
                    <Button
                      onClick={() => connectedGateways.paymaya 
                        ? handleDisconnectGateway('paymaya') 
                        : handleConnectGateway('paymaya')
                      }
                      className={`${
                        connectedGateways.paymaya
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      } transition-all duration-200`}
                    >
                      {connectedGateways.paymaya ? 'Disconnect' : 'Connect'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Information Note */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-amber-500 rounded-full mt-1">
                    <AlertTriangle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-2">Important Notes:</h4>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>• This is a simulation mode for demonstration purposes</li>
                      <li>• In production, you would integrate with actual payment gateway APIs</li>
                      <li>• Connected accounts will be used for processing customer payments</li>
                      <li>• Ensure your mobile numbers are active and verified</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        {/* <TabsContent value="notifications" className="space-y-6 pt-6">
          <Card className="border-2 border-[#e5ded7] shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white">
              <CardTitle className="text-[#5c3d28] flex items-center text-xl">
                <div className="p-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg mr-3">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                Notification Preferences
              </CardTitle>
              <CardDescription className="text-[#7b5a3b] ml-11">
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-white to-[#faf9f8] border-2 border-[#e5ded7] hover:border-[#a4785a] transition-all duration-200">
                <div>
                  <Label className="text-[#5c3d28] font-semibold">Email Notifications</Label>
                  <p className="text-sm text-[#7b5a3b]">Receive updates via email</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-white to-[#faf9f8] border-2 border-[#e5ded7] hover:border-[#a4785a] transition-all duration-200">
                <div>
                  <Label className="text-[#5c3d28] font-semibold">Push Notifications</Label>
                  <p className="text-sm text-[#7b5a3b]">Receive push notifications</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent> */}

        {/* Billing */}
        {/* <TabsContent value="billing" className="space-y-6 pt-6">
          <Card className="border-2 border-[#e5ded7] shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white">
              <CardTitle className="text-[#5c3d28] flex items-center text-xl">
                <div className="p-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg mr-3">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                Payment Methods
              </CardTitle>
              <CardDescription className="text-[#7b5a3b] ml-11">
                Manage your saved payment details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="border-2 border-[#e5ded7] p-6 rounded-xl bg-gradient-to-r from-white to-[#faf9f8] hover:border-[#a4785a] transition-all duration-200 flex justify-between items-center">
                <div>
                  <p className="font-medium text-[#5c3d28]">Visa ending in 1234</p>
                  <p className="text-sm text-[#7b5a3b]">Expires 08/27</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-[#e5ded7] text-[#5c3d28] hover:bg-[#faf9f8] hover:border-[#a4785a] transition-all duration-200"
                >
                  Edit
                </Button>
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white hover:from-[#8a6b4a] hover:to-[#6b4a2f] shadow-md hover:shadow-lg transition-all duration-200"
              >
                Add Payment Method
              </Button>
            </CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>

      {/* Initial Confirmation Modal */}
      {showInitialConfirmModal && initialConfirmAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-full ${
                  initialConfirmAction.type === 'delete' ? 'bg-red-100' : 'bg-orange-100'
                }`}>
                  <AlertTriangle className={`h-6 w-6 ${
                    initialConfirmAction.type === 'delete' ? 'text-red-600' : 'text-orange-600'
                  }`} />
                </div>
                <h3 className="text-xl font-bold text-[#5c3d28]">{initialConfirmAction.title}</h3>
              </div>
              
              <p className="text-[#7b5a3b] mb-4 font-medium">
                {initialConfirmAction.message}
              </p>
              
              <div className="mb-6">
                <p className="text-sm font-medium text-[#5c3d28] mb-2">This will:</p>
                <ul className="space-y-1">
                  {initialConfirmAction.consequences.map((consequence, index) => (
                    <li key={index} className="text-sm text-[#7b5a3b] flex items-start">
                      <span className="text-red-500 mr-2 mt-0.5">•</span>
                      <span className={initialConfirmAction.type === 'delete' && consequence.includes('PERMANENTLY') ? 'font-semibold text-red-700' : ''}>
                        {consequence}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {initialConfirmAction.type === 'delete' && (
                <div className="mb-6 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm font-medium flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    This action cannot be undone!
                  </p>
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancelInitialConfirm}
                  className="flex-1 px-4 py-2 rounded-md text-white border-0 font-medium transition-colors"
                  style={{ backgroundColor: '#5c3d28' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#4a3220'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#5c3d28'}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={initialConfirmAction.action}
                  className="flex-1 px-4 py-2 rounded-md border-0 font-medium transition-colors"
                  style={{ backgroundColor: 'white', color: '#5c3d28', border: '1px solid #d5bfae' }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f5f0eb';
                    e.target.style.color = '#5c3d28';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'white';
                    e.target.style.color = '#5c3d28';
                  }}
                >
                  {initialConfirmAction.buttonText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Action Confirmation Modal */}
      {showAccountActionModal && accountAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-full ${
                  accountAction.type === 'delete' ? 'bg-red-100' : 'bg-orange-100'
                }`}>
                  <AlertTriangle className={`h-6 w-6 ${
                    accountAction.type === 'delete' ? 'text-red-600' : 'text-orange-600'
                  }`} />
                </div>
                <h3 className="text-xl font-bold text-[#5c3d28]">{accountAction.title}</h3>
              </div>

              {/* Check if there are constraints */}
              {accountAction.constraints && (
                <>
                  {/* Pending Orders Section */}
                  {pendingOrders.length > 0 && (
                    <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <h4 className="font-semibold text-yellow-800">Pending Orders Require Attention</h4>
                      </div>
                      <p className="text-yellow-700 mb-3">
                        You have {pendingOrders.length} order(s) that need to be packaged and delivered:
                      </p>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {pendingOrders.map((order, index) => (
                          <div key={index} className="flex justify-between items-center bg-white p-2 rounded border">
                            <span className="font-medium">Order #{order.orderNumber}</span>
                            <div className="text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                order.paymentMethod === 'COD' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {order.paymentMethod}
                              </span>
                              <span className="ml-2 text-gray-600">₱{order.total}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      {accountAction.type === 'delete' && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-blue-700 text-sm">
                            <strong>Note:</strong> COD orders will be automatically cancelled. 
                            GCash/PayMaya orders require settlement before deletion.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Unsettled Payments Section */}
                  {unsettledPayments.length > 0 && (
                    <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <h4 className="font-semibold text-red-800">Unsettled Payment Transactions</h4>
                      </div>
                      <p className="text-red-700 mb-3">
                        You have {unsettledPayments.length} unsettled payment transaction(s) that must be resolved:
                      </p>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {unsettledPayments.map((payment, index) => (
                          <div key={index} className="flex justify-between items-center bg-white p-2 rounded border">
                            <span className="font-medium">Order #{payment.orderNumber}</span>
                            <div className="text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                payment.gateway === 'gcash' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {payment.gateway.toUpperCase()}
                              </span>
                              <span className="ml-2 text-gray-600">₱{payment.amount}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded">
                        <p className="text-red-800 text-sm font-medium">
                          ⚠️ You must settle all GCash and PayMaya transactions before proceeding with account {accountAction.type}.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action cannot proceed */}
                  {(pendingOrders.length > 0 || unsettledPayments.length > 0) && (
                    <div className="mb-6 p-4 bg-gray-50 border-2 border-gray-200 rounded-xl">
                      <h4 className="font-semibold text-gray-800 mb-2">Action Required Before Proceeding:</h4>
                      <ul className="text-gray-700 space-y-1 text-sm">
                        {pendingOrders.length > 0 && (
                          <li>• Complete packaging and delivery of all pending orders</li>
                        )}
                        {unsettledPayments.length > 0 && (
                          <li>• Settle all outstanding GCash and PayMaya transactions</li>
                        )}
                        <li>• Contact customer support if you need assistance</li>
                      </ul>
                    </div>
                  )}
                </>
              )}

              {/* No constraints - can proceed */}
              {accountAction.constraints && pendingOrders.length === 0 && unsettledPayments.length === 0 && (
                <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-green-800">Ready to Proceed</h4>
                  </div>
                  <p className="text-green-700">
                    {accountAction.type === 'delete' 
                      ? 'Your account has no pending orders or unsettled payments. You can safely delete your account.'
                      : 'Your account has no pending orders or unsettled payments. You can safely deactivate your account.'
                    }
                  </p>
                </div>
              )}

              {/* Warning message */}
              <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                <p className="text-yellow-800 leading-relaxed">
                  {accountAction.type === 'delete' ? (
                    <>
                      <strong>⚠️ Warning:</strong> This action will permanently delete your seller account and all associated data. 
                      This includes your products, order history, and customer information. This action cannot be undone.
                    </>
                  ) : (
                    <>
                      <strong>⚠️ Warning:</strong> This action will deactivate your seller account. 
                      Your products will be hidden from customers and you won't be able to receive new orders. 
                      You can reactivate your account by contacting support.
                    </>
                  )}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancelAccountAction}
                  className="flex-1 px-4 py-2 rounded-md text-white border-0 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#5c3d28' }}
                  onMouseEnter={(e) => !isProcessingAction && (e.target.style.backgroundColor = '#4a3220')}
                  onMouseLeave={(e) => !isProcessingAction && (e.target.style.backgroundColor = '#5c3d28')}
                  disabled={isProcessingAction}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAccountAction}
                  disabled={isProcessingAction || (pendingOrders.length > 0 || unsettledPayments.length > 0)}
                  className="flex-1 px-4 py-2 rounded-md border-0 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: 'white', 
                    color: '#5c3d28', 
                    border: '1px solid #d5bfae' 
                  }}
                  onMouseEnter={(e) => {
                    if (!isProcessingAction && !(pendingOrders.length > 0 || unsettledPayments.length > 0)) {
                      e.target.style.backgroundColor = '#f5f0eb';
                      e.target.style.color = '#5c3d28';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isProcessingAction && !(pendingOrders.length > 0 || unsettledPayments.length > 0)) {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.color = '#5c3d28';
                    }
                  }}
                >
                  {isProcessingAction ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 mr-2" style={{ borderColor: '#5c3d28' }} />
                      Processing...
                    </>
                  ) : (
                    `Confirm ${accountAction.type === 'delete' ? 'Deletion' : 'Deactivation'}`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Gateway Setup Modal */}
      <PaymentGatewaySetup
        isOpen={isPaymentSetupOpen}
        onClose={handlePaymentSetupClose}
        gatewayType={selectedGateway}
      />
    </div>
  );
};

export default SellerSettings;