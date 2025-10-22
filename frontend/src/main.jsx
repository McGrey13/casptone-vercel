import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CartProvider } from "./Components/Cart/CartContext";
import { FavoritesProvider } from "./Components/favorites/FavoritesContext";
import { UserProvider } from "./Components/Context/UserContext";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserProvider>
      <FavoritesProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </FavoritesProvider>
    </UserProvider>
  </StrictMode>
);
