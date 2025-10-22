import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Truck, Globe, MapPin, Package } from "lucide-react";

const ShippingSettings = () => {
  return (
    <div className="space-y-3 sm:space-y-4 max-w-[405px] mx-auto sm:max-w-none px-2 sm:px-0">
      {/* Header with craft theme */}
      <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg sm:rounded-xl shadow-xl p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Truck className="h-8 w-8 mr-3" />
              Shipping Settings
            </h1>
            <p className="text-white/90 mt-2 text-lg">
              Configure your shipping rates and delivery options
            </p>
          </div>
          <Button className="bg-white text-[#5c3d28] hover:bg-[#faf9f8] shadow-lg hover:shadow-xl transition-all duration-200">
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="domestic" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-[#faf9f8] border-2 border-[#e5ded7] p-1 rounded-xl shadow-md">
          <TabsTrigger 
            value="domestic"
            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#a4785a] data-[state=active]:to-[#7b5a3b] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 font-medium"
          >
            Domestic Shipping
          </TabsTrigger>
          <TabsTrigger 
            value="packaging"
            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#a4785a] data-[state=active]:to-[#7b5a3b] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 font-medium"
          >
            Packaging Options
          </TabsTrigger>
        </TabsList>

        <TabsContent value="domestic" className="space-y-6 pt-6">
          <Card className="border-2 border-[#e5ded7] shadow-xl rounded-lg sm:rounded-xl overflow-hidden">
            <CardHeader className="border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white p-3 sm:p-4">
              <CardTitle className="flex items-center text-[#5c3d28] text-sm sm:text-base">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-[#a4785a]" />
                Domestic Shipping Methods
              </CardTitle>
              <CardDescription className="text-[#7b5a3b]">
                Configure your domestic shipping options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {/* ...content unchanged */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="packaging" className="space-y-6 pt-6">
          <Card className="border-2 border-[#e5ded7] shadow-xl rounded-lg sm:rounded-xl overflow-hidden">
            <CardHeader className="border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white p-3 sm:p-4">
              <CardTitle className="flex items-center text-[#5c3d28] text-sm sm:text-base">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-[#a4785a]" />
                Packaging Options
              </CardTitle>
              <CardDescription className="text-[#7b5a3b]">
                Configure your packaging preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {/* ...content unchanged */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShippingSettings;
