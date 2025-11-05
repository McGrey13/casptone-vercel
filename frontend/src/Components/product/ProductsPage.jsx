import React, { useState, useEffect } from "react";
import { ArrowLeft, Filter, Search, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { useNavigate } from "react-router-dom";
import api from "../../api";

// Wrapper component to track product views on hover
const ProductCardWrapper = ({ productId, children }) => {
  const [viewStartTime, setViewStartTime] = React.useState(null);

  const handleMouseEnter = () => {
    setViewStartTime(Date.now());
  };

  const handleMouseLeave = () => {
    if (viewStartTime) {
      const duration = Math.floor((Date.now() - viewStartTime) / 1000);
      // Track view if user spent significant time (more than 2 seconds)
      if (duration > 2 && productId) {
        api.post(`/products/${productId}/track-view`, { duration }).catch(() => {
          // Silently fail
        });
      }
      setViewStartTime(null);
    }
  };

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
    </div>
  );
};

// --- ProductsPage Component ---
const ProductsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [followedProductIds, setFollowedProductIds] = useState(new Set());

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

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = sessionStorage.getItem('auth_token');
        
        // Get AI-powered recommendations first
        let recommendedProductIds = [];
        let recommendedProductsMap = new Map();
        try {
          const recResponse = await api.get("/recommendations", {
            params: { limit: 200 }, // Get more recommendations
            headers: {
              ...(token && { "Authorization": `Bearer ${token}` }),
            },
          });
          
          if (recResponse.data.success && recResponse.data.recommendations) {
            // Store full recommendation data with scores for better sorting
            recResponse.data.recommendations.forEach((rec) => {
              const productId = rec.id || rec.product_id;
              recommendedProductIds.push(productId);
              recommendedProductsMap.set(productId, {
                ...rec,
                isRecommended: true,
                recommendationScore: rec.score || 0
              });
            });
            
            console.log('✅ AI Recommendations loaded:', recommendedProductIds.length, 'products');
          }
        } catch (err) {
          console.log('⚠️ No recommendations available:', err.message);
          console.log('Using default product sorting');
        }
        
        // Fetch followed sellers' products first (if authenticated)
        let followedProducts = [];
        if (token) {
          try {
            const followedResponse = await api.get("/products/followed-sellers", {
              headers: {
                "Authorization": `Bearer ${token}`,
              },
            });
            
            followedProducts = Array.isArray(followedResponse.data) ? followedResponse.data : (followedResponse.data.data || []);
          } catch (err) {
            // No followed sellers products
          }
        }
        
        // Fetch all approved products
        const response = await api.get("/products/approved", {
          headers: {
            ...(token && { "Authorization": `Bearer ${token}` }),
          },
        });

        const data = response.data;
        
        // Handle both array and object responses
        const allProducts = Array.isArray(data) ? data : (data.data || []);
        
        // Create a Set of followed product IDs for quick lookup
        const followedIds = new Set(followedProducts.map(p => p.id || p.product_id));
        setFollowedProductIds(followedIds);
        
        // Merge recommended products data with all products
        const allProductsWithRecommendations = allProducts.map(product => {
          const productId = product.id || product.product_id;
          const recommendedData = recommendedProductsMap.get(productId);
          
          if (recommendedData) {
            // Merge recommended product data (may have better fields)
            return {
              ...product,
              ...recommendedData,
              // Keep original product fields as fallback
              average_rating: recommendedData.average_rating || product.average_rating || 0,
              reviews_count: recommendedData.reviews_count || product.reviews_count || 0,
            };
          }
          return product;
        });
        
        // Separate products into: Recommended + Followed, Recommended, Followed, Others
        const recommendedAndFollowed = allProductsWithRecommendations.filter(p => 
          recommendedProductIds.includes(p.id || p.product_id) && followedIds.has(p.id || p.product_id)
        );
        
        const recommendedOnly = allProductsWithRecommendations.filter(p => 
          recommendedProductIds.includes(p.id || p.product_id) && !followedIds.has(p.id || p.product_id)
        );
        
        const followedOnly = followedProducts.filter(p => 
          !recommendedProductIds.includes(p.id || p.product_id)
        );
        
        const otherProducts = allProductsWithRecommendations.filter(p => 
          !recommendedProductIds.includes(p.id || p.product_id) && !followedIds.has(p.id || p.product_id)
        );
        
        // Sort each group by recommendation score (if available), then rating and sold count
        const sortProducts = (products) => {
          return [...products].sort((a, b) => {
            // First priority: recommendation score (if available)
            if (a.recommendationScore !== undefined && b.recommendationScore !== undefined) {
              if (b.recommendationScore !== a.recommendationScore) {
                return b.recommendationScore - a.recommendationScore;
              }
            }
            
            // Second priority: rating
            const ratingA = a.average_rating || 0;
            const ratingB = b.average_rating || 0;
            if (ratingB !== ratingA) {
              return ratingB - ratingA;
            }
            
            // Third priority: sold count
            const soldA = a.sold_count || 0;
            const soldB = b.sold_count || 0;
            return soldB - soldA;
          });
        };
        
        // Combine in priority order: Recommended+Followed > Recommended > Followed > Others
        const sortedProducts = [
          ...sortProducts(recommendedAndFollowed),
          ...sortProducts(recommendedOnly),
          ...sortProducts(followedOnly),
          ...sortProducts(otherProducts)
        ];
        
        console.log('📊 Product sorting:', {
          recommendedAndFollowed: recommendedAndFollowed.length,
          recommendedOnly: recommendedOnly.length,
          followedOnly: followedOnly.length,
          otherProducts: otherProducts.length,
          total: sortedProducts.length
        });
        
        // Add sample ratings and sold counts for products that don't have data yet (for testing)
        const productsWithSampleData = sortedProducts.map((product, index) => {
          const sampleRatings = [4.2, 3.8, 4.5, 4.0, 3.9, 4.3, 4.1, 3.7, 4.4, 3.6];
          const sampleReviewCounts = [12, 8, 15, 6, 9, 11, 7, 5, 13, 4];
          const sampleSoldCounts = [25, 18, 32, 12, 21, 28, 15, 9, 35, 7];
          
          const dataIndex = index % sampleRatings.length;
          
          const isRecommended = recommendedProductIds.includes(product.id || product.product_id);
          
          return {
            ...product,
            // Add sample ratings if no rating data exists
            average_rating: product.average_rating || sampleRatings[dataIndex],
            reviews_count: product.reviews_count || sampleReviewCounts[dataIndex],
            // Add sample sold counts if no sold data exists
            sold_count: product.sold_count || sampleSoldCounts[dataIndex],
            // Mark if recommended by AI
            isRecommended: isRecommended
          };
        });
        
        setProducts(productsWithSampleData);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.seller?.user?.userName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || p.category?.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Get unique categories from products
  const categories = ["all", ...new Set(products.map(p => p.category).filter(Boolean))];

  // Helper function to get all images for a product (main + additional)
  const getAllImages = (product) => {
    const images = [];
    const addedUrls = new Set(); // To avoid duplicates
    
    // Add additional images first (they contain all images including main)
    if (product.productImages && Array.isArray(product.productImages)) {
      product.productImages.forEach((img, index) => {
        if (img && !addedUrls.has(img)) {
          addedUrls.add(img);
          images.push({
            src: fixImageUrl(img),
            type: index === 0 ? 'main' : 'additional',
            index: index
          });
        }
      });
    }
    
    // If no additional images, add main image
    if (images.length === 0 && product.productImage && !addedUrls.has(product.productImage)) {
      images.push({
        src: fixImageUrl(product.productImage),
        type: 'main'
      });
    }
    
    return images;
  };

  // Helper function to get current image for a product
  const getCurrentImage = (product) => {
    const allImages = getAllImages(product);
    const productId = product.id || product.product_id;
    const currentIndex = currentImageIndex[productId] || 0;
    return allImages[currentIndex] || null;
  };

  // Helper function to navigate to next image
  const goToNextImage = (product, e) => {
    e.stopPropagation(); // Prevent navigation to product page
    const productId = product.id || product.product_id;
    const allImages = getAllImages(product);
    const currentIndex = currentImageIndex[productId] || 0;
    const nextIndex = (currentIndex + 1) % allImages.length;
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: nextIndex
    }));
  };

  // Helper function to navigate to previous image
  const goToPreviousImage = (product, e) => {
    e.stopPropagation(); // Prevent navigation to product page
    const productId = product.id || product.product_id;
    const allImages = getAllImages(product);
    const currentIndex = currentImageIndex[productId] || 0;
    const prevIndex = currentIndex === 0 ? allImages.length - 1 : currentIndex - 1;
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: prevIndex
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 bg-gray-50">
        <h1 className="text-3xl font-bold mb-4">Explore Handcrafted Products</h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 bg-gray-50">
        <h1 className="text-3xl font-bold mb-4">Explore Handcrafted Products</h1>
        <div className="text-center py-12">
          <p className="text-[#9F2936] mb-4">Error loading products: {error}</p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>Please make sure:</p>
            <ul className="list-disc list-inside">
              <li>The Laravel backend server is running</li>
              <li>There are approved products in the database</li>
              <li>The database connection is working</li>
            </ul>
          </div>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <h1 className="text-3xl font-bold mb-4">Explore Handcrafted Products</h1>

      <Input
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4"
      />

      {/* Mobile Category Dropdown */}
      <div className="lg:hidden mb-4">
        <Select value={activeCategory} onValueChange={setActiveCategory}>
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat} className="bg-white hover:bg-gray-100">
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Category Tabs */}
      <div className="hidden lg:block mb-4">
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="flex flex-wrap gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <TabsTrigger 
                key={cat} 
                value={cat}
                className="text-sm px-3 py-1.5 whitespace-nowrap"
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-2">No products found.</p>
          <p className="text-sm text-gray-400">
            {products.length === 0 
              ? "No products available in the database." 
              : "No products match your search criteria."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => {
            const allImages = getAllImages(product);
            const currentImage = getCurrentImage(product);
            const productId = product.id || product.product_id;
            const currentIndex = currentImageIndex[productId] || 0;
            const isFromFollowedSeller = followedProductIds.has(productId);
            
            return (
              <ProductCardWrapper productId={product.id || product.product_id} key={product.id}>
              <div
                onClick={() => navigate(`/product/${product.id}`)}
                className="cursor-pointer bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative"
              >
                <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden group shadow-sm">
                  {currentImage ? (
                    <img 
                      src={currentImage.src} 
                      alt={product.productName} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  
                  {/* Placeholder when no images */}
                  <div 
                    className="w-full h-full flex items-center justify-center text-gray-400"
                    style={{ display: currentImage ? 'none' : 'flex' }}
                  >
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>

                  {/* Recommended Badge */}
                  {product.isRecommended && (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg z-20">
                      ✨ Recommended
                    </div>
                  )}
                  
                  {/* Navigation buttons - show when multiple images exist */}
                  {allImages.length > 1 && (
                    <>
                      {/* Previous button */}
                      <button
                        onClick={(e) => goToPreviousImage(product, e)}
                        className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-transparent text-black hover:text-gray-700 rounded-full p-2 transition-colors duration-200 z-10"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      
                      {/* Next button */}
                      <button
                        onClick={(e) => goToNextImage(product, e)}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-transparent text-black hover:text-gray-700 rounded-full p-2 transition-colors duration-200 z-10"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      
                      {/* Image counter */}
                      <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-sm px-3 py-1 rounded-full z-10 font-bold backdrop-blur-sm">
                        {currentIndex + 1}/{allImages.length}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Product Info */}
                <div className="mt-4 space-y-2">
                  <h2 className="font-semibold text-gray-900 text-2xl leading-tight overflow-hidden" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {product.productName}
                  </h2>
                  
                  {/* Store Name and Seller Name */}
                  <div className="space-y-1">
                    <p className="text-sm text-[#9F2936] font-medium">
                      {product.seller?.store?.store_name || product.seller?.businessName || "Unknown Store"}
                    </p>
                    <p className="text-xs text-gray-500">
                      by {product.seller?.user?.userName || "Unknown Seller"}
                    </p>
                  </div>
                  
                  {/* Price with Category Badge */}
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-[#9F2936]">
                      ₱{Number(product.productPrice).toFixed(2)}
                    </p>
                    {product.category && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {product.category}
                      </span>
                    )}
                  </div>
                  
                  {/* Rating and Sold Count Display */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* 5 Star Rating Display */}
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, index) => {
                          const rating = product.average_rating || product.rating || 0;
                          const filled = index + 1 <= Math.floor(rating);
                          const halfFilled = index + 1 === Math.ceil(rating) && rating % 1 !== 0;
                          return (
                            <Star
                              key={index}
                              className={`w-4 h-4 ${
                                filled 
                                  ? 'text-yellow-400 fill-yellow-400' 
                                  : halfFilled
                                  ? 'text-yellow-400 fill-yellow-400 opacity-50'
                                  : 'text-gray-300 fill-gray-300'
                              }`}
                            />
                          );
                        })}
                      </div>
                      <span className="text-sm font-bold text-[#5c3d28]">
                        {(product.average_rating || product.rating || 0).toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500">({product.reviews_count || product.total_ratings || 0})</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <svg className="w-3 h-3 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className={`font-medium ${product.sold_count > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                        {product.sold_count || 0} sold
                      </span>
                    </div>
                  </div>
                  
                  {/* Stock Information */}
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span className={`font-medium ${
                        (product.productQuantity || 0) > 10 ? 'text-green-600' : 
                        (product.productQuantity || 0) > 0 ? 'text-orange-600' : 
                        'text-red-600'
                      }`}>
                        {(product.productQuantity || 0) > 0 ? `${product.productQuantity} in stock` : 'Out of stock'}
                      </span>
                    </div>
                    {(product.productQuantity || 0) > 0 && (product.productQuantity || 0) <= 10 && (
                      <span className="text-xs text-orange-600 font-medium">
                        Low stock!
                      </span>
                    )}
                  </div>
                </div>
              </div>
              </ProductCardWrapper>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
