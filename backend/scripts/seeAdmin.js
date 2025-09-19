// seedAdmin.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const hashedPassword = await bcrypt.hash("Admin@12345", 10);

    const admin = new User({
      name: "Admin",
      email: "admin@seasonenterprises.com",
      password: hashedPassword,
      role: "admin",
    });

    await admin.save();
    console.log("✅ Admin user created");
    mongoose.disconnect();
  } catch (err) {
    console.error(err);
    mongoose.disconnect();
  }
};

seedAdmin();
