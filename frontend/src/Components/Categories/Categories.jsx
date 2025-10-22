import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Store, MapPin, Star, Users } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import api from "../../api";


const CategoriesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [stores, setStores] = useState([]);
  const [allStores, setAllStores] = useState([]); // Keep original data for filtering
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Fetch stores on component mount
  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async (searchTerm = "") => {
    try {
      setLoading(true);
      setError(null);
      
      // Build URL with search parameter if provided
      const url = searchTerm 
        ? `/stores?search=${encodeURIComponent(searchTerm)}`
        : "/stores";
      
      const response = await api.get(url);

      const data = response.data;
      const storesData = data.data || data;
      
      // Fix image URLs in the data
      const fixedStoresData = storesData.map(store => ({
        ...store,
        logo_url: fixImageUrl(store.logo_url)
      }));
      
      setStores(fixedStoresData);
      
      // Keep original data if no search term
      if (!searchTerm) {
        setAllStores(fixedStoresData);
      }
    } catch (error) {
      setError("Error fetching stores");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    
    if (trimmedQuery === "") {
      // If no search term, show all stores
      setStores(allStores);
    } else {
      // Make API call with search term
      fetchStores(trimmedQuery);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center mb-6 text-sm">
          <Link to="/" className="text-black">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium">Categories</span>
        </div>

        {/* Page Title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Browse Artisan Stores</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover unique handcrafted products from talented artisans across Laguna
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-grow">
              <Input
                type="search"
                placeholder="Search stores, artisans, or specialties..."
                className="w-full pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search className="h-4 w-4" />
              </div>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setSearchQuery("");
                fetchStores();
              }}
              disabled={loading}
            >
              Refresh
            </Button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading artisan stores...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <Store className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-semibold">Error loading stores</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button onClick={fetchStores} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* Stores Grid */}
        {!loading && !error && stores.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            {stores.map((store) => (
              <Link to={`/artisan/${store.seller?.sellerID || store.user?.userID}`} key={store.storeID}>
                <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-200">
                  {/* Store Logo/Image */}
                  <div className="relative h-32 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    {store.logo_url ? (
                      <img
                        src={store.logo_url}
                        alt={store.store_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Store className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/10 hover:bg-black/5 transition-colors"></div>
                  </div>
                  
                  {/* Store Info */}
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <h3 className="font-bold text-sm line-clamp-1 text-gray-900">
                        {store.store_name || "Unnamed Store"}
                      </h3>
                      
                      <div className="flex items-center text-xs text-gray-600">
                        <Users className="h-3 w-3 mr-1" />
                        <span className="line-clamp-1">
                          {store.seller?.user?.userName || store.user?.userName || store.owner_name || "Artisan"}
                        </span>
                      </div>
                      
                      {/* Rating Display */}
                      {store.average_rating > 0 && (
                        <div className="flex items-center text-xs">
                          <Star className="h-3 w-3 mr-1 text-yellow-400 fill-yellow-400" />
                          <span className="font-semibold text-gray-800">{store.average_rating}</span>
                          <span className="ml-1 text-gray-500">({store.total_ratings})</span>
                        </div>
                      )}
                      
                      {store.seller?.specialty && (
                        <div className="flex items-center text-xs text-blue-600">
                          <Star className="h-3 w-3 mr-1" />
                          <span className="line-clamp-1">{store.seller.specialty}</span>
                        </div>
                      )}
                      
                      {store.user?.userAddress && (
                        <div className="flex items-center text-xs text-gray-500">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="line-clamp-1">{store.user.userAddress}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* No Stores Found */}
        {!loading && !error && stores.length === 0 && (
          <div className="text-center py-12">
            <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No stores found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? "No stores match your search criteria" : "No artisan stores are available at the moment"}
            </p>
            {searchQuery && (
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setStores(allStores);
                }}
                variant="outline"
              >
                Clear Search
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
