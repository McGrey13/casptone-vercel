import React from 'react';
import Navbar from '../Layout/NavBar';
import Footer from '../Layout/Footer';
import { Outlet } from 'react-router-dom';

function PublicLayout() {
  return (
    <>
      <Navbar />
      <Outlet />  {/* This will render the nested public routes */}
      <Footer />
    </>
  );
}

export default PublicLayout;
