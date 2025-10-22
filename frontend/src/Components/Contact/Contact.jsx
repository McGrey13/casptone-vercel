import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";
import { MapPin, Phone, Mail, Clock, Send, AlertCircle } from "lucide-react";
import api from "../../api";
import { useUser } from "../Context/UserContext";

const ContactPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Auto-fill name and email if user is logged in, or restore saved form data
  useEffect(() => {
    if (user) {
      // Check if there's saved form data from before login
      const savedFormData = sessionStorage.getItem('contactFormData');
      if (savedFormData) {
        try {
          const parsed = JSON.parse(savedFormData);
          setFormData({
            name: user.userName || "",
            email: user.userEmail || "",
            subject: parsed.subject || "",
            message: parsed.message || "",
          });
          sessionStorage.removeItem('contactFormData');
        } catch (e) {
          // If parsing fails, just auto-fill name and email
          setFormData(prev => ({
            ...prev,
            name: user.userName || "",
            email: user.userEmail || "",
          }));
        }
      } else {
        // Auto-fill name and email from user data
        setFormData(prev => ({
          ...prev,
          name: user.userName || "",
          email: user.userEmail || "",
        }));
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate message has at least 10 words
  const validateMessage = (message) => {
    const words = message.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length >= 10;
  };

  // Count words in message
  const countWords = (message) => {
    const words = message.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in before submitting
    if (!user) {
      // Store the current page to redirect back after login
      sessionStorage.setItem('redirectAfterLogin', '/contact');
      // Store the form data so user doesn't lose their message
      sessionStorage.setItem('contactFormData', JSON.stringify(formData));
      navigate('/login');
      return;
    }
    
    setIsSubmitting(true);
    setError("");

    // Validate message word count
    if (!validateMessage(formData.message)) {
      setError("Message must contain at least 10 words.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await api.post("/contact", formData);
      
      if (response.data.success) {
        setIsSubmitted(true);
        // Clear saved form data
        sessionStorage.removeItem('contactFormData');
        // Reset only subject and message, keep name and email if logged in
        setFormData(prev => ({ 
          ...prev,
          subject: "", 
          message: "" 
        }));
      }
    } catch (err) {
      console.error("Contact form error:", err);
      setError(
        err.response?.data?.message || 
        "Failed to send message. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Define the FAQs data with both questions and answers
  const faqs = [
    {
      question: "How can I become a seller?",
      answer: "You can become a seller by registering on our website and submitting an application. We review each application to ensure all artisans create authentic, handcrafted products that align with our community's values."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept various secure payment options for your convenience, including major credit and debit cards, popular e-wallets like GCash and PayMaya, and bank transfers."
    },
    {
      question: "How long does shipping take?",
      answer: "Shipping times typically range from 3 to 7 business days, depending on your location. We provide a tracking number for every order so you can monitor your package's journey from the artisan's hands to your doorstep."
    },
    {
      question: "What is your return policy?",
      answer: "We want you to be completely satisfied with your purchase. If you receive a damaged or incorrect item, you can request a return or exchange within 7 days of delivery. The item must be in its original packaging."
    }
  ];

  const wordCount = countWords(formData.message);
  const isMessageValid = wordCount >= 10;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6 text-sm">
          <Link to="/" className="text-gray-500 hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <span className="font-medium">Contact Us</span>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2">Get In Touch</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Have questions about our platform, artisans, or products? We're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="mr-3 mt-1"><MapPin className="h-5 w-5 text-[#a47c68]" /></div>
                    <div>
                      <h3 className="font-medium">Our Location</h3>
                      <p className="text-gray-600 text-sm">BLK 71 Lot 52 Mabuhay City Phase 1, Barangay Baclaran, Cabuyao</p>
                    </div>
                  </div>
                  <div className="flex items-start">6
                    <div className="mr-3 mt-1"><Phone className="h-5 w-5 text-[#a47c68]" /></div>
                    <div>
                      <h3 className="font-medium">Phone Number</h3>
                      <p className="text-gray-600 text-sm">+63 921 226 6566</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="mr-3 mt-1"><Mail className="h-5 w-5 text-[#a47c68]" /></div>
                    <div>
                      <h3 className="font-medium">Email Address</h3>
                      <p className="text-gray-600 text-sm">craftconnect49@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="mr-3 mt-1"><Clock className="h-5 w-5 text-[#a47c68]" /></div>
                    <div>
                      <h3 className="font-medium">Business Hours</h3>
                      <p className="text-gray-600 text-sm">Mon-Fri: 9am-6pm, Sat: 9am-12pm, Sun: Closed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Connect With Us</h2>
                <div className="flex space-x-4">
                  {["Facebook", "Instagram", "Twitter"].map((name, i) => (
                    <a key={i} href="#" className="w-10 h-10 rounded-full bg-[#a47c68]/10 flex items-center justify-center hover:bg-[#a47c68] hover:text-white transition-colors" aria-label={name}>
                      <span className="text-sm font-bold uppercase">{name[0]}</span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Send Us a Message</h2>
                {isSubmitted ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <h3 className="text-lg font-medium text-green-800 mb-2">Message Sent!</h3>
                    <p className="text-green-700 mb-4">We'll get back to you as soon as possible.</p>
                    <Button onClick={() => setIsSubmitted(false)} variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">Send Another</Button>
                  </div>
                ) : (
                  <>
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-red-700 text-sm">{error}</p>
                      </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                    {!user && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <p className="text-blue-800 text-sm">
                          📝 You can fill out the form, but you'll need to log in to submit it.
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name</Label>
                        <Input 
                          id="name" 
                          name="name" 
                          value={formData.name} 
                          onChange={handleChange} 
                          required 
                          disabled={user ? true : false}
                          className={user ? "bg-gray-50 cursor-not-allowed" : ""}
                        />
                        {user && <p className="text-xs text-gray-500">Auto-filled from your account</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          name="email" 
                          type="email" 
                          value={formData.email} 
                          onChange={handleChange} 
                          required 
                          disabled={user ? true : false}
                          className={user ? "bg-gray-50 cursor-not-allowed" : ""}
                        />
                        {user && <p className="text-xs text-gray-500">Auto-filled from your account</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">
                        Message
                        <span className="ml-2 text-sm font-normal text-gray-500">
                          ({wordCount}/10 words minimum)
                        </span>
                      </Label>
                      <Textarea 
                        id="message" 
                        name="message" 
                        rows="6" 
                        value={formData.message} 
                        onChange={handleChange} 
                        required 
                        className={wordCount > 0 && !isMessageValid ? "border-red-300 focus:border-red-500" : ""}
                      />
                      {wordCount > 0 && !isMessageValid && (
                        <div className="flex items-center text-xs text-red-600 mt-1">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          <span>Please write at least {10 - wordCount} more word{10 - wordCount > 1 ? 's' : ''}</span>
                        </div>
                      )}
                      {isMessageValid && (
                        <p className="text-xs text-green-600 mt-1">✓ Message length is sufficient</p>
                      )}
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting || (!user ? false : !isMessageValid)}
                    >
                      {isSubmitting ? "Sending..." : (
                        !user ? (
                          <><Send className="mr-2 h-4 w-4" /> Login to Send Message</>
                        ) : (
                          <><Send className="mr-2 h-4 w-4" /> Send Message</>
                        )
                      )}
                    </Button>
                    {user && !isMessageValid && wordCount > 0 && (
                      <p className="text-xs text-center text-gray-500 mt-2">
                        Complete the message requirement to send
                      </p>
                    )}
                    {!user && (
                      <p className="text-xs text-center text-blue-600 mt-2">
                        Click submit to log in and send your message
                      </p>
                    )}
                  </form>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Find Us</h2>
          <div className="rounded-lg overflow-hidden h-[400px] bg-gray-200 flex items-center justify-center">
            <MapPin className="h-12 w-12 text-[#a47c68] mx-auto mb-2" />
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">FAQs</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-medium text-lg mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;