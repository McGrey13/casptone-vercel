import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import console helper for development
import './utils/consoleHelper';

// Landing Page
import LandingPage from './Components/LandingPage';
import StoreView from './Components/StoreView';


// Layouts
import PublicLayout from './Components/Routes/PublicLayout';
import SellerLayout from './Components/Seller/SellerLayout';
import AdminLayout from './Components/Admin/AdminLayout';

// Public Pages
import Home from './Components/home';
import ShoppingCart from './Components/Cart/ShoppingCart';
import Checkout from './Components/Cart/Checkout';
import SearchResults from './Components/SearchResult/SearchResults';
import About from './Components/About/About';
import Contact from './Components/Contact/Contact';
import Categories from './Components/Categories/Categories';
import CategoryProducts from './Components/Categories/CategoryProducts';
import Artisan from './Components/Artisans/Artisan';
import ArtisanDetail from './Components/Artisans/ArtisanDetail';
import Register from './Components/Auth/Register';
import Login from './Components/Auth/Login';
import OtpVerification from './Components/Auth/otpVerification';
import ProductsPage from './Components/Product/ProductsPage';
import ProductDetails from './Components/product/ProductDetails';
import { Favorites } from './Components/pages/Favorites';
import Orders from './Components/Orders/Orders';
import Profile from './Components/Profile/Profile';
import Settings from './Components/Settings/Settings';
import PaymentSuccess from './Components/Payment/PaymentSuccess';
import PaymentFailed from './Components/Payment/PaymentFailed';

//


// Seller Pages
import MarketingTools from './Components/Seller/MarketingTools';
import OrderInventoryManager from './Components/Seller/OrderInventoryManager';
import PaymentSettings from './Components/Seller/PaymentSettings';
import SellerSettings from './Components/Seller/SellerSettings';
import ShippingSettings from './Components/Seller/ShippingSettings';
import SocialMedia from './Components/Seller/SocialMedia';
import StorefrontCustomizer from './Components/Seller/StorefrontCustomizer';
import WorkshopsEvents from './Components/Seller/WorkshopsEvents';
import ProfilePage from './Components/Seller/ProfilePage';
import EditableSellerDetail from './Components/Seller/EditableSellerDetail';
import ChatBox from './Components/Chat/ChatBox';
import CreateStore from './Components/Store/CreateStore';
import VerificationPendingPage from './Components/Store/VerificationPendingPage';
import OwnerInfo from './Components/Store/OwnerInfo';
import RulesGuidelines from './Components/Store/RulesGuidelines';
import StoreDetails from './Components/Store/StoreDetails';

// Admin Pages
import Dashboard from './Components/Admin/AdminDashboard';
import AdminDetails from './Components/Admin/AdminDetail';
import AdminTable from './Components/Admin/AdminTable';
import AdminProfilePage from './Components/Admin/AdminSettings';
import ArtisanTable from './Components/Admin/ArtisanTable';
import CustomerDetail from './Components/Admin/CustomerDetail';
import CustomerTable from './Components/Admin/CustomerTable';
import EditableaAdminDetail from './Components/Admin/EditableAdminDetail';
import OrdersOverview from './Components/Admin/OrdersOverview';
import ProductsTable from './Components/Admin/ProductsTable';
import SellerDetail from './Components/Admin/SellerDetail';
import SellersTable from './Components/Admin/SellersTable';
import SimplifiedCustomerDetail from './Components/Admin/SimplifiedCustomerDetail';
import SimplifiedCustomerTable from './Components/Admin/SimplifiedCustomerTable';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Landing Page Route */}
  <Route path="/" element={<LandingPage />} />
  {/* Store View Route */}
  <Route path="/storeview" element={<StoreView />} />

        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route path="home" element={<Home />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="/cart" element={<ShoppingCart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="categories" element={<Categories />} />
          <Route path="category/:id" element={<CategoryProducts />} />
          <Route path="artisan" element={<Artisan />} />
          <Route path="artisans/:id" element={<ArtisanDetail />} />
          <Route path="register" element={<Register />} />
          <Route path="login" element={<Login />} />
          <Route path="verify-otp" element={<OtpVerification />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="store/:id" element={<ArtisanDetail />} />
          <Route path="chatbox" element={<ChatBox />} />
          <Route path="create-store" element={<CreateStore />} />
          <Route path="verification-pending" element={<VerificationPendingPage />} />
          <Route path="payment-success" element={<PaymentSuccess />} />
          <Route path="payment-failed" element={<PaymentFailed />} />
        </Route>

        {/* Seller Routes */}
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
          <Route path="chatbox" element={<ChatBox/>} />
          <Route path="create-store" element={<CreateStore />} />
          <Route path="verification-pending" element={<VerificationPendingPage />} />
          <Route path="owner-info" element={<OwnerInfo />} />
          <Route path="rules-guidelines" element={<RulesGuidelines />} />
          <Route path="store-details" element={<StoreDetails />} />
        </Route>  

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="detail" element={<AdminDetails />} />
          <Route path="table" element={<AdminTable />} />
          <Route path="settings" element={<AdminProfilePage />} />
          <Route path="artisan-table" element={<ArtisanTable />} />
          <Route path="customer-detail" element={<CustomerDetail />} />
          <Route path="customer-table" element={<CustomerTable />} />
          <Route path="editable-seller-detail" element={<EditableaAdminDetail />} />
          <Route path="orders-overview" element={<OrdersOverview />} />
          <Route path="products-table" element={<ProductsTable />} />
          <Route path="seller-detail" element={<SellerDetail />} />
          <Route path="sellers-table" element={<SellersTable />} />
          <Route path="simplified-customer-detail" element={<SimplifiedCustomerDetail />} />
          <Route path="simplified-customer-table" element={<SimplifiedCustomerTable />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
