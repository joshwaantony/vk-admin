//app/admin/courses/order/page.js
"use client";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ListOrdered,
  Loader2,
  RefreshCw,
  RotateCcw,
  Save,
  X,
} from "lucide-react";
import useCourseStore from "@/store/useCourseStore";
import { getLanguagesApi } from "@/services/languageApi";
import PublishedOrderList from "@/components/Course/CourseList/PublishedOrderList";
import ThumbnailUploadDialog from "@/components/Course/CourseList/ThumbnailUploadDialog";
import ConfirmDialog from "@/components/Course/CourseList/ConfirmDialog";
import LanguageSelect, {
  GLOBAL_SCOPE,
} from "@/components/Course/CourseList/LanguageSelect";
import { sameOrder } from "@/components/Course/CourseList/reorder";
import { getApiErrorMessage } from "@/components/Course/CourseList/courseStatus";

function RowSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-3 px-3 py-2">
      <div className="h-6 w-6 rounded-full bg-slate-100" />
      <div className="h-9 w-16 rounded-md bg-slate-100" />
      <div className="h-4 flex-1 rounded bg-slate-100" />
      <div className="h-7 w-16 rounded-md bg-slate-50" />
    </div>
  );
}

function Panel({ icon: Icon, tone = "neutral", title, text, children }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full ${
          tone === "error" ? "bg-red-50 text-red-600" : "bg-[#E3EAF8] text-[#1F304A]"
        }`}
      >
        <Icon size={22} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-500">{text}</p>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

const secondaryBtn =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

function CourseOrderPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    orderLanguageId,
    publishedCourses,
    lastSavedPublished,
    publishedStatus,
    publishedError,
    reorderSaving,
    lastFailedOrder,
    fetchPublishedCourses,
    movePublishedCourse,
    discardPublishedOrder,
    dismissFailedOrder,
    savePublishedOrder,
    retryPublishedOrder,
  } = useCourseStore();

  /* ================= LANGUAGES (existing language API) ================= */
  const [languages, setLanguages] = useState([]);
  const [langStatus, setLangStatus] = useState("loading");
  const [langError, setLangError] = useState(null);

  const loadLanguages = useCallback(async () => {
    setLangStatus("loading");
    setLangError(null);
    try {
      const res = await getLanguagesApi();
      const list = res?.data?.languages;
      if (!Array.isArray(list)) throw new Error("Unexpected languages response");
      setLanguages(
        list
          .filter((l) => typeof l?.id === "string" && l.id)
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      );
      setLangStatus("ready");
    } catch (err) {
      setLangError(err);
      setLangStatus("error");
    }
  }, []);

  useEffect(() => {
    loadLanguages();
  }, [loadLanguages]);

  const languageNameById = useMemo(
    () => new Map(languages.map((l) => [l.id, l.name])),
    [languages]
  );

  /* ================= SELECTED SCOPE (kept in the URL) ================= */
  // ?languageId=<uuid> for a language, ?scope=global for the global order.
  const selected = useMemo(() => {
    if (langStatus !== "ready") return null;
    if (searchParams.get("scope") === "global") return GLOBAL_SCOPE;
    const fromUrl = searchParams.get("languageId");
    if (fromUrl && languageNameById.has(fromUrl)) return fromUrl;
    return languages[0]?.id || GLOBAL_SCOPE;
  }, [langStatus, searchParams, languages, languageNameById]);

  const isGlobal = selected === GLOBAL_SCOPE;
  const scopeName = isGlobal
    ? "All languages"
    : languageNameById.get(selected) || "";

  const navigateTo = useCallback(
    (value) => {
      const qs =
        value === GLOBAL_SCOPE
          ? "scope=global"
          : `languageId=${encodeURIComponent(value)}`;
      router.replace(`${pathname}?${qs}`, { scroll: false });
    },
    [router, pathname]
  );

  useEffect(() => {
    if (!selected) return;
    fetchPublishedCourses(selected === GLOBAL_SCOPE ? null : selected);
  }, [selected, fetchPublishedCourses]);

  /* ================= DIRTY / STATUS ================= */
  const dirty =
    publishedStatus === "ready" &&
    (orderLanguageId || GLOBAL_SCOPE) === selected &&
    !sameOrder(publishedCourses, lastSavedPublished);
  const [justSaved, setJustSaved] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [pending, setPending] = useState(null); // { type: "scope", value } | { type: "reload" }
  const [thumbCourse, setThumbCourse] = useState(null);

  useEffect(() => {
    if (dirty) setJustSaved(false);
  }, [dirty]);
  useEffect(() => {
    setJustSaved(false);
  }, [selected]);

  // Browser-level guard for reload / tab close with unsaved order.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const savedIndexById = useMemo(
    () => new Map(lastSavedPublished.map((c, i) => [c.id, i])),
    [lastSavedPublished]
  );

  /* ================= ACTIONS ================= */
  const requestScope = (value) => {
    if (value === selected || reorderSaving) return;
    if (dirty) setPending({ type: "scope", value });
    else navigateTo(value);
  };

  const requestReload = () => {
    if (reorderSaving) return;
    if (dirty) setPending({ type: "reload" });
    else fetchPublishedCourses(isGlobal ? null : selected);
  };

  const confirmPending = () => {
    const action = pending;
    setPending(null);
    discardPublishedOrder();
    if (action?.type === "scope") navigateTo(action.value);
    if (action?.type === "reload") fetchPublishedCourses(isGlobal ? null : selected);
  };

  const handleMove = (from, to) => {
    const course = publishedCourses[from];
    if (movePublishedCourse(from, to)) {
      setAnnouncement(
        `Moved ${course?.title} to position ${to + 1} of ${publishedCourses.length}. Unsaved.`
      );
    }
  };

  const runSave = async (fn) => {
    try {
      const saved = await fn();
      if (saved) {
        setJustSaved(true);
        setAnnouncement(`${scopeName} order saved.`);
        toast.success(`${scopeName} order saved`, { id: "course-order" });
      }
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to save course order");
      setAnnouncement(`Could not save. Last saved order restored. ${message}`);
      toast.error(`${message}. Last saved order restored.`, { id: "course-order" });
    }
  };

  const handleDiscard = () => {
    discardPublishedOrder();
    setAnnouncement("Changes discarded.");
  };

  /* ================= RENDER ================= */
  // Also "loading" while the store still holds another scope's list, so a
  // previous language's courses are never shown under the new selection.
  const storeScope = orderLanguageId || GLOBAL_SCOPE;
  const listLoading =
    !selected ||
    storeScope !== selected ||
    publishedStatus === "idle" ||
    publishedStatus === "loading";

  const renderBody = () => {
    if (langStatus === "error") {
      return (
        <Panel
          icon={AlertTriangle}
          tone="error"
          title="Couldn't load languages"
          text={getApiErrorMessage(langError, "Please try again.")}
        >
          <button type="button" onClick={loadLanguages} className={secondaryBtn}>
            <RefreshCw size={16} /> Retry
          </button>
        </Panel>
      );
    }

    if (listLoading) {
      return (
        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
          {Array.from({ length: 4 }).map((_, i) => (
            <RowSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (publishedStatus === "error") {
      return (
        <Panel
          icon={AlertTriangle}
          tone="error"
          title={`Couldn't load ${scopeName} courses`}
          text={getApiErrorMessage(publishedError, "Something went wrong. Please try again.")}
        >
          <button
            type="button"
            onClick={() => fetchPublishedCourses(isGlobal ? null : selected)}
            className={secondaryBtn}
          >
            <RefreshCw size={16} /> Retry
          </button>
        </Panel>
      );
    }

    if (!publishedCourses.length) {
      return (
        <Panel
          icon={ListOrdered}
          title={
            isGlobal
              ? "No published courses yet"
              : `No published courses in ${scopeName}`
          }
          text="Publish a course and it will appear here for ordering."
        >
          <Link
            href="/courses"
            className="rounded-lg bg-[#1F304A] px-4 py-2 text-sm font-medium text-white hover:bg-[#2B4162]"
          >
            Go to Course Management
          </Link>
        </Panel>
      );
    }

    return (
      <PublishedOrderList
        courses={publishedCourses}
        saving={reorderSaving}
        onMove={handleMove}
        onChangeThumbnail={setThumbCourse}
        savedIndexById={savedIndexById}
        languageNameById={isGlobal ? languageNameById : undefined}
      />
    );
  };

  const statusChip = reorderSaving ? (
    <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
      <Loader2 size={15} className="animate-spin" /> Saving…
    </span>
  ) : dirty ? (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-700">
      <span className="h-2 w-2 rounded-full bg-amber-500" /> Unsaved changes
    </span>
  ) : justSaved ? (
    <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700">
      <CheckCircle2 size={15} /> Saved
    </span>
  ) : null;

  const ready = !listLoading && publishedStatus === "ready" && langStatus === "ready";

  return (
    <div className="w-full px-4 pb-8 pt-4 sm:px-6 md:px-8">
      <Link
        href="/courses"
        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={14} /> Course Management
      </Link>

      <div className="mt-2">
        <h1 className="text-lg font-semibold tracking-tight text-[#1F304A] sm:text-xl">
          Course display order
        </h1>
        <p className="mt-0.5 text-xs text-slate-500">
          Manage published courses and control their display order by language.
        </p>
      </div>

      {/* Toolbar */}
      <div className="sticky top-0 z-20 -mx-4 mt-3 border-b border-slate-200 bg-gray-50/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 md:-mx-8 md:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <LanguageSelect
              languages={languages}
              value={selected || ""}
              onChange={requestScope}
              disabled={langStatus !== "ready" || reorderSaving}
              loading={langStatus === "loading" || (listLoading && langStatus === "ready")}
            />
            {ready && (
              <p className="text-xs text-slate-500">
                <span className="font-medium capitalize text-slate-800">{scopeName}</span>
                {" · "}
                {publishedCourses.length} published{" "}
                {publishedCourses.length === 1 ? "course" : "courses"}
                {isGlobal && " · global order"}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <div className="mr-auto min-w-0 sm:mr-1" aria-hidden="true">
              {statusChip}
            </div>
            <button
              type="button"
              onClick={requestReload}
              disabled={!selected || listLoading || reorderSaving}
              className={secondaryBtn}
              title="Reload from server"
              aria-label="Reload from server"
            >
              <RefreshCw size={14} />
            </button>
            <button
              type="button"
              onClick={handleDiscard}
              disabled={!dirty || reorderSaving}
              className={secondaryBtn}
            >
              <RotateCcw size={14} /> Discard
            </button>
            <button
              type="button"
              onClick={() => runSave(savePublishedOrder)}
              disabled={!dirty || reorderSaving}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-[#1F304A] px-3 text-xs font-medium text-white shadow-sm transition hover:bg-[#2B4162] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {reorderSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {reorderSaving ? "Saving…" : "Save Order"}
            </button>
          </div>
        </div>
      </div>

      {/* Failed save */}
      {lastFailedOrder && !reorderSaving && (
        <div
          role="alert"
          className="mt-4 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 sm:flex-row sm:items-center"
        >
          <AlertTriangle size={18} className="shrink-0" />
          <p className="flex-1">
            Your new order couldn&apos;t be saved, so the last saved order was
            restored.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => runSave(retryPublishedOrder)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-red-600 px-3 text-sm font-medium text-white hover:bg-red-700"
            >
              <RefreshCw size={15} /> Retry save
            </button>
            <button
              type="button"
              onClick={dismissFailedOrder}
              aria-label="Dismiss"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-red-700 hover:bg-red-100"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="mt-3">{renderBody()}</div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>

      <ConfirmDialog
        open={!!pending}
        title="Discard unsaved order?"
        description={
          <>
            You have unsaved changes to the{" "}
            <span className="font-medium capitalize text-slate-900">
              {scopeName}
            </span>{" "}
            order.{" "}
            {pending?.type === "scope"
              ? "Switching language will discard them."
              : "Reloading will discard them."}
          </>
        }
        confirmLabel={pending?.type === "scope" ? "Discard & switch" : "Discard & reload"}
        tone="danger"
        icon={AlertTriangle}
        onConfirm={confirmPending}
        onClose={() => setPending(null)}
      />

      {thumbCourse && (
        <ThumbnailUploadDialog
          course={thumbCourse}
          onClose={() => setThumbCourse(null)}
        />
      )}
    </div>
  );
}

// useSearchParams requires a Suspense boundary in the App Router.
export default function CourseOrderPage() {
  return (
    <Suspense fallback={null}>
      <CourseOrderPageInner />
    </Suspense>
  );
}
