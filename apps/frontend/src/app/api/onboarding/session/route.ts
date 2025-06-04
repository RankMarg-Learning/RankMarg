import { jsonResponse } from "@/utils/api-response";
import { getAuthSession } from "@/utils/session";
import axios from "axios";

export async function POST(req: Request) {
    const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
    try {
        const session = await getAuthSession();
        if (!session || !session.user) {
            return jsonResponse(null, { success: false, message: "Unauthorized ", status: 401 });
        }
        const response = await axios.post(`${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/admin/cron/create-practice?type=user`,{
            userId: session?.user?.id
        }, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${ADMIN_API_KEY}`,
              'Content-Type': 'application/json',
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