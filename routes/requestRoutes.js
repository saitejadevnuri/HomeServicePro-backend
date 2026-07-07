import express from "express";
import { updateRequestStatus } from "../controllers/requestController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { createRequest, getWorkerJobs } from "../controllers/requestController.js";

const router = express.Router();

// Customer creates a new request
router.post("/create", protect, authorizeRoles("customer"), createRequest);

// Worker views assigned jobs
router.get("/myjobs", protect, authorizeRoles("worker"), getWorkerJobs);

// Worker updates job status
router.put("/update-status", protect, authorizeRoles("worker"), updateRequestStatus);

export default router;
