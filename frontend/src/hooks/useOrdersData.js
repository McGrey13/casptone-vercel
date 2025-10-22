import { useState, useEffect } from 'react';
import api from '../api';

export const useOrdersData = () => {
  const [ordersData, setOrdersData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrdersData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/orders/seller');
      
      if (response.data) {
        setOrdersData(response.data);
      } else {
        setError('Failed to fetch orders data');
      }
    } catch (err) {
      console.error('Error fetching orders data:', err);
      setError(err.response?.data?.message || 'Failed to fetch orders data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersData();
  }, []);

  const refetch = () => {
    fetchOrdersData();
  };

  return {
    ordersData,
    loading,
    error,
    refetch
  };
};
