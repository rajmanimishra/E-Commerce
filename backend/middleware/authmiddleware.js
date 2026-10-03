const jwt = require("jsonwebtoken");
const User = require("../schema/schema");

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "No token provided",
        });
    }

    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not configured.");
        return res.status(500).json({
            success: false,
            message: "Authentication is not configured on the server.",
        });
    }

    let decoded;
    try {
        const token = authHeader.split(" ")[1];
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid token",
        });
    }

    const userId = decoded.userId || decoded.id || decoded._id;

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Invalid token",
        });
    }

    try {
        const user = await User.findById(userId).select("_id role isActive");

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: "This account is unavailable. Please contact the store.",
            });
        }

        req.user = {
            ...decoded,
            userId: user._id,
            role: user.role || "customer",
        };
        req.userId = user._id;
        next();
    } catch (error) {
        console.error("Authentication Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to verify your account right now.",
        });
    }
};

module.exports = authMiddleware;