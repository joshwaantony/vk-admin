"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FiRefreshCcw, FiSearch } from "react-icons/fi";
import { getLanguagesApi } from "@/services/languageApi";

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

function LanguagePage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLanguages = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getLanguagesApi();
      const apiLanguages = response?.data?.languages || [];

      setLanguages(apiLanguages);
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

        <div className="flex flex-col gap-3 sm:flex-row">
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
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#1f304a]">
                Language List
              </h2>
              <p className="text-sm text-slate-500">
                Showing {filteredLanguages.length} of {languages.length} records
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="px-6 py-10 text-center text-slate-500">
              Loading languages...
            </div>
          ) : error ? (
            <div className="px-6 py-10 text-center text-red-600">
              {error}
            </div>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Code</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Sort Order</th>
                  <th className="px-6 py-4 font-semibold">Created At</th>
                  <th className="px-6 py-4 font-semibold">Updated At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLanguages.length > 0 ? (
                  filteredLanguages.map((language) => (
                    <tr
                      key={language.id}
                      className="transition hover:bg-blue-50/40"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E3EAF8] font-semibold text-[#1f304a]">
                            {language.name?.charAt(0) || "-"}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">
                              {language.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {language.id}
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
                      <td className="px-6 py-4 text-slate-700">
                        {language.sortOrder ?? "-"}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(language.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(language.updatedAt)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-6 py-10 text-center text-slate-500"
                      colSpan={6}
                    >
                      No languages found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default LanguagePage;
