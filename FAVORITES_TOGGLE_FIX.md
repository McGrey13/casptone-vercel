# Favorites Toggle Function Fix

## Issue
`ProductCard.jsx` was trying to use `toggleFavorite()` function from the Favorites context, but the context only provided `addFavorite()` and `removeFavorite()`.

**Error**:
```
Uncaught TypeError: toggleFavorite is not a function
    at onClick (ProductCard.jsx:75:19)
```

## Solution
Added `toggleFavorite()` function to the FavoritesContext.

### Updated File: `FavoritesContext.jsx`

**Added Function**:
```javascript
const toggleFavorite = (product) => {
  setFavorites((prev) => {
    const exists = prev.find((item) => item.id === product.id);
    if (exists) {
      // Remove from favorites
      return prev.filter((item) => item.id !== product.id);
    } else {
      // Add to favorites
      return [...prev, product];
    }
  });
};
```

**Updated Provider**:
```javascript
return (
  <FavoritesContext.Provider value={{ 
    favorites, 
    addFavorite, 
    removeFavorite, 
    toggleFavorite  // ✅ Added
  }}>
    {children}
  </FavoritesContext.Provider>
);
```

## How It Works

The `toggleFavorite` function checks if the product is already in favorites:
- **If it exists** → Removes it (like clicking a filled heart)
- **If it doesn't exist** → Adds it (like clicking an empty heart)

This provides a better UX because users can click the heart icon once to add/remove, instead of needing separate buttons.

## Usage in ProductCard

```javascript
const { favorites, toggleFavorite } = useFavorites();
const isFavorited = favorites.some((item) => item.id === id);

<Button onClick={(e) => {
  e.stopPropagation();
  toggleFavorite({ id, image, title, price, artisanName, rating });
}}>
  <Heart className={isFavorited ? "text-red-500 fill-red-500" : "text-gray-600"} />
</Button>
```

## Status: ✅ FIXED

The error is now resolved and the favorites toggle functionality works correctly!

