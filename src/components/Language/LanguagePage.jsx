"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  FiEdit2,
  FiMove,
  FiTrash2,
  FiX,
  FiPlus,
  FiRefreshCcw,
  FiSearch,
} from "react-icons/fi";
import toast from "react-hot-toast";
import {
  createLanguageApi,
  deleteLanguageApi,
  getLanguageByIdApi,
  getLanguagesApi,
  reorderLanguagesApi,
  updateLanguageApi,
} from "@/services/languageApi";
import DeleteLanguageModal from "./DeleteLanguage";

function formatDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-100 text-emerald-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function getLanguageUuid(language) {
  return (
    language?.id ||
    language?.languageId ||
    language?.uuid ||
    language?.language_uuid ||
    ""
  );
}

function LanguageModal({ open, mode, language, onClose, onSaved }) {
  const isEditMode = mode === "edit";
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadDetails = async () => {
      if (!open) return;

      if (!isEditMode) {
        setFormData({
          name: "",
          code: "",
          isActive: true,
        });
        setSubmitError("");
        setSubmitting(false);
        setLoadingDetails(false);
        return;
      }

      if (!language?.id) return;

      setLoadingDetails(true);
      setSubmitError("");

      try {
        const response = await getLanguageByIdApi(language.id);
        const details =
          response?.data?.language || response?.data?.data || response?.data || {};

        if (cancelled) return;

        setFormData({
          name: details?.name || language?.name || "",
          code: details?.code || language?.code || "",
          isActive: details?.isActive ?? language?.isActive ?? true,
        });
      } catch (err) {
        if (cancelled) return;

        const message =
          err?.response?.data?.message || "Failed to load language details";

        setSubmitError(message);
        toast.error(message);
      } finally {
        if (!cancelled) {
          setLoadingDetails(false);
          setSubmitting(false);
        }
      }
    };

    if (open) {
      if (!isEditMode) {
        setFormData({
          name: "",
          code: "",
          isActive: true,
        });
        setSubmitError("");
        setSubmitting(false);
        setLoadingDetails(false);
      }

      loadDetails();
      return () => {
        cancelled = true;
      };
    }

    if (!open) {
      setFormData({
        name: language?.name || "",
        code: language?.code || "",
        isActive: language?.isActive ?? true,
      });
      setSubmitError("");
      setSubmitting(false);
      setLoadingDetails(false);
    }
  }, [open, isEditMode, language]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = isEditMode
      ? {
          name: formData.name.trim(),
          isActive: formData.isActive,
        }
      : {
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          isActive: formData.isActive,
        };

    if (!payload.name || (!isEditMode && !payload.code)) return;

    try {
      setSubmitting(true);
      setSubmitError("");
      if (isEditMode) {
        await updateLanguageApi(language.id, payload);
        toast.success("Language updated successfully");
      } else {
        await createLanguageApi(payload);
        toast.success("Language created successfully");
      }

      await onSaved?.();
      onClose();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        `Failed to ${isEditMode ? "update" : "create"} language`;

      setSubmitError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-xl rounded-[24px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h3 className="text-xl font-semibold text-[#1f304a]">
              {isEditMode ? "Edit Language" : "Add Language"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {isEditMode
                ? "Update the selected language record."
                : "Create a new language record for the admin panel."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close modal"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5">
          {loadingDetails && isEditMode ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-10 text-center text-slate-500">
              Loading language details...
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Language Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Marathi"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#8BA8D4] focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Language Code
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g. MARATHI"
                  readOnly={isEditMode}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm uppercase outline-none transition ${
                    isEditMode
                      ? "border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                      : "border-slate-200 bg-slate-50 focus:border-[#8BA8D4] focus:bg-white"
                  }`}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Status
                </label>
                <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-700">Active</span>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-5 w-5 accent-[#1f304a]"
                  />
                </label>
              </div>
            </div>
          )}

          {submitError ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loadingDetails}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1f304a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#314279] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiPlus size={16} />
              {submitting
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                  ? "Update Language"
                  : "Create Language"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LanguagePage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [selectedDeleteLanguage, setSelectedDeleteLanguage] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [isReordering, setIsReordering] = useState(false);

  const fetchLanguages = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getLanguagesApi();
      const apiLanguages = response?.data?.languages || [];

      setLanguages(
        apiLanguages.map((language) => ({
          ...language,
          id: getLanguageUuid(language),
        })),
      );
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to fetch languages";

      setError(message);
      setLanguages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  const filteredLanguages = useMemo(() => {
    const query = search.trim().toLowerCase();

    return languages.filter((language) => {
      const matchesQuery =
        !query ||
        language.name.toLowerCase().includes(query) ||
        language.code.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && language.isActive) ||
        (statusFilter === "INACTIVE" && !language.isActive);

      return matchesQuery && matchesStatus;
    });
  }, [languages, search, statusFilter]);

  const canReorder = !loading && !error && !isReordering;

  const handleDragStart = (languageId) => {
    if (!canReorder) return;
    setDraggedId(languageId);
  };

  const handleDragOver = (languageId, event) => {
    if (!canReorder) return;
    event.preventDefault();
    if (draggedId !== languageId) {
      setDragOverId(languageId);
    }
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDrop = async (targetId) => {
    if (!canReorder || !draggedId || draggedId === targetId) {
      handleDragEnd();
      return;
    }

    const currentOrder = [...languages];
    const sourceIndex = currentOrder.findIndex((item) => item.id === draggedId);
    const targetIndex = currentOrder.findIndex((item) => item.id === targetId);

    if (sourceIndex < 0 || targetIndex < 0) {
      handleDragEnd();
      return;
    }

    const nextOrder = [...currentOrder];
    const [movedItem] = nextOrder.splice(sourceIndex, 1);
    nextOrder.splice(targetIndex, 0, movedItem);

    const orderedLanguageIds = nextOrder.map((item) => getLanguageUuid(item));

    setLanguages(nextOrder);
    setDraggedId(null);
    setDragOverId(null);
    setIsReordering(true);

    try {
      await reorderLanguagesApi(orderedLanguageIds);
      toast.success("Language order updated successfully");
    } catch (err) {
      setLanguages(currentOrder);
      const message =
        err?.response?.data?.message || "Failed to update language order";
      toast.error(message);
    } finally {
      setIsReordering(false);
    }
  };

  const handleDeleteLanguage = async () => {
    if (!selectedDeleteLanguage?.id) return;

    try {
      setDeleteLoading(true);
      await deleteLanguageApi(selectedDeleteLanguage.id);
      toast.success("Language deleted successfully");
      setSelectedDeleteLanguage(null);
      await fetchLanguages();
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to delete language";
      toast.error(message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="mt-[25px] px-4 sm:px-6 md:px-8 pb-8">
      <div className="mb-5 flex flex-col gap-3 rounded-[20px] bg-white p-4 shadow-sm ring-1 ring-slate-200 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by language name or code"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#8BA8D4] focus:bg-white"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:ml-auto lg:items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#8BA8D4] focus:bg-white"
          >
            <option value="ALL">All status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("ALL");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1f304a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#314279]"
          >
            <FiRefreshCcw size={16} />
            Reset filters
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedLanguage(null);
              setModalMode("create");
              setShowAddModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#8BA8D4] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#7896c4]"
            title="Add Language"
          >
            <FiPlus size={16} />
            Add Language
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#1f304a]">
                Language List
              </h2>
              <p className="text-sm text-slate-500">
                Showing {filteredLanguages.length} of {languages.length} records
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <FiMove className="text-slate-400" />
              <span>Drag rows to reorder</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="px-6 py-10 text-center text-slate-500">
              Loading languages...
            </div>
          ) : error ? (
            <div className="px-6 py-12">
              <div className="mx-auto max-w-md rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 text-center">
                <p className="text-lg font-semibold text-amber-900">
                  Unable to load languages
                </p>
                <p className="mt-2 text-sm leading-6 text-amber-800">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={fetchLanguages}
                  className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#1f304a] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#314279]"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-4 font-semibold text-center">Move</th>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Code</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Created At</th>
                  <th className="px-6 py-4 font-semibold">Updated At</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLanguages.length > 0 ? (
                  filteredLanguages.map((language) => (
                    <tr
                      key={language.id}
                      draggable={canReorder}
                      onDragStart={() => handleDragStart(language.id)}
                      onDragEnd={handleDragEnd}
                      onDragEnter={(e) => handleDragOver(language.id, e)}
                      onDragOver={(e) => handleDragOver(language.id, e)}
                      onDrop={() => handleDrop(language.id)}
                      className={`transition hover:bg-blue-50/40 ${
                        draggedId === language.id
                          ? "bg-blue-50 opacity-60"
                          : ""
                      } ${
                        dragOverId === language.id
                          ? "ring-2 ring-inset ring-[#8BA8D4]"
                          : ""
                      }`}
                    >
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 transition ${
                            canReorder
                              ? "cursor-grab bg-white text-slate-500 hover:bg-slate-50"
                              : "cursor-not-allowed bg-slate-100 text-slate-300"
                          }`}
                          aria-label={`Reorder ${language.name}`}
                          title="Drag to reorder"
                        >
                          <FiMove size={16} />
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E3EAF8] font-semibold text-[#1f304a]">
                            {language.name?.charAt(0) || "-"}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">
                              {language.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">
                        {language.code}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge active={language.isActive} />
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(language.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(language.updatedAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLanguage(language);
                              setModalMode("edit");
                              setShowAddModal(true);
                            }}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#E3EAF8] text-[#1f304a] transition hover:bg-[#cfdcf3] hover:text-[#123058]"
                            title="Edit Language"
                          >
                            <FiEdit2 size={18} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedDeleteLanguage(language)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600 transition hover:bg-red-100 hover:text-red-700"
                            title="Delete Language"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-6 py-10 text-center"
                      colSpan={7}
                    >
                      <div className="mx-auto max-w-md rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8">
                        <p className="text-base font-semibold text-slate-700">
                          No languages found
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          Try clearing the filters or refresh the page to check
                          whether the API returned any records.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSearch("");
                            setStatusFilter("ALL");
                            fetchLanguages();
                          }}
                          className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#1f304a] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#314279]"
                        >
                          Reset and reload
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <LanguageModal
        open={showAddModal}
        mode={modalMode}
        language={selectedLanguage}
        onClose={() => {
          setShowAddModal(false);
          setSelectedLanguage(null);
        }}
        onSaved={fetchLanguages}
      />

      <DeleteLanguageModal
        isOpen={!!selectedDeleteLanguage}
        item={selectedDeleteLanguage}
        loading={deleteLoading}
        onCancel={() => setSelectedDeleteLanguage(null)}
        onConfirm={handleDeleteLanguage}
      />
    </div>
  );
}

export default LanguagePage;
