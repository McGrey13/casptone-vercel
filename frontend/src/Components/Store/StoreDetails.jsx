import React, { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Upload, ImageIcon } from "lucide-react";

const StoreDetails = ({
  storeData = {
    storeName: "",
    storeDescription: "",
    category: "Native Handicraft",
    logo: null,
  },
  updateStoreData = () => {},
  onNext = () => {},
}) => {
  const [errors, setErrors] = useState({
    name: "",
    description: "",
  });
  const [logoPreview, setLogoPreview] = useState(null);

  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      updateStoreData({ logo: file });
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { name: "", description: "" };

    if (!storeData.storeName.trim()) {
      newErrors.name = "Store name is required";
      valid = false;
    }

    if (!storeData.storeDescription.trim()) {
      newErrors.description = "Store description is required";
      valid = false;
    } else if (storeData.storeDescription.length < 20) {
      newErrors.description = "Description must be at least 20 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <Card className="w-full bg-white">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Store Details</h2>
          <p className="text-center text-gray-500">
            Tell us about your handicraft store
          </p>

          <div className="space-y-4">
            {/* Store Name */}
            <div className="space-y-2">
              <Label htmlFor="store-name">Store Name</Label>
              <Input
                id="store-name"
                placeholder="Enter your store name"
                value={storeData.storeName}
                onChange={(e) => updateStoreData({ storeName: e.target.value })}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Store Description */}
            <div className="space-y-2">
              <Label htmlFor="store-description">Store Description</Label>
              <Textarea
                id="store-description"
                placeholder="Describe your store and products"
                className="min-h-[120px]"
                value={storeData.storeDescription}
                onChange={(e) =>
                  updateStoreData({ storeDescription: e.target.value })
                }
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Store Category */}
            <div className="space-y-2">
              <Label htmlFor="store-category">Store Category</Label>
              <Select
                value={storeData.category}
                onValueChange={(value) => updateStoreData({ category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Native Handicraft">Native Handicraft</SelectItem>
                  <SelectItem value="Miniatures & Souvenirs">Miniatures & Souvenirs</SelectItem>
                  <SelectItem value="Rubber Stamp Engraving">Rubber Stamp Engraving</SelectItem>
                  <SelectItem value="Traditional Accessories">Traditional Accessories</SelectItem>
                  <SelectItem value="Statuary & Sculpture">Statuary & Sculpture</SelectItem>
                  <SelectItem value="Basketry & Weaving">Basketry & Weaving</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Store Logo */}
            <div className="space-y-2">
              <Label htmlFor="store-logo">Store Logo</Label>
              <div className="flex items-center gap-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 w-32 h-32 flex items-center justify-center relative">
                  {logoPreview ||
                  (storeData.logo && URL.createObjectURL(storeData.logo)) ? (
                    <img
                      src={
                        logoPreview ||
                        (storeData.logo
                          ? URL.createObjectURL(storeData.logo)
                          : "")
                      }
                      alt="Store logo preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2"
                    onClick={() =>
                      document.getElementById("logo-upload")?.click()
                    }
                  >
                    <Upload className="w-4 h-4" />
                    Upload Logo
                  </Button>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended: Square image, at least 500x500px. Max size:
                    2MB.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Next Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSubmit}>Next Step</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StoreDetails;
