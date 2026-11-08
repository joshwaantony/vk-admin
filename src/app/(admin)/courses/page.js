//app/admin/courses/page.js
"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Languages,
  ListOrdered,
  Plus,
  RefreshCw,
  Rocket,
  Search,
  SearchX,
  Trash2,
  X,
} from "lucide-react";
import CourseWizard from "@/components/Course/CourseWizard";
import CourseCard from "@/components/Course/CourseList/CourseCard";
import ConfirmDialog from "@/components/Course/CourseList/ConfirmDialog";
import ThumbnailUploadDialog from "@/components/Course/CourseList/ThumbnailUploadDialog";
import {
  EMPTY_STATES,
  SORT_OPTIONS,
  STATUS,
  TABS,
  getApiErrorMessage,
} from "@/components/Course/CourseList/courseStatus";
import {
  ALL_LANGUAGES,
  countByStatus,
  filterCourses,
  getLanguageOptions,
} from "@/components/Course/CourseList/courseFilters";
import useCourseStore from "@/store/useCourseStore";

const PAGE_SIZE = 12;

function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white">
      <div className="aspect-video rounded-t-2xl bg-slate-100" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded bg-slate-100" />
        <div className="h-4 w-1/2 rounded bg-slate-100" />
        <div className="h-9 rounded bg-slate-50" />
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E3EAF8] text-[#1F304A]">
        <Icon size={22} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

function getPageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("…" + p);
    out.push(p);
  });
  return out;
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const btn =
    "flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <button
        type="button"
        className={`${btn} border border-slate-200 bg-white text-slate-600 hover:bg-slate-50`}
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      <span className="px-3 text-sm text-slate-600 sm:hidden">
        Page {page} of {totalPages}
      </span>

      <div className="hidden items-center gap-1 sm:flex">
        {getPageList(page, totalPages).map((p) =>
          typeof p === "string" ? (
            <span key={p} className="px-1 text-slate-400">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={`${btn} ${
                p === page
                  ? "bg-[#1F304A] text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        className={`${btn} border border-slate-200 bg-white text-slate-600 hover:bg-slate-50`}
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

export default function Page() {
  const [showWizard, setShowWizard] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const [activeTab, setActiveTab] = useState(STATUS.PUBLISHED);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [languageFilter, setLanguageFilter] = useState(ALL_LANGUAGES);
  const [page, setPage] = useState(1);

  const [hasLoaded, setHasLoaded] = useState(false);
  const [busy, setBusy] = useState(null); // { id, action }
  const [confirm, setConfirm] = useState(null); // { type, course }
  const [thumbCourse, setThumbCourse] = useState(null);
  const inFlight = useRef(new Set());

  const {
    courses,
    error,
    fetchCourses,
    fetchCourseById,
    deleteCourse,
    setCourseId,
    togglePopular,
    publishCourseAction,
  } = useCourseStore();

  const loadCourses = useCallback(async () => {
    await fetchCourses();
    setHasLoaded(true);
  }, [fetchCourses]);

  // Load on mount, and refetch when the wizard closes so newly-published
  // courses show their real totalVideos instead of a stale 0.
  useEffect(() => {
    if (!showWizard) loadCourses();
  }, [showWizard, loadCourses]);

  /* ================= DERIVED DATA ================= */
  // Language options come from the courses themselves (each has language).
  const languageOptions = useMemo(() => getLanguageOptions(courses), [courses]);

  // Reset if the selected language no longer has any courses.
  useEffect(() => {
    if (
      hasLoaded &&
      languageFilter !== ALL_LANGUAGES &&
      !languageOptions.some((l) => l.id === languageFilter)
    ) {
      setLanguageFilter(ALL_LANGUAGES);
    }
  }, [hasLoaded, languageFilter, languageOptions]);

  const languageName =
    languageOptions.find((l) => l.id === languageFilter)?.name || "";

  const counts = useMemo(
    () => countByStatus(courses, languageFilter),
    [courses, languageFilter]
  );

  const filtered = useMemo(
    () =>
      filterCourses(courses, {
        status: activeTab,
        languageId: languageFilter,
        search,
        sort,
      }),
    [courses, activeTab, languageFilter, search, sort]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
  }, [activeTab, search, sort, languageFilter]);

  /* ================= ACTIONS ================= */
  // Guards against double-clicks firing the same request twice.
  const runOnce = async (course, action, fn) => {
    const key = `${course.id}:${action}`;
    if (inFlight.current.has(key)) return;
    inFlight.current.add(key);
    setBusy({ id: course.id, action });
    try {
      await fn();
    } finally {
      inFlight.current.delete(key);
      setBusy(null);
    }
  };

  const openCreate = () => {
    setEditingIndex(null);
    setCourseId(null);
    useCourseStore.getState().resetCourse();
    setShowWizard(true);
  };

  const handleEdit = (course) =>
    runOnce(course, "edit", async () => {
      // Clear any previously opened course so a failed fetch can't
      // reopen the wizard with stale data.
      useCourseStore.getState().resetCourse();
      setCourseId(course.id);
      // Always fetch full details (including promos/sections)
      // instead of using the shallow data from the list
      await fetchCourseById(course.id);
      if (!useCourseStore.getState().currentCourse) {
        toast.error("Failed to load course");
        return;
      }
      setShowWizard(true);
    });

  const handleTogglePopular = (course) =>
    runOnce(course, "popular", async () => {
      try {
        await togglePopular(course.id, course.isPopular);
        toast.success(
          course.isPopular
            ? `"${course.title}" removed from popular`
            : `"${course.title}" marked as popular`
        );
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Failed to update popular status"));
      }
    });

  const handleConfirm = async () => {
    if (!confirm) return;
    const { type, course } = confirm;

    await runOnce(course, type, async () => {
      try {
        if (type === "publish") {
          await publishCourseAction(course.id);
          toast.success(`"${course.title}" is now published`);
        } else if (type === "delete") {
          await deleteCourse(course.id);
          toast.success(`"${course.title}" deleted`);
        }
        setConfirm(null);
      } catch (err) {
        toast.error(
          getApiErrorMessage(
            err,
            type === "publish" ? "Failed to publish course" : "Failed to delete course"
          )
        );
      }
    });
  };

  const confirmBusy = !!confirm && busy?.id === confirm.course.id;

  const confirmConfig = {
    publish: {
      title: "Publish course?",
      description: (
        <>
          <span className="font-medium text-slate-900">
            {confirm?.course.title}
          </span>{" "}
          will become visible to students. Make sure its content and lessons
          are ready.
        </>
      ),
      confirmLabel: "Publish",
      busyLabel: "Publishing…",
      tone: "primary",
      icon: Rocket,
    },
    delete: {
      title: "Delete course?",
      description: (
        <>
          <span className="font-medium text-slate-900">
            {confirm?.course.title}
          </span>{" "}
          will be permanently deleted. This action cannot be undone.
        </>
      ),
      confirmLabel: "Delete",
      busyLabel: "Deleting…",
      tone: "danger",
      icon: Trash2,
    },
  }[confirm?.type];

  /* ================= RENDER ================= */
  const renderBody = () => {
    if (!hasLoaded) {
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (error && !courses?.length) {
      return (
        <EmptyState
          icon={AlertTriangle}
          title="Couldn't load courses"
          text={getApiErrorMessage(error, "Something went wrong. Please try again.")}
          action={
            <button
              type="button"
              onClick={loadCourses}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw size={16} /> Retry
            </button>
          }
        />
      );
    }

    if (!filtered.length) {
      const hasLanguage = languageFilter !== ALL_LANGUAGES;
      if (search.trim() || hasLanguage) {
        const q = search.trim();
        return (
          <EmptyState
            icon={SearchX}
            title="No matching courses"
            text={
              q
                ? `No courses match "${q}"${hasLanguage ? ` in ${languageName}` : ""} in this view.`
                : `No ${(TABS.find((t) => t.key === activeTab)?.label || "").toLowerCase()} courses in ${languageName}.`
            }
            action={
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setLanguageFilter(ALL_LANGUAGES);
                }}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Clear filters
              </button>
            }
          />
        );
      }
      const empty = EMPTY_STATES[activeTab];
      return (
        <EmptyState
          icon={BookOpen}
          title={empty.title}
          text={empty.text}
          action={
            empty.showCreate && (
              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-lg bg-[#1F304A] px-4 py-2 text-sm font-medium text-white hover:bg-[#2B4162]"
              >
                <Plus size={16} /> Create course
              </button>
            )
          }
        />
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {pageItems.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              busyAction={
                busy?.id === course.id && busy.action !== "popular"
                  ? busy.action
                  : null
              }
              onEdit={() => handleEdit(course)}
              onPublish={() => setConfirm({ type: "publish", course })}
              onDelete={() => setConfirm({ type: "delete", course })}
              onTogglePopular={() => handleTogglePopular(course)}
              onChangeThumbnail={() => setThumbCourse(course)}
            />
          ))}
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-slate-500">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–
            {Math.min(currentPage * PAGE_SIZE, filtered.length)} of{" "}
            {filtered.length}
          </p>
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onChange={setPage}
          />
        </div>
      </>
    );
  };

  return (
    <>
      {!showWizard && (
        <div className="mx-auto max-w-[1400px] px-4 pb-10 pt-6 sm:px-6 md:px-8">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-[#1F304A] sm:text-[27px]">
                Course Management
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage, organize, and publish your courses.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/courses/order"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <ListOrdered size={18} />
                Display order
              </Link>
              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1F304A] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#2B4162]"
              >
                <Plus size={18} />
                Add New Course
              </button>
            </div>
          </div>

          {/* Status tabs */}
          <div className="mt-6 border-b border-slate-200">
            <div
              role="tablist"
              aria-label="Course status"
              className="-mb-px flex gap-1 overflow-x-auto"
            >
              {TABS.map((tab) => {
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? "border-[#1F304A] text-[#1F304A]"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${
                        active
                          ? "bg-[#1F304A] text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {hasLoaded ? counts[tab.key] : "–"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toolbar */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-sm">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by course title"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#8BA8D4] focus:ring-2 focus:ring-[#8BA8D4]/30 [&::-webkit-search-cancel-button]:hidden"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-slate-400 hover:text-slate-700"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="relative sm:w-52">
              <Languages
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                aria-label="Filter by language"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm capitalize text-slate-700 outline-none focus:border-[#8BA8D4] focus:ring-2 focus:ring-[#8BA8D4]/30"
              >
                <option value={ALL_LANGUAGES}>All languages</option>
                {languageOptions.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort courses"
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#8BA8D4] focus:ring-2 focus:ring-[#8BA8D4]/30 sm:ml-auto"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5">{renderBody()}</div>
        </div>
      )}

      {showWizard && (
        <CourseWizard
          onClose={() => setShowWizard(false)}
          editingIndex={editingIndex}
        />
      )}

      {thumbCourse && (
        <ThumbnailUploadDialog
          course={thumbCourse}
          onClose={() => setThumbCourse(null)}
        />
      )}

      {confirmConfig && (
        <ConfirmDialog
          open
          {...confirmConfig}
          busy={confirmBusy}
          onConfirm={handleConfirm}
          onClose={() => !confirmBusy && setConfirm(null)}
        />
      )}
    </>
  );
}
