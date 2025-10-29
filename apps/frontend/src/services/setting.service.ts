import api from "@/utils/api";

export interface UserSettings {
  questionsPerDay: number;
  isActive: boolean;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  updatedAt?: string;
  subscriptionRequired?: boolean;
}

export interface UpdateSettingsData {
  questionsPerDay?: number;
  isActive?: boolean;
}

export interface SettingResponse {
  settingName: string;
  value: any;
  updatedAt?: string;
}

export const settingService = {
  // Get all user settings
  async getUserSettings(): Promise<UserSettings> {
    try {
      const response = await api.get('/settings');
      return response.data.data;
    } catch (error) {
      console.error("Error fetching user settings:", error);
      throw new Error(error?.response?.data?.message || "Failed to fetch settings");
    }
  },

  // Update user settings (bulk update)
  async updateUserSettings(data: UpdateSettingsData): Promise<UserSettings> {
    try {
      const response = await api.put('/settings', data);
      return response.data.data;
    } catch (error) {
      console.error("Error updating user settings:", error);
      throw new Error(error?.response?.data?.message || "Failed to update settings");
    }
  },

  // Get specific setting value
  async getSetting(settingName: string): Promise<SettingResponse> {
    try {
      const response = await api.get(`/settings/${settingName}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching ${settingName}:`, error);
      throw new Error(error?.response?.data?.message || `Failed to fetch ${settingName}`);
    }
  },

  // Update specific setting value
  async updateSetting(settingName: string, value: any): Promise<SettingResponse> {
    try {
      const response = await api.put(`/settings/${settingName}`, { value });
      return response.data.data;
    } catch (error) {
      console.error(`Error updating ${settingName}:`, error);
      throw new Error(error?.response?.data?.message || `Failed to update ${settingName}`);
    }
  },

  // Update questions per day
  async updateQuestionsPerDay(questionsPerDay: number): Promise<SettingResponse> {
    return this.updateSetting('questionsPerDay', questionsPerDay);
  },

  // Update active status
  async updateActiveStatus(isActive: boolean): Promise<SettingResponse> {
    return this.updateSetting('isActive', isActive);
  }
};
