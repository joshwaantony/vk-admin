"use client";

import React, { useState, useEffect } from "react";
import { MdEditNote } from "react-icons/md";
// import { RiDeleteBin5Line } from "react-icons/ri";
import CreateCoupon from "@/components/Coupon/CreateCoupon";
import useCouponStore from "@/store/useCouponStore";

function Page() {
  const [openPopup, setOpenPopup] = useState(false);
  const { coupons, fetchCoupons, updateCoupon } = useCouponStore();
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB"); // 16/10/2025 format
  };

  return (
    <>
      <div className="mt-[25px] px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-[27px] text-[#1f304a] font-medium">Coupons</h1>
          <button
            onClick={() => setOpenPopup(true)}
            className="px-4  py-2
            bg-[#1f304a] text-white
            rounded-xl text-[16px] xl:text-[20px]
            transition-colors duration-300
            hover:bg-[#314279]"
          >
            Create new Coupon
          </button>
        </div>

        {/* Coupon Cards */}
        <div className="space-y-2">
          {coupons?.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">
              No coupons available
            </p>
          ) : (
            coupons?.map((coupon) => (
              <div
                key={coupon.id}
                className="p-4 sm:p-5 rounded-[15px]
                grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6
                gap-2 items-center place-items-center text-center mt-5
                bg-[#E3EAF8] border border-[#A9BEE2]
                shadow-[0_4px_10px_rgba(0,0,0,0.12),_0_10px_25px_rgba(169,190,226,0.35)]"
              >
                {/* Coupon Code */}
                <div>
                  <p className="text-xs text-gray-500">Coupon code</p>
                  <p className="font-medium">{coupon.code}</p>
                </div>

                {/* Created Date */}
                <div>
                  <p className="text-xs text-gray-500">Created date</p>
                  <p>{formatDate(coupon.createdAt)}</p>
                </div>

                {/* Offer Type */}
                <div>
                  <p className="text-xs text-gray-500">Offer type</p>
                  <p>
                    {coupon.discountType === "PERCENT"
                      ? "Percentage"
                      : "Fixed Amount"}
                  </p>
                </div>

                {/* Offer Amount */}
                <div>
                  <p className="text-xs text-gray-500">Offer amount</p>
                  <p>
                    {coupon.discountType === "PERCENT"
                      ? `${coupon.discountPct}%`
                      : `₹${coupon.discountAmount}`}
                  </p>
                </div>

                {/* Expiry Date */}
                <div>
                  <p className="text-xs text-gray-500">Expiry date</p>
                  <p>{formatDate(coupon.expiresAt)}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  {/* <button className="text-[22px] text-gray-600 hover:text-red-600">
                    <RiDeleteBin5Line />
                  </button> */}

                  <button
                    onClick={() => {
                      setSelectedCoupon(coupon);
                      setOpenPopup(true);
                    }}
                    className="text-[28px] text-gray-600 hover:text-blue-600"
                  >
                    <MdEditNote />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <CreateCoupon
        isOpen={openPopup}
        couponData={selectedCoupon}
        onClose={() => {
          setOpenPopup(false);
          setSelectedCoupon(null);
          fetchCoupons();
        }}
      />
    </>
  );
}

export default Page;
