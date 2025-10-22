import './Footer.css';
import React from "react";
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* CraftConnect Section */}
        <div className="footer-section">
          <h3>CraftConnect</h3>
          <p>
            Connecting artisans with customers seeking unique handcrafted items.
          </p>
          <div className="footer-social-icons">
            <a href="#"><FaFacebookF /></a>
            <a href="#"><FaInstagram /></a>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaYoutube /></a>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">FAQs</a></li>
            <li><a href="#">Blog</a></li>
          </ul>
        </div>

        {/* Legal Section */}
        <div className="footer-section">
          <h3>Legal</h3>
          <ul>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Shipping Policy</a></li>
            <li><a href="#">Returns & Refunds</a></li>
          </ul>
        </div>

        {/* Newsletter Section */}
        <div className="footer-section">
          <h3>Stay Updated</h3>
          <p>Subscribe to our newsletter for the latest artisan products and offers.</p>
          <div>
            <input
              type="email"
              placeholder="Your email address"
              className="p-2 rounded-l-md text-black w-full"
            />
            <button className="bg-black text-white rounded-r-md p-2">
              Subscribe
            </button>
          </div>
          <p className="text-sm mt-1">We respect your privacy. Unsubscribe at any time.</p>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} CraftConnect. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;