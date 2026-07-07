import Request from "../models/Request.js";
import User from "../models/User.js";

// ===========================
// CREATE REQUEST (Auto Assign Worker)
// ===========================
export const createRequest = async (req, res) => {
  try {
    const { problem, category } = req.body;
    const customerId = req.user._id;

    // 1️⃣ Find all workers with matching specialization
    const workers = await User.find({ 
      role: "worker",
      specialization: category 
    });

    let selectedWorkerId = null;

    if (workers.length > 0) {
      // 2️⃣ Count jobs for each worker
      const workersWithJobCount = await Promise.all(
        workers.map(async (worker) => {
          const jobCount = await Request.countDocuments({
            assignedWorkerId: worker._id,
            status: { $ne: "completed" }   // Only count active jobs
          });
          return { worker, jobCount };
        })
      );

      // 3️⃣ Sort workers by least jobs → most jobs
      workersWithJobCount.sort((a, b) => a.jobCount - b.jobCount);

      // 4️⃣ Select the worker with the fewest jobs
      selectedWorkerId = workersWithJobCount[0].worker._id;
    }

    // 5️⃣ Create request
    const newRequest = new Request({
      customerId,
      problem,
      category,
      assignedWorkerId: selectedWorkerId,
      status: selectedWorkerId ? "assigned" : "pending",
    });

    await newRequest.save();

    return res.status(201).json({
      message: selectedWorkerId
        ? "Request created and worker assigned!"
        : "Request created but no matching worker found.",
      request: newRequest,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// ===========================
// WORKER – VIEW THEIR JOBS
// ===========================
export const getWorkerJobs = async (req, res) => {
  try {
    const workerId = req.user._id;
    const jobs = await Request.find({ assignedWorkerId: workerId });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ===========================
// WORKER – UPDATE JOB STATUS
// ===========================
export const updateRequestStatus = async (req, res) => {
  try {
    const workerId = req.user._id;
    const { requestId, status } = req.body;

    const request = await Request.findOne({
      _id: requestId,
      assignedWorkerId: workerId,
    });

    if (!request) {
      return res.status(404).json({
        message: "Request not found or not assigned to you.",
      });
    }

    request.status = status;
    await request.save();

    res.json({
      message: `Request marked as ${status}`,
      request,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
