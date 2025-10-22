import React, { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Upload, FileText, ImageIcon } from "lucide-react";

const VerificationDocuments = ({
  storeData = {
    birPermit: null,
    dtiPermit: null,
    idImage: null,
    idType: "",
    tinNumber: "",
  },
  updateStoreData = () => {},
  onNext = () => {},
  onBack = () => {},
}) => {
  const [errors, setErrors] = useState({});
  const [birPreview, setBirPreview] = useState(null);
  const [dtiPreview, setDtiPreview] = useState(null);
  const [idPreview, setIdPreview] = useState(null);

  const idTypes = [
    { value: "UMID", label: "Unified Multi-Purpose Identification (UMID) Card" },
    { value: "SSS", label: "Social Security System (SSS) Card" },
    { value: "GSIS", label: "Government Service Insurance System (GSIS) e-Card" },
    { value: "LTO", label: "Land Transportation Office (LTO) Driver's License" },
    { value: "Postal", label: "Philippine Postal ID" },
    { value: "Passport", label: "Philippine Passport" },
    { value: "PhilHealth", label: "PhilHealth ID" },
    { value: "PhilID", label: "PhilID / ePhilID (PhilSys)" },
    { value: "PRC", label: "Professional Regulation Commission (PRC) ID" },
    { value: "Alien", label: "Alien Certification of Registration" },
    { value: "Foreign_Passport", label: "Foreign Passport" },
  ];

  const handleFileChange = (file, type) => {
    if (file) {
      updateStoreData({ [type]: file });
      
      // Set preview for images
      if (type === 'birPermit') {
        setBirPreview(URL.createObjectURL(file));
      } else if (type === 'dtiPermit') {
        setDtiPreview(URL.createObjectURL(file));
      } else if (type === 'idImage') {
        setIdPreview(URL.createObjectURL(file));
      }
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {};

    // BIR Permit is required
    if (!storeData.birPermit) {
      newErrors.birPermit = "BIR Permit is required";
      valid = false;
    }

    // DTI Permit is required
    if (!storeData.dtiPermit) {
      newErrors.dtiPermit = "DTI Permit is required";
      valid = false;
    }

    // ID Image is required
    if (!storeData.idImage) {
      newErrors.idImage = "ID Document is required";
      valid = false;
    }

    // ID Type is required if ID Image is provided
    if (storeData.idImage && !storeData.idType) {
      newErrors.idType = "Please select the type of ID document";
      valid = false;
    }

    // TIN Number is required
    if (!storeData.tinNumber.trim()) {
      newErrors.tinNumber = "TIN Number is required";
      valid = false;
    } else if (!/^\d{3}-\d{3}-\d{3}-\d{3}$/.test(storeData.tinNumber.replace(/\s/g, ''))) {
      newErrors.tinNumber = "TIN Number must be in format: 000-000-000-000";
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

  const formatTIN = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as XXX-XXX-XXX-XXX
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 9)}-${digits.slice(9, 12)}`;
  };

  return (
    <Card className="w-full bg-white">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Verification Documents</h2>
          <p className="text-center text-gray-500">
            Please upload the required documents for verification
          </p>

          <div className="space-y-6">
            {/* BIR Permit */}
            <div className="space-y-2">
              <Label htmlFor="bir-permit">BIR Permit *</Label>
              <div className="flex items-center gap-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 w-32 h-32 flex items-center justify-center relative">
                  {birPreview || (storeData.birPermit && URL.createObjectURL(storeData.birPermit)) ? (
                    <img
                      src={birPreview || (storeData.birPermit ? URL.createObjectURL(storeData.birPermit) : "")}
                      alt="BIR Permit preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <FileText className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2"
                    onClick={() => document.getElementById("bir-upload")?.click()}
                  >
                    <Upload className="w-4 h-4" />
                    Upload BIR Permit
                  </Button>
                  <input
                    id="bir-upload"
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files[0], 'birPermit')}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Accepted formats: JPG, PNG, PDF. Max size: 8MB.
                  </p>
                </div>
              </div>
              {errors.birPermit && (
                <p className="text-sm text-red-500">{errors.birPermit}</p>
              )}
            </div>

            {/* DTI Permit */}
            <div className="space-y-2">
              <Label htmlFor="dti-permit">DTI Permit *</Label>
              <div className="flex items-center gap-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 w-32 h-32 flex items-center justify-center relative">
                  {dtiPreview || (storeData.dtiPermit && URL.createObjectURL(storeData.dtiPermit)) ? (
                    <img
                      src={dtiPreview || (storeData.dtiPermit ? URL.createObjectURL(storeData.dtiPermit) : "")}
                      alt="DTI Permit preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <FileText className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2"
                    onClick={() => document.getElementById("dti-upload")?.click()}
                  >
                    <Upload className="w-4 h-4" />
                    Upload DTI Permit
                  </Button>
                  <input
                    id="dti-upload"
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files[0], 'dtiPermit')}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Accepted formats: JPG, PNG, PDF. Max size: 8MB.
                  </p>
                </div>
              </div>
              {errors.dtiPermit && (
                <p className="text-sm text-red-500">{errors.dtiPermit}</p>
              )}
            </div>

            {/* ID Document */}
            <div className="space-y-2">
              <Label htmlFor="id-image">ID Document *</Label>
              <div className="flex items-center gap-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 w-32 h-32 flex items-center justify-center relative">
                  {idPreview || (storeData.idImage && URL.createObjectURL(storeData.idImage)) ? (
                    <img
                      src={idPreview || (storeData.idImage ? URL.createObjectURL(storeData.idImage) : "")}
                      alt="ID Document preview"
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
                    onClick={() => document.getElementById("id-upload")?.click()}
                  >
                    <Upload className="w-4 h-4" />
                    Upload ID Document
                  </Button>
                  <input
                    id="id-upload"
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files[0], 'idImage')}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Accepted formats: JPG, PNG, PDF. Max size: 8MB.
                  </p>
                </div>
              </div>
              {errors.idImage && (
                <p className="text-sm text-red-500">{errors.idImage}</p>
              )}
            </div>

            {/* ID Type Selection */}
            {storeData.idImage && (
              <div className="space-y-2">
                <Label htmlFor="id-type">Type of ID Document *</Label>
                <Select
                  value={storeData.idType}
                  onValueChange={(value) => updateStoreData({ idType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select ID type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {idTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.idType && (
                  <p className="text-sm text-red-500">{errors.idType}</p>
                )}
              </div>
            )}

            {/* TIN Number */}
            <div className="space-y-2">
              <Label htmlFor="tin-number">Taxpayer Identification Number (TIN) *</Label>
              <Input
                id="tin-number"
                placeholder="000-000-000-000"
                value={storeData.tinNumber}
                onChange={(e) => {
                  const formatted = formatTIN(e.target.value);
                  updateStoreData({ tinNumber: formatted });
                }}
                maxLength={15} // 12 digits + 3 dashes
              />
              <p className="text-xs text-gray-500">
                Enter your 12-digit TIN number. It will be automatically formatted.
              </p>
              {errors.tinNumber && (
                <p className="text-sm text-red-500">{errors.tinNumber}</p>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button onClick={onBack} variant="outline">
              Back
            </Button>
            <Button onClick={handleSubmit}>Next Step</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VerificationDocuments;
