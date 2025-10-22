import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VerificationPending from './VerificationPending';
import api from '../../api';

const VerificationPendingPage = () => {
  const [storeData, setStoreData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true);
        // Try to get seller profile first, which includes store info
        const response = await api.get('/sellers/profile');
        
        if (response.data && response.data.store) {
          const store = response.data.store;
          setStoreData({
            storeName: store.store_name,
            category: store.category,
            ownerName: store.owner_name,
            ownerEmail: store.owner_email || response.data.userEmail,
            status: store.status,
            rejection_reason: store.rejection_reason
          });
          
          // If store is approved, redirect immediately to seller dashboard
          if (store.status === 'approved') {
            console.log('Store already approved, redirecting to dashboard...');
            navigate('/seller', { replace: true });
          }
        } else {
          // No store found, redirect to create store
          console.log('No store found, redirecting to create store...');
          navigate('/create-store', { replace: true });
        }
      } catch (error) {
        console.error('Error fetching store data:', error);
        setError('Failed to load store information');
        // If there's a 404, no store exists - redirect to create store
        if (error.response?.status === 404) {
          navigate('/create-store', { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [navigate]);

  const handleCheckStatus = async () => {
    try {
      const response = await api.get('/sellers/profile');
      
      if (response.data && response.data.store) {
        const store = response.data.store;
        const status = store.status;
        
        // Update store data with new status and rejection reason
        setStoreData(prev => ({
          ...prev,
          status: status,
          rejection_reason: store.rejection_reason
        }));
        
        // Note: The VerificationPending component now handles redirects
        // We don't redirect here anymore to avoid conflicts
      }
    } catch (error) {
      console.error('Error checking store status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading store information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/create-store')}
            className="bg-amber-700 text-white px-6 py-3 rounded-lg hover:bg-amber-800"
          >
            Create Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <VerificationPending 
      storeData={storeData}
      onCheckStatus={handleCheckStatus}
    />
  );
};

export default VerificationPendingPage;
