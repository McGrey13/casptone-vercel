import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { User, Settings, LogOut, CheckCircle, AlertCircle } from "lucide-react";
import { useUser } from "../Context/UserContext";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import NotificationDropdown from "../ui/NotificationDropdown";
import { useToast } from "../Context/ToastContext";
import "./AdminNavbar.css";

const AdminNavbar = ({
  userName = "Admin",
}) => {
  const { logout, user } = useUser();
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (toast.show) {
      setIsVisible(true);
    } else {
      // Delay hiding for smooth animation
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);
  
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

  return (
    <nav className="w-full h-16 px-4 fixed top-0 left-0 right-0 z-[9999] shadow-sm admin-navbar mb-2">
      <div className="h-full flex items-center justify-between max-w-full gap-4">
        {/* Logo */}
        <Link to="/admin" className="flex items-center flex-shrink-0 group admin-navbar-logo">
          <div className="font-bold text-xl flex items-center transition-all duration-200 group-hover:scale-105">
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6 mr-2 text-[#9F2936] transition-colors duration-200 group-hover:text-[#7D1E2A]"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-[#9F2936] transition-colors duration-200 group-hover:text-[#7D1E2A]">
              CraftConnect
            </span>
            <span className="text-sm font-normal ml-2 px-2 py-1 bg-[#9F2936] text-white rounded-full transition-all duration-200 group-hover:bg-[#7D1E2A]">
              Admin
            </span>
          </div>
        </Link>

        {/* Right Side */}
        <div className="flex items-center space-x-1 flex-shrink-0 navbar-right">
          {/* Notifications */}
          <NotificationDropdown />

          {/* Settings */}
          <Link to="/admin/settings" className="group">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-full hover:bg-[#9F2936]/10 transition-all duration-200 hover:scale-105 admin-navbar-button"
            >
              <Settings className="h-4 w-4 text-gray-600 group-hover:text-[#9F2936] transition-colors duration-200" />
            </Button>
          </Link>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full hover:bg-[#9F2936]/10 transition-all duration-200 hover:scale-105 group admin-navbar-button"
              >
                <User className="h-4 w-4 text-gray-600 group-hover:text-[#9F2936] transition-colors duration-200" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-56 admin-navbar-dropdown"
            >
              <DropdownMenuLabel className="text-[#9F2936] font-semibold">
                Hi, {userName}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-100" />
              <DropdownMenuItem asChild className="admin-navbar-dropdown-item">
                <Link to="/admin/settings" className="w-full cursor-pointer flex items-center relative z-10">
                  <Settings className="h-4 w-4 mr-2 text-gray-600" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-100" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer admin-navbar-logout-item relative z-10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="text-red-600 hover:text-red-700">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Toast Notification at bottom of navbar */}
      {isVisible && (
        <div
          className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-[10000] transition-all duration-300 ${
            toast.show ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
          }`}
        >
          <div className={`${
            toast.type === 'success' 
              ? 'bg-gradient-to-r from-green-500 to-green-600 border-green-600' 
              : toast.type === 'error'
              ? 'bg-gradient-to-r from-red-500 to-red-600 border-red-600'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 border-blue-600'
          } text-white px-6 py-4 rounded-lg shadow-2xl border-2 flex items-center gap-4 min-w-[400px] max-w-[600px]`}>
            {toast.type === 'success' ? (
              <CheckCircle className="h-6 w-6 flex-shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="h-6 w-6 flex-shrink-0" />
            ) : (
              <CheckCircle className="h-6 w-6 flex-shrink-0" />
            )}
            <span className="flex-1 font-semibold text-base">{toast.message}</span>
          </div>
        </div>
      )}
    </nav>
  );
};

export default AdminNavbar;
