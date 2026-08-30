"use client";

import React, { useState } from "react";
import { IoIosSettings } from "react-icons/io";
import { RiLogoutBoxRFill } from "react-icons/ri";
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

function Navbar() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.replace("/");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <div className="flex justify-between items-center px-10 py-3 border-b shadow-sm border-blue-50">
        <div>
          <h1 className="text-[22px] xl:text-[26px] text-[#1f285b] font-semibold">
            Welcome, {user?.name || "User"}
          </h1>
        </div>

        <div className="flex justify-center gap-[30px] xl:gap-[50px]">
          <button className="text-[#606060] flex items-center gap-[3px] text-[15px]">
            <IoIosSettings className="size-[24px]" /> Settings
          </button>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="text-[#606060] flex items-center gap-[3px] text-[15px]"
          >
            <RiLogoutBoxRFill className="size-[24px]" /> Logout
          </button>
        </div>
      </div>

      {/* ================= LOGOUT MODAL ================= */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-[400px] rounded-xl shadow-lg p-6">

            <h2 className="text-lg font-semibold text-[#1f285b] mb-2">
              Confirm Logout
            </h2>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to logout?
            </p>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-5 py-2 rounded-lg bg-gray-300 text-gray-700"
              >
                Cancel
              </button>

              <button
                onClick={handleLogout}
                className="px-5 py-2 rounded-lg bg-red-600 text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;



