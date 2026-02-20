import api from "@/utils/api";

// Test Panel Test Details
export const getTestDetails = async (testId: string, token?: string) => {
  const headers = {
    Authorization: `Bearer ${token}`,
  }
  try {
    const response = await api.get(`/test/${testId}/details`, token && {
      headers: headers,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching test details:", error);
    return {
      success: false,
      message: "Error fetching test details",
    };
  }
}

// Test Panel Test Submit
