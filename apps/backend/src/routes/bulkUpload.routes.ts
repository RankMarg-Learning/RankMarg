import { Router } from "express";
import { authenticate } from "@/middleware/auth.middleware";
import { BulkUploadController } from "@/controllers/bulkUpload.controller";

const router = Router();
const bulkUploadController = new BulkUploadController();

router.post("/", authenticate, bulkUploadController.createJob);

router.get("/", authenticate, bulkUploadController.getJobs);

router.get("/:jobId/status", authenticate, bulkUploadController.getJobStatus);

router.get("/health", authenticate, bulkUploadController.getBulkUploadHealth);

export default router;
