import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import Request from "../models/Request.js";

const router = express.Router();

// ✅ Get all requests of logged-in customer
router.get("/myrequests", protect, authorizeRoles("customer"), async (req, res) => {
  try {
    const requests = await Request.find({ customerId: req.user._id })
      .populate("assignedWorkerId", "name email role specialization")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
