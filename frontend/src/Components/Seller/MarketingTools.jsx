import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Megaphone,
  Mail,
  Gift,
  Tag,
  TrendingUp,
  X,
  Loader2,
  Copy,
  Trash2,
  RefreshCw,
  Share2,
  Star
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import api from "../../api";
import SellerAnalytics from "./SellerAnalytics";

const MarketingTools = () => {
  const [activeTab, setActiveTab] = useState('discounts');
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [sellerId, setSellerId] = useState(null);

  // Fetch seller information
  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const response = await api.get('/sellers/profile');
        if (response.data) {
          setSellerId(response.data.sellerID);
        }
      } catch (error) {
        console.error('Error fetching seller data:', error);
      }
    };

    fetchSellerData();
  }, []);

const fetchProducts = async () => {
  try {
    setIsLoadingProducts(true);
    const response = await api.get('/seller/products');

    if (response.data) {
      const data = response.data;
      
      // Ensure each product has the correct ID field
      const processedData = Array.isArray(data) ? data.map(product => ({
        ...product,
        id: product.product_id || product.id // Ensure we have a consistent ID field
      })) : [];
      
      setProducts(processedData);
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    alert(error.message || 'Failed to load products');
  } finally {
    setIsLoadingProducts(false);
  }
};

  const toggleFeatured = async (productId, currentStatus) => {
    if (!productId) {
      console.error('Product ID is undefined');
      alert('Invalid product ID');
      return;
    }

    try {
      const response = await api.post(`/products/${productId}/toggle-featured`, {});

      if (response.data) {
        console.log('Toggle featured response:', response.data);

        // Update the local state to reflect the change
        setProducts(prevProducts => prevProducts.map(product => 
          product.id === productId 
            ? { ...product, is_featured: !currentStatus } 
            : product
        ));

        // Show success message
        alert('Product featured status updated successfully');
      }
    } catch (error) {
      console.error('Error toggling featured status:', error);
      alert(error.message || 'Failed to update featured status');
    }
  };

  useEffect(() => {
    fetchDiscounts();
    if (activeTab === 'featured') {
      fetchProducts();
    }
  }, [activeTab]);

  const fetchDiscounts = async () => {
    try {
      setIsLoading(true);
      
      console.log('Fetching discount codes...');
      const response = await api.get('/discount-codes');
      
      console.log('Discount codes response status:', response.status);
      
      if (response.data) {
        const responseData = response.data;
        console.log('Raw API response:', responseData);
        
        // Handle different response formats
        let discountsData = [];
        if (Array.isArray(responseData)) {
          discountsData = responseData;
        } else if (responseData.data && Array.isArray(responseData.data)) {
          discountsData = responseData.data;
        } else if (responseData.discounts && Array.isArray(responseData.discounts)) {
          discountsData = responseData.discounts;
        }
        
        console.log('Processed discounts data:', discountsData);
        setDiscounts(discountsData);
      }
    } catch (error) {
      console.error('Error in fetchDiscounts:', error);
      // Only show error to user if it's not an auth error (handled by auth flow)
      if (!error.message.includes('401') && !error.message.includes('auth_token')) {
        alert(`Error loading discount codes: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDiscount = async (e) => {
    e.preventDefault();
    
    if (!discountCode || !discountAmount) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);

      const response = await api.post('/discount-codes', {
        code: discountCode.trim(),
        type: 'percentage',
        value: parseFloat(discountAmount),
        usage_limit: usageLimit ? parseInt(usageLimit) : null,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      });

      if (response.data) {
        const responseData = response.data;

        // Add the new discount to the list
        setDiscounts(prevDiscounts => [responseData, ...prevDiscounts]);
        
        // Reset form
        setDiscountCode('');
        setDiscountAmount('');
        setUsageLimit('');
        
        // Show success message
        alert(`Discount code "${responseData.code}" created successfully!`);
      }
    } catch (error) {
      console.error('Error creating discount code:', error);
      alert(`Error: ${error.message || 'Failed to create discount code. Please try again.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDiscount = async (id) => {
    if (!window.confirm('Are you sure you want to delete this discount code?')) {
      return;
    }

    try {
      const response = await api.delete(`/discount-codes/${id}`);

      if (response.data) {
        setDiscounts(discounts.filter(discount => discount.id !== id));
        alert('Discount code deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting discount code:', error);
      alert('Failed to delete discount code');
    }
  };
  return (
    <div className="space-y-6">
      {/* Header with craft theme */}
      <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-white flex items-center">
          <Megaphone className="h-8 w-8 mr-3" />
          Marketing Tools
        </h1>
        <p className="text-white/90 mt-2 text-lg">
          Promote your products and grow your sales with powerful marketing features
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-[#faf9f8] border-2 border-[#e5ded7] p-1 rounded-xl shadow-md">
          <TabsTrigger 
            value="discounts"
            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#a4785a] data-[state=active]:to-[#7b5a3b] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 font-medium"
          >
            Discount Codes
          </TabsTrigger>
          <TabsTrigger 
            value="featured"
            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#a4785a] data-[state=active]:to-[#7b5a3b] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 font-medium"
          >
            Featured Products
          </TabsTrigger>
          <TabsTrigger 
            value="analytics"
            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#a4785a] data-[state=active]:to-[#7b5a3b] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 font-medium"
          >
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="featured" className="space-y-6 pt-6">
          <Card className="border-[#e5ded7] shadow-xl">
            <CardHeader className="border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white">
              <CardTitle className="text-[#5c3d28] flex items-center">
                <Star className="h-5 w-5 mr-2 text-[#a4785a]" />
                Featured Products
              </CardTitle>
              <CardDescription className="text-[#7b5a3b]">
                Select products to feature on your storefront
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoadingProducts ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#a4785a]/10 to-[#7b5a3b]/10 flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-[#a4785a]" />
                  </div>
                  <p className="text-[#5c3d28] font-semibold text-lg">No products found</p>
                  <p className="text-sm text-[#7b5a3b] mt-2">Please add some products first</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {products.map((product) => (
                    <div
                      key={product.id || product.product_id}
                      className="flex items-center justify-between p-5 border-2 border-[#e5ded7] rounded-xl hover:border-[#a4785a] hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-[#faf9f8]"
                    >
                      <div className="flex items-center space-x-4">
                        {product.productImage ? (
                          <img 
                            src={product.productImage} 
                            alt={product.productName}
                            className="h-16 w-16 object-cover rounded-xl border-2 border-[#e5ded7] shadow-sm"
                          />
                        ) : (
                          <div className="h-16 w-16 bg-gradient-to-br from-[#faf9f8] to-[#e5ded7] rounded-xl flex items-center justify-center border-2 border-[#e5ded7]">
                            <Star className="h-6 w-6 text-[#a4785a]" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-[#5c3d28]">{product.productName}</div>
                          <div className="text-sm text-[#7b5a3b] mt-1">
                            {product.category} • <span className="font-semibold">₱{product.productPrice}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant={product.is_featured ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleFeatured(product.id || product.product_id, product.is_featured)}
                        disabled={isLoadingProducts}
                        className={product.is_featured 
                          ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-md hover:shadow-lg transition-all duration-200" 
                          : "border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] hover:border-[#a4785a] transition-all duration-200"}
                      >
                        {product.is_featured ? (
                          <>
                            <Star className="h-4 w-4 mr-2 fill-white"/>
                            Featured
                          </>
                        ) : (
                          <>
                            <Star className="h-4 w-4 mr-2" />
                            Feature
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discounts" className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 border-[#e5ded7] shadow-xl">
              <CardHeader className="border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white">
                <CardTitle className="flex items-center text-[#5c3d28]">
                  <Gift className="h-5 w-5 mr-2 text-[#a4785a]" />
                  Create Discount Code
                </CardTitle>
                <CardDescription className="text-[#7b5a3b]">
                  Create a new discount code for your customers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <form onSubmit={handleCreateDiscount} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Discount Code</Label>
                    <div className="flex items-center">
                      <Input 
                        id="code" 
                        placeholder="SUMMER25" 
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                        className="font-mono tracking-wider"
                        required
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="ml-2"
                        onClick={() => {
                          // Generate a random 8-character code
                          const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
                          let result = '';
                          for (let i = 0; i < 8; i++) {
                            result += chars.charAt(Math.floor(Math.random() * chars.length));
                          }
                          setDiscountCode(result);
                        }}
                      >
                        Generate
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discount-amount">Discount Value (%)</Label>
                    <div className="relative">
                      <Input 
                        id="discount-amount" 
                        type="number" 
                        min="1" 
                        max="100"
                        placeholder="25" 
                        value={discountAmount}
                        onChange={(e) => {
                          const value = Math.min(100, Math.max(1, parseInt(e.target.value) || 1));
                          setDiscountAmount(value);
                        }}
                        className="pl-8"
                        required
                      />
                      <span className="absolute left-3 top-2.5 text-gray-500">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="usage-limit">Usage Limit (optional)</Label>
                    <Input 
                      id="usage-limit" 
                      type="number" 
                      min="1"
                      placeholder="Leave empty for unlimited" 
                      value={usageLimit}
                      onChange={(e) => setUsageLimit(e.target.value ? Math.max(1, parseInt(e.target.value) || 1) : '')}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {usageLimit ? `Code can be used ${usageLimit} time${usageLimit > 1 ? 's' : ''}` : 'No usage limit set'}
                    </p>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full mt-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white shadow-md hover:shadow-lg transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : 'Create Discount Code'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#e5ded7] shadow-xl">
              <CardHeader className="border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-[#5c3d28] flex items-center">
                      <Tag className="h-5 w-5 mr-2 text-[#a4785a]" />
                      Active Discounts
                    </CardTitle>
                    <CardDescription className="text-[#7b5a3b]">
                      {discounts.length} active code{discounts.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchDiscounts}
                    disabled={isLoading}
                    className="border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] hover:border-[#a4785a] transition-all duration-200"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {isLoading && discounts.length === 0 ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : discounts.length > 0 ? (
                  <TooltipProvider>
                    <div className="space-y-3">
                    {discounts.map((discount) => (
                      <div 
                        key={discount.id}
                        className={`flex items-center justify-between p-5 border-2 rounded-xl transition-all duration-200 ${
                          discount.is_active 
                            ? 'border-[#e5ded7] bg-gradient-to-r from-white to-[#faf9f8] hover:border-[#a4785a] hover:shadow-md' 
                            : 'border-gray-200 bg-gray-50 opacity-75'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-mono font-bold text-lg text-[#5c3d28]">{discount.code}</p>
                            <span className={`px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm ${
                              discount.is_active ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {discount.is_active ? '✓ Active' : '✕ Expired'}
                            </span>
                          </div>
                          <p className="text-sm text-[#7b5a3b] mt-2 font-medium">
                            {discount.value}% off {discount.type === 'fixed' ? 'fixed' : ''}
                          </p>
                          
                          {discount.expires_at && (
                            <p className="text-xs text-[#7b5a3b] mt-2 flex items-center">
                              <span className="mr-1">📅</span>
                              Expires: {new Date(discount.expires_at).toLocaleDateString()}
                            </p>
                          )}
                          
                          {discount.usage_limit ? (
                            <div className="mt-3">
                              <div className="w-full bg-[#e5ded7] rounded-full h-2.5 overflow-hidden">
                                <div 
                                  className={`h-2.5 rounded-full transition-all duration-300 ${
                                    discount.is_active ? 'bg-gradient-to-r from-[#a4785a] to-[#7b5a3b]' : 'bg-gray-400'
                                  }`}
                                  style={{ 
                                    width: `${Math.max(5, (discount.remaining_uses / discount.usage_limit) * 100)}%`
                                  }}
                                />
                              </div>
                              <p className="text-xs text-[#7b5a3b] mt-1.5 font-medium">
                                {discount.remaining_uses} of {discount.usage_limit} uses remaining
                              </p>
                            </div>
                          ) : (
                            <p className="text-xs text-green-600 mt-2 font-semibold flex items-center">
                              <span className="mr-1">∞</span> Unlimited uses
                            </p>
                          )}
                          
                          <p className="text-xs text-[#7b5a3b]/70 mt-2">
                            Created: {new Date(discount.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <div className="flex space-x-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 p-0 hover:bg-[#f8f1ec] text-[#a4785a] hover:text-[#5c3d28] transition-all duration-200 rounded-lg"
                                  onClick={() => {
                                    navigator.clipboard.writeText(discount.code);
                                    // Could add a toast notification here
                                    alert(`Copied ${discount.code} to clipboard`);
                                  }}
                                >
                                  <Copy className="h-4 w-4" />
                                  <span className="sr-only">Copy code</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy code</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 p-0 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                  onClick={async () => {
                                    if (window.confirm(`Are you sure you want to delete discount code ${discount.code}? This action cannot be undone.`)) {
                                      setIsLoading(true);
                                      try {
                                        const response = await api.delete(`/discount-codes/${discount.id}`);
                                        
                                        if (response.data) {
                                          // Show success message
                                          alert(`Discount code ${discount.code} has been deleted`);
                                          
                                          // Refresh the list
                                          fetchDiscounts();
                                        }
                                      } catch (error) {
                                        console.error('Error deleting discount code:', error);
                                        alert(error.message || 'Failed to delete discount code');
                                      } finally {
                                        setIsLoading(false);
                                      }
                                    }
                                  }}
                                  disabled={isLoading}
                                >
                                  {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                  <span className="sr-only">Delete code</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete code</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          
                          {discount.is_active && discount.remaining_uses > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-8 border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] hover:border-[#a4785a] transition-all duration-200 shadow-sm"
                                  onClick={() => {
                                    // Handle share functionality
                                    const shareUrl = `${window.location.origin}/checkout?discount=${encodeURIComponent(discount.code)}`;
                                    navigator.clipboard.writeText(shareUrl);
                                    alert(`Shareable link copied to clipboard!`);
                                  }}
                                >
                                  <Share2 className="h-3 w-3 mr-1" /> Share
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy shareable link</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    ))}
                    </div>
                  </TooltipProvider>
                ) : (
                  <div className="text-center py-12 px-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#a4785a]/10 to-[#7b5a3b]/10 flex items-center justify-center mx-auto mb-4">
                      <Gift className="h-8 w-8 text-[#a4785a]" />
                    </div>
                    <p className="text-[#5c3d28] font-semibold text-lg">No active discount codes</p>
                    <p className="text-sm text-[#7b5a3b] mt-2">Create your first discount code to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 pt-4">
          <SellerAnalytics sellerId={sellerId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketingTools;
