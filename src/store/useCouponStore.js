

import { create } from "zustand";
import { toast } from "react-hot-toast";
import { createCouponApi, getCouponsApi ,updateCouponApi,} from "@/services/couponApi";

const useCouponStore = create((set, get) => ({
  coupons: [],
  loading: false,
  error: null,

  /* ================= CREATE COUPON ================= */
  createCoupon: async (formData) => {
    try {
      set({ loading: true, error: null });

      const expiryDate = new Date(formData.expiry);
      expiryDate.setHours(23, 59, 59, 999);

      const isPercentage = formData.offerType === "percentage";

      // ✅ Build payload correctly (NO null values)
      let payload = {
        code: formData.couponCode?.trim(),
        discountType: isPercentage ? "PERCENT" : "FLAT",
        expiresAt: expiryDate.toISOString(),
      };

      if (isPercentage) {
        payload.discountPct = Number(formData.rate);
      } else {
        payload.discountAmount = Number(formData.rate);
      }

      const response = await createCouponApi(payload);

      toast.success(response?.message || "Coupon created successfully");

      // ✅ Refresh coupon list after creation
      await get().fetchCoupons();

      set({ loading: false });

      return response?.data;
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to create coupon";

      toast.error(message);

      set({ loading: false, error: message });
      throw error;
    }
  },

  /* ================= FETCH ALL COUPONS ================= */
  fetchCoupons: async () => {
    try {
      set({ loading: true, error: null });

      const response = await getCouponsApi();

      // Adjust if backend response structure differs
      set({
        coupons: response?.data || response || [],
        loading: false,
      });
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to fetch coupons";

      set({ loading: false, error: message });
    }
  },


  /* ================= UPDATE COUPON ================= */
updateCoupon: async (couponId, updateData) => {
  try {
    set({ loading: true, error: null });

    const payload = {};

    // Only send fields that exist
    if (updateData.isActive !== undefined) {
      payload.isActive = updateData.isActive;
    }

    if (updateData.discountPct) {
      payload.discountPct = Number(updateData.discountPct);
    }

    if (updateData.discountAmount) {
      payload.discountAmount = Number(updateData.discountAmount);
    }

    const response = await updateCouponApi(couponId, payload);

    toast.success(response?.message || "Coupon updated successfully");

    // Refresh list
    await get().fetchCoupons();

    set({ loading: false });

    return response?.data;
  } catch (error) {
    const message =
      error?.response?.data?.message || "Failed to update coupon";

    toast.error(message);

    set({ loading: false, error: message });
    throw error;
  }
},
  /* ================= CLEAR ERROR ================= */
  clearError: () => set({ error: null }),
}));

export default useCouponStore;