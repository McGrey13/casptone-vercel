import React from "react";
import { InventoryTab } from "./OrderInventoryManager";
import { Package } from "lucide-react";

const InventoryManager = () => {
  return (
    <div className="space-y-3 sm:space-y-4 max-w-[405px] mx-auto sm:max-w-none px-2 sm:px-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg sm:rounded-xl shadow-xl p-3 sm:p-4 md:p-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="p-2 sm:p-3 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm">
            <Package className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Inventory Manager</h1>
            <p className="text-white/90 mt-1 text-xs sm:text-sm md:text-base">Manage your product inventory and stock levels</p>
          </div>
        </div>
      </div>

      {/* Inventory Content */}
      <InventoryTab />
    </div>
  );
};

export default InventoryManager;

