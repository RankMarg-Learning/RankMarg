import { ReviewScheduleService } from "@/services/auto/reviewSchedule.service";
import { jsonResponse } from "@/utils/api-response";
import { getBatchParameters } from "@/utils/batch";


export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer')) {
            return jsonResponse(null, { success: false, message: "Unauthorized", status: 401 })
        }
        const apiKey = authHeader.split(' ')[1]

        if (apiKey !== process.env.ADMIN_API_KEY) {
            return jsonResponse(null, { success: false, message: "Invalid API key", status: 403 })
        }
        const { batchSize, offset } = getBatchParameters(req);



        const masteryService = new ReviewScheduleService();
        const stats = await masteryService.processUserBatch(batchSize, offset);
        return jsonResponse(stats, { success: true, message: "Ok", status: 200 });
    } catch (error) {
        console.log("[Update Mastery] :", error);
        return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 });

    }
}





