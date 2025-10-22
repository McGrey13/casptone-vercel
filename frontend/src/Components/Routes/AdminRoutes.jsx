import React from 'react';
import { Route } from 'react-router-dom';

import AdminLayout from '../Admin/AdminLayout';
import AdminNavbar from '../Admin/AdminNavbar';
import Dashboard from '../Admin/AdminDashboard';
import AdminDetails from '../Admin/AdminDetail';
import AdminTable from '../Admin/AdminTable';
import AdminProfilePage from '../Admin/AdminSettings';
import ArtisanTable from '../Admin/ArtisanTable';
import CustomerDetail from '../Admin/CustomerDetail';
import CustomerTable from '../Admin/CustomerTable';
import EditableaAdminDetail from '../Admin/EditableAdminDetail';
import OrdersOverview from '../Admin/OrdersOverview';
import ProductsTable from '../Admin/ProductsTable';
import SellerDetail from '../Admin/SellerDetail';
import SellersTable from '../Admin/SellersTable';
import SimplifiedCustomerDetail from '../Admin/SimplifiedCustomerDetail';
import SimplifiedCustomerTable from '../Admin/SimplifiedCustomerTable';
import CommissionDashboard from '../Admin/CommissionDashboard';

function AdminRoutes() {
  return (
    <>
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="navbar" element={<AdminNavbar />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="detail" element={<AdminDetails />} />
        <Route path="table" element={<AdminTable />} />
        <Route path="profile" element={<AdminProfilePage />} />
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
        <Route path="commission-dashboard" element={<CommissionDashboard />} />
      </Route>
    </>
  );
}

export default AdminRoutes;
