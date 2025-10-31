import React, { useState } from 'react';
import { useUser } from '../Context/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Settings as SettingsIcon, Key, Trash2, Eye, EyeOff, X } from 'lucide-react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    newPasswordConfirmation: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async () => {
    setError('');
    setSuccess('');
    
    if (!changePasswordData.currentPassword || !changePasswordData.newPassword || !changePasswordData.newPasswordConfirmation) {
      setError('All fields are required');
      return;
    }
    
    if (changePasswordData.newPassword !== changePasswordData.newPasswordConfirmation) {
      setError('New password and confirmation do not match');
      return;
    }
    
    if (changePasswordData.newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    
    // Check for capital letter
    if (!/[A-Z]/.test(changePasswordData.newPassword)) {
      setError('New password must contain at least one capital letter');
      return;
    }
    
    // Check for number
    if (!/[0-9]/.test(changePasswordData.newPassword)) {
      setError('New password must contain at least one number');
      return;
    }
    
    // Check for special character
    const specialCharRegex = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;
    if (!specialCharRegex.test(changePasswordData.newPassword)) {
      setError('New password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)');
      return;
    }
    
    if (changePasswordData.newPassword === changePasswordData.currentPassword) {
      setError('New password must be different from current password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await api.post('/change-password', {
        currentPassword: changePasswordData.currentPassword,
        newPassword: changePasswordData.newPassword,
        newPassword_confirmation: changePasswordData.newPasswordConfirmation
      });
      
      setSuccess('Password changed successfully. Please log in again.');
      setTimeout(async () => {
        await logout();
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      await api.delete('/user');
      
      setSuccess('Account deleted successfully.');
      setTimeout(async () => {
        await logout();
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600">Please log in to access settings</h1>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="container mx-auto px-4 py-8 min-h-[60vh]">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                {success}
              </div>
            )}

            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-lg font-semibold">Account Actions</h3>
              
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowChangePassword(true)}
                >
                  <Key className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setShowDeleteAccount(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center backdrop-blur-sm bg-black/50"
          onClick={() => {
            if (!isLoading) {
              setShowChangePassword(false);
              setError('');
              setSuccess('');
              setChangePasswordData({ currentPassword: '', newPassword: '', newPasswordConfirmation: '' });
            }
          }}
        >
          <div 
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => {
                setShowChangePassword(false);
                setError('');
                setSuccess('');
                setChangePasswordData({ currentPassword: '', newPassword: '', newPasswordConfirmation: '' });
              }}
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">Change Password</h2>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
                    value={changePasswordData.currentPassword}
                    onChange={(e) => setChangePasswordData({ ...changePasswordData, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center"
                  >
                    {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
                    value={changePasswordData.newPassword}
                    onChange={(e) => setChangePasswordData({ ...changePasswordData, newPassword: e.target.value })}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center"
                  >
                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-1">
                  Must be 8+ characters with a capital letter, number, and special character
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
                    value={changePasswordData.newPasswordConfirmation}
                    onChange={(e) => setChangePasswordData({ ...changePasswordData, newPasswordConfirmation: e.target.value })}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                onClick={handleChangePassword}
                disabled={isLoading}
                className="flex-1 bg-brown-600 hover:bg-brown-700 text-white"
              >
                {isLoading ? 'Changing...' : 'Change Password'}
              </Button>
              <Button
                onClick={() => {
                  setShowChangePassword(false);
                  setError('');
                  setSuccess('');
                  setChangePasswordData({ currentPassword: '', newPassword: '', newPasswordConfirmation: '' });
                }}
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteAccount && (
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center backdrop-blur-sm bg-black/50"
          onClick={() => {
            if (!isLoading) {
              setShowDeleteAccount(false);
            }
          }}
        >
          <div 
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowDeleteAccount(false)}
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold text-red-600 mb-4">Delete Account</h2>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? This action cannot be undone. 
              All your data, orders, and information will be permanently deleted.
            </p>

            <div className="flex gap-2">
              <Button
                onClick={handleDeleteAccount}
                disabled={isLoading}
                variant="destructive"
                className="flex-1"
              >
                {isLoading ? 'Deleting...' : 'Yes, Delete Account'}
              </Button>
              <Button
                onClick={() => setShowDeleteAccount(false)}
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Settings;
