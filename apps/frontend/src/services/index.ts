import { attempDataProps } from "@/types";
import api from "@/utils/api";
import { AttemptType } from "@repo/db/enums";

export * from "./session.service";
export * from "./user.service";

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
    console.error("Error adding test:", error);
    return {
      success: false,
      message: error?.response?.data?.message || "Error adding test",
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


