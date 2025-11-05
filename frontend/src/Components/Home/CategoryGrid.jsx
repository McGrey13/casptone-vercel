import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import axios from "axios";
import "./CategoryGrid.css"; // Add this import

const categoryFilters = [
  { id: "all", name: "All", queryParam: "" },
  { id: "miniatures", name: "Miniatures & Souvenirs", queryParam: "Miniatures & Souvenirs" },
  { id: "rubber-stamp", name: "Rubber Stamp", queryParam: "Rubber Stamp Engraving"},
  { id: "traditional", name: "Traditional", queryParam: "Traditional Accessories" },
  { id: "statuary", name: "Statuary", queryParam: "Statuary & Sculpture" },
  { id: "basketry", name: "Basketry", queryParam: "Basketry & Weaving" },
  { id: "featured", name: "Featured", queryParam: "featured"}
];

const CategoryGrid = () => {
  const [stores, setStores] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showScrollHint, setShowScrollHint] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowScrollHint(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Helper function to convert image URLs to relative paths
  const fixImageUrl = (url) => {
    if (!url) return url;
    // If it's already a full URL with localhost, convert to relative path
    if (url.includes('localhost:8000') || url.includes('localhost:8080') || url.includes('craftconnect-laravel-backend-1.onrender.com')) {
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
    fetchStores();
  }, [selectedCategory]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const selectedCategoryData = categoryFilters.find(cat => cat.id === selectedCategory);
      
      console.log('📂 Selected Category:', selectedCategory);
      console.log('📂 Category Data:', selectedCategoryData);
      
      // Use relative URLs to work with Vite proxy
      const url = selectedCategory === 'featured'
        ? '/api/products/featured'
        : `/api/stores${selectedCategoryData?.queryParam ? `?category=${encodeURIComponent(selectedCategoryData.queryParam)}` : ''}`;
      
      console.log('🔗 Fetching URL:', url);
      const response = await axios.get(url);
      
      console.log('📦 Response Data:', response.data);
      
      // Ensure we're getting an array from the response
      const data = Array.isArray(response.data) ? response.data : 
                  response.data.data ? response.data.data : [];
      
      // Transform the data based on whether it's products or stores
      const transformedData = selectedCategory === 'featured'
        ? data.map(item => ({
            storeID: item.seller?.sellerID,
            seller_id: item.seller?.sellerID,
            store_name: item.productName,
            store_description: item.productDescription,
            category: item.category,
            logo_path: fixImageUrl(item.productImage),
            followers_count: 0,
            location: '',
            years_active: 0
          }))
        : data.map(item => {
          // Use logo_url from backend and fix it to use relative path
          const logoUrl = fixImageUrl(item.logo_url || item.logo_path);
          
          return {
            storeID: item.storeID,
            seller_id: item.seller_id,
            store_name: item.store_name,
            store_description: item.store_description,
            category: item.category,
            logo_path: logoUrl,
            followers_count: item.followers_count || 0,
            location: item.location || '',
            years_active: item.years_active || 0,
            average_rating: item.average_rating || 0,
            total_ratings: item.total_ratings || 0
          };
        });
      
      // Sort by weighted rating (considers both rating value and number of ratings)
      // Formula: weighted_score = average_rating * log(total_ratings + 1) + (total_ratings / 100)
      // This gives preference to items with more ratings while still considering quality
      const sortedData = transformedData.sort((a, b) => {
        const getWeightedScore = (store) => {
          const rating = store.average_rating || 0;
          const count = store.total_ratings || 0;
          // Using logarithmic scale for ratings count to prevent extreme bias
          // Adding 1 to avoid log(0)
          const weightedScore = rating * Math.log10(count + 1) + (count / 100);
          return weightedScore;
        };
        
        const hasRatings = (store) => {
          return (store.total_ratings || 0) > 0;
        };
        
        // ALWAYS prioritize stores with ratings over stores without ratings
        const aHasRatings = hasRatings(a);
        const bHasRatings = hasRatings(b);
        
        if (aHasRatings && !bHasRatings) return -1; // a has ratings, b doesn't - a comes first
        if (!aHasRatings && bHasRatings) return 1;  // b has ratings, a doesn't - b comes first
        
        // If both have ratings or both don't, sort by weighted score
        return getWeightedScore(b) - getWeightedScore(a);
      });
      
      setStores(sortedData);
    } catch (error) {
      console.error("❌ Error fetching data:", error);
      console.error("❌ Error details:", error.response?.data);
      setStores([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#fefefe] py-8">
      <div className="max-w-7xl mx-auto px-4 text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Explore Local Craft Stores</h2>
        <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto mb-4">
          Discover talented artisans and their unique craft stores
        </p>
      </div>

      {/* Category Filter Bar */}
      <div className="mb-8 bg-white sticky top-[65px] z-40">
        <div className="max-w-7xl mx-auto px-4">
          {/* Mobile Dropdown */}
          <div className="lg:hidden relative py-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2.5 px-4 bg-white border-2 border-gray-300 rounded-lg appearance-none cursor-pointer text-base"
            >
              {categoryFilters.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Tablet & Desktop Categories */}
          <div className="hidden lg:flex items-center justify-center gap-3 py-3 w-full overflow-x-auto scrollbar-hide pb-2">
            {categoryFilters.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`py-2 px-3 xl:px-4 font-medium text-xs xl:text-sm transition-all duration-200 flex items-center gap-1.5 xl:gap-2 whitespace-nowrap flex-shrink-0 rounded-full ${
                  selectedCategory === category.id
                    ? 'text-white bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] shadow-md'
                    : 'text-[#5c3d28] hover:text-[#a4785a] hover:bg-[#a4785a]/10 border border-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9F2936]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 xl:gap-6 justify-items-center">
            {stores.map((store) => {
              const routeId = store.seller_id || store.storeID;
              return (
                <Link
                  to={`/store/${routeId}`}
                  key={store.storeID}
                  className="block transition-transform hover:scale-105 w-full max-w-sm"
                >
                  <Card className="overflow-hidden h-full border-none shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-100">
                      {store.logo_path ? (
                        <img
                          src={store.logo_path}
                          alt={store.store_name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 italic">
                          <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            <p className="text-sm">No image available</p>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                        <div className="p-4 text-white w-full">
                          <h3 className="font-bold text-lg sm:text-xl mb-1 line-clamp-1">{store.store_name}</h3>
                          <p className="text-sm text-white/90 mb-2">{store.category}</p>
                          {store.location && (
                            <p className="text-xs text-white/80 flex items-center">
                              <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="truncate">{store.location}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{store.store_description}</p>
                      
                      {/* Rating Display */}
                      {store.average_rating > 0 && (
                        <div className="flex items-center mb-3">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                            </svg>
                            <span className="ml-1 text-sm font-semibold text-gray-800">{store.average_rating}</span>
                            <span className="ml-1 text-xs text-gray-500">({store.total_ratings})</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>{store.followers_count} followers</span>
                        </div>
                        <div className="flex items-center text-[#9F2936] font-medium">
                          <span className="hidden sm:inline">View Store</span>
                          <span className="sm:hidden">View</span>
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryGrid;