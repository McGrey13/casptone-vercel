import React from "react";
import {
  FaCog,
  FaWallet,
  FaBox,
  FaTruck,
  FaStar,
  FaHeart,
  FaShoppingBag,
  FaClock,
  FaQuestionCircle,
  FaComments,
} from "react-icons/fa";

const ProfilePagee = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-10">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#a4785a] to-[#b68d72] text-white p-6 mx-4 rounded-3xl shadow-lg relative">
        <div className="flex items-center justify-between">
          <button className="bg-white text-[#a4785a] px-6 py-2 rounded-full text-sm font-semibold shadow hover:scale-105 hover:bg-gray-100 transition transform">
            Start Selling
          </button>
          <FaCog className="text-2xl cursor-pointer hover:rotate-90 transition-transform duration-300" />
        </div>

        {/* Profile Info */}
        <div className="flex items-center mt-8">
          <img
            src="https://via.placeholder.com/80"
            alt="profile"
            className="w-24 h-24 rounded-full border-4 border-white shadow-md"
          />
          <div className="ml-5">
            <h2 className="text-2xl font-bold">CraftConnect_</h2>
            <span className="bg-gray-900 text-xs px-3 py-1 rounded-full inline-block mt-1">
              Platinum
            </span>
            <p className="text-sm mt-2 opacity-90">
              <span className="font-semibold">0</span> Follower |{" "}
              <span className="font-semibold">14</span> Following
            </p>
          </div>
        </div>
      </div>

      {/* My Purchases Section */}
      <div className="bg-white mt-8 mx-4 p-6 rounded-3xl shadow-md hover:shadow-lg transition">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-gray-800 text-lg">My Purchases</h3>
          <button className="text-[#a4785a] text-sm font-medium hover:underline hover:opacity-80">
            View History
          </button>
        </div>

        {/* Purchase Options */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-gray-600">
          <div className="hover:text-[#a4785a] transition cursor-pointer">
            <div className="bg-gray-100 p-4 rounded-xl hover:bg-[#f3eae4] transition">
              <FaWallet className="mx-auto text-3xl mb-2" />
              <p className="text-sm font-medium">To Pay</p>
            </div>
          </div>

          <div className="hover:text-[#a4785a] transition cursor-pointer">
            <div className="bg-gray-100 p-4 rounded-xl hover:bg-[#f3eae4] transition">
              <FaBox className="mx-auto text-3xl mb-2" />
              <p className="text-sm font-medium">To Ship</p>
            </div>
          </div>

          <div className="hover:text-[#a4785a] transition cursor-pointer">
            <div className="bg-gray-100 p-4 rounded-xl hover:bg-[#f3eae4] transition">
              <FaTruck className="mx-auto text-3xl mb-2" />
              <p className="text-sm font-medium">To Receive</p>
            </div>
          </div>

          <div className="hover:text-[#a4785a] transition cursor-pointer">
            <div className="bg-gray-100 p-4 rounded-xl hover:bg-[#f3eae4] transition">
              <FaStar className="mx-auto text-3xl mb-2" />
              <p className="text-sm font-medium">To Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* More Activities Section */}
      <div className="bg-white mt-6 mx-4 p-6 rounded-3xl shadow-md hover:shadow-lg transition">
        <h3 className="font-semibold text-gray-800 mb-4 text-lg">
          More Activities
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded-xl flex items-center justify-between hover:bg-[#a4785a]/10 cursor-pointer transition">
            <span className="font-medium">Shopee Loyalty</span>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
              Platinum
            </span>
          </div>

          <div className="p-4 border rounded-xl flex items-center justify-between hover:bg-[#a4785a]/10 cursor-pointer transition">
            <span className="font-medium">My Likes</span>
            <FaHeart className="text-[#a4785a] text-lg" />
          </div>

          <div className="p-4 border rounded-xl flex items-center justify-between hover:bg-[#a4785a]/10 cursor-pointer transition">
            <span className="font-medium">Buy Again</span>
            <FaShoppingBag className="text-[#a4785a] text-lg" />
          </div>

          <div className="p-4 border rounded-xl flex items-center justify-between hover:bg-[#a4785a]/10 cursor-pointer transition">
            <span className="font-medium">Recently Viewed</span>
            <FaClock className="text-[#a4785a] text-lg" />
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="bg-white mt-6 mx-4 p-6 rounded-3xl shadow-md hover:shadow-lg transition">
        <h3 className="font-semibold text-gray-800 mb-4 text-lg">Support</h3>
        <div className="flex flex-col gap-4">
          <div className="flex items-center p-4 border rounded-xl hover:bg-[#a4785a]/10 cursor-pointer transition">
            <FaQuestionCircle className="text-[#a4785a] text-lg mr-3" />
            <span className="font-medium">Help Centre</span>
          </div>
          <div className="flex items-center p-4 border rounded-xl hover:bg-[#a4785a]/10 cursor-pointer transition">
            <FaComments className="text-[#a4785a] text-lg mr-3" />
            <span className="font-medium">Chat with CraftConnect</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePagee;
