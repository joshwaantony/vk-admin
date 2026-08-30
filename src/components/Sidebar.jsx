// "use client";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import React from "react";
// import { CgProfile } from "react-icons/cg";


// function Sidebar() {
//   const pathname = usePathname();
//   const menuItems = [
//     { name: "Dashboard", path: "/dashboard" },
//     { name: "Packages", path: "/packages" },
//     { name: "Courses", path: "/courses" },
//     { name: "Coupons", path: "/coupons" },
//      { name: "Enquiries", path: "/enquiries" },
     
//   ];
//   const isActive = (path) => pathname === path;
//   return (
//     <aside className="w-72 min-h-screen bg-[#1F304A] flex flex-col items-center py-8">
//       {/* Logo */}
//       <div>
//         {/* <img src="/VK-Logo.png" /> */}
//       </div>
//       <Link href="/dashbord" className="mb-6">
//         <h1 className="text-3xl font-bold text-white"></h1>
//       </Link>

//       {/* Profile */}
//       <div className="text-[100px] text-gray-300">
//         {/* <img src="/profile.png" className="rounded-[100%]" /> */}
//         <CgProfile />

//       </div>
//       <div className="flex flex-col items-center mb-8">
//         <p className="mt-4 text-white text-3xl font-semibold">John David</p>
//       </div>

//       {/* Menu */}
//       <nav className="w-full px-6 space-y-3">
//         {menuItems.map((item) => (
//           <Link
//             key={item.name}
//             href={item.path}
//             className={` block w-full text-start px-8 py-4 text-black  rounded-lg transition
//                 ${
//                   isActive(item.path)
//                     ? "bg-[#8BA8D4]  text-white font-semibold"
//                     : "text-white  hover:text-white"
//                 }`}
//           >
//             {item.name}
//           </Link>
//         ))}
//       </nav>
//     </aside>
//   );
// }

// export default Sidebar;

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  CgProfile,
} from "react-icons/cg";

import {
  MdDashboard,
  MdOutlineLocalOffer,
  MdOutlineVideoLibrary,
} from "react-icons/md";

import {
  HiOutlineCube,
  HiOutlineBookOpen,
} from "react-icons/hi";

import { FiMessageSquare } from "react-icons/fi";

function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <MdDashboard size={22} />,
    },
    {
      name: "Packages",
      path: "/packages",
      icon: <HiOutlineCube size={22} />,
    },
    {
      name: "Courses",
      path: "/courses",
      icon: <HiOutlineBookOpen size={22} />,
    },
    {
      name: "Coupons",
      path: "/coupons",
      icon: <MdOutlineLocalOffer size={22} />,
    },
    {
      name: "Enquiries",
      path: "/enquiries",
      icon: <FiMessageSquare size={22} />,
    },

    // NEW LIBRARY SECTION
    {
      name: "VK's Library",
      path: "/library",
      icon: <MdOutlineVideoLibrary size={22} />,
    },
  ];

  const isActive = (path) => pathname === path;

  return (
    <aside className="w-full md:w-72 min-h-screen bg-[#1F304A] flex flex-col items-center py-8">
      {/* Profile */}
      <div className="text-[90px] md:text-[100px] text-gray-300">
        <CgProfile />
      </div>

      <div className="flex flex-col items-center mb-10">
        <p className="mt-2 text-white text-2xl md:text-3xl font-semibold">
          John David
        </p>
      </div>

      {/* Menu */}
      <nav className="w-full px-4 md:px-6 space-y-3">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className={`flex items-center gap-4 w-full px-5 py-4 rounded-xl transition-all duration-200
              ${
                isActive(item.path)
                  ? "bg-[#8BA8D4] text-white font-semibold shadow-md"
                  : "text-white hover:bg-[#2B4162]"
              }
            `}
          >
            <span>{item.icon}</span>

            <span className="text-base">{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;