import React, { useState, useEffect } from 'react';
import { useUser } from '../Context/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { User, Mail, Phone, MapPin, Calendar, Loader2, Save, Shield, Award, Clock, CheckCircle2, Camera, Upload } from 'lucide-react';
import api from '../../api';

const Profile = () => {
  const { user, updateUser } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    userContactNumber: '',
    userAddress: '',
    userBirthday: '',
    userCity: '',
    userPostalCode: ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

  // Helper function to convert image URLs to relative paths
  const fixImageUrl = (url) => {
    if (!url) return url;
    // If it's already a full URL with localhost, convert to relative path
    if (url.includes('localhost:8000') || url.includes('localhost:8080') || url.includes('craftconnect-laravel-backend-1.onrender.com')) {
      const path = new URL(url).pathname;
      return path;
    }
    // If it's already a relative path, return as is
    if (url.startsWith('/storage/') || url.startsWith('/images/')) {
      return url;
    }
    // If it's just a filename, prepend /storage/
    if (url && !url.startsWith('http') && !url.startsWith('/')) {
      return `/storage/${url}`;
    }
    return url;
  };

  useEffect(() => {
    if (user) {
      setFormData({
        userName: user.userName || '',
        userEmail: user.userEmail || '',
        userContactNumber: user.userContactNumber || '',
        userAddress: user.userAddress || '',
        userBirthday: user.userBirthday || '',
        userCity: user.userCity || '',
        userPostalCode: user.userPostalCode || ''
      });
      
      // Set profile picture preview - handle both cases where URL is already complete or just the path
      if (user.profilePicture) {
        // Check if it's already a full URL or a path
        const profilePicUrl = user.profilePicture.startsWith('http') 
          ? fixImageUrl(user.profilePicture)
          : fixImageUrl(user.profilePicture);
        setProfilePicturePreview(profilePicUrl);
      } else {
        setProfilePicturePreview(null);
      }
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      setProfilePicture(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      if (!user) {
        alert('Please log in to update your profile');
        return;
      }

      // Create FormData to handle file upload
      const formDataToSend = new FormData();
      
      // No need for _method field since we're using POST route
      
      // Add text fields
      formDataToSend.append('userName', formData.userName);
      formDataToSend.append('userEmail', formData.userEmail);
      formDataToSend.append('userContactNumber', formData.userContactNumber);
      formDataToSend.append('userAddress', formData.userAddress);
      formDataToSend.append('userCity', formData.userCity);
      formDataToSend.append('userPostalCode', formData.userPostalCode);

      // ONLY add profile picture if a NEW file was selected
      if (profilePicture && profilePicture instanceof File) {
        formDataToSend.append('profile_picture', profilePicture);
      }

      const response = await api.post('/customer/profile', formDataToSend);

      const data = response.data;

      if (data.message === 'Profile updated successfully') {
        // Update local user state with the updated data
        const updatedUser = { ...user, ...data.user };
        
        // Handle profile picture URL from customer profile
        if (data.profile_picture_url) {
          updatedUser.profilePicture = fixImageUrl(data.profile_picture_url);
          setProfilePicturePreview(fixImageUrl(data.profile_picture_url));
        } else if (data.customer?.profile_picture_path) {
          const profilePicUrl = fixImageUrl(data.customer.profile_picture_path);
          updatedUser.profilePicture = profilePicUrl;
          setProfilePicturePreview(profilePicUrl);
        } else {
          // No profile picture was uploaded or saved
          updatedUser.profilePicture = null;
          setProfilePicturePreview(null);
        }
        
        // Ensure the updated user has the correct profile picture URL
        updateUser(updatedUser);
        setProfilePicture(null); // Clear the file input
        alert('Profile updated successfully!');
        
        // Force refresh the user data from backend to ensure sync
        setTimeout(async () => {
          try {
            const refreshResponse = await api.get('/customer/profile');
            const refreshedData = refreshResponse.data;
            
            const refreshedUser = { ...refreshedData.user };
            if (refreshedData.profile_picture_url) {
              refreshedUser.profilePicture = fixImageUrl(refreshedData.profile_picture_url);
            } else if (refreshedData.customer?.profile_picture_path) {
              refreshedUser.profilePicture = fixImageUrl(refreshedData.customer.profile_picture_path);
            }
            
            updateUser(refreshedUser);
          } catch (error) {
            // Error refreshing user data
          }
        }, 500);
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      if (error.response?.data) {
        const errorMessages = error.response.data.errors 
          ? Object.values(error.response.data.errors).flat().join('\n')
          : error.response.data.message || error.message;
        alert(`Failed to update profile:\n${errorMessages}`);
      } else {
        alert(`Failed to update profile: ${error.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const getProfileCompletion = () => {
    const fields = [
      formData.userName,
      formData.userEmail,
      formData.userContactNumber,
      formData.userAddress,
      formData.userCity,
      formData.userPostalCode,
      profilePicturePreview // Include profile picture
    ];
    const completedFields = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const getProfileStatus = () => {
    const completion = getProfileCompletion();
    if (completion === 100) return { status: 'Complete', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    if (completion >= 70) return { status: 'Almost Complete', icon: Award, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    if (completion >= 40) return { status: 'In Progress', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    return { status: 'Getting Started', icon: User, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f7f3f0] to-[#e8ddd4] flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl border border-[#e5ded7]">
          <Shield className="h-16 w-16 text-[#7a5c52] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#7a5c52] mb-2">Authentication Required</h1>
          <p className="text-gray-600">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  const profileStatus = getProfileStatus();
  const completion = getProfileCompletion();
  const StatusIcon = profileStatus.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f0ed] to-[#e5ddd4] py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#7a5c52] mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your account information and preferences</p>
          </div>

          {/* Profile Picture Section */}
          <Card className="shadow-xl border-2 border-[#d4c5b8] rounded-2xl overflow-hidden bg-white mb-8">
            <CardHeader className="bg-gradient-to-r from-[#7a5c52] to-[#a4785a] text-white">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Camera className="h-5 w-5" />
                </div>
                Profile Picture
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex items-center justify-center">
                <div className="relative">
                  {/* Profile Picture Display */}
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#e5ddd4] shadow-lg bg-gradient-to-br from-[#f8f6f4] to-[#f0ebe7]">
                    {profilePicturePreview ? (
                      <img
                        src={profilePicturePreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          setProfilePicturePreview(null);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-16 w-16 text-[#7a5c52]" />
                      </div>
                    )}
                  </div>
                  
                  {/* Upload Button */}
                  <label className="absolute -bottom-2 -right-2 bg-gradient-to-r from-[#7a5c52] to-[#a4785a] hover:from-[#6a4c34] hover:to-[#8d6749] text-white p-3 rounded-full shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl">
                    <Upload className="h-5 w-5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600 mb-2">
                  Click the upload button to change your profile picture
                </p>
                <p className="text-xs text-gray-500">
                  Recommended: Square image, max 5MB
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Profile Status Card */}
          <div className={`${profileStatus.bg} ${profileStatus.border} border-2 rounded-2xl p-6 mb-8 shadow-lg`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${profileStatus.bg} border ${profileStatus.border}`}>
                  <StatusIcon className={`h-6 w-6 ${profileStatus.color}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Profile Status: {profileStatus.status}</h3>
                  <p className="text-sm text-gray-600">{completion}% Complete</p>
                </div>
              </div>
              <div className="text-right">
                <div className="w-32 bg-gray-200 rounded-full h-3 mb-2">
                  <div 
                    className="bg-gradient-to-r from-[#7a5c52] to-[#a4785a] h-3 rounded-full transition-all duration-500"
                    style={{ width: `${completion}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">{completion}/100</p>
              </div>
            </div>
          </div>

          {/* Main Profile Card */}
          <Card className="shadow-2xl border-2 border-[#d4c5b8] rounded-2xl overflow-hidden bg-white">
            <CardHeader className="bg-gradient-to-r from-[#7a5c52] to-[#a4785a] text-white">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-white/20 rounded-lg">
                  <User className="h-6 w-6" />
                </div>
                Profile Information
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-8">
              {/* Personal Information Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-[#7a5c52] mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-[#7a5c52] to-[#a4785a] rounded-full"></div>
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Username */}
                  <div className="space-y-3">
                    <Label htmlFor="userName" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <User className="h-4 w-4 text-[#7a5c52]" />
                      Full Name
                    </Label>
                    <Input
                      id="userName"
                      name="userName"
                      value={formData.userName}
                      onChange={handleInputChange}
                      className="border-2 border-gray-200 focus:border-[#7a5c52] rounded-xl px-4 py-3"
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-3">
                    <Label htmlFor="userEmail" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Mail className="h-4 w-4 text-[#7a5c52]" />
                      Email Address
                    </Label>
                    <Input
                      id="userEmail"
                      name="userEmail"
                      type="email"
                      value={formData.userEmail}
                      onChange={handleInputChange}
                      className="border-2 border-gray-200 focus:border-[#7a5c52] rounded-xl px-4 py-3"
                      placeholder="Enter your email"
                    />
                  </div>

                  {/* Contact Number */}
                  <div className="space-y-3">
                    <Label htmlFor="userContactNumber" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Phone className="h-4 w-4 text-[#7a5c52]" />
                      Contact Number
                    </Label>
                    <Input
                      id="userContactNumber"
                      name="userContactNumber"
                      value={formData.userContactNumber}
                      onChange={handleInputChange}
                      className="border-2 border-gray-200 focus:border-[#7a5c52] rounded-xl px-4 py-3"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  {/* Birthday */}
                  <div className="space-y-3">
                    <Label htmlFor="userBirthday" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Calendar className="h-4 w-4 text-[#7a5c52]" />
                      Birthday
                    </Label>
                    <Input
                      id="userBirthday"
                      name="userBirthday"
                      type="date"
                      value={formData.userBirthday}
                      onChange={handleInputChange}
                      className="border-2 border-gray-200 focus:border-[#7a5c52] rounded-xl px-4 py-3"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-[#7a5c52] mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-[#7a5c52] to-[#a4785a] rounded-full"></div>
                  Address Information
                </h3>

                {/* Address */}
                <div className="space-y-3 mb-6">
                  <Label htmlFor="userAddress" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <MapPin className="h-4 w-4 text-[#7a5c52]" />
                    Street Address
                  </Label>
                  <Input
                    id="userAddress"
                    name="userAddress"
                    value={formData.userAddress}
                    onChange={handleInputChange}
                    className="border-2 border-gray-200 focus:border-[#7a5c52] rounded-xl px-4 py-3"
                    placeholder="Enter your street address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* City */}
                  <div className="space-y-3">
                    <Label htmlFor="userCity" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <MapPin className="h-4 w-4 text-[#7a5c52]" />
                      City
                    </Label>
                    <Input
                      id="userCity"
                      name="userCity"
                      value={formData.userCity}
                      onChange={handleInputChange}
                      className="border-2 border-gray-200 focus:border-[#7a5c52] rounded-xl px-4 py-3"
                      placeholder="Enter your city"
                    />
                  </div>

                  {/* Postal Code */}
                  <div className="space-y-3">
                    <Label htmlFor="userPostalCode" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <MapPin className="h-4 w-4 text-[#7a5c52]" />
                      Postal Code
                    </Label>
                    <Input
                      id="userPostalCode"
                      name="userPostalCode"
                      value={formData.userPostalCode}
                      onChange={handleInputChange}
                      className="border-2 border-gray-200 focus:border-[#7a5c52] rounded-xl px-4 py-3"
                      placeholder="Enter your postal code"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-[#e5ddd4]">
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="bg-gradient-to-r from-[#7a5c52] to-[#a4785a] hover:from-[#6a4c34] hover:to-[#8d6749] text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
