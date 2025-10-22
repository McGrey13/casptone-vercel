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

const FeaturedProducts = ({
  title = "Featured Products",
  subtitle = "Discover unique handcrafted items from talented artisans around Laguna",
  onAddToCart = () => {},
  onFavorite = () => {},
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showFavoriteModal, setShowFavoriteModal] = useState(false);
  const [modalType, setModalType] = useState('cart'); // 'cart' or 'favorite'

  // Helper function to convert image URLs to relative paths
  const fixImageUrl = (url) => {
    if (!url) return url;
    // If it's already a full URL with localhost, convert to relative path
    if (url.includes('localhost:8000') || url.includes('localhost:8080')) {
      const path = new URL(url).pathname;
      return path;
    }
    // If it's already a relative path, return as is
    if (url.startsWith('/storage/') || url.startsWith('/images/')) {
      return url;
    }
    return url;
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/products/featured', { baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api' });
      const data = Array.isArray(response.data) ? response.data : 
                  response.data.data ? response.data.data : [];
      
      console.log('📦 Featured Products Data:', data);
      
      // Transform the API data to match our component's structure
      const transformedProducts = data.map(product => {
        // Calculate if product is new (created within last 7 days)
        const isNew = product.created_at 
          ? (new Date() - new Date(product.created_at)) / (1000 * 60 * 60 * 24) < 7
          : false;
        
        return {
          id: product.id,
          image: fixImageUrl(product.productImage) || '/placeholder-image.jpg',
          title: product.productName,
          price: parseFloat(product.productPrice),
          artisanName: product.seller?.user?.userName || 'Unknown Artisan',
          artisanId: product.seller?.sellerID,
          storeName: product.seller?.store?.store_name || '',
          storeLogo: fixImageUrl(product.seller?.store?.logo_url) || '',
          rating: product.average_rating || 0, // Now guaranteed from backend
          reviewsCount: product.reviews_count || 0,
          isNew: isNew,
          isFeatured: true,
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
  const itemsPerPage = 4;

  const filteredProducts = products.filter((product) => {
    if (activeTab === "all") return true;
    return product.category.toLowerCase() === activeTab.toLowerCase();
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
    onFavorite(product);
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
    <section className="w-full max-w-[1200px] mx-auto py-12 px-4 bg-white">
    <div className="text-center mb-6 md:mb-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 transition-transform duration-300 hover:scale-105">{title}</h2>
      <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto px-4">{subtitle}</p>
    </div>
  
    {/* Category Tabs + Sort Filter */}
<div className="flex flex-col w-full items-center mb-6 gap-4">
  {/* Mobile Dropdown */}
  <div className="w-full sm:hidden">
    <select
      value={activeTab}
      onChange={(e) => setActiveTab(e.target.value)}
      className="w-full py-2.5 px-4 bg-white border-2 border-gray-300 rounded-lg text-sm appearance-none cursor-pointer transition-all duration-200 hover:border-[#9F2936] focus:border-[#9F2936] focus:outline-none"
    >
      {categories.map((category) => (
        <option key={category.toLowerCase()} value={category.toLowerCase()}>
          {category}
        </option>
      ))}
    </select>
  </div>

  {/* Desktop Tabs */}
  <div className="hidden sm:block w-full">
    <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="flex flex-wrap justify-center gap-2 bg-transparent">
        {categories.map((category) => (
          <TabsTrigger
            key={category.toLowerCase()}
            value={category.toLowerCase()}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {paginatedProducts.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
            onAddToCart={handleAddToCartWithAuth}
            onFavorite={handleFavoriteWithAuth}
          />
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