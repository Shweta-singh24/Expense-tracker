import mongoose from "mongoose";

const expSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Food", "Travel", "Shopping", "Rent", "Other"], // optional predefined categories
    },
     date: {
      type: Date,
      default: Date.now, // defaults to today if not provided
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Mongoose model banaya
const exp = mongoose.model("exp", expSchema);

export default exp ;