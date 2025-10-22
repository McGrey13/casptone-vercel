import React, { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Separator } from "../ui/separator";
import { Alert, AlertDescription } from "../ui/alert";
import PaymentGatewaySetup from "./PaymentGatewaySetup";
import {
  CreditCard,
  Wallet,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Building2,
  Percent,
  RefreshCw,
  Shield,
} from "lucide-react";

const PaymentMethodCard = ({ title, description, icon, isConnected = false, connectedPhone = null, onConnect }) => (
  <Card className="p-3 sm:p-4 md:p-5 border-2 border-[#e5ded7] hover:border-[#a4785a] hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-white to-[#faf9f8]">
    <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-[#a4785a] to-[#7b5a3b] flex items-center justify-center shadow-lg flex-shrink-0">
        <div className="text-white">{icon}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="font-semibold text-[#5c3d28] text-sm sm:text-base md:text-lg">{title}</h3>
          {isConnected && (
            <span className="flex items-center text-xs sm:text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full whitespace-nowrap">
              <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Connected
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-[#7b5a3b] mt-1">{description}</p>
        {isConnected && connectedPhone && (
          <p className="text-xs text-[#a4785a] font-medium mt-2 break-all">
            📱 {connectedPhone}
          </p>
        )}
        <Button
          variant={isConnected ? "outline" : "default"}
          size="sm"
          className={`mt-3 text-xs sm:text-sm ${
            isConnected 
              ? "border-2 border-[#d5bfae] text-[#5c3d28] hover:bg-[#f8f1ec] hover:border-[#a4785a] transition-all duration-200"
              : "bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] hover:from-[#8f674a] hover:to-[#6a4c34] text-white shadow-md hover:shadow-lg transition-all duration-200"
          }`}
          onClick={onConnect}
        >
          {isConnected ? "Manage" : "Connect"}
        </Button>
      </div>
    </div>
  </Card>
);

const PaymentSettings = () => {
  const [paymentMethods, setPaymentMethods] = useState({
    gcash: false,
    paymaya: false,
  });

  const [connectedPhones, setConnectedPhones] = useState({
    gcash: null,
    paymaya: null,
  });

  const [payoutSettings, setPayoutSettings] = useState({
    method: "bankAccount",
    frequency: "monthly",
    minimumAmount: "100",
  });

  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState(null);

  useEffect(() => {
    // Check connected status and phone numbers from localStorage
    const gcashConnected = localStorage.getItem("gcash_connected") === "true";
    const paymayaConnected = localStorage.getItem("paymaya_connected") === "true";
    const gcashPhone = localStorage.getItem("gcash_phone");
    const paymayaPhone = localStorage.getItem("paymaya_phone");
    
    console.log("🔍 Loading payment connections:", {
      gcash: { connected: gcashConnected, phone: gcashPhone },
      paymaya: { connected: paymayaConnected, phone: paymayaPhone }
    });
    
    setPaymentMethods({
      gcash: gcashConnected,
      paymaya: paymayaConnected
    });

    setConnectedPhones({
      gcash: gcashPhone,
      paymaya: paymayaPhone
    });
  }, []);

  const handlePaymentMethodToggle = (method) => {
    setPaymentMethods({ ...paymentMethods, [method]: !paymentMethods[method] });
  };

  const handlePayoutSettingChange = (setting, value) => {
    setPayoutSettings({ ...payoutSettings, [setting]: value });
  };

  const handleConnectGateway = (gateway) => {
    console.log(`🔗 Opening connection modal for: ${gateway}`);
    setSelectedGateway(gateway);
    setIsSetupModalOpen(true);
  };

  const handleSetupComplete = (success) => {
    if (success && selectedGateway) {
      // Only update the specific gateway that was just connected
      const isConnected = localStorage.getItem(`${selectedGateway}_connected`) === "true";
      const phoneNumber = localStorage.getItem(`${selectedGateway}_phone`);
      
      console.log(`✅ Updating ${selectedGateway} connection:`, {
        connected: isConnected,
        phone: phoneNumber
      });
      
      setPaymentMethods(prev => ({
        ...prev,
        [selectedGateway]: isConnected
      }));

      setConnectedPhones(prev => ({
        ...prev,
        [selectedGateway]: phoneNumber
      }));
    }
    setIsSetupModalOpen(false);
    setSelectedGateway(null);
  };

  const handleDisconnectGateway = (gateway) => {
    console.log(`🔌 Disconnecting ${gateway}`);
    
    localStorage.removeItem(`${gateway}_connected`);
    localStorage.removeItem(`${gateway}_phone`);
    
    setPaymentMethods(prev => ({
      ...prev,
      [gateway]: false
    }));
    
    setConnectedPhones(prev => ({
      ...prev,
      [gateway]: null
    }));
    
    console.log(`✅ ${gateway} disconnected. Remaining connections:`, {
      gcash: localStorage.getItem("gcash_connected"),
      paymaya: localStorage.getItem("paymaya_connected")
    });
    
    alert(`${gateway === "gcash" ? "GCash" : "PayMaya"} has been disconnected`);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center">
          <Wallet className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 mr-2 sm:mr-3" />
          E-payment Settings
        </h1>
        <p className="text-white/90 mt-2 text-sm sm:text-base md:text-lg">
          Connect your e-wallet accounts to accept GCash and PayMaya payments
        </p>
      </div>

      <Tabs defaultValue="methods">
        <TabsList className="grid w-full grid-cols-1 bg-[#faf9f8] border-2 border-[#e5ded7] p-1 rounded-lg sm:rounded-xl shadow-md text-xs sm:text-sm">
          <TabsTrigger 
            value="methods"
            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#a4785a] data-[state=active]:to-[#7b5a3b] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 font-medium"
          >
            <Wallet className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            E-wallet Accounts
          </TabsTrigger>
          {/* <TabsTrigger value="payouts">
            <Building2 className="h-4 w-4 mr-2" />
            Payout Settings
          </TabsTrigger>
          <TabsTrigger value="fees">
            <Percent className="h-4 w-4 mr-2" />
            Fees & Taxes
          </TabsTrigger> */}
        </TabsList>

        {/* E-wallet Accounts */}
        <TabsContent value="methods" className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
          <div className="grid gap-3 sm:gap-4">
            <PaymentMethodCard
              title="GCash"
              description="Accept GCash e-wallet payments from Filipino customers"
              icon={<Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />}
              isConnected={paymentMethods.gcash}
              connectedPhone={connectedPhones.gcash}
              onConnect={() => paymentMethods.gcash ? handleDisconnectGateway("gcash") : handleConnectGateway("gcash")}
            />

            <PaymentMethodCard
              title="PayMaya"
              description="Accept PayMaya e-wallet payments from Filipino customers"
              icon={<CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />}
              isConnected={paymentMethods.paymaya}
              connectedPhone={connectedPhones.paymaya}
              onConnect={() => paymentMethods.paymaya ? handleDisconnectGateway("paymaya") : handleConnectGateway("paymaya")}
            />  
          </div>

          <Alert className="bg-blue-50 border-blue-200 p-3 sm:p-4">
            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
            <AlertDescription className="text-blue-600 text-xs sm:text-sm">
              Connect both GCash and PayMaya to maximize payment convenience for your customers and increase sales by up to 40%.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Payout Settings
        <TabsContent value="payouts" className="space-y-4 pt-4">
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Payout Method</h3>
              <RadioGroup
                value={payoutSettings.method}
                onValueChange={(value) => handlePayoutSettingChange("method", value)}
                className="space-y-3"
              >
                {[
                  {
                    value: "bankAccount",
                    label: "Bank Account (ACH)",
                    desc: "Direct deposit to your bank account (2-3 business days)",
                  },
                  {
                    value: "paypal",
                    label: "PayPal",
                    desc: "Instant transfer to your PayPal account (fees may apply)",
                  },
                  {
                    value: "check",
                    label: "Check by Mail",
                    desc: "Physical check sent to your address (7-10 business days)",
                  },
                ].map((option) => (
                  <div className="flex items-start space-x-2" key={option.value}>
                    <RadioGroupItem value={option.value} id={option.value} />
                    <div className="grid gap-1.5">
                      <Label htmlFor={option.value} className="font-medium cursor-pointer">
                        {option.label}
                      </Label>
                      <p className="text-sm text-gray-500">{option.desc}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-4">Payout Schedule</h3>
              <RadioGroup
                value={payoutSettings.frequency}
                onValueChange={(value) => handlePayoutSettingChange("frequency", value)}
                className="space-y-3"
              >
                {[
                  {
                    value: "daily",
                    label: "Daily",
                    desc: "Receive payouts every day (minimum balance required)",
                  },
                  {
                    value: "weekly",
                    label: "Weekly",
                    desc: "Receive payouts every Monday",
                  },
                  {
                    value: "monthly",
                    label: "Monthly",
                    desc: "Receive payouts on the 1st of each month",
                  },
                ].map((option) => (
                  <div className="flex items-start space-x-2" key={option.value}>
                    <RadioGroupItem value={option.value} id={option.value} />
                    <div className="grid gap-1.5">
                      <Label htmlFor={option.value} className="font-medium cursor-pointer">
                        {option.label}
                      </Label>
                      <p className="text-sm text-gray-500">{option.desc}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-4">Minimum Payout Amount</h3>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-gray-400" />
                <Input
                  type="number"
                  value={payoutSettings.minimumAmount}
                  onChange={(e) => handlePayoutSettingChange("minimumAmount", e.target.value)}
                  className="w-32"
                />
                <span className="text-sm text-gray-500">Minimum balance required for payout</span>
              </div>
            </div>

            <div className="pt-4">
              <Button>
                <RefreshCw className="h-4 w-4 mr-2" />
                Update Payout Settings
              </Button>
            </div>
          </Card>
        </TabsContent> */}

        {/* Fees & Taxes */}
        <TabsContent value="fees" className="space-y-4 pt-4">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Platform Fees</h3>
            <div className="space-y-4">
              {[
                {
                  title: "Transaction Fee",
                  desc: "Fee charged on each sale",
                  value: "3.5% + $0.30",
                },
                {
                  title: "Subscription Fee",
                  desc: "Monthly fee for your seller account",
                  value: "$15.00/month",
                },
                {
                  title: "Promotional Discount",
                  desc: "Current promotion applied to your account",
                  value: "-$5.00/month",
                  highlight: true,
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex justify-between items-center pb-2 border-b border-gray-100"
                >
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                  <p className={`font-medium ${item.highlight ? "text-green-600" : ""}`}>
                    {item.value}
                  </p>
                </div>
              ))}

              <div className="flex justify-between items-center pt-2">
                <p className="font-medium">Total Monthly Fee</p>
                <p className="font-bold">$10.00/month</p>
              </div>
            </div>

            <Separator className="my-6" />

            <h3 className="text-lg font-medium mb-4">Tax Information</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="collectTax">Collect Sales Tax</Label>
                <Switch id="collectTax" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="automaticTax">Automatic Tax Calculation</Label>
                <Switch id="automaticTax" defaultChecked />
              </div>

              <div className="pt-2">
                <Button variant="outline" className="w-full">
                  <Shield className="h-4 w-4 mr-2" />
                  Update Tax Settings
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Gateway Setup Modal */}
      <PaymentGatewaySetup
        isOpen={isSetupModalOpen}
        onClose={handleSetupComplete}
        gatewayType={selectedGateway}
      />
    </div>
  );
};

export default PaymentSettings;
