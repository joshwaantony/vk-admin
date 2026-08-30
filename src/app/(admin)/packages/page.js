"use client";
import { useState } from "react";
import CreatePackageModal from "@/components/Package/CreatePackageModal";
import PackageItem from "@/components/Package/PackageItem";

export default function Page() {
  const [packages, setPackages] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  const addPackage = (name) => {
    setPackages([...packages, { id: Date.now(), name, subPackages: [] }]);
  };

  const addSubPackage = (parentId, name) => {
    setPackages((prev) =>
      prev.map((pkg) =>
        pkg.id === parentId
          ? {
              ...pkg,
              subPackages: [...pkg.subPackages, { id: Date.now(), name }],
            }
          : pkg,
      ),
    );
  };

  return (
    <div className="px-8 mt-[25px]">
      <div className="flex justify-between mb-2 xl:mb-4">
        <h1 className="text-[27px] text-[#1f304a] font-medium">Course Type</h1>
        <button
          onClick={() => setShowPopup(true)}
          className="px-6 xl:px-10 py-3 bg-[#1f304a] text-white rounded-xl text-[18px] xl:text-[20px]"
        >
          Create new package
        </button>
      </div>

      <div className="overflow-scroll">
        <PackageItem packages={packages} addSubPackage={addSubPackage} />
      </div>

      {showPopup && (
        <CreatePackageModal
          onClose={() => setShowPopup(false)}
          onCreate={addPackage}
        />
      )}
    </div>
  );
}
