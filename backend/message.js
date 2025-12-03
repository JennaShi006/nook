import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiredAt: { type: Date, required: true, default: () => new Date(Date.now() + 90 *24 *60 * 60 * 1000)}, // new field
  }
);

messageSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });
const Message = mongoose.model("Message", messageSchema);
export default Message;