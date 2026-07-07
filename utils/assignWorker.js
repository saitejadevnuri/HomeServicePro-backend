import User from "../models/User.js";

export const assignWorker = async (category) => {
  try {
    // find the first available worker with matching specialization
    const worker = await User.findOne({
      role: "worker",
      specialization: category,
    });

    return worker ? worker._id : null;
  } catch (err) {
    console.error("Worker assignment failed:", err.message);
    return null;
  }
};
