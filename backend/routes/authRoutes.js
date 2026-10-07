const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../schema/schema");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const authMiddleware = require("../middleware/authmiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();
const passwordResetResponse = {
    message: "If an account exists for that email, a password reset link will be sent shortly."
};
function getPasswordResetMailer() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;
    const port = Number(SMTP_PORT || 587);

    if (!SMTP_HOST || !Number.isInteger(port) || port < 1 || port > 65535 ||
        !SMTP_USER || !SMTP_PASS || !MAIL_FROM) {
        return null;
    }

    return nodemailer.createTransport({
        host: SMTP_HOST,
        port,
        secure: port === 465,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
        }
    });
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

router.post("/profile/recovery-codes", authMiddleware, async (req, res) => {
    if (req.user.role === "admin") {
        return res.status(403).json({
            message: "Recovery codes are only available for customer accounts."
        });
    }

    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                message: "Customer account not found."
            });
        }

        const recoveryCodes = Array.from(
            { length: 10 },
            () => crypto.randomBytes(16).toString("hex").toUpperCase()
        );
        user.recoveryCodeHashes = recoveryCodes.map((code) =>
            crypto.createHash("sha256").update(code).digest("hex")
        );
        await user.save();

        return res.status(200).json({
            message: "Save these codes somewhere safe. They will only be shown once.",
            recoveryCodes
        });
    } catch (error) {
        console.error("Recovery code generation failed:", error);
        return res.status(500).json({
            message: "Unable to generate recovery codes right now."
        });
    }
});

router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check all fields
        if (
            typeof name !== "string" || !name.trim() ||
            typeof email !== "string" || !email.trim() ||
            typeof password !== "string" || !password
        ) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Check whether user already exists
        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
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
            return res.status(400).json({
                message: "User already exists"
            });
        }

        console.error("Registration Error:", error);
        res.status(500).json({
            message: "Unable to create the account right now."
        });
    }
});


// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check all fields
        if (typeof email !== "string" || !email.trim() || typeof password !== "string" || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Find user by email
        const user = await User.findOne({ email: email.trim().toLowerCase() });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Compare password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }
        if (!user.isActive) {
            return res.status(403).json({
                message: "This account is unavailable. Please contact the store."
            });
        }
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not configured.");
            return res.status(500).json({
                message: "Login is not configured on the server."
            });
        }
        const token = jwt.sign(
            { userId: user._id, role: user.role || "customer" },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
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
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});

router.post("/admin/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (typeof email !== "string" || !email.trim() || typeof password !== "string" || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase(),
            role: "admin",
            isActive: { $ne: false }
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not configured.");
            return res.status(500).json({
                message: "Login is not configured on the server."
            });
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
        res.status(500).json({
            message: "Unable to sign in right now."
        });
    }
});

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
        return res.status(400).json({
            message: "Enter the email address for your account."
        });
    }

    let resetUrl;
    try {
        resetUrl = new URL(process.env.FRONTEND_URL);
        if (!["http:", "https:"].includes(resetUrl.protocol)) {
            throw new Error("FRONTEND_URL must use HTTP or HTTPS.");
        }
        resetUrl.pathname = `${resetUrl.pathname.replace(/\/+$/, "")}/reset-password`;
        resetUrl.search = "";
        resetUrl.hash = "";
    } catch (error) {
        console.error("Invalid FRONTEND_URL for password reset:", error.message);
        return res.status(503).json({
            message: "Password reset email is not configured. Please contact the store."
        });
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
        if (
            user.passwordResetRequestedAt &&
            Date.now() - user.passwordResetRequestedAt.getTime() < cooldown
        ) {
            return res.status(200).json(passwordResetResponse);
        }

        const resetToken = crypto.randomBytes(32).toString("base64url");
        const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        const requestTime = new Date();

        user.resetPasswordToken = tokenHash;
        user.resetPasswordExpires = expiresAt;
        user.passwordResetRequestedAt = requestTime;
        await user.save();

        resetUrl.searchParams.set("token", resetToken);
        const safeName = escapeHtml(user.name);

        try {
            await mailer.sendMail({
                from: process.env.MAIL_FROM,
                to: user.email,
                subject: "Reset your Grocify password",
                text: `Hi ${user.name},\n\nUse this link to choose a new password:\n${resetUrl.toString()}\n\nThis link expires in 15 minutes. If you did not request a reset, you can ignore this email.`,
                html: `<p>Hi ${safeName},</p><p>Use the link below to choose a new password. It expires in 15 minutes.</p><p><a href="${resetUrl.toString()}">Reset your password</a></p><p>If you did not request a reset, you can ignore this email.</p>`
            });
        } catch (error) {
            await User.updateOne(
                { _id: user._id, resetPasswordToken: tokenHash },
                {
                    $unset: {
                        resetPasswordToken: "",
                        resetPasswordExpires: ""
                    },
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

router.post("/forgot-password/recovery-code", async (req, res) => {
    const { email, code } = req.body;
    if (
        typeof email !== "string" || !email.trim() ||
        typeof code !== "string" || !/^[A-Fa-f0-9]{32}$/.test(code.trim())
    ) {
        return res.status(400).json({
            message: "Enter your account email and a valid recovery code."
        });
    }

    try {
        const token = crypto.randomBytes(32).toString("base64url");
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
        const codeHash = crypto.createHash("sha256").update(code.trim().toUpperCase()).digest("hex");
        const user = await User.findOneAndUpdate(
            {
                email: email.trim().toLowerCase(),
                role: { $ne: "admin" },
                isActive: { $ne: false },
                recoveryCodeHashes: codeHash
            },
            {
                $pull: { recoveryCodeHashes: codeHash },
                $set: {
                    resetPasswordToken: tokenHash,
                    resetPasswordExpires: new Date(Date.now() + 15 * 60 * 1000)
                }
            },
            { new: true }
        );

        if (!user) {
            return res.status(400).json({
                message: "The recovery code is invalid or already used. Try another saved code."
            });
        }

        return res.status(200).json({
            message: "Recovery code accepted. Choose a new password.",
            token
        });
    } catch (error) {
        console.error("Recovery code password reset failed:", error);
        return res.status(500).json({
            message: "Unable to verify this recovery code right now."
        });
    }
});

router.post("/reset-password", async (req, res) => {
    const { token, password } = req.body;

    if (typeof token !== "string" || !/^[A-Za-z0-9_-]{40,}$/.test(token)) {
        return res.status(400).json({
            message: "This reset link is invalid or has expired. Request a new one."
        });
    }

    if (typeof password !== "string" || password.length < 8) {
        return res.status(400).json({
            message: "Choose a password with at least 8 characters."
        });
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
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(400).json({
                message: "This reset link is invalid or has expired. Request a new one."
            });
        }

        return res.status(200).json({
            message: "Your password has been reset. You can now sign in."
        });
    } catch (error) {
        console.error("Reset Password Error:", error);
        return res.status(500).json({
            message: "Unable to reset your password right now. Please try again."
        });
    }
});

router.get("/admin/customers", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const customers = await User.find({
            $or: [
                { role: "customer" },
                { role: { $exists: false } }
            ]
        })
            .select("name email isActive createdAt")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            customers: customers.map((customer) => ({
                id: customer._id,
                name: customer.name,
                email: customer.email,
                isActive: customer.isActive !== false,
                createdAt: customer.createdAt
            }))
        });
    } catch (error) {
        console.error("Get Customers Error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to load customer accounts."
        });
    }
});

router.patch("/admin/customers/:id/status", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { isActive } = req.body;

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "A valid account status is required."
            });
        }

        const customer = await User.findOne({
            _id: req.params.id,
            role: { $ne: "admin" }
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer account not found."
            });
        }

        customer.isActive = isActive;
        await customer.save();

        res.status(200).json({
            success: true,
            message: `Customer account ${isActive ? "reactivated" : "suspended"}.`,
            customer: {
                id: customer._id,
                isActive: customer.isActive
            }
        });
    } catch (error) {
        console.error("Update Customer Status Error:", error);
        res.status(error.name === "CastError" ? 400 : 500).json({
            success: false,
            message: error.name === "CastError"
                ? "Invalid customer account."
                : "Unable to update this customer account."
        });
    }
});

router.patch("/admin/customers/:id/password", authMiddleware, adminMiddleware, async (req, res) => {
    const { password } = req.body;
    if (typeof password !== "string" || password.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Choose a password with at least 8 characters."
        });
    }

    try {
        const customer = await User.findOne({
            _id: req.params.id,
            $or: [
                { role: "customer" },
                { role: { $exists: false } }
            ]
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer account not found."
            });
        }

        customer.password = await bcrypt.hash(password, 10);
        customer.resetPasswordToken = undefined;
        customer.resetPasswordExpires = undefined;
        await customer.save();

        return res.status(200).json({
            success: true,
            message: `Password updated for ${customer.email}.`
        });
    } catch (error) {
        console.error("Update Customer Password Error:", error);
        return res.status(error.name === "CastError" ? 400 : 500).json({
            success: false,
            message: error.name === "CastError"
                ? "Invalid customer account."
                : "Unable to update this customer password."
        });
    }
});

router.post("/admin/customers/:id/password-reset", authMiddleware, adminMiddleware, async (req, res) => {
    const mailer = getPasswordResetMailer();
    if (!mailer || !process.env.FRONTEND_URL) {
        console.error("Password reset requires SMTP settings and FRONTEND_URL.");
        return res.status(503).json({
            success: false,
            message: "Password reset email is not configured. Please contact the store."
        });
    }

    let resetUrl;
    try {
        resetUrl = new URL(process.env.FRONTEND_URL);
        if (!["http:", "https:"].includes(resetUrl.protocol)) {
            throw new Error("FRONTEND_URL must use HTTP or HTTPS.");
        }
        resetUrl.pathname = `${resetUrl.pathname.replace(/\/+$/, "")}/reset-password`;
        resetUrl.search = "";
        resetUrl.hash = "";
    } catch (error) {
        console.error("Invalid FRONTEND_URL for password reset:", error.message);
        return res.status(503).json({
            success: false,
            message: "Password reset email is not configured. Please contact the store."
        });
    }

    try {
        const customer = await User.findOne({
            _id: req.params.id,
            $or: [
                { role: "customer" },
                { role: { $exists: false } }
            ]
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer account not found."
            });
        }

        const resetToken = crypto.randomBytes(32).toString("base64url");
        const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
        customer.resetPasswordToken = tokenHash;
        customer.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
        await customer.save();

        resetUrl.searchParams.set("token", resetToken);
        const safeName = escapeHtml(customer.name);

        try {
            await mailer.sendMail({
                from: process.env.MAIL_FROM,
                to: customer.email,
                subject: "Reset your Grocify password",
                text: `Hi ${customer.name},\n\nA store administrator requested a password reset for your account. Use this link to choose a new password:\n${resetUrl.toString()}\n\nThis link expires in 15 minutes. If you did not expect this email, contact the store.`,
                html: `<p>Hi ${safeName},</p><p>A store administrator requested a password reset for your account. Use the link below to choose a new password. It expires in 15 minutes.</p><p><a href="${resetUrl.toString()}">Reset your password</a></p><p>If you did not expect this email, contact the store.</p>`
            });
        } catch (error) {
            await User.updateOne(
                { _id: customer._id, resetPasswordToken: tokenHash },
                { $unset: { resetPasswordToken: "", resetPasswordExpires: "" } }
            );
            throw error;
        }

        return res.status(200).json({
            success: true,
            message: `Password reset email sent to ${customer.email}.`
        });
    } catch (error) {
        console.error("Send Customer Password Reset Error:", error);
        return res.status(error.name === "CastError" ? 400 : 500).json({
            success: false,
            message: error.name === "CastError"
                ? "Invalid customer account."
                : "Unable to send a password reset email right now."
        });
    }
});


router.get("/profile", authMiddleware, async (req, res) => {

    const user = await User.findById(req.user.userId);

    res.status(200).json({
        message: "Profile accessed successfully",
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role || "customer"
        }
    });

});
module.exports = router;