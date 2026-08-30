"use client";

import { useEffect, useState } from "react";
import { FiX, FiSearch, FiChevronRight } from "react-icons/fi";
import { HiOutlineFolder } from "react-icons/hi";
import { MdOutlineFileUpload } from "react-icons/md";
import { GrGallery } from "react-icons/gr";

import { getLibraryVideos } from "@/services/video.service";
import { getVideoFolders } from "@/services/videoFolder.service";

const VIDEO_LIMIT = 50;

export default function VideoSourceModal({
  open,
  onClose,
  onDeviceSelect,
  onLibrarySelect,
  purpose,
}) {
  /* ============== STATE ============== */
  const [mode, setMode] = useState("choose"); // choose | library

  // library view: "folders" (browser) | "all" (every READY video)
  const [view, setView] = useState("folders");

  // folder tree (fetched flat, navigated client-side via parentId)
  const [allFolders, setAllFolders] = useState([]);
  const [foldersLoading, setFoldersLoading] = useState(false);

  // breadcrumb stack — empty array = root level
  const [folderPath, setFolderPath] = useState([]);

  // videos for the currently viewed folder, or all videos in "all" view
  const [videos, setVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(false);

  // search only applies to "all videos" view
  const [search, setSearch] = useState("");

  const currentFolder = folderPath[folderPath.length - 1] || null;
  const currentParentId = currentFolder?.id || null;

  // Subfolders at the current level — filtered from the flat folder list
  const subfolders = allFolders.filter(
    (f) => (f.parentId || null) === currentParentId
  );

  /* ============== FETCH ============== */
const fetchAllFolders = async () => {
  try {
    setFoldersLoading(true);
    const res = await getVideoFolders();
    const tree = Array.isArray(res) ? res : res?.data || [];

    // Flatten the backend's tree so parentId-based filtering works at every depth.
    const flat = [];
    const walk = (nodes) => {
      for (const node of nodes) {
        flat.push(node);
        if (node.children?.length) walk(node.children);
      }
    };
    walk(tree);

    setAllFolders(flat);
  } catch (err) {
    console.error("FETCH FOLDERS ERROR:", err);
    setAllFolders([]);
  } finally {
    setFoldersLoading(false);
  }
};


  const fetchFolderVideos = async (folderId, folderPurpose) => {
  if (!folderId) {
    setVideos([]);
    return;
  }
  try {
    setVideosLoading(true);
    setVideos([]);
    const res = await getLibraryVideos({
      status: "READY",
      folderId,
      purpose: folderPurpose ?? undefined,
      limit: VIDEO_LIMIT,
    });
    const items = Array.isArray(res?.data?.items)
      ? res.data.items
      : Array.isArray(res?.data)
      ? res.data
      : [];
    setVideos(items);
  } catch (err) {
    console.error("FETCH FOLDER VIDEOS ERROR:", err);
    setVideos([]);
  } finally {
    setVideosLoading(false);
  }
};


  const fetchAllVideos = async (q = "") => {
    try {
      setVideosLoading(true);
      const res = await getLibraryVideos({
        status: "READY",
        q,
        purpose,
        limit: VIDEO_LIMIT,
      });
      const list = Array.isArray(res?.data?.items)
        ? res.data.items
        : Array.isArray(res?.data)
          ? res.data
          : [];
      setVideos(list);
    } catch (err) {
      console.error("FETCH ALL VIDEOS ERROR:", err);
      setVideos([]);
    } finally {
      setVideosLoading(false);
    }
  };

  /* ============== EFFECTS ============== */

  // Reset modal whenever it opens — admin starts fresh each time
  useEffect(() => {
    if (open) {
      setMode("choose");
      setView("folders");
      setFolderPath([]);
      setVideos([]);
      setSearch("");
    }
  }, [open]);

  // Pull the folder tree as soon as admin enters Library mode
  useEffect(() => {
    if (open && mode === "library") {
      fetchAllFolders();
    }
  }, [open, mode]);

  // When admin drills into a folder, fetch its videos
useEffect(() => {
  if (mode === "library" && view === "folders") {
    if (currentFolder?.id) {
      fetchFolderVideos(currentFolder.id, currentFolder.purpose);
    } else {
      setVideos([]);
    }
  }
}, [mode, view, currentFolder?.id]);

  // When admin switches to "All Videos", fetch the global list
  useEffect(() => {
    if (mode === "library" && view === "all") {
      fetchAllVideos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, view]);

  if (!open) return null;

  /* ============== HANDLERS ============== */
  const handleClose = () => {
    setMode("choose");
    setView("folders");
    setFolderPath([]);
    setVideos([]);
    setSearch("");
    onClose();
  };

  const handleVideoPick = (video) => {
    onLibrarySelect?.(video);
    handleClose();
  };

const handleFolderEnter = (folder) => {
  setFolderPath((prev) => [
    ...prev,
    { id: folder.id, name: folder.name, purpose: folder.purpose ?? null },
  ]);
};


  // index === -1 → back to root, else trim path up to & including that index
  const handleBreadcrumbClick = (index) => {
    setFolderPath((prev) => prev.slice(0, index + 1));
  };

  const handleAllVideos = () => {
    setView("all");
    setSearch("");
  };

  const handleBackToFolders = () => {
    setView("folders");
    setSearch("");
  };

  const handleSearchAllVideos = () => {
    fetchAllVideos(search);
  };

  /* ============== RENDER ============== */
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-5 shadow-xl">
        {/* HEADER */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1F304A]">Add Video</h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* ============ CHOOSE MODE ============ */}
        {mode === "choose" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                handleClose();
                onDeviceSelect?.();
              }}
              className="flex min-h-[160px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 p-6 hover:border-[#37af47] hover:bg-green-50"
            >
              <MdOutlineFileUpload className="mb-3 text-4xl text-[#37af47]" />
              <p className="font-semibold text-[#1F304A]">From Device</p>
              <p className="mt-1 text-center text-sm text-gray-500">
                Upload a new video from your computer.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMode("library")}
              className="flex min-h-[160px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 p-6 hover:border-blue-500 hover:bg-blue-50"
            >
              <GrGallery className="mb-3 text-4xl text-blue-600" />
              <p className="font-semibold text-[#1F304A]">VK&apos;s Library</p>
              <p className="mt-1 text-center text-sm text-gray-500">
                Reuse videos already added to the library.
              </p>
            </button>
          </div>
        )}

        {/* ============ LIBRARY: FOLDER BROWSER ============ */}
        {mode === "library" && view === "folders" && (
          <>
            {/* Breadcrumb + All Videos shortcut */}
            <div className="mb-3 flex flex-wrap items-center gap-1 text-sm text-gray-600">
              <button
                type="button"
                onClick={() => handleBreadcrumbClick(-1)}
                className={`rounded px-2 py-1 hover:bg-gray-100 ${folderPath.length === 0
                  ? "font-semibold text-[#1F304A]"
                  : ""
                  }`}
              >
                Library
              </button>

              {folderPath.map((f, i) => (
                <span key={f.id} className="flex items-center gap-1">
                  <FiChevronRight className="text-gray-400" />
                  <button
                    type="button"
                    onClick={() => handleBreadcrumbClick(i)}
                    className={`rounded px-2 py-1 hover:bg-gray-100 ${i === folderPath.length - 1
                      ? "font-semibold text-[#1F304A]"
                      : ""
                      }`}
                  >
                    {f.name}
                  </button>
                </span>
              ))}

              <button
                type="button"
                onClick={handleAllVideos}
                className="ml-auto rounded-lg border border-[#2563EB] px-3 py-1 text-xs font-medium text-[#2563EB] hover:bg-blue-50"
              >
                All Videos
              </button>
            </div>

            {foldersLoading ? (
              <div className="py-12 text-center text-sm text-gray-500">
                Loading folders...
              </div>
            ) : (
              <div className="max-h-[440px] overflow-y-auto pr-1">
                {/* Subfolders at this level */}
                {subfolders.length > 0 && (
                  <div className="mb-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Folders
                    </p>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {subfolders.map((folder) => {
                        const childCount = allFolders.filter(
                          (f) => f.parentId === folder.id
                        ).length;
                        return (
                          <button
                            key={folder.id}
                            type="button"
                            onClick={() => handleFolderEnter(folder)}
                            className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 text-left hover:border-[#2563EB] hover:bg-blue-50"
                          >
                            <HiOutlineFolder className="flex-shrink-0 text-2xl text-[#2563EB]" />
                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-1 text-sm font-medium text-[#1F304A]">
                                {folder.name}
                              </p>
                              {childCount > 0 && (
                                <p className="text-xs text-gray-500">
                                  {childCount}{" "}
                                  {childCount === 1
                                    ? "subfolder"
                                    : "subfolders"}
                                </p>
                              )}
                            </div>
                            <FiChevronRight className="flex-shrink-0 text-gray-400" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Videos in the current folder (only when admin drilled in) */}
                {currentFolder && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Videos
                    </p>
                    {videosLoading ? (
                      <div className="py-8 text-center text-sm text-gray-500">
                        Loading videos...
                      </div>
                    ) : videos.length === 0 ? (
                      <div className="rounded-xl bg-gray-50 py-8 text-center text-sm text-gray-500">
                        No videos in this folder yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {videos.map((video) => (
                          <VideoCard
                            key={video.id}
                            video={video}
                            onPick={() => handleVideoPick(video)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Root + zero folders + nothing to drill into */}
                {!currentFolder &&
                  subfolders.length === 0 &&
                  !foldersLoading && (
                    <div className="rounded-xl bg-gray-50 py-12 text-center text-sm text-gray-500">
                      No folders found. Create a folder in the Library page, or
                      use <strong>All Videos</strong> to browse every upload.
                    </div>
                  )}
              </div>
            )}

            <button
              type="button"
              onClick={() => setMode("choose")}
              className="mt-5 rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-600"
            >
              Back
            </button>
          </>
        )}

        {/* ============ LIBRARY: ALL VIDEOS ============ */}
        {mode === "library" && view === "all" && (
          <>
            <div className="mb-4 flex gap-3">
              <div className="flex h-11 flex-1 items-center rounded-xl border border-gray-200 px-3">
                <FiSearch className="text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleSearchAllVideos()
                  }
                  placeholder="Search library videos..."
                  className="w-full bg-transparent px-3 text-sm outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleSearchAllVideos}
                className="rounded-xl bg-[#2563EB] px-5 text-sm font-medium text-white"
              >
                Search
              </button>
            </div>

            {videosLoading ? (
              <div className="py-12 text-center text-sm text-gray-500">
                Loading videos...
              </div>
            ) : videos.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-500">
                No library videos found.
              </div>
            ) : (
              <div className="max-h-[440px] overflow-y-auto pr-1">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {videos.map((video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      onPick={() => handleVideoPick(video)}
                    />
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleBackToFolders}
              className="mt-5 rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-600"
            >
              Back to folders
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   VIDEO CARD (shared between folder view and all-videos view)
   ============================================================ */
function VideoCard({ video, onPick }) {
  return (
    <button
      type="button"
      onClick={onPick}
      className="overflow-hidden rounded-2xl border border-gray-200 text-left hover:border-[#37af47] hover:shadow-md"
    >
      <div className="h-36 bg-gray-100">
        <img
          src={video.thumbnail || video.imageUrl || "/placeholder.jpg"}
          alt={video.title || "Library video"}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="p-3">
        <p className="line-clamp-1 font-semibold text-[#1F304A]">
          {video.title || "Untitled video"}
        </p>
        <p className="mt-1 line-clamp-2 text-xs text-gray-500">
          {video.description || "No description available"}
        </p>
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
  <span>{video.provider || video.videoProvider || "Library"}</span>
  <span>{video.status || "READY"}</span>
</div>
<p className="mt-1 text-xs text-gray-400">
  Used in {video.usageCount ?? 0}{" "}
  {(video.usageCount ?? 0) === 1 ? "place" : "places"}
</p>
      </div>
    </button>
  );
}