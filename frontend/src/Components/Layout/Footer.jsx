import './Footer.css';
import React from "react";
import { Link } from "react-router-dom";
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
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/about#aboutus">About Us</Link></li>
            <li><Link to="/contact#contactus">Contact Us</Link></li>
            <li><Link to="/contact#faqs">FAQs</Link></li>
          </ul>
        </div>

        {/* Legal Section */}
        <div className="footer-section">
          <h3>Legal</h3>
          <ul>
            <li><Link to="/about#terms-of-service">Terms of Service</Link></li>
            <li><Link to="/about#privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/about#shipping-policy">Shipping Policy</Link></li>
            <li><Link to="/about#returns-refunds">Returns & Refunds</Link></li>
          </ul>
        </div>

        {/* Newsletter Section */}
      </div>
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} CraftConnect. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;