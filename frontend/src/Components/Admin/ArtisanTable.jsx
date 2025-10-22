import React, { useState, useEffect } from "react";
import { Edit, Eye, MoreHorizontal, Filter, X, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableCell,
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
import SellerDetail from "./SellerDetail";
import SellerEdit from "./SellerEdit";
import api from "../../api";
import { Search, Palette, TrendingUp, Users, Store, ShoppingBag, Calendar, MapPin, Mail } from "lucide-react";

const ArtisanTable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sellers, setSellers] = useState([]);
  const [allSellers, setAllSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for view and edit dialogs
  const [selectedSellerId, setSelectedSellerId] = useState(null);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/sellers");
      
      if (Array.isArray(response.data)) {
        setSellers(response.data);
        setAllSellers(response.data);
      } else {
        setSellers([]);
        setAllSellers([]);
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch sellers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  // Auto-refresh every 1 minute
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSellers();
    }, 60000); // 60 seconds = 1 minute

    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim() === "") {
      setSellers(allSellers);
    } else {
      const filtered = allSellers.filter(
        (seller) =>
          (seller.user?.userName && seller.user.userName.toLowerCase().includes(query)) ||
          (seller.businessName && seller.businessName.toLowerCase().includes(query)) ||
          (seller.user?.userAddress && seller.user.userAddress.toLowerCase().includes(query)) ||
          (seller.sellerID && seller.sellerID.toString().includes(query)) ||
          (seller.status && seller.status.toLowerCase().includes(query)) ||
          (seller.total_orders && seller.total_orders.toString().includes(query))
      );
      setSellers(filtered);
    }
  };

  const handleViewSeller = (sellerId) => {
    setSelectedSellerId(sellerId);
    setIsViewDialogOpen(true);
  };

  const handleEditSeller = (seller) => {
    setSelectedSeller(seller);
    setIsEditDialogOpen(true);
  };

  const handleSaveSeller = (updatedSeller) => {
    setSellers(prev => 
      prev.map(seller => 
        seller.sellerID === updatedSeller.sellerID ? updatedSeller : seller
      )
    );
    setAllSellers(prev => 
      prev.map(seller => 
        seller.sellerID === updatedSeller.sellerID ? updatedSeller : seller
      )
    );
  };


  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#d5bfae] border-t-[#a4785a] mx-auto mb-6"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Palette className="h-7 w-7 text-[#a4785a] opacity-40" />
          </div>
        </div>
        <div className="text-[#5c3d28] font-semibold text-lg">Loading artisans...</div>
        <div className="text-[#7b5a3b] text-sm mt-2">Please wait while we fetch the data</div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="p-8">
      <Card className="border-2 border-red-200 shadow-xl">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
              <X className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-red-800">Failed to Load Artisans</h3>
            <p className="text-red-600 text-lg">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg px-6 py-3"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (!sellers || sellers.length === 0) return (
    <div className="p-8">
      <Card className="border-2 border-[#d5bfae] shadow-xl">
        <CardContent className="p-12">
          <div className="text-center space-y-6">
            <div className="p-6 bg-[#f5f0eb] rounded-full w-24 h-24 mx-auto flex items-center justify-center">
              <Palette className="h-12 w-12 text-[#a4785a]" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-[#5c3d28] mb-2">No Artisans Found</h3>
              <p className="text-[#7b5a3b] text-lg">There are no artisans in the system yet.</p>
            </div>
            <Button className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white shadow-lg px-6 py-3 text-base font-semibold">
              <Users className="h-5 w-5 mr-2" />
              Invite Artisans
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Palette className="h-8 w-8" />
              </div>
              Artisan Management
            </h1>
            <p className="text-white/90 mt-3 text-lg">
              Manage and monitor all artisans with performance analytics and revenue insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={fetchSellers}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30 shadow-lg"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>


      {/* Search and Filter */}
      <Card className="bg-white shadow-sm border-2 border-[#d5bfae]">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#a4785a] h-5 w-5" />
                <Input
                  placeholder="Search artisans by name, business, location, or ID..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="pl-12 h-12 border-[#d5bfae] focus:border-[#a4785a] focus:ring-[#a4785a] rounded-xl text-[#5c3d28]"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                className="h-12 border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f5f0eb] hover:border-[#a4785a] rounded-xl font-semibold"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button 
                className="h-12 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white shadow-lg rounded-xl font-semibold"
              >
                Export Data
              </Button>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-xs text-[#7b5a3b] flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              Auto-refreshing every 1 minute
            </div>
            <div className="text-sm text-[#7b5a3b] font-medium">
              Showing {sellers.length} of {allSellers.length} artisans
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Artisans Table */}
      <Card className="shadow-xl border-2 border-[#d5bfae]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gradient-to-r from-[#f5f0eb] via-[#ede5dc] to-[#f5f0eb] border-b-2 border-[#d5bfae]">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[#5c3d28] font-bold">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Artisan
                    </div>
                  </TableHead>
                  <TableHead className="text-[#5c3d28] font-bold">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      Business
                    </div>
                  </TableHead>
                  <TableHead className="text-[#5c3d28] font-bold">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </div>
                  </TableHead>
                  <TableHead className="text-[#5c3d28] font-bold">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Revenue
                    </div>
                  </TableHead>
                  <TableHead className="text-[#5c3d28] font-bold">
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Products
                    </div>
                  </TableHead>
                  <TableHead className="text-[#5c3d28] font-bold">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      Orders
                    </div>
                  </TableHead>
                  <TableHead className="text-[#5c3d28] font-bold">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Member Since
                    </div>
                  </TableHead>
                  <TableHead className="text-[#5c3d28] font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white divide-y divide-[#d5bfae]">
                {sellers.map((seller, index) => (
                  <TableRow 
                    key={index}
                    className="hover:bg-gradient-to-r hover:from-[#f5f0eb]/30 hover:to-[#ede5dc]/30 transition-all duration-200 border-b border-[#d5bfae]/50"
                  >
                    <TableCell className="py-5">
                      <div className="flex items-center gap-4">
                        {seller.profile_image_url ? (
                          <img
                            src={seller.profile_image_url}
                            alt={seller.user?.userName}
                            className="w-14 h-14 object-cover rounded-full border-2 border-[#d5bfae] shadow-md"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="w-14 h-14 bg-gradient-to-br from-[#f5f0eb] to-[#ede5dc] rounded-full flex items-center justify-center border-2 border-[#d5bfae] shadow-md"
                          style={{ display: seller.profile_image_url ? 'none' : 'flex' }}
                        >
                          <Palette className="h-6 w-6 text-[#a4785a]" />
                        </div>
                        <div>
                          <div className="font-semibold text-[#5c3d28] text-base">{seller.user?.userName || "N/A"}</div>
                          <div className="text-xs text-[#7b5a3b] bg-[#f5f0eb] px-2 py-1 rounded-full inline-block mt-1 font-medium">
                            {seller.sellerID || ""}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-[#a4785a]" />
                        <span className="font-medium text-[#5c3d28]">{seller.businessName || "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="flex items-center gap-2 text-[#7b5a3b]">
                        <MapPin className="h-4 w-4 text-[#a4785a]" />
                        <span className="text-sm">{seller.user?.userAddress || "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <span className="font-bold text-green-700 text-base">
                        ₱{seller.total_revenue?.toLocaleString() || '0.00'}
                      </span>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="text-center bg-[#f5f0eb] px-3 py-2 rounded-lg border border-[#d5bfae]">
                        <span className="font-bold text-[#a4785a] text-base">{seller.products_count || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="text-center bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                        <span className="font-bold text-blue-700 text-base">{seller.total_orders || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="flex items-center gap-2 text-[#7b5a3b]">
                        <Calendar className="h-4 w-4 text-[#a4785a]" />
                        <span className="text-sm font-medium">
                          {seller.created_at
                            ? new Date(seller.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewSeller(seller.sellerID)}
                          className="bg-[#f5f0eb] hover:bg-[#ede5dc] text-[#5c3d28] border-[#d5bfae] hover:border-[#a4785a] transition-all duration-200 font-medium"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSeller(seller)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300 transition-all duration-200 font-medium"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300 hover:border-gray-400"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 border-2 border-[#d5bfae] shadow-xl">
                            <DropdownMenuLabel className="text-[#5c3d28] font-bold">More Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-[#d5bfae]" />
                            <DropdownMenuItem 
                              onClick={() => handleViewSeller(seller.sellerID)}
                              className="text-[#5c3d28] hover:bg-[#f5f0eb] cursor-pointer"
                            >
                              <Eye className="h-4 w-4 mr-2 text-[#a4785a]" /> View Full Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleEditSeller(seller)}
                              className="text-[#5c3d28] hover:bg-[#f5f0eb] cursor-pointer"
                            >
                              <Edit className="h-4 w-4 mr-2 text-[#a4785a]" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-[#d5bfae]" />
                            <DropdownMenuItem className="text-red-600 hover:bg-red-50 cursor-pointer">
                              <X className="h-4 w-4 mr-2" /> Deactivate Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-[#7b5a3b] font-medium">
          Displaying <span className="font-bold text-[#5c3d28]">{sellers.length}</span> of <span className="font-bold text-[#5c3d28]">{allSellers.length}</span> artisans
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled
            className="border-[#d5bfae] text-[#7b5a3b]"
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            disabled
            className="border-[#d5bfae] text-[#7b5a3b]"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Seller Detail Dialog */}
      <SellerDetail
        sellerId={selectedSellerId}
        isOpen={isViewDialogOpen}
        onClose={() => {
          setIsViewDialogOpen(false);
          setSelectedSellerId(null);
        }}
        onEdit={handleEditSeller}
      />

      {/* Seller Edit Dialog */}
      <SellerEdit
        seller={selectedSeller}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedSeller(null);
        }}
        onSave={handleSaveSeller}
      />
    </div>
  );
};

export default ArtisanTable;
