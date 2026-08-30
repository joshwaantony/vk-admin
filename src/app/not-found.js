"use client";

import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#020617] px-6">
      
      <div className="text-center max-w-xl">
        
        {/* 404 TEXT */}
        <h1 className="text-7xl md:text-8xl font-bold text-blue-600 mb-4">
          404
        </h1>

        {/* TITLE */}
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white mb-3">
          Page Not Found
        </h2>

        {/* DESCRIPTION */}
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Sorry, the page you are looking for doesn’t exist or has been moved.
          Try going back to the homepage.
        </p>

        {/* ACTION BUTTONS */}
        <div className="flex items-center justify-center gap-4">
          
          <Link
            href="/"
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            <ArrowLeft size={18} />
            Back Home
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 px-6 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <Search size={18} />
            Explore
          </Link>

        </div>

      </div>
    </div>
  );
}