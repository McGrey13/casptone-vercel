import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Upload, Video as VideoIcon, Image as ImageIcon, Check } from 'lucide-react';
import api from '../../api';

export const AddProductModal = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [mainCategory, setMainCategory] = useState('');
  const [apiCategories, setApiCategories] = useState([]);
  const [mainImage, setMainImage] = useState({ file: null, preview: null });
  const [additionalImages, setAdditionalImages] = useState(Array(5).fill({ file: null, preview: null }));
  const [video, setVideo] = useState({ file: null, preview: null });
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  // const [shippingClass, setShippingClass] = useState('standard');
  const [publishStatus, setPublishStatus] = useState('draft');

  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const additionalImageRefs = useRef(Array(5).fill().map(() => React.createRef()));

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');

        if (response.data) {
          const result = response.data;
          console.log('Categories API Response:', result);

          // Check different possible response formats
          if (result.status === 'success' && Array.isArray(result.data)) {
            // If the API returns { status: 'success', data: [...] }
            setApiCategories(result.data);
            return;
          } else if (Array.isArray(result)) {
            // If the API returns the array directly
            setApiCategories(result);
            return;
          }

          throw new Error('Unexpected API response format');
        }

      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to hardcoded categories if API fails or returns unexpected format
        console.warn('API for categories failed or returned empty. Using fallback categories.');
        setApiCategories([
          { id: '1', category_name: 'Miniatures & Souvenirs' },
          { id: '2', category_name: 'Rubber Stamp Engraving' },
          { id: '3', category_name: 'Traditional Accessories' },
          { id: '4', category_name: 'Statuary & Sculpture' },
          { id: '5', category_name: 'Basketry & Weaving' },
        ]);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('Image size must be less than 10MB.');
        return;
      }
      setMainImage({ file: file, preview: URL.createObjectURL(file) });
    }
  };

  const handleAdditionalImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('Image size must be less than 10MB.');
        return;
      }
      const newImages = [...additionalImages];
      newImages[index] = { file: file, preview: URL.createObjectURL(file) };
      setAdditionalImages(newImages);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'video/mp4') {
        alert('Only MP4 videos are accepted.');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        alert('Video size must be less than 50MB.');
        return;
      }
      setVideo({ file: file, preview: URL.createObjectURL(file) });
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mainCategory) {
      alert('Please select a main category');
      return;
    }
    
    const formData = new FormData();
    formData.append('productName', title);
    formData.append('productDescription', description);
    formData.append('productPrice', price);
    formData.append('productQuantity', stock);
    formData.append('category', mainCategory);
    formData.append('status', 'in stock'); // Stock status
    formData.append('publish_status', publishStatus); // Publish status

    // Add main image if exists
    if (mainImage.file) {
      formData.append('productImage', mainImage.file);
    }
    
    // Add additional images if they exist
    additionalImages.forEach((image, index) => {
      if (image.file) {
        formData.append(`productImages[${index}]`, image.file);
      }
    });
    
    // Add video if exists
    if (video.file) {
      formData.append('productVideo', video.file);
    }

    onSave(formData);
  };

  const getSubmitButtonText = () => {
    if (publishStatus === 'published') return 'Publish Product';
    if (publishStatus === 'draft') return 'Save as Draft';
    return 'Add Product';
  };

  // Merge API categories with required static categories for reliability
  const staticCategoryNames = [
    "Native Handicraft",
    'Miniatures & Souvenirs',
    'Rubber Stamp Engraving',
    'Traditional Accessories',
    'Statuary & Sculpture',
    'Basketry & Weaving',
    "Shoe & Sandals Making",
    "Leather Crafts",
    "Candle Making",
    "Wood Carving",
    "House Garments",
    "Beadwork",
    "Crochet",
  ];
  const normalizedApiCategories = (apiCategories || []).map((c) => ({
    id: c.category_id || c.id || (c.category_name || c.name),
    name: c.category_name || c.name,
  })).filter((c) => !!c.name);
  const mergedCategories = (() => {
    const names = new Set(normalizedApiCategories.map((c) => c.name));
    const merged = [...normalizedApiCategories];
    staticCategoryNames.forEach((name) => {
      if (!names.has(name)) {
        merged.push({ id: name, name });
      }
    });
    return merged;
  })();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-lg sm:rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-slideUp">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm">
                <Plus className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-white">Add New Product</h2>
                <p className="text-white/80 text-xs sm:text-sm mt-1">Create your handcrafted masterpiece listing</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg sm:rounded-xl p-1.5 sm:p-2 transition-all duration-200"
              aria-label="Close modal"
            >
              <X size={24} className="sm:w-7 sm:h-7" />
            </button>
          </div>
        </div>
        
        {/* Content with scroll */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto max-h-[calc(95vh-80px)] sm:max-h-[calc(90vh-100px)]">
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            .animate-fadeIn {
              animation: fadeIn 0.2s ease-out;
            }
            .animate-slideUp {
              animation: slideUp 0.3s ease-out;
            }
          `}</style>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {/* Left Column - Product Details */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                {/* Product Information */}
                <div className="bg-gradient-to-br from-white to-[#faf9f8] rounded-lg sm:rounded-xl md:rounded-2xl border-2 border-[#e5ded7] shadow-lg p-4 sm:p-5 md:p-6 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-[#e5ded7]">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg">
                      <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#5c3d28]">Product Information</h3>
                  </div>
                  
                  {/* Product Title */}
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-xs sm:text-sm font-bold text-[#5c3d28] mb-2">
                      Product Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-[#e5ded7] rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#a4785a] focus:border-[#a4785a] transition-all duration-200 bg-white text-[#5c3d28] font-medium"
                      placeholder="e.g., Handwoven Rattan Basket"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={100}
                      required
                    />
                    <p className="text-xs text-[#7b5a3b] mt-2 flex items-center justify-between">
                      <span>✨ Make it descriptive and catchy!</span>
                      <span className="font-medium">{title.length}/100</span>
                    </p>
                  </div>

                  {/* Product Description */}
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-xs sm:text-sm font-bold text-[#5c3d28] mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-[#e5ded7] rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#a4785a] focus:border-[#a4785a] transition-all duration-200 bg-white text-[#5c3d28] resize-none"
                      rows="4"
                      placeholder="Describe your handcrafted product..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={2000}
                      required
                    ></textarea>
                    <p className="text-xs text-[#7b5a3b] mt-2 flex items-center justify-between">
                      <span>📝 Tell the story behind your craft</span>
                      <span className="font-medium">{description.length}/2000</span>
                    </p>
                  </div>

                  {/* Price and Stock */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-[#5c3d28] mb-2">
                        Price (₱) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#a4785a] font-bold text-base sm:text-lg">₱</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base md:text-lg border-2 border-[#e5ded7] rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#a4785a] focus:border-[#a4785a] transition-all duration-200 bg-white text-[#5c3d28] font-semibold"
                          placeholder="0.00"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          required
                        />
                      </div>
                      <p className="text-xs text-[#7b5a3b] mt-2">💰 Set a fair price for your craft</p>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-[#5c3d28] mb-2">
                        Stock Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base md:text-lg border-2 border-[#e5ded7] rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#a4785a] focus:border-[#a4785a] transition-all duration-200 bg-white text-[#5c3d28] font-semibold"
                        placeholder="Available units"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        required
                      />
                      <p className="text-xs text-[#7b5a3b] mt-2">📦 How many items do you have?</p>
                    </div>
                  </div>

                </div>
                
                {/* Product Images */}
                <div className="bg-gradient-to-br from-white to-[#faf9f8] rounded-lg sm:rounded-xl md:rounded-2xl border-2 border-[#e5ded7] shadow-lg p-4 sm:p-5 md:p-6 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-[#e5ded7]">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg">
                      <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#5c3d28]">Product Images</h3>
                  </div>
                    
                  {/* Main Image */}
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-xs sm:text-sm font-bold text-[#5c3d28] mb-2 sm:mb-3">
                      Main Product Image <span className="text-red-500">*</span>
                    </label>
                    <div 
                      className="border-3 border-dashed border-[#a4785a] rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 text-center cursor-pointer hover:border-[#7b5a3b] hover:bg-[#faf9f8] transition-all duration-300 relative group"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {mainImage.preview ? (
                        <div className="relative">
                          <img 
                            src={mainImage.preview} 
                            alt="Main product display" 
                            className="mx-auto mb-3 sm:mb-4 rounded-lg sm:rounded-xl max-h-48 sm:max-h-56 md:max-h-64 object-cover shadow-lg border-4 border-[#e5ded7]"
                          />
                          <div className="absolute top-2 right-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white px-2 sm:px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            MAIN IMAGE
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="p-3 sm:p-4 bg-gradient-to-r from-[#a4785a]/10 to-[#7b5a3b]/10 rounded-full w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <ImageIcon className="text-[#a4785a]" size={32} />
                          </div>
                          <p className="text-sm sm:text-base text-[#5c3d28] font-semibold mb-1 sm:mb-2">Click to upload your product's main photo</p>
                          <p className="text-xs sm:text-sm text-[#7b5a3b]">PNG, JPG, GIF up to 5MB</p>
                        </>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleMainImageChange}
                      />
                    </div>
                  </div>

                  {/* Additional Images */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-[#5c3d28] mb-2 sm:mb-3">
                      Additional Images <span className="text-[#7b5a3b] text-xs font-normal">(up to 5)</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                      {additionalImages.map((img, index) => (
                        <div
                          key={index}
                          className="border-2 border-dashed border-[#e5ded7] rounded-lg sm:rounded-xl p-2 sm:p-3 text-center cursor-pointer hover:border-[#a4785a] hover:bg-[#faf9f8] transition-all duration-300 relative h-24 sm:h-28 md:h-32 flex items-center justify-center group"
                          onClick={() => additionalImageRefs.current[index]?.current?.click()}
                        >
                          {img.preview ? (
                            <>
                              <img 
                                src={img.preview} 
                                alt={`Additional view ${index + 1}`}
                                className="w-full h-full object-cover rounded-md sm:rounded-lg shadow-md"
                              />
                              <button
                                type="button"
                                className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs sm:text-sm shadow-lg hover:scale-110 transition-transform duration-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newImages = [...additionalImages];
                                  newImages[index] = { file: null, preview: null };
                                  setAdditionalImages(newImages);
                                }}
                              >
                                ×
                              </button>
                            </>
                          ) : (
                            <div className="text-[#a4785a] group-hover:scale-110 transition-transform duration-300">
                              <Plus size={24} className="mx-auto mb-1" />
                              <span className="text-xs font-medium">Add Photo</span>
                            </div>
                          )}
                          <input
                            type="file"
                            ref={additionalImageRefs.current[index]}
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleAdditionalImageChange(index, e)}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-[#7b5a3b] mt-2 sm:mt-3">📸 Show your product from different angles</p>
                  </div>
                </div>

                {/* Product Video */}
                <div className="bg-gradient-to-br from-white to-[#faf9f8] rounded-lg sm:rounded-xl md:rounded-2xl border-2 border-[#e5ded7] shadow-lg p-4 sm:p-5 md:p-6 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-[#e5ded7]">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg">
                      <VideoIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#5c3d28]">Product Video</h3>
                    <span className="ml-auto text-xs text-[#7b5a3b] bg-[#faf9f8] px-2 sm:px-3 py-1 rounded-full border border-[#e5ded7]">Optional</span>
                  </div>
                  <div 
                    className="border-3 border-dashed border-[#a4785a] rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 text-center cursor-pointer hover:border-[#7b5a3b] hover:bg-[#faf9f8] transition-all duration-300 group"
                    onClick={() => videoInputRef.current?.click()}
                  >
                    {video.preview ? (
                      <div className="relative">
                        <video
                          src={video.preview}
                          controls
                          className="w-full rounded-lg sm:rounded-xl shadow-lg border-4 border-[#e5ded7]"
                        />
                        <button
                          type="button"
                          className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm shadow-lg hover:scale-110 transition-transform duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            setVideo({ file: null, preview: null });
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="p-3 sm:p-4 bg-gradient-to-r from-[#a4785a]/10 to-[#7b5a3b]/10 rounded-full w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <VideoIcon className="text-[#a4785a]" size={32} />
                        </div>
                        <p className="text-sm sm:text-base text-[#5c3d28] font-semibold mb-1 sm:mb-2">Click to upload your product video</p>
                        <p className="text-xs sm:text-sm text-[#7b5a3b]">MP4 format, max 50MB</p>
                        <p className="text-xs text-[#7b5a3b] mt-2 sm:mt-3">🎥 Show your product in action!</p>
                      </>
                    )}
                    <input
                      type="file"
                      ref={videoInputRef}
                      className="hidden"
                      accept="video/mp4"
                      onChange={handleVideoChange}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Categories & Tags */}
              <div className="space-y-4 sm:space-y-6">
                {/* Categories */}
                <div className="bg-gradient-to-br from-white to-[#faf9f8] rounded-lg sm:rounded-xl md:rounded-2xl border-2 border-[#e5ded7] shadow-lg p-4 sm:p-5 md:p-6 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-[#e5ded7]">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg">
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#5c3d28]">Category</h3>
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-[#5c3d28] mb-2 sm:mb-3">
                      Select Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-[#e5ded7] rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#a4785a] focus:border-[#a4785a] transition-all duration-200 bg-white text-[#5c3d28] font-medium cursor-pointer hover:border-[#a4785a]"
                      value={mainCategory}
                      onChange={(e) => setMainCategory(e.target.value)}
                      required
                    >
                      <option value="" disabled>Choose a category...</option>
                      {mergedCategories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-[#7b5a3b] mt-2 sm:mt-3">🎨 Select the best category for your product</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="bg-gradient-to-br from-white to-[#faf9f8] rounded-lg sm:rounded-xl md:rounded-2xl border-2 border-[#e5ded7] shadow-lg p-4 sm:p-5 md:p-6 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-[#e5ded7]">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg">
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#5c3d28]">Product Tags</h3>
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-[#5c3d28] mb-2 sm:mb-3">
                      Add Tags <span className="text-[#7b5a3b] text-xs font-normal">(Optional)</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3 min-h-[40px] p-2 sm:p-3 bg-[#faf9f8] rounded-lg sm:rounded-xl border-2 border-[#e5ded7]">
                      {tags.length > 0 ? tags.map((tag, index) => (
                        <span key={index} className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2 shadow-md hover:shadow-lg transition-shadow duration-200">
                          {tag}
                          <button
                            type="button"
                            className="hover:bg-white/20 rounded-full p-0.5 transition-colors duration-200"
                            onClick={() => removeTag(tag)}
                            aria-label={`Remove tag ${tag}`}
                          >
                            <X size={12} className="sm:w-3.5 sm:h-3.5" />
                          </button>
                        </span>
                      )) : (
                        <span className="text-[#7b5a3b] text-xs sm:text-sm italic">No tags added yet</span>
                      )}
                    </div>
                    <input
                      type="text"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-[#e5ded7] rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#a4785a] focus:border-[#a4785a] transition-all duration-200 bg-white text-[#5c3d28] font-medium"
                      placeholder="Type a tag and press Enter..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleAddTag}
                    />
                    <p className="text-xs text-[#7b5a3b] mt-2 sm:mt-3">🏷️ Press <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-[#e5ded7] rounded text-[#5c3d28] font-mono">Enter</kbd> to add tags (e.g., handmade, gift-idea, eco-friendly)</p>
                  </div>
                </div>

                {/* Publish Status */}
                


                {/* Submit Button */}
                <div className="sticky bottom-0 pt-3 sm:pt-4">
                  
                <button type="submit">
                    Save as Draft
                  </button>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg hover:from-[#8a6b4a] hover:to-[#6b4a2f] transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl shadow-xl flex items-center justify-center gap-2 sm:gap-3 group"
                  > publish
                    <Plus className="h-5 w-5 sm:h-6 sm:w-6 group-hover:rotate-90 transition-transform duration-300" />
                    {getSubmitButtonText()}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;

