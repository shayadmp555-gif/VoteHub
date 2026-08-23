const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("./models/User");

async function resetAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    // 👇 Yaha apna ADMIN EMAIL likho
    const adminEmail = "shayad@gmail.com";

    // 👇 Yaha NEW PASSWORD likho
    const newPassword = "shayad@12345";

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await User.updateOne(
      { email: adminEmail },
      {
        $set: {
          password: hashedPassword,
          role: "admin"
        }
      }
    );

    if (result.matchedCount === 0) {
      console.log("❌ Admin user nahi mila.");
    } else {
      console.log("✅ Admin password successfully reset!");
      console.log("Email:", adminEmail);
      console.log("New Password:", newPassword);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
    await mongoose.disconnect();
  }
}

resetAdmin();