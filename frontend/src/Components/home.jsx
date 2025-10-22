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
          <HeroSection onCtaClick={handleExploreProducts} />
        </div>
        <div className="w-full">
          <CategoryGrid />
        </div>
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