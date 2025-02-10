import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // ✅ Allows multiple null values
      default: null,
    },
    displayName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
    },
    activityLog: [
      {
        activity: String,
        timestamp: Date,
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  // If the password is not being modified, skip the hashing process
  if (!this.isModified("password") || !this.password) return next();

  try {
    // If the password is present, hash it
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err); // Pass any error to the next middleware
  }
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.GENERATE_ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.GENERATE_EXPIRY_TOKEN_SECRET,
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_EXPIRY_TOKEN_SECRET,
    }
  );
};

export const User = mongoose.model("User", userSchema);
