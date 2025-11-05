import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Star, ShoppingCart, Heart } from "lucide-react";
import { Button } from "../ui/button";
import api from "../../api";
import { useCart } from "../Cart/CartContext";
import { useFavorites } from "../favorites/FavoritesContext";
import ProductCard from "./ProductCard";

const Recommendations = ({ title = "Recommended For You", subtitle = "Based on your browsing and purchase history", limit = 12 }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { favorites, toggleFavorite } = useFavorites();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/recommendations', {
        params: { limit },
      });
      
      if (response.data.success && response.data.recommendations) {
        setRecommendations(response.data.recommendations);
      } else {
        setRecommendations([]);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to load recommendations');
      setRecommendations([]);
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
    return `${import.meta.env.VITE_API_BASE_URL || 'https://craftconnect-laravel-backend-2.onrender.com'}/${cleanPath}`;
  };

  // Transform API product format to match ProductCard format
  const transformProduct = (product) => {
    return {
      id: product.id || product.product_id,
      image: fixImageUrl(product.productImage) || '/placeholder-image.jpg',
      title: product.productName,
      price: parseFloat(product.productPrice) || 0,
      artisanName: product.seller?.user?.userName || 'Unknown Artisan',
      artisanId: product.seller?.sellerID,
      storeName: product.seller?.store?.store_name || '',
      storeLogo: fixImageUrl(product.seller?.store?.logo_url) || '',
      rating: product.average_rating || 0,
      reviewsCount: product.reviews_count || 0,
      category: product.category,
    };
  };

  if (loading) {
    return (
      <section className="w-full max-w-[1400px] mx-auto py-8 px-4 bg-white">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-[#9F2936] animate-pulse" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
          </div>
          <p className="text-sm md:text-base text-gray-600">{subtitle}</p>
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9F2936]"></div>
        </div>
      </section>
    );
  }

  if (error || recommendations.length === 0) {
    return null; // Don't show section if no recommendations
  }

  return (
    <section className="w-full max-w-[1400px] mx-auto py-8 px-4 bg-white">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-[#9F2936]" />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
        </div>
        <p className="text-sm md:text-base text-gray-600">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((product) => {
          const transformedProduct = transformProduct(product);
          return (
            <div
              key={transformedProduct.id}
              onClick={() => navigate(`/product/${transformedProduct.id}`)}
              className="cursor-pointer"
            >
              <ProductCard
                product={transformedProduct}
                onAddToCart={(e) => {
                  e.stopPropagation();
                  addToCart(transformedProduct, 1);
                }}
                onFavorite={(e) => {
                  e.stopPropagation();
                  toggleFavorite(transformedProduct);
                }}
                isFavorited={favorites.some(fav => fav.id === transformedProduct.id)}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Recommendations;




