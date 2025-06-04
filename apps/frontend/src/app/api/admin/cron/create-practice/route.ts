export const dynamic = "force-dynamic";

import { PracticeService } from "@/services/auto/session.service";
import { jsonResponse } from "@/utils/api-response";
import { getBatchParameters } from "@/utils/batch";
import { getAuthSession } from "@/utils/session";

enum TypeProps {
    USER = 'user',
    BATCH = 'batch',
}

export async function POST(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') as TypeProps;

        const authHeader = req.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer')) {
            return jsonResponse(null, { success: false, message: "Unauthorized - Authorization", status: 401 })
        }
        const apiKey = authHeader.split(' ')[1]

        if (apiKey !== process.env.ADMIN_API_KEY) {
            return jsonResponse(null, { success: false, message: "Invalid API key", status: 403 })
        }

        const { batchSize, offset } = getBatchParameters(req);

        const practiceService = new PracticeService();

        if (type === TypeProps.USER) {
            const session = await getAuthSession();
            if (!session) {
                return jsonResponse(null, { success: false, message: "Unauthorized - Type", status: 401 });
            }
            await practiceService.generateSessionForUser(session?.user?.id);
            return jsonResponse(null, { success: true, message: "Ok", status: 200 });
        }

        const stats = await practiceService.processUserBatch(batchSize, offset);
        return jsonResponse(stats, { success: true, message: "Ok", status: 200 });
    } catch (error) {
        console.log("[Update Practice Session] :", error);
        return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 });

    }
}




