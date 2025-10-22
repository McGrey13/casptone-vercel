import React, { useState } from "react";
import { useCart } from "./CartContext";
import { Minus, Plus, Trash2, ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { useNavigate } from "react-router-dom";

const PALETTE = {
  sand: "#e5ded7",
  warmText: "#7a5c52",
  brown: "#a36b4f",
  gold: "#e6b17e",
};

const ShoppingCart = () => {
  const { cartItems, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState([]); // track selected items

  // Toggle item selection
  const handleCheck = (id) => {
    // Find the item to check if it's out of stock
    const item = cartItems.find(item => item.cartItemId === id);
    
    // Prevent selecting out of stock items
    if (item && item.isOutOfStock) {
      alert(`Sorry, "${item.title}" is currently out of stock and cannot be selected for checkout.`);
      return;
    }
    
    // Check if quantity exceeds available stock
    if (item && item.availableQuantity > 0 && item.quantity > item.availableQuantity) {
      alert(`Sorry, only ${item.availableQuantity} units of "${item.title}" are available. Please reduce the quantity before checkout.`);
      return;
    }
    
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  // Select all toggle
  const handleSelectAll = () => {
    // Filter out out-of-stock items and items with quantity exceeding available stock
    const selectableItems = cartItems.filter(item => 
      !item.isOutOfStock && 
      item.quantity <= item.availableQuantity
    );
    
    const allSelectableSelected = selectableItems.every(item => 
      selectedItems.includes(item.cartItemId)
    );
    
    if (allSelectableSelected) {
      // Deselect all
      setSelectedItems([]);
    } else {
      // Select all selectable items
      setSelectedItems(selectableItems.map((item) => item.cartItemId));
      
      // Show info if some items were skipped
      const outOfStockCount = cartItems.filter(item => item.isOutOfStock).length;
      const exceededStockCount = cartItems.filter(item => 
        !item.isOutOfStock && item.quantity > item.availableQuantity
      ).length;
      
      if (outOfStockCount > 0 || exceededStockCount > 0) {
        let message = 'Selected all available items. ';
        if (outOfStockCount > 0) {
          message += `${outOfStockCount} out-of-stock item(s) skipped. `;
        }
        if (exceededStockCount > 0) {
          message += `${exceededStockCount} item(s) with insufficient stock skipped.`;
        }
        alert(message);
      }
    }
  };

  // Compute totals only for selected items
  const selectedCartItems = cartItems.filter((item) =>
    selectedItems.includes(item.cartItemId)
  );

  const subtotal = selectedCartItems.reduce(
    (sum, item) => sum + parseFloat(item.price || 0) * item.quantity,
    0
  );
  const shipping = selectedCartItems.length > 0 ? 9.99 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  // Proceed to checkout
  const handleProceedToCheckout = () => {
    if (selectedCartItems.length === 0) {
      alert("Please select at least one item to checkout.");
      return;
    }

    navigate("/checkout", {
      state: {
        cartItems: selectedCartItems,
        subtotal,
        shipping,
        tax,
        total,
      },
    });
  };

  // Continue shopping
  const handleContinueShopping = () => {
    navigate("/products");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center text-[#4b3832]">
              <ShoppingBag className="mr-3 h-8 w-8" />
              Shopping Cart
            </h1>
            <p className="text-[#7a5c52]">
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart
            </p>
          </div>
          {cartItems.length > 0 && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedItems.length === cartItems.length}
                onChange={handleSelectAll}
                className="h-5 w-5 accent-[#a36b4f]"
              />
              <span className="text-sm text-[#7a5c52]">Select All</span>
            </label>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="mx-auto h-24 w-24 text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-6">
              Add some beautiful handcrafted items to get started!
            </p>
            <Button size="lg" onClick={handleContinueShopping}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card
                  key={item.cartItemId}
                  className={`bg-white rounded-xl shadow-sm border ${
                    item.isOutOfStock ? 'border-red-200 bg-red-50/30' : 'border-[#e5ded7]'
                  }`}
                >
                  <CardContent className="p-6">
                    {/* Out of Stock Banner */}
                    {item.isOutOfStock && (
                      <div className="mb-3 px-3 py-2 bg-red-100 border border-red-300 rounded-lg">
                        <p className="text-sm font-semibold text-red-700 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          This product is currently out of stock and cannot be purchased
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-start space-x-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.cartItemId)}
                        onChange={() => handleCheck(item.cartItemId)}
                        disabled={item.isOutOfStock || item.quantity > item.availableQuantity}
                        className="h-5 w-5 mt-2 accent-[#a36b4f] disabled:opacity-50 disabled:cursor-not-allowed"
                        title={item.isOutOfStock ? 'Out of stock - cannot select' : item.quantity > item.availableQuantity ? 'Insufficient stock - reduce quantity' : 'Select item'}
                      />

                      {/* Product Image */}
                      <div className="w-20 h-20 flex-shrink-0">
                        <img
                          src={
                            item.image
                              ? item.image.startsWith("http")
                                ? item.image
                                : `/storage/${item.image}`
                              : "/placeholder-product.jpg"
                          }
                          alt={item.title}
                          className="w-full h-full object-cover rounded-lg border border-[#e5ded7]"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/placeholder-product.jpg";
                          }}
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-grow">
                        <h3 className="font-semibold text-lg text-[#4b3832] mb-1">
                          {item.title || "Product Name Not Available"}
                        </h3>
                        {item.seller_name && (
                          <p className="text-[#7a5c52] text-sm mb-1">
                            Seller: {item.seller_name}
                          </p>
                        )}
                        {/* Stock Information */}
                        {item.product && item.product.productQuantity !== undefined && (
                          <div className="flex items-center mb-2">
                            <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <span className={`text-xs font-medium ${
                              item.product.productQuantity > 10 ? 'text-green-600' : 
                              item.product.productQuantity > 0 ? 'text-orange-600' : 
                              'text-red-600'
                            }`}>
                              {item.product.productQuantity > 0 
                                ? `${item.product.productQuantity} available` 
                                : 'Out of stock'}
                            </span>
                            {item.product.productQuantity > 0 && item.product.productQuantity <= 10 && (
                              <span className="ml-2 text-xs text-orange-600 font-semibold">
                                Low stock!
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <p className="font-bold text-lg text-[#a36b4f]">
                            ₱{parseFloat(item.price || 0).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.quantity} × ₱
                            {parseFloat(item.price || 0).toFixed(2)} = ₱
                            {(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() =>
                            updateQuantity(item.product_id, Math.max(1, item.quantity - 1))
                          }
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => {
                            const availableStock = item.product?.productQuantity || 999;
                            if (item.quantity >= availableStock) {
                              alert(`Maximum available stock is ${availableStock} items.`);
                              return;
                            }
                            updateQuantity(item.product_id, item.quantity + 1);
                          }}
                          disabled={item.product && item.quantity >= item.product.productQuantity}
                          title={item.product && item.quantity >= item.product.productQuantity ? 'Maximum stock reached' : 'Increase quantity'}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => removeItem(item.cartItemId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div
                className="bg-white rounded-2xl p-6 shadow-sm sticky top-6"
                style={{ border: `1px solid ${PALETTE.sand}` }}
              >
                <h4
                  className="text-lg mb-4 font-semibold"
                  style={{ color: PALETTE.warmText }}
                >
                  Order summary
                </h4>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>
                      Subtotal ({selectedCartItems.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                      items)
                    </span>
                    <span>₱{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping > 0 ? `₱${shipping.toFixed(2)}` : "Free"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8%)</span>
                    <span>₱{tax.toFixed(2)}</span>
                  </div>

                  <div className="border-t pt-4" style={{ borderColor: PALETTE.sand }}>
                    <div className="flex justify-between items-baseline">
                      <span
                        className="text-base font-semibold"
                        style={{ color: PALETTE.warmText }}
                      >
                        Total
                      </span>
                      <span className="text-2xl font-bold" style={{ color: PALETTE.gold }}>
                        ₱{total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button
                    className="w-full py-3 rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${PALETTE.brown}, ${PALETTE.gold})`,
                      color: "white",
                      fontWeight: 700,
                    }}
                    onClick={handleProceedToCheckout}
                    disabled={selectedItems.length === 0}
                  >
                    Proceed to checkout
                  </Button>

                  <Button
                    className="w-full py-2 rounded-full"
                    variant="outline"
                    style={{
                      borderColor: PALETTE.sand,
                      color: PALETTE.warmText,
                      background: "white",
                    }}
                    onClick={handleContinueShopping}
                  >
                    Continue shopping
                  </Button>
                </div>

                <p className="mt-4 text-xs text-gray-500">
                  Secure checkout · Free returns within 14 days
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingCart;
