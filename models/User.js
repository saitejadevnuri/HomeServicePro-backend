import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["customer", "worker"],
      required: true,
    },
    specialization: {
      type: String,
      required: function () {
        return this.role === "worker";
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
