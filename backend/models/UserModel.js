import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
  {
    name: String,

    email: {
      type: String,
      unique: true,
    },

    password: String,

    role: {
      type: String,
      enum: ["student", "admin", "proctor"],
      default: "student",
    },

    approved: {
      type: Boolean,
      default: false,
    },

    profileImage: String,
    preferredLanguage: {
      type: String,
      default: "en",
    },
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "dark",
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (
  enteredPassword
) {
  return await bcrypt.compare(
    enteredPassword,
    this.password
  );
};

userSchema.pre("save", async function () {
  // For async pre middleware, avoid calling `next()` —
  // simply return early when password isn't modified.
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

export default User;