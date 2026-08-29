const { chatWithAI } = require("../services/openRouterService");

const chatWithAIController = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Message is required"
            });
        }

        console.log("AI USER MESSAGE:", message);
        console.log("AI USER ID:", req.user.userId);

        const response = await chatWithAI({
            message,
            userId: req.user.userId
        });

        return res.status(200).json({
            success: true,
            response
        });

    } catch (error) {
        console.error("========== AI ERROR ==========");
        console.error("Message:", error.message);
        console.error("Status:", error.status);
        console.error("==============================");

        return res.status(500).json({
            success: false,
            message: "AI service failed",
            error: error.message
        });
    }
};

module.exports = {
    chatWithAI: chatWithAIController
};