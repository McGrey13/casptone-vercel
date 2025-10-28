import './NavBar.css';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaHeart, FaBars, FaTimes } from 'react-icons/fa';
import { useUser } from '../Context/UserContext';
import { useCart } from '../Cart/CartContext';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const { cartItems } = useCart();

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
    navigate('/login');
  };

  const cartItemCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);

  return (
  <>
      <nav className="navbar">
        {/* Left: Brand */}
        <div className="navbar-section left">
          <Link to="/home" className="navbar-brand text-white font-bold text-2xl tracking-wide hover:text-[#f0e6d2] transition-colors duration-200">CraftConnect</Link>
        </div>

        {/* Desktop Center Links */}
        <div className="navbar-section center desktop-links">
          <Link to="/Categories" className="nav-link">Categories</Link>
          <Link to="/Artisan" className="nav-link">Artisans</Link>
          <Link to="/About" className="nav-link">About</Link>
          <Link to="/Contact" className="nav-link">Contact Us</Link>
        </div>

        {/* Right: Icons */}
        <div className="navbar-section right">
          <Link to="/favorites" className="icon-link favorites-link" style={{ marginRight: "10px" }}>
            <FaHeart size={20} color="white" />
          </Link>

          <Link to="/cart" className="icon-link cart-link">
            <FaShoppingCart size={22} color="white" />
            {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
          </Link>

          <div className="user-account">
            <FaUser size={20} className="user-icon icon-link" onClick={toggleDropdown} />
            {isDropdownOpen && (
              <div className="profile-modal">
                {user ? (
                  <>
                    <div className="px-4 py-2 text-sm text-gray-700">
                      <p>Hello, {user.userName || user.firstName || 'User'}</p>
                      <p className="text-xs text-gray-500">{user.userEmail || user.email}</p>
                    </div>
                    <div className="border-t border-gray-100"></div>
                    <Link to="/orders" className="dropdown-link" onClick={() => setIsDropdownOpen(false)}>My Orders</Link>
                    <Link to="/profile" className="dropdown-link" onClick={() => setIsDropdownOpen(false)}>Profile</Link>
                    <Link to="/settings" className="dropdown-link" onClick={() => setIsDropdownOpen(false)}>Settings</Link>
                    <div className="border-t border-gray-100"></div>
                    <button onClick={handleLogout} className="dropdown-link logout-btn">Sign out</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { navigate("/login"); setIsDropdownOpen(false); }} className="dropdown-link">Login</button>
                    <button onClick={() => { navigate("/register"); setIsDropdownOpen(false); }} className="dropdown-link">Register</button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Hamburger Icon */}
          <button className="navbar-toggle" onClick={toggleMenu}>
            {isMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>
        </div>
      </nav>

      {/* ✅ Mobile Dropdown Menu (Below Navbar) */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <Link to="/Categories" onClick={() => setIsMenuOpen(false)}>Categories</Link>
          <Link to="/Artisan" onClick={() => setIsMenuOpen(false)}>Artisans</Link>
          <Link to="/About" onClick={() => setIsMenuOpen(false)}>About</Link>
          <Link to="/Contact" onClick={() => setIsMenuOpen(false)}>Contact Us</Link>
        </div>
      )}
    </>
  );
};

export default Navbar;
