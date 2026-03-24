import mongoose from "mongoose";

const challengeRecordSchema = new mongoose.Schema({
  liveId: { type: String, index: true },  // in-memory game challenge ID for dedup
  roomRecordId: { type: mongoose.Schema.Types.ObjectId, ref: "RoomRecord", required: true },
  roomCode: { type: String, required: true },
  timeLimitSeconds: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now },
  results: [
    {
      playerId: { type: String },
      playerName: { type: String },
      playerAvatar: { type: String },
      points: { type: Number },
      distance: { type: Number },
      timeTaken: { type: Number },
    }
  ],
  historicalRankings: {
    before: [
      {
        id: { type: String },
        name: { type: String },
        avatar: { type: String },
        roomScore: { type: Number },
      }
    ],
    after: [
      {
        id: { type: String },
        name: { type: String },
        avatar: { type: String },
        roomScore: { type: Number },
      }
    ],
  },
}, { timestamps: true });

export const ChallengeRecord = mongoose.model("ChallengeRecord", challengeRecordSchema);
