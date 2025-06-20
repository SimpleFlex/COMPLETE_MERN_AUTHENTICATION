import mongoose from "mongoose";
import bcrypt from "bcrypt";

export const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: {
    type: String,
    minLength: [8, "Password must be at least 8 characters"],
    kMaxLength: [32, "Password must be at most 32 characters"],
  },
  phone: String,
  accountVerified: { type: Boolean, default: false },
  verificationCode: Number,
  verificationCodeExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next(); // skip hashing if password wasn't modified
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateVerificationCode = function () {
  function generateFiveRandomDigitCode() {
    const firstDigit = Math.floor(Math.random() * 9) + 1;
    const remainingDegit = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(4, 0);

    return parseInt(firstDigit + remainingDegit);
  }
  const verificationCode = generateFiveRandomDigitCode();
  this.verificationCode = verificationCode;
  this.verificationCodeExpire = Date.now() + 5 * 60 * 1000;

  return verificationCode;
};

export const User = mongoose.model("User", userSchema);
