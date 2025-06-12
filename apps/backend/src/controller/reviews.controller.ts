import { ReviewScheduleService } from "../services/auto/reviewSchedule.service";
import { Request, Response } from "express";

export const updateReviews = async (req: Request, res: Response) => {
  try {
    // const type = req.query.type as TypeProps;

    // Authorization check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - Missing or invalid Authorization header",
        status: 401,
        data: null,
      });
      return;
    }
    const apiKey = authHeader.split(" ")[1];
    if (apiKey !== process.env.ADMIN_API_KEY) {
      res.status(403).json({
        success: false,
        message: "Invalid API key",
        status: 403,
        data: null,
      });
      return;
    }

    // Batch parameters
    const batchSize = req.query.batchSize
      ? parseInt(req.query.batchSize as string, 10)
      : 10;
    const offset = req.query.offset
      ? parseInt(req.query.offset as string, 10)
      : 0;

    const masteryService = new ReviewScheduleService();

    // if (type === TypeProps.USER) {
    //   const { userId } = req.body || {};
    //   if (!userId) {
    //     res.status(400).json({
    //       success: false,
    //       message: "Missing userId for user session creation",
    //       status: 400,
    //       data: null,
    //     });
    //     return;
    //   }

    //   await practiceService.generateSessionForUser(userId);
    //   res.status(200).json({
    //     success: true,
    //     message: "Session generated for user",
    //     status: 200,
    //     data: null,
    //   });
    //   return;
    // }

    const stats = await masteryService.processUserBatch(batchSize, offset);
    res.status(200).json({
      success: true,
      message: "Batch session processed",
      status: 200,
      data: stats,
    });
  } catch (error) {
    console.error("[Create Practice Session Error]:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      status: 500,
      data: null,
    });
  }
};
