import React, { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import {
  Palette,
  Key,
  Save,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  Star,
  MessageCircle,
  Heart,
  Share2,
  MapPin,
  Calendar,
  Users,
  AlertCircle,
} from "lucide-react";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import { setupTestSellerAuth } from "../../utils/sellerAuthHelper";

// Pre-defined color themes
const colorThemes = [
  {
    name: "Earth & Craft",
    primary: "#8B4513",
    secondary: "#CD853F",
    background: "#FFF8DC",
    text: "#3E2723",
    accent: "#D2691E"
  },
  {
    name: "Ocean Breeze",
    primary: "#2E5266",
    secondary: "#6E9887",
    background: "#F5F7FA",
    text: "#1A1F2E",
    accent: "#4A90A4"
  },
  {
    name: "Forest Green",
    primary: "#2D5016",
    secondary: "#558B2F",
    background: "#E8F5E9",
    text: "#1B5E20",
    accent: "#7CB342"
  },
  {
    name: "Sunset Orange",
    primary: "#D84315",
    secondary: "#FF6F00",
    background: "#FFF3E0",
    text: "#BF360C",
    accent: "#FF8F00"
  },
  {
    name: "Purple Dream",
    primary: "#4A148C",
    secondary: "#7B1FA2",
    background: "#F3E5F5",
    text: "#4A148C",
    accent: "#AB47BC"
  },
  {
    name: "Classic Black",
    primary: "#212121",
    secondary: "#424242",
    background: "#FAFAFA",
    text: "#212121",
    accent: "#616161"
  },
  {
    name: "Sky Blue",
    primary: "#0277BD",
    secondary: "#0288D1",
    background: "#E3F2FD",
    text: "#01579B",
    accent: "#03A9F4"
  },
  {
    name: "Rose Gold",
    primary: "#B71C1C",
    secondary: "#D32F2F",
    background: "#FFEBEE",
    text: "#C62828",
    accent: "#F44336"
  }
];

const StorefrontCustomizer = () => {
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [authError, setAuthError] = useState(false);
  const [discountCodes, setDiscountCodes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [customization, setCustomization] = useState({
    primary_color: "#6366f1",
    secondary_color: "#f43f5e",
    background_color: "#ffffff",
    text_color: "#1f2937",
    accent_color: "#0ea5e9",
    heading_font: "Inter",
    body_font: "Inter",
    heading_size: 18,
    body_size: 16,
    show_hero_section: true,
    show_featured_products: true,
    desktop_columns: 4,
    mobile_columns: 2,
    product_card_style: "minimal",
  });
  const [images, setImages] = useState({
    logo: null,
    background: null,
  });
  const [imagePreviews, setImagePreviews] = useState({
    logo: null,
    background: null,
  });
  // Removed storeProducts and productsLoading since we're using mock products
  // const [storeProducts, setStoreProducts] = useState([]);
  // const [productsLoading, setProductsLoading] = useState(false);

  // Authentication setup handler
  const handleSetupAuth = () => {
    setupTestSellerAuth();
    setTimeout(() => {
      setAuthError(false);
      fetchStoreData();
    }, 1000);
  };

  // Fetch store data on component mount
  useEffect(() => {
    fetchStoreData();
  }, []);

  // Fetch discount codes once store data (and seller ID) is available
  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const sellerId = storeData?.seller?.sellerID;
        if (!sellerId) return;
        const response = await fetch(`http://localhost:8000/api/analytics/seller/${sellerId}`);
        if (response.ok) {
          const data = await response.json();
          setDiscountCodes(Array.isArray(data?.discount_codes) ? data.discount_codes : []);
        } else {
          setDiscountCodes([]);
        }
      } catch {
        setDiscountCodes([]);
      }
    };
    fetchDiscounts();
  }, [storeData?.seller?.sellerID]);

  // No need to fetch real products since we're using mock products for preview
  // useEffect(() => {
  //   if (previewMode && storeData?.store?.storeID) {
  //     fetchStoreProducts();
  //   }
  // }, [previewMode, storeData]);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      // Use sessionStorage to match the main API configuration
      const token = sessionStorage.getItem("auth_token") || localStorage.getItem("token");
      
      console.log("🔍 Fetching store data...");
      console.log("🔑 Token:", token ? "Present" : "Missing");
      
      const response = await fetch("http://localhost:8000/api/stores/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📡 Response status:", response.status);
      console.log("📡 Response ok:", response.ok);

      // Check if the response is HTML instead of JSON
      const contentType = response.headers.get("content-type");
      console.log("📄 Content-Type:", contentType);
      
      if (contentType && contentType.includes("text/html")) {
        const htmlText = await response.text();
        console.error("💥 Received HTML instead of JSON:", htmlText.substring(0, 200) + "...");
        console.error("💥 Full HTML response:", htmlText);
        setError("Received HTML response instead of JSON. This usually means authentication failed or the API endpoint is not working correctly.");
        setStoreData(null);
        setLoading(false);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log("📦 Store data received:", data);
        setStoreData(data);
        
        // Set customization data from store
        if (data.store) {
          console.log("🏪 Store found:", data.store);
          console.log("🖼️ Logo URL:", data.logo_url);
          console.log("🖼️ Background URL:", data.background_url);
          
          setCustomization({
            primary_color: data.store.primary_color || "#6366f1",
            secondary_color: data.store.secondary_color || "#f43f5e",
            background_color: data.store.background_color || "#ffffff",
            text_color: data.store.text_color || "#1f2937",
            accent_color: data.store.accent_color || "#0ea5e9",
            heading_font: data.store.heading_font || "Inter",
            body_font: data.store.body_font || "Inter",
            heading_size: data.store.heading_size || 18,
            body_size: data.store.body_size || 16,
            show_hero_section: data.store.show_hero_section ?? true,
            show_featured_products: data.store.show_featured_products ?? true,
            desktop_columns: data.store.desktop_columns || 4,
            mobile_columns: data.store.mobile_columns || 2,
            product_card_style: data.store.product_card_style || "minimal",
          });

          // Set image previews
          setImagePreviews({
            logo: data.logo_url,
            background: data.background_url,
          });
          
          console.log("✅ Store data loaded successfully");
        } else {
          console.warn("⚠️ No store data found in response");
        }
      } else if (response.status === 404) {
        console.warn("⚠️ No store found. User may need to create a store first.");
        setStoreData(null);
      } else if (response.status === 401) {
        console.error("❌ Authentication failed - token may be expired");
        setAuthError(true);
        setError("Authentication required to access store data");
        setStoreData(null);
        return;
      } else {
        const errorData = await response.json();
        console.error("❌ Failed to fetch store data:", errorData);
        setError(`Failed to fetch store data: ${errorData.message || 'Unknown error'}`);
        setStoreData(null);
      }
    } catch (error) {
      console.error("💥 Error fetching store data:", error);
      if (error.message.includes("Unexpected token '<'") || error.message.includes("CORS")) {
        setAuthError(true);
        setError("Authentication required to access store data. Please set up authentication to continue.");
      } else {
        setError(`An error occurred while fetching store data: ${error.message}`);
      }
      setStoreData(null);
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (theme) => {
    setSelectedTheme(theme);
    setCustomization({
      ...customization,
      primary_color: theme.primary,
      secondary_color: theme.secondary,
      background_color: theme.background,
      text_color: theme.text,
      accent_color: theme.accent,
    });
  };

const handleImageUpload = (type, file) => {
  if (file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }
    
    // Validate file size (8MB max)
    if (file.size > 8 * 1024 * 1024) {
      setError('Image size must be less than 8MB');
      return;
    }
    
    setImages({ ...images, [type]: file });
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreviews({ ...imagePreviews, [type]: e.target.result });
    };
    reader.readAsDataURL(file);
    
    // Clear any previous errors and show success
    setError(null);
    setSuccess(`${type === 'background' ? 'Background' : 'Logo'} image uploaded successfully!`);
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(null), 3000);
  }
};

  const saveCustomization = async () => {
    try {
      setSaving(true);
      // Use sessionStorage to match the main API configuration
    const token = sessionStorage.getItem("auth_token") || localStorage.getItem("token");
      
      // Create FormData for both JSON data and files
      const formData = new FormData();

      // Add customization data as a JSON string
      const customizationData = {
        store_description: storeData?.store?.store_description || '',
        primary_color: customization.primary_color,
        secondary_color: customization.secondary_color,
        background_color: customization.background_color,
        text_color: customization.text_color,
        accent_color: customization.accent_color,
        heading_font: customization.heading_font,
        body_font: customization.body_font,
        heading_size: parseInt(customization.heading_size),
        body_size: parseInt(customization.body_size),
        show_hero_section: customization.show_hero_section === 'true' || customization.show_hero_section === true,
        show_featured_products: customization.show_featured_products === 'true' || customization.show_featured_products === true,
        desktop_columns: parseInt(customization.desktop_columns),
        mobile_columns: parseInt(customization.mobile_columns),
        product_card_style: customization.product_card_style
      };

      // Append customization data as JSON string
      formData.append('customization', JSON.stringify(customizationData));
      
      // Add image files if they exist
      if (images.logo) {
        formData.append('logo', images.logo);
      }
      if (images.background) {
        formData.append('background_image', images.background);
      }

      console.log("Sending customization data:", {
        customization: customizationData,
        hasLogo: !!images.logo,
        hasBackground: !!images.background
      });

      const response = await fetch("http://localhost:8000/api/stores/customization", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

        const data = await response.json();
      
      if (response.ok) {
        console.log("Customization saved:", data);
        setSuccess("Store customization saved successfully!");
        
        // Clear image files from state since they're now saved
        setImages({ logo: null, background: null });
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
        // Refresh store data to get updated URLs
        await fetchStoreData();
      } else {
        console.error("Server error response:", data);
        let errorMessage = "Failed to save customization";
        
        if (data.message) {
          errorMessage = data.message;
        } else if (data.errors) {
          // Handle Laravel validation errors
          errorMessage = Object.values(data.errors).flat().join(", ");
        }
        
        setError(errorMessage);
      }
    } catch (error) {
      console.error("Error saving customization:", error);
      setError("An unexpected error occurred while saving customization. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full pt-4">
        <LoadingSpinner message="Loading store data..." />
      </div>
    );
  }

  // Show authentication error state
  if (authError || (error && error.includes("authentication"))) {
    return (
      <div className="w-full pt-4">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be authenticated to access store customization.
          </p>
          <div className="space-y-4">
            <Button 
              onClick={handleSetupAuth}
              className="bg-[#a4785a] hover:bg-[#8a6a5a] text-white px-6 py-3"
            >
              <Key className="h-5 w-5 mr-2" />
              Setup Test Authentication
            </Button>
            <p className="text-sm text-gray-500">
              This will set up a test authentication token for development purposes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state for other critical errors
  if (error && (error.includes("HTML") || error.includes("network"))) {
    return (
      <div className="w-full pt-4">
        <ErrorState 
          message={error} 
          onRetry={() => {
            setError(null);
            fetchStoreData();
          }} 
        />
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="space-y-6 p-6">
        <EmptyState
          icon="🏪"
          title="No Store Found"
          description="You need to create a store first before you can customize it."
          action={
            <p className="text-sm text-gray-500">
              If you've already created a store, please check your authentication or contact support.
            </p>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-6 max-w-[405px] sm:max-w-none mx-auto">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
          <button 
            onClick={() => setError(null)}
            className="float-right text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <strong className="font-bold">Success:</strong>
          <span className="block sm:inline"> {success}</span>
          <button 
            onClick={() => setSuccess(null)}
            className="float-right text-green-500 hover:text-green-700"
          >
            ✕
          </button>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
      <div>
        <h1 className="text-base sm:text-2xl font-bold">Storefront Customizer</h1>
        <p className="text-gray-500 mt-0.5 sm:mt-1 text-[10px] sm:text-base">
          Personalize your shop's appearance to reflect your brand identity.
        </p>
        </div>
        <div className="flex gap-1 sm:gap-2 justify-end">
          <Button
            variant={previewMode ? "default" : "outline"}
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-1 text-[10px] sm:text-base py-1 px-2 sm:px-4 sm:py-2 h-7 sm:h-auto"
          >
            {previewMode ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
            <span className="hidden sm:inline">{previewMode ? "Edit Mode" : "Customer View"}</span>
            <span className="sm:hidden">{previewMode ? "Edit" : "View"}</span>
          </Button>
          <Button
            onClick={saveCustomization}
            disabled={saving}
            className="flex items-center gap-1 text-[10px] sm:text-base py-1 px-2 sm:px-4 sm:py-2 h-7 sm:h-auto"
          >
            <Save className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{saving ? "Saving..." : "Save Changes"}</span>
            <span className="sm:hidden">{saving ? "..." : "Save"}</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        <div className="w-full lg:w-2/3">
          <Card className="p-2 sm:p-6 bg-white border border-dashed border-gray-200">
            {previewMode ? (
              <div className="overflow-x-hidden">
                <StorePreview 
                  storeData={storeData} 
                  customization={customization}
                  imagePreviews={imagePreviews}
                  setPreviewMode={setPreviewMode}
                  discountCodes={discountCodes}
                />
              </div>
            ) : (
            <div className="text-center py-12 sm:py-20">
                <div className="max-w-md mx-auto px-4">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <Eye className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Preview Your Store</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                    Toggle "Customer View" to see how your store looks to customers
                  </p>
                  <Button
                    onClick={() => setPreviewMode(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base"
                  >
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    View Customer Experience
                  </Button>
                </div>
            </div>
            )}
          </Card>
        </div>

        <div className="w-full lg:w-1/3 space-y-6">
          <Tabs defaultValue="branding">
            <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-[#faf9f8] to-white p-2 min-h-[80px] sm:min-h-[90px] rounded-lg border-2 border-[#e5ded7] shadow-md">
              <TabsTrigger 
                value="branding"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#a4785a] data-[state=active]:to-[#7b5a3b] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 hover:bg-[#faf9f8] rounded h-full px-2 py-2 text-[10px] sm:text-base flex flex-col sm:flex-row items-center justify-center"
              >
                <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4 mb-0.5 sm:mb-0 sm:mr-2" />
                <span className="font-medium">Brand</span>
              </TabsTrigger>
              <TabsTrigger 
                value="theme"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#a4785a] data-[state=active]:to-[#7b5a3b] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 hover:bg-[#faf9f8] rounded h-full px-2 py-2 text-[10px] sm:text-base flex flex-col sm:flex-row items-center justify-center"
              >
                <Palette className="h-3 w-3 sm:h-4 sm:w-4 mb-0.5 sm:mb-0 sm:mr-2" />
                <span className="font-medium">Theme</span>
              </TabsTrigger>
            </TabsList>

            {/* Branding Tab */}
            <TabsContent value="branding" className="space-y-4 pt-4">
              <Card className="p-3 sm:p-6 space-y-4 sm:space-y-6 border-2 border-[#e5ded7] shadow-xl rounded-xl sm:rounded-2xl bg-gradient-to-br from-white to-[#faf9f8]">
                <div className="flex items-center gap-2 sm:gap-3 pb-3 sm:pb-4 border-b-2 border-[#e5ded7]">
                  <div className="p-1.5 sm:p-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg">
                    <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#5c3d28]">Brand Identity</h3>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#5c3d28] flex items-center gap-2">
                    <span className="p-1 bg-[#a4785a]/10 rounded">🏪</span>
                    Store Name
                  </Label>
                  <Input 
                    value={storeData?.store?.store_name || ""} 
                    disabled 
                    className="bg-[#faf9f8] border-[#e5ded7] text-[#5c3d28] font-medium cursor-not-allowed"
                  />
                  <p className="text-xs text-[#7b5a3b] flex items-center gap-1">
                    <span className="text-amber-600">ℹ️</span> Store name cannot be changed here
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#5c3d28] flex items-center gap-2">
                    <span className="p-1 bg-[#a4785a]/10 rounded">📝</span>
                    Store Description
                  </Label>
                  <textarea
                    value={storeData?.store?.store_description || ""}
                    onChange={(e) => {
                      setStoreData({
                        ...storeData,
                        store: {
                          ...storeData.store,
                          store_description: e.target.value
                        }
                      });
                    }}
                    placeholder="Describe your store and what makes it unique..."
                    className="w-full min-h-[100px] p-3 rounded-xl border-2 border-[#e5ded7] focus:outline-none focus:ring-2 focus:ring-[#a4785a] focus:border-[#a4785a] resize-y bg-white text-[#5c3d28] transition-all duration-200"
                  />
                  <p className="text-xs text-[#7b5a3b] flex items-center gap-1">
                    <span className="text-blue-600">💡</span> This description will appear on your store's homepage
                  </p>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-[#5c3d28] flex items-center gap-2">
                    <span className="p-1 bg-[#a4785a]/10 rounded">🎨</span>
                    Store Logo
                  </Label>
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#faf9f8] to-white border-2 border-[#e5ded7] rounded-xl hover:border-[#a4785a] transition-all duration-200">
                    {imagePreviews.logo && (
                      <div className="relative group">
                        <img 
                          src={imagePreviews.logo} 
                          alt="Logo preview" 
                          className="w-16 h-16 object-contain border-2 border-[#a4785a] rounded-lg shadow-md"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload('logo', e.target.files[0])}
                        className="hidden"
                        id="logo-upload"
                      />
                      <Label htmlFor="logo-upload" className="cursor-pointer">
                        <Button variant="outline" size="sm" asChild className="border-[#a4785a] text-[#5c3d28] hover:bg-[#a4785a] hover:text-white transition-all duration-200">
                          <span><Upload className="h-4 w-4 mr-2" />{imagePreviews.logo ? 'Change Logo' : 'Upload Logo'}</span>
                        </Button>
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-lg font-semibold">Store Banner Background</Label>
                  <p className="text-sm text-gray-600 mb-3">
                    This image will appear behind your store name and create the main visual impact of your storefront.
                  </p>
                  <div className="space-y-3">
                    {imagePreviews.background ? (
                      <div className="relative group">
                        <img 
                          src={imagePreviews.background} 
                          alt="Background preview" 
                          className="w-full h-40 object-cover border rounded-lg shadow-sm"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setImagePreviews({ ...imagePreviews, background: null });
                              setImages({ ...images, background: null });
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                        <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-600 mb-2">No banner background selected</p>
                        <p className="text-sm text-gray-500">Upload a stunning background image that represents your store</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload('background', e.target.files[0])}
                        className="hidden"
                        id="background-upload"
                      />
                      <Label htmlFor="background-upload" className="cursor-pointer flex-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          asChild 
                          className="w-full h-12 text-base font-medium"
                        >
                          <span><Upload className="h-5 w-5 mr-2" />{imagePreviews.background ? 'Change Banner Background' : 'Upload Banner Background'}</span>
                        </Button>
                      </Label>
                    </div>
                    
                    {/* Live Preview of Banner */}
                    {imagePreviews.background && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Live Preview:</Label>
                        <div className="relative w-full h-24 overflow-hidden rounded-lg border shadow-sm">
                          <img 
                            src={imagePreviews.background} 
                            alt="Banner preview" 
                            className="w-full h-full object-cover"
                            style={{ filter: 'brightness(0.7)' }}
                          />
                          <div 
                            className="absolute inset-0" 
                            style={{ 
                              background: `linear-gradient(to bottom, ${customization.primary_color}40, ${customization.background_color}60)` 
                            }} 
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <h3 
                              className="text-lg font-bold text-white drop-shadow-lg"
                              style={{ 
                                fontFamily: customization.heading_font,
                                textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                              }}
                            >
                              {storeData?.store?.store_name || "Your Store"}
                            </h3>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="text-sm text-blue-800 space-y-1">
                        <p className="font-medium">💡 Pro Tips for Great Banner Images:</p>
                        <p>• Use high-resolution images (1920x1080px or larger)</p>
                        <p>• Choose images that complement your brand colors</p>
                        <p>• Ensure text remains readable over the background</p>
                        <p>• Consider using images that represent your products or craft</p>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>• Supported formats: JPG, PNG, GIF, SVG</p>
                      <p>• Maximum file size: 8MB</p>
                      <p>• Image will be automatically cropped to fit banner dimensions</p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Theme Tab */}
            <TabsContent value="theme" className="space-y-4 pt-4">
              <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6 border-2 border-[#e5ded7] shadow-xl rounded-xl sm:rounded-2xl bg-gradient-to-br from-white to-[#faf9f8]">
                <div className="flex items-center gap-2 sm:gap-3 pb-3 sm:pb-4 border-b-2 border-[#e5ded7]">
                  <div className="p-1.5 sm:p-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg">
                    <Palette className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#5c3d28]">Choose Your Theme</h3>
                </div>
                
                <p className="text-sm text-[#7b5a3b]">
                  Select a pre-designed color theme that best represents your brand. These themes have been carefully crafted for optimal visual appeal.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {colorThemes.map((theme) => (
                    <button
                      key={theme.name}
                      onClick={() => applyTheme(theme)}
                      className={`
                        relative overflow-hidden rounded-lg sm:rounded-xl border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg
                        ${selectedTheme?.name === theme.name 
                          ? 'border-[#a4785a] shadow-lg ring-2 ring-[#a4785a]/50' 
                          : 'border-[#e5ded7] hover:border-[#a4785a]'
                        }
                      `}
                    >
                      <div className="aspect-square flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4">
                        {/* Color Swatches */}
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          <div 
                            className="w-5 h-5 sm:w-6 sm:h-6 rounded shadow-sm"
                            style={{ backgroundColor: theme.primary }}
                            title="Primary"
                          />
                          <div 
                            className="w-5 h-5 sm:w-6 sm:h-6 rounded shadow-sm"
                            style={{ backgroundColor: theme.secondary }}
                            title="Secondary"
                          />
                          <div 
                            className="w-5 h-5 sm:w-6 sm:h-6 rounded shadow-sm"
                            style={{ backgroundColor: theme.accent }}
                            title="Accent"
                          />
                          <div 
                            className="w-5 h-5 sm:w-6 sm:h-6 rounded shadow-sm border border-gray-300"
                            style={{ backgroundColor: theme.background }}
                            title="Background"
                          />
                        </div>
                        <span className="text-[10px] sm:text-xs font-semibold text-[#5c3d28] text-center">
                          {theme.name}
                        </span>
                      </div>
                      
                      {selectedTheme?.name === theme.name && (
                        <div className="absolute top-2 right-2">
                          <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white rounded-full p-1 shadow-md">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Font Selection */}
                <div className="border-t-2 border-[#e5ded7] pt-4 sm:pt-6 space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-2 sm:gap-3 pb-3 border-b-2 border-[#e5ded7]">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg">
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[#5c3d28]">Font Selection</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm font-semibold text-[#5c3d28]">Heading Font</Label>
                      <select
                        value={customization.heading_font}
                        onChange={(e) => setCustomization({ ...customization, heading_font: e.target.value })}
                        className="w-full px-3 py-2 text-xs sm:text-sm border-2 border-[#e5ded7] focus:border-[#a4785a] rounded-lg bg-white text-[#5c3d28] transition-all duration-200"
                      >
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Playfair Display">Playfair Display</option>
                        <option value="Merriweather">Merriweather</option>
                        <option value="Poppins">Poppins</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm font-semibold text-[#5c3d28]">Body Font</Label>
                      <select
                        value={customization.body_font}
                        onChange={(e) => setCustomization({ ...customization, body_font: e.target.value })}
                        className="w-full px-3 py-2 text-xs sm:text-sm border-2 border-[#e5ded7] focus:border-[#a4785a] rounded-lg bg-white text-[#5c3d28] transition-all duration-200"
                      >
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Lato">Lato</option>
                        <option value="Source Sans Pro">Source Sans Pro</option>
                        <option value="Poppins">Poppins</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm font-semibold text-[#5c3d28]">Heading Size: {customization.heading_size}px</Label>
                      <input
                        type="range"
                        min="14"
                        max="28"
                        step="1"
                        value={customization.heading_size}
                        onChange={(e) => setCustomization({ ...customization, heading_size: parseInt(e.target.value) })}
                        className="w-full h-2 bg-[#e5ded7] rounded-lg appearance-none cursor-pointer accent-[#a4785a]"
                      />
                      <div className="flex justify-between text-xs text-[#7b5a3b]">
                        <span>14px</span>
                        <span>21px</span>
                        <span>28px</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs sm:text-sm font-semibold text-[#5c3d28]">Body Size: {customization.body_size}px</Label>
                      <input
                        type="range"
                        min="12"
                        max="18"
                        step="1"
                        value={customization.body_size}
                        onChange={(e) => setCustomization({ ...customization, body_size: parseInt(e.target.value) })}
                        className="w-full h-2 bg-[#e5ded7] rounded-lg appearance-none cursor-pointer accent-[#a4785a]"
                      />
                      <div className="flex justify-between text-xs text-[#7b5a3b]">
                        <span>12px</span>
                        <span>15px</span>
                        <span>18px</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 sm:p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                  <p className="text-xs sm:text-sm text-blue-800 flex items-center gap-2">
                    <span className="text-lg">💡</span>
                    <span className="font-medium">Tips: Choose a theme that matches your brand personality and product style</span>
                  </p>
                </div>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  );
};

// Store Preview Component with StoreView Design
const StorePreview = ({ storeData, customization, imagePreviews, setPreviewMode, discountCodes = [] }) => {
  // Debug logging
  console.log("🔍 StorePreview - storeData:", storeData);
  console.log("🔍 StorePreview - logo_url:", storeData?.logo_url);
  console.log("🔍 StorePreview - imagePreviews:", imagePreviews);
  
  // Use real store data from database
  const store = {
    name: storeData?.store?.store_name || "Your Store",
    logo: storeData?.logo_url || imagePreviews.logo || null, // Use saved logo URL first, then preview
    banner: storeData?.background_url || imagePreviews.background || "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80",
    rating: storeData?.seller?.average_rating || 4.8, // Real rating from database
    followers: storeData?.seller?.followers_count || 1250,
    location: [
      storeData?.store?.owner_address,
      storeData?.seller?.user?.userCity, 
      storeData?.seller?.user?.userProvince
    ].filter(Boolean).join(', ') || 
    storeData?.store?.owner_address || 
    "Location not specified",
    yearsActive: storeData?.seller?.created_at ? Math.floor((new Date() - new Date(storeData.seller.created_at)) / (1000 * 60 * 60 * 24 * 365)) : 2,
    description: storeData?.store?.store_description || "Add a description to tell your customers about your store and what makes it special...",
    categories: storeData?.store?.category ? [storeData.store.category] : ["Handcrafted", "Artisan", "Unique"],
  };

  // Use mock products for preview instead of real products
  const mockProducts = [
    {
      id: 1,
      name: "Product 1",
      price: "₱299.99",
      image: null, // No image - will show placeholder
      category: "Category 1",
      rating: 4.5,
      isNew: true,
      discount: null,
      oldPrice: null,
    },
    {
      id: 2,
      name: "Product 2",
      price: "₱189.99",
      image: null, // No image - will show placeholder
      category: "Category 2",
      rating: 4.8,
      isNew: true,
      discount: 15,
      oldPrice: "₱223.99",
    },
    {
      id: 3,
      name: "Product 3",
      price: "₱459.99",
      image: null, // No image - will show placeholder
      category: "Category 3",
      rating: 4.3,
      isNew: false,
      discount: null,
      oldPrice: null,
    },
    {
      id: 4,
      name: "Product 4",
      price: "₱399.99",
      image: null, // No image - will show placeholder
      category: "Category 4",
      rating: 4.7,
      isNew: false,
      discount: 20,
      oldPrice: "₱499.99",
    },
    {
      id: 5,
      name: "Product 5",
      price: "₱249.99",
      image: null, // No image - will show placeholder
      category: "Category 5",
      rating: 4.4,
      isNew: false,
      discount: null,
      oldPrice: null,
    },
    {
      id: 6,
      name: "Product 6",
      price: "₱329.99",
      image: null, // No image - will show placeholder
      category: "Category 6",
      rating: 4.6,
      isNew: false,
      discount: null,
      oldPrice: null,
    },
  ];

  // Mock data for Featured Products
  const mockFeaturedProducts = [
    {
      id: 1,
      name: "Featured Product 1",
      price: "₱1,299.00",
      image: null,
      category: "Category 1",
      rating: 4.9,
      badge: "Best Seller",
    },
    {
      id: 2,
      name: "Featured Product 2",
      price: "₱899.00",
      image: null,
      category: "Category 2",
      rating: 4.8,
      badge: "Featured",
    },
    {
      id: 3,
      name: "Featured Product 3",
      price: "₱1,599.00",
      image: null,
      category: "Category 3",
      rating: 4.7,
      badge: "New",
    },
    {
      id: 4,
      name: "Featured Product 4",
      price: "₱699.00",
      image: null,
      category: "Category 4",
      rating: 4.6,
      badge: "Popular",
    },
  ];

  // Mock data for Workshops & Events
  const mockWorkshopsAndEvents = [
    {
      id: 1,
      title: "Workshop & Event 1",
      date: "October 15, 2023",
      time: "2:00 PM - 5:00 PM",
      price: "₱1,200.00",
      image: null,
      spots: "10 spots",
      type: "Workshop",
    },
    {
      id: 2,
      title: "Workshop & Event 2",
      date: "October 20, 2023",
      time: "9:00 AM - 6:00 PM",
      price: "Free Entry",
      image: null,
      spots: "Open to All",
      type: "Event",
    },
    {
      id: 3,
      title: "Workshop & Event 3",
      date: "November 5, 2023",
      time: "10:00 AM - 1:00 PM",
      price: "₱1,500.00",
      image: null,
      spots: "8 spots",
      type: "Workshop",
    },
    {
      id: 4,
      title: "Workshop & Event 4",
      date: "November 18, 2023",
      time: "6:00 PM - 9:00 PM",
      price: "₱200.00",
      image: null,
      spots: "30 attendees",
      type: "Event",
    },
    {
      id: 5,
      title: "Workshop & Event 5",
      date: "December 10, 2023",
      time: "9:00 AM - 4:00 PM",
      price: "₱2,000.00",
      image: null,
      spots: "6 spots",
      type: "Workshop",
    },
    {
      id: 6,
      title: "Workshop & Event 6",
      date: "December 15, 2023",
      time: "10:00 AM - 8:00 PM",
      price: "₱50.00",
      image: null,
      spots: "500 attendees",
      type: "Event",
    },
  ];

  // Use mock products for the preview
  const products = mockProducts;

  return (
    <div className="min-h-screen" style={{ backgroundColor: customization.background_color }}>
      {/* Professional Back Button */}
      <div className="max-w-5xl mx-auto pt-8 pb-2 flex items-center">
        <button
          onClick={() => setPreviewMode(false)}
          className="group flex items-center gap-2 px-3 py-2 bg-white/80 rounded-full font-semibold border shadow-md hover:shadow-lg transition-all duration-200 backdrop-blur-md"
          style={{ 
            color: customization.primary_color,
            borderColor: customization.accent_color,
            '--hover-bg': customization.accent_color,
            '--hover-text': customization.text_color
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = customization.accent_color;
            e.target.style.color = customization.text_color;
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            e.target.style.color = customization.primary_color;
          }}
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" className="-ml-1 group-hover:-translate-x-1 transition-transform duration-200"><circle cx="12" cy="12" r="12" fill="#ffe082" className="opacity-0 group-hover:opacity-30 transition"/><path d="M15 19l-7-7 7-7" stroke="#a67c68" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="hidden sm:inline-block">Back to Edit</span>
        </button>
      </div>

      {/* Banner with overlay */}
      <div className="relative w-full h-48 sm:h-60 md:h-72 lg:h-80 overflow-hidden">
        <img 
          src={store.banner} 
          alt="Store Banner" 
          className="w-full h-full object-cover" 
          style={{ 
            filter: 'brightness(0.7)',
            objectPosition: 'center center'
          }}
        />
        <div 
          className="absolute inset-0" 
          style={{ 
            background: `linear-gradient(to bottom, ${customization.primary_color}40, ${customization.background_color}60)` 
          }} 
        />
        <div className="absolute left-4 sm:left-8 bottom-4 sm:bottom-8 flex items-center gap-4 sm:gap-6">
          <div className="-mt-16 sm:-mt-24">
            <div 
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center overflow-hidden border-2 sm:border-4 border-white"
              style={{ backgroundColor: customization.background_color }}
            >
              {(storeData?.logo_url || imagePreviews.logo) ? (
                <img src={storeData?.logo_url || imagePreviews.logo} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              )}
            </div>
          </div>
          <div>
            <h1 
              className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white drop-shadow-2xl mb-2 sm:mb-4"
              style={{ 
                fontFamily: customization.heading_font,
                fontSize: `clamp(1.5rem, ${customization.heading_size * 1.5}px, ${customization.heading_size * 2.5}px)`,
                textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.5)',
                letterSpacing: '0.05em'
              }}
            >
              {store.name}
            </h1>
            <div className="hidden sm:flex flex-wrap gap-3 mb-2">
              <span 
                className="flex items-center gap-1 font-semibold px-3 py-1 rounded-full text-base shadow"
                style={{ backgroundColor: customization.background_color, color: customization.primary_color }}
              >
                <Star className="w-5 h-5 text-yellow-500" /> {store.rating} rating
              </span>
              <span 
                className="flex items-center gap-1 font-semibold px-3 py-1 rounded-full text-base shadow"
                style={{ backgroundColor: customization.background_color, color: customization.primary_color }}
              >
                <Users className="w-5 h-5" /> {store.followers.toLocaleString()} followers
              </span>
              <span 
                className="flex items-center gap-1 font-semibold px-3 py-1 rounded-full text-base shadow"
                style={{ backgroundColor: customization.background_color, color: customization.primary_color }}
              >
                <MapPin className="w-5 h-5" /> {store.location}
              </span>
              <span 
                className="flex items-center gap-1 font-semibold px-3 py-1 rounded-full text-base shadow"
                style={{ backgroundColor: customization.background_color, color: customization.primary_color }}
              >
                <Calendar className="w-5 h-5" /> {store.yearsActive} years active
              </span>
            </div>
            <div className="flex sm:hidden items-center gap-2 text-white text-sm">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" /> {store.rating}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" /> {store.followers.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        <div className="absolute right-2 sm:right-8 top-2 sm:top-8 flex gap-2 sm:gap-3">
          <div className="sm:hidden">
            <button 
              className="p-2 rounded-lg shadow bg-white text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => {
                const modal = document.createElement('div');
                modal.className = 'fixed inset-0 z-50 flex items-end sm:items-center justify-center';
                modal.innerHTML = `
                  <div class="absolute inset-0 bg-black/50" onclick="this.parentElement.remove()"></div>
                  <div class="relative bg-white w-full max-w-sm mx-4 mb-4 rounded-t-xl sm:rounded-xl shadow-xl overflow-hidden">
                    <div class="p-4 space-y-3">
                      <button class="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left" onclick="this.closest('.fixed').remove()">
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span class="font-medium">Follow Store</span>
                      </button>
                      <button class="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left" onclick="this.closest('.fixed').remove()">
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span class="font-medium">Message Seller</span>
                      </button>
                      <button class="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left" onclick="this.closest('.fixed').remove()">
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        <span class="font-medium">Share Store</span>
                      </button>
                    </div>
                    <div class="p-4 border-t">
                      <button class="w-full p-3 text-center text-gray-500 hover:text-gray-600" onclick="this.closest('.fixed').remove()">
                        Cancel
                      </button>
                    </div>
                  </div>
                `;
                document.body.appendChild(modal);
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </button>
          </div>
          <div className="hidden sm:flex gap-3">
            <button 
              className="font-semibold px-5 py-2 rounded-lg shadow flex items-center gap-2 border transition"
              style={{ 
                backgroundColor: customization.background_color, 
                color: customization.primary_color,
                borderColor: customization.primary_color
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = customization.accent_color;
                e.target.style.color = customization.text_color;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = customization.background_color;
                e.target.style.color = customization.primary_color;
              }}
            >
              <Heart className="w-5 h-5" /> Follow
            </button>
            <button 
              className="font-semibold px-5 py-2 rounded-lg shadow flex items-center gap-2 border transition"
              style={{ 
                backgroundColor: customization.background_color, 
                color: customization.primary_color,
                borderColor: customization.primary_color
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = customization.accent_color;
                e.target.style.color = customization.text_color;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = customization.background_color;
                e.target.style.color = customization.primary_color;
              }}
            >
              <MessageCircle className="w-5 h-5" /> Message
            </button>
            <button 
              className="font-semibold px-5 py-2 rounded-lg shadow flex items-center gap-2 border transition"
              style={{ 
                backgroundColor: customization.background_color, 
                color: customization.primary_color,
                borderColor: customization.primary_color
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = customization.accent_color;
                e.target.style.color = customization.text_color;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = customization.background_color;
                e.target.style.color = customization.primary_color;
              }}
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Store Description & Categories */}
      <div className="max-w-5xl mx-auto mt-8 z-10 relative">
        <div 
          className="rounded-2xl shadow p-6 flex flex-col md:flex-row md:items-center gap-4"
          style={{ backgroundColor: customization.background_color }}
        >
          <div className="flex-1">
            <p 
              className="text-lg font-medium mb-3"
              style={{ 
                color: customization.text_color,
                fontFamily: customization.body_font,
                fontSize: `${customization.body_size}px`
              }}
            >
              {store.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {store.categories.map((cat) => (
                <span 
                  key={cat} 
                  className="font-semibold px-4 py-1 rounded-full text-sm shadow"
                  style={{ 
                    backgroundColor: customization.accent_color, 
                    color: customization.text_color 
                  }}
                >
                  {cat}
                </span>
              ))}
                </div>
              </div>
            </div>
          </div>

      {/* Seller Discounts Section */}
      <div className="max-w-5xl mx-auto mt-6 z-10 relative">
        <div
          className="rounded-2xl shadow p-6"
          style={{ backgroundColor: customization.background_color }}
        >
          <div 
            className="w-full rounded-xl border p-4"
            style={{ borderColor: customization.accent_color, backgroundColor: customization.background_color }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-bold" style={{ color: customization.primary_color }}>Seller Discounts</span>
            </div>
            <div className="space-y-2 max-h-48 overflow-auto pr-1">
              {discountCodes && discountCodes.length > 0 ? (
                discountCodes.map((dc) => (
                  <div key={dc.id} className="rounded-lg border px-3 py-2"
                       style={{ borderColor: `${customization.accent_color}55` }}>
                    <div className="text-sm font-semibold" style={{ color: customization.primary_color }}>
                      {dc.code || dc.name || 'DISCOUNT'}
                    </div>
                    <div className="text-xs" style={{ color: customization.text_color }}>
                      {(dc.type === 'percentage' || dc.type === 'percent') ? `${dc.value}% off` : `₱${Number(dc.value).toFixed(2)} off`}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm" style={{ color: customization.text_color }}>No discount codes yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="max-w-5xl mx-auto mt-16 mb-12">
        <div className="text-center mb-8">
          <h2 
            className="text-3xl font-extrabold mb-2"
            style={{ 
              color: customization.primary_color,
              fontFamily: customization.heading_font,
              fontSize: `${customization.heading_size * 1.8}px`
            }}
          >
            Featured Products
          </h2>
          <p 
            className="text-lg"
            style={{ 
              color: customization.text_color,
              fontFamily: customization.body_font,
              fontSize: `${customization.body_size}px`
            }}
          >
            Discover our handpicked favorites
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {mockFeaturedProducts.map((product) => (
            <div
              key={product.id}
              className="rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 relative group cursor-pointer"
              style={{ backgroundColor: customization.background_color }}
            >
              <div className="absolute top-3 right-3 z-10">
                <span 
                  className="font-bold px-2 py-1 rounded-full text-xs shadow"
                  style={{ 
                    backgroundColor: customization.accent_color,
                    color: customization.text_color
                  }}
                >
                  {product.badge}
                </span>
              </div>
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center group-hover:bg-gray-300 transition duration-300">
                  <div className="text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm font-medium">No Image</p>
                  </div>
                </div>
              )}
              <div className="p-4">
                <div 
                  className="text-xs font-bold mb-1 uppercase tracking-wide"
                  style={{ color: customization.primary_color }}
                >
                  {product.category}
                </div>
                <h3 
                  className="font-bold text-lg mb-2 group-hover:transition"
                  style={{ 
                    color: customization.text_color,
                    fontFamily: customization.heading_font,
                    fontSize: `${customization.heading_size}px`
                  }}
                >
                  {product.name}
                </h3>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(Math.floor(product.rating))].map((_, i) => (
                    <span key={i} className="text-yellow-500">★</span>
                  ))}
                  <span className="text-xs ml-1" style={{ color: customization.text_color }}>({product.rating})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span 
                    className="font-bold text-xl"
                    style={{ 
                      color: customization.primary_color,
                      fontSize: `${customization.heading_size * 1.2}px`
                    }}
                  >
                    {product.price}
                  </span>
                  <button 
                    className="font-semibold px-3 py-1 rounded-lg hover:transition text-sm"
                    style={{ 
                      backgroundColor: customization.accent_color,
                      color: customization.text_color
                    }}
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search, Filters, Sort Bar */}
      <div 
        className="max-w-5xl mx-auto mt-8 flex flex-col sm:flex-row items-center gap-4 rounded-xl shadow p-3 sm:p-4"
        style={{ backgroundColor: customization.background_color }}
      >
        <div className="flex-1 flex items-center gap-2">
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
              style={{ 
                borderColor: customization.accent_color,
                backgroundColor: customization.background_color,
                color: customization.text_color
              }}
            />
            <span className="absolute left-2 top-2.5" style={{ color: customization.text_color }}>🔍</span>
            </div>
          <button 
            className="px-4 py-2 rounded-lg font-semibold border transition"
            style={{ 
              backgroundColor: customization.accent_color,
              color: customization.text_color,
              borderColor: customization.accent_color
            }}
          >
            Filters
          </button>
                      </div>
        <select 
          className="px-4 py-2 rounded-lg border font-semibold"
          style={{ 
            borderColor: customization.accent_color,
            backgroundColor: customization.background_color,
            color: customization.text_color
          }}
        >
          <option>All</option>
        </select>
        <div className="font-semibold" style={{ color: customization.text_color }}>
          {products.length} products
                    </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold" style={{ color: customization.text_color }}>Sort:</span>
          <select 
            className="px-2 py-1 rounded-lg border font-semibold"
            style={{ 
              borderColor: customization.accent_color,
              backgroundColor: customization.background_color,
              color: customization.text_color
            }}
          >
            <option>Most Popular</option>
          </select>
          <button 
            className="p-2 rounded-lg border transition"
            style={{ 
              borderColor: customization.accent_color,
              backgroundColor: customization.background_color,
              color: customization.text_color
            }}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="2" fill="currentColor"/>
              <rect x="14" y="3" width="7" height="7" rx="2" fill="currentColor"/>
              <rect x="14" y="14" width="7" height="7" rx="2" fill="currentColor"/>
              <rect x="3" y="14" width="7" height="7" rx="2" fill="currentColor"/>
            </svg>
          </button>
          <button 
            className="p-2 rounded-lg border transition"
            style={{ 
              borderColor: customization.accent_color,
              backgroundColor: customization.background_color,
              color: customization.text_color
            }}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="3" rx="1.5" fill="currentColor"/>
              <rect x="3" y="10.5" width="18" height="3" rx="1.5" fill="currentColor"/>
              <rect x="3" y="18" width="18" height="3" rx="1.5" fill="currentColor"/>
            </svg>
          </button>
                    </div>
                  </div>

      {/* Product Grid */}
      <div 
        className="max-w-5xl mx-auto mt-8 grid gap-6"
        style={{
          gridTemplateColumns: `repeat(${customization.desktop_columns}, 1fr)`
        }}
      >
        {products.length > 0 ? (
          products.map((product) => (
            <div
              key={product.id}
              className="rounded-2xl shadow p-4 flex flex-col relative group transition-transform duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
              style={{ 
                minHeight: 400,
                backgroundColor: customization.background_color
              }}
            >
              {product.isNew && (
                <span 
                  className="absolute top-3 left-3 font-bold px-3 py-1 rounded-full text-xs shadow transition"
                  style={{ 
                    backgroundColor: customization.accent_color,
                    color: customization.text_color
                  }}
                >
                  New
                </span>
              )}
              {product.discount && (
                <span className="absolute top-3 left-3 bg-red-500 text-white font-bold px-2 py-1 rounded-full text-xs shadow group-hover:bg-red-400 transition">-{product.discount}%</span>
              )}
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-xl mb-4 group-hover:brightness-95 group-hover:scale-105 transition duration-300"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded-xl mb-4 flex items-center justify-center group-hover:bg-gray-300 transition duration-300">
                  <div className="text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm font-medium">No Image</p>
                      </div>
                      </div>
              )}
              <div
                className="text-xs font-bold mb-1 uppercase inline-block px-2 py-1 rounded transition"
                style={{ 
                  letterSpacing: 1,
                  color: customization.primary_color,
                  backgroundColor: `${customization.accent_color}20`
                }}
              >
                {product.category}
                    </div>
              <h3 
                className="font-semibold text-lg mb-1 transition"
                style={{ 
                  color: customization.text_color,
                  fontFamily: customization.heading_font,
                  fontSize: `${customization.heading_size}px`
                }}
              >
                {product.name}
              </h3>
              <div className="flex items-center gap-1 mb-2">
                {[...Array(Math.floor(product.rating))].map((_, i) => (
                  <span key={i} className="text-yellow-500 drop-shadow">★</span>
                ))}
                {product.rating % 1 !== 0 && <span className="text-yellow-500 drop-shadow">★</span>}
                <span className="text-xs ml-1" style={{ color: customization.text_color }}>({product.rating})</span>
            </div>
              <div className="flex items-end gap-2 mb-2">
                <span 
                  className="font-bold text-xl transition"
                  style={{ 
                    color: customization.primary_color,
                    fontSize: `${customization.heading_size * 1.2}px`
                  }}
                >
                  {product.price}
                </span>
                {product.oldPrice && <span className="text-gray-400 line-through text-sm">{product.oldPrice}</span>}
              </div>
              <button
                className="mt-auto w-full font-semibold py-2 rounded-lg shadow hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: customization.accent_color,
                  color: customization.text_color,
                  focusRingColor: customization.accent_color
                }}
              >
                View Product
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20">
            <p className="text-lg" style={{ color: customization.text_color }}>
              No products available yet.
            </p>
        </div>
      )}
      </div>

      {/* Workshops & Events Section */}
      <div className="max-w-5xl mx-auto mt-16 mb-12">
        <div className="text-center mb-8">
          <h2 
            className="text-3xl font-extrabold mb-2"
            style={{ 
              color: customization.primary_color,
              fontFamily: customization.heading_font,
              fontSize: `${customization.heading_size * 1.8}px`
            }}
          >
            Workshops & Events
          </h2>
          <p 
            className="text-lg"
            style={{ 
              color: customization.text_color,
              fontFamily: customization.body_font,
              fontSize: `${customization.body_size}px`
            }}
          >
            Learn hands-on crafting skills and join our community events
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {mockWorkshopsAndEvents.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 relative"
              style={{ backgroundColor: customization.background_color }}
            >
              <div className="absolute top-3 right-3 z-10">
                <span className={`font-bold px-2 py-1 rounded-full text-xs shadow ${
                  item.type === 'Workshop' 
                    ? 'bg-blue-200 text-blue-800' 
                    : 'bg-green-200 text-green-800'
                }`}>
                  {item.type}
                </span>
              </div>
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm font-medium">No Image</p>
                  </div>
                </div>
              )}
              <div className="p-6">
                <h3 
                  className="font-bold text-xl mb-2"
                  style={{ 
                    color: customization.text_color,
                    fontFamily: customization.heading_font,
                    fontSize: `${customization.heading_size * 1.1}px`
                  }}
                >
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 text-sm mb-2" style={{ color: customization.text_color }}>
                  <Calendar className="w-4 h-4" />
                  <span>{item.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm mb-2" style={{ color: customization.text_color }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12,6 12,12 16,14"></polyline>
                  </svg>
                  <span>{item.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm mb-4" style={{ color: customization.text_color }}>
                  <Users className="w-4 h-4" />
                  <span>{item.spots}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span 
                    className="font-bold text-xl"
                    style={{ 
                      color: customization.primary_color,
                      fontSize: `${customization.heading_size * 1.2}px`
                    }}
                  >
                    {item.price}
                  </span>
                  <button 
                    className="font-semibold px-4 py-2 rounded-lg hover:transition"
                    style={{ 
                      backgroundColor: customization.accent_color,
                      color: customization.text_color
                    }}
                  >
                    {item.type === 'Workshop' ? 'Book Now' : 'Join Event'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StorefrontCustomizer;
