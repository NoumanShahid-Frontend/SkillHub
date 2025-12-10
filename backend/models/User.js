import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    userId: {
    type: String,
    unique: true,
  },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
      role: {
      type: String,
      // enum: ["admin", "user"],
      default: "admin",
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
