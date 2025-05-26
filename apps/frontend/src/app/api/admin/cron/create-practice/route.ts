export const dynamic = "force-dynamic";

import { PracticeService } from "@/services/auto/session.service";
import { jsonResponse } from "@/utils/api-response";
import { getBatchParameters } from "@/utils/batch";
import { z } from "zod";

const QuerySchema = z.object({
    id: z.string().uuid().optional(),
});
export async function POST(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const queryResult = QuerySchema.safeParse({
            id: searchParams.get('id'),
        });

        const authHeader = req.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer')) {
            return jsonResponse(null, { success: false, message: "Unauthorized", status: 401 })
        }
        const apiKey = authHeader.split(' ')[1]

        if (apiKey !== process.env.ADMIN_API_KEY) {
            return jsonResponse(null, { success: false, message: "Invalid API key", status: 403 })
        }

        if (!queryResult.success) {
            return jsonResponse(null, {
                message: 'Invalid query parameters',
                success: false,
                status: 400,
            })
        }

        const { batchSize, offset } = getBatchParameters(req);

        const { id: userId } = queryResult.data
        const practiceService = new PracticeService();

        if (userId) {
            await practiceService.generateSessionForUser(userId);
            return jsonResponse(null, { success: true, message: "Ok", status: 200 });
        }

        const stats = await practiceService.processUserBatch(batchSize, offset);
        return jsonResponse(stats, { success: true, message: "Ok", status: 200 });
    } catch (error) {
        console.log("[Update Practice Session] :", error);
        return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 });

    }
}




