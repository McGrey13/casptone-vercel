import React from "react";
import { Routes, Route } from "react-router-dom";
import PublicLayout from "./PublicLayout";

// Pages
import Home from "../home.jsx";
import ShoppingCart from "../Cart/ShoppingCart";
import Checkout from "../Cart/Checkout";
import SearchResults from "../SearchResult/SearchResults";
import About from "../About/About.jsx";
import Contact from "../Contact/Contact.jsx";
import Categories from "../Categories/Categories.jsx";
import CategoryProducts from "../Categories/CategoryProducts";
import Artisan from "../Artisans/Artisan.jsx";
import ArtisanDetail from "../Artisans/ArtisanDetail";
import Register from "../Auth/Register.jsx";
import Login from "../Auth/Login.jsx";
import ProductsPage from "../Product/ProductsPage.jsx";
import ProductDetails from "../product/ProductDetails";
import { Favorites } from "../pages/Favorites";
import AdminLayout from "../Admin/AdminLayout";


function PublicRoutes() {
  return (
    <Route path="/" element={<PublicLayout />}>
      {/* Home */}
      <Route index element={<Home/>} />

      <Route path="/favorites" element={<Favorites />} />

      {/* Cart & Checkout */}
      <Route path="cart" element={<ShoppingCart />} />
      <Route path="checkout" element={<Checkout />} />

      {/* Search */}
      <Route path="search" element={<SearchResults />} />

      {/* Static Pages */}
      <Route path="about" element={<About />} />
      <Route path="contact" element={<Contact />} />

      {/* Categories */}
      <Route path="categories" element={<Categories />} />
      <Route path="category/:id" element={<CategoryProducts />} />

      {/* Artisans */}
      <Route path="artisan" element={<Artisan />} />
      <Route path="artisans/:id" element={<ArtisanDetail />} />

      {/* Auth */}
      <Route path="register" element={<Register />} />
      <Route path="login" element={<Login />} />

      {/* Products */}
      <Route path="products" element={<ProductsPage />} />
      <Route path="products/:id" element={<ProductDetails />} />
      <Route path="product/:id" element={<ProductDetails />} />
    </Route>
  );
}

export default PublicRoutes;
