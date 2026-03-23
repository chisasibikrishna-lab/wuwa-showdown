import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["player", "admin"], default: "player" },
  totalScore: { type: Number, default: 0 },
  avatar: { type: String },
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
