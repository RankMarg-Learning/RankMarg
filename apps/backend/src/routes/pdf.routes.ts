import { Router } from "express";
import { PDFController } from "@/controllers/pdf.controller";
import { authenticate } from "@/middleware/auth.middleware";

const router = Router();
const pdfController = new PDFController();

// All routes require authentication
router.use(authenticate);

// Queue a PDF generation job
router.post("/queue", pdfController.queuePDF);

// Get job status
router.get("/job/:jobId", pdfController.getJobStatus);

// Cancel a job
router.delete("/job/:jobId", pdfController.cancelJob);

// Get user's jobs
router.get("/jobs", pdfController.getUserJobs);

// Get queue statistics (admin only - you might want to add admin check)
router.get("/stats", pdfController.getQueueStats);

export default router;