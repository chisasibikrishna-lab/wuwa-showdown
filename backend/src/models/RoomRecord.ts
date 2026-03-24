import mongoose from "mongoose";

const roomRecordSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  creator: { type: String, required: true },
  players: [
    {
      id: { type: String },
      name: { type: String },
      avatar: { type: String },
      roomScore: { type: Number, default: 0 },
    }
  ],
  challengeCount: { type: Number, default: 0 },
  closedAt: { type: Date, default: null },
}, { timestamps: true });

export const RoomRecord = mongoose.model("RoomRecord", roomRecordSchema);
