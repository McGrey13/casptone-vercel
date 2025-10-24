import React, { useState, useEffect } from "react";
import { X, Package, DollarSign, User } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import api from "../../api";
 
const ProductDetail = ({ productId, isOpen, onClose }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && productId) {
      fetchProductDetails();
    }
  }, [isOpen, productId]);

  const fetchProductDetails = async () => {
    if (!productId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/products/${productId}`);
      console.log('Product data received:', response.data);
      
      // Handle different response structures
      let productData = response.data;
      if (response.data.data) {
        productData = response.data.data;
      } else if (Array.isArray(response.data) && response.data.length > 0) {
        productData = response.data[0];
      }
      
      if (!productData || typeof productData !== 'object') {
        throw new Error('Invalid product data received from server');
      }
      
      // Ensure required fields exist
      const processedProduct = {
        ...productData,
        product_id: productData.product_id || productData.id || productId,
        productName: productData.productName || productData.name || 'Unnamed Product',
        productPrice: parseFloat(productData.productPrice || productData.price || 0),
        productQuantity: parseInt(productData.productQuantity || productData.quantity || 0, 10),
        productImage: productData.productImage || productData.image || '',
        status: productData.status || 'pending',
        seller: productData.seller || { user: { userName: 'Unknown Seller' } }
      };
      
      console.log('Processed product data:', processedProduct);
      setProduct(processedProduct);
    } catch (err) {
      console.error("Error fetching product details:", err);
      setError(err.response?.data?.message || err.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "out of stock":
        return <Badge variant="destructive">Out of Stock</Badge>;
      case "low stock":
        return <Badge className="bg-orange-500">Low Stock</Badge>;
      case "in stock":
        return <Badge className="bg-green-500">In Stock</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };


  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>Loading product information...</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading product details...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>Error occurred while loading product information</DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-red-600">Error loading product details: {error}</p>
            <Button onClick={fetchProductDetails} className="mt-4">Retry</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#f9f4ef] via-[#eadfd2] to-[#d3bfa8] border-[#d5bfae]/30">
        <DialogHeader className="bg-gradient-to-r from-[#a4785a]/10 to-[#7b5a3b]/10 rounded-xl p-6 border border-[#d5bfae]/30 -m-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-xl flex items-center justify-center">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-bold text-[#5c3d28]">Product Details</DialogTitle>
              <DialogDescription className="text-[#7b5a3b] text-lg">Complete information about this product</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {product && (
          <div className="space-y-6">
            {/* Product Header */}
            <Card className="bg-white/80 backdrop-blur-sm border-[#d5bfae]/30 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-[#a4785a]/10 to-[#7b5a3b]/10 rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-[#5c3d28] text-xl">
                  <div className="h-8 w-8 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-lg flex items-center justify-center">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                  Product Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-start gap-8">
                  <div className="w-40 h-40 bg-gradient-to-br from-[#a4785a]/20 to-[#7b5a3b]/20 rounded-xl overflow-hidden shadow-lg border border-[#d5bfae]/30">
                    {product.productImage ? (
                      <img
                        src={product.image_url || product.productImage}
                        alt={product.productName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#a4785a]">
                        <Package className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-3xl font-bold text-[#5c3d28] mb-2">{product.productName}</h2>
                      <p className="text-[#7b5a3b] text-lg">Product ID: {product.product_id || product.id}</p>
                    </div>
                    <div className="flex gap-3">
                      {getStatusBadge(product.approval_status)}
                      {getStatusBadge(product.status)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Details */}
            <Card className="bg-white/80 backdrop-blur-sm border-[#d5bfae]/30 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-[#a4785a]/10 to-[#7b5a3b]/10 rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-[#5c3d28] text-xl">
                  <div className="h-8 w-8 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-lg flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-white" />
                  </div>
                  Product Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-[#a4785a]/5 to-[#7b5a3b]/5 rounded-lg p-4 border border-[#d5bfae]/20">
                    <label className="text-sm font-semibold text-[#5c3d28] flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-[#a4785a]" />
                      Product ID
                    </label>
                    <p className="text-lg font-medium text-[#5c3d28]">{product.product_id || product.id}</p>
                  </div>
                  <div className="bg-gradient-to-r from-[#a4785a]/5 to-[#7b5a3b]/5 rounded-lg p-4 border border-[#d5bfae]/20">
                    <label className="text-sm font-semibold text-[#5c3d28] flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-[#a4785a]" />
                      Category
                    </label>
                    <p className="text-lg font-medium text-[#5c3d28]">{product.category || "N/A"}</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                    <label className="text-sm font-semibold text-green-800 flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      Price
                    </label>
                    <p className="text-2xl font-bold text-green-600">₱{Number(product.productPrice).toFixed(2)}</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                    <label className="text-sm font-semibold text-blue-800 flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-blue-600" />
                      Quantity Available
                    </label>
                    <p className="text-2xl font-bold text-blue-600">{product.productQuantity} units</p>
                  </div>
                  <div className="md:col-span-2 bg-gradient-to-r from-[#a4785a]/5 to-[#7b5a3b]/5 rounded-lg p-4 border border-[#d5bfae]/20">
                    <label className="text-sm font-semibold text-[#5c3d28] flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-[#a4785a]" />
                      Description
                    </label>
                    <p className="text-lg text-[#7b5a3b] leading-relaxed">{product.productDescription || "No description provided"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seller Information */}
            {product.seller && (
              <Card className="bg-white/80 backdrop-blur-sm border-[#d5bfae]/30 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-[#a4785a]/10 to-[#7b5a3b]/10 rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-[#5c3d28] text-xl">
                    <div className="h-8 w-8 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-lg flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    Seller Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="h-16 w-16 border-4 border-[#a4785a]/20 shadow-lg">
                        <AvatarImage 
                          src={product.seller.profile_image_url} 
                          alt={product.seller.user?.userName}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] text-white font-bold text-lg">
                          {product.seller.user?.userName?.slice(0, 2).toUpperCase() || "SE"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <div className="h-2 w-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="text-2xl font-bold text-[#5c3d28]">{product.seller.user?.userName || "N/A"}</h3>
                      <div className="space-y-1">
                        <p className="text-[#7b5a3b] text-lg">Seller ID: {product.seller.sellerID}</p>
                        <p className="text-[#7b5a3b] text-lg">{product.seller.user?.userAddress || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetail;
