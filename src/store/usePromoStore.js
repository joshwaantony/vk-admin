
// // import { create } from "zustand";
// // import { getActivePromoApi, createPromoApi } from "@/services/promoApi";

// // const usePromoStore = create((set, get) => ({
// //   activePromo: null,
// //   loading: false,
// //   saving: false,
// //   error: null,

// //   fetchActivePromo: async () => {
// //     try {
// //       set({ loading: true, error: null });

// //       const data = await getActivePromoApi();

// //       set({
// //         activePromo: data?.data ?? data ?? null,
// //       });

// //       return data?.data ?? data ?? null;
// //     } catch (error) {
// //       set({
// //         error: error?.response?.data?.message || "Failed to fetch active promo",
// //       });
// //       return null;
// //     } finally {
// //       set({ loading: false });
// //     }
// //   },

// //   savePromo: async (payload) => {
// //     try {
// //       set({ saving: true, error: null });

// //       const data = await createPromoApi(payload);

// //       const savedPromo = data?.data ?? data ?? null;

// //       set({
// //         activePromo: savedPromo,
// //       });

// //       return { success: true, data: savedPromo };
// //     } catch (error) {
// //       const message =
// //         error?.response?.data?.message || "Failed to save promo";
// //       set({ error: message });
// //       return { success: false, error: message };
// //     } finally {
// //       set({ saving: false });
// //     }
// //   },

// //   clearPromo: () => {
// //     set({
// //       activePromo: null,
// //       error: null,
// //     });
// //   },
// // }));

// // export default usePromoStore;

// import { create } from "zustand";
// import {
//   getActivePromoApi,
//   createPromoApi,
//   getPromoByIdApi,
//   updatePromoApi,
//   deletePromoApi,
// } from "@/services/promoApi";

// const usePromoStore = create((set, get) => ({
//   activePromo: null,
//   promoDetails: null,
//   loading: false,
//   saving: false,
//   error: null,

//   fetchActivePromo: async () => {
//     try {
//       set({ loading: true, error: null });

//       const data = await getActivePromoApi();
//       const promo = data?.data ?? data ?? null;

//       set({
//         activePromo: promo,
//       });

//       return promo;
//     } catch (error) {
//       set({
//         error: error?.response?.data?.message || "Failed to fetch active promo",
//       });
//       return null;
//     } finally {
//       set({ loading: false });
//     }
//   },

//   fetchPromoById: async (promoId) => {
//     try {
//       set({ loading: true, error: null });

//       const data = await getPromoByIdApi(promoId);
//       const promo = data?.data ?? data ?? null;

//       set({
//         promoDetails: promo,
//       });

//       return promo;
//     } catch (error) {
//       set({
//         error: error?.response?.data?.message || "Failed to fetch promo",
//       });
//       return null;
//     } finally {
//       set({ loading: false });
//     }
//   },

//   savePromo: async (payload) => {
//     try {
//       set({ saving: true, error: null });

//       const data = await createPromoApi(payload);
//       const savedPromo = data?.data ?? data ?? null;

//       set({
//         activePromo: savedPromo,
//         promoDetails: savedPromo,
//       });

//       return { success: true, data: savedPromo };
//     } catch (error) {
//       const message =
//         error?.response?.data?.message || "Failed to save promo";
//       set({ error: message });
//       return { success: false, error: message };
//     } finally {
//       set({ saving: false });
//     }
//   },

//   updatePromo: async (promoId, payload) => {
//     try {
//       set({ saving: true, error: null });

//       const data = await updatePromoApi(promoId, payload);
//       const updatedPromo = data?.data ?? data ?? null;

//       set({
//         activePromo: updatedPromo,
//         promoDetails: updatedPromo,
//       });

//       return { success: true, data: updatedPromo };
//     } catch (error) {
//       const message =
//         error?.response?.data?.message || "Failed to update promo";
//       set({ error: message });
//       return { success: false, error: message };
//     } finally {
//       set({ saving: false });
//     }
//   },

//   removePromo: async (promoId) => {
//     try {
//       set({ saving: true, error: null });

//       await deletePromoApi(promoId);

//       set({
//         activePromo: null,
//         promoDetails: null,
//       });

//       return { success: true };
//     } catch (error) {
//       const message =
//         error?.response?.data?.message || "Failed to delete promo";
//       set({ error: message });
//       return { success: false, error: message };
//     } finally {
//       set({ saving: false });
//     }
//   },

//   clearPromo: () => {
//     set({
//       activePromo: null,
//       promoDetails: null,
//       error: null,
//     });
//   },
// }));

// export default usePromoStore;


import { create } from "zustand";
import {
  getActivePromoApi,
  createPromoApi,
  getPromoByIdApi,
  updatePromoApi,
  deletePromoApi,
} from "@/services/promoApi";

const usePromoStore = create((set) => ({
  activePromo: null,
  promoDetails: null,
  loading: false,
  saving: false,
  error: null,

  fetchActivePromo: async () => {
    try {
      set({ loading: true, error: null });

      const data = await getActivePromoApi();
      const promo = data?.data ?? data ?? null;

      set({
        activePromo: promo,
      });

      return promo;
    } catch (error) {
      set({
        error: error?.response?.data?.message || "Failed to fetch active promo",
      });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  fetchPromoById: async (promoId) => {
    try {
      set({ loading: true, error: null });

      const data = await getPromoByIdApi(promoId);
      const promo = data?.data ?? data ?? null;

      set({
        promoDetails: promo,
      });

      return promo;
    } catch (error) {
      set({
        error: error?.response?.data?.message || "Failed to fetch promo",
      });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  savePromo: async (payload) => {
    try {
      set({ saving: true, error: null });

      const data = await createPromoApi(payload);
      const savedPromo = data?.data ?? data ?? null;

      set({
        activePromo: savedPromo,
        promoDetails: savedPromo,
      });

      return { success: true, data: savedPromo };
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to save promo";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ saving: false });
    }
  },

  updatePromo: async (promoId, payload) => {
    try {
      set({ saving: true, error: null });

      const data = await updatePromoApi(promoId, payload);
      const updatedPromo = data?.data ?? data ?? null;

      set({
        activePromo: updatedPromo,
        promoDetails: updatedPromo,
      });

      return { success: true, data: updatedPromo };
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to update promo";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ saving: false });
    }
  },

  removePromo: async (promoId) => {
    try {
      set({ saving: true, error: null });

      await deletePromoApi(promoId);

      set({
        activePromo: null,
        promoDetails: null,
      });

      return { success: true };
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to delete promo";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ saving: false });
    }
  },

  clearPromo: () => {
    set({
      activePromo: null,
      promoDetails: null,
      error: null,
    });
  },
  deletePromo: async (promoId) => {
  set({ loading: true });
  try {
    const res = await axiosInstance.delete(`/admin/promos/${promoId}`);
    return { success: true, data: res.data };
  } catch (error) {
    return {
      success: false,
      error: error?.response?.data?.message || "Failed to delete promo",
    };
  } finally {
    set({ loading: false });
  }
},
}));

export default usePromoStore;