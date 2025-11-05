import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, MessageCircle, Heart, Share2, MapPin, Calendar, Users, CheckCircle, BookOpen, Users as UsersIcon, Clock } from "lucide-react";
import api from "../api";

// Default store data (fallback)
const defaultStore = {
  name: "Loading Store...",
  logo: null,
  banner: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80",
  rating: 0,
  followers: 0,
  location: "Loading...",
  yearsActive: 0,
  description: "Loading store information...",
  categories: [],
};

// Sample data for Featured Products
const featuredProducts = [
  {
    id: 1,
    name: "Premium Ceramic Bowl Set",
    price: "₱1,299.00",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=400&q=80",
    category: "Ceramic",
    rating: 4.9,
    badge: "Best Seller",
  },
  {
    id: 2,
    name: "Handwoven Basket Collection",
    price: "₱899.00",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80",
    category: "Woven",
    rating: 4.8,
    badge: "Featured",
  },
  {
    id: 3,
    name: "Artisan Wooden Serving Tray",
    price: "₱1,599.00",
    image: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&w=400&q=80",
    category: "Wood",
    rating: 4.7,
    badge: "New",
  },
  {
    id: 4,
    name: "Handmade Candle Set",
    price: "₱699.00",
    image: "https://images.unsplash.com/photo-1602874801006-09b9ed01a8e7?auto=format&fit=crop&w=400&q=80",
    category: "Candles",
    rating: 4.6,
    badge: "Popular",
  },
];

// Sample data for Workshops & Events (Combined)
const workshopsAndEvents = [
  {
    id: 1,
    title: "Macrame Basics Workshop",
    date: "October 15, 2023",
    time: "2:00 PM - 5:00 PM",
    price: "₱1,200.00",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    spots: "10 spots",
    type: "Workshop",
  },
  {
    id: 2,
    title: "Artisan Market Day",
    date: "October 20, 2023",
    time: "9:00 AM - 6:00 PM",
    price: "Free Entry",
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca6e71?auto=format&fit=crop&w=400&q=80",
    spots: "Open to All",
    type: "Event",
  },
  {
    id: 3,
    title: "Ceramic Pottery Class",
    date: "November 5, 2023",
    time: "10:00 AM - 1:00 PM",
    price: "₱1,500.00",
    image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    spots: "8 spots",
    type: "Workshop",
  },
  {
    id: 4,
    title: "Maker's Meetup",
    date: "November 18, 2023",
    time: "6:00 PM - 9:00 PM",
    price: "₱200.00",
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587206?auto=format&fit=crop&w=400&q=80",
    spots: "30 attendees",
    type: "Event",
  },
  {
    id: 5,
    title: "Woodworking Essentials",
    date: "December 10, 2023",
    time: "9:00 AM - 4:00 PM",
    price: "₱2,000.00",
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    spots: "6 spots",
    type: "Workshop",
  },
  {
    id: 6,
    title: "Holiday Craft Fair",
    date: "December 15, 2023",
    time: "10:00 AM - 8:00 PM",
    price: "₱50.00",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80",
    spots: "500 attendees",
    type: "Event",
  },
];

const displayProducts = [
  {
    id: 1,
    name: "Ceramic Vase",
    price: "₱499.00",
    image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    category: "Handcrafted",
    rating: 4.7,
    isNew: true,
    discount: null,
    oldPrice: null,
  },
  {
    id: 2,
    name: "Macrame Wall Hanging",
    price: "₱899.00",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    category: "Artisan",
    rating: 4.6,
    isNew: true,
    discount: 15,
    oldPrice: "₱1,050.00",
  },
  {
    id: 3,
    name: "Wooden Jewelry Box",
    price: "₱1,299.00",
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    category: "Unique",
    rating: 4.9,
    isNew: false,
    discount: null,
    oldPrice: null,
  },
];

const StoreView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState(defaultStore);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchStoreData();
    }
  }, [id]);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch store data using the same endpoint as ArtisanDetail
      const storeResponse = await fetch(`https://craftconnect-laravel-backend-1.onrender.com/api/sellers/${id}/store`, {
        headers: { Accept: "application/json" },
      });
      
      if (!storeResponse.ok) {
        throw new Error('Store not found');
      }
      
      const storeData = await storeResponse.json();
      console.log('Store data received:', storeData);
      
      // Transform store data to match our UI structure (same as ArtisanDetail)
      const transformedStore = {
        name: storeData.store?.store_name || "Unknown Store",
        logo: storeData.logo_url || null,
        banner: storeData.background_url || "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80",
        rating: storeData.seller?.average_rating || 0,
        followers: storeData.seller?.followers_count || 0,
        location: storeData.seller?.user?.userCity && storeData.seller?.user?.userProvince 
          ? `${storeData.seller.user.userCity}, ${storeData.seller.user.userProvince}`
          : storeData.seller?.user?.userAddress || "Location not specified",
        yearsActive: storeData.seller?.created_at 
          ? Math.floor((new Date() - new Date(storeData.seller.created_at)) / (1000 * 60 * 60 * 24 * 365))
          : 0,
        description: storeData.store?.store_description || "No description available",
        categories: storeData.store?.category ? [storeData.store.category] : [],
        seller: storeData.seller || null
      };
      
      setStore(transformedStore);
      
      // Fetch products using the seller ID
      const sellerId = storeData.seller?.sellerID;
      if (sellerId) {
        const productsResponse = await fetch(`https://craftconnect-laravel-backend-1.onrender.com/api/sellers/${sellerId}/approvedProduct`, {
          headers: { Accept: "application/json" },
        });
        
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          
          // Transform products data
          const transformedProducts = Array.isArray(productsData) ? productsData.map(product => ({
            id: product.productID || product.product_id || product.id,
            name: product.productName || product.name,
            price: `₱${parseFloat(product.price || 0).toFixed(2)}`,
            image: product.productImage || product.image || null,
            category: product.category || "General",
            rating: product.average_rating || 0,
            isNew: product.created_at ? new Date(product.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) : false,
            discount: null,
            oldPrice: null,
          })) : [];
          
          setProducts(transformedProducts);
        }
      }
      
    } catch (error) {
      console.error('Error fetching store data:', error);
      setError('Failed to load store data');
      setStore({
        ...defaultStore,
        name: "Store Not Found",
        description: "The requested store could not be found or is no longer available."
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf6e3] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a67c68] mx-auto mb-4"></div>
          <p className="text-[#a67c68] text-lg">Loading store...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fdf6e3] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏪</div>
          <h2 className="text-2xl font-bold text-[#a67c68] mb-4">Store Not Found</h2>
          <p className="text-[#a67c68] mb-6">The store you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/home')}
            className="bg-[#ffe082] text-[#a67c68] font-semibold px-6 py-3 rounded-lg hover:bg-[#ffd54f] transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf6e3]">
      {/* Professional Back Button */}
      <div className="max-w-5xl mx-auto pt-8 pb-2 flex items-center">
        <button
          onClick={() => window.history.back()}
          className="group flex items-center gap-2 px-3 py-2 bg-white/80 text-[#a67c68] rounded-full font-semibold border border-[#ffe082] shadow-md hover:bg-[#ffe082] hover:text-[#7c4f2c] focus:outline-none focus:ring-2 focus:ring-[#ffe082] transition-all duration-200 backdrop-blur-md"
          style={{ boxShadow: '0 2px 8px 0 rgba(166,124,104,0.08)' }}
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" className="-ml-1 group-hover:-translate-x-1 transition-transform duration-200"><circle cx="12" cy="12" r="12" fill="#ffe082" className="opacity-0 group-hover:opacity-30 transition"/><path d="M15 19l-7-7 7-7" stroke="#a67c68" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="hidden sm:inline-block">Back</span>
        </button>
      </div>
      {/* Banner with overlay */}
      <div className="relative w-full h-60 md:h-72 lg:h-80 overflow-hidden">
        <img src={store.banner} alt="Store Banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#a67c68cc] to-[#fdf6e3cc]" />
        <div className="absolute left-8 bottom-8 flex items-center gap-6">
          <div className="-mt-24">
            <div className="w-32 h-32 rounded-2xl bg-[#fdf6e3] shadow-lg flex items-center justify-center overflow-hidden border-4 border-white">
              <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-4">{store.name}</h1>
            <div className="flex flex-wrap gap-3 mb-2">
              <span className="flex items-center gap-1 bg-[#fdf6e3] text-[#a67c68] font-semibold px-3 py-1 rounded-full text-base shadow"><Star className="w-5 h-5 text-yellow-500" /> {store.rating} rating</span>
              <span className="flex items-center gap-1 bg-[#fdf6e3] text-[#a67c68] font-semibold px-3 py-1 rounded-full text-base shadow"><Users className="w-5 h-5" /> {store.followers.toLocaleString()} followers</span>
              <span className="flex items-center gap-1 bg-[#fdf6e3] text-[#a67c68] font-semibold px-3 py-1 rounded-full text-base shadow"><MapPin className="w-5 h-5" /> {store.location}</span>
              <span className="flex items-center gap-1 bg-[#fdf6e3] text-[#a67c68] font-semibold px-3 py-1 rounded-full text-base shadow"><Calendar className="w-5 h-5" /> {store.yearsActive} years active</span>
            </div>
          </div>
        </div>
        <div className="absolute right-8 top-8 flex gap-3">
          <button className="bg-[#fdf6e3] text-[#a67c68] font-semibold px-5 py-2 rounded-lg shadow flex items-center gap-2 border border-[#a67c68] hover:bg-[#f5e9da] transition"><Heart className="w-5 h-5" /> Follow</button>
          <button className="bg-[#fdf6e3] text-[#a67c68] font-semibold px-5 py-2 rounded-lg shadow flex items-center gap-2 border border-[#a67c68] hover:bg-[#f5e9da] transition"><MessageCircle className="w-5 h-5" /> Message</button>
          <button className="bg-[#fdf6e3] text-[#a67c68] font-semibold px-5 py-2 rounded-lg shadow flex items-center gap-2 border border-[#a67c68] hover:bg-[#f5e9da] transition"><Share2 className="w-5 h-5" /></button>
        </div>
      </div>
      {/* Store Description & Categories */}
      <div className="max-w-5xl mx-auto mt-8 z-10 relative">
        <div className="bg-[#fffbe6] rounded-2xl shadow p-6 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <p className="text-[#a67c68] text-lg font-medium mb-3">{store.description}</p>
            <div className="flex flex-wrap gap-2">
              {store.categories.map((cat) => (
                <span key={cat} className="bg-[#ffe082] text-[#a67c68] font-semibold px-4 py-1 rounded-full text-sm shadow">{cat}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Search, Filters, Sort Bar */}
      <div className="max-w-5xl mx-auto mt-8 flex flex-col md:flex-row items-center gap-4 bg-[#fffbe6] rounded-xl shadow p-4">
        <div className="flex-1 flex items-center gap-2">
          <div className="relative w-full">
            <input type="text" placeholder="Search products..." className="w-full px-4 py-2 rounded-lg border border-[#ffe082] bg-[#fffbe6] text-[#a67c68] focus:outline-none focus:ring-2 focus:ring-[#ffe082]" />
            <span className="absolute left-2 top-2.5 text-[#a67c68]">🔍</span>
          </div>
          <button className="px-4 py-2 bg-[#ffe082] text-[#a67c68] rounded-lg font-semibold border border-[#ffe082] hover:bg-[#f5e9da] transition">Filters</button>
        </div>
        <select className="px-4 py-2 rounded-lg border border-[#ffe082] bg-[#fffbe6] text-[#a67c68] font-semibold">
          <option>All</option>
        </select>
        <div className="text-[#a67c68] font-semibold">{products.length} products</div>
        <div className="flex items-center gap-2">
          <span className="text-[#a67c68] font-semibold">Sort:</span>
          <select className="px-2 py-1 rounded-lg border border-[#ffe082] bg-[#fffbe6] text-[#a67c68] font-semibold">
            <option>Most Popular</option>
          </select>
          <button className="p-2 rounded-lg border border-[#ffe082] bg-[#fffbe6] text-[#a67c68] hover:bg-[#ffe082] transition"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="2" fill="#a67c68"/><rect x="14" y="3" width="7" height="7" rx="2" fill="#a67c68"/><rect x="14" y="14" width="7" height="7" rx="2" fill="#a67c68"/><rect x="3" y="14" width="7" height="7" rx="2" fill="#a67c68"/></svg></button>
          <button className="p-2 rounded-lg border border-[#ffe082] bg-[#fffbe6] text-[#a67c68] hover:bg-[#ffe082] transition"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="3" rx="1.5" fill="#a67c68"/><rect x="3" y="10.5" width="18" height="3" rx="1.5" fill="#a67c68"/><rect x="3" y="18" width="18" height="3" rx="1.5" fill="#a67c68"/></svg></button>
        </div>
      </div>
      {/* Product Grid */}
      <div className="max-w-5xl mx-auto mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.length > 0 ? (
          products.map((product) => (
          <div
            key={product.id}
            className="bg-[#fffbe6] rounded-2xl shadow p-4 flex flex-col relative group transition-transform duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
            style={{ minHeight: 400 }}
          >
            {product.isNew && (
              <span className="absolute top-3 left-3 bg-[#ffe082] text-[#a67c68] font-bold px-3 py-1 rounded-full text-xs shadow group-hover:bg-[#ffecb3] transition">New</span>
            )}
            {product.discount && (
              <span className="absolute top-3 left-3 bg-red-500 text-white font-bold px-2 py-1 rounded-full text-xs shadow group-hover:bg-red-400 transition">-{product.discount}%</span>
            )}
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover rounded-xl mb-4 group-hover:brightness-95 group-hover:scale-105 transition duration-300"
            />
            <div
              className="text-xs font-bold text-[#a67c68] mb-1 uppercase inline-block px-2 py-1 rounded group-hover:bg-[#ffe082] group-hover:text-[#7c4f2c] transition"
              style={{ letterSpacing: 1 }}
            >
              {product.category}
            </div>
            <h3 className="font-semibold text-[#a67c68] text-lg mb-1 group-hover:text-[#7c4f2c] transition">{product.name}</h3>
            <div className="flex items-center gap-1 mb-2">
              {[...Array(Math.floor(product.rating))].map((_, i) => (
                <span key={i} className="text-yellow-500 drop-shadow">★</span>
              ))}
              {product.rating % 1 !== 0 && <span className="text-yellow-500 drop-shadow">★</span>}
              <span className="text-[#a67c68] text-xs ml-1">({product.rating})</span>
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-[#a67c68] font-bold text-xl group-hover:text-[#7c4f2c] transition">{product.price}</span>
              {product.oldPrice && <span className="text-gray-400 line-through text-sm">{product.oldPrice}</span>}
            </div>
            <button
              className="mt-auto w-full bg-[#ffe082] text-[#a67c68] font-semibold py-2 rounded-lg shadow hover:bg-[#ffd54f] hover:text-[#7c4f2c] hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#ffe082]"
            >
              View Product
            </button>
          </div>
        ))
        ) : (
          <div className="col-span-full text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-[#a67c68] mb-4">No Products Available</h3>
            <p className="text-[#a67c68] text-lg">This store hasn't added any products yet.</p>
          </div>
        )}
      </div>

      {/* Featured Products Section */}
      <div className="max-w-5xl mx-auto mt-16 mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-[#a67c68] mb-2">Featured Products</h2>
          <p className="text-[#a67c68] text-lg">Discover our handpicked favorites</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.length > 0 ? products.slice(0, 4).map((product) => (
            <div
              key={product.id}
              className="bg-[#fffbe6] rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-[#ffe082] relative group cursor-pointer"
            >
              <div className="absolute top-3 right-3 z-10">
                <span className="bg-[#ffe082] text-[#a67c68] font-bold px-2 py-1 rounded-full text-xs shadow">
                  {product.badge}
                </span>
              </div>
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="p-4">
                <div className="text-xs font-bold text-[#a67c68] mb-1 uppercase tracking-wide">
                  {product.category}
                </div>
                <h3 className="font-bold text-[#a67c68] text-lg mb-2 group-hover:text-[#7c4f2c] transition">
                  {product.name}
                </h3>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(Math.floor(product.rating))].map((_, i) => (
                    <span key={i} className="text-yellow-500">★</span>
                  ))}
                  <span className="text-[#a67c68] text-xs ml-1">({product.rating})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#a67c68] font-bold text-xl">{product.price}</span>
                  <button className="bg-[#ffe082] text-[#a67c68] font-semibold px-3 py-1 rounded-lg hover:bg-[#ffd54f] transition text-sm">
                    View
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-bold text-[#a67c68] mb-4">No Featured Products</h3>
              <p className="text-[#a67c68] text-lg">This store hasn't added any products yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Workshops & Events Section */}
      <div className="max-w-5xl mx-auto mt-16 mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-[#a67c68] mb-2">Workshops & Events</h2>
          <p className="text-[#a67c68] text-lg">Learn hands-on crafting skills and join our community events</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workshopsAndEvents.map((item) => (
            <div
              key={item.id}
              className="bg-[#fffbe6] rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-[#ffe082] relative"
            >
              <div className="absolute top-3 right-3 z-10">
                <span className={`font-bold px-2 py-1 rounded-full text-xs shadow ${
                  item.type === 'Workshop' 
                    ? 'bg-blue-200 text-blue-800' 
                    : 'bg-green-200 text-green-800'
                }`}>
                  {item.type}
                </span>
              </div>
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="font-bold text-[#a67c68] text-xl mb-2">{item.title}</h3>
                <div className="flex items-center gap-2 text-[#a67c68] text-sm mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>{item.date}</span>
                </div>
                <div className="flex items-center gap-2 text-[#a67c68] text-sm mb-2">
                  <Clock className="w-4 h-4" />
                  <span>{item.time}</span>
                </div>
                <div className="flex items-center gap-2 text-[#a67c68] text-sm mb-4">
                  <UsersIcon className="w-4 h-4" />
                  <span>{item.spots}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#a67c68] font-bold text-xl">{item.price}</span>
                  <button className="bg-[#ffe082] text-[#a67c68] font-semibold px-4 py-2 rounded-lg hover:bg-[#ffd54f] transition">
                    {item.type === 'Workshop' ? 'Book Now' : 'Join Event'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoreView;