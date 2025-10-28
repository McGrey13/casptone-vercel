import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Wallet, FileText } from "lucide-react";
import PaymentTracking from "./PaymentTracking";
import EReceiptWaybill from "./EReceiptWaybill";

const Payment = () => {
  const [activeTab, setActiveTab] = useState("tracking");

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg sm:rounded-xl shadow-xl p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-3 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm">
            <Wallet className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Payments</h1>
            <p className="text-white/90 mt-1 text-sm sm:text-base">
              Manage payment tracking and generate receipts & waybills
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-[#f8f1ec] border border-[#e5ded7] h-12">
          <TabsTrigger 
            value="tracking" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#a4785a] data-[state=active]:to-[#7b5a3b] data-[state=active]:text-white py-3 text-sm font-medium flex items-center gap-2"
          >
            <Wallet className="h-4 w-4" />
            Payment Tracking
          </TabsTrigger>
          <TabsTrigger 
            value="receipts" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#a4785a] data-[state=active]:to-[#7b5a3b] data-[state=active]:text-white py-3 text-sm font-medium flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            E-Receipts & Waybills
          </TabsTrigger>
        </TabsList>

        {/* Payment Tracking Tab */}
        <TabsContent value="tracking" className="mt-6">
          <PaymentTracking />
        </TabsContent>

        {/* E-Receipts & Waybills Tab */}
        <TabsContent value="receipts" className="mt-6">
          <EReceiptWaybill />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Payment;
