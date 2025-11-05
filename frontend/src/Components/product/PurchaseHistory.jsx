import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Calendar, Package, DollarSign, Star, TrendingUp } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import api from "../../api";
import { useUser } from "../Context/UserContext";

const PurchaseHistory = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      fetchPurchaseHistory();
    } else {
      setError("Please log in to view your purchase history");
      setLoading(false);
    }
  }, [user]);

  const fetchPurchaseHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/recommendations/purchase-history', {
        params: { limit: 100 },
      });
      
      if (response.data.success && response.data.purchases) {
        setPurchases(response.data.purchases);
      } else {
        setPurchases([]);
      }
    } catch (err) {
      console.error('Error fetching purchase history:', err);
      if (err.response?.status === 401) {
        setError('Please log in to view your purchase history');
      } else {
        setError('Failed to load purchase history');
      }
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert image URLs
  const fixImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) {
      return url;
    }
    let cleanPath = url;
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }
    return `https://craftconnect-laravel-backend-1.onrender.com/${cleanPath}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9F2936] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading purchase history...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">{error}</h3>
            <Button 
              onClick={() => navigate('/login')} 
              className="mt-4 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b]"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingBag className="h-8 w-8 text-[#9F2936]" />
            <h1 className="text-3xl font-bold text-gray-900">My Purchase History</h1>
          </div>
          <p className="text-gray-600">
            View all products you've purchased. This helps us provide better recommendations.
          </p>
          {purchases.length > 0 && (
            <div className="mt-4 flex gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>{purchases.length} unique products</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span>Total: ₱{purchases.reduce((sum, p) => sum + (p.total_amount_spent || 0), 0).toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Purchase List */}
        {purchases.length === 0 ? (
          <Card className="p-12 text-center">
            <CardContent>
              <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Purchase History</h3>
              <p className="text-gray-500 mb-6">
                You haven't purchased any products yet. Start shopping to see your purchase history here!
              </p>
              <Button 
                onClick={() => navigate('/products')}
                className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b]"
              >
                Browse Products
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchases.map((purchase) => (
              <Card 
                key={purchase.id} 
                className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(`/product/${purchase.id}`)}
              >
                {/* Product Image */}
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  {purchase.productImage ? (
                    <img
                      src={fixImageUrl(purchase.productImage)}
                      alt={purchase.productName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    Purchased
                  </div>
                </div>

                <CardContent className="p-4">
                  {/* Product Name */}
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-gray-900">
                    {purchase.productName}
                  </h3>

                  {/* Seller Info */}
                  {purchase.seller?.user?.userName && (
                    <p className="text-sm text-gray-600 mb-3">
                      by {purchase.seller.store?.store_name || purchase.seller.user.userName}
                    </p>
                  )}

                  {/* Rating */}
                  {purchase.average_rating > 0 && (
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-semibold">{purchase.average_rating}</span>
                      <span className="text-xs text-gray-500">({purchase.reviews_count})</span>
                    </div>
                  )}

                  {/* Purchase Stats */}
                  <div className="space-y-2 mb-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        Quantity:
                      </span>
                      <span className="font-semibold text-gray-900">{purchase.total_quantity_purchased}x</span>
                    </div>
                    
                    {purchase.purchase_count > 1 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Purchased:
                        </span>
                        <span className="font-semibold text-gray-900">{purchase.purchase_count} times</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        Total Spent:
                      </span>
                      <span className="font-semibold text-[#9F2936]">₱{purchase.total_amount_spent.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Purchase Dates */}
                  <div className="space-y-1 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>First: {formatDate(purchase.first_purchased_at)}</span>
                    </div>
                    {purchase.last_purchased_at !== purchase.first_purchased_at && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>Last: {formatDate(purchase.last_purchased_at)}</span>
                      </div>
                    )}
                  </div>

                  {/* Category Badge */}
                  {purchase.category && (
                    <div className="mt-3">
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {purchase.category}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Box */}
        {purchases.length > 0 && (
          <Card className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-6 w-6 text-purple-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">How This Helps</h3>
                  <p className="text-sm text-gray-700">
                    Your purchase history helps our AI recommendation system suggest products you'll love. 
                    The more you shop, the better our recommendations become! This data is used to personalize 
                    your shopping experience across the platform.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PurchaseHistory;




