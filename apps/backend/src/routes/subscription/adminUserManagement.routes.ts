import { Router } from "express";
import { authenticate, isAdmin } from "@/middleware/auth.middleware";
import { AdminUserManagementController } from "@/controllers/subscription/adminUserManagement.controller";

const router = Router();
const adminUserManagementController = new AdminUserManagementController();

// All routes require admin authentication
router.use(authenticate, isAdmin);

// Get all users with pagination
router.get("/users", adminUserManagementController.getAllUsers);

// Get user details
router.get("/user", adminUserManagementController.getUser);

// Create new user
router.post("/user", adminUserManagementController.createUser);

// Update user role
router.patch("/user/role", adminUserManagementController.updateUserRole);

// Update user details
router.patch("/user", adminUserManagementController.updateUser);

// Delete user
router.delete("/user", adminUserManagementController.deleteUser);

export default router;

