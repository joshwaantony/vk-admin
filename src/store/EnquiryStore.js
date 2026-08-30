import { create } from "zustand";
import {
  getEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
} from "@/services/EnquiryApi";

const useEnquiryStore = create((set) => ({
  enquiries: [],
  page: 1,
  totalPages: 1,
  total: 0,
  limit: 20,
  loading: false,

  fetchEnquiries: async ({ page, limit, status, q }) => {
    try {
      set({ loading: true });

      const data = await getEnquiries({
        page,
        limit,
        status,
        q,
      });

      set({
        enquiries: data.items,
        page: data.page,
        totalPages: data.totalPages,
        total: data.total,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching enquiries", error);
      set({ loading: false });
    }
  },

  fetchEnquiryDetail: async (id) => {
    try {
      const data = await getEnquiryById(id);
      set({ selected: data });
    } catch (error) {
      console.error("Error fetching enquiry detail", error);
    }
  },

  changeStatus: async (id, status) => {
    try {
      const updated = await updateEnquiryStatus(id, status);

      set((state) => ({
        selected: updated,
        enquiries: state.enquiries.map((item) =>
          item.id === id ? updated : item
        ),
      }));
    } catch (error) {
      console.error("Status update failed", error);
    }
  },
}));

export default useEnquiryStore;