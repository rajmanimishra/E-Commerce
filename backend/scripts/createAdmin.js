require("dotenv").config();

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const connectDB = require("../db/db");
const User = require("../schema/schema");

const BCRYPT_SALT_ROUNDS = 12;

async function createAdmin() {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
    const email = ADMIN_EMAIL?.trim().toLowerCase();
    const name = ADMIN_NAME?.trim();

    if (!name || !email || !ADMIN_PASSWORD) {
        throw new Error("ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must be defined in .env");
    }

    if (ADMIN_PASSWORD.length < 12) {
        throw new Error("ADMIN_PASSWORD must be at least 12 characters long.");
    }

    await connectDB();

    // 1. पासवर्ड हैश करें
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, BCRYPT_SALT_ROUNDS);

    // 2. एडमिन को क्रिएट या अपडेट करें
    const adminUser = await User.findOneAndUpdate(
        { email },
        {
            $set: {
                name,
                email,
                password: hashedPassword,
                role: "admin",
                isActive: true,
            }
        },
        {
            upsert: true,
            new: true, // Mongoose में 'new: true' या 'returnDocument: "after"' दोनों मान्य हैं
            runValidators: true,
            setDefaultsOnInsert: true
        }
    ).lean(); // lean() से अननेसेसरी Mongoose डॉक्यूमेंट रैपिंग से बचा जा सकता है

    console.log(`Admin account successfully provisioned for: ${adminUser.email}`);
}

createAdmin()
    .then(() => {
        process.exitCode = 0;
    })
    .catch((error) => {
        console.error("Admin creation failed:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        try {
            await mongoose.disconnect();
        } catch (err) {
            console.error("Error disconnecting MongoDB:", err.message);
        }
    });