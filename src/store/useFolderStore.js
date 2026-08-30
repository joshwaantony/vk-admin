//store/useFolderStore.js
import { create } from "zustand";
import { getVideoFolders } from "@/services/videoFolder.service";

const useFolderStore = create((set, get) => ({
  folders: [],
  loading: false,

  // 🔥 FETCH ALL FOLDERS
  fetchFolders: async () => {
    try {
      set({ loading: true });

      const data = await getVideoFolders();

      set({ folders: Array.isArray(data) ? data : [] });
    } catch (error) {
      console.error("FETCH FOLDERS ERROR:", error);
      set({ folders: [] });
    } finally {
      set({ loading: false });
    }
  },

  // 🔥 ADD NEW FOLDER (optional optimistic update)
  addFolder: (folder) => {
    set((state) => ({
      folders: [folder, ...state.folders],
    }));
  },

  // 🔥 RESET (optional)
  clearFolders: () => set({ folders: [] }),
}));

export default useFolderStore;