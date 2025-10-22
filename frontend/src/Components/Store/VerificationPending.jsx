import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Mail, Phone, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const VerificationPending = ({ storeData, onCheckStatus }) => {
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [storeStatus, setStoreStatus] = useState(storeData?.status || 'pending');
  const [rejectionReason, setRejectionReason] = useState(storeData?.rejection_reason || '');
  const [lastChecked, setLastChecked] = useState(new Date());
  const [redirecting, setRedirecting] = useState(false);
  const navigate = useNavigate();

  // Auto-refresh every 10 seconds for better real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (!checkingStatus && !redirecting) {
        checkStoreStatus();
      }
    }, 10000); // 10 seconds for faster updates

    return () => clearInterval(interval);
  }, [checkingStatus, redirecting]);

  // Check store status and handle redirects
  const checkStoreStatus = async () => {
    try {
      setCheckingStatus(true);
      console.log('Checking store status...');
      
      // Fetch current seller profile to get latest store status
      const response = await api.get('/sellers/profile');
      
      if (response.data && response.data.store) {
        const newStatus = response.data.store.status;
        const newRejectionReason = response.data.store.rejection_reason;
        
        console.log('Current store status:', newStatus);
        setStoreStatus(newStatus);
        setRejectionReason(newRejectionReason);
        
        // Handle status changes
        if (newStatus === 'approved' && storeStatus !== 'approved') {
          console.log('✅ Store approved! Redirecting to seller dashboard...');
          setRedirecting(true);
          
          // Show success message briefly before redirect
          setTimeout(() => {
            navigate('/seller', { replace: true });
            window.location.reload(); // Force reload to update layout
          }, 2000);
        } else if (newStatus === 'rejected' && storeStatus !== 'rejected') {
          console.log('❌ Store rejected. Showing rejection details...');
          // Just update the status to show rejection message
          // User can see the reason and logout or contact support
        }
        
        // Call onCheckStatus callback if provided
        if (onCheckStatus) {
          await onCheckStatus();
        }
      }
    } catch (error) {
      console.error('Error checking store status:', error);
    } finally {
      setCheckingStatus(false);
      setLastChecked(new Date());
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getStatusIcon = () => {
    switch (storeStatus) {
      case 'approved':
        return <CheckCircle className="h-16 w-16 text-green-600" />;
      case 'rejected':
        return <AlertCircle className="h-16 w-16 text-red-600" />;
      default:
        return <Clock className="h-16 w-16 text-amber-600" />;
    }
  };

  const getStatusMessage = () => {
    switch (storeStatus) {
      case 'approved':
        return {
          title: '🎉 Store Approved!',
          message: 'Congratulations! Your store has been approved and verified. You are being redirected to your seller dashboard...',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'rejected':
        return {
          title: '❌ Store Application Rejected',
          message: 'Unfortunately, your store application has been rejected. Please review the reason below and contact support if you need assistance or wish to resubmit.',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      default:
        return {
          title: '⏳ Store Under Review',
          message: 'Your store application is being reviewed by our team. This usually takes 24-48 hours. We automatically check for updates every 10 seconds.',
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200'
        };
    }
  };

  const statusInfo = getStatusMessage();

  // If redirecting to seller dashboard
  if (redirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-2xl">
          <CardContent className="p-12">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <Loader2 className="h-20 w-20 text-green-600 animate-spin" />
                  <CheckCircle className="h-12 w-12 text-green-600 absolute top-4 left-4" />
                </div>
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-bold text-green-600">
                  🎉 Approved!
                </h1>
                <p className="text-gray-700 text-xl font-medium">
                  Redirecting to your seller dashboard...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className={`w-full max-w-3xl shadow-2xl border-2 ${statusInfo.borderColor}`}>
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Status Icon */}
            <div className="flex justify-center">
              {getStatusIcon()}
            </div>

            {/* Status Message */}
            <div className="space-y-3">
              <h1 className={`text-4xl font-bold ${statusInfo.color}`}>
                {statusInfo.title}
              </h1>
              <p className="text-gray-700 text-lg font-medium">
                {statusInfo.message}
              </p>
            </div>

            {/* Rejection Reason (if rejected) */}
            {storeStatus === 'rejected' && rejectionReason && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-left">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-red-800 mb-2 text-lg">Rejection Reason:</h3>
                    <p className="text-red-700 leading-relaxed">{rejectionReason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Store Information */}
            <div className={`${statusInfo.bgColor} border-2 ${statusInfo.borderColor} rounded-xl p-6 text-left`}>
              <h3 className="font-bold text-gray-800 mb-4 text-lg flex items-center gap-2">
                <div className="h-2 w-2 bg-gray-800 rounded-full"></div>
                Your Store Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Store Name:</span>
                  <span className="font-semibold text-gray-900">{storeData?.storeName || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Category:</span>
                  <span className="text-gray-900">{storeData?.category || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Owner:</span>
                  <span className="text-gray-900">{storeData?.ownerName || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Email:</span>
                  <span className="text-gray-900">{storeData?.ownerEmail || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
                    storeStatus === 'approved' ? 'bg-green-500 text-white' :
                    storeStatus === 'rejected' ? 'bg-red-500 text-white' :
                    'bg-amber-500 text-white'
                  }`}>
                    {storeStatus.charAt(0).toUpperCase() + storeStatus.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <h3 className="font-bold text-blue-800 mb-4 text-lg">Need Help?</h3>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-blue-700">
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span className="text-sm font-medium">craftconnect49@gmail.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <span className="text-sm font-medium">+63 123 456 7890</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={checkStoreStatus}
                disabled={checkingStatus}
                className={`${
                  storeStatus === 'approved' ? 'bg-green-600 hover:bg-green-700' :
                  storeStatus === 'rejected' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-amber-600 hover:bg-amber-700'
                } text-white font-semibold px-6 py-3 shadow-lg`}
              >
                {checkingStatus ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Check Status Now'
                )}
              </Button>
              
              {storeStatus === 'rejected' && (
                <Button
                  variant="outline"
                  onClick={() => navigate('/create-store')}
                  className="border-2 border-blue-500 text-blue-700 hover:bg-blue-50 font-semibold px-6 py-3"
                >
                  Resubmit Application
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-6 py-3"
              >
                Logout
              </Button>
            </div>

            {/* Status Check Info */}
            <div className="space-y-2">
              <div className="text-sm text-gray-600 font-medium">
                Last checked: {lastChecked.toLocaleTimeString()}
              </div>
              <div className="text-xs text-gray-500 bg-gray-100 rounded-lg p-4 border border-gray-200">
                <p className="font-semibold mb-2">⚡ Real-Time Status Updates</p>
                <p>We automatically check your store status every <strong>10 seconds</strong>. When your store is approved or rejected, this page will update immediately and redirect you automatically.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationPending;
