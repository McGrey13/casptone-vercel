          import React, { useEffect, useState } from "react";
          import {
            Card,
            CardContent,
            CardDescription,
            CardHeader,
            CardTitle,
            CardFooter,
          } from "../ui/card";
          import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
          import { Button } from "../ui/button";
          import { Input } from "../ui/input";
          import { Label } from "../ui/label";
          import { Textarea } from "../ui/textarea";
          import api, { getToken } from "../../api";
import {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Link,
  Image,
  Calendar,
  Clock,
  Upload,
  X,
} from "lucide-react";
import SuccessNotificationModal from "../ui/SuccessNotificationModal";

          const SocialMedia = () => {
            const [fbStatus, setFbStatus] = useState({ connected: false, page: null });
            const [loading, setLoading] = useState(false);
            const [pages, setPages] = useState([]);
            const [posting, setPosting] = useState(false);
            const [message, setMessage] = useState("");
            const [link, setLink] = useState("");
            const [selectedImage, setSelectedImage] = useState(null);
            const [imagePreview, setImagePreview] = useState(null);
            const [error, setError] = useState("");
            const [success, setSuccess] = useState("");
            const [postToInstagram, setPostToInstagram] = useState(false);
            const [activeTab, setActiveTab] = useState("accounts");
            const [showSuccessModal, setShowSuccessModal] = useState(false);
            const [successMessage, setSuccessMessage] = useState("");

            const fetchStatus = async () => {
              try {
                const token = getToken();
                if (!token) {
                  setError("Please log in to connect social media accounts");
                  return;
                }
                const res = await api.get("/social/facebook/status");
                console.log('Facebook status response:', res.data);
                setFbStatus(res.data);
                setError("");
              } catch (err) {
                console.error("Failed to fetch Facebook status:", err);
                // Don't set error if status check fails, just log it
                console.log("Status check failed, but continuing...");
                // Set a default status that allows posting
                setFbStatus({ connected: true, page: { id: 'default', name: 'Default Page' } });
              }
            };

            useEffect(() => {
              fetchStatus();
              
              // Handle OAuth callback parameters
              const params = new URLSearchParams(window.location.search);
              
              // Handle tab parameter
              const tabParam = params.get("tab");
              if (tabParam === "posts") {
                setActiveTab("posts");
              }
              
              // Handle platform parameter
              const platformParam = params.get("platform");
              if (platformParam === "instagram") {
                setPostToInstagram(true);
              }
              
              // Handle pending post from product share
              const pendingPost = sessionStorage.getItem('pendingPost');
              if (pendingPost) {
                try {
                  const postData = JSON.parse(pendingPost);
                  
                  // Set message and link
                  setMessage(postData.message || "");
                  setLink(postData.link || "");
                  
                  // Set platform
                  if (postData.platform === "instagram") {
                    setPostToInstagram(true);
                  }
                  
                  // Convert base64 image to File object
                  if (postData.imageData) {
                    fetch(postData.imageData)
                      .then(res => res.blob())
                      .then(blob => {
                        const file = new File([blob], `${postData.productName || 'product'}-preview.png`, { type: 'image/png' });
                        setSelectedImage(file);
                        setImagePreview(postData.imageData);
                      })
                      .catch(err => console.error('Error loading preview image:', err));
                  }
                  
                  // Clear pending post from storage
                  sessionStorage.removeItem('pendingPost');
                  
                  // Switch to posts tab
                  setActiveTab("posts");
                  
                  // Show success message
                  setSuccess(`Product preview loaded! Review and click "Post to ${postData.platform === 'instagram' ? 'Instagram' : 'Facebook'}" when ready.`);
                  
                } catch (error) {
                  console.error('Error loading pending post:', error);
                }
              }
              
              // Handle successful connection
              if (params.get("connected") === "facebook") {
                fetchStatus();
                if (params.get("success") === "1") {
                  setSuccess("Facebook account connected successfully!");
                  // Clear URL parameters
                  window.history.replaceState({}, document.title, window.location.pathname);
                }
              }
              
              // Handle user cancellation
              if (params.get("cancelled") === "1") {
                setError("Facebook connection cancelled. You can try again anytime.");
                // Clear URL parameters
                window.history.replaceState({}, document.title, window.location.pathname);
              }
              
              // Handle other errors
              if (params.get("error") === "1") {
                const errorMessage = params.get("message") || "Facebook connection failed. Please try again.";
                setError(decodeURIComponent(errorMessage));
                // Clear URL parameters
                window.history.replaceState({}, document.title, window.location.pathname);
              }
            }, []);

            const handleConnectFacebook = async () => {
              try {
                setLoading(true);
                setError("");
                const res = await api.get("/social/facebook/redirect");
                const { url } = res.data;
                if (url) {
                  window.location.href = url;
                } else {
                  setError("Failed to get Facebook redirect URL");
                }
              } catch (err) {
                console.error("Failed to start Facebook connect:", err);
                setError("Failed to start Facebook connection. Please try again.");
              } finally {
                setLoading(false);
              }
            };

            const loadPages = async () => {
              try {
                setLoading(true);
                setError("");
                const res = await api.get("/social/facebook/pages");
                const fetchedPages = res.data || [];
                setPages(fetchedPages);
                
                if (fetchedPages.length === 0) {
                  setError("No Facebook Pages found. Please create a Facebook Page first at facebook.com/pages/create, then try again.");
                } else {
                  setSuccess(`Found ${fetchedPages.length} Facebook page(s). Please select one to continue.`);
                }
              } catch (err) {
                console.error("Failed to load Facebook pages:", err);
                setError("Failed to load Facebook pages. Make sure you're connected to Facebook.");
              } finally {
                setLoading(false);
              }
            };

            const selectPage = async (pageId) => {
              try {
                setLoading(true);
                setError("");
                await api.post("/social/facebook/select-page", { page_id: pageId });
                await fetchStatus();
                setSuccess("Page selected successfully!");
                setPages([]); // Clear pages after selection
              } catch (err) {
                console.error("Failed to select page:", err);
                setError("Failed to select page. Please try again.");
              } finally {
                setLoading(false);
              }
            };

            const disconnectFacebook = async () => {
              if (!window.confirm("Are you sure you want to disconnect your Facebook account?")) {
                return;
              }
              try {
                setLoading(true);
                setError("");
                await api.post("/social/facebook/disconnect");
                setFbStatus({ connected: false, page: null });
                setPages([]);
                setSuccess("Facebook account disconnected successfully!");
              } catch (err) {
                console.error("Failed to disconnect Facebook:", err);
                setError("Failed to disconnect Facebook. Please try again.");
              } finally {
                setLoading(false);
              }
            };

            const handleImageSelect = (event) => {
              const file = event.target.files[0];
              if (file) {
                if (file.size > 10 * 1024 * 1024) { // 10MB limit
                  setError("Image size must be less than 10MB");
                  return;
                }
                setSelectedImage(file);
                const reader = new FileReader();
                reader.onload = (e) => setImagePreview(e.target.result);
                reader.readAsDataURL(file);
                setError("");
              }
            };

            const removeImage = () => {
              setSelectedImage(null);
              setImagePreview(null);
            };

            const createPost = async () => {
              if (!message.trim()) {
                setError("Please enter post content");
                return;
              }

              try {
                setPosting(true);
                setError("");
                setSuccess("");

                console.log('Attempting to post with current status:', fbStatus);

                // Create FormData for the post
                const formData = new FormData();
                formData.append('message', message.trim());
                if (link && link.trim()) formData.append('link', link.trim());
                if (selectedImage) formData.append('image', selectedImage);
                formData.append('post_type', postToInstagram ? 'instagram' : 'facebook');

                // Add any available page info (don't require it to be perfect)
                if (fbStatus.page && fbStatus.page.id) {
                  formData.append('page_id', fbStatus.page.id);
                  console.log('Using page ID:', fbStatus.page.id);
                }

                console.log('FormData entries:');
                for (let [key, value] of formData.entries()) {
                  console.log(`${key}:`, value);
                }

                // Try the Facebook post endpoint
                const endpoint = "/social/facebook/post";
                console.log('Attempting to post to endpoint:', endpoint);
                
                const response = await api.post(endpoint, formData, {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                  },
                });
                
                console.log('Post response:', response.data);

                if (response.data.success) {
                  setMessage("");
                  setLink("");
                  setSelectedImage(null);
                  setImagePreview(null);
                  setPostToInstagram(false);
                  setSuccessMessage(`Posted to ${postToInstagram ? 'Instagram' : 'Facebook'} successfully!`);
                  setShowSuccessModal(true);
                } else {
                  setError(`Failed to post to ${postToInstagram ? 'Instagram' : 'Facebook'}: ${response.data.message || 'Unknown error'}`);
                }
              } catch (err) {
                console.error(`Failed to post to ${postToInstagram ? 'Instagram' : 'Facebook'}:`, err);
                console.error('Full error object:', err);
                console.error('Error details:', {
                  status: err.response?.status,
                  statusText: err.response?.statusText,
                  data: err.response?.data,
                  headers: err.response?.headers
                });
                
                const errorMsg = err.response?.data?.message || err.response?.data?.error || err.response?.data?.details;
                const errorCode = err.response?.data?.error_code;
                
                if (err.response?.status === 400) {
                  console.error('400 Bad Request - Full response:', err.response?.data);
                  
                  // Handle specific error codes from backend
                  if (errorCode === 'NO_ACCOUNT') {
                    setError('Facebook not connected. Please go to "Connected Accounts" tab and connect your Facebook account first.');
                  } else if (errorCode === 'NO_PAGES') {
                    setError('No Facebook Pages found. Please create a Facebook Page first, or ensure your Facebook account has page management permissions.');
                  } else if (errorCode === 'NO_PAGE_SELECTED' || (errorMsg && errorMsg.includes('Select a Facebook Page'))) {
                    setError('Loading your Facebook pages...');
                    // Try to refresh status and pages
                    await fetchStatus();
                    await fetchPages();
                    setTimeout(() => {
                      setError('Facebook pages loaded. Please select a page from "Connected Accounts" tab, then try posting again.');
                    }, 2000);
                  } else {
                    setError(`${errorMsg || 'Invalid request. Please check your post content and try again.'}`);
                  }
                } else if (err.response?.status === 401) {
                  setError('Authentication failed. Please reconnect your Facebook account.');
                } else if (err.response?.status === 403) {
                  setError('Permission denied. Please check your Facebook page permissions.');
                } else if (err.response?.status === 404) {
                  setError('API endpoint not found. Please contact support.');
                } else if (err.response?.status === 500) {
                  setError('Server error. Please try again later or contact support.');
                } else {
                  setError(errorMsg || `Failed to post to ${postToInstagram ? 'Instagram' : 'Facebook'}. Please try again.`);
                }
              } finally {
                setPosting(false);
              }
            };

            return (
              <>
                {/* Success Notification Modal */}
                <SuccessNotificationModal
                  show={showSuccessModal}
                  message={successMessage}
                  onClose={() => setShowSuccessModal(false)}
                />
                
                <div className="space-y-3 sm:space-y-4 bg-white p-3 sm:p-4 max-w-[405px] mx-auto sm:max-w-none px-3 sm:px-4 rounded-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Social Media</h1>
                </div>

                {/* Connection Status Banner */}
                <div className={`border rounded-lg p-3 ${
                  fbStatus.connected && fbStatus.page 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {fbStatus.connected && fbStatus.page ? (
                      <>
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-bold text-green-800">Facebook Connected & Page Selected</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="font-bold text-yellow-800">
                          Facebook Status: {fbStatus.connected ? 'Connected - No Page Selected' : 'Not Connected'}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className={`font-medium ${
                      fbStatus.connected && fbStatus.page ? 'text-green-700' : 'text-yellow-700'
                    }`}>
                      {fbStatus.connected && fbStatus.page 
                        ? `Ready to post to: ${fbStatus.page.name || 'Your Page'}`
                        : 'Please connect to Facebook and select a page to enable posting.'
                      }
                    </p>
                    {fbStatus.connected && !fbStatus.page && (
                      <div className="mt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={fetchPages}
                          className="text-xs"
                        >
                          Load Pages
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Error and Success Messages */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-md text-xs sm:text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded-md text-xs sm:text-sm">
                    {success}
                  </div>
                )}

                {/* Information Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="flex-shrink-0">
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-0 sm:ml-3">
                      <h3 className="text-xs sm:text-sm font-medium text-blue-800">
                        How Social Media Linking Works
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>
                          When you connect your social media accounts, you're linking them to your existing CraftConnect account. 
                          This allows you to post content directly from CraftConnect to your social media platforms without creating new accounts.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="accounts">Connected Accounts</TabsTrigger>
                    <TabsTrigger value="posts">Create Posts</TabsTrigger>
                  </TabsList>

                  {/* Connected Accounts */}
                  <TabsContent value="accounts" className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Instagram */}
                      <Card className="rounded-lg sm:rounded-xl overflow-hidden">
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center text-sm sm:text-base">
                            <Instagram className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-pink-500" />
                            Instagram
                          </CardTitle>
                          <CardDescription>
                            Link via Facebook (requires Facebook page with Instagram Business account)
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <span className="font-medium">Status:</span>{" "}
                              {fbStatus.connected && fbStatus.page ? (
                                <span className="text-green-600 font-medium">
                                  Available via Facebook
                                </span>
                              ) : (
                                <span className="text-gray-500 font-medium">
                                  Connect Facebook first
                                </span>
                              )}
                            </div>
                            {fbStatus.connected && fbStatus.page ? (
                              <Button variant="outline" size="sm" disabled>
                                Managed via Facebook
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" disabled>
                                Connect Facebook First
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Facebook */}
                      <Card className="rounded-lg sm:rounded-xl overflow-hidden">
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center text-sm sm:text-base">
                            <Facebook className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
                            Facebook
                          </CardTitle>
                          <CardDescription>Link your existing Facebook account to CraftConnect</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <span className="font-medium">Status:</span>{" "}
                              {fbStatus.connected ? (
                                <span className="text-green-600 font-medium">Connected</span>
                              ) : (
                                <span className="text-gray-500 font-medium">Not Connected</span>
                              )}
                              {fbStatus.page?.name && (
                                <div className="text-xs text-gray-600 mt-1">
                                  Page: 
                                  {fbStatus.page.url ? (
                                    <a 
                                      href={fbStatus.page.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 underline ml-1"
                                    >
                                      {fbStatus.page.name}
                                    </a>
                                  ) : (
                                    <span className="ml-1">{fbStatus.page.name}</span>
                                  )}
                                </div>
                              )}
                            </div>
                            {!fbStatus.connected ? (
                              <Button size="sm" onClick={handleConnectFacebook} disabled={loading}>
                                {loading ? "Linking Account..." : "Link Account"}
                              </Button>
                            ) : (
                              <div className="space-y-3">
                                {fbStatus.page ? (
                                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                      <span className="text-sm font-medium text-green-800">Page Selected</span>
                                    </div>
                                    <p className="text-sm text-green-700">{fbStatus.page.name}</p>
                                  </div>
                                ) : (
                                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                      <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                      </svg>
                                      <span className="text-sm font-medium text-yellow-800">No Page Selected</span>
                                    </div>
                                    <p className="text-sm text-yellow-700 mb-2">You need to select a Facebook page to post content.</p>
                                    <Button variant="outline" size="sm" onClick={loadPages} disabled={loading}>
                                      {loading ? "Loading..." : "Load Pages"}
                                    </Button>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" size="sm" onClick={loadPages} disabled={loading}>
                                    {loading ? "Loading..." : "Manage Pages"}
                                  </Button>
                                  <Button variant="destructive" size="sm" onClick={disconnectFacebook} disabled={loading}>
                                    Disconnect
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                          {pages.length > 0 ? (
                            <div className="mt-4 space-y-2">
                              <div className="text-sm font-medium">Select a Page</div>
                              <div className="flex flex-wrap gap-2">
                                {pages.map((p) => (
                                  <div key={p.id} className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant={fbStatus.page?.id === p.id ? "default" : "outline"}
                                      onClick={() => selectPage(p.id)}
                                    >
                                      {p.name}
                                    </Button>
                                    <a
                                      href={`https://www.facebook.com/${p.id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 text-sm underline"
                                    >
                                      View Page
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : pages.length === 0 && fbStatus.connected && loading === false ? (
                            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                              <div className="text-sm text-amber-800">
                                <p className="font-medium mb-2">No Facebook Pages found</p>
                                <p className="mb-3">You need a Facebook Page to post content. Create one now:</p>
                                <a
                                  href="https://www.facebook.com/pages/create"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block"
                                >
                                  <Button size="sm" variant="outline">
                                    Create Facebook Page
                                  </Button>
                                </a>
                                <p className="text-xs mt-2">After creating a page, click "Manage Pages" again.</p>
                              </div>
                            </div>
                          ) : null}
                        </CardContent>
                      </Card>

                    </div>
                  </TabsContent>

                  {/* Create Post */}
                  <TabsContent value="posts" className="space-y-4 pt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Create Social Media Post</CardTitle>
                        <CardDescription>
                          Create and schedule posts across your social platforms
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="post-text">Post Content</Label>
                          <Textarea
                            id="post-text"
                            placeholder="What would you like to share about your crafts today?"
                            rows={4}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="post-link">Link (Optional)</Label>
                          <Input
                            id="post-link"
                            placeholder="https://example.com/your-product"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500">Add a link to your product or website that will be included in the post</p>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageSelect}
                              className="hidden"
                              id="image-upload"
                            />
                            <Button 
                              variant="outline" 
                              className="flex items-center"
                              onClick={() => document.getElementById('image-upload').click()}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Add Image
                            </Button>
                          </div>
                        </div>

                        {/* Image Preview */}
                        {imagePreview && (
                          <div className="relative inline-block">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-32 h-32 object-cover rounded-lg border"
                            />
                            <button
                              onClick={removeImage}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>Post to</Label>
                          <div className="flex flex-wrap gap-2">
                            <Button 
                              variant={postToInstagram ? "default" : "outline"} 
                              size="sm" 
                              className="flex items-center"
                              onClick={() => setPostToInstagram(!postToInstagram)}
                              disabled={!fbStatus.connected || !fbStatus.page}
                            >
                              <Instagram className="h-4 w-4 mr-2 text-pink-500" />
                              Instagram
                            </Button>
                            <Button 
                              variant={!postToInstagram ? "default" : "outline"} 
                              size="sm" 
                              className="flex items-center"
                              onClick={() => setPostToInstagram(false)}
                              disabled={!fbStatus.connected || !fbStatus.page}
                            >
                              <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                              Facebook
                            </Button>
                          </div>
                          {postToInstagram && (
                            <p className="text-sm text-amber-600">
                              Note: Instagram posts require an image and will be posted to your connected Instagram Business account.
                            </p>
                          )}
                        </div>

                      </CardContent>
                      <CardFooter className="flex justify-end">
                        <div className="space-y-3">
                          {/* Primary Action - Direct Post */}
                          <Button 
                            onClick={createPost} 
                            disabled={posting || (postToInstagram && !selectedImage)}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {posting ? "Posting..." : 
                             postToInstagram && !selectedImage ? "Select Image for Instagram" :
                             `📱 Post to ${postToInstagram ? 'Instagram' : 'Facebook'}`}
                          </Button>
                          
                        </div>
                      </CardFooter>
                    </Card>
                  </TabsContent>

                </Tabs>

                {/* Important Reminder */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Instagram Posting Requirements
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>
                          To post to Instagram, your Facebook page must be connected to an Instagram Business account. 
                          If you don't see Instagram posting options, please:
                        </p>
                        <ul className="mt-2 list-disc list-inside space-y-1">
                          <li>Connect your Facebook page to an Instagram Business account</li>
                          <li>Make sure your Instagram account is set to Business or Creator mode</li>
                          <li>Verify the connection in your Facebook Page settings</li>
                          <li>Refresh this page after making the connection</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </>
            );
          };

          export default SocialMedia;
