import mongoose from "mongoose";

const participantSchema = new mongoose.Schema({
  seed: { type: Number, required: true },
  name: { type: String, required: true },
}, { _id: false });

const matchSchema = new mongoose.Schema({
  matchId: { type: String, required: true },
  round: { type: Number, required: true },
  position: { type: Number, required: true },
  bracket: { type: String, enum: ["winners", "losers", "grand"], default: "winners" },
  participant1Seed: { type: Number, default: null },
  participant2Seed: { type: Number, default: null },
  winnerSeed: { type: Number, default: null },
  score1: { type: Number, default: 0 },
  score2: { type: Number, default: 0 },
  venue: { type: String, default: null },
  status: { type: String, enum: ["pending", "active", "completed", "bye"], default: "pending" },
}, { _id: false });

const bracketSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["single", "double"], required: true },
  status: { type: String, enum: ["draft", "active", "completed"], default: "draft" },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  creatorName: { type: String, required: true },
  shareCode: { type: String, unique: true, required: true },
  participants: [participantSchema],
  randomizeSeeding: { type: Boolean, default: false },
  venues: { type: [String], default: [] },
  matches: [matchSchema],
  champion: { type: String, default: null },
}, { timestamps: true });

bracketSchema.index({ shareCode: 1 });
bracketSchema.index({ creatorId: 1 });

export const Bracket = mongoose.model("Bracket", bracketSchema);
