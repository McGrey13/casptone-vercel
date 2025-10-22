import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { ShoppingCart, Heart, Loader2 } from "lucide-react";
import { useFavorites } from "../favorites/FavoritesContext";
import { useNavigate } from "react-router-dom";
import { useCart } from "../cart/CartContext";

export function Favorites() {
  const { favorites, removeFavorite } = useFavorites();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (favorites.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch full product details for each favorite
        const productPromises = favorites.map(async (fav) => {
          try {
            const response = await fetch(`/api/products/${fav.id}`);
            if (response.ok) {
              return await response.json();
            }
            return null;
          } catch (error) {
            console.error(`Error fetching product ${fav.id}:`, error);
            return null;
          }
        });

        const fetchedProducts = await Promise.all(productPromises);
        const validProducts = fetchedProducts.filter(p => p !== null);
        setProducts(validProducts);
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [favorites]);

  const handleRemove = (productId) => {
    removeFavorite(productId);
  };

  const handleAddToCart = (product) => {
    addToCart({
      id: product.product_id || product.id,
      name: product.productName,
      price: product.productPrice,
      image: product.productImage,
      quantity: 1,
      seller: product.seller
    });
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-[#f5f0eb] via-white to-[#ede5dc]">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-[#5c3d28]">
            <Heart className="inline-block mr-3 h-10 w-10 text-red-500" />
            My Favorites
          </h1>
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-[#a4785a]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-[#f5f0eb] via-white to-[#ede5dc]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#5c3d28] flex items-center gap-3">
            <Heart className="h-10 w-10 text-red-500 fill-red-500" />
            My Favorites
          </h1>
          <p className="text-[#7b5a3b] mt-2">
            {products.length} {products.length === 1 ? 'product' : 'products'} in your favorites
          </p>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border-2 border-[#d5bfae]">
            <Heart className="h-20 w-20 mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No favorites yet</h2>
            <p className="text-gray-600 mb-6">
              Start adding products to your favorites to see them here!
            </p>
            <Button
              onClick={() => navigate('/products')}
              className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white"
            >
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card 
                key={product.product_id || product.id}
                className="overflow-hidden bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-[#d5bfae] cursor-pointer"
              >
                <div onClick={() => handleProductClick(product.product_id || product.id)}>
                  <CardHeader className="p-0 relative">
                    <div className="relative h-56 bg-gray-100">
                      <img
                        src={product.productImage || product.image}
                        alt={product.productName || product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                        }}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(product.product_id || product.id);
                        }}
                        className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-red-50 transition-colors"
                      >
                        <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="mb-2">
                      <h3 className="font-bold text-lg text-[#5c3d28] line-clamp-2 mb-1">
                        {product.productName || product.name}
                      </h3>
                      <p className="text-sm text-[#7b5a3b]">
                        by {product.seller?.user?.userName || product.artisanName || 'Unknown Seller'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-2xl font-bold text-[#a4785a]">
                        ₱{Number(product.productPrice || product.price).toFixed(2)}
                      </p>
                      {product.category && (
                        <span className="px-2 py-1 bg-[#f5f0eb] text-[#7b5a3b] text-xs rounded-full">
                          {product.category}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </div>
                <CardFooter className="p-4 pt-0 flex gap-2">
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(product.product_id || product.id);
                    }}
                    className="flex-1 border-2 border-[#d5bfae] text-[#7b5a3b] hover:bg-[#f5f0eb]"
                  >
                    Remove
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    className="flex-1 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white"
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
