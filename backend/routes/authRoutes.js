const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const User = require("../schema/schema");
const authMiddleware = require("../middleware/authmiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

const passwordResetResponse = {
    message: "If an account exists for that email, a password reset link will be sent shortly."
};

// ⚡ मेलर ट्रांसपोर्टर को कैश रखें ताकि हर बार नया इंस्टेंस न बने
let cachedMailer = null;
function getPasswordResetMailer() {
    if (cachedMailer) return cachedMailer;

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;
    const port = Number(SMTP_PORT || 587);

    if (!SMTP_HOST || !Number.isInteger(port) || port < 1 || port > 65535 ||
        !SMTP_USER || !SMTP_PASS || !MAIL_FROM) {
        return null;
    }

    cachedMailer = nodemailer.createTransport({
        host: SMTP_HOST,
        port,
        secure: port === 465,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
        }
    });

    return cachedMailer;
}

function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
    })[character]);
}

// ===============================
// REGISTER
// ===============================
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (
            typeof name !== "string" || !name.trim() ||
            typeof email !== "string" || !email.trim() ||
            typeof password !== "string" || password.length < 6
        ) {
            return res.status(400).json({
                message: "Valid name, email, and password (min 6 characters) are required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // ⚡ केवल _id से चेक करें ताकि पूरा डॉक्यूमेंट फेच न करना पड़े
        const existingUser = await User.findOne({ email: normalizedEmail }).select("_id").lean();
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: "customer"
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "User already exists" });
        }
        console.error("Registration Error:", error);
        res.status(500).json({ message: "Unable to create the account right now." });
    }
});

// ===============================
// LOGIN
// ===============================
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (typeof email !== "string" || !email.trim() || typeof password !== "string" || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password").lean();

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (user.isActive === false) {
            return res.status(403).json({
                message: "This account is unavailable. Please contact the store."
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not configured.");
            return res.status(500).json({ message: "Login is not configured on the server." });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role || "customer" },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role || "customer"
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ===============================
// ADMIN LOGIN
// ===============================
router.post("/admin/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (typeof email !== "string" || !email.trim() || typeof password !== "string" || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase(),
            role: "admin",
            isActive: { $ne: false }
        }).select("+password").lean();

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not configured.");
            return res.status(500).json({ message: "Login is not configured on the server." });
        }

        const token = jwt.sign(
            { userId: user._id, role: "admin" },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Admin login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: "admin"
            }
        });
    } catch (error) {
        console.error("Admin Login Error:", error);
        res.status(500).json({ message: "Unable to sign in right now." });
    }
});

// ===============================
// GET CURRENT USER PROFILE (⚡ Crash-Safe & Fast)
// ===============================
router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({ message: "Unauthorized. Invalid session." });
        }

        const user = await User.findById(userId)
            .select("name email role isActive")
            .lean();

        if (!user) {
            return res.status(404).json({ message: "User account not found." });
        }

        res.status(200).json({
            message: "Profile accessed successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role || "customer"
            }
        });
    } catch (error) {
        console.error("Profile Fetch Error:", error);
        res.status(500).json({ message: "Unable to fetch profile." });
    }
});

// ===============================
// FORGOT PASSWORD
// ===============================
router.post("/forgot-password", async (req, res) => {
    const mailer = getPasswordResetMailer();

    if (!mailer || !process.env.FRONTEND_URL) {
        console.error("Password reset requires SMTP settings and FRONTEND_URL.");
        return res.status(503).json({
            message: "Password reset email is not configured. Please contact the store."
        });
    }

    const { email } = req.body;
    if (typeof email !== "string" || !email.trim()) {
        return res.status(400).json({ message: "Enter the email address for your account." });
    }

    let resetUrl;
    try {
        resetUrl = new URL(process.env.FRONTEND_URL);
        resetUrl.pathname = `${resetUrl.pathname.replace(/\/+$/, "")}/reset-password`;
    } catch (error) {
        return res.status(503).json({ message: "Invalid FRONTEND_URL configuration." });
    }

    try {
        const user = await User.findOne({
            email: email.trim().toLowerCase(),
            role: { $ne: "admin" },
            isActive: { $ne: false }
        }).select("+passwordResetRequestedAt");

        if (!user) {
            return res.status(200).json(passwordResetResponse);
        }

        const cooldown = 60 * 1000;
        if (user.passwordResetRequestedAt && Date.now() - user.passwordResetRequestedAt.getTime() < cooldown) {
            return res.status(200).json(passwordResetResponse);
        }

        const resetToken = crypto.randomBytes(32).toString("base64url");
        const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

        user.resetPasswordToken = tokenHash;
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
        user.passwordResetRequestedAt = new Date();
        await user.save();

        resetUrl.searchParams.set("token", resetToken);
        const safeName = escapeHtml(user.name);

        try {
            await mailer.sendMail({
                from: process.env.MAIL_FROM,
                to: user.email,
                subject: "Reset your Grocify password",
                text: `Hi ${user.name},\n\nUse this link to choose a new password:\n${resetUrl.toString()}\n\nExpires in 15 minutes.`,
                html: `<p>Hi ${safeName},</p><p>Use the link below to choose a new password. It expires in 15 minutes.</p><p><a href="${resetUrl.toString()}">Reset your password</a></p>`
            });
        } catch (error) {
            await User.updateOne(
                { _id: user._id },
                {
                    $unset: { resetPasswordToken: "", resetPasswordExpires: "" },
                    $set: { passwordResetRequestedAt: null }
                }
            );
            throw error;
        }

        return res.status(200).json(passwordResetResponse);
    } catch (error) {
        console.error("Forgot Password Error:", error);
        return res.status(500).json({
            message: "Unable to send a password reset email right now. Please try again later."
        });
    }
});

// ===============================
// RESET PASSWORD
// ===============================
router.post("/reset-password", async (req, res) => {
    const { token, password } = req.body;

    if (typeof token !== "string" || !/^[A-Za-z0-9_-]{40,}$/.test(token)) {
        return res.status(400).json({ message: "This reset link is invalid or has expired." });
    }

    if (typeof password !== "string" || password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }

    try {
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.findOneAndUpdate(
            {
                resetPasswordToken: tokenHash,
                resetPasswordExpires: { $gt: new Date() },
                isActive: { $ne: false },
                role: { $ne: "admin" }
            },
            {
                $set: { password: hashedPassword },
                $unset: {
                    resetPasswordToken: "",
                    resetPasswordExpires: "",
                    passwordResetRequestedAt: ""
                }
            },
            { new: true }
        ).lean();

        if (!user) {
            return res.status(400).json({ message: "This reset link is invalid or has expired." });
        }

        return res.status(200).json({ message: "Your password has been reset. You can now sign in." });
    } catch (error) {
        console.error("Reset Password Error:", error);
        return res.status(500).json({ message: "Unable to reset password right now." });
    }
});

// ===============================
// ADMIN: GET CUSTOMERS (⚡ Lean & Fast)
// ===============================
router.get("/admin/customers", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const customers = await User.find({
            $or: [{ role: "customer" }, { role: { $exists: false } }]
        })
            .select("name email isActive createdAt")
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            customers: customers.map((c) => ({
                id: c._id,
                name: c.name,
                email: c.email,
                isActive: c.isActive !== false,
                createdAt: c.createdAt
            }))
        });
    } catch (error) {
        console.error("Get Customers Error:", error);
        res.status(500).json({ success: false, message: "Unable to load customer accounts." });
    }
});

// ===============================
// ADMIN: UPDATE CUSTOMER STATUS
// ===============================
router.patch("/admin/customers/:id/status", authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid customer ID." });
    }

    try {
        const { isActive } = req.body;
        if (typeof isActive !== "boolean") {
            return res.status(400).json({ success: false, message: "A valid account status is required." });
        }

        const customer = await User.findOneAndUpdate(
            { _id: id, role: { $ne: "admin" } },
            { $set: { isActive } },
            { new: true }
        ).select("_id isActive").lean();

        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer account not found." });
        }

        res.status(200).json({
            success: true,
            message: `Customer account ${isActive ? "reactivated" : "suspended"}.`,
            customer: { id: customer._id, isActive: customer.isActive }
        });
    } catch (error) {
        console.error("Update Customer Status Error:", error);
        res.status(500).json({ success: false, message: "Unable to update customer account." });
    }
});

module.exports = router;