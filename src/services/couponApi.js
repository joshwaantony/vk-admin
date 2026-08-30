import axiosInstance from "./axios";

/* ================= CREATE COUPON ================= */
export const createCouponApi = async (payload) => {
  const res = await axiosInstance.post("/admin/coupons", payload);
  return res.data;
};
/* ================= GET COUPONS ================= */
export const getCouponsApi = async () => {
  const res = await axiosInstance.get("/admin/coupons");
  return res.data;
};

/* ================= UPDATE COUPON ================= */
export const updateCouponApi = async (couponId, payload) => {
  const res = await axiosInstance.patch(
    `/admin/coupons/${couponId}`,
    payload
  );
  return res.data;
};