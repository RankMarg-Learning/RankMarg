import { jsonResponse } from "@/utils/api-response";
import axios from "axios";

export async function POST(req: Request) {
    const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
    try {
        const response = await axios(`${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/admin/cron/create-practice?type=user`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${ADMIN_API_KEY}`,
            }
          });
        if (response.status === 200) {
            return jsonResponse(null, { success: true, message: "Ok", status: 200 });
        }
        return jsonResponse(null, { success: false, message: "Failed to create practice session", status: response.status });
    } catch (error) {
        console.log("[Onboading Practice Session] :", error);
        return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 });
    }
}