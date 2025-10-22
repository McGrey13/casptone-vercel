import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { MapPin } from "lucide-react";
import api from "../../api";

const OwnerInfo = ({ onNext, onBack, ownerData, setOwnerData }) => {
  console.log("🎬 OwnerInfo rendered with ownerData:", ownerData);
  console.log("🎬 setOwnerData type:", typeof setOwnerData);
  
  const [errors, setErrors] = useState({});
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // Local state for location fields since parent doesn't include them
  const [localLocationData, setLocalLocationData] = useState({
    userCity: "",
    userProvince: "",
    userRegion: "CALABARZON"
  });

  // Fixed region and province for sellers
  const fixedRegion = "CALABARZON";
  const fixedProvince = "Laguna";
  
  // Cities in Laguna
  const lagunaCities = [
    "Alaminos", "Bay", "Biñan", "Cabuyao", "Calamba", "Calauan",
    "Cavinti", "Famy", "Kalayaan", "Liliw", "Los Baños", "Luisiana",
    "Lumban", "Mabitac", "Magdalena", "Majayjay", "Nagcarlan",
    "Paete", "Pagsanjan", "Pakil", "Pangil", "Pila", "Rizal",
    "San Pablo", "San Pedro", "Santa Cruz", "Santa Maria",
    "Santa Rosa", "Siniloan", "Victoria"
  ];

  // Debug effect to track ownerData changes
  useEffect(() => {
    console.log("🔄 ownerData changed:", ownerData);
    console.log("🔄 fullName:", ownerData.fullName);
    console.log("🔄 email:", ownerData.email);
    console.log("🔄 phone:", ownerData.phone);
    console.log("🔄 userCity:", ownerData.userCity);
    console.log("🔄 userProvince:", ownerData.userProvince);
  }, [ownerData]);

  // Fetch user data on component mount - SIMPLE VERSION
  useEffect(() => {
    const fetchUserData = async () => {
      if (isDataLoaded) {
        console.log("📊 Data already loaded, skipping fetch");
        return;
      }
      
      try {
        console.log("🔍 Fetching user data...");
        const response = await api.get('/profile');
        console.log("📋 API Response:", response.data);
        
        const userData = response.data;
        console.log("👤 userName from API:", userData.userName);
        console.log("📧 userEmail from API:", userData.userEmail);
        console.log("🏠 userAddress from API:", userData.userAddress, "(NOT auto-filling address)");
        console.log("🏙️ userCity from API:", userData.userCity);
        console.log("🏛️ userProvince from API:", userData.userProvince);
        
        // Update personal data in parent component (don't auto-fill address)
        const newOwnerData = {
          ...ownerData, // Keep existing data first
          fullName: userData.userName || ownerData.fullName || "",
          email: userData.userEmail || ownerData.email || "",
          phone: userData.userContactNumber || ownerData.phone || "",
          address: ownerData.address || "", // Keep existing address, don't auto-fill from API
        };
        
        // Update local location data
        setLocalLocationData({
          userCity: userData.userCity || "",
          userRegion: userData.userRegion || fixedRegion,
          userProvince: userData.userProvince || fixedProvince,
        });
        
        console.log("🔧 Setting ownerData to:", newOwnerData);
        console.log("🔧 Setting localLocationData to:", {
          userCity: userData.userCity || "",
          userRegion: userData.userRegion || fixedRegion,
          userProvince: userData.userProvince || fixedProvince,
        });
        
        setOwnerData(newOwnerData);
        setIsDataLoaded(true);
        
        console.log("✅ User data fetched and set");
      } catch (error) {
        console.error("❌ Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, [isDataLoaded]);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    console.log(`🔧 handleChange: ${name} = "${value}"`);
    console.log(`🔧 Current ownerData:`, ownerData);
    
    setOwnerData({ ...ownerData, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleLocationChange = async (e) => {
    const { name, value } = e.target;
    console.log(`🔧 handleLocationChange: ${name} = "${value}"`);
    
    // Update local location state
    setLocalLocationData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    
    // Auto-save city and province to backend when user types
    if ((name === 'userCity' || name === 'userProvince') && value.trim()) {
      try {
        const updateData = {
          userRegion: fixedRegion
        };
        
        // Include city if it's being updated
        if (name === 'userCity') {
          updateData.userCity = value;
          updateData.userProvince = localLocationData.userProvince || ""; // Keep existing province
        }
        
        // Include province if it's being updated
        if (name === 'userProvince') {
          updateData.userProvince = value;
          updateData.userCity = localLocationData.userCity || ""; // Keep existing city
        }
        
        await api.post('/update-location', updateData);
        console.log(`✅ ${name} "${value}" saved to backend`);
      } catch (error) {
        console.error(`Failed to save ${name}:`, error);
      }
    }
  };

  const fetchLocation = async () => {
    setLoadingLocation(true);
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      
      // Get address from coordinates
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
      );
      const data = await response.json();
      
      const detectedCity = data.address?.city || data.address?.town || data.address?.municipality;
      const detectedState = data.address?.state || data.address?.region;
      
      // Check if city is in Laguna
      const cityInLaguna = lagunaCities.find(city => 
        city.toLowerCase() === detectedCity?.toLowerCase()
      );

      if (cityInLaguna && detectedState?.toLowerCase().includes('laguna')) {
        console.log("📍 Location detected in Laguna:", cityInLaguna);
        console.log("🔧 Current ownerData before location update:", ownerData);
        
        // Update local location data only, don't touch personal data
        setLocalLocationData(prev => {
          console.log("🔧 Previous location data:", prev);
          const updated = {
            userCity: cityInLaguna,
            userRegion: fixedRegion,
            userProvince: "Laguna"
          };
          console.log("🔧 Updated location data:", updated);
          return updated;
        });
        
        console.log("✅ Location fields updated - city:", cityInLaguna, "province: Laguna");

        // Wait a moment to see if parent component resets the data
        setTimeout(() => {
          console.log("🔍 Checking ownerData after 1 second:", ownerData);
        }, 1000);

        // Save city and province to backend
        await api.post('/update-location', {
          userCity: cityInLaguna,
          userRegion: fixedRegion,
          userProvince: "Laguna",
          latitude,
          longitude
        });

        setErrors(prev => ({
          ...prev,
          location: "",
          userProvince: "", // Clear any province errors
          success: `✅ Location detected: ${cityInLaguna}, Laguna. Province is now set to Laguna. Please enter your house number and street in the address field.`
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          location: `Location detected outside Laguna: ${detectedCity}. Please enter a city in Laguna.`
        }));
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        location: "Failed to get location. Please enter manually."
      }));
    } finally {
      setLoadingLocation(false);
    }
  };


  const validateForm = () => {
    const newErrors = {};
    if (!ownerData.fullName?.trim()) newErrors.fullName = "Full name is required";
    if (!ownerData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(ownerData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!ownerData.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9\-+\s()]+$/.test(ownerData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }
    if (!ownerData.address?.trim()) newErrors.address = "Address is required";
    if (!localLocationData.userCity?.trim()) newErrors.userCity = "Please enter a city in Laguna";
    if (!localLocationData.userProvince?.trim()) {
      newErrors.userProvince = "Province is required";
    } else if (localLocationData.userProvince.toLowerCase() !== "laguna") {
      newErrors.userProvince = "Province must be Laguna";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };


  return (
    <Card className="w-full bg-white">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Owner Information</h2>
          <p className="text-center text-gray-500">
            Please verify your contact information
          </p>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.general}
            </div>
          )}

          {/* Debug Section - Remove after testing */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded text-sm">
            <h4 className="font-semibold text-blue-800 mb-2">🐛 Debug Info</h4>
            <div className="space-y-1 text-blue-700">
              <p><strong>fullName:</strong> "{ownerData.fullName || 'EMPTY'}"</p>
              <p><strong>email:</strong> "{ownerData.email || 'EMPTY'}"</p>
              <p><strong>phone:</strong> "{ownerData.phone || 'EMPTY'}"</p>
              <p><strong>userCity:</strong> "{localLocationData.userCity || 'EMPTY'}"</p>
              <p><strong>userProvince:</strong> "{localLocationData.userProvince || 'EMPTY'}"</p>
              <p><strong>userRegion:</strong> "{localLocationData.userRegion || 'EMPTY'}"</p>
            </div>
            <button 
              onClick={async () => {
                console.log("🔧 MANUAL FIX: Fetching and setting data...");
                try {
                  const response = await api.get('/profile');
                  console.log("📡 Manual API Response:", response.data);
                  
                  const newData = {
                    ...ownerData, // Keep existing data first
                    fullName: response.data.userName || ownerData.fullName || "",
                    email: response.data.userEmail || ownerData.email || "",
                    phone: response.data.userContactNumber || ownerData.phone || "",
                    address: ownerData.address || "", // Keep existing address, don't auto-fill from API
                  };
                  
                  // Update local location data separately
                  setLocalLocationData({
                    userCity: response.data.userCity || "",
                    userRegion: response.data.userRegion || fixedRegion,
                    userProvince: response.data.userProvince || fixedProvince,
                  });
                  
                  console.log("🔧 MANUAL SET personal data:", newData);
                  console.log("🔧 MANUAL SET location data:", {
                    userCity: response.data.userCity || "",
                    userRegion: response.data.userRegion || fixedRegion,
                    userProvince: response.data.userProvince || fixedProvince,
                  });
                  
                  setOwnerData(newData);
                  setIsDataLoaded(true);
                  alert("✅ Data manually set! Check the form now.");
                } catch (error) {
                  console.error("❌ Manual fetch error:", error);
                  alert(`❌ Error: ${error.message}`);
                }
              }}
              className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded"
            >
              MANUAL FIX
            </button>
            <button 
              onClick={() => {
                console.log("🔄 Resetting data loaded flag...");
                setIsDataLoaded(false);
                alert("🔄 Reset complete. Data will be fetched again on next render.");
              }}
              className="mt-2 ml-2 px-3 py-1 bg-red-500 text-white text-sm rounded"
            >
              RESET
            </button>
          </div>

          <div className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                value={ownerData.fullName || ""}
                onChange={handleChange}
                placeholder="Enter your full name"
                readOnly
              />
              {errors.fullName && (
                <p className="text-sm text-red-500">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={ownerData.email || ""}
                onChange={handleChange}
                placeholder="Enter your email address"
                readOnly
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={ownerData.phone || ""}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            {/* Address with Location Fetch */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <div className="flex gap-2">
                <Textarea
                  id="address"
                  name="address"
                  value={ownerData.address || ""}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={fetchLocation}
                  disabled={loadingLocation}
                  className="w-auto whitespace-nowrap"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {loadingLocation ? "Fetching..." : "Get Location"}
                </Button>
              </div>
              {errors.location && (
                <p className="text-sm text-red-500">{errors.location}</p>
              )}
              {errors.success && (
                <p className="text-sm text-green-600">{errors.success}</p>
              )}
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address}</p>
              )}
            </div>

            {/* Region - Fixed */}
            <div className="space-y-2">
              <Label htmlFor="userRegion">Region</Label>
              <Input
                id="userRegion"
                value={localLocationData.userRegion || fixedRegion}
                disabled
                className="bg-gray-50"
              />
            </div>

            {/* Province - Editable but validated by location */}
            <div className="space-y-2">
              <Label htmlFor="userProvince">Province</Label>
              <Input
                id="userProvince"
                name="userProvince"
                value={localLocationData.userProvince || ""}
                onChange={handleLocationChange}
                placeholder="Enter your province (must be Laguna)"
              />
              {errors.userProvince && (
                <p className="text-sm text-red-500">{errors.userProvince}</p>
              )}
            </div>

            {/* City Input */}
            <div className="space-y-2">
              <Label htmlFor="userCity">City/Municipality in Laguna</Label>
              <Input
                id="userCity"
                name="userCity"
                value={localLocationData.userCity || ""}
                onChange={handleLocationChange}
                placeholder="Enter your city in Laguna"
              />
              {errors.userCity && (
                <p className="text-sm text-red-500">{errors.userCity}</p>
              )}
              <p className="text-xs text-gray-500">
                Cities in Laguna: Alaminos, Bay, Biñan, Cabuyao, Calamba, Calauan, Cavinti, Famy, Kalayaan, Liliw, Los Baños, Luisiana, Lumban, Mabitac, Magdalena, Majayjay, Nagcarlan, Paete, Pagsanjan, Pakil, Pangil, Pila, Rizal, San Pablo, San Pedro, Santa Cruz, Santa Maria, Santa Rosa, Siniloan, Victoria
              </p>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button onClick={onBack} variant="outline">
              Back
            </Button>
            <Button onClick={handleNext}>Next Step</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OwnerInfo;