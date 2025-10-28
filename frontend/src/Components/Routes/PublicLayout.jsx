import React from 'react';
import Navbar from '../Layout/NavBar';
import Footer from '../Layout/Footer';
import { Outlet } from 'react-router-dom';
import './PublicLayout.css';

function PublicLayout() {
  return (
    <div className="public-layout">
      <Navbar />
      <main className="public-main-content">
        <Outlet />  {/* This will render the nested public routes */}
      </main>
      <Footer />
    </div>
  );
}

export default PublicLayout;
