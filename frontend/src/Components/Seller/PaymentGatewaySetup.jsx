import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { 
  Wallet, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  Phone,
  Lock,
  X
} from "lucide-react";

const PaymentGatewaySetup = ({ isOpen, onClose, gatewayType }) => {
  const [step, setStep] = useState(1);
  const [credentials, setCredentials] = useState({
    phone: "",
    otp: ""
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionSuccess, setConnectionSuccess] = useState(false);

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setStep(1);
      setCredentials({ phone: "", otp: "" });
      setConnectionSuccess(false);
    }
  }, [isOpen, gatewayType]);

  if (!isOpen) return null;

  const gatewayConfig = {
    gcash: {
      name: "GCash",
      color: "blue",
      bgGradient: "from-blue-500 to-blue-600",
      icon: <Wallet className="h-8 w-8" />
    },
    paymaya: {
      name: "PayMaya",
      color: "green",
      bgGradient: "from-green-500 to-green-600",
      icon: <CreditCard className="h-8 w-8" />
    }
  };

  const config = gatewayConfig[gatewayType] || gatewayConfig.gcash;

  const handleInputChange = (field, value) => {
    setCredentials({ ...credentials, [field]: value });
  };

  const handleLogin = async () => {
    // Validate required fields
    if (!credentials.phone) {
      alert("Mobile number is required to connect your e-wallet account");
      return;
    }

    // Validate Philippine mobile number format
    const phoneRegex = /^(\+63|0)?9\d{9}$/;
    const cleanPhone = credentials.phone.replace(/\s+/g, '');
    
    if (!phoneRegex.test(cleanPhone)) {
      alert("Please enter a valid Philippine mobile number (e.g., 09123456789 or +639123456789)");
      return;
    }
    
    setIsConnecting(true);
    
    // Simulate API call
    setTimeout(() => {
      setStep(2);
      setIsConnecting(false);
    }, 1500);
  };

  const handleVerifyOTP = async () => {
    setIsConnecting(true);
    
    // Simulate OTP verification
    setTimeout(() => {
      if (credentials.otp === "123456" || credentials.otp.length === 6) {
        setConnectionSuccess(true);
        setStep(3);
      } else {
        alert("Invalid OTP. For simulation, use: 123456");
      }
      setIsConnecting(false);
    }, 1500);
  };

  const handleFinish = () => {
    // Save connection status and phone number for this specific gateway
    const connectionKey = `${gatewayType}_connected`;
    const phoneKey = `${gatewayType}_phone`;
    
    localStorage.setItem(connectionKey, "true");
    localStorage.setItem(phoneKey, credentials.phone);
    
    console.log(`✅ Connected ${gatewayType}:`, {
      key: connectionKey,
      phone: credentials.phone,
      stored: localStorage.getItem(connectionKey)
    });
    
    onClose(true); // Pass success status
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className={`bg-gradient-to-r ${config.bgGradient} p-4 sm:p-5 md:p-6 rounded-t-lg sm:rounded-t-2xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-white/20 rounded-full flex items-center justify-center text-white">
                {config.icon}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Connect {config.name}</h2>
                <p className="text-white/80 text-xs sm:text-sm">Simulation Mode</p>
              </div>
            </div>
            <button
              onClick={() => onClose(false)}
              className="text-white hover:bg-white/20 rounded-full p-1.5 sm:p-2 transition-all"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 md:p-6">
          {/* Step 1: Login */}
          {step === 1 && (
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-xs sm:text-sm text-blue-800 font-medium">Connect your {config.name} Account</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Simply enter your mobile number to link your {config.name} account.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center mb-4 sm:mb-6">
                <div className={`h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br ${config.bgGradient} mx-auto flex items-center justify-center text-white mb-3 sm:mb-4`}>
                  <Phone className="h-8 w-8 sm:h-10 sm:w-10" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-[#5c3d28]">Enter Your Mobile Number</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-2">
                  We'll send a verification code to confirm it's you
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="phone" className="text-[#5c3d28] font-medium text-sm sm:text-base">
                    Mobile Number
                  </Label>
                  <div className="relative mt-2">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="09XX XXX XXXX"
                      value={credentials.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="pl-10 pr-3 sm:pr-4 border-2 focus:border-blue-500 text-sm sm:text-base md:text-lg py-3 sm:py-4 md:py-6"
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Enter your Philippine mobile number (e.g., 09123456789)
                  </p>
                </div>
              </div>

              <Button
                onClick={handleLogin}
                disabled={!credentials.phone || isConnecting}
                className={`w-full bg-gradient-to-r ${config.bgGradient} hover:opacity-90 text-white py-3 sm:py-4 md:py-6 text-sm sm:text-base md:text-lg mt-4 sm:mt-6`}
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2" />
                    Sending verification code...
                  </>
                ) : (
                  <>
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Send Verification Code
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-xs sm:text-sm text-yellow-800 font-medium">OTP Verification</p>
                    <p className="text-xs text-yellow-600 mt-1">
                      For simulation, use OTP: <strong>123456</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center mb-4 sm:mb-6">
                <div className={`h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br ${config.bgGradient} mx-auto flex items-center justify-center text-white mb-3`}>
                  <Lock className="h-7 w-7 sm:h-8 sm:w-8" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[#5c3d28]">Verify Your Identity</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Enter the 6-digit code sent to
                </p>
                <p className="text-xs sm:text-sm font-bold text-[#a4785a] mt-1">
                  {credentials.phone}
                </p>
              </div>

              <div>
                <Label htmlFor="otp" className="text-[#5c3d28] font-medium text-sm sm:text-base">
                  OTP Code
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={credentials.otp}
                  onChange={(e) => handleInputChange("otp", e.target.value.replace(/\D/g, ""))}
                  className="text-center text-lg sm:text-xl md:text-2xl tracking-widest font-mono mt-1"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 text-xs sm:text-sm"
                >
                  Back
                </Button>
                <Button
                  onClick={handleVerifyOTP}
                  disabled={credentials.otp.length !== 6 || isConnecting}
                  className={`flex-1 bg-gradient-to-r ${config.bgGradient} hover:opacity-90 text-white text-xs sm:text-sm`}
                >
                  {isConnecting ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2" />
                      Verifying...
                    </>
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && connectionSuccess && (
            <div className="space-y-4 sm:space-y-6 text-center py-4 sm:py-6">
              <div className={`h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br ${config.bgGradient} mx-auto flex items-center justify-center animate-bounce`}>
                <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#5c3d28] mb-2">
                  Successfully Connected!
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Your {config.name} account has been linked to your store
                </p>
              </div>

              <Card className="bg-gradient-to-r from-[#faf9f8] to-white border-[#e5ded7]">
                <CardContent className="p-3 sm:p-4">
                  <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Mobile Number</span>
                      <span className="font-bold text-[#a4785a] text-sm sm:text-base">{credentials.phone}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status</span>
                      <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-blue-800">
                  <strong>Note:</strong> This is a simulated connection. In production, you would integrate with the actual {config.name} API using your merchant credentials.
                </p>
              </div>

              <Button
                onClick={handleFinish}
                className={`w-full bg-gradient-to-r ${config.bgGradient} hover:opacity-90 text-white text-xs sm:text-sm`}
              >
                Finish Setup
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentGatewaySetup;

