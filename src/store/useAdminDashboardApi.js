import { create } from "zustand";
import { getAdminDashboardApi } from "@/services/adminDashboardApi";

const formatShortDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
};

const normalizeDashboardData = (response) => {
  const dashboard = response?.data || {};

  return {
    overview: dashboard.overview || {
      totalStudents: 0,
      newStudentsThisMonth: 0,
      publishedCourses: 0,
      draftCourses: 0,
      activeEnrollments: 0,
      completedEnrollments: 0,
      totalRevenue: 0,
      revenueThisMonth: 0,
      failedPayments: 0,
      newContactMessages: 0,
    },

    paymentStatusBreakdown: dashboard.paymentStatusBreakdown || [],

    revenueTrend: (dashboard.revenueTrend || []).map((item) => ({
      ...item,
      shortDate: formatShortDate(item.date),
    })),

    enrollmentTrend: (dashboard.enrollmentTrend || []).map((item) => ({
      ...item,
      shortDate: formatShortDate(item.date),
    })),

    topCourses: dashboard.topCourses || [],
    recentPayments: dashboard.recentPayments || [],
    latestContactMessages: dashboard.latestContactMessages || [],

    ops: dashboard.ops || {
      activePromos: 0,
      promosEndingSoon: 0,
      activeCoupons: 0,
      couponsExpiringSoon: 0,
      pendingPayments: 0,
      authorizedPayments: 0,
      staleGatewayPayments: 0,
      unprocessedWebhookEvents: 0,
    },
  };
};

const useAdminDashboardStore = create((set) => ({
  dashboard: {
    overview: {},
    paymentStatusBreakdown: [],
    revenueTrend: [],
    enrollmentTrend: [],
    topCourses: [],
    recentPayments: [],
    latestContactMessages: [],
    ops: {},
  },

  loading: false,
  error: null,

  fetchDashboard: async () => {
    try {
      set({ loading: true, error: null });

      const response = await getAdminDashboardApi();
      const normalizedData = normalizeDashboardData(response);

      set({
        dashboard: normalizedData,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch dashboard data",
      });
    }
  },
}));

export default useAdminDashboardStore;