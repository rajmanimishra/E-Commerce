require("dotenv").config();

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const connectDB = require("../db/db");
const User = require("../schema/schema");

async function createAdmin() {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
    const email = ADMIN_EMAIL?.trim().toLowerCase();

    if (!ADMIN_NAME?.trim() || !email || !ADMIN_PASSWORD) {
        throw new Error("Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD before creating an admin.");
    }

    if (ADMIN_PASSWORD.length < 12) {
        throw new Error("ADMIN_PASSWORD must be at least 12 characters long.");
    }

    await connectDB();

    const password = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await User.findOneAndUpdate(
        { email },
        {
            name: ADMIN_NAME.trim(),
            email,
            password,
            role: "admin",
            isActive: true,
        },
        {
            upsert: true,
            returnDocument: "after",
            runValidators: true,
            setDefaultsOnInsert: true
        }
    );

    console.log(`Admin account ready for ${email}.`);
}

createAdmin()
    .catch((error) => {
        console.error("Could not create the admin account:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
