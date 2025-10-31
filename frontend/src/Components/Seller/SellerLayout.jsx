import React, { useState, useEffect } from "react";
import "./SellerLayout.css";
import api from "../../api";
import {
  LayoutDashboard,
  ShoppingBag,
  Megaphone,
  Calendar,
  Share2,
  Palette,
  Settings,
  User,
  Bell,
  LogOut,
  UserCircle,
  MessageCircle,
  Menu,
  X,
} from "lucide-react";
import ChatBox from '../Chat/ChatBox';
import { useUser } from "../Context/UserContext";
import LoadingSpinner from "../ui/LoadingSpinner";
import ConversationList from '../Chat/ConversationList';

import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import Dashboard from "../Seller/SellerDashboard";
import StorefrontCustomizer from "../Seller/StorefrontCustomizer";
import Payment from "./Payment";
import OrderInventoryManager from "./OrderInventoryManager";
import MarketingTools from "./MarketingTools";
import SocialMedia from "./SocialMedia";
import WorkshopsEvents from "./WorkshopsEvents";
import SellerSettings from "./SellerSettings";
// import ProfilePage from "./ProfilePage";
import InventoryManager from "./InventoryManager";
import { Wallet, Package } from "lucide-react";

const sidebarItems = [
  { key: "storefront", label: "Storefront Customizer", icon: <Palette className="h-5 w-5" /> },
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  // { key: "profile", label: "My Profile", icon: <UserCircle className="h-5 w-5" /> },
  { key: "payments", label: "Payments", icon: <Wallet className="h-5 w-5" /> },
  { key: "orders", label: "Orders & Shipping", icon: <ShoppingBag className="h-5 w-5" /> },
  { key: "inventory", label: "Inventory", icon: <Package className="h-5 w-5" /> },
  { key: "marketing", label: "Marketing Tools", icon: <Megaphone className="h-5 w-5" /> },
  { key: "workshops", label: "Workshops & Events", icon: <Calendar className="h-5 w-5" /> },
  { key: "social", label: "Social Media", icon: <Share2 className="h-5 w-5" /> },
  { key: "settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
];

const SellerLayout = () => {
  const [activeTab, setActiveTab] = useState("storefront");
  const userName = "Seller User";
  const notificationCount = 3;

  // Mobile navigation states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Chat states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isVerifying, setIsVerifying] = useState(true);

  const { logout, isAuthenticated } = useUser();
  
  // Close sidebar on mobile when navigating
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Close sidebar on mobile after clicking a menu item
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };
  
  // Toggle profile dropdown
  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileDropdownOpen && !event.target.closest('.profile-dropdown')) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);
  
  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/login";
    } catch (error) {
      console.error("Error during logout:", error);
      // Still redirect even if logout fails
      window.location.href = "/login";
    }
  };

  // Effect to get current user info and check for store
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // Wait for authentication to be ready
        if (!isAuthenticated) {
          console.log('Waiting for authentication...');
          setIsVerifying(true);
          return;
        }

        console.log('✅ User authenticated, fetching seller profile...');

        // Use the api instance which handles cookies automatically
        const response = await api.get('/sellers/profile');
        
        if (response.data) {
          const sellerData = response.data;
          setCurrentUser({
            userID: sellerData.userID,
            userName: sellerData.userName,
            sellerId: sellerData.sellerID,
            role: 'seller'
          });

          // Check if seller has a store, if not redirect to create store
          if (!sellerData.store) {
            console.log('No store found, redirecting to create store');
            window.location.href = '/create-store';
          } else {
            // Check store status
            const storeStatus = sellerData.store.status;
            if (storeStatus === 'pending') {
              // Store is pending verification, redirect to verification pending page
              console.log('Store pending verification');
              window.location.href = '/verification-pending';
            } else if (storeStatus === 'rejected') {
              // Store was rejected, redirect to create store to resubmit
              console.log('Store rejected, redirecting to create store');
              window.location.href = '/create-store';
            }
            // If status is 'approved', continue with normal seller layout
          }
        }
        
        setIsVerifying(false);
      } catch (error) {
        console.error('Error fetching current user:', error);
        
        // If 401 error, redirect to login
        if (error.response?.status === 401) {
          console.log('Authentication failed, redirecting to login');
          window.location.href = '/login';
        } else {
          // Other errors, continue anyway
          console.log('Error but continuing:', error.message);
          setIsVerifying(false);
        }
      }
    };

    // Only fetch when authenticated
    if (isAuthenticated) {
      fetchCurrentUser();
    } else if (isAuthenticated === false) {
      // Explicitly not authenticated
      console.log('Not authenticated, redirecting to login');
      window.location.href = '/login';
    }
  }, [isAuthenticated]);

  const handleSelectConversation = (conversation) => {
    setCurrentConversation(conversation);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "storefront":
        return <StorefrontCustomizer />;
      case "dashboard":
        return <Dashboard />;
      case "profile":
        return <ProfilePage />;
      case "payments":
        return <Payment />;
      case "orders":
        return <OrderInventoryManager />;
      case "inventory":
        return <InventoryManager />;
      case "marketing":
        return <MarketingTools />;
      case "workshops":
        return <WorkshopsEvents />;
      case "social":
        return <SocialMedia />;
      case "settings":
        return <SellerSettings />;
      default:
        return <div>No matching component for: {activeTab}</div>;
    }
  };

  // Show loading while verifying authentication
  if (isVerifying) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#faf9f8]">
        <LoadingSpinner message="Loading seller dashboard..." />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#faf9f8]">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 w-full h-16 bg-gradient-to-r from-white to-[#faf9f8] shadow-lg border-b border-[#e5ded7] px-3 sm:px-4 flex items-center justify-between z-50 backdrop-blur-sm">
        {/* Left: Logo and Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hamburger Menu - Mobile Only */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-[#a4785a]/10 transition-all duration-200"
          >
            {isSidebarOpen ? (
              <X className="h-6 w-6 text-[#5c3d28]" />
            ) : (
              <Menu className="h-6 w-6 text-[#5c3d28]" />
            )}
          </button>
          
          <div className="font-bold text-lg sm:text-xl text-[#5c3d28] flex items-center transition-all hover:opacity-90 cursor-pointer group">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] rounded-lg sm:rounded-xl mr-2 sm:mr-3 shadow-md group-hover:shadow-lg transition-all duration-200">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="tracking-wide text-[#5c3d28] hidden sm:inline">CraftConnect</span>
            <span className="text-xs sm:text-sm font-medium ml-2 sm:ml-3 text-white bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] px-2 sm:px-3 py-1 rounded-full shadow-md">Seller</span>
          </div>
        </div>

        {/* Right: Profile, Settings, and Notifications */}
        <div className="flex items-center space-x-1">
          {/* Notification Button - Always Visible */}
          <button 
            className="relative p-1.5 sm:p-2 rounded-lg hover:bg-[#a4785a]/10 transition-all duration-200"
            title="Notifications"
          >
            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg">
              <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
            </div>
            {notificationCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-0.5 -right-0.5 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 text-[10px] sm:text-xs bg-gradient-to-r from-red-500 to-red-600 border-2 border-white shadow-md"
              >
                {notificationCount}
              </Badge>
            )}
          </button>

          {/* Settings Button - Always Visible */}
          <button
            onClick={() => handleTabChange("settings")}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-[#a4785a]/10 transition-all duration-200"
            title="Settings"
          >
            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg">
              <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
            </div>
          </button>

          {/* Profile Button - Desktop Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1.5 sm:p-2 rounded-lg hover:bg-[#a4785a]/10 transition-all duration-200"
                title="Profile"
              >
                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-full">
                  <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white border-2 border-[#e5ded7] rounded-xl shadow-xl">
              <DropdownMenuLabel className="p-3 bg-gradient-to-r from-[#faf9f8] to-white border-b border-[#e5ded7]">
                <div className="flex items-center">
                  <div className="p-1.5 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg mr-3">
                    <UserCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-[#5c3d28] font-medium text-sm">Hi, {userName}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => handleTabChange("profile")}
                className="flex items-center px-3 py-2 text-sm text-[#5c3d28] hover:bg-gradient-to-r hover:from-[#a4785a]/10 hover:to-[#7b5a3b]/10 transition-all duration-200 cursor-pointer"
              >
                <UserCircle className="h-4 w-4 mr-2 text-[#a4785a]" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleTabChange("settings")}
                className="flex items-center px-3 py-2 text-sm text-[#5c3d28] hover:bg-gradient-to-r hover:from-[#a4785a]/10 hover:to-[#7b5a3b]/10 transition-all duration-200 cursor-pointer"
              >
                <Settings className="h-4 w-4 mr-2 text-[#a4785a]" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="border-[#e5ded7]" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-700 transition-all duration-200 cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile Button - Mobile (for backward compatibility) */}
          <button
            onClick={toggleProfileDropdown}
            className="lg:hidden p-1.5 sm:p-2 rounded-lg hover:bg-[#a4785a]/10 transition-all duration-200"
            title="Profile"
          >
            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-full">
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
            </div>
          </button>
        </div>
        
        {/* Mobile Profile Dropdown */}
        {isProfileDropdownOpen && (
          <div className="lg:hidden fixed top-16 right-3 w-56 bg-white border-2 border-[#e5ded7] rounded-xl shadow-xl z-50">
            <div className="p-3 bg-gradient-to-r from-[#faf9f8] to-white border-b border-[#e5ded7]">
              <div className="flex items-center">
                <div className="p-1.5 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg mr-3">
                  <UserCircle className="h-4 w-4 text-white" />
                </div>
                <span className="text-[#5c3d28] font-medium text-sm">Hi, {userName}</span>
              </div>
            </div>
            <div className="p-2">
              <button
                onClick={() => {
                  handleTabChange("profile");
                  setIsProfileDropdownOpen(false);
                }}
                className="w-full flex items-center px-3 py-2 rounded-lg text-sm text-[#5c3d28] hover:bg-gradient-to-r hover:from-[#a4785a]/10 hover:to-[#7b5a3b]/10 transition-all duration-200"
              >
                <UserCircle className="h-4 w-4 mr-2 text-[#a4785a]" />
                Profile
              </button>
              <button
                onClick={() => {
                  handleTabChange("settings");
                  setIsProfileDropdownOpen(false);
                }}
                className="w-full flex items-center px-3 py-2 rounded-lg text-sm text-[#5c3d28] hover:bg-gradient-to-r hover:from-[#a4785a]/10 hover:to-[#7b5a3b]/10 transition-all duration-200"
              >
                <Settings className="h-4 w-4 mr-2 text-[
                ]" />
                Settings
              </button>
              <div className="border-t border-[#e5ded7] my-2"></div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-700 transition-all duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Sidebar */}
      <div className="flex pt-16">
        {/* Mobile Overlay */}
        <div 
          className={`
            lg:hidden fixed inset-0 bg-black/50 
            transition-opacity duration-300 ease-in-out
            ${isSidebarOpen ? 'opacity-100 z-40' : 'opacity-0 -z-10'}
            top-16
          `}
          onClick={() => setIsSidebarOpen(false)}
        ></div>
        
        {/* Sidebar */}
        <div className={`
          fixed top-16 left-0 
          w-[85vw] sm:w-72 md:w-64 
          bg-gradient-to-b from-white to-[#faf9f8] 
          shadow-xl border-r border-[#e5ded7] 
          h-[calc(100vh-4rem)] 
          overflow-y-auto 
          z-50
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          lg:z-40
        `}>
          <div className="p-3 sm:p-4 md:p-6">
            <div className="text-xs font-bold text-[#7b5a3b] uppercase tracking-wider mb-3 sm:mb-4 flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-full mr-2"></div>
              Navigation Menu
            </div>
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleTabChange(item.key)}
                  className={`
                    w-full flex items-center 
                    px-3 py-2.5 
                    sm:px-4 sm:py-3 
                    rounded-lg sm:rounded-xl 
                    text-xs sm:text-sm 
                    font-medium 
                    transition-all duration-300 
                    group relative 
                    ${activeTab === item.key
                      ? "bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white shadow-md"
                      : `${['inventory','orders','payments'].includes(item.key) ? '!bg-[#7b5a3b] !text-white' : 'bg-white text-[#5c3d28]'} hover:bg-gradient-to-r hover:from-[#a4785a]/10 hover:to-[#7b5a3b]/10 hover:text-[#a4785a] hover:shadow-md`
                    }
                  `}
                >
                  <span className={`
                    mr-2 sm:mr-3 
                    transition-all duration-300 
                    ${activeTab === item.key 
                      ? "text-white" 
                      : `${['inventory','orders','payments'].includes(item.key) ? '!text-white' : 'text-[#5c3d28]'} group-hover:text-[#a4785a] group-hover:scale-110 group-hover:rotate-3`
                    }
                  `}>
                    {item.icon}
                  </span>
                  <span className="flex-1 text-left truncate">{item.label}</span>
                  {activeTab === item.key && (
                    <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-white ml-2 shadow-sm flex-shrink-0"></div>
                  )}
                  {activeTab !== item.key && (
                    <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="w-1 h-1 rounded-full bg-[#a4785a]"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className={`
          flex-1 min-h-[calc(100vh-4rem)] 
          transition-all duration-300
          ${isSidebarOpen ? 'opacity-50 lg:opacity-100' : 'opacity-100'}
          lg:ml-64
          p-2 sm:p-3 md:p-4 lg:p-6
          bg-gradient-to-br from-[#faf9f8] to-white
          overflow-x-hidden
        `}>
          <div className="
            bg-white rounded-lg sm:rounded-xl lg:rounded-2xl 
            shadow-lg hover:shadow-xl transition-shadow duration-300
            border border-[#e5ded7] 
            p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8 
            min-h-[calc(100vh-6rem)]
            overflow-x-hidden
          ">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Floating Chat Button */}
      {!isChatOpen && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            console.log('Opening chat...');
            setIsChatOpen(true);
          }}
          className="
            fixed bottom-4 sm:bottom-6 right-4 sm:right-6 
            bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] 
            text-white 
            p-3 sm:p-4 
            rounded-full 
            shadow-xl 
            transition-all duration-300 
            hover:scale-110 
            hover:shadow-2xl 
            focus:outline-none 
            focus:ring-4 
            focus:ring-[#a4785a]/30 
            group 
            border-2 border-white
            z-40
          "
        >
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-pulse"></div>
        </button>
      )}

      {/* Chat Popup */}
      {isChatOpen && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="
          fixed 
          top-0 left-0 right-0 bottom-0 sm:top-auto sm:left-auto sm:right-6 sm:bottom-20
          sm:w-[450px] md:w-[550px] lg:w-[650px] 
          sm:h-[500px]
          bg-white 
          sm:rounded-2xl 
          shadow-2xl 
          border-0 sm:border-2 border-[#e5ded7] 
          overflow-hidden 
          transition-all duration-300 
          flex 
          flex-col
          z-50
        ">
          <div className="flex flex-1 overflow-hidden">
            <ConversationList 
              onSelectConversation={handleSelectConversation}
              currentConversationId={currentConversation?.conversation_id}
            />
            <div className="flex-1 flex flex-col border-l border-gray-200">
            <div className="flex justify-between items-center bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white px-3 sm:px-6 py-3 sm:py-4">
              <h3 className="font-semibold flex items-center text-sm sm:text-base lg:text-lg">
                <div className="p-1 sm:p-1.5 bg-white/20 rounded-lg mr-2 sm:mr-3">
                  <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <span className="truncate">
                  {currentConversation ? `Chat with ${currentConversation.sender?.userName || 'Customer'}` : 'Select a conversation'}
                </span>
              </h3>
              <button 
                onClick={() => setIsChatOpen(false)} 
                className="transition-all duration-200 focus:outline-none"
                title="Close"
              >
                <div className="rounded-full p-1.5 sm:p-2 transition-all duration-200 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:opacity-90 shadow ring-2 ring-white/70">
                  <X className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
              </button>
            </div>
            {currentConversation ? (
              <div className="flex-1 overflow-hidden">
                <ChatBox 
                  conversationId={currentConversation.conversation_id} 
                  user={currentUser}
                  customer={currentConversation.sender}
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[#faf9f8] to-white p-4">
                <div className="text-center">
                  <div className="p-3 sm:p-4 bg-gradient-to-r from-[#a4785a]/10 to-[#7b5a3b]/10 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-[#a4785a]" />
                  </div>
                  <p className="text-[#5c3d28] font-medium text-sm sm:text-base">Select a conversation to start chatting</p>
                  <p className="text-[#7b5a3b] text-xs sm:text-sm mt-1">Connect with your customers</p>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerLayout;
