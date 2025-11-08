import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Cart Item Schema (Handles items in the cart)
const CartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, default: 1 },
});

// User Schema (Main schema for User)
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Invalid email address"],
    },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    cart: [CartItemSchema],
    profilePicture: {
      type: String,
      default: "default-avatar.jpg", // store only filename
    },
  },
  { timestamps: true }
);

// Pre-save hook to hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare password during login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to safely update user profile (allow only name, email, and profilePicture)
userSchema.methods.updateProfile = async function (updates) {
  const allowedFields = ["name", "email", "profilePicture"];

  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      if (key === "profilePicture" && updates[key] !== this.profilePicture) {
        // Ensure it's a valid filename (no path traversal)
        if (/^[a-zA-Z0-9_\-\.]+$/.test(updates[key])) {
          this[key] = updates[key];
        } else {
          throw new Error("Invalid profile picture filename");
        }
      } else {
        this[key] = updates[key];
      }
    }
  }
  return this.save();
};

// Optionally remove password from user object when returning data
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;

  // Construct full URL for profile picture dynamically if needed
  const baseUrl = process.env.BASE_URL || "http://localhost:5000";
  obj.profilePicture = obj.profilePicture.startsWith("http")
    ? obj.profilePicture
    : `${baseUrl}/Profiles/${obj.profilePicture}`;

  return obj;
};

// Create the User model
const User = mongoose.model("User", userSchema);

export default User;
