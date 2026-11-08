"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, GripVertical, ImagePlus } from "lucide-react";

const initialsFor = (title = "") => {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "?";
  return (words.length === 1 ? words[0].slice(0, 2) : words[0][0] + words[1][0]).toUpperCase();
};

/**
 * Ordered list of published courses with native drag-and-drop and
 * accessible Move up / Move down buttons.
 *
 * @param {{
 *   courses: {id: string, title: string, thumbnail?: string}[],
 *   saving: boolean,
 *   onMove: (from: number, to: number) => void,
 *   onChangeThumbnail: (course: object) => void,
 *   savedIndexById?: Map<string, number>, // server-confirmed positions
 *   languageNameById?: Map<string, string>, // shown in global mode
 * }} props
 */
export default function PublishedOrderList({
  courses,
  saving,
  onMove,
  onChangeThumbnail,
  savedIndexById,
  languageNameById,
}) {
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);
  const buttonRefs = useRef({});
  const pendingFocus = useRef(null);

  // After a keyboard/button move, keep focus on the moved row's control.
  useEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    const index = courses.findIndex((c) => c.id === target.id);
    if (index < 0) return;
    let dir = target.dir;
    if (dir === "up" && index === 0) dir = "down";
    if (dir === "down" && index === courses.length - 1) dir = "up";
    buttonRefs.current[`${target.id}:${dir}`]?.focus();
    pendingFocus.current = null;
  }, [courses]);

  const move = (from, to, focus) => {
    if (saving || to < 0 || to >= courses.length) return;
    if (focus) pendingFocus.current = focus;
    onMove(from, to);
  };

  const endDrag = () => {
    setDragId(null);
    setOverId(null);
  };

  const handleDrop = (targetId) => {
    const from = courses.findIndex((c) => c.id === dragId);
    const to = courses.findIndex((c) => c.id === targetId);
    endDrag();
    if (from < 0 || to < 0 || from === to) return;
    move(from, to);
  };

  const iconBtn =
    "flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-35 aria-disabled:cursor-wait aria-disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8BA8D4]";

  return (
    <ol className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
      {courses.map((course, index) => {
        const isFirst = index === 0;
        const isLast = index === courses.length - 1;
        const isDragging = dragId === course.id;
        const isOver = overId === course.id && dragId !== course.id;
        const savedIndex = savedIndexById?.get(course.id);
        const moved = savedIndex !== undefined && savedIndex !== index;
        const languageName =
          languageNameById && course.languageId
            ? languageNameById.get(course.languageId)
            : null;

        return (
          <li
            key={course.id}
            draggable={!saving}
            onDragStart={(e) => {
              if (saving) return;
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", course.id);
              setDragId(course.id);
            }}
            onDragOver={(e) => {
              if (!dragId) return;
              e.preventDefault();
              if (overId !== course.id) setOverId(course.id);
            }}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(course.id);
            }}
            onDragEnd={endDrag}
            className={`flex items-center gap-2.5 px-3 py-2 transition sm:gap-3 ${
              isDragging ? "opacity-40" : ""
            } ${isOver ? "bg-[#F1F5FC] shadow-[inset_0_2px_0_#8BA8D4]" : "hover:bg-slate-50/70"}`}
          >
            <span
              className={`hidden text-slate-300 sm:block ${
                saving ? "cursor-wait" : "cursor-grab active:cursor-grabbing"
              }`}
              title="Drag to reorder"
              aria-hidden="true"
            >
              <GripVertical size={15} />
            </span>

            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums ${
                moved
                  ? "bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-300"
                  : "bg-slate-100 text-slate-600"
              }`}
              aria-label={`Position ${index + 1}`}
            >
              {index + 1}
            </span>

            <div className="relative h-9 w-16 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-[#E3EAF8]">
              {course.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={course.thumbnail}
                  alt=""
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-[#1F304A]/70">
                  {initialsFor(course.title)}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <p className="truncate text-[13px] font-medium text-slate-900" title={course.title}>
                  {course.title || "Untitled course"}
                </p>
                {languageName && (
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium capitalize text-slate-600">
                    {languageName}
                  </span>
                )}
                {moved && (
                  <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
                    was #{savedIndex + 1}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => onChangeThumbnail(course)}
                className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-[#1F304A] hover:underline"
              >
                <ImagePlus size={11} />
                {course.thumbnail ? "Change thumbnail" : "Add thumbnail"}
              </button>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                ref={(el) => (buttonRefs.current[`${course.id}:up`] = el)}
                onClick={() => move(index, index - 1, { id: course.id, dir: "up" })}
                disabled={isFirst}
                aria-disabled={saving || undefined}
                aria-label={`Move ${course.title} up`}
                title="Move up"
                className={iconBtn}
              >
                <ArrowUp size={14} />
              </button>
              <button
                type="button"
                ref={(el) => (buttonRefs.current[`${course.id}:down`] = el)}
                onClick={() => move(index, index + 1, { id: course.id, dir: "down" })}
                disabled={isLast}
                aria-disabled={saving || undefined}
                aria-label={`Move ${course.title} down`}
                title="Move down"
                className={iconBtn}
              >
                <ArrowDown size={14} />
              </button>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
