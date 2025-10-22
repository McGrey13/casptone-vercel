import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import { useUser } from "../Context/UserContext";
import api, { getToken } from "../../api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { user, isAuthenticated } = useUser();
  const addToCartTimeoutRef = useRef(null);

  const fetchCart = async () => {
    if (!isAuthenticated) {
      console.log("User not authenticated, clearing cart");
      setCartItems([]);
      return;
    }

    try {
      console.log("Fetching cart...", { token: getToken() });
      
      // Add retry logic for timeout errors
      let retries = 3;
      let lastError;
      
      while (retries > 0) {
        try {
          const response = await api.get('/cart');
          console.log("Cart response:", response.data);
          
          const responseData = response.data;
          console.log("Cart data received:", responseData);
          
          let cartData = responseData;
          if (Array.isArray(responseData)) {
            cartData = responseData;
          } else if (Array.isArray(responseData.data)) {
            cartData = responseData.data;
          } else if (responseData.items) {
            cartData = responseData.items;
          }
          
          if (!Array.isArray(cartData)) {
            console.error("Expected array but got:", typeof cartData, cartData);
            setCartItems([]);
            return;
          }

          // Transform backend response to frontend cart item structure
          const formattedCart = cartData.map(item => {
            try {
              if (!item) return null;
              
              console.log("Processing cart item:", item);
              
              const product = item.product || item;
              const cartItemId = item.cart_id || item.id || `temp-${Math.random().toString(36).substr(2, 9)}`;
              const productId = item.product_id || (product ? product.product_id || product.id : null);
              
              if (!productId) {
                console.warn("Invalid cart item - missing product ID:", item);
                return null;
              }
              
              const productName = product.productName || product.name || 'Unknown Product';
              const productImage = product.productImage || product.image || '';
              const price = parseFloat(item.price || product.price || product.productPrice || 0);
              const quantity = parseInt(item.quantity || 1, 10);
              const availableQuantity = parseInt(product.productQuantity || 0, 10);
              const sellerName = item.product?.seller_name || 
                               (product.seller && (product.seller.businessName || 
                               (product.seller.user && product.seller.user.userName))) || 
                               'Unknown Seller';
              
              // Log if product is out of stock
              if (availableQuantity === 0) {
                console.warn(`Product "${productName}" is out of stock (ID: ${productId})`);
              }
              
              return {
                id: cartItemId,
                cartItemId: cartItemId,
                product_id: productId,
                title: productName,
                image: productImage,
                price: price,
                quantity: quantity,
                availableQuantity: availableQuantity, // Add available stock
                isOutOfStock: availableQuantity === 0, // Flag for out of stock items
                total_price: price * quantity,
                artisanName: sellerName,
                seller_name: sellerName,
                product: product // Keep full product data with productQuantity
              };
            } catch (error) {
              console.error("Error processing cart item:", error, item);
              return null;
            }
          }).filter(Boolean); // Remove any null items
          
          console.log("Formatted cart items:", formattedCart);
          setCartItems(formattedCart);
          return; // Success, exit retry loop
        } catch (error) {
          lastError = error;
          console.error(`Error fetching cart (${4-retries}/3):`, error);
          
          if (error.code === 'ECONNABORTED' && retries > 1) {
            // Timeout error, wait and retry
            await new Promise(resolve => setTimeout(resolve, 1000));
            retries--;
          } else {
            break; // Other errors, don't retry
          }
        }
      }
      
      // If we get here, all retries failed
      console.error("All retries failed for cart:", lastError);
      setCartItems([]);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      setCartItems([]);
    }
  };

  // Fetch cart when user authentication state changes
  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, user]);

  // Add product to cart with debounce
  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      const errorMsg = "Please log in to add items to your cart.";
      console.warn(errorMsg);
      return { success: false, error: errorMsg };
    }

    // Clear any existing timeout
    if (addToCartTimeoutRef.current) {
      clearTimeout(addToCartTimeoutRef.current);
    }

    // Return a promise that resolves after a short delay to prevent rapid calls
    return new Promise((resolve) => {
      addToCartTimeoutRef.current = setTimeout(async () => {
        try {
          // Ensure we have a valid product with an ID
          const productId = product.product_id || product.id;
          if (!productId) {
            const errorMsg = 'Invalid product: missing product ID';
            console.error(errorMsg, product);
            resolve({ success: false, error: errorMsg });
            return;
          }
          
          // Ensure quantity is a positive number
          const qty = Math.max(1, parseInt(quantity, 10) || 1);
          
          console.log('Adding to cart:', { product_id: productId, quantity: qty });
          
          // Check if item already exists in cart
          const existingItem = cartItems.find(item => item.product_id === productId);
          if (existingItem) {
            // Update quantity instead of adding new item
            const result = await updateQuantity(productId, existingItem.quantity + qty);
            resolve(result);
            return;
          }
          
          const response = await fetch("/api/cart/add", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
              "Authorization": `Bearer ${getToken()}`,
              "X-Requested-With": "XMLHttpRequest"
            },
            body: JSON.stringify({
              product_id: Number(productId),
              quantity: qty
            }),
          });

          let responseData;
          try {
            responseData = await response.json();
          } catch (e) {
            console.error('Failed to parse JSON response:', e);
            responseData = {};
          }
          
          console.log('Cart API Response:', { 
            status: response.status, 
            statusText: response.statusText,
            data: responseData 
          });

          if (!response.ok) {
            const errorMessage = responseData.message || `Failed to add to cart (${response.status})`;
            console.error('Failed to add to cart:', errorMessage);
            resolve({ success: false, error: errorMessage });
            return;
          }

          console.log('Successfully added to cart:', responseData);
          
          // Refresh the cart to show updated items
          await fetchCart();
          
          resolve({ success: true, data: responseData });
        } catch (error) {
          console.error("Error adding to cart:", error);
          resolve({ success: false, error: error.message || 'Failed to add to cart' });
        }
      }, 300); // 300ms debounce delay
    });
  };

  const updateQuantity = async (productId, quantity) => {
    const item = cartItems.find(i => i.product_id === productId);
    if (!isAuthenticated || !item || !item.cartItemId) {
      console.error('Missing required data for update:', { isAuthenticated, item, productId });
      return;
    }

    if (quantity <= 0) {
      await removeItem(item.cartItemId);
      return;
    }

    try {
      const response = await fetch(`/api/cart/update/${item.cartItemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`,
          "Accept": "application/json"
        },
        body: JSON.stringify({ quantity: Number(quantity) })
      });

      const responseData = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        const errorMessage = responseData.message || 'Failed to update quantity';
        throw new Error(errorMessage);
      }

      // Refresh the cart to ensure consistency
      await fetchCart();
      return { success: true, data: responseData };
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert(error.message || 'Failed to update quantity');
      return { success: false, error: error.message };
    }
  };

  const removeItem = async (cartId) => {
    if (!isAuthenticated || !cartId) {
      console.error('Missing authentication or cart ID:', { isAuthenticated, cartId });
      return { success: false, error: 'Missing required data' };
    }

    try {
      console.log('Removing item from cart:', cartId);
      const response = await fetch(`/api/cart/remove/${cartId}`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
      });

      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.error('Failed to parse response:', e, 'Response:', responseText);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        console.error('Failed to remove item:', response.status, responseData);
        
        if (response.status === 401) {
          window.location.href = '/login';
          return { 
            success: false, 
            error: 'Your session has expired. Please log in again.',
            requiresLogin: true
          };
        }
        
        throw new Error(responseData.message || `Failed to remove item (${response.status})`);
      }

      console.log('Item removed successfully:', responseData);
      
      // Update local cart state
      setCartItems(prevItems => prevItems.filter(item => {
        // Check both cartItemId and id for backward compatibility
        const shouldKeep = item.cartItemId !== cartId && item.id !== cartId;
        if (!shouldKeep) {
          console.log('Removing item from local state:', item);
        }
        return shouldKeep;
      }));
      
      // Show success message
      alert('Item removed from cart');
      
      return { 
        success: true, 
        message: 'Item removed from cart',
        data: responseData
      };
    } catch (error) {
      console.error('Error removing item from cart:', error);
      
      // Show error message
      alert(error.message || 'Failed to remove item from cart');
      
      return {
        success: false,
        error: error.message || 'Failed to remove item from cart'
      };
    }
  };

  const checkout = async (paymentMethod = 'cod', selectedCartItems = null) => {
    if (!isAuthenticated) {
      const errorMsg = "Please log in to proceed to checkout.";
      console.warn(errorMsg);
      return { success: false, error: errorMsg, requiresLogin: true };
    }

    try {
      // Refresh cart data before checkout to get latest stock levels
      console.log('Refreshing cart before checkout...');
      
      // Fetch fresh cart data directly
      const cartResponse = await api.get('/cart');
      const responseData = cartResponse.data;
      let freshCartData = responseData;
      if (Array.isArray(responseData)) {
        freshCartData = responseData;
      } else if (Array.isArray(responseData.data)) {
        freshCartData = responseData.data;
      } else if (responseData.items) {
        freshCartData = responseData.items;
      }
      
      // Format fresh cart data
      const currentCart = freshCartData.map(item => {
        const product = item.product || item;
        return {
          cartItemId: item.cart_id || item.id,
          product_id: item.product_id,
          title: product.productName || 'Unknown Product',
          quantity: parseInt(item.quantity || 1, 10),
          availableQuantity: parseInt(product.productQuantity || 0, 10),
          isOutOfStock: parseInt(product.productQuantity || 0, 10) === 0,
          price: parseFloat(product.productPrice || 0),
        };
      });
      
      // If selectedCartItems provided, filter to only those items
      const itemsToCheckout = selectedCartItems && selectedCartItems.length > 0 
        ? currentCart.filter(item => selectedCartItems.some(selected => selected.cartItemId === item.cartItemId))
        : currentCart;
      
      console.log('Items to checkout:', itemsToCheckout.length, 'out of', currentCart.length);
      console.log('Selected items for checkout:', itemsToCheckout);
      
      // Validate ONLY the items being checked out (not all cart items)
      const outOfStockItems = itemsToCheckout.filter(item => item.isOutOfStock || item.availableQuantity === 0);
      if (outOfStockItems.length > 0) {
        const itemNames = outOfStockItems.map(item => item.title).join(', ');
        const errorMsg = `Cannot checkout: The following item(s) are out of stock: ${itemNames}. Please remove them from your cart.`;
        console.error('Out of stock items:', outOfStockItems);
        alert(errorMsg);
        return { success: false, error: errorMsg };
      }
      
      const insufficientStockItems = itemsToCheckout.filter(item => 
        item.quantity > item.availableQuantity && item.availableQuantity > 0
      );
      if (insufficientStockItems.length > 0) {
        const itemDetails = insufficientStockItems.map(item => 
          `${item.title} (requested: ${item.quantity}, available: ${item.availableQuantity})`
        ).join(', ');
        const errorMsg = `Cannot checkout: Insufficient stock for: ${itemDetails}. Please adjust quantities.`;
        console.error('Insufficient stock items:', insufficientStockItems);
        alert(errorMsg);
        return { success: false, error: errorMsg };
      }

      console.log('Initiating checkout with payment method:', paymentMethod);
      
      // Prepare checkout data
      const checkoutData = {
        payment_method: paymentMethod
      };
      
      // Add selected cart item IDs if specific items were selected
      if (itemsToCheckout.length < currentCart.length) {
        checkoutData.selected_items = itemsToCheckout.map(item => item.cartItemId);
        console.log('Sending selected cart IDs:', checkoutData.selected_items);
      } else {
        console.log('Checking out all cart items (no specific selection)');
      }
      
      // First, create the order with payment method
      const orderResponse = await fetch("/api/cart/checkout", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify(checkoutData),
      });

      const orderResponseText = await orderResponse.text();
      let orderData;
      
      try {
        orderData = orderResponseText ? JSON.parse(orderResponseText) : {};
      } catch (e) {
        console.error('Failed to parse order response:', e, 'Response:', orderResponseText);
        throw new Error('Invalid response from server during order creation');
      }

      if (!orderResponse.ok) {
        console.error('Order creation failed:', orderResponse.status, orderData);
        
        if (orderResponse.status === 401) {
          window.location.href = '/login';
          return { 
            success: false, 
            error: 'Your session has expired. Please log in again.',
            requiresLogin: true
          };
        }
        
        throw new Error(orderData.message || `Order creation failed (${orderResponse.status})`);
      }

      console.log('Order created successfully:', orderData);
      
      // If payment method is GCash or PayMaya, use payment session
      if (paymentMethod === 'gcash' || paymentMethod === 'paymaya') {
        try {
          console.log(`Initiating ${paymentMethod} payment session...`);
          console.log('Order data:', orderData);
          console.log('Order data structure:', {
            hasOrder: !!orderData.order,
            orderTotalAmount: orderData.order?.totalAmount,
            directTotalAmount: orderData.totalAmount,
            directTotal: orderData.total,
            orderID: orderData.order?.orderID || orderData.orderID || orderData.id
          });
          
          const amount = orderData.order?.totalAmount || orderData.totalAmount || orderData.total || 0;
          const orderID = orderData.order?.orderID || orderData.orderID || orderData.id;
          
          if (amount < 100) {
            throw new Error(`Payment amount (${amount}) must be at least 100 PHP. Please add more items to your cart.`);
          }
          
          if (!orderID) {
            throw new Error('Order ID not found in response');
          }
          
          const sessionPayload = {
            amount: amount,
            payment_method: paymentMethod,
            orderID: orderID  // Include order ID so PayMongo metadata contains it
          };
          console.log('Payment session payload:', sessionPayload);
          console.log('OrderID being sent to PayMongo:', orderID);
          
          // Call the payment initiate endpoint (which handles PayMongo)
          const paymentSessionResponse = await fetch("/api/payments/initiate", {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${getToken()}`,
            },
            body: JSON.stringify(sessionPayload)
          });

          if (paymentSessionResponse.ok) {
            const paymentData = await paymentSessionResponse.json();
            console.log('Payment session data:', paymentData);
            
            if (paymentData.success) {
              if (paymentData.checkout_url) {
                // Real PayMongo redirect
                console.log(`Redirecting to ${paymentMethod} PayMongo checkout:`, paymentData.checkout_url);
                
                // DON'T clear the cart yet - wait for payment success
                // The cart will be cleared by the backend after successful payment
                
                // Use a more reliable redirect method to PayMongo
                setTimeout(() => {
                  window.location.replace(paymentData.checkout_url);
                }, 100);
                
                return {
                  success: true,
                  message: `Redirecting to ${paymentMethod} payment via PayMongo...`,
                  redirect: true,
                  checkout_url: paymentData.checkout_url
                };
              } else if (paymentData.redirect_url) {
                // Simulation mode - redirect to orders page
                console.log(`Simulation mode - redirecting to orders:`, paymentData.redirect_url);
                
                // Clear cart for simulation mode
                setCartItems([]);
                
                // Redirect to orders page
                setTimeout(() => {
                  window.location.replace(paymentData.redirect_url);
                }, 100);
                
                return {
                  success: true,
                  message: `Payment processed successfully (simulation mode)`,
                  redirect: true,
                  checkout_url: paymentData.redirect_url
                };
              } else {
                console.error('No redirect URL provided:', paymentData);
                throw new Error('No redirect URL provided in payment response');
              }
            } else {
              console.error('Payment failed:', paymentData);
              throw new Error(paymentData.message || 'Payment failed');
            }
          } else {
            const errorData = await paymentSessionResponse.json().catch(() => ({}));
            throw new Error(errorData.message || `Payment session failed (${paymentSessionResponse.status})`);
          }
        } catch (paymentError) {
          console.error(`Error with ${paymentMethod} payment session:`, paymentError);
          
          // Payment failed - don't clear cart, show error
          return {
            success: false,
            error: paymentError.message || `Failed to process ${paymentMethod} payment`,
            requiresRetry: true
          };
        }
      }
      
      // For COD, clear the cart after successful checkout
      if (paymentMethod === 'cod') {
        setCartItems([]);
        alert('Order placed successfully!');
      }

      return {
        success: true,
        order: orderData.order || orderData,
        message: orderData.message || "Order placed successfully!",
        data: orderData
      };
    } catch (error) {
      console.error("Error during checkout:", error);
      
      // Show error message
      alert(error.message || 'An error occurred during checkout');
      
      return {
        success: false,
        error: error.message || "An error occurred during checkout"
      };
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      console.log("No token found or user not authenticated");
      return;
    }

    try {
      const response = await fetch("/api/cart/clear", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to clear cart.");
      }
      
      // Clear local cart state
      setCartItems([]);
      console.log("Cart cleared successfully");
    } catch (error) {
      console.error("Error clearing cart:", error);
      alert(error.message);
    }
  };

  // Clear cart after successful payment
  const clearCartAfterPayment = () => {
    setCartItems([]);
    console.log('Cart cleared after successful payment');
  };

  // Debug function to test payment methods
  const testPayment = async (paymentMethod) => {
    console.log(`🧪 Testing ${paymentMethod} payment...`);
    const result = await checkout(paymentMethod);
    console.log(`🧪 ${paymentMethod} result:`, result);
    return result;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeItem,   // ✅ matches ShoppingCart
        clearCart,
        clearCartAfterPayment, // Clear cart after successful payment
        checkout,
        testPayment,  // Debug function
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
