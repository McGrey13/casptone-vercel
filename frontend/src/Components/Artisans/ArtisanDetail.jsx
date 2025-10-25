import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { ArrowLeft, Plus, Minus, ShoppingCart } from "lucide-react";
import MessengerPopup from "../Messenger/MessengerPopup";
import { useCart } from "../Cart/CartContext";

const ArtisanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  // State declarations
  const [artisan, setArtisan] = useState({
    id: null,
    name: "",
    location: "",
    specialty: "",
    story: "",
    videoUrl: "",
    average_rating: 0,
    total_reviews: 0,
    image: ""
  });
  const [artisanProducts, setArtisanProducts] = useState([]);
  const [storeData, setStoreData] = useState({
    store: {
      store_name: "",
      store_description: "",
      primary_color: "#6366f1",
      secondary_color: "#f43f5e",
      background_color: "#ffffff",
      text_color: "#1f2937",
      accent_color: "#0ea5e9",
      heading_font: "Inter",
      body_font: "Inter",
      heading_size: 18,
      body_size: 16,
      show_hero_section: true,
      show_featured_products: true,
      desktop_columns: 4,
      mobile_columns: 2,
      product_card_style: "minimal",
      category: ""
    },
    seller: {
      average_rating: 0,
      total_ratings: 0,
      followers_count: 0,
      user: {
        userCity: "",
        userProvince: "",
        userAddress: "",
        userID: null
      }
    },
    logo_url: "",
    background_url: ""
  });
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMessenger, setShowMessenger] = useState(false);
  const [showUnfollowWarning, setShowUnfollowWarning] = useState(false);
  const [discountStats, setDiscountStats] = useState(null);
  const [discountCodes, setDiscountCodes] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [productQuantities, setProductQuantities] = useState({});
  const [addingToCart, setAddingToCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Filter and sort products
  const getFilteredProducts = (products) => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.title && product.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(product =>
        product.category && product.category.toLowerCase().includes(categoryFilter.toLowerCase())
      );
    }

    // Price filter
    if (priceFilter) {
      if (priceFilter === "low") {
        filtered.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
      } else if (priceFilter === "high") {
        filtered.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
      } else if (priceFilter === "0-100") {
        filtered = filtered.filter(product => {
          const price = parseFloat(product.price) || 0;
          return price >= 0 && price <= 100;
        });
      } else if (priceFilter === "100-500") {
        filtered = filtered.filter(product => {
          const price = parseFloat(product.price) || 0;
          return price > 100 && price <= 500;
        });
      } else if (priceFilter === "500-1000") {
        filtered = filtered.filter(product => {
          const price = parseFloat(product.price) || 0;
          return price > 500 && price <= 1000;
        });
      } else if (priceFilter === "1000+") {
        filtered = filtered.filter(product => {
          const price = parseFloat(product.price) || 0;
          return price > 1000;
        });
      }
    }

    // Sort by
    if (sortBy === "newest") {
      filtered.sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB - dateA;
      });
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateA - dateB;
      });
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
    } else if (sortBy === "popular") {
      filtered.sort((a, b) => (parseFloat(b.popularity) || 0) - (parseFloat(a.popularity) || 0));
    }

    return filtered;
  };

  // Follow/Unfollow functionality
  const handleFollow = async () => {
    // If trying to unfollow, show warning first
    if (isFollowing) {
      setShowUnfollowWarning(true);
      return;
    }

    // If following, proceed directly
    await performFollowAction('follow');
  };

  const performFollowAction = async (action) => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem('auth_token');
      if (!token) {
        alert('Please login to follow sellers');
        return;
      }

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api';
      const response = await fetch(`${backendUrl}/sellers/${id}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.is_following);
        
        // Update followers count with the actual count from backend
        if (storeData?.seller && data.followers_count !== undefined) {
          setStoreData(prev => ({
            ...prev,
            seller: {
              ...prev.seller,
              followers_count: data.followers_count
            }
          }));
        }
        
        // Show success message
        if (action === 'follow') {
          alert('Successfully followed! You will now receive updates about new products and offers.');
        } else {
          alert('Successfully unfollowed.');
        }
      } else {
        console.error('Failed to follow/unfollow seller');
        alert('Failed to update follow status. Please try again.');
      }
    } catch (error) {
      console.error('Error following/unfollowing seller:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
      setShowUnfollowWarning(false);
    }
  };

  // Message functionality
  const handleMessage = async () => {
    try {
      const token = sessionStorage.getItem('auth_token');
      if (!token) {
        alert('Please login to send messages');
        return;
      }

      // Show the messenger popup
      setShowMessenger(true);
    } catch (error) {
      console.error('Error initiating message:', error);
    }
  };

  // Share functionality
  const handleShare = () => {
    setShowShareModal(true);
  };

  // Quantity management functions
  const updateQuantity = (productId, change) => {
    setProductQuantities(prev => {
      const currentQty = prev[productId] || 1;
      const newQty = Math.max(1, currentQty + change);
      return { ...prev, [productId]: newQty };
    });
  };

  // Buy Now functionality
  const handleBuyNow = async (product) => {
    const token = sessionStorage.getItem("auth_token");
    if (!token) {
      alert("Please log in to purchase items");
      navigate("/login");
      return;
    }

    const quantity = productQuantities[product.id] || 1;
    navigate("/checkout", { state: { product: { ...product, quantity } } });
  };

  // Add to Cart functionality
  const handleAddToCart = async (product) => {
    const token = sessionStorage.getItem("auth_token");
    if (!token) {
      alert("Please log in to add items to cart");
      navigate("/login");
      return;
    }

    try {
      setAddingToCart(true);
      const quantity = productQuantities[product.id] || 1;
      
      // Ensure product has the correct structure for addToCart
      const productForCart = {
        ...product,
        product_id: product.id, // Ensure product_id is set
        id: product.id
      };
      
      const result = await addToCart(productForCart, quantity);
      if (result.success) {
        alert("Item added to cart successfully!");
      } else {
        alert(result.error || "Failed to add item to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add item to cart. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  useEffect(() => {
    const fetchArtisan = async () => {
      try {
        // Fetch artisan details
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api';
        const res = await fetch(`${backendUrl}/sellers/${id}/details`, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        if (!data || !data.user) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        
        setArtisan({
          id: data.id,
          name: data.user.userName,
          location: data.user.userCity && data.user.userProvince 
            ? `${data.user.userCity}, ${data.user.userProvince}`
            : data.user.userAddress || "Unknown",
          specialty: data.specialty || "Crafts",
          story: data.story || "",
          videoUrl: data.video_url || "",
          average_rating: typeof data.average_rating === 'number' ? data.average_rating : 0,
          total_reviews: typeof data.total_reviews === 'number' ? data.total_reviews : 0,
          image: (() => {
            // Prioritize profile_picture_path from seller data
            if (data.profile_picture_path) {
              const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace('/api', '') || 'http://localhost:8000';
              const imageUrl = `${backendUrl}/storage/${data.profile_picture_path}`;
              return imageUrl;
            }
            // Fallback to user profile_photo_url
            if (data.user.profile_photo_url && data.user.profile_photo_url.trim() !== "") {
              return data.user.profile_photo_url;
            }
            // Default fallback
            return "https://api.dicebear.com/7.x/avataaars/svg?seed=artisan";
          })(),
        });
        
        const mappedProducts = (data.products || []).map((p) => ({
          id: p.id,
          title: p.productName,
          price: p.productPrice,
          image: p.productImage || "",
        }));
        setArtisanProducts(mappedProducts);

        // Fetch store data for this artisan
        try {
          const storeRes = await fetch(`${backendUrl}/sellers/${id}/store`, {
            headers: { Accept: "application/json" },
          });
          if (storeRes.ok) {
            const storeData = await storeRes.json();
            setStoreData(storeData);
          }
        } catch (storeError) {
          console.log("Error fetching store data:", storeError);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchArtisan();

    const intervalId = setInterval(fetchArtisan, 30000);
    return () => clearInterval(intervalId);
  }, [id]);

  // Fetch seller discount statistics
  useEffect(() => {
    const fetchDiscountStats = async () => {
      try {
        if (!id) return;
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api';
        const res = await fetch(`${backendUrl}/analytics/seller/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.discount_stats) {
            setDiscountStats(data.discount_stats);
          }
          if (data && Array.isArray(data.discount_codes)) {
            setDiscountCodes(data.discount_codes);
          }
        }
      } catch (err) {
        console.error('Failed to fetch seller analytics:', err);
      }
    };
    fetchDiscountStats();
    const intervalId = setInterval(fetchDiscountStats, 30000);
    return () => clearInterval(intervalId);
  }, [id]);

  // Fetch Workshops & Events
  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api';
        const res = await fetch(`${backendUrl}/work-and-events/public`);
        if (!res.ok) return;
        const payload = await res.json();
        const list = Array.isArray(payload?.data) ? payload.data : [];
        const filtered = list.filter((item) => String(item?.seller?.sellerID ?? item?.seller_id) === String(id));
        setWorkshops(filtered);
      } catch (e) {
        console.error('Failed to fetch workshops/events:', e);
        setWorkshops([]);
      }
    };
    fetchWorkshops();
    const intervalId = setInterval(fetchWorkshops, 30000);
    return () => clearInterval(intervalId);
  }, [id]);

  // Check follow status
  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        const token = sessionStorage.getItem('auth_token');
        if (!token) return;

        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api';
        const response = await fetch(`${backendUrl}/sellers/${id}/follow-status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setIsFollowing(data.is_following);
        }
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };

    if (id) {
      checkFollowStatus();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg font-semibold text-gray-600 mb-4">Loading...</p>
      </div>
    );
  }

  if (notFound || !artisan) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg font-semibold text-red-600 mb-4">Artisan not found.</p>
        <Link to="/artisan">
          <Button variant="outline">Back to Artisans</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl pt-4 sm:pt-8">
        <Link
          to="/artisan"
          className="inline-flex items-center mb-4 sm:mb-8 text-blue-600 hover:text-blue-800 transition-colors font-semibold cursor-pointer text-sm sm:text-base"
        >
          <ArrowLeft className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          Back to Artisans
        </Link>
      </div>

      {/* Store Preview */}
        <ArtisanStorePreview 
          storeData={storeData} 
          artisan={artisan}
          artisanProducts={artisanProducts}
          videoUrl={artisan.videoUrl}
          onFollow={handleFollow}
          onMessage={handleMessage}
          onShare={handleShare}
          isFollowing={isFollowing}
          isLoading={isLoading}
          discountStats={discountStats}
          discountCodes={discountCodes}
          workshops={workshops}
          productQuantities={productQuantities}
          updateQuantity={updateQuantity}
          handleBuyNow={handleBuyNow}
          handleAddToCart={handleAddToCart}
          addingToCart={addingToCart}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          priceFilter={priceFilter}
          setPriceFilter={setPriceFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          getFilteredProducts={getFilteredProducts}
        />
        
        {/* Messenger Popup */}
        <MessengerPopup
          isOpen={showMessenger}
          onClose={() => setShowMessenger(false)}
          sellerId={id}
          sellerUserId={storeData?.seller?.user?.userID}
          sellerName={artisan?.name}
          sellerAvatar={storeData?.logo_url || artisan?.image}
        />

        {/* Unfollow Warning Modal */}
        {showUnfollowWarning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
            {/* ... [Unfollow warning modal content remains unchanged] */}
          </div>
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
            {/* ... [Share modal content remains unchanged] */}
          </div>
          </div>
        )}
    </div>
  );
};

// Artisan Store Preview Component
const ArtisanStorePreview = ({ 
  storeData, 
  artisan, 
  artisanProducts, 
  onFollow, 
  onMessage, 
  onShare, 
  isFollowing, 
  isLoading, 
  discountCodes = [], 
  workshops = [],
  productQuantities = {},
  updateQuantity,
  handleBuyNow,
  handleAddToCart,
  addingToCart,
  searchQuery,
  setSearchQuery,
  priceFilter,
  setPriceFilter,
  categoryFilter,
  setCategoryFilter,
  sortBy,
  setSortBy,
  getFilteredProducts
}) => {
  // Use real store customization data from database
  // Prepare store data
  const store = {
    name: storeData?.store?.store_name || `${artisan.name}'s Store`,
    logo: storeData?.logo_url || artisan.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=store",
    banner: storeData?.background_url || "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80",
    rating: artisan.average_rating || storeData?.seller?.average_rating || 0,
    total_ratings: artisan.total_reviews || storeData?.seller?.total_ratings || 0,
    followers: storeData?.seller?.followers_count || 0,
    location: storeData?.seller?.user?.userCity && storeData?.seller?.user?.userProvince 
      ? `${storeData.seller.user.userCity}, ${storeData.seller.user.userProvince}`
      : storeData?.seller?.user?.userAddress || artisan.location || "Location not specified",
    description: storeData?.store?.store_description || `Discover amazing products crafted by ${artisan.name}`,
    categories: storeData?.store?.category ? [storeData.store.category] : ["Handcrafted", "Artisan", "Unique"]
  };

  // Transform artisan products to match the expected format
  const products = artisanProducts.map((product, index) => ({
    id: product.id,
    name: product.title,
    title: product.title, // Add title property for compatibility
    price: `₱${Number(product.price).toFixed(2)}`,
    image: product.image || null,
    category: "Handcrafted",
    rating: 4.5 + (index * 0.1),
    isNew: index < 2,
    discount: index === 1 ? 15 : null,
    oldPrice: index === 1 ? `₱${Number(product.price * 1.18).toFixed(2)}` : null,
  }));

  const customization = {
    primary_color: storeData?.store?.primary_color || "#6366f1",
    secondary_color: storeData?.store?.secondary_color || "#f43f5e",
    background_color: storeData?.store?.background_color || "#ffffff",
    text_color: storeData?.store?.text_color || "#1f2937",
    accent_color: storeData?.store?.accent_color || "#0ea5e9",
    heading_font: storeData?.store?.heading_font || "Inter",
    body_font: storeData?.store?.body_font || "Inter",
    heading_size: storeData?.store?.heading_size || 18,
    body_size: storeData?.store?.body_size || 16,
    show_hero_section: storeData?.store?.show_hero_section ?? true,
    show_featured_products: storeData?.store?.show_featured_products ?? true,
    desktop_columns: storeData?.store?.desktop_columns || 4,
    mobile_columns: storeData?.store?.mobile_columns || 2,
    product_card_style: storeData?.store?.product_card_style || "minimal",
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: customization.background_color }}>
      {/* Banner Section */}
      <div className="relative w-full h-48 sm:h-60 md:h-72 lg:h-80 overflow-hidden">
        <img src={store.banner} alt="Store Banner" className="w-full h-full object-cover" />
        <div 
          className="absolute inset-0" 
          style={{ 
            background: `linear-gradient(to bottom, ${customization.primary_color}cc, ${customization.background_color}cc)` 
          }} 
        />
        <div className="absolute inset-x-4 sm:left-8 sm:right-auto bottom-4 sm:bottom-8 flex items-center gap-4 sm:gap-6">
          <div className="-mt-16 sm:-mt-24">
            <div 
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center overflow-hidden border-2 sm:border-4 border-white"
              style={{ backgroundColor: customization.background_color }}
            >
              <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
            </div>
          </div>
          <div>
            <h1 
              className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-2"
              style={{ 
                fontFamily: customization.heading_font,
                fontSize: `clamp(1.5rem, ${customization.heading_size * 1.5}px, ${customization.heading_size * 2.5}px)`
              }}
            >
              {store.name}
            </h1>
            <p 
              className="text-base sm:text-xl font-medium text-white drop-shadow-lg mb-2 sm:mb-4"
              style={{ 
                fontFamily: customization.body_font,
                fontSize: `clamp(1rem, ${customization.body_size}px, ${customization.body_size * 1.2}px)`
              }}
            >
              by {artisan.name}
            </p>
            <div className="hidden sm:flex flex-wrap gap-3 mb-2">
              <span 
                className="flex items-center gap-1 font-semibold px-3 py-1 rounded-full text-base shadow"
                style={{ backgroundColor: customization.background_color, color: customization.primary_color }}
              >
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {store.rating > 0 ? `${store.rating.toFixed(1)} (${store.total_ratings} reviews)` : 'No ratings yet'}
              </span>
              <span 
                className="flex items-center gap-1 font-semibold px-3 py-1 rounded-full text-base shadow"
                style={{ backgroundColor: customization.background_color, color: customization.primary_color }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
                {store.followers > 0 ? `${store.followers.toLocaleString()} followers` : '0 followers'}
              </span>
              <span 
                className="flex items-center gap-1 font-semibold px-3 py-1 rounded-full text-base shadow"
                style={{ backgroundColor: customization.background_color, color: customization.primary_color }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {store.location}
              </span>
            </div>
            <div className="flex sm:hidden items-center gap-2 text-white text-sm">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {store.rating > 0 ? store.rating.toFixed(1) : '0.0'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
                {store.followers > 0 ? `${store.followers.toLocaleString()}` : '0'}
              </span>
            </div>
          </div>
        </div>
        <div className="absolute right-2 sm:right-8 top-2 sm:top-8 flex gap-2 sm:gap-3">
          <div className="sm:hidden">
            <button 
              className="p-2 rounded-lg shadow bg-white text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => {
                const modal = document.createElement('div');
                modal.className = 'fixed inset-0 z-50 flex items-end sm:items-center justify-center';
                modal.innerHTML = `
                  <div class="absolute inset-0 bg-black/50" onclick="this.parentElement.remove()"></div>
                  <div class="relative bg-white w-full max-w-sm mx-4 mb-4 rounded-t-xl sm:rounded-xl shadow-xl overflow-hidden">
                    <div class="p-4 space-y-3">
                      <button class="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left" onclick="this.closest('.fixed').remove(); ${onFollow}()">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                        </svg>
                        <span class="font-medium">${isLoading ? 'Loading...' : (isFollowing ? 'Unfollow' : 'Follow')}</span>
                      </button>
                      <button class="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left" onclick="this.closest('.fixed').remove(); ${onMessage}()">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
                        </svg>
                        <span class="font-medium">Message</span>
                      </button>
                      <button class="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left" onclick="this.closest('.fixed').remove(); ${onShare}()">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                        </svg>
                        <span class="font-medium">Share</span>
                      </button>
                    </div>
                    <div class="p-4 border-t">
                      <button class="w-full p-3 text-center text-gray-500 hover:text-gray-600" onclick="this.closest('.fixed').remove()">
                        Cancel
                      </button>
                    </div>
                  </div>
                `;
                document.body.appendChild(modal);
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </button>
          </div>
          <div className="hidden sm:flex gap-3">
            <button 
              className="font-semibold px-5 py-2 rounded-lg shadow flex items-center gap-2 border transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: customization.background_color, 
                color: customization.primary_color,
                borderColor: customization.primary_color
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.backgroundColor = customization.accent_color;
                  e.target.style.color = customization.text_color;
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.target.style.backgroundColor = customization.background_color;
                  e.target.style.color = customization.primary_color;
                }
              }}
              onClick={onFollow}
              disabled={isLoading}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              {isLoading ? 'Loading...' : (isFollowing ? 'Unfollow' : 'Follow')}
            </button>
            <button 
              className="font-semibold px-5 py-2 rounded-lg shadow flex items-center gap-2 border transition"
              style={{ 
                backgroundColor: customization.background_color, 
                color: customization.primary_color,
                borderColor: customization.primary_color
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = customization.accent_color;
                e.target.style.color = customization.text_color;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = customization.background_color;
                e.target.style.color = customization.primary_color;
              }}
              onClick={onMessage}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              Message
            </button>
            <button 
              className="font-semibold px-5 py-2 rounded-lg shadow flex items-center gap-2 border transition"
              style={{ 
                backgroundColor: customization.background_color, 
                color: customization.primary_color,
                borderColor: customization.primary_color
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = customization.accent_color;
                e.target.style.color = customization.text_color;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = customization.background_color;
                e.target.style.color = customization.primary_color;
              }}
              onClick={onShare}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Store Description & Categories */}
      <div className="max-w-5xl mx-auto mt-6 sm:mt-8 z-10 relative px-4 sm:px-6">
        <div 
          className="rounded-xl sm:rounded-2xl shadow p-4 sm:p-6 flex flex-col gap-3 sm:gap-4"
          style={{ backgroundColor: customization.background_color }}
        >
          <div>
            <p 
              className="text-xl sm:text-2xl font-semibold mb-2"
              style={{ 
                color: customization.text_color,
                fontFamily: customization.heading_font,
                fontSize: `clamp(1.25rem, ${customization.heading_size}px, ${customization.heading_size * 1.3}px)`
              }}
            >
              {store.description}
            </p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {store.categories.map((cat) => (
                <span 
                  key={String(cat)} 
                  className="font-medium sm:font-semibold px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm shadow-sm sm:shadow"
                  style={{ 
                    backgroundColor: customization.accent_color, 
                    color: customization.text_color 
                  }}
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
            
      {/* Seller Discounts */}
      <div className="max-w-5xl mx-auto mt-4 sm:mt-6 z-10 relative px-4 sm:px-6">
        {/* ... [Discounts content remains unchanged] */}
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-5xl mx-auto mt-16 mb-8">
        <div 
          className="rounded-xl shadow p-4 sm:p-6"
          style={{ backgroundColor: customization.background_color }}
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {/* Search Bar */}
            <div className="flex-1 w-full sm:w-auto">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 rounded-lg border focus:outline-none focus:ring-2 text-sm"
                  style={{ 
                    borderColor: customization.accent_color,
                    backgroundColor: customization.background_color,
                    color: customization.text_color,
                    focusRingColor: customization.accent_color
                  }}
                />
                <svg 
                  className="absolute left-3 top-2.5 h-4 w-4" 
                  style={{ color: customization.text_color }}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Price Filter */}
            <div className="w-full sm:w-auto">
              <select 
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border font-semibold text-sm w-full sm:w-auto"
                style={{ 
                  borderColor: customization.accent_color,
                  backgroundColor: customization.background_color,
                  color: customization.text_color
                }}
              >
                <option value="">Price Range</option>
                <option value="low">Low to High</option>
                <option value="high">High to Low</option>
                <option value="0-100">₱0 - ₱100</option>
                <option value="100-500">₱100 - ₱500</option>
                <option value="500-1000">₱500 - ₱1,000</option>
                <option value="1000+">₱1,000+</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="w-full sm:w-auto">
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border font-semibold text-sm w-full sm:w-auto"
                style={{ 
                  borderColor: customization.accent_color,
                  backgroundColor: customization.background_color,
                  color: customization.text_color
                }}
              >
                <option value="">All Categories</option>
                <option value="handcrafted">Handcrafted</option>
                <option value="jewelry">Jewelry</option>
                <option value="home-decor">Home Decor</option>
                <option value="textiles">Textiles</option>
                <option value="pottery">Pottery</option>
                <option value="woodwork">Woodwork</option>
                <option value="metalwork">Metalwork</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="w-full sm:w-auto">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg border font-semibold text-sm w-full sm:w-auto"
                style={{ 
                  borderColor: customization.accent_color,
                  backgroundColor: customization.background_color,
                  color: customization.text_color
                }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="max-w-5xl mx-auto mb-12">
        <div className="text-center mb-8">
          <h2 
            className="text-3xl font-extrabold mb-2"
            style={{ 
              color: customization.primary_color,
              fontFamily: customization.heading_font,
              fontSize: `${customization.heading_size * 1.8}px`
            }}
          >
            Featured Products
          </h2>
          <p 
            className="text-lg"
            style={{ 
              color: customization.text_color,
              fontFamily: customization.body_font,
              fontSize: `${customization.body_size}px`
            }}
          >
            Discover our handpicked favorites
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {getFilteredProducts(artisanProducts).map((product, index) => (
            <div
              key={product.id}
              className="rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 relative group cursor-pointer"
              style={{ backgroundColor: customization.background_color }}
            >
              <div className="absolute top-3 right-3 z-10">
                <span 
                  className="font-bold px-2 py-1 rounded-full text-xs shadow"
                  style={{ 
                    backgroundColor: customization.accent_color,
                    color: customization.text_color
                  }}
                >
                  Featured
                </span>
              </div>
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center group-hover:bg-gray-300 transition duration-300">
                  <div className="text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm font-medium">No Image</p>
                  </div>
                </div>
              )}
              <div className="p-4">
                <div 
                  className="text-xs font-bold mb-1 uppercase tracking-wide"
                  style={{ color: customization.primary_color }}
                >
                  Handcrafted
                </div>
                <h3 
                  className="font-bold text-lg mb-2 group-hover:transition"
                  style={{ 
                    color: customization.text_color,
                    fontFamily: customization.heading_font,
                    fontSize: `${customization.heading_size}px`
                  }}
                >
                  {product.title}
                </h3>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500">★</span>
                  ))}
                  <span className="text-xs ml-1" style={{ color: customization.text_color }}>({4.5 + (index * 0.1)})</span>
                </div>
                {/* Quantity Controls */}
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(product.id, -1)}
                    className="w-8 h-8 p-0"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-lg font-semibold min-w-[2rem] text-center" style={{ color: customization.text_color }}>
                    {productQuantities[product.id] || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(product.id, 1)}
                    className="w-8 h-8 p-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span 
                    className="font-bold text-xl"
                    style={{ 
                      color: customization.primary_color,
                      fontSize: `${customization.heading_size * 1.2}px`
                    }}
                  >
                    ₱{Number(product.price).toFixed(2)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAddToCart(product)}
                    disabled={addingToCart}
                    className="flex-1 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white font-semibold py-2 text-sm"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>

                {/* View Product Link */}
                <Link to={`/product/${product.id}`} className="mt-3">
                  <Button
                    variant="outline"
                    className="w-full font-semibold py-2 rounded-lg shadow hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 text-sm"
                    style={{ 
                      borderColor: customization.accent_color,
                      color: customization.accent_color,
                      focusRingColor: customization.accent_color
                    }}
                  >
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search, Filters, Sort Bar */}
      <div className="px-4 sm:px-6 max-w-5xl mx-auto mt-6 sm:mt-8">
        {/* ... [Search and filters content remains unchanged] */}
                  </div>

      {/* Product Grid */}
      <div className="px-4 sm:px-6 max-w-5xl mx-auto mt-6 sm:mt-8 mb-8 sm:mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {getFilteredProducts(products).length > 0 ? (
          getFilteredProducts(products).filter((product, index) => index >= 4).map((product, index) => (
            <div
              key={`prod-${product.id ?? index}`}
              className="rounded-xl sm:rounded-2xl shadow p-4 sm:p-5 flex flex-col relative group transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
              style={{ 
                minHeight: 550,
                backgroundColor: customization.background_color
              }}
            >
                  {/* Product Card Content */}
                {product.isNew && (
                  <span 
                    className="absolute top-3 left-3 font-bold px-3 py-1 rounded-full text-xs shadow transition"
                    style={{ 
                      backgroundColor: customization.accent_color,
                      color: customization.text_color
                    }}
                  >
                    New
                        </span>
                )}
                {product.discount && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white font-bold px-2 py-1 rounded-full text-xs shadow group-hover:bg-red-400 transition">
                      -{product.discount}%
                    </span>
                )}
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-56 object-cover rounded-xl mb-5 group-hover:brightness-95 group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-56 bg-gray-200 rounded-xl mb-5 flex items-center justify-center group-hover:bg-gray-300 transition duration-300">
                    <div className="text-center text-gray-500">
                      <svg className="w-14 h-14 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm font-medium">No Image</p>
  </div>
                  </div>
                )}
                <div
                  className="text-xs font-bold mb-1 uppercase inline-block px-2 py-1 rounded transition"
                  style={{ 
                    letterSpacing: 1,
                    color: customization.primary_color,
                    backgroundColor: `${customization.accent_color}20`
                  }}
                >
                  {product.category}
                </div>
                <h3 
                  className="font-semibold text-lg mb-2 transition"
                  style={{ 
                    color: customization.text_color,
                    fontFamily: customization.heading_font,
                    fontSize: `${customization.heading_size * 1.1}px`
                  }}
                >
                  {product.name}
                </h3>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(Math.floor(product.rating))].map((_, i) => (
                    <span key={i} className="text-yellow-500 drop-shadow">★</span>
                  ))}
                  {product.rating % 1 !== 0 && <span className="text-yellow-500 drop-shadow">★</span>}
                  <span className="text-xs ml-1" style={{ color: customization.text_color }}>({product.rating})</span>
                </div>
                <div className="flex items-end gap-2 mb-3">
                  <span 
                    className="font-bold text-xl transition"
                    style={{ 
                      color: customization.primary_color,
                      fontSize: `${customization.heading_size * 1.3}px`
                    }}
                  >
                    {product.price}
                  </span>
                  {product.oldPrice && <span className="text-gray-400 line-through text-sm">{product.oldPrice}</span>}
            </div>
                {/* Quantity Controls */}
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(product.id, -1)}
                    className="w-8 h-8 p-0"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-lg font-semibold min-w-[2rem] text-center" style={{ color: customization.text_color }}>
                    {productQuantities[product.id] || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(product.id, 1)}
                    className="w-8 h-8 p-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAddToCart(product)}
                    disabled={addingToCart}
                    className="flex-1 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white font-semibold py-2 text-sm"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>

                {/* View Product Link */}
                <Link to={`/product/${product.id}`} className="mt-2">
                  <Button
                    variant="outline"
                    className="w-full font-semibold py-2 rounded-lg shadow hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 text-sm"
                    style={{ 
                      borderColor: customization.accent_color,
                      color: customization.accent_color,
                      focusRingColor: customization.accent_color
                    }}
                  >
                    View Details
                  </Button>
                </Link>
            </div>
          ))
        ) : (
            <div className="col-span-full text-center py-20">
            <p className="text-lg" style={{ color: customization.text_color }}>
              No products available yet.
            </p>
          </div>
        )}
        </div>
      </div>

      {/* Workshops & Events Section */}
      <div className="px-4 sm:px-6 max-w-5xl mx-auto mt-8 sm:mt-16 mb-8 sm:mb-12">
        <div className="text-center mb-6 sm:mb-8">
          <h2 
            className="text-2xl sm:text-3xl font-extrabold mb-2"
            style={{ 
              color: customization.primary_color,
              fontFamily: customization.heading_font,
              fontSize: `clamp(1.5rem, ${customization.heading_size * 1.5}px, ${customization.heading_size * 1.8}px)`
            }}
          >
            Workshops & Events
          </h2>
          <p 
            className="text-base sm:text-lg"
            style={{ 
              color: customization.text_color,
              fontFamily: customization.body_font,
              fontSize: `clamp(1rem, ${customization.body_size}px, ${customization.body_size * 1.1}px)`
            }}
          >
            Learn hands-on crafting skills and join our community events
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(workshops) && workshops.length > 0 ? (
            workshops.map((ev, idx) => (
              <div
                key={ev.works_and_events_id ?? `${ev.title ?? 'we'}-${idx}`}
                className="rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 relative"
                style={{ backgroundColor: customization.background_color }}
              >
                <div className="absolute top-3 right-3 z-10">
                  <span className="font-bold px-2 py-1 rounded-full text-xs shadow bg-blue-200 text-blue-800">
                    Workshop
                  </span>
                </div>
                {ev.image_url ? (
                  <img
                    src={ev.image_url}
                    alt={ev.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm font-medium">No Image</p>
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <h3 
                    className="font-bold text-xl mb-2"
                    style={{ 
                      color: customization.text_color,
                      fontFamily: customization.heading_font,
                      fontSize: `${customization.heading_size * 1.1}px`
                    }}
                  >
                    {ev.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm mb-2" style={{ color: customization.text_color }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{new Date(ev.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mb-2" style={{ color: customization.text_color }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12,6 12,12 16,14"></polyline>
                    </svg>
                    <span>{ev.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mb-4" style={{ color: customization.text_color }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>{ev.participants} participants</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span 
                      className="font-bold text-xl"
                      style={{ 
                        color: customization.primary_color,
                        fontSize: `${customization.heading_size * 1.2}px`
                      }}
                    >
                      {ev.link ? 'View Details' : 'Free Entry'}
                    </span>
                    <button 
                      className="font-semibold px-4 py-2 rounded-lg hover:transition"
                      style={{ 
                        backgroundColor: customization.accent_color,
                        color: customization.text_color
                      }}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10" style={{ color: customization.text_color }}>
              No workshops or events yet.
            </div>
          )}
        </div>
        </div>
    </div>
  );
};

export default ArtisanDetail;