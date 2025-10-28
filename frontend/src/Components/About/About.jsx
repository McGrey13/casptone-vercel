import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../ui/button";

const AboutPage = () => {
  const location = useLocation();

  // Handle smooth scrolling to anchor links
  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const element = document.querySelector(location.hash);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    }
  }, [location]);
  const teamMembers = [
    {
      name: "Gio Mc Grey O. Calugas",
      role: "Member",
      bio: ".....",
    },
    {
      name: "Sheweliz M. Antinero",
      role: "Leader",
      bio: ".....",
    },
    {
      name: "Denisse Kaith D. Malabana",
      role: "Member",
      bio: ".....",
    },
  ];

  return (
    <div id="aboutus" className="min-h-screen bg-white flex items-center justify-center overflow-auto px-4 py-8">
      <div className="w-full max-w-7xl">
        {/* Breadcrumb */}
        <div className="flex items-center mb-6 text-sm">
          <Link to="/home" className="text-gray-500 hover:text-primary">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium">About Us</span>
        </div>

        {/* Hero */}
        <div className="relative rounded-lg overflow-hidden mb-12 bg-gradient-to-br from-[#a47c68] to-[#9F2936]">
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="text-center text-white p-6">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Our Story</h1>
              <p className="text-lg max-w-2xl">
                Connecting artisans with customers seeking unique handcrafted treasures
              </p>
            </div>
          </div>
        </div>

        {/* Mission */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-gray-700 mb-4">
              At CraftConnect, our mission is to preserve and promote the rich
              cultural heritage of Laguna's artisans by providing them with a
              digital platform to showcase and sell their handcrafted products
              to a global audience.
            </p>
            <p className="text-gray-700 mb-4">
              We believe in the value of handmade goods and the stories behind
              them. Each product on our platform represents hours of dedication,
              generations of passed-down techniques, and the unique creativity
              of local artisans.
            </p>
            <p className="text-gray-700">
              By connecting these talented craftspeople directly with customers
              who appreciate their work, we aim to create sustainable
              livelihoods for artisans while helping preserve traditional crafts
              for future generations.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Authenticity",
                description:
                  "We celebrate genuine handcrafted products and the authentic stories of the artisans who create them.",
                icon: (
                  <>
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="m7 10 2 2 6-6" />
                  </>
                ),
              },
              {
                title: "Sustainability",
                description:
                  "We promote environmentally responsible practices and support artisans who use sustainable materials and methods.",
                icon: (
                  <>
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </>
                ),
              },
              {
                title: "Community",
                description:
                  "We foster connections between artisans and customers, creating a community that values handcrafted excellence.",
                icon: (
                  <>
                    <path d="M17 6.1H3" />
                    <path d="M21 12.1H3" />
                    <path d="M15.1 18H3" />
                  </>
                ),
              },
            ].map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-[#a47c68]/20 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#a47c68"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {value.icon}
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm">
                <div className="h-48 bg-gradient-to-br from-[#a47c68]/20 to-[#9F2936]/20 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#a47c68] to-[#9F2936] flex items-center justify-center text-white text-4xl font-bold">
                    {member.name.charAt(0)}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg">{member.name}</h3>
                  <p className="text-[#a47c68] text-sm mb-2">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Terms of Service */}
        <div id="terms-of-service" className="mb-12 scroll-mt-20">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🧾</span>
              <h2 className="text-2xl font-bold">Terms of Service</h2>
            </div>
            <p className="text-gray-600 text-sm mb-4">Last Updated: October 2025</p>
            <div className="space-y-4 text-gray-700">
              <p>Welcome to CraftConnect, a web-based marketplace designed for Laguna artisans to showcase and sell their handmade crafts. By accessing or using our platform, you agree to comply with these Terms of Service. Please read them carefully before using CraftConnect.</p>
              <h3 className="font-semibold text-lg">1. Acceptance of Terms</h3>
              <p>By registering, browsing, or purchasing through CraftConnect, you agree to be bound by these Terms. If you do not agree, please discontinue using the platform.</p>
              <h3 className="font-semibold text-lg">2. Platform Overview</h3>
              <p>CraftConnect serves as a digital marketplace connecting artisans (sellers) and customers (buyers). We facilitate transactions but do not own or manufacture listed products.</p>
              <h3 className="font-semibold text-lg">3. Account Registration</h3>
              <p>Users must provide accurate and complete information during registration. Each account is personal and must not be shared. Sellers must ensure all products are handmade and comply with CraftConnect's authenticity standards.</p>
              <h3 className="font-semibold text-lg">4. Use of the Platform</h3>
              <p>You agree not to post or sell counterfeit or prohibited items, engage in fraudulent, abusive, or misleading conduct, or circumvent payment or delivery processes.</p>
              <h3 className="font-semibold text-lg">5. Payments</h3>
              <p>All payments are processed securely through approved methods (e.g., Cash on Delivery or E-Wallet). CraftConnect is not liable for delays caused by third-party payment gateways.</p>
              <h3 className="font-semibold text-lg">6. Intellectual Property</h3>
              <p>All content on CraftConnect — including logos, text, images, and software — is protected by copyright laws. Users retain ownership of their own product photos and descriptions but grant CraftConnect a license to display them for promotional purposes.</p>
              <h3 className="font-semibold text-lg">7. Limitation of Liability</h3>
              <p>CraftConnect acts only as an intermediary. We are not responsible for the quality, safety, or legality of items sold by artisans.</p>
              <h3 className="font-semibold text-lg">8. Termination</h3>
              <p>We reserve the right to suspend or terminate accounts that violate our policies or engage in fraudulent activity.</p>
              <h3 className="font-semibold text-lg">9. Updates to Terms</h3>
              <p>CraftConnect may revise these Terms from time to time. Continued use of the platform signifies acceptance of any changes.</p>
            </div>
          </div>
        </div>

        {/* Privacy Policy */}
        <div id="privacy-policy" className="mb-12 scroll-mt-20">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🔒</span>
              <h2 className="text-2xl font-bold">Privacy Policy</h2>
            </div>
            <p className="text-gray-600 text-sm mb-4">Last Updated: October 2025</p>
            <div className="space-y-4 text-gray-700">
              <p>CraftConnect values your privacy and is committed to protecting your personal information.</p>
              <h3 className="font-semibold text-lg">1. Information We Collect</h3>
              <p>Personal Data: Name, email, phone number, and address (for account creation and delivery). Transaction Data: Orders, payments, and refund history. Usage Data: Login activity, preferences, and browsing behavior.</p>
              <h3 className="font-semibold text-lg">2. Use of Information</h3>
              <p>We collect and process data to facilitate transactions between buyers and sellers, improve system performance and user experience, and send updates, promotions, or notifications (only with consent).</p>
              <h3 className="font-semibold text-lg">3. Data Protection</h3>
              <p>We implement encryption, secure payment gateways, and strict access controls. Your information will never be sold or shared with third parties without consent, except when required by law.</p>
              <h3 className="font-semibold text-lg">4. Cookies</h3>
              <p>CraftConnect uses cookies to improve functionality and personalize the user experience.</p>
              <h3 className="font-semibold text-lg">5. User Rights</h3>
              <p>You may request to update, access, or delete your personal data at any time through your account settings or by contacting our support team.</p>
            </div>
          </div>
        </div>

        {/* Shipping Policy */}
        <div id="shipping-policy" className="mb-12 scroll-mt-20">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🚚</span>
              <h2 className="text-2xl font-bold">Shipping Policy</h2>
            </div>
            <p className="text-gray-600 text-sm mb-4">Last Updated: October 2025</p>
            <div className="space-y-4 text-gray-700">
              <p>CraftConnect supports local shipping across the province of Laguna, managed directly by artisans.</p>
              <h3 className="font-semibold text-lg">1. Processing Time</h3>
              <p>Orders are processed within 3–5 business days after confirmation. Custom-made items may require additional time.</p>
              <h3 className="font-semibold text-lg">2. Delivery</h3>
              <p>Deliveries are handled through local couriers or seller-managed delivery services. Real-time order tracking is available on the platform. Customers will be notified once their orders are shipped.</p>
              <h3 className="font-semibold text-lg">3. Shipping Fees</h3>
              <p>Shipping costs are computed at checkout and may vary depending on location and courier rates.</p>
              <h3 className="font-semibold text-lg">4. Failed Delivery</h3>
              <p>If a delivery attempt fails due to incorrect address or unavailability, customers may contact the seller for re-delivery options (additional fees may apply).</p>
            </div>
          </div>
        </div>

        {/* Returns & Refunds Policy */}
        <div id="returns-refunds" className="mb-12 scroll-mt-20">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">💰</span>
              <h2 className="text-2xl font-bold">Returns & Refunds Policy</h2>
            </div>
            <p className="text-gray-600 text-sm mb-4">Last Updated: October 2025</p>
            <div className="space-y-4 text-gray-700">
              <p>CraftConnect ensures customer satisfaction while supporting fair artisan practices.</p>
              <h3 className="font-semibold text-lg">1. Eligibility for Return or Refund</h3>
              <p>Returns or refunds may be requested if the item arrives damaged or defective, the item is lost during shipping, or the product received is significantly different from its description.</p>
              <h3 className="font-semibold text-lg">2. Request Procedure</h3>
              <p>Report the issue within 5 calendar days of delivery. Provide photo or video proof of the issue. Items must be unused and kept in their original packaging.</p>
              <h3 className="font-semibold text-lg">3. Processing</h3>
              <p>Approved refunds are issued within 7–14 business days to the original payment method. Partial refunds may apply if the item shows signs of use, alteration, or missing parts.</p>
              <h3 className="font-semibold text-lg">4. Non-Refundable Items</h3>
              <p>Custom-made or personalized products are not eligible for return unless defective.</p>
              <h3 className="font-semibold text-lg">5. Support</h3>
              <p>Contact our Help Center for assistance. CraftConnect and the seller will coordinate to find a fair resolution (refund, replacement, or repair).</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#a47c68] text-white rounded-lg p-8 text-center mb-12">
          <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Whether you're an artisan looking to showcase your craft or a customer
            seeking unique handmade treasures, we invite you to be part of our growing
            community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="secondary">
              <Link to="/contact">Contact Us</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white/10"
            >
              <Link to="/artisans">Meet Our Artisans</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
