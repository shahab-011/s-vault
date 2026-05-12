import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    content: {
      type: String,
      default: "",
      maxlength: 750000,
    },
    ciphertext: {
      type: String,
      default: "",
    },
    iv: {
      type: String,
      default: "",
    },
    salt: {
      type: String,
      default: "",
    },
    kdf: {
      type: String,
      default: "",
    },
    algo: {
      type: String,
      default: "",
    },
    version: {
      type: Number,
      default: 1,
    },
    revision: {
      type: Number,
      default: 1,
      index: true,
    },
    type: {
      type: String,
      enum: ["text", "code"],
      default: "text",
      index: true,
    },
    language: {
      type: String,
      enum: ["cpp", "c", "java", "python", "javascript"],
      default: "cpp",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Note", noteSchema);
