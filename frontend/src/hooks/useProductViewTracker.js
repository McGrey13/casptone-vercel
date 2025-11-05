import { useEffect, useRef } from 'react';
import api from '../api';

/**
 * Hook to track product views for AI recommendations
 * Tracks when a user views a product and how long they spend on it
 */
export const useProductViewTracker = (productId) => {
  const viewStartTime = useRef(null);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!productId) return;

    // Track view start time
    viewStartTime.current = Date.now();
    hasTracked.current = false;

    // Track initial view (debounced to avoid multiple requests)
    const trackTimeout = setTimeout(() => {
      trackProductView(productId, 0);
      hasTracked.current = true;
    }, 1000); // Track after 1 second of viewing

    // Track view duration when component unmounts or product changes
    return () => {
      clearTimeout(trackTimeout);
      
      if (hasTracked.current && viewStartTime.current) {
        const duration = Math.floor((Date.now() - viewStartTime.current) / 1000); // Duration in seconds
        
        // Track final view duration (only if user spent significant time)
        if (duration > 5) {
          trackProductView(productId, duration);
        }
      }
    };
  }, [productId]);

  // Function to track product view
  const trackProductView = async (productId, duration = 0) => {
    try {
      await api.post(`/products/${productId}/track-view`, {
        duration,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      // Silently fail - don't interrupt user experience
      console.error('Failed to track product view:', error);
    }
  };

  return { trackProductView };
};




