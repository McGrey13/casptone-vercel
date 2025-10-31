import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  FileText,
  BarChart3,
  Settings,
  MessageSquare,
  Palette,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  DollarSign,
} from "lucide-react";
import AdminNavbar from "./AdminNavbar";
import { cn } from "../lib/utils";
import { Button } from "../ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useUser } from "../Context/UserContext";
import { useNavigate } from "react-router-dom";

// Import Admin Pages
import Dashboard from "./AdminDashboard";
import OrdersOverview from "./OrdersOverview";
import ProductsTable from "./ProductsTable";
import CustomerTable from "./CustomerTable";
import ArtisanTable from "./ArtisanTable";
import AnalyticsDashboard from "./AnalyticsDashboard";
import CommissionDashboard from "./CommissionDashboard";
import AdminSettings from "./AdminSettings";
import AcceptPendingProduct from "./AcceptPendingProduct";
import StoreVerification from "./StoreVerification";
import api from "../../api";
import "./AdminLayout.css";

const SidebarItem = ({ icon, label, tabKey, activeTab, setActiveTab, badge, onItemClick }) => (
  <button
    onClick={() => {
      setActiveTab(tabKey);
      if (onItemClick) onItemClick();
    }}
    className={cn(
      "w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-out relative overflow-hidden admin-sidebar-item",
      activeTab === tabKey
        ? "admin-sidebar-item active text-white"
        : "text-gray-700 hover:text-[#9F2936]"
    )}
  >
    <span className="mr-3 admin-sidebar-icon">{icon}</span>
    <span className="flex-1 text-left">{label}</span>
    {badge && (
      <div className="ml-auto admin-sidebar-badge text-white rounded-full px-2 py-0.5 text-xs font-semibold">
        {badge}
      </div>
    )}
  </button>
);

const SidebarGroup = ({ label, icon, children, isOpen, setIsOpen, onItemClick }) => (
  <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full admin-sidebar-group">
    <CollapsibleTrigger asChild>
      <Button
        variant="ghost"
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#9F2936] hover:bg-[#9F2936]/5 rounded-md transition-all duration-300 ease-out"
      >
        <div className="flex items-center">
          <div className="mr-3 admin-sidebar-icon">{icon}</div>
          <span className="font-semibold">{label}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 admin-sidebar-chevron transition-transform duration-300" />
        ) : (
          <ChevronRight className="h-4 w-4 admin-sidebar-chevron transition-transform duration-300" />
        )}
      </Button>
    </CollapsibleTrigger>
    <CollapsibleContent className="pl-9 pr-2 py-1 space-y-1 admin-sidebar-collapsible">
      {React.Children.map(children, child =>
        React.cloneElement(child, { onItemClick })
      )}
    </CollapsibleContent>
  </Collapsible>
);

const AdminLayout = () => {
  const { user, loading } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [productOpen, setProductOpen] = useState(true);
  const [userOpen, setUserOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({});
  const [sidebarLoading, setSidebarLoading] = useState(true);

  // Check authentication and admin role
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
        return;
      }
      if (user.role !== 'administrator') {
        navigate('/home');
        return;
      }
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setSidebarLoading(true);
        console.log('Fetching verification stats...', { user, token: sessionStorage.getItem('auth_token') });
        
        // Add retry logic for timeout errors
        let retries = 3;
        let lastError;
        
        while (retries > 0) {
          try {
            const response = await api.get('/admin/verification-stats');
            console.log('Verification stats response:', response.data);
            setStats(response.data);
            return; // Success, exit retry loop
          } catch (error) {
            lastError = error;
            console.error(`Error fetching verification stats (${4-retries}/3):`, error);
            
            if (error.code === 'ECONNABORTED' && retries > 1) {
              // Timeout error, wait and retry
              await new Promise(resolve => setTimeout(resolve, 1000));
              retries--;
            } else {
              break; // Other errors, don't retry
            }
          }
        }
        
        // If we get here, all retries failed
        console.error('All retries failed for verification stats:', lastError);
        setStats({
          total_customers: 0,
          total_artisans: 0,
          pending_stores: 0
        });
      } finally {
        setSidebarLoading(false);
      }
    };

    if (user && user.role === 'administrator') {
      fetchStats();
    }
  }, [user]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or not admin (will redirect)
  if (!user || user.role !== 'administrator') {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "products":
        return <ProductsTable />;
      case "addProduct":
        return <div><AcceptPendingProduct /></div>;
      case "customers":
        return <CustomerTable />;
      case "artisans":
        return <ArtisanTable />;
      case "storeVerification":
        return <StoreVerification />;
      case "orders":
        return <OrdersOverview />;
      case "analytics":
        return <AnalyticsDashboard />;
      case "commission":
        return <CommissionDashboard />;
      case "settings":
        return <AdminSettings />;
      default:
        return <div>No matching tab</div>;
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar userName={user?.userName || 'Admin'} />
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Mobile Menu Button */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="admin-sidebar-mobile-toggle"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Sidebar */}
        <div className={cn(
          "w-64 flex flex-col overflow-y-auto transition-transform duration-300 ease-in-out flex-shrink-0 admin-sidebar",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          sidebarLoading ? "admin-sidebar-loading" : ""
        )}>
          <div className="flex-1 py-4 px-3 space-y-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <SidebarItem
                    icon={<LayoutDashboard className="h-5 w-5" />}
                    label="Dashboard"
                    tabKey="dashboard"
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onItemClick={() => setSidebarOpen(false)}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-[#9F2936] text-white">
                <p>View admin dashboard and analytics</p>
              </TooltipContent>
            </Tooltip>

            <SidebarGroup
              label="Products"
              icon={<ShoppingBag className="h-5 w-5" />}
              isOpen={productOpen}
              setIsOpen={setProductOpen}
              onItemClick={() => setSidebarOpen(false)}
            >
              <SidebarItem
                icon={<ShoppingBag className="h-4 w-4" />}
                label="All Products"
                tabKey="products"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                badge={sidebarLoading ? "..." : 124}
              />
              <SidebarItem
                icon={<ShoppingBag className="h-4 w-4" />}
                label="Accept Pending Product"
                tabKey="addProduct"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </SidebarGroup>

            <SidebarGroup
              label="Users"
              icon={<Users className="h-5 w-5" />}
              isOpen={userOpen}
              setIsOpen={setUserOpen}
              onItemClick={() => setSidebarOpen(false)}
            >
              <SidebarItem
                icon={<Users className="h-4 w-4" />}
                label="Customers"
                tabKey="customers"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                badge={stats?.total_customers || 0}
              />
              <SidebarItem
                icon={<Palette className="h-4 w-4" />}
                label="Artisans"
                tabKey="artisans"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                badge={stats?.total_artisans || 0}
              />
              <SidebarItem
                icon={<FileText className="h-4 w-4" />}
                label="Store Verification"
                tabKey="storeVerification"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                badge={stats?.pending_stores || 0}
              />

            </SidebarGroup>

            <SidebarItem
              icon={<FileText className="h-5 w-5" />}
              label="Orders"
                tabKey="orders"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                badge={sidebarLoading ? "..." : 18}
              onItemClick={() => setSidebarOpen(false)}
            />

            <SidebarItem
              icon={<BarChart3 className="h-5 w-5" />}
              label="Analytics"
              tabKey="analytics"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onItemClick={() => setSidebarOpen(false)}
            />

            <SidebarItem
              icon={<DollarSign className="h-5 w-5" />}
              label="Commission Dashboard"
              tabKey="commission"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onItemClick={() => setSidebarOpen(false)}
            />

            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <SidebarItem
                    icon={<Settings className="h-5 w-5" />}
                    label="Settings"
                    tabKey="settings"
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onItemClick={() => setSidebarOpen(false)}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-[#9F2936] text-white">
                <p>Manage admin account settings</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="admin-sidebar-user-info p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-2 font-semibold">Logged in as</p>
              <p className="text-sm font-medium text-[#9F2936]">{user?.userName || 'Admin'}</p>
              <p className="text-xs text-gray-500">{user?.userEmail || 'admin@craftconnect.com'}</p>
            </div>
          </div>
        </div>

        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden admin-sidebar-backdrop"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 overflow-y-auto main-content">
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
    </TooltipProvider>
  );
};

export default AdminLayout;
