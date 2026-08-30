"use client";
import React, { useState } from "react";
import useAuthStore from "@/store/useAuthStore";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";

function Page() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login, loading, error } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (phone.length !== 10) {
      setPhoneError("Please enter a valid 10-digit mobile number");
      toast.error("Invalid mobile number");
      return;
    }

    if (!password) {
      toast.error("Password is required");
      return;
    }

    setPhoneError("");

    const result = await login(`+91${phone}`, password);

    if (result.success) {
      toast.success("Login successful");
      window.location.href = "/admin/dashboard";
    } else {
      toast.error(result.message || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-[#ecf1fe] pt-[50px] p-[25px]">
      <div className="text-center">
        <Image
          src="/admin/vklogo.png"
          alt="Logo"
          width={120}
          height={120}
          className="mx-auto"
        />

        {/* <img src="VK-Logo.png" className="mx-auto" /> */}
        <h1 className="text-[32px] font-bold">Admin Login</h1>
        <p>Access the admin dashboard</p>
      </div>

      <form
        onSubmit={handleLogin}
        className="sm:w-[420px] bg-white mx-auto px-[45px] py-[40px] mt-[30px] rounded-[20px] shadow-2xl"
      >
        {/* Phone Number */}
        <label className="text-[14px] font-semibold">Phone Number</label>

        <div className="flex my-[15px]">
          <span className="flex items-center px-4  border border-r-0 border-[#7c7d98] rounded-l-[10px] text-gray-700">
            +91
          </span>

          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              if (value.length <= 10) setPhone(value);
            }}
            className="w-full h-[48px] bg-[#f8fafc] border  border-[#7c7d98] rounded-r-[10px] px-[15px] outline-none"
          />
        </div>

        {phoneError && (
          <p className="text-red-600 text-sm mb-2">{phoneError}</p>
        )}

        {/* Password */}
        <label className="text-[14px] font-semibold">Password</label>

        <div className="relative mt-[15px]">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-[48px] bg-[#f8fafc] border border-[#7c7d98]  outline-none rounded-[10px] px-[15px] pr-[45px]"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2  text-gray-600"
          >
            {showPassword ? (
              <AiOutlineEyeInvisible size={20} />
            ) : (
              <AiOutlineEye size={20} />
            )}
          </button>
        </div>

        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-[20px] bg-[#1f304a] text-white py-[10px] rounded-[10px] disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Page;
