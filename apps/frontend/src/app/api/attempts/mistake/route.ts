import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";
import { getAuthSession } from "@/utils/session";

interface MistakeRequestBody {
    attemptId: string;
    mistake: string;
}

export async function PATCH(req: Request): Promise<Response> {
    try {
        const body: MistakeRequestBody = await req.json();
        const { attemptId, mistake } = body;

        // Validate input
        if (!attemptId || !mistake) {
            return jsonResponse(null, {
                success: false,
                message: "Attempt ID and mistake reason are required",
                status: 400,
            });
        }

        // Check authentication
        const session = await getAuthSession();
        if (!session?.user) {
            return jsonResponse(null, {
                success: false,
                message: "Unauthorized",
                status: 401,
            });
        }

        const userId = session.user.id;

        // Update attempt with mistake - verify ownership
        const updatedAttempt = await prisma.attempt.updateMany({
            where: {
                id: attemptId,
                userId: userId, // Ensure user owns this attempt
            },
            data: {
                mistake: mistake,
            },
        });

        if (updatedAttempt.count === 0) {
            return jsonResponse(null, {
                success: false,
                message: "Attempt not found or unauthorized",
                status: 404,
            });
        }

        return jsonResponse(null, {
            success: true,
            message: "Mistake feedback recorded successfully",
            status: 200,
        });

    } catch (error: unknown) {
        console.error("[MistakeAPI] Error:", error);
        return jsonResponse(null, {
            success: false,
            message: "Failed to record mistake feedback",
            status: 500,
        });
    }
}
