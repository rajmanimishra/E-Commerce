const adminMiddleware = (req, res, next) => {
    // 1. अगर यूजर लॉग इन ही नहीं है
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required. Please log in.",
        });
    }

    // 2. अगर यूजर लॉग इन है लेकिन एडमिन नहीं है
    if (req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Access denied. Admin privileges required.",
        });
    }

    next();
};

module.exports = adminMiddleware;