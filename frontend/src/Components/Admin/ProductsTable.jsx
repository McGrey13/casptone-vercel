import React, { useState, useEffect } from "react";
import {
  Edit,
  Eye,
  MoreHorizontal,
  Filter,
  Check,
  X,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";
import ProductDetail from "./ProductDetail";
import ProductEdit from "./ProductEdit";
import api from "../../api";
import "./AdminTableDesign.css";
import { Search, Package, TrendingUp, Users } from "lucide-react";

function ProductsTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Token handled by httpOnly cookies
  
  // State for view and edit dialogs
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // ✅ Fetch products for admin
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/products");
      // console.log("Products data:", response.data);
      setProducts(response.data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim() === "") {
      fetchProducts();
    } else {
      setProducts((prev) =>
        prev.filter(
          (product) =>
            product.productName?.toLowerCase().includes(query) ||
            product.category?.toLowerCase().includes(query) ||
            product.id?.toString().includes(query)
        )
      );
    }
  };

  const handleViewProduct = (productId) => {
    setSelectedProductId(productId);
    setIsViewDialogOpen(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleSaveProduct = (updatedProduct) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/products/${id}/approve`);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, approval_status: "approved" } : p
        )
      );
    } catch (err) {
      console.error("Error approving product:", err);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.post(`/products/${id}/reject`);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, approval_status: "rejected" } : p
        )
      );
    } catch (err) {
      console.error("Error rejecting product:", err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <span className="admin-table-badge active">Approved</span>;
      case "pending":
        return <span className="admin-table-badge pending">Pending</span>;
      case "rejected":
        return <span className="admin-table-badge dormant">Rejected</span>;
      case "out of stock":
        return <span className="admin-table-badge dormant">Out of Stock</span>;
      default:
        return <span className="admin-table-badge inactive">Unknown</span>;
    }
  };

  if (loading) return (
    <div className="admin-table-container">
      <div className="admin-table-loading">
        <div className="admin-table-loading-spinner"></div>
        <span>Loading products...</span>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <h3 className="text-red-800 font-medium">Failed to load products</h3>
        <p className="text-red-600 mt-1">{error}</p>
        <button 
          onClick={fetchProducts}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    </div>
  );

  if (!products || products.length === 0) return (
    <div className="admin-table-container">
      <div className="admin-table-empty">
        <Package className="admin-table-empty-icon" />
        <h3 className="admin-table-empty-title">No products found</h3>
        <p className="admin-table-empty-description">There are no products to display at the moment.</p>
        <Button className="admin-table-filter-btn">
          Add First Product
        </Button>
      </div>
    </div>
  );

  return (
    <div className="admin-table-container">
      {/* Enhanced Header */}
      <div className="admin-table-header">
        <h1 className="admin-table-title">Products Management</h1>
        <p className="admin-table-description">
          Manage and monitor all products in the platform with real-time analytics
        </p>
        
        {/* Stats Row */}
        <div className="admin-table-stats">
          <div className="admin-table-stat">
            <Package className="admin-table-stat-icon" />
            <div>
              <div className="admin-table-stat-value">{products.length}</div>
              <div className="admin-table-stat-label">Total Products</div>
            </div>
          </div>
          <div className="admin-table-stat">
            <TrendingUp className="admin-table-stat-icon" />
            <div>
              <div className="admin-table-stat-value">
                {products.filter(p => p.approval_status === 'approved').length}
              </div>
              <div className="admin-table-stat-label">Approved</div>
            </div>
          </div>
          <div className="admin-table-stat">
            <Users className="admin-table-stat-icon" />
            <div>
              <div className="admin-table-stat-value">
                {products.filter(p => p.approval_status === 'pending').length}
              </div>
              <div className="admin-table-stat-label">Pending</div>
            </div>
          </div>
        </div>

        {/* Enhanced Controls */}
        <div className="admin-table-controls">
          <div className="admin-table-search">
            <Search className="admin-table-search-icon" />
            <Input
              placeholder="Search products by name, category, or seller..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <div className="admin-table-filters">
            <button className="admin-table-filter-btn">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
            <Button className="admin-table-filter-btn">
              Add New Product
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="overflow-x-auto">
        <Table className="admin-table">
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right table-actions">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.productImage ? (
                    <img
                      src={product.productImage}
                      alt={product.productName}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">
                      No Image
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{product.productName}</div>
                    <div className="text-sm text-gray-500">{product.id}</div>
                  </div>
                </TableCell>
                <TableCell>{product.category || "N/A"}</TableCell>
                <TableCell>₱{Number(product.productPrice).toFixed(2)}</TableCell>
                <TableCell>{product.productQuantity}</TableCell>
                <TableCell>{getStatusBadge(product.approval_status)}</TableCell>
                <TableCell className="text-right table-actions">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="dropdown-content">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleViewProduct(product.id)}>
                        <button className="admin-table-action-btn view">
                          <Eye className="h-4 w-4 mr-2" /> View
                        </button>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                        <button className="admin-table-action-btn edit">
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </button>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleApprove(product.id)}
                      >
                        <button className="admin-table-action-btn view">
                          <Check className="h-4 w-4 mr-2" /> Approve
                        </button>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleReject(product.id)}
                      >
                        <button className="admin-table-action-btn deactivate">
                          <X className="h-4 w-4 mr-2" /> Reject
                        </button>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {products.length} of {products.length} products
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>

      {/* Product Detail Dialog */}
      <ProductDetail
        productId={selectedProductId}
        isOpen={isViewDialogOpen}
        onClose={() => {
          setIsViewDialogOpen(false);
          setSelectedProductId(null);
        }}
        onEdit={handleEditProduct}
      />

      {/* Product Edit Dialog */}
      <ProductEdit
        product={selectedProduct}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedProduct(null);
        }}
        onSave={handleSaveProduct}
      />
    </div>
  );
}

export default ProductsTable;
