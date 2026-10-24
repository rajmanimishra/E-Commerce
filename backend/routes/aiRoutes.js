const express = require("express");
const router = express.Router();

const { chatWithAI } = require("../controllers/aiControllers");
const authMiddleware = require("../middleware/authmiddleware");

// ===============================
// AI SHOPPING ASSISTANT CHAT
// POST /api/ai/chat
// ===============================
router.post("/chat", authMiddleware, async (req, res) => {
    try {
        const { message } = req.body;

        // 1. इनपुट वैलिडेशन (खाली मैसेज पर AI API कॉल न करें)
        if (!message || typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid message for the AI assistant."
            });
        }

        // 2. ऑथ मिडलवेयर से userId निकालें (req.user या req.userId के अनुसार)
        const userId = req.user?.userId || req.user?.id || req.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. User ID not found in session."
            });
        }

        // 3. AI कंट्रोलर को कॉल करें
        const reply = await chatWithAI({
            message: message.trim(),
            userId
        });

        return res.status(200).json({
            success: true,
            reply
        });

    } catch (error) {
        console.error("AI Assistant Route Error:", error);
        return res.status(500).json({
            success: false,
            message: "AI assistant is temporarily unavailable. Please try again."
        });
    }
});

module.exports = router;