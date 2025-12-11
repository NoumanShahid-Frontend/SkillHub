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
      required: function() { return !this.googleId; },
      minlength: 6,
    },
    googleId: {
      type: String,
      sparse: true,
    },
    avatar: {
      type: String,
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
