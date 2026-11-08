// Status config for the Course Management page.
// Values match what GET /admin/courses returns in `status`.

export const STATUS = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
};

export const STATUS_META = {
  DRAFT: {
    label: "Draft",
    badge: "bg-slate-100 text-slate-700 ring-slate-200",
    dot: "bg-slate-400",
  },
  PUBLISHED: {
    label: "Published",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  ARCHIVED: {
    label: "Archived",
    badge: "bg-zinc-200/70 text-zinc-600 ring-zinc-300",
    dot: "bg-zinc-500",
  },
};

export const TABS = [
  { key: STATUS.PUBLISHED, label: "Published" },
  { key: STATUS.DRAFT, label: "Draft" },
  { key: STATUS.ARCHIVED, label: "Archived" },
];

export const EMPTY_STATES = {
  DRAFT: {
    title: "No draft courses yet",
    text: "Start creating your first course.",
    showCreate: true,
  },
  PUBLISHED: {
    title: "No published courses available",
    text: "Publish a draft course to make it visible to students.",
    showCreate: false,
  },
  ARCHIVED: {
    title: "No archived courses found",
    text: "Courses you archive will appear here.",
    showCreate: false,
  },
};

export const SORT_OPTIONS = [
  { value: "default", label: "Default order" },
  { value: "title-asc", label: "Title A–Z" },
  { value: "title-desc", label: "Title Z–A" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "videos-desc", label: "Most videos" },
];

// Status transitions the backend does NOT expose yet (no endpoint exists in
// src/services/coursesApi.js). They are shown disabled until one is added.
export const UNAVAILABLE_HINT = "Needs a backend endpoint";

export const formatPrice = (price) => {
  const n = Number(price);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
};

export const getApiErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;
