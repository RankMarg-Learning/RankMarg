import api from "@/utils/api";

export interface ReportFilter {
  page?: number;
  limit?: number;
  type?: string;
  search?: string;
  slug?: string;
}

export const getAllReports = async (filter: Partial<ReportFilter>) => {
  try {
    const response = await api.get('/report', { params: filter });
    return response.data;
  } catch (error) {
    console.error("Error fetching reports:", error);
    return {
      success: false,
      message: "Error fetching reports",
    };
  }
};

export const getReportsByQuestionSlug = async (slug: string, filter: {
  page?: number;
  limit?: number;
}) => {
  try {
    const response = await api.get(`/report/slug/${slug}`, { params: filter });
    return response.data;
  } catch (error) {
    console.error("Error fetching reports by question slug:", error);
    return {
      success: false,
      message: "Error fetching reports by question slug",
    };
  }
};

export const deleteReport = async (id: string) => {
  try {
    const response = await api.delete(`/report/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting report:", error);
    return {
      success: false,
      message: "Error deleting report",
    };
  }
};
