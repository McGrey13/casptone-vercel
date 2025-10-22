import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import { useUser } from "../Context/UserContext";
import { Loader2, ShoppingBag, MapPin, User } from "lucide-react";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { checkout } = useCart();
  const { user } = useUser();
  const { cartItems = [], subtotal = 0, shipping = 0, tax = 0, total = 0 } =
    location.state || {};

  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    paymentMethod: "gcash",
  });

  const [couponCode, setCouponCode] = useState(""); // 👈 new state for coupon

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
      <div className="min-h-screen flex flex-col bg-gray-50 py-8 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <ShoppingBag className="mx-auto h-24 w-24 text-gray-300 mb-4" />
          <h1 className="text-2xl font-semibold text-gray-600 mb-2">
            Your cart is empty
          </h1>
          <p className="text-gray-500 mb-6">
            Please add items to your cart before proceeding to checkout.
          </p>
          <Button onClick={() => navigate('/cart')}>
            Go to Cart
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 py-8 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <User className="mx-auto h-24 w-24 text-gray-300 mb-4" />
          <h1 className="text-2xl font-semibold text-gray-600 mb-2">
            Please log in to continue
          </h1>
          <p className="text-gray-500 mb-6">
            You need to be logged in to complete your checkout.
          </p>
          <Button onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-[#4b3832] mb-6">Checkout</h1>

        {/* Order Summary */}
        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[#7a5c52]">Order Summary</h2>
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center space-x-4 border-b pb-4 last:border-b-0"
              >
                <div className="w-16 h-16 flex-shrink-0">
                  <img
                    src={item.image ? 
                      (item.image.startsWith('http') ? item.image : `/storage/${item.image}`) 
                      : '/placeholder-product.jpg'}
                    alt={item.title}
                    className="w-full h-full object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-product.jpg';
                    }}
                  />
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="font-bold text-base text-[#4b3832] mb-1 truncate">
                    {item.title || 'Product Name Not Available'}
                  </h3>
                  {item.seller_name && (
                    <p className="text-sm text-[#7a5c52] mb-1">
                      Seller: {item.seller_name}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity} × ₱{parseFloat(item.price || 0).toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#4b3832]">
                    ₱{(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}

            {/* Order Totals */}
            <div className="pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₱{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>₱{shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>₱{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t">
                <span>Total</span>
                <span>₱{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Coupon Code Input */}
            <div className="pt-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Discount Coupon
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="flex-grow border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#a36b4f] focus:border-transparent"
                />
                <Button variant="outline">
                  Apply
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Info - Read Only */}
        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#7a5c52] flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Information
              </h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/profile')}
                className="text-sm"
              >
                Update Profile
              </Button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name
              </label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-900 font-medium">
                  {user.userName || 'Not provided'}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Address
              </label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-900">
                  {user.userAddress || 'Not provided'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  City
                </label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-gray-900">
                    {user.userCity || 'Not provided'}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Postal Code
                </label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-gray-900">
                    {user.userPostalCode || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
            {(!user.userName || !user.userAddress || !user.userCity || !user.userPostalCode) && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Please complete your profile information to proceed with checkout. 
                  Click "Update Profile" to add missing information.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[#7a5c52]">Payment Method</h2>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#a36b4f] focus:border-transparent"
            >
              <option value="gcash">GCash</option>
              <option value="paymaya">PayMaya</option>
              <option value="cod">Cash on Delivery (COD)</option>
            </select>
          </CardContent>
        </Card>

        <Button
          className="w-full py-3 rounded-full font-bold"
          style={{
            background: "linear-gradient(90deg, #a36b4f, #e6b17e)",
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
            'Place Order'
          )}
        </Button>
      </div>
    </div>
  );
};

export default Checkout;
