import React, { useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "../favorites/FavoritesContext"; // NEW

const ProductCard = ({
  id = "1",
  image = "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=500&q=80",
  title = "Handcrafted Ceramic Mug",
  price = 24.99,
  artisanName = "Sarah Pottery",
  storeName = "",
  storeLogo = "",
  rating = 4.5,
  isNew = false,
  isFeatured = false,
  onAddToCart = () => {},
  onFavorite = () => {},
}) => {
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useFavorites(); // NEW
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  // Check if user is logged in
  const isLoggedIn = !!sessionStorage.getItem("auth_token");
  const isFavorited = isLoggedIn && favorites.some((item) => item.id === id);

  const handleCardClick = () => {
    navigate(`/product/${id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (isAddingToCart) return; // Prevent multiple clicks
    
    setIsAddingToCart(true);
    onAddToCart({ id, image, title, price, artisanName, rating });
    
    // Reset loading state after a short delay
    setTimeout(() => {
      setIsAddingToCart(false);
    }, 1000);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onFavorite({ id, image, title, price, artisanName, rating });
  };

  return (
    <Card
      className="w-full max-w-[280px] h-[380px] overflow-hidden flex flex-col bg-white hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        {isNew && (
          <Badge variant="secondary" className="absolute top-2 left-2 bg-blue-500 text-white">
            New
          </Badge>
        )}
        {isFeatured && (
          <Badge variant="default" className="absolute top-2 right-2 bg-amber-500 text-white">
            Featured
          </Badge>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-10 bg-white/80 hover:bg-white rounded-full p-1.5 h-8 w-8"
                onClick={handleFavoriteClick}
              >
                <Heart
                  className={`h-4 w-4 ${
                    isFavorited && isLoggedIn ? "text-red-500 fill-red-500" : "text-gray-600"
                  }`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isFavorited && isLoggedIn ? "Remove from favorites" : "Add to favorites"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <CardHeader className="p-3 pb-0">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          {storeLogo && (
            <img 
              src={storeLogo} 
              alt={storeName || artisanName} 
              className="w-5 h-5 rounded-full object-cover border border-gray-200"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          <span className="truncate">{storeName || artisanName}</span>
        </div>
        <h3 className="font-medium text-base line-clamp-2 h-12">{title}</h3>
      </CardHeader>

      <CardContent className="p-3 pt-1 flex-grow">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-3 h-3 ${i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="ml-1 text-xs text-gray-500">{rating}</span>
        </div>
      </CardContent>

      <CardFooter className="p-3 pt-0 flex justify-between items-center">
        <div className="font-semibold">₱{price.toFixed(2)}</div>
        <Button
          size="sm"
          className="rounded-full"
          onClick={handleAddToCart}
          disabled={isAddingToCart}
        >
          {isAddingToCart ? (
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 mr-1" />
              Add to Cart
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
