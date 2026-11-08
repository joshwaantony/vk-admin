"use client";

import { useState } from "react";
import {
  Archive,
  ArchiveRestore,
  Eye,
  ImagePlus,
  Languages,
  Loader2,
  PlayCircle,
  Rocket,
  SquarePen,
  Star,
  Trash2,
  Undo2,
} from "lucide-react";
import CourseActionsMenu from "./CourseActionsMenu";
import {
  STATUS,
  STATUS_META,
  UNAVAILABLE_HINT,
  formatPrice,
} from "./courseStatus";

// The list API has no thumbnail, so each course gets a calm, stable
// initials tile derived from its id.
const TILE_TONES = [
  "bg-[#E3EAF8] text-[#1F304A]",
  "bg-sky-50 text-sky-800",
  "bg-indigo-50 text-indigo-800",
  "bg-teal-50 text-teal-800",
  "bg-amber-50 text-amber-800",
  "bg-rose-50 text-rose-800",
];

const toneFor = (id = "") => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return TILE_TONES[h % TILE_TONES.length];
};

const initialsFor = (title = "") => {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "?";
  const letters =
    words.length === 1 ? words[0].slice(0, 2) : words[0][0] + words[1][0];
  return letters.toUpperCase();
};

export function StatusBadge({ status }) {
  const meta = STATUS_META[status] || {
    label: status || "Unknown",
    badge: "bg-slate-100 text-slate-600 ring-slate-200",
    dot: "bg-slate-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${meta.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

export default function CourseCard({
  course,
  busyAction,
  onEdit,
  onPublish,
  onDelete,
  onTogglePopular,
  onChangeThumbnail,
}) {
  const { status } = course;
  const isBusy = !!busyAction;
  const isDraft = status === STATUS.DRAFT;
  const isArchived = status === STATUS.ARCHIVED;
  const videos = Number(course.totalVideos) || 0;
  const languageName = course.language?.name || course.languageName || "";
  // Falls back to the initials tile if the image URL fails to load.
  const [imgFailed, setImgFailed] = useState(null);
  const showImage = !!course.thumbnail && imgFailed !== course.thumbnail;

  const menuItems = {
    [STATUS.DRAFT]: [
      { key: "edit", label: "Edit course", icon: SquarePen, onClick: onEdit },
      { key: "thumb", label: "Change thumbnail", icon: ImagePlus, onClick: onChangeThumbnail },
      { key: "publish", label: "Publish", icon: Rocket, onClick: onPublish },
      { key: "d1", divider: true },
      { key: "delete", label: "Delete", icon: Trash2, onClick: onDelete, danger: true },
    ],
    [STATUS.PUBLISHED]: [
      { key: "edit", label: "Edit course", icon: SquarePen, onClick: onEdit },
      { key: "thumb", label: "Change thumbnail", icon: ImagePlus, onClick: onChangeThumbnail },
      { key: "unpublish", label: "Move to draft", icon: Undo2, disabled: true, hint: UNAVAILABLE_HINT },
      { key: "archive", label: "Archive", icon: Archive, disabled: true, hint: UNAVAILABLE_HINT },
    ],
    [STATUS.ARCHIVED]: [
      { key: "view", label: "View course", icon: Eye, onClick: onEdit },
      { key: "restore", label: "Restore to draft", icon: ArchiveRestore, disabled: true, hint: UNAVAILABLE_HINT },
      { key: "d1", divider: true },
      { key: "delete", label: "Delete", icon: Trash2, onClick: onDelete, danger: true },
    ],
  }[status] || [
    { key: "edit", label: "Edit course", icon: SquarePen, onClick: onEdit },
  ];

  const busyText = {
    edit: "Opening…",
    publish: "Publishing…",
    delete: "Deleting…",
  }[busyAction];

  return (
    <article
      className={`group relative flex flex-col rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-slate-300 hover:shadow-md ${
        isArchived ? "opacity-80" : ""
      }`}
    >
      {/* Thumbnail */}
      <div
        className={`relative flex aspect-video items-center justify-center overflow-hidden rounded-t-2xl ${toneFor(
          course.id
        )}`}
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnail}
            alt={`${course.title} thumbnail`}
            loading="lazy"
            onError={() => setImgFailed(course.thumbnail)}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <span className="text-3xl font-semibold tracking-tight opacity-80">
            {initialsFor(course.title)}
          </span>
        )}

        <div className="absolute left-3 top-3">
          <StatusBadge status={status} />
        </div>

        {course.isPopular && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            Popular
          </span>
        )}

        {isBusy && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-t-2xl bg-white/70 text-sm font-medium text-slate-700 backdrop-blur-[1px]">
            <Loader2 size={16} className="animate-spin" />
            {busyText}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h3
          className="line-clamp-2 min-h-[2.75rem] text-[15px] font-semibold leading-snug text-slate-900"
          title={course.title}
        >
          {course.title || "Untitled course"}
        </h3>

        <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
          <span className="font-semibold text-slate-900">
            {formatPrice(course.price)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <PlayCircle size={15} />
            {videos} {videos === 1 ? "video" : "videos"}
          </span>
          {languageName && (
            <span
              className="ml-auto inline-flex min-w-0 items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-600"
              title={`Language: ${languageName}`}
            >
              <Languages size={12} className="shrink-0" />
              <span className="truncate">{languageName}</span>
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <label
            className={`inline-flex items-center gap-2 text-xs font-medium ${
              isDraft || isArchived ? "text-slate-400" : "text-slate-600"
            }`}
            title={
              isDraft || isArchived
                ? "Only published courses can be marked popular"
                : undefined
            }
          >
            <button
              type="button"
              role="switch"
              aria-checked={!!course.isPopular}
              aria-label="Mark as popular"
              disabled={isDraft || isArchived || isBusy}
              onClick={onTogglePopular}
              className={`relative h-5 w-9 rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${
                course.isPopular ? "bg-[#1F304A]" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  course.isPopular ? "translate-x-4" : ""
                }`}
              />
            </button>
            Popular
          </label>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onEdit}
              disabled={isBusy}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isArchived ? <Eye size={15} /> : <SquarePen size={15} />}
              {isArchived ? "View" : "Edit"}
            </button>
            <CourseActionsMenu
              items={menuItems}
              disabled={isBusy}
              label={`More actions for ${course.title}`}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
