import { PracticeService } from "@/services/auto/session.service";
import { jsonResponse } from "@/utils/api-response";


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
        const practiceService = new PracticeService();
        const stats = await practiceService.processUserBatch(batchSize, offset);
        return jsonResponse(stats, { success: true, message: "Ok", status: 200 });
    } catch (error) {
        console.log("[Update Practice Session] :", error);
        return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 });

    }
}

export function getBatchParameters(req: Request) {
    const url = new URL(req.url);
    const batchSize = Number(url.searchParams.get('batchSize')) || 100;
    const offset = Number(url.searchParams.get('offset')) || 0;

    return { batchSize, offset };
}



