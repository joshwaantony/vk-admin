"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiMapPin,
  FiPhone,
  FiRefreshCcw,
  FiSearch,
  FiX,
  FiUser,
} from "react-icons/fi";
import { HiOutlineClipboardList } from "react-icons/hi";
import { BsCurrencyRupee } from "react-icons/bs";
import { HiOutlineAcademicCap } from "react-icons/hi2";
import {
  getEnrollmentsApi,
  getEnrollmentByIdApi,
} from "@/services/enrollmentApi";

const PAGE_SIZE = 20;

function formatDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "-";

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAmount(amount, currency = "INR") {
  if (amount === null || amount === undefined || amount === "") return "-";

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Number(amount));
  } catch {
    return `${currency} ${amount}`;
  }
}

function getStatusTone(status) {
  const normalized = (status || "").toUpperCase();

  if (normalized === "ACTIVE") {
    return "bg-blue-50 text-blue-700 ring-1 ring-blue-100";
  }

  if (normalized === "COMPLETED") {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
  }

  if (normalized === "PENDING") {
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
  }

  if (normalized === "CANCELLED" || normalized === "FAILED") {
    return "bg-rose-50 text-rose-700 ring-1 ring-rose-100";
  }

  return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
}

function StatCard({ title, value, icon, subtitle }) {
  return (
    <div className="rounded-[24px] border border-white/70 bg-white/80 p-5 shadow-[0_12px_36px_rgba(31,48,74,0.08)] backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-2 text-2xl font-semibold text-[#1f304a]">
            {value}
          </h3>
          {subtitle ? (
            <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1f304a] text-white shadow-lg shadow-[#1f304a]/15">
          {icon}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, icon }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="mt-0.5 text-slate-400">{icon}</div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = (status || "").toUpperCase();
  const tones = {
    ACTIVE: "bg-blue-50 text-blue-700 ring-blue-100",
    COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    PENDING: "bg-amber-50 text-amber-700 ring-amber-100",
    FAILED: "bg-rose-50 text-rose-700 ring-rose-100",
    CANCELLED: "bg-rose-50 text-rose-700 ring-rose-100",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
        tones[normalized] || "bg-slate-100 text-slate-600 ring-slate-200"
      }`}
    >
      {status || "-"}
    </span>
  );
}

function EnrollmentModal({ open, loading, enrollment, error, onClose }) {
  if (!open) return null;

  const student = enrollment?.student || {};
  const course = enrollment?.course || {};
  const payment = enrollment?.payment || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.25)]">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Enrollment Details
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-[#1f304a]">
              {student.name || "Enrollment"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {course.title || "-"} · {enrollment?.status || "-"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close enrollment details"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="space-y-3">
              <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
              {error}
            </div>
          ) : (
            <>
              <div className="mb-5 flex flex-wrap gap-2">
                <StatusBadge status={enrollment?.status} />
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                  Voucher: {enrollment?.voucherApplied || "No voucher"}
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <DetailRow
                  label="Student"
                  value={student.name || "-"}
                  icon={<FiUser size={16} />}
                />
                <DetailRow
                  label="Phone"
                  value={student.phone || "-"}
                  icon={<FiPhone size={16} />}
                />
                <DetailRow
                  label="Email"
                  value={student.email || "-"}
                  icon={<FiCreditCard size={16} />}
                />
                <DetailRow
                  label="Address"
                  value={student.address || "-"}
                  icon={<FiMapPin size={16} />}
                />
                <DetailRow
                  label="Course"
                  value={course.title || "-"}
                  icon={<HiOutlineAcademicCap size={16} />}
                />
                <DetailRow
                  label="Enrolled At"
                  value={formatDateTime(enrollment?.enrolledAt)}
                  icon={<FiCalendar size={16} />}
                />
                <DetailRow
                  label="Payment Status"
                  value={payment.status || "-"}
                  icon={<FiCheckCircle size={16} />}
                />
                <DetailRow
                  label="Paid At"
                  value={formatDateTime(payment?.paidAt)}
                  icon={<FiClock size={16} />}
                />
              </div>

              <div className="mt-5 rounded-[24px] border border-[#1f304a] bg-[#1f304a] p-5 text-white">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-white/60">
                      Amount
                    </p>
                    <p className="mt-2 text-lg font-semibold">
                      {formatAmount(
                        payment?.amount,
                        payment?.currency || "INR"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-white/60">
                      Final Amount
                    </p>
                    <p className="mt-2 text-lg font-semibold">
                      {formatAmount(
                        payment?.finalAmount,
                        payment?.currency || "INR"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EnrollmentPage() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getEnrollmentsApi({
        page: currentPage,
        limit: PAGE_SIZE,
      });

      const report = response?.data || response || {};
      const nextItems = Array.isArray(report?.items) ? report.items : [];
      const nextPagination = report?.pagination || {};

      setItems(nextItems);
      setPagination((prev) => ({
        ...prev,
        ...nextPagination,
        page: nextPagination.page || currentPage,
        limit: nextPagination.limit || PAGE_SIZE,
      }));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch enrollment report"
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [currentPage]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return items;

    return items.filter((item) => {
      const haystack = [
        item?.student?.name,
        item?.student?.email,
        item?.student?.phone,
        item?.course?.title,
        item?.enrollmentId,
        item?.status,
        item?.voucherApplied,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [items, search]);

  const statusOptions = useMemo(() => {
    const uniqueStatuses = Array.from(
      new Set(items.map((item) => item?.status).filter(Boolean))
    );

    return ["ALL", ...uniqueStatuses];
  }, [items]);

  const stats = useMemo(() => {
    const active = items.filter((item) => item?.status === "ACTIVE").length;
    const completed = items.filter((item) => item?.status === "COMPLETED")
      .length;
    const vouchers = items.filter((item) => item?.voucherApplied).length;
    const revenue = items.reduce((total, item) => {
      const amount = Number(item?.payment?.finalAmount ?? item?.payment?.amount);
      return total + (Number.isFinite(amount) ? amount : 0);
    }, 0);

    return {
      total: pagination.totalItems || items.length || 0,
      active,
      completed,
      vouchers,
      revenue,
    };
  }, [items, pagination.totalItems]);

  const handleRefresh = () => {
    fetchEnrollments();
  };

  const handleViewEnrollment = async (enrollmentId) => {
    if (!enrollmentId) return;

    try {
      setDetailOpen(true);
      setDetailLoading(true);
      setDetailError("");
      setSelectedEnrollment(null);

      const response = await getEnrollmentByIdApi(enrollmentId);
      const details = response?.data || response || {};

      setSelectedEnrollment(details);
    } catch (err) {
      setDetailError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch enrollment details"
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setDetailOpen(false);
    setSelectedEnrollment(null);
    setDetailError("");
    setDetailLoading(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > (pagination.totalPages || 1)) return;
    setCurrentPage(nextPage);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(139,168,212,0.24),_transparent_34%),linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#1f304a] px-3 py-1 text-xs font-semibold tracking-[0.18em] text-white">
            <HiOutlineClipboardList className="text-sm" />
            ENROLLMENTS
          </div>
          <h1 className="text-3xl font-semibold text-[#1f304a] sm:text-4xl">
            Enrollment Report
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Track every student enrollment, payment status, voucher usage, and
            course linkage from one clean admin view.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1f304a] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1f304a]/20 transition hover:bg-[#2b4162]"
        >
          <FiRefreshCcw size={16} />
          Refresh Report
        </button>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Enrollments"
          value={stats.total}
          icon={<HiOutlineClipboardList size={22} />}
          subtitle="Rows returned by the report"
        />
        <StatCard
          title="Active Enrollments"
          value={stats.active}
          icon={<FiUser size={22} />}
          subtitle="Students currently active"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={<FiCalendar size={22} />}
          subtitle="Finished enrollments"
        />
        <StatCard
          title="Collected Revenue"
          value={formatAmount(stats.revenue)}
          icon={<BsCurrencyRupee size={20} />}
          subtitle="Based on payment final amount"
        />
      </div>

      <div className="grid gap-6">
        <div className="rounded-[28px] border border-white/80 bg-white/90 p-4 shadow-[0_18px_50px_rgba(31,48,74,0.08)] backdrop-blur sm:p-6">
          <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#1f304a]">
                Enrollment List
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {loading
                  ? "Loading report..."
                  : `${filteredItems.length} record${
                      filteredItems.length === 1 ? "" : "s"
                    } shown`}
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <form onSubmit={handleSearchSubmit} className="relative">
                <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search student, course, phone..."
                  className="w-full min-w-[260px] rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#8ba8d4] focus:bg-white"
                />
              </form>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setCurrentPage(1);
                  setStatusFilter(e.target.value);
                }}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#8ba8d4] focus:bg-white"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status === "ALL" ? "All Statuses" : status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 animate-pulse rounded-2xl bg-slate-100"
                />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
              {error}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#1f304a] shadow-sm">
                <HiOutlineAcademicCap size={26} />
              </div>
              <h3 className="text-lg font-semibold text-[#1f304a]">
                No enrollments found
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Try another search term or switch the status filter to see more
                records.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
                      <tr>
                        <th className="px-5 py-4 font-semibold">Student</th>
                        <th className="px-5 py-4 font-semibold">Course</th>
                        <th className="px-5 py-4 font-semibold">Status</th>
                        <th className="px-5 py-4 font-semibold">Payment</th>
                        <th className="px-5 py-4 font-semibold">Enrolled</th>
                        <th className="px-5 py-4 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredItems.map((item) => {
                        const payment = item?.payment || {};
                        const statusTone = getStatusTone(item?.status);

                        return (
                          <tr
                            key={item.enrollmentId}
                            className="transition hover:bg-blue-50/60"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1f304a] text-sm font-semibold text-white shadow-sm">
                                  {item?.student?.name
                                    ?.split(" ")
                                    .map((part) => part[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase() || "ST"}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-800">
                                    {item?.student?.name || "-"}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {item?.student?.email || item?.student?.phone || "-"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <p className="font-medium text-slate-800">
                                {item?.course?.title || "-"}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                ID: {item?.course?.id?.slice(0, 8) || "-"}
                              </p>
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusTone}`}
                              >
                                {item?.status || "-"}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <p className="font-medium text-slate-800">
                                {formatAmount(
                                  payment?.finalAmount ?? payment?.amount,
                                  payment?.currency || "INR"
                                )}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {payment?.status || "-"}
                              </p>
                            </td>

                            <td className="px-5 py-4 text-slate-600">
                              {formatDate(item?.enrolledAt)}
                            </td>

                            <td className="px-5 py-4">
                              <button
                                type="button"
                                onClick={() =>
                                  handleViewEnrollment(item.enrollmentId)
                                }
                                className="inline-flex items-center rounded-xl bg-[#1f304a] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#2b4162]"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Page {pagination.page || currentPage} of{" "}
                  {pagination.totalPages || 1}{" "}
                  <span className="text-slate-400">
                    ({pagination.totalItems || filteredItems.length} total)
                  </span>
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => goToPage((pagination.page || currentPage) - 1)}
                    disabled={!pagination.hasPreviousPage}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={() => goToPage((pagination.page || currentPage) + 1)}
                    disabled={!pagination.hasNextPage}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <EnrollmentModal
        open={detailOpen}
        loading={detailLoading}
        enrollment={selectedEnrollment}
        error={detailError}
        onClose={closeDetailModal}
      />
    </div>
  );
}
