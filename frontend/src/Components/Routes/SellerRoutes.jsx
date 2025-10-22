import React from 'react';
import { Route } from 'react-router-dom';

import SellerLayout from '../Seller/SellerLayout.jsx';
import MarketingTools from '../Seller/MarketingTools.jsx';
import OrderInventoryManager from '../Seller/OrderInventoryManager.jsx';
import PaymentSettings from '../Seller/PaymentSettings.jsx';
import SellerSettings from '../Seller/SellerSettings.jsx';
import ShippingSettings from '../Seller/ShippingSettings.jsx';
import SocialMedia from '../Seller/SocialMedia.jsx';
import StorefrontCustomizer from '../Seller/StorefrontCustomizer.jsx';
import WorkshopsEvents from '../Seller/WorkshopsEvents.jsx';
import ProfilePage from '../Seller/ProfilePage';
import EditableSellerDetail from '../Seller/EditableSellerDetail';

function SellerRoutes() {
  return (
    <Route path="/seller" element={<SellerLayout />}>
      <Route path="marketing-tools" element={<MarketingTools />} />
      <Route path="order-inventory-manager" element={<OrderInventoryManager />} />
      <Route path="payment-settings" element={<PaymentSettings />} />
      <Route path="seller-settings" element={<SellerSettings />} />
      <Route path="shipping-settings" element={<ShippingSettings />} />
      <Route path="social-media" element={<SocialMedia />} />
      <Route path="storefront-customizer" element={<StorefrontCustomizer />} />
      <Route path="workshops-events" element={<WorkshopsEvents />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="editable-seller-detail" element={<EditableSellerDetail />} />
    </Route>
  );
}

export default SellerRoutes;
