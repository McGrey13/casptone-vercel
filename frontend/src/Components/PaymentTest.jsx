import React from 'react';
import { useCart } from './Cart/CartContext';

const PaymentTest = () => {
  const { checkout } = useCart();

  const handleTestGCash = async () => {
    console.log('Testing GCash payment...');
    try {
      const result = await checkout('gcash');
      console.log('GCash result:', result);
      
      if (result.success && result.redirect) {
        console.log('Should redirect to:', result.checkout_url);
        // Force redirect if automatic redirect didn't work
        if (result.checkout_url) {
          window.location.href = result.checkout_url;
        }
      } else {
        alert('GCash checkout failed: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('GCash error:', error);
      alert('GCash error: ' + error.message);
    }
  };

  const handleTestPayMaya = async () => {
    console.log('Testing PayMaya payment...');
    try {
      const result = await checkout('paymaya');
      console.log('PayMaya result:', result);
      
      if (result.success && result.redirect) {
        console.log('Should redirect to:', result.checkout_url);
        // Force redirect if automatic redirect didn't work
        if (result.checkout_url) {
          window.location.href = result.checkout_url;
        }
      } else {
        alert('PayMaya checkout failed: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('PayMaya error:', error);
      alert('PayMaya error: ' + error.message);
    }
  };

  const handleTestCOD = async () => {
    console.log('Testing COD payment...');
    try {
      const result = await checkout('cod');
      console.log('COD result:', result);
      
      if (result.success) {
        alert('COD checkout successful: ' + result.message);
      } else {
        alert('COD checkout failed: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('COD error:', error);
      alert('COD error: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h2>Payment Test Component</h2>
      <p>Use this component to test payment methods. Check the browser console for detailed logs.</p>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={handleTestGCash}
          style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          Test GCash Payment
        </button>
        
        <button 
          onClick={handleTestPayMaya}
          style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          Test PayMaya Payment
        </button>
        
        <button 
          onClick={handleTestCOD}
          style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          Test COD Payment
        </button>
      </div>
      
      <div style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '5px' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Make sure you have items in your cart</li>
          <li>Click on a payment method button</li>
          <li>Check the browser console for detailed logs</li>
          <li>For GCash/PayMaya, you should be redirected to the payment page</li>
          <li>For COD, you should see a success message</li>
        </ol>
      </div>
    </div>
  );
};

export default PaymentTest;
