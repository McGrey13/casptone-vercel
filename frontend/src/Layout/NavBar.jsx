import './NavBar.css';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaBars, FaTimes, FaSearch } from 'react-icons/fa';
import { useUser } from '../Components/Context/UserContext';
import { useCart } from '../Components/Cart/CartContext';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();
  const { user, logout, loading } = useUser();
  const { cartItems } = useCart();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
        setIsSearchVisible(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      {/* CraftConnect Brand on Left */}
      <Link to="/" className="navbar-brand">CraftConnect</Link>

      {/* Navigation Links - Horizontal */}
      <div className="navbar-links">
        <Link to="/categories">Stores</Link>
        <Link to="/artisan">Artisans</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact Us</Link>
      </div>

      {/* Right Side Icons */}
      <div className="navbar-right">
        {/* Cart Icon */}
        <div className="navbar-cart">
          <Link to="/cart" className="cart-link">
            <FaShoppingCart size={20} className="md:w-6 md:h-6" />
            <span className="cart-count">{cartItems.reduce((total, item) => total + (item.quantity || 1), 0)}</span>
          </Link>
        </div>

        {/* User Profile Icon */}
        <div className="user-account">
          <FaUser size={18} className="user-icon" onClick={toggleDropdown} />
          {isDropdownOpen && (
            <div className="dropdown-content">
              {!user ? (
                <>
                  <Link to="/login">Login</Link>
                  <Link to="/register">Register</Link>
                </>
              ) : (
                <>
                  <div className="user-info">
                    <div className="user-name">{user.userName || user.firstName || 'User'}</div>
                    <div className="user-email">{user.userEmail || user.email}</div>
                  </div>
                  <Link to="/orders">My Orders</Link>
                  <Link to="/profile">Profile</Link>
                  <Link to="/settings">Settings</Link>
                  <button onClick={handleLogout}>Logout</button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
