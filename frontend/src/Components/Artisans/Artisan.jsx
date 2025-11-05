import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Filter, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import api from "../../api";

const Artisan = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [artisans, setArtisans] = useState([]);
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const token = sessionStorage.getItem("auth_token");

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

  const fetchArtisans = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await api.get("/get/sellers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;
      console.log("Raw seller data:", data);
      
      const mapped = data.map((seller) => {
        // Use profile_image_url from backend and fix it to use relative path
        let profileImageUrl = fixImageUrl(seller.profile_image_url);
        
        // Fallback to default avatar if no image
        if (!profileImageUrl || profileImageUrl.trim() === "") {
          profileImageUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (seller.user?.userName || 'artisan');
        }
        
        console.log(`Seller ${seller.sellerID} rating:`, seller.rating, 'reviews:', seller.total_reviews);
        
        return {
          id: seller.sellerID,
          name: seller.user.userName,
          location: seller.user.userAddress || "Unknown",
          bio: seller.story || "No bio provided.",
          image: profileImageUrl,
          specialty: seller.store_category || seller.specialty || "Crafts", 
          rating: seller.rating || 0,
          totalReviews: seller.total_reviews || 0,
          productCount: seller.productCount || 0,
          featured: seller.featured || false,
          story: seller.story || "",
          videoUrl: seller.video_url || "",
          storeLogo: seller.store_logo || "",
          storeName: seller.store_name || "",
        };
      });
      
      console.log("Mapped seller data with ratings:", mapped);
      setArtisans(mapped);
    } catch (err) {
      console.error("Error fetching sellers:", err);
      setError(err.message);
      setArtisans([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchArtisans();
  }, [token]);

  const handleSearch = (e) => {
    e.preventDefault();
    filterArtisans(searchQuery, filterFeatured);
  };

  const filterArtisans = (query, onlyFeatured) => {
    // The filter logic is fine, it will work on the 'mapped' data
    let filtered = artisans;
    if (query.trim() !== "") {
      filtered = filtered.filter(
        (artisan) =>
          artisan.name?.toLowerCase().includes(query.toLowerCase()) ||
          artisan.specialty?.toLowerCase().includes(query.toLowerCase()) ||
          artisan.location?.toLowerCase().includes(query.toLowerCase()) ||
          artisan.bio?.toLowerCase().includes(query.toLowerCase())
      );
    }
    if (onlyFeatured) {
      filtered = filtered.filter((artisan) => artisan.featured);
    }
    setArtisans(filtered);
  };

  const toggleFeatured = () => {
    const newValue = !filterFeatured;
    setFilterFeatured(newValue);
    filterArtisans(searchQuery, newValue);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      {/* <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700"> */}
      <div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-300/20 rounded-full blur-2xl"></div>
          </div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-16">
          {/* Breadcrumb */}
          <div className="flex items-center mb-8 text-sm">
            <Link to="/home" className="text-white/80 hover:text-white transition-colors">
              Home
            </Link>
            <span className="mx-2 text-white/60">/</span>
            <span className="font-medium text-white">Artisans</span>
          </div>

          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Meet Our <span className="">Artisans</span>
            </h1>
            {/* bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent */}
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Discover the talented craftspeople behind our unique handcrafted products. 
              Each artisan brings their own story, passion, and expertise to create something truly special.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20">
              <div className="flex flex-col lg:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-grow">
                  <div className="relative group">
                    <Input
                      type="search"
                      placeholder="Search artisans by name, specialty, or location..."
                      className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 group-hover:border-blue-300"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors">
                      <Search className="h-5 w-5" />
                    </div>
                  </div>
                </form>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => fetchArtisans(true)}
                    disabled={refreshing}
                    className="px-6 py-4 rounded-xl border-2 hover:bg-gray-50 transition-all duration-300 disabled:opacity-50"
                    title="Refresh artisans"
                  >
                    <svg className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {refreshing ? "Refreshing..." : "Refresh"}
                  </Button>
                  <Button
                    variant={filterFeatured ? "default" : "outline"}
                    onClick={toggleFeatured}
                    className={`px-6 py-4 rounded-xl transition-all duration-300 ${
                      filterFeatured 
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:shadow-xl' 
                        : 'border-2 hover:bg-gray-50'
                    }`}
                  >
                    <Filter className="h-5 w-5 mr-2" />
                    Featured
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative mb-8">
              <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Discovering Artisans</h3>
            <p className="text-gray-600 text-center max-w-md">
              We're finding the most talented craftspeople for you...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Oops! Something went wrong</h3>
            <p className="text-gray-600 text-center max-w-md mb-8">
              {error}
            </p>
            <Button
              onClick={() => fetchArtisans(true)}
              disabled={refreshing}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {refreshing ? "Retrying..." : "Try Again"}
            </Button>
          </div>
        )}

        {/* Artisans Grid */}
        {!loading && !error && artisans.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {artisans.map((artisan) => (
              <Link to={`/artisans/${artisan.id}`} key={artisan.id}>
                <Card className="group h-full overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 transform hover:-translate-y-2">
                  <div className="relative h-72 overflow-hidden">
                    <img
                      src={artisan.image}
                      alt={artisan.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    {artisan.featured && (
                      <Badge className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                        ⭐ Featured
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                        {artisan.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="mr-3">{artisan.location}</span>
                        <span className="w-1 h-1 bg-gray-400 rounded-full mr-3"></span>
                        <span className="text-blue-600 font-medium">{artisan.specialty}</span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-700 line-clamp-3">{artisan.story || artisan.bio}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        {artisan.productCount} products
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">View Profile</span>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* No Results State */}
        {!loading && !error && artisans.length === 0 && (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No artisans found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
              {searchQuery || filterFeatured 
                ? "No artisans match your current search criteria. Try adjusting your filters."
                : "No artisans are available at the moment. Check back later!"
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setFilterFeatured(false);
                  fetchArtisans(true);
                }}
                disabled={refreshing}
                variant="outline"
                className="px-8 py-3 rounded-xl border-2 hover:bg-gray-50 transition-all duration-300"
              >
                {refreshing ? "Refreshing..." : "Clear Filters"}
              </Button>
              <Button
                onClick={() => fetchArtisans(true)}
                disabled={refreshing}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Artisan;