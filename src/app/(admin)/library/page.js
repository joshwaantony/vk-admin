//app/admin/library/page.js
"use client";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  FiSearch,
  FiPlus,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import { HiOutlineFolder } from "react-icons/hi";
import { FiImage } from "react-icons/fi";

import UploadVideoModal from "@/components/Library/UploadVideoModal";
import CreateFolderModal from "@/components/Library/CreateFolderModal";

import {
  getLibraryVideos,
  deleteVideoApi,
} from "@/services/video.service";
import {
  getVideoFolders,
  deleteVideoFolder,
} from "@/services/videoFolder.service";

const PAGE_LIMIT = 20;

/* ============================================================
   DELETE FOLDER CONFIRMATION MODAL
   ============================================================ */
function DeleteFolderModal({ open, folderName, onClose, onConfirm, deleting }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-[#1F304A]">Delete Folder</h2>

        <p className="mt-3 text-sm text-gray-600 leading-6">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-gray-900">
            {folderName || "this folder"}
          </span>
          ? Videos inside this folder will move to Uncategorized.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={deleting}
            className="rounded-xl bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={deleting}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   DELETE VIDEO CONFIRMATION MODAL
   ============================================================ */
function DeleteVideoModal({ open, videoTitle, onClose, onConfirm, deleting }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-[#1F304A]">Delete Video</h2>

        <p className="mt-3 text-sm text-gray-600 leading-6">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-gray-900">
            {videoTitle || "this video"}
          </span>
          ? This action cannot be undone and may affect any course or promo
          currently using this video.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={deleting}
            className="rounded-xl bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={deleting}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   THUMBNAIL WITH GRACEFUL FALLBACK
   ============================================================ */
function VideoThumbnail({ src, alt }) {
  const [failed, setFailed] = useState(!src);

  useEffect(() => {
    setFailed(!src);
  }, [src]);

  if (failed) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400">
        <FiImage className="text-3xl" />
        <p className="mt-2 text-xs">No thumbnail</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="w-full h-full object-cover"
    />
  );
}

/* ============================================================
   PAGINATION
   ============================================================ */
function Pagination({ page, totalPages, onPageChange, disabled }) {
  if (totalPages <= 1) return null;

  // Build a windowed page list: 1 ... (p-1) p (p+1) ... totalPages
  const pages = [];
  const window = 1;
  const start = Math.max(2, page - window);
  const end = Math.min(totalPages - 1, page + window);

  pages.push(1);
  if (start > 2) pages.push("…");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push("…");
  if (totalPages > 1) pages.push(totalPages);

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1 || disabled}
        className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-100"
      >
        <FiChevronLeft />
        Previous
      </button>

      {pages.map((p, idx) =>
        p === "…" ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            disabled={disabled}
            className={`min-w-[36px] rounded-lg border px-3 py-1.5 text-sm transition ${p === page
              ? "border-[#2563EB] bg-[#2563EB] text-white"
              : "border-gray-300 text-gray-700 hover:bg-gray-100"
              } disabled:opacity-50`}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages || disabled}
        className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-100"
      >
        Next
        <FiChevronRight />
      </button>
    </div>
  );
}

/* ============================================================
   LIBRARY PAGE
   ============================================================ */
function LibraryPage() {
  const [search, setSearch] = useState("");
  const [openUpload, setOpenUpload] = useState(false);
  const [openFolderModal, setOpenFolderModal] = useState(false);
  const [videos, setVideos] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [editingFolder, setEditingFolder] = useState(null);

  // Folder action menu + delete confirmation
  const [menuOpenFolderId, setMenuOpenFolderId] = useState(null);
  const [folderToDelete, setFolderToDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingFolder, setDeletingFolder] = useState(false);

  // ⬇️ NEW: video action menu + delete confirmation
  const [menuOpenVideoId, setMenuOpenVideoId] = useState(null);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [deleteVideoModalOpen, setDeleteVideoModalOpen] = useState(false);
  const [deletingVideo, setDeletingVideo] = useState(false);

  // ⬇️ NEW: pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchFolders = async () => {
    try {
      const res = await getVideoFolders();
      const folderList = Array.isArray(res) ? res : res ? [res] : [];
      setFolders(folderList);
    } catch (error) {
      console.error("FETCH FOLDERS ERROR:", error);
      setFolders([]);
    }
  };

  const fetchVideos = async (
    folderId = selectedFolderId,
    pageNum = page,
    searchQuery = search
  ) => {
    try {
      setLoading(true);
      const res = await getLibraryVideos({
        q: searchQuery,
        folderId: folderId || "",
        page: pageNum,
        limit: PAGE_LIMIT,
      });

      let videoList = [];
      let pagination = null;

      if (Array.isArray(res?.data?.items)) {
        videoList = res.data.items;
        pagination = res.data.pagination;
      } else if (Array.isArray(res?.data)) {
        videoList = res.data;
      }

      setVideos(videoList);

      if (pagination) {
        setTotalPages(pagination.totalPages || 1);
        setTotalItems(pagination.totalItems || videoList.length);
      } else {
        setTotalPages(1);
        setTotalItems(videoList.length);
      }
    } catch (error) {
      console.error("FETCH VIDEOS ERROR:", error);
      setVideos([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
    fetchFolders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close any open action menu when clicking outside
  useEffect(() => {
    if (!menuOpenFolderId && !menuOpenVideoId) return;

    const handler = (e) => {
      if (menuOpenFolderId && !e.target.closest("[data-folder-menu]")) {
        setMenuOpenFolderId(null);
      }
      if (menuOpenVideoId && !e.target.closest("[data-video-menu]")) {
        setMenuOpenVideoId(null);
      }
    };

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [menuOpenFolderId, menuOpenVideoId]);

  /* ============== Folder navigation ============== */
  const handleFolderClick = (folder) => {
    const folderId = folder.id || folder._id;
    setSelectedFolderId(folderId);
    setPage(1);
    fetchVideos(folderId, 1);
  };

  const handleAllClick = () => {
    setSelectedFolderId(null);
    setPage(1);
    fetchVideos(null, 1);
  };

  const handleSearch = () => {
    setPage(1);
    fetchVideos(selectedFolderId, 1, search);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    setPage(newPage);
    fetchVideos(selectedFolderId, newPage);
  };

  /* ============== Folder menu ============== */
  const toggleFolderMenu = (folderId) => {
    setMenuOpenFolderId((current) => (current === folderId ? null : folderId));
  };

  const handleEditFolder = (folder) => {
    setMenuOpenFolderId(null);
    setEditingFolder(folder);
    setOpenFolderModal(true);
  };

  const handleOpenDeleteFolderModal = (folder) => {
    setMenuOpenFolderId(null);
    setFolderToDelete(folder);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteFolderModal = () => {
    if (deletingFolder) return;
    setDeleteModalOpen(false);
    setFolderToDelete(null);
  };

  const handleConfirmDeleteFolder = async () => {
    if (!folderToDelete?.id) return;

    const wasSelected = selectedFolderId === folderToDelete.id;

    try {
      setDeletingFolder(true);
      await deleteVideoFolder(folderToDelete.id);

      toast.success("Folder deleted");

      if (wasSelected) {
        setSelectedFolderId(null);
        setPage(1);
      }

      setDeleteModalOpen(false);
      setFolderToDelete(null);

      await fetchFolders();
      await fetchVideos(wasSelected ? null : selectedFolderId, wasSelected ? 1 : page);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to delete folder"
      );
    } finally {
      setDeletingFolder(false);
    }
  };

  /* ============== Video menu ============== */
  const toggleVideoMenu = (videoId) => {
    setMenuOpenVideoId((current) => (current === videoId ? null : videoId));
  };

  const handleOpenDeleteVideoModal = (video) => {
    setMenuOpenVideoId(null);
    setVideoToDelete(video);
    setDeleteVideoModalOpen(true);
  };

  const handleCloseDeleteVideoModal = () => {
    if (deletingVideo) return;
    setDeleteVideoModalOpen(false);
    setVideoToDelete(null);
  };

  const handleConfirmDeleteVideo = async () => {
    if (!videoToDelete?.id) return;

    try {
      setDeletingVideo(true);
      await deleteVideoApi(videoToDelete.id);

      toast.success("Video deleted");

      // If we just removed the last item on a non-first page, step back
      const isLastItemOnPage = videos.length === 1 && page > 1;
      const targetPage = isLastItemOnPage ? page - 1 : page;
      if (isLastItemOnPage) setPage(targetPage);

      setDeleteVideoModalOpen(false);
      setVideoToDelete(null);

      await fetchVideos(selectedFolderId, targetPage);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to delete video"
      );
    } finally {
      setDeletingVideo(false);
    }
  };

  return (
    <div className="min-h-full bg-[#F4F7FB] p-4 md:p-8">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1F304A]">
            VK&apos;s Library
          </h1>
          <p className="text-gray-500 mt-2">
            Manage your video library. Upload, organize and reuse videos.
          </p>
        </div>

        <button
          onClick={() => setOpenUpload(true)}
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 w-fit transition"
        >
          <FiPlus />
          Upload Videos
        </button>
      </div>

      {/* SEARCH */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex items-center bg-white rounded-xl px-4 h-14 flex-1 border border-gray-200">
          <FiSearch className="text-gray-400 text-xl" />
          <input
            type="text"
            placeholder="Search videos..."
            className="w-full outline-none px-3 bg-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        <button
          onClick={handleSearch}
          className="bg-[#2563EB] text-white px-6 rounded-xl"
        >
          Search
        </button>

        <button
          onClick={() => {
            setEditingFolder(null);
            setOpenFolderModal(true);
          }}
          className="bg-[#E8F0FF] text-[#2563EB] hover:bg-[#DCE8FF] px-6 h-14 rounded-xl font-medium transition"
        >
          + New Folder
        </button>
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* FOLDERS */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#1F304A]">Folders</h2>
            <HiOutlineFolder className="text-[#2563EB] text-2xl" />
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={handleAllClick}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-left transition ${selectedFolderId === null
                ? "bg-[#EEF4FF] text-[#2563EB]"
                : "hover:bg-gray-100"
                }`}
            >
              <HiOutlineFolder className="text-xl flex-shrink-0" />
              <span className="font-medium text-sm md:text-base">All</span>
            </button>

            {folders.length === 0 ? (
              <p className="text-sm text-gray-500">No folders found</p>
            ) : (
              folders.map((folder) => {
                const folderId = folder.id || folder._id;
                const isActive = selectedFolderId === folderId;
                const isMenuOpen = menuOpenFolderId === folderId;

                return (
                  <div
                    key={folderId}
                    className={`w-full flex items-center justify-between rounded-xl transition ${isActive
                      ? "bg-[#EEF4FF] text-[#2563EB]"
                      : "hover:bg-gray-100"
                      }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleFolderClick(folder)}
                      className="flex items-center gap-3 px-4 py-4 flex-1 text-left min-w-0"
                    >
                      <HiOutlineFolder className="text-xl flex-shrink-0" />
                      <span className="font-medium text-sm md:text-base line-clamp-2 break-words">
                        {folder.name}
                      </span>
                    </button>

                    <div className="relative" data-folder-menu>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFolderMenu(folderId);
                        }}
                        className="px-4 py-4 text-gray-500 hover:text-[#2563EB] hover:bg-gray-200/60 rounded-r-xl"
                        aria-label="Folder actions"
                        aria-haspopup="menu"
                        aria-expanded={isMenuOpen}
                      >
                        <FiMoreVertical />
                      </button>

                      {isMenuOpen && (
                        <div
                          role="menu"
                          className="absolute right-0 top-full mt-1 z-50 min-w-[160px] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                        >
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => handleEditFolder(folder)}
                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-[#1F304A] hover:bg-gray-100"
                          >
                            <FiEdit2 />
                            Update
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => handleOpenDeleteFolderModal(folder)}
                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                          >
                            <FiTrash2 />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* VIDEOS */}
        <div className="xl:col-span-3 bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#1F304A]">
                Library Videos
              </h2>
              <p className="text-gray-500 mt-1">
                {totalItems} {totalItems === 1 ? "Video" : "Videos"}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-gray-500">
              Loading videos...
            </div>
          ) : videos.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              No videos found
            </div>
          ) : (
            <>
              <div className="overflow-y-auto pr-2 max-h-[calc(100vh-340px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                  {videos.map((video) => {
                    const isMenuOpen = menuOpenVideoId === video.id;

                    return (
                      <div
                        key={video.id}
                        className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition bg-white"
                      >
                        <div className="relative h-52 overflow-hidden bg-gray-100">
                          <VideoThumbnail
                            src={video.thumbnail}
                            alt={video.title}
                          />
                        </div>

                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="font-semibold text-[#1F304A] line-clamp-1">
                              {video.title}
                            </h3>

                            {/* ⬇️ NEW: video action menu */}
                            <div className="relative" data-video-menu>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleVideoMenu(video.id);
                                }}
                                className="p-1 text-gray-500 hover:text-[#2563EB]"
                                aria-label="Video actions"
                                aria-haspopup="menu"
                                aria-expanded={isMenuOpen}
                              >
                                <FiMoreVertical />
                              </button>

                              {isMenuOpen && (
                                <div
                                  role="menu"
                                  className="absolute right-0 top-full mt-1 z-50 min-w-[160px] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                                >
                                  <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => handleOpenDeleteVideoModal(video)}
                                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                  >
                                    <FiTrash2 />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                            {video.description || "No description available"}
                          </p>

                          <div className="flex items-center justify-between mt-4">
                            <div>
                              <p className="text-gray-500 text-sm">{video.provider}</p>
                              <p className="text-gray-400 text-xs mt-0.5">
                                Used in {video.usageCount ?? 0}{" "}
                                {(video.usageCount ?? 0) === 1 ? "place" : "places"}
                              </p>
                            </div>

                            <div
                              className={`px-2 py-1 rounded-full text-xs font-medium ${video.status === "READY"
                                  ? "bg-green-100 text-green-700"
                                  : video.status === "PROCESSING"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                            >
                              {video.status}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ⬇️ NEW: pagination */}
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                disabled={loading}
              />
            </>
          )}
        </div>
      </div>

      {/* MODALS */}
      <UploadVideoModal
        open={openUpload}
        onClose={() => setOpenUpload(false)}
        onUploaded={() => fetchVideos(selectedFolderId, page)}
      />

      <CreateFolderModal
        open={openFolderModal}
        editFolder={editingFolder}
        onClose={() => {
          setOpenFolderModal(false);
          setEditingFolder(null);
        }}
        onSuccess={() => {
          fetchFolders();
        }}
      />

      <DeleteFolderModal
        open={deleteModalOpen}
        folderName={folderToDelete?.name}
        onClose={handleCloseDeleteFolderModal}
        onConfirm={handleConfirmDeleteFolder}
        deleting={deletingFolder}
      />

      <DeleteVideoModal
        open={deleteVideoModalOpen}
        videoTitle={videoToDelete?.title}
        onClose={handleCloseDeleteVideoModal}
        onConfirm={handleConfirmDeleteVideo}
        deleting={deletingVideo}
      />
    </div>
  );
}

export default LibraryPage;