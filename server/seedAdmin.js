require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { User } = require("./models/user");

(async () => {
  try {
    if (!process.env.DB) throw new Error("Missing DB variable in .env");
    await mongoose.connect(process.env.DB);

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) {
      console.log("Set ADMIN_EMAIL and ADMIN_PASSWORD in the .env file.");
      await mongoose.disconnect();
      process.exit(1);
    }

    const salt = await bcrypt.genSalt(Number(process.env.SALT || 10));
    const hash = await bcrypt.hash(password, salt);

    const existing = await User.findOne({ email });
    if (existing) {
      existing.role = "admin";
      existing.password = hash;
      await existing.save();
      console.log(`Updated user '${email}' to admin role.`);
    } else {
      await new User({
        firstName: process.env.ADMIN_FIRSTNAME || "Admin",
        lastName: process.env.ADMIN_LASTNAME || "User",
        email,
        password: hash,
        role: "admin",
      }).save();
      console.log(`Created admin user '${email}'.`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
