import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import { useUser } from "../Context/UserContext";
import { Loader2, ShoppingBag, MapPin, User, X } from "lucide-react";
import api from "../../api";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { checkout } = useCart();
  const { user } = useUser();
  const { cartItems = [], subtotal = 0, shipping = 0, tax = 0 } =
    location.state || {};

  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    paymentMethod: "gcash",
  });

  const [couponCode, setCouponCode] = useState("");
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountError, setDiscountError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyDiscount = async () => {
    if (!couponCode.trim()) {
      setDiscountError('Please enter a discount code');
      return;
    }

    // Check if a discount is already applied
    if (appliedDiscount) {
      setDiscountError('Only one discount code can be applied at a time. Remove the current code first.');
      return;
    }

    setApplyingDiscount(true);
    setDiscountError('');
    
    try {
      // Fetch public active discount codes
      const response = await api.get('/public/discount-codes');
      
      if (response.data && Array.isArray(response.data.discount_codes)) {
        const allDiscountCodes = response.data.discount_codes;
        const foundCode = allDiscountCodes.find(dc => 
          dc.code && dc.code.toUpperCase() === couponCode.trim().toUpperCase()
        );

        if (!foundCode) {
          setDiscountError('Invalid discount code');
          return;
        }

        // Check if code is active
        const now = new Date();
        const expiresAt = foundCode.expires_at ? new Date(foundCode.expires_at) : null;
        
        if (expiresAt && expiresAt < now) {
          setDiscountError('This discount code has expired');
          return;
        }

        // Check usage limit
        if (foundCode.usage_limit && foundCode.times_used >= foundCode.usage_limit) {
          setDiscountError('This discount code has reached its usage limit');
          return;
        }

        // Calculate discount amount based on subtotal
        let discountAmount = 0;

        if (foundCode.type === 'percentage' || foundCode.type === 'percent') {
          discountAmount = (subtotal * parseFloat(foundCode.value)) / 100;
        } else if (foundCode.type === 'fixed' || foundCode.type === 'amount') {
          discountAmount = parseFloat(foundCode.value);
        } else {
          // Default to percentage
          discountAmount = (subtotal * parseFloat(foundCode.value || 0)) / 100;
        }

        // Don't allow discount to exceed subtotal
        discountAmount = Math.min(discountAmount, subtotal);

        const appliedDiscountData = {
          code: foundCode.code,
          type: foundCode.type || 'percentage',
          value: foundCode.value,
          amount: discountAmount,
          description: foundCode.description || '',
          discountId: foundCode.id || foundCode.coupons_id
        };

        setAppliedDiscount(appliedDiscountData);
        setCouponCode(foundCode.code);
        
        alert(`Discount code "${foundCode.code}" applied successfully!`);
      } else {
        setDiscountError('Unable to validate discount code');
      }
    } catch (error) {
      console.error('Error applying discount:', error);
      // If the endpoint fails, provide a helpful error message
      if (error.response?.status === 404) {
        setDiscountError('Discount code validation service unavailable. Please try again later.');
      } else {
        setDiscountError(error.response?.data?.message || 'Failed to validate discount code. Please try again.');
      }
    } finally {
      setApplyingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setCouponCode('');
    setDiscountError('');
  };

  // Calculate totals with discount
  const finalSubtotal = subtotal - (appliedDiscount ? appliedDiscount.amount : 0);
  const finalTotal = finalSubtotal + shipping + tax;

  const handlePlaceOrder = async () => {
    if (!user?.userName || !user?.userAddress || !user?.userCity || !user?.userPostalCode) {
      alert('Please complete your profile information (name, address, city, and postal code) before placing an order.');
      navigate('/profile');
      return;
    }

    setIsProcessing(true);
    try {
      console.log('Starting checkout with payment method:', formData.paymentMethod);
      console.log('Selected cart items for checkout:', cartItems.length);
      
      // Call checkout with the selected payment method AND selected items
      const result = await checkout(formData.paymentMethod, cartItems);
      
      console.log('Checkout result:', result);
      
      if (!result || !result.success) {
        throw new Error(result?.error || 'Failed to create order');
      }

      // For online payments (GCash/PayMaya), the CartContext handles PayMongo redirect
      if (formData.paymentMethod === "gcash" || formData.paymentMethod === "paymaya") {
        if (result.redirect) {
          // Show user that they're being redirected to PayMongo
          console.log(`Redirecting to ${formData.paymentMethod.toUpperCase()} payment via PayMongo...`);
          console.log('Checkout URL:', result.checkout_url);
          
          // Show a more informative message
          alert(`Order created successfully! Redirecting to ${formData.paymentMethod.toUpperCase()} payment via PayMongo. Please complete your payment to confirm your order.`);
          
          // The redirect is handled by CartContext
          return;
        } else {
          console.error('Payment redirect failed:', result);
          throw new Error(result.error || "Failed to initiate payment");
        }
      }

      // For COD payments
      if (formData.paymentMethod === "cod") {
        alert('Order created successfully! You will pay cash on delivery. Please wait for our delivery confirmation.');
        navigate('/orders');
        return;
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      alert(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white py-8 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <ShoppingBag className="mx-auto h-24 w-24 text-[#d5bfae] mb-4" />
          <h1 className="text-2xl font-semibold text-[#5c3d28] mb-2">
            Your cart is empty
          </h1>
          <p className="text-[#7b5a3b] mb-6">
            Please add items to your cart before proceeding to checkout.
          </p>
          <Button 
            onClick={() => navigate('/cart')}
            className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white"
          >
            Go to Cart
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-white py-8 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <User className="mx-auto h-24 w-24 text-[#d5bfae] mb-4" />
          <h1 className="text-2xl font-semibold text-[#5c3d28] mb-2">
            Please log in to continue
          </h1>
          <p className="text-[#7b5a3b] mb-6">
            You need to be logged in to complete your checkout.
          </p>
          <Button 
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-[#5c3d28] mb-2">Checkout</h1>
        <p className="text-[#7b5a3b] mb-6">Review your order and proceed to payment</p>

        {/* Order Summary */}
        <Card className="mb-6 shadow-lg border border-[#d5bfae]">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[#5c3d28] flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Order Summary
            </h2>
            {cartItems.map((item, index) => (
              <div
                key={item.id || `cart-item-${index}-${item.product_id || 'unknown'}`}
                className="flex items-center space-x-4 border-b border-[#d5bfae] pb-4 last:border-b-0"
              >
                <div className="w-16 h-16 flex-shrink-0">
                  <img
                    src={item.image ? 
                      (item.image.startsWith('http') ? item.image : `/storage/${item.image}`) 
                      : '/placeholder-product.jpg'}
                    alt={item.title}
                    className="w-full h-full object-cover rounded-lg border-2 border-[#d5bfae]"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-product.jpg';
                    }}
                  />
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="font-bold text-base text-[#5c3d28] mb-1 truncate">
                    {item.title || 'Product Name Not Available'}
                  </h3>
                  {item.seller_name && (
                    <p className="text-sm text-[#7b5a3b] mb-1">
                      Seller: {item.seller_name}
                    </p>
                  )}
                  <p className="text-sm text-[#a4785a]">
                    Quantity: {item.quantity} × ₱{parseFloat(item.price || 0).toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#5c3d28]">
                    ₱{(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}

            {/* Order Totals */}
            <div className="pt-4 space-y-2 border-t border-[#d5bfae]">
              <div className="flex justify-between text-sm py-1">
                <span className="text-[#7b5a3b]">Subtotal</span>
                <span className="font-semibold text-[#5c3d28]">₱{subtotal.toFixed(2)}</span>
              </div>
              {appliedDiscount && (
                <div className="flex justify-between text-sm py-1 bg-green-50 rounded px-2">
                  <span className="text-green-700 font-medium">Discount ({appliedDiscount.code})</span>
                  <span className="text-green-700 font-semibold">-₱{appliedDiscount.amount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm py-1">
                <span className="text-[#7b5a3b]">Shipping</span>
                <span className="font-semibold text-[#5c3d28]">₱{shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span className="text-[#7b5a3b]">Tax</span>
                <span className="font-semibold text-[#5c3d28]">₱{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-3 mt-3 border-t-2 border-[#a4785a]">
                <span className="text-[#5c3d28]">Total</span>
                <span className="text-[#5c3d28]">₱{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Coupon Code Input */}
            <div className="pt-4 border-t border-[#d5bfae]">
              <label className="text-sm font-medium text-[#5c3d28] mb-2 block">
                Discount Coupon
              </label>
              {appliedDiscount ? (
                <div>
                  <div className="flex items-center justify-between bg-green-50 border-2 border-green-300 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-green-700 font-semibold text-sm">
                        ✓ {appliedDiscount.code} Applied
                      </span>
                      <span className="text-green-700 text-sm">
                        -₱{appliedDiscount.amount.toFixed(2)} discount
                      </span>
                    </div>
                    <button
                      onClick={handleRemoveDiscount}
                      className="text-red-600 hover:text-red-700 transition-colors"
                      title="Remove discount"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-[#7b5a3b] mt-2">
                    Only one discount code can be applied per order. Remove this code to apply another.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleApplyDiscount()}
                      placeholder="Enter coupon code"
                      className="flex-grow border-2 border-[#d5bfae] rounded-lg p-3 focus:ring-2 focus:ring-[#a4785a] focus:border-[#a4785a] transition-all"
                      disabled={applyingDiscount}
                    />
                    <Button 
                      variant="outline"
                      onClick={handleApplyDiscount}
                      disabled={applyingDiscount || !couponCode.trim()}
                      className="border-2 border-[#a4785a] text-[#5c3d28] hover:bg-[#a4785a] hover:text-white"
                    >
                      {applyingDiscount ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Apply'
                      )}
                    </Button>
                  </div>
                  {discountError && (
                    <p className="text-red-600 text-sm mt-2">{discountError}</p>
                  )}
                  <p className="text-xs text-[#7b5a3b] mt-2">
                    Only one discount code can be applied per order.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Shipping Info - Read Only */}
        <Card className="mb-6 shadow-lg border border-[#d5bfae]">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#5c3d28] flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#a4785a]" />
                Shipping Information
              </h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/profile')}
                className="text-sm border-2 border-[#a4785a] text-[#5c3d28] hover:bg-[#a4785a] hover:text-white"
              >
                Update Profile
              </Button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#5c3d28] flex items-center gap-2">
                <User className="h-4 w-4 text-[#a4785a]" />
                Full Name
              </label>
              <div className="p-3 bg-[#faf9f8] border-2 border-[#d5bfae] rounded-lg">
                <p className="text-[#5c3d28] font-medium">
                  {user.userName || 'Not provided'}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#5c3d28] flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#a4785a]" />
                Address
              </label>
              <div className="p-3 bg-[#faf9f8] border-2 border-[#d5bfae] rounded-lg">
                <p className="text-[#5c3d28]">
                  {user.userAddress || 'Not provided'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#5c3d28]">
                  City
                </label>
                <div className="p-3 bg-[#faf9f8] border-2 border-[#d5bfae] rounded-lg">
                  <p className="text-[#5c3d28]">
                    {user.userCity || 'Not provided'}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#5c3d28]">
                  Postal Code
                </label>
                <div className="p-3 bg-[#faf9f8] border-2 border-[#d5bfae] rounded-lg">
                  <p className="text-[#5c3d28]">
                    {user.userPostalCode || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
            {(!user.userName || !user.userAddress || !user.userCity || !user.userPostalCode) && (
              <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-lg">
                <p className="text-amber-800 text-sm">
                  ⚠️ Please complete your profile information to proceed with checkout. 
                  Click "Update Profile" to add missing information.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card className="mb-6 shadow-lg border border-[#d5bfae]">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[#5c3d28] flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-[#a4785a]" />
              Payment Method
            </h2>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="w-full border-2 border-[#d5bfae] rounded-lg p-3 focus:ring-2 focus:ring-[#a4785a] focus:border-[#a4785a] transition-all text-[#5c3d28]"
            >
              <option value="gcash">GCash</option>
              <option value="paymaya">PayMaya</option>
              <option value="cod">Cash on Delivery (COD)</option>
            </select>
          </CardContent>
        </Card>

        <Button
          className="w-full py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all"
          style={{
            background: "linear-gradient(90deg, #a4785a, #7b5a3b)",
            color: "white",
          }}
          onClick={handlePlaceOrder}
          disabled={isProcessing || !user.userName || !user.userAddress || !user.userCity || !user.userPostalCode}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Order...
            </>
          ) : (
            <>
              <ShoppingBag className="mr-2 h-5 w-5" />
              Place Order
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Checkout;
