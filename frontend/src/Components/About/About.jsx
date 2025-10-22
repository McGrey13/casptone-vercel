import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

const AboutPage = () => {
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
    <div className="min-h-screen bg-white flex items-center justify-center overflow-auto px-4 py-8">
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
