import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => (
  <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#f9f4ef] via-[#eadfd2] to-[#d3bfa8] font-sans text-[#3b2a1f]">
    {/* Header */}
    <header className="w-full bg-white/90 backdrop-blur-md sticky top-0 z-50 flex flex-col md:flex-row items-center justify-between px-10 py-5 shadow-sm border-b border-[#a4785a]/10">
      <div className="flex items-center gap-3">
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="6" fill="#a4785a" />
          <path
            d="M12 7.5C10.067 7.5 8.5 9.067 8.5 11C8.5 13.5 12 16.5 12 16.5C12 16.5 15.5 13.5 15.5 11C15.5 9.067 13.933 7.5 12 7.5Z"
            fill="white"
          />
        </svg>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#a4785a]">
            CraftConnect
          </h1>
          <p className="text-xs text-[#3b2a1f]/80 -mt-1 tracking-wide">
            Artisan Marketplace
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex items-center gap-8 mt-4 md:mt-0 font-medium">
        <Link
          to="/artisan"
          className="text-[#3b2a1f] hover:text-[#a4785a] visited:text-[#3b2a1f] focus:text-[#3b2a1f] active:text-[#3b2a1f] transition-colors"
        >
          Artisans
        </Link>
        <Link
          to="/about"
          className="text-[#3b2a1f] hover:text-[#a4785a] visited:text-[#3b2a1f] focus:text-[#3b2a1f] active:text-[#3b2a1f] transition-colors"
        >
          About
        </Link>
        <Link
          to="/login"
          className="text-[#3b2a1f] hover:text-[#a4785a] visited:text-[#3b2a1f] focus:text-[#3b2a1f] active:text-[#3b2a1f] transition-colors"
        >
          Sign In
        </Link>
        <Link
          to="/register"
          className="ml-2 px-5 py-2 bg-[#a4785a] text-white rounded-lg font-semibold hover:bg-[#8b5f46] hover:scale-105 transition-all duration-200 shadow-sm"
        >
          Join as Artisan
        </Link>
      </nav>
    </header>

    {/* Hero Section */}
    <main className="flex-1 relative flex flex-col items-center justify-center text-center px-6 py-28 overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/beige-paper.png')] opacity-30"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-[#f6eadd]/70 via-[#e2c9a8]/60 to-[#a4785a]/50"></div>
      <div className="relative z-10 max-w-3xl">
        <h1 className="text-5xl md:text-6xl font-extrabold text-[#3b2a1f] mb-6 leading-tight">
          Begin Your Artisan Journey
        </h1>
        <p className="text-lg md:text-xl text-[#4a3729]/90 mb-10 leading-relaxed">
          Join a thriving community of creators and collectors — celebrating
          craftsmanship, culture, and authenticity from Laguna and beyond.
        </p>
        <div className="flex flex-col md:flex-row gap-5 justify-center">
          <Link
            to="/home"
            className="px-8 py-3 bg-[#a4785a] text-white font-semibold rounded-lg shadow-md hover:bg-[#8b5f46] hover:scale-105 transition-transform duration-200"
          >
            Explore Collections
          </Link>
          <Link
            to="/register"
            className="px-8 py-3 bg-white text-[#3b2a1f] font-semibold rounded-lg border border-[#a4785a]/60 hover:bg-[#a4785a] hover:text-white hover:scale-105 transition-all duration-200"
            style={{ color: '#3b2a1f' }}
          >
            Become an Artisan
          </Link>
        </div>
      </div>
    </main>

    {/* Why Choose Section */}
    <section className="w-full bg-[#fffaf5] py-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-extrabold mb-4 text-[#3b2a1f]">
          Why Choose <span className="text-[#a4785a]">CraftConnect</span>
        </h2>
        <p className="text-lg text-[#5a4630]/90 mb-14">
          We empower artisans to share their craft and connect with a global
          audience.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              title: "Authentic Craftsmanship",
              desc: "Every piece is handmade with passion, preserving Laguna’s rich artisan heritage.",
            },
            {
              title: "Quality & Trust",
              desc: "Our curation process ensures every item reflects genuine artistry and excellence.",
            },
            {
              title: "Global Reach",
              desc: "We connect local artisans to a worldwide community of collectors and enthusiasts.",
            },
          ].map((card, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm p-8 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 border border-[#a4785a]/10"
            >
              <div className="bg-[#a4785a]/10 w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-5">
                <svg width="28" height="28" fill="#a4785a" viewBox="0 0 24 24">
                  <path d="M12 7.5C10.067 7.5 8.5 9.067 8.5 11C8.5 13.5 12 16.5 12 16.5C12 16.5 15.5 13.5 15.5 11C15.5 9.067 13.933 7.5 12 7.5Z" />
                </svg>
              </div>
              <h3 className="font-bold text-xl text-[#a4785a] mb-3">
                {card.title}
              </h3>
              <p className="text-[#3b2a1f]/80 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="bg-[#f0e2d1] text-[#3a2a1a] pt-12 pb-5 px-6 border-t border-[#a4785a]/20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 pb-10">
        <div>
          <div className="flex items-center mb-3">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="6" fill="#a4785a" />
              <path
                d="M12 7.5C10.067 7.5 8.5 9.067 8.5 11C8.5 13.5 12 16.5 12 16.5C12 16.5 15.5 13.5 15.5 11C15.5 9.067 13.933 7.5 12 7.5Z"
                fill="white"
              />
            </svg>
            <h3 className="ml-2 text-2xl font-bold text-[#a4785a]">
              CraftConnect
            </h3>
          </div>
          <p className="text-sm text-[#3a2a1a]/80 leading-relaxed">
            Empowering Filipino artisans through technology — bridging heritage
            and modern craftsmanship.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-[#a4785a] mb-3">Marketplace</h4>
          <ul className="space-y-1 text-sm">
            <li><a href="#" className="hover:text-[#3b2a1f] text-[#a4785a]">Ceramics & Pottery</a></li>
            <li><a href="#" className="hover:text-[#3b2a1f] text-[#a4785a]">Textiles & Weaving</a></li>
            <li><a href="#" className="hover:text-[#3b2a1f] text-[#a4785a]">Jewelry & Metalwork</a></li>
            <li><a href="#" className="hover:text-[#3b2a1f] text-[#a4785a]">Wood & Sculpture</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-[#a4785a] mb-3">Support</h4>
          <ul className="space-y-1 text-sm">
            <li><a href="#" className="hover:text-[#3b2a1f] text-[#a4785a]">Collector Services</a></li>
            <li><a href="#" className="hover:text-[#3b2a1f] text-[#a4785a]">Artisan Resources</a></li>
            <li><a href="#" className="hover:text-[#3b2a1f] text-[#a4785a]">Authentication</a></li>
            <li><a href="#" className="hover:text-[#3b2a1f] text-[#a4785a]">Contact Us</a></li>
          </ul>
        </div>
      </div>
      <div className="text-center text-xs text-[#3b2a1f]/70 mt-6">
        © 2025 CraftConnect — Celebrating Filipino craftsmanship.
      </div>
    </footer>
  </div>
);

export default LandingPage;
