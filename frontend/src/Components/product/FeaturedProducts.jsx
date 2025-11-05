import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Filter, X, ShoppingCart, Heart } from "lucide-react";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import ProductCard from "./ProductCard";
import axios from "axios";
import { useFavorites } from "../favorites/FavoritesContext";

const FeaturedProducts = ({
  title = "Featured Products",
  subtitle = "Discover unique handcrafted items from talented artisans around Laguna",
  onAddToCart = () => {},
  onFavorite = () => {},
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [activeTab, setActiveTab] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showFavoriteModal, setShowFavoriteModal] = useState(false);
  const [modalType, setModalType] = useState('cart'); // 'cart' or 'favorite'
  const { favorites, toggleFavorite } = useFavorites();

  // Helper function to convert image URLs to proper format
  const fixImageUrl = (url) => {
    if (!url) {
      console.log('❌ No image URL provided');
      return null;
    }
    
    console.log('🔧 Processing image URL:', url);
    
    // For testing, let's try both ports and see which one works
    if (url.startsWith('http')) {
      console.log('✅ Full URL detected:', url);
      // Try the original URL first
      return url;
    }
    
    // Handle relative paths - try port 8000 first
    let cleanPath = url;
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }
    
    // Try the most common Laravel pattern
    const testUrl = `https://craftconnect-laravel-backend-1.onrender.com/${cleanPath}`;
    console.log('🔄 Trying URL:', testUrl);
    return testUrl;
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // First, try to get personalized recommendations
      let recommendedProductIds = [];
      try {
        const recResponse = await axios.get('/recommendations', { 
          baseURL: import.meta.env.VITE_BACKEND_URL || 'https://craftconnect-laravel-backend-1.onrender.com/api',
          params: { limit: 50 } // Get more to filter from
        });
        
        if (recResponse.data.success && recResponse.data.recommendations) {
          recommendedProductIds = recResponse.data.recommendations.map(p => p.id || p.product_id);
        }
      } catch (err) {
        console.log('No recommendations available, using default products');
      }
      
      // Fetch all approved products
      const response = await axios.get('/products/approved', { baseURL: import.meta.env.VITE_BACKEND_URL || 'https://craftconnect-laravel-backend-1.onrender.com/api' });
      const data = Array.isArray(response.data) ? response.data : 
                  response.data.data ? response.data.data : [];
      
      // Sort: Recommended products first, then others
      const sortedData = [...data].sort((a, b) => {
        const aIsRecommended = recommendedProductIds.includes(a.id || a.product_id);
        const bIsRecommended = recommendedProductIds.includes(b.id || b.product_id);
        
        if (aIsRecommended && !bIsRecommended) return -1;
        if (!aIsRecommended && bIsRecommended) return 1;
        
        // If both recommended or both not, sort by rating/reviews
        const aRating = (a.average_rating || 0) * (a.reviews_count || 1);
        const bRating = (b.average_rating || 0) * (b.reviews_count || 1);
        return bRating - aRating;
      });
      
      console.log('📦 Featured Products Data:', sortedData);
      console.log('📦 First product image:', sortedData[0]?.productImage);
      
      // Transform the API data to match our component's structure
      const transformedProducts = sortedData.map(product => {
        const isRecommended = recommendedProductIds.includes(product.id || product.product_id);
        // Calculate if product is new (created within last 7 days)
        const isNew = product.created_at 
          ? (new Date() - new Date(product.created_at)) / (1000 * 60 * 60 * 24) < 7
          : false;
        
        console.log('Product image data:', {
          id: product.id,
          productName: product.productName,
          productImage: product.productImage,
          fixedImage: fixImageUrl(product.productImage)
        });
        
        // Debug all products to see image URLs
        console.log('🔍 DEBUGGING PRODUCT:', {
          productName: product.productName,
          originalImage: product.productImage,
          fixedImage: fixImageUrl(product.productImage),
          hasImage: !!product.productImage
        });
        
        return {
          id: product.id,
          image: product.productImage || '/placeholder-image.jpg',
          title: product.productName,
          price: parseFloat(product.productPrice),
          artisanName: product.seller?.user?.userName || 'Unknown Artisan',
          artisanId: product.seller?.sellerID,
          storeName: product.seller?.store?.store_name || '',
          storeLogo: fixImageUrl(product.seller?.store?.logo_url) || '',
          rating: product.average_rating || 0, // Now guaranteed from backend
          reviewsCount: product.reviews_count || 0,
          isNew: isNew,
          isFeatured: product.is_featured || isRecommended,
          isRecommended: isRecommended, // Mark recommended products
          category: product.category
        };
      });

      setProducts(transformedProducts);
      setError(null);
    } catch (err) {
      console.error("Error fetching featured products:", err);
      setError("Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", "Miniatures & Souvenirs", "Rubber Stamp Engraving", "Traditional Accessories", "Statuary & Sculpture", "Basketry & Weaving"];
  const itemsPerPage = 6; // 3 products per row × 2 rows

  const filteredProducts = products.filter((product) => {
    if (activeTab === "All") return true;
    return product.category === activeTab;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    // Helper functions
    const hasRatings = (product) => (product.reviewsCount || 0) > 0;
    const getWeightedScore = (product) => {
      const rating = product.rating || 0;
      const count = product.reviewsCount || 0;
      return rating * Math.log10(count + 1) + (count / 100);
    };
    
    // ALWAYS prioritize products with ratings over products without ratings
    const aHasRatings = hasRatings(a);
    const bHasRatings = hasRatings(b);
    
    if (aHasRatings && !bHasRatings) return -1;
    if (!aHasRatings && bHasRatings) return 1;
    
    // Apply selected sorting
    switch (sortBy) {
      case "price-low":
        const priceDiffLow = a.price - b.price;
        if (priceDiffLow !== 0) return priceDiffLow;
        // Secondary: weighted rating
        if (aHasRatings && bHasRatings) {
          return getWeightedScore(b) - getWeightedScore(a);
        }
        return 0;
        
      case "price-high":
        const priceDiffHigh = b.price - a.price;
        if (priceDiffHigh !== 0) return priceDiffHigh;
        // Secondary: weighted rating
        if (aHasRatings && bHasRatings) {
          return getWeightedScore(b) - getWeightedScore(a);
        }
        return 0;
        
      case "rating":
        // Sort by weighted rating
        if (aHasRatings && bHasRatings) {
          return getWeightedScore(b) - getWeightedScore(a);
        }
        return 0;
        
      default:
        // Featured first, then by weighted rating
        const featuredDiff = (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
        if (featuredDiff !== 0) return featuredDiff;
        if (aHasRatings && bHasRatings) {
          return getWeightedScore(b) - getWeightedScore(a);
        }
        return 0;
    }
  });

  const paginatedProducts = sortedProducts.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const pageCount = Math.ceil(sortedProducts.length / itemsPerPage);

  // Authentication check functions
  const handleAddToCartWithAuth = (product) => {
    const token = sessionStorage.getItem("auth_token");
    if (!token) {
      setModalType('cart');
      setShowLoginModal(true);
      return;
    }
    onAddToCart(product);
  };

  const handleFavoriteWithAuth = (product) => {
    const token = sessionStorage.getItem("auth_token");
    if (!token) {
      setModalType('favorite');
      setShowFavoriteModal(true);
      return;
    }
    toggleFavorite(product);
  };

  if (loading) {
    return (
      <div className="w-full max-w-[1200px] mx-auto py-12 px-4 bg-white">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9F2936]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-[1200px] mx-auto py-12 px-4 bg-white">
        <div className="text-center text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <>
    <section className="w-full max-w-[1400px] mx-auto py-8 px-3 bg-white">
    <div className="text-center mb-4 md:mb-6">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 transition-transform duration-300 hover:scale-105">{title}</h2>
      <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto px-4">{subtitle}</p>
    </div>
  
    {/* Category Tabs + Sort Filter */}
<div className="flex flex-col w-full items-center mb-4 gap-3">
  {/* Mobile Dropdown */}
  <div className="w-full sm:hidden">
    <select
      value={activeTab}
      onChange={(e) => setActiveTab(e.target.value)}
      className="w-full py-2.5 px-4 bg-white border-2 border-gray-300 rounded-lg text-sm appearance-none cursor-pointer transition-all duration-200 hover:border-[#9F2936] focus:border-[#9F2936] focus:outline-none"
    >
      {categories.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </select>
  </div>

  {/* Desktop Tabs */}
  <div className="hidden sm:block w-full">
    <Tabs defaultValue="All" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="flex flex-wrap justify-center gap-2 bg-transparent">
        {categories.map((category) => (
          <TabsTrigger
            key={category}
            value={category}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg transition-all duration-200 whitespace-nowrap
                       hover:text-white hover:bg-gradient-to-r hover:from-[#a4785a] hover:to-[#7b5a3b] hover:border-[#a4785a] hover:shadow-md hover:scale-105
                       data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#a4785a] data-[state=active]:to-[#7b5a3b] data-[state=active]:border-[#a4785a] data-[state=active]:font-semibold data-[state=active]:shadow-md"
          >
            {category}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  </div>

  {/* Sort Filter - placed BELOW on mobile */}
  <div className="w-full sm:w-auto flex justify-center">
    <Select value={sortBy} onValueChange={setSortBy}>
      <SelectTrigger className="w-full sm:w-[160px] bg-white border-gray-300 focus:ring-[#9F2936] transition-all duration-200 hover:border-[#a4785a]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent className="bg-white">
        <SelectItem value="featured" className="bg-white hover:bg-[#f5f5f5]">Featured</SelectItem>
        <SelectItem value="price-low" className="bg-white hover:bg-[#f5f5f5]">Price: Low to High</SelectItem>
        <SelectItem value="price-high" className="bg-white hover:bg-[#f5f5f5]">Price: High to Low</SelectItem>
        <SelectItem value="rating" className="bg-white hover:bg-[#f5f5f5]">Highest Rated</SelectItem>
      </SelectContent>
    </Select>
  </div>
</div>

  
    {/* Product Grid */}
    {paginatedProducts.length === 0 ? (
      <div className="text-center py-8 text-gray-500">
        No products found in this category.
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedProducts.map((product) => (
          <div
            key={product.id}
            className="relative h-[300px] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group bg-gray-100"
            onClick={() => window.location.href = `/product/${product.id}`}
          >
            {/* Background Image */}
            <img 
              src={fixImageUrl(product.image) || 'https://via.placeholder.com/400x300?text=Test+Image'}
              alt={product.title}
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
              onLoad={(e) => {
                console.log('✅ Image loaded successfully:', 
                  'Product:', product.title,
                  'URL:', e.target.src
                );
                // Show the overlay when image loads successfully
                const overlay = e.target.parentElement.querySelector('.image-overlay');
                if (overlay) {
                  overlay.style.display = 'block';
                }
                // Show overlay and update styling when image loads
                const contentOverlay = e.target.parentElement.querySelector('.content-overlay');
                if (contentOverlay) {
                  // Change text to white for better contrast over image
                  contentOverlay.style.color = 'white';
                  // Update all text elements to white
                  const textElements = contentOverlay.querySelectorAll('h3, p, span, div');
                  textElements.forEach(el => {
                    if (!el.className.includes('bg-')) { // Don't change button backgrounds
                      el.style.color = 'white';
                    }
                  });
                }
              }}
              onError={(e) => {
                console.log('❌ Image failed to load:', 
                  'Product:', product.title,
                  'URL:', e.target.src
                );
                
                // Prevent infinite retry loops
                const currentSrc = e.target.src;
                const originalImage = product.image;
                
                // Track retry attempts to prevent infinite loops
                if (!e.target.retryCount) {
                  e.target.retryCount = 0;
                }
                e.target.retryCount++;
                
                // Max 2 retries
                if (e.target.retryCount > 2) {
                  console.log('🛑 Max retries reached, hiding image');
                  e.target.style.display = 'none';
                  return;
                }
                
                // Try alternative URL formats
                if (originalImage && e.target.retryCount === 1) {
                  let retryUrl;
                  if (originalImage.startsWith('http')) {
                    // If it's a full URL, try switching port
                    if (originalImage.includes('localhost:8000')) {
                      retryUrl = originalImage.replace('localhost:8000', 'craftconnect-laravel-backend-1.onrender.com');
                    } else if (originalImage.includes('localhost:8080')) {
                      retryUrl = originalImage.replace('localhost:8080', 'craftconnect-laravel-backend-1.onrender.com');
                    }
                  } else {
                    // Try with /storage/ prefix for relative paths
                    retryUrl = `https://craftconnect-laravel-backend-1.onrender.com/storage/${originalImage.replace(/^\/+/, '')}`;
                  }
                  console.log('🔄 Retry 1 - Trying URL:', retryUrl);
                  e.target.src = retryUrl;
                  return;
                }
                
                if (originalImage && e.target.retryCount === 2) {
                  // Final retry - hide image
                  console.log('🛑 Retry 2 - Hiding image');
                  e.target.style.display = 'none';
                  return;
                }
                
                // Final fallback - hide image and keep text dark
                console.log('🛑 All retries failed, hiding image');
                e.target.style.display = 'none';
              }}
              />
            
            {/* Dark Overlay - only show when image loads successfully */}
            <div className="image-overlay absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-all duration-300" style={{display: 'none'}} />
            
            {/* Content Overlay */}
            <div className="content-overlay absolute inset-0 flex flex-col justify-between p-4 text-gray-800">
              {/* Top Section - Badges */}
              <div className="flex justify-between items-start">
                <div className="flex gap-2">
                  {product.isRecommended && (
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-md text-xs font-medium shadow-md">
                      ✨ Recommended
                    </span>
                  )}
                  {product.isNew && (
                    <span className="bg-blue-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                      New
                    </span>
                  )}
                  {product.isFeatured && !product.isRecommended && (
                    <span className="bg-amber-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                      Featured
                    </span>
                  )}
                </div>
                
                {/* Favorite Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="favorite-btn bg-white/80 hover:bg-white/90 rounded-full p-2 h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavoriteWithAuth(product);
                  }}
                >
                  <Heart 
                    className={`h-4 w-4 ${
                      favorites.some(fav => fav.id === product.id) 
                        ? "text-red-500 fill-red-500" 
                        : "text-gray-600"
                    }`} 
                  />
                </Button>
              </div>

              {/* Bottom Section - Product Details */}
              <div className="space-y-3">
                {/* Product Name & Category */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="text-sm text-gray-600 opacity-90">
                    {product.category}
                  </p>
                </div>

                {/* Artisan/Store Info */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {product.storeLogo && (
                    <img 
                      src={product.storeLogo} 
                      alt={product.storeName || product.artisanName} 
                      className="w-5 h-5 rounded-full object-cover border border-white/30"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <span className="truncate">{product.storeName || product.artisanName}</span>
                </div>

                {/* Rating & Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-400"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-1 text-sm text-gray-800">{product.rating}</span>
                  </div>
                  
                  <div className="text-xl font-bold text-gray-800">
                    ₱{product.price.toFixed(2)}
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Button
                  className="w-full bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white font-semibold py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCartWithAuth(product);
                  }}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  
    {/* Pagination */}
    {pageCount > 1 && (
      <div className="flex flex-col md:flex-row justify-center items-center mt-10 gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
          disabled={currentPage === 0}
          className="flex items-center px-5 py-2 border-gray-300 text-gray-800 hover:text-white hover:bg-gradient-to-r hover:from-[#a4785a] hover:to-[#7b5a3b] hover:border-[#a4785a] hover:shadow-md hover:scale-105 transition-all duration-200 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:bg-transparent disabled:hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
  
        <div className="text-sm text-gray-600 font-medium">
          Page <span className="text-[#a4785a] font-bold">{currentPage + 1}</span> of {pageCount}
        </div>
  
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.min(pageCount - 1, p + 1))}
          disabled={currentPage === pageCount - 1}
          className="flex items-center px-5 py-2 border-gray-300 text-gray-800 hover:text-white hover:bg-gradient-to-r hover:from-[#a4785a] hover:to-[#7b5a3b] hover:border-[#a4785a] hover:shadow-md hover:scale-105 transition-all duration-200 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:bg-transparent disabled:hover:text-gray-800"
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    )}
  </section>

  {/* Login Modal */}
  {showLoginModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-11/12 max-w-md rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-[#5c3d28]">Login Required</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLoginModal(false)}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-full mx-auto mb-4">
            <ShoppingCart className="h-8 w-8 text-white" />
          </div>
          <p className="text-[#7b5a3b] text-center text-lg">
            Please log in to add items to your cart and continue shopping.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowLoginModal(false)}
            className="flex-1 border-2 border-[#d5bfae] hover:border-[#a4785a] hover:bg-[#a4785a] hover:text-white transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setShowLoginModal(false);
              window.location.href = "/login";
            }}
            className="flex-1 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white font-semibold transition-all duration-200"
          >
            Go to Login
          </Button>
        </div>
      </div>
    </div>
  )}

  {/* Favorites Modal */}
  {showFavoriteModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-11/12 max-w-md rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-[#5c3d28]">Login Required</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFavoriteModal(false)}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-full mx-auto mb-4">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <p className="text-[#7b5a3b] text-center text-lg">
            Please log in to add items to your favorites and save them for later.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowFavoriteModal(false)}
            className="flex-1 border-2 border-[#d5bfae] hover:border-[#a4785a] hover:bg-[#a4785a] hover:text-white transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setShowFavoriteModal(false);
              window.location.href = "/login";
            }}
            className="flex-1 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white font-semibold transition-all duration-200"
          >
            Go to Login
          </Button>
        </div>
      </div>
    </div>
  )}
  </>
  );
};

export default FeaturedProducts;