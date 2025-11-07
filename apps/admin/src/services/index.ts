import { attempDataProps } from "@/types";
import api from "@/utils/api";
import { AttemptType } from "@repo/db/enums";

export * from "./session.service";
export * from "./user.service";
export * from "./setting.service";

// Add Attempt API
export const addAttempt = async ({
  attemptData,
  attemptType,
  id,
}: {
  attemptData: Partial<attempDataProps>;
  attemptType?: AttemptType;
  id?: string;
}) => {
  try {
    const payload = {
      ...attemptData,
      id, 
    };

    const response = await api.post(
      `/attempts?type=${attemptType || AttemptType.NONE}`,
      payload
    );

    return response.data;
  } catch (error) {
    console.error("Error adding attempt:", error);
    return {
      success: false,
      message: error?.response?.data?.message || "Error adding attempt",
    };
  }
};

// Add mistake feedback to existing attempt
export const addMistakeFeedback = async (attemptId: string, mistake: string) => {
  try {
    const response = await api.patch('/attempts/mistake', {
      attemptId,
      mistake,
    });

    return response.data;
  } catch (error) {
    console.error("Error adding mistake feedback:", error);
    return {
      success: false,
      message: error?.response?.data?.message || "Error adding mistake feedback",
    };
  }
};


// Forgot Password API
export const getForgotPassword = async (email: string) => {
    try {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    } catch (error) {
        console.error("Error sending forgot password email:", error);
        return {
          success: false,
          message: error?.response?.data?.message || "Error sending email",
        };
      }
}

// Reset Password API
export const resetPassword = async (token: string, password: string) => {
    try {
        const response = await api.post('/auth/reset-password', { token, password });
        return response.data;
    } catch (error) {
        console.error("Error resetting password:", error);
        return {
          success: false,
          message: error?.response?.data?.message || "Error resetting password",
        };
      }
}


