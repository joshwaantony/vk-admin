import { create } from "zustand";
import {
  fetchCategoriesApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
} from "@/services/categoryApi";

const useCategoryStore = create((set) => ({
  categories: [],
  loading: false,

  fetchCategories: async () => {
    set({ loading: true });
    try {
      const data = await fetchCategoriesApi();
      set({ categories: data });
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      set({ loading: false });
    }
  },

  createCategory: async (payload) => {
    set({ loading: true });
    try {
      await createCategoryApi(payload);
      await useCategoryStore.getState().fetchCategories(); // refresh tree
      return true;
    } finally {
      set({ loading: false });
    }
  },

  updateCategory: async (id, payload) => {
    await updateCategoryApi(id, payload);
    await useCategoryStore.getState().fetchCategories();
  },

  deleteCategory: async (id) => {
    await deleteCategoryApi(id);
    await useCategoryStore.getState().fetchCategories();
  },
}));

export default useCategoryStore;
