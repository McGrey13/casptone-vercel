import React, { useEffect, useState } from "react";
import HeroSection from "./Home/HeroSection";
import CategoryGrid from "./Home/CategoryGrid";
import FeaturedProducts from "./product/FeaturedProducts";
import { useCart } from "./Cart/CartContext";
import { useFavorites } from "./favorites/FavoritesContext";
import NotificationModal from "./ui/NotificationModal";
import api from "../api";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(null);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const { addToCart } = useCart();
  const { favorites, addFavorite, removeFavorite } = useFavorites();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get("/products/approved");
        const data = response.data;
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Fetch public workshops and events for the homepage carousel
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setEventsLoading(true);
        setEventsError(null);
        const res = await api.get('/work-and-events/public');
        const list = res?.data || [];
        // Normalize items for display
        const normalized = Array.isArray(list) ? list.map((e) => ({
          id: e.id || e.event_id || e.work_id || Math.random().toString(36).slice(2),
          title: e.title || e.name || 'Workshop / Event',
          description: e.description || e.details || '',
          image: e.cover_image || e.image || e.banner || null,
          date: e.date || e.start_date || e.created_at || '',
          location: e.location || e.venue || '',
          seller: e.seller_name || e.host || '',
        })) : [];
        setEvents(normalized);
      } catch (err) {
        setEventsError(err.message);
        setEvents([]);
      } finally {
        setEventsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Build hero slides from events (one event per slide)
  const heroSlides = (events || []).map((ev) => ({
    id: ev.id,
    image: ev.image || "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=1200&q=80",
    title: ev.title,
    subtitle: `${ev.date ? new Date(ev.date).toLocaleDateString() : ''}${ev.location ? ` • ${ev.location}` : ''}`,
  }));

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
  };

  const handleAddToCart = async (product) => {
    try {
      const result = await addToCart(product, 1);
      if (result.success) {
        showNotification('cart', "Item added to cart successfully!");
      } else {
        showNotification('error', result.error || "Failed to add item to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      showNotification('error', "Failed to add item to cart. Please try again.");
    }
  };

  const handleFavorite = (product) => {
    const isFavorited = favorites.some((item) => item.id === product.id);
    
    if (isFavorited) {
      removeFavorite(product.id);
      showNotification('favorite', "Removed from favorites!");
    } else {
      addFavorite(product);
      showNotification('favorite', "Added to favorites!");
    }
  };

  const handleExploreProducts = () => {
    console.log("Explore products clicked");
  };

  return (
    <div className="min-h-screen flex flex-col w-full">
      <main className="flex-grow bg-white w-full">
        <div className="w-full">
          <HeroSection onCtaClick={handleExploreProducts} slides={heroSlides.length ? heroSlides : undefined} autoAdvanceMs={12000} />
        </div>
        <div className="w-full">
          <CategoryGrid />
        </div>
        {/* Events are now integrated in the hero carousel (one per slide). */}
        <div className="w-full">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading products...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : (
            <FeaturedProducts
              products={products}
              onAddToCart={handleAddToCart}
              onFavorite={handleFavorite}
            />
          )}
        </div>
      </main>
      
      {/* Notification Modal */}
      <NotificationModal
        show={notification.show}
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ show: false, type: '', message: '' })}
      />
    </div>
  );
};

export default Home;