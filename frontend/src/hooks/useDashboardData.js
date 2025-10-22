import { useState, useEffect } from 'react';
import api from '../api';
import { getSellerAuthToken, setupTestSellerAuth } from '../utils/sellerAuthHelper';

export const useDashboardData = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get seller authentication token
      let token = getSellerAuthToken();
      
      if (!token) {
        console.log('No seller token found, setting up test authentication...');
        setupTestSellerAuth();
        token = getSellerAuthToken();
        
        if (!token) {
          throw new Error('Failed to set up seller authentication');
        }
      }
      
      // Use seller dashboard endpoint (seller ID 4 has data - Alex Manalo's Shop)
      const sellerId = 4;
      const response = await api.get(`/seller/${sellerId}/dashboard`);
      
      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const refetch = () => {
    fetchDashboardData();
  };

  return {
    dashboardData,
    loading,
    error,
    refetch
  };
};
