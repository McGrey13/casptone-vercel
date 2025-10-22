import React, { useState } from "react";
import { CheckCircle } from "lucide-react";
import { createStore } from "../../api/storeApi";
import { useNavigate } from "react-router-dom";
import StoreDetails from "./StoreDetails";
import OwnerInfo from "./OwnerInfo";
import VerificationDocuments from "./VerificationDocuments";
import RulesGuidelines from "./RulesGuidelines";
import VerificationPending from "./VerificationPending";

const CreateStore = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [storeData, setStoreData] = useState({
    storeName: "",
    storeDescription: "",
    category: "Native Handicraft",
    logo: null,
    birPermit: null,
    dtiPermit: null,
    idImage: null,
    idType: "",
    tinNumber: "",
    agreedToTerms: false,
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    ownerAddress: "",
  });

  const categories = [
    "Native Handicraft",
    "Miniatures & Souvenirs",
    "Rubber Stamp Engraving",
    "Traditional Accessories",
    "Statuary & Sculpture",
    "Basketry & Weaving"
  ];
  const [isSubmitted, setIsSubmitted] = useState(false);

  const totalSteps = 5;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!storeData.agreedToTerms) {
      setError("You must agree to the terms and conditions");
      return;
    }

    const formData = new FormData();
    formData.append('store_name', storeData.storeName);
    formData.append('store_description', storeData.storeDescription);
    formData.append('category', storeData.category);
    if (storeData.logo) formData.append('logo', storeData.logo);
    if (storeData.birPermit) formData.append('bir', storeData.birPermit);
    if (storeData.dtiPermit) formData.append('dti', storeData.dtiPermit);
    if (storeData.idImage) formData.append('id_image', storeData.idImage);
    if (storeData.idType) formData.append('id_type', storeData.idType);
    if (storeData.tinNumber) formData.append('tin_number', storeData.tinNumber);
    formData.append('owner_name', storeData.ownerName);
    formData.append('owner_email', storeData.ownerEmail);
    formData.append('owner_phone', storeData.ownerPhone);
    formData.append('owner_address', storeData.ownerAddress);

    try {
      await createStore(formData);
      setIsSubmitted(true);
      // Stay on verification pending page - no redirect
    } catch (err) {
      console.error('Failed to create store', err);
      setError(err.response?.data?.message || 'Failed to submit store. Please try again.');
      setCurrentStep(1); // Return to first step if there's an error
    }
  };

  const updateStoreData = (data) => {
    setStoreData({ ...storeData, ...data });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <StoreDetails
            storeData={storeData}
            updateStoreData={updateStoreData}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <OwnerInfo
            ownerData={{
              fullName: storeData.ownerName,
              email: storeData.ownerEmail,
              phone: storeData.ownerPhone,
              address: storeData.ownerAddress,
            }}
            setOwnerData={(data) => {
              updateStoreData({
                ownerName: data.fullName,
                ownerEmail: data.email,
                ownerPhone: data.phone,
                ownerAddress: data.address,
              });
            }}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <VerificationDocuments
            storeData={storeData}
            updateStoreData={updateStoreData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <RulesGuidelines
            onNext={handleNext}
            onBack={handleBack}
            onAgree={(agreed) => updateStoreData({ agreedToTerms: agreed })}
            agreed={storeData.agreedToTerms}
          />
        );
      case 5:
        return (
          <div className="w-full bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold text-center mb-6">Review Your Store Details</h2>
            <div className="space-y-6">
              {/* Store and Owner Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Store Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {storeData.storeName}</p>
                    <p><span className="font-medium">Category:</span> {storeData.category}</p>
                    <p><span className="font-medium">Description:</span><br/>{storeData.storeDescription}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Owner Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {storeData.ownerName}</p>
                    <p><span className="font-medium">Email:</span> {storeData.ownerEmail}</p>
                    <p><span className="font-medium">Phone:</span> {storeData.ownerPhone}</p>
                    <p><span className="font-medium">Address:</span><br/>{storeData.ownerAddress}</p>
                  </div>
                </div>
              </div>
              
              {/* Store Logo */}
              {storeData.logo && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Store Logo</h3>
                  <img 
                    src={URL.createObjectURL(storeData.logo)} 
                    alt="Store Logo Preview" 
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                </div>
              )}
              
              {/* Verification Documents */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-4">Verification Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* BIR Permit */}
                  {storeData.birPermit && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-700 mb-2">BIR Permit</h4>
                      {storeData.birPermit.type.startsWith('image/') ? (
                        <img 
                          src={URL.createObjectURL(storeData.birPermit)} 
                          alt="BIR Permit Preview" 
                          className="w-full h-40 object-contain border rounded mb-2"
                        />
                      ) : (
                        <div className="w-full h-40 border rounded mb-2 flex items-center justify-center bg-gray-100">
                          <div className="text-center">
                            <div className="text-2xl mb-2">📄</div>
                            <p className="text-sm text-gray-600">PDF Document</p>
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-gray-600">Document: {storeData.birPermit.name}</p>
                    </div>
                  )}
                  
                  {/* DTI Permit */}
                  {storeData.dtiPermit && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-700 mb-2">DTI Permit</h4>
                      {storeData.dtiPermit.type.startsWith('image/') ? (
                        <img 
                          src={URL.createObjectURL(storeData.dtiPermit)} 
                          alt="DTI Permit Preview" 
                          className="w-full h-40 object-contain border rounded mb-2"
                        />
                      ) : (
                        <div className="w-full h-40 border rounded mb-2 flex items-center justify-center bg-gray-100">
                          <div className="text-center">
                            <div className="text-2xl mb-2">📄</div>
                            <p className="text-sm text-gray-600">PDF Document</p>
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-gray-600">Document: {storeData.dtiPermit.name}</p>
                    </div>
                  )}
                  
                  {/* ID Document */}
                  {storeData.idImage && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-700 mb-2">ID Document</h4>
                      {storeData.idImage.type.startsWith('image/') ? (
                        <img 
                          src={URL.createObjectURL(storeData.idImage)} 
                          alt="ID Document Preview" 
                          className="w-full h-40 object-contain border rounded mb-2"
                        />
                      ) : (
                        <div className="w-full h-40 border rounded mb-2 flex items-center justify-center bg-gray-100">
                          <div className="text-center">
                            <div className="text-2xl mb-2">📄</div>
                            <p className="text-sm text-gray-600">PDF Document</p>
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-gray-600">Document: {storeData.idImage.name}</p>
                      {storeData.idType && (
                        <p className="text-xs text-gray-600">Type: {storeData.idType}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* TIN Number */}
              {storeData.tinNumber && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Tax Information</h3>
                  <p><span className="font-medium">TIN Number:</span> {storeData.tinNumber}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                className="px-6 py-2 border border-amber-700 text-amber-700 rounded-lg hover:bg-amber-50"
              >
                {"Back"}
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-amber-700 text-black rounded-lg hover:bg-amber-800"
              >
                {"Submit Store"}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderSuccessScreen = () => (
    <VerificationPending 
      storeData={storeData}
      onCheckStatus={() => {
        // This will be handled by the VerificationPending component
      }}
    />
  );

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, name: "Store Details" },
      { number: 2, name: "Owner Info" },
      { number: 3, name: "Documents" },
      { number: 4, name: "Guidelines" },
      { number: 5, name: "Review" },
    ];

    return (
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`flex flex-col items-center ${
                currentStep >= step.number
                  ? "text-amber-700"
                  : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                  currentStep >= step.number
                    ? "bg-amber-700 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step.number}
              </div>
              <span className="text-xs">{step.name}</span>
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full">
          <div
            className="h-2 bg-amber-700 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-6 border border-amber-100">
      {!isSubmitted ? (
        <>
          {renderStepIndicator()}
          {renderStepContent()}
        </>
      ) : (
        renderSuccessScreen()
      )}
    </div>
  );
};

export default CreateStore;
