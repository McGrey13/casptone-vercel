// Example of how to use the checkout function with payment methods

import React from 'react';
import { useCart } from './Components/Cart/CartContext';

const CheckoutComponent = () => {
  const { checkout } = useCart();

  const handleGCashCheckout = async () => {
    console.log('Initiating GCash checkout...');
    const result = await checkout('gcash');
    
    if (result.success) {
      if (result.redirect) {
        console.log('Redirecting to GCash payment...');
        // The user will be automatically redirected to the checkout URL
        // No need to do anything else here
      } else {
        console.log('GCash checkout completed:', result.message);
      }
    } else {
      console.error('GCash checkout failed:', result.error);
      alert('Checkout failed: ' + result.error);
    }
  };

  const handlePayMayaCheckout = async () => {
    console.log('Initiating PayMaya checkout...');
    const result = await checkout('paymaya');
    
    if (result.success) {
      if (result.redirect) {
        console.log('Redirecting to PayMaya payment...');
        // The user will be automatically redirected to the checkout URL
      } else {
        console.log('PayMaya checkout completed:', result.message);
      }
    } else {
      console.error('PayMaya checkout failed:', result.error);
      alert('Checkout failed: ' + result.error);
    }
  };

  const handleCODCheckout = async () => {
    console.log('Initiating COD checkout...');
    const result = await checkout('cod'); // or just checkout()
    
    if (result.success) {
      console.log('COD checkout completed:', result.message);
      alert('Order placed successfully!');
    } else {
      console.error('COD checkout failed:', result.error);
      alert('Checkout failed: ' + result.error);
    }
  };

  return (
    <div>
      <h2>Choose Payment Method</h2>
      
      <button onClick={handleGCashCheckout}>
        Pay with GCash
      </button>
      
      <button onClick={handlePayMayaCheckout}>
        Pay with PayMaya
      </button>
      
      <button onClick={handleCODCheckout}>
        Cash on Delivery
      </button>
    </div>
  );
};

export default CheckoutComponent;
