import React, { useState, useEffect } from "react";
import {
  Trash2,
  Eye,
  MoreHorizontal,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Package,
  DollarSign,
  Hash,
  Tag,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import api from "../../api";
import "./AdminTableDesign.css";

function AcceptPendingProduct() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [productToAction, setProductToAction] = useState(null);

  // Fetch products for admin
  const fetchProducts = async () => {
    try {
      const response = await api.get("/products");
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // Filter products based on search and status
  const filterProducts = () => {
    let filtered = products;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.approval_status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (product) =>
          product.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.id?.toString().includes(searchQuery)
      );
    }

    setFilteredProducts(filtered);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products when search query or status filter changes
  useEffect(() => {
    filterProducts();
  }, [searchQuery, statusFilter, products]);


  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "out of stock":
        return <Badge variant="destructive">Out of Stock</Badge>;
      default:
        return null;
    }
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setViewModalOpen(true);
  };

  const handleRejectClick = (product) => {
    setProductToAction(product);
    setShowRejectConfirm(true);
  };

  const handleDeleteClick = (product) => {
    setProductToAction(product);
    setShowDeleteConfirm(true);
  };

  const handleRejectConfirm = async () => {
    if (!productToAction) return;
    
    setIsProcessing(true);
    try {
      await api.put(`/products/${productToAction.id}`, { approval_status: 'rejected' });
      alert('Product rejected successfully!');
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting product:', error);
      alert('Failed to reject product. Please try again.');
    } finally {
      setIsProcessing(false);
      setShowRejectConfirm(false);
      setProductToAction(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!productToAction) return;
    
    setIsProcessing(true);
    try {
      await api.delete(`/products/${productToAction.id}`);
      alert('Product deleted successfully!');
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    } finally {
      setIsProcessing(false);
      setShowDeleteConfirm(false);
      setProductToAction(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f9f4ef] via-[#eadfd2] to-[#d3bfa8] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d5bfae]/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#5c3d28] mb-2">Product Management</h1>
              <p className="text-[#7b5a3b] text-lg">Manage all products in your marketplace</p>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#5c3d28] bg-gradient-to-r from-[#a4785a]/10 to-[#7b5a3b]/10 px-4 py-3 rounded-lg border border-[#d5bfae]/30">
              <Package className="h-4 w-4 text-[#a4785a]" />
              <span className="font-medium">{filteredProducts.length} products found</span>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d5bfae]/20">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearch}
                className="pl-10 border-[#d5bfae] focus:border-[#a4785a] focus:ring-[#a4785a]/20 text-[#5c3d28]"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#a4785a] h-4 w-4" />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#a4785a]" />
                <span className="text-sm font-medium text-[#5c3d28]">Status:</span>
              </div>
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-40 border-[#d5bfae] focus:border-[#a4785a] text-[#5c3d28] bg-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-lg border border-[#d5bfae]/20 overflow-hidden">
          <Table>
            <TableHeader className="bg-gradient-to-r from-[#a4785a]/10 to-[#7b5a3b]/10">
              <TableRow className="border-[#d5bfae]/30">
                <TableHead className="text-[#5c3d28] font-semibold">Product</TableHead>
                <TableHead className="text-[#5c3d28] font-semibold">Category</TableHead>
                <TableHead className="text-[#5c3d28] font-semibold">Price</TableHead>
                <TableHead className="text-[#5c3d28] font-semibold">Quantity</TableHead>
                <TableHead className="text-[#5c3d28] font-semibold">Status</TableHead>
                <TableHead className="text-right text-[#5c3d28] font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} className="border-[#d5bfae]/20 hover:bg-[#a4785a]/5 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-[#a4785a]/20 to-[#7b5a3b]/20 rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5 text-[#a4785a]" />
                      </div>
                      <div>
                        <div className="font-semibold text-[#5c3d28]">{product.productName}</div>
                        <div className="text-sm text-[#7b5a3b]">by Seller</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-[#a4785a]" />
                      <span className="text-[#5c3d28]">{product.category || "N/A"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      
                      <span className="font-semibold text-green-600">₱{Number(product.productPrice).toFixed(2)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Hash className="h-4 w-4 text-[#7b5a3b]" />
                      <span className="text-[#5c3d28]">{product.productQuantity}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(product.approval_status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-[#5c3d28] hover:bg-[#a4785a]/10"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="border-[#d5bfae]/30">
                        <DropdownMenuLabel className="text-[#5c3d28]">Actions</DropdownMenuLabel>
                        <DropdownMenuItem 
                          onClick={() => handleViewProduct(product)}
                          className="text-[#5c3d28] hover:bg-[#a4785a]/10"
                        >
                          <Eye className="h-4 w-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-orange-600 hover:bg-orange-50" 
                          onClick={() => handleRejectClick(product)}
                          disabled={isProcessing}
                        >
                          <XCircle className="h-4 w-4 mr-2" /> Reject Product
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600 hover:bg-red-50" 
                          onClick={() => handleDeleteClick(product)}
                          disabled={isProcessing}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete Permanently
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Footer Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d5bfae]/20">
          <div className="flex items-center justify-between">
            <div className="text-sm text-[#7b5a3b]">
              Showing {filteredProducts.length} of {products.length} products
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled
                className="border-[#d5bfae] text-[#5c3d28]"
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled
                className="border-[#d5bfae] text-[#5c3d28]"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* View Product Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-3xl border-[#d5bfae]/30 bg-gradient-to-br from-white to-[#f9f4ef]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-[#5c3d28] text-2xl">
              <div className="h-10 w-10 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-lg flex items-center justify-center">
                <Eye className="h-5 w-5 text-white" />
              </div>
              Product Details
            </DialogTitle>
            <DialogDescription className="text-[#7b5a3b] text-lg">
              Complete information about this product
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-8">
              {/* Product Header */}
              <div className="bg-gradient-to-r from-[#a4785a]/10 to-[#7b5a3b]/10 rounded-xl p-6 border border-[#d5bfae]/30">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-xl flex items-center justify-center">
                    <Package className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#5c3d28]">{selectedProduct.productName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(selectedProduct.approval_status)}
                      <span className="text-sm text-[#7b5a3b]">by Seller</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-[#d5bfae]/20">
                    <Label className="text-sm font-semibold text-[#5c3d28] flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      Price
                    </Label>
                    <p className="text-2xl font-bold text-green-600 mt-1">₱{Number(selectedProduct.productPrice).toFixed(2)}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-[#d5bfae]/20">
                    <Label className="text-sm font-semibold text-[#5c3d28] flex items-center gap-2">
                      <Hash className="h-4 w-4 text-[#7b5a3b]" />
                      Quantity Available
                    </Label>
                    <p className="text-xl font-semibold text-[#5c3d28] mt-1">{selectedProduct.productQuantity} units</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-[#d5bfae]/20">
                    <Label className="text-sm font-semibold text-[#5c3d28] flex items-center gap-2">
                      <Tag className="h-4 w-4 text-[#a4785a]" />
                      Category
                    </Label>
                    <p className="text-lg font-medium text-[#5c3d28] mt-1">{selectedProduct.category || 'N/A'}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-[#d5bfae]/20">
                    <Label className="text-sm font-semibold text-[#5c3d28] flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-[#a4785a]" />
                      Status
                    </Label>
                    <div className="mt-1">{getStatusBadge(selectedProduct.approval_status)}</div>
                  </div>
                </div>
              </div>
              
              {/* Description */}
              {selectedProduct.description && (
                <div className="bg-white rounded-lg p-6 border border-[#d5bfae]/20">
                  <Label className="text-lg font-semibold text-[#5c3d28] mb-3 block">Product Description</Label>
                  <p className="text-[#7b5a3b] leading-relaxed">{selectedProduct.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md border-[#d5bfae]/30 bg-gradient-to-br from-[#f9f4ef] via-[#eadfd2] to-[#d3bfa8]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-[#5c3d28]">
              <AlertTriangle className="h-6 w-6 text-[#a4785a]" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-[#7b5a3b]">
              This action cannot be undone. The product will be permanently removed from the system.
            </DialogDescription>
          </DialogHeader>
          {productToAction && (
            <div className="space-y-4">
              <div className="bg-white/80 rounded-lg p-4 border border-[#d5bfae]/30 backdrop-blur-sm">
                <p className="font-semibold text-[#5c3d28]">Product: {productToAction.productName}</p>
                <p className="text-sm text-[#7b5a3b]">Price: ₱{Number(productToAction.productPrice).toFixed(2)}</p>
              </div>
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isProcessing}
                  className="border-[#d5bfae] text-[#5c3d28] hover:bg-[#a4785a]/10"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleDeleteConfirm}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Permanently
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Modal */}
      <Dialog open={showRejectConfirm} onOpenChange={setShowRejectConfirm}>
        <DialogContent className="max-w-md border-[#d5bfae]/30 bg-gradient-to-br from-[#f9f4ef] via-[#eadfd2] to-[#d3bfa8]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-[#5c3d28]">
              <XCircle className="h-6 w-6 text-[#a4785a]" />
              Confirm Rejection
            </DialogTitle>
            <DialogDescription className="text-[#7b5a3b]">
              This will change the product status to rejected and remove it from the approved list.
            </DialogDescription>
          </DialogHeader>
          {productToAction && (
            <div className="space-y-4">
              <div className="bg-white/80 rounded-lg p-4 border border-[#d5bfae]/30 backdrop-blur-sm">
                <p className="font-semibold text-[#5c3d28]">Product: {productToAction.productName}</p>
                <p className="text-sm text-[#7b5a3b]">Price: ₱{Number(productToAction.productPrice).toFixed(2)}</p>
              </div>
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowRejectConfirm(false)}
                  disabled={isProcessing}
                  className="border-[#d5bfae] text-[#5c3d28] hover:bg-[#a4785a]/10"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleRejectConfirm}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Product
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AcceptPendingProduct;
