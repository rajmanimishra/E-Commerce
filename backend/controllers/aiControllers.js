const { chatWithAI } = require("../services/openRouterService");

const MAX_MESSAGE_LENGTH = 500; // यूज़र प्रॉम्प्ट के लिए एक सुरक्षित सीमा

const chatWithAIController = async (req, res) => {
    try {
        const { message } = req.body;

        // 1. सख्त इनपुट वैलिडेशन
        if (!message || typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "A non-empty message is required.",
            });
        }

        const trimmedMessage = message.trim();

        if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
            return res.status(400).json({
                success: false,
                message: `Message is too long. Please limit to ${MAX_MESSAGE_LENGTH} characters.`,
            });
        }

        // 2. सेफ User ID एक्सट्रैक्शन (req.user और req.userId दोनों के लिए सेफ)
        const userId = req.user?.userId || req.user?.id || req.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. User ID not found in session.",
            });
        }

        // 3. AI सर्विस कॉल
        const aiResponse = await chatWithAI({
            message: trimmedMessage,
            userId,
        });

        return res.status(200).json({
            success: true,
            response: aiResponse,
        });

    } catch (error) {
        console.error("========== AI CONTROLLER ERROR ==========");
        console.error("Message:", error.message);
        if (error.status) console.error("Status:", error.status);
        console.error("=========================================");

        // अगर OpenRouter से रेट लिमिट या कोटा एरर (429) आया हो
        const statusCode = error.status === 429 ? 429 : 500;
        const clientMessage = error.status === 429
            ? "AI service is currently busy. Please wait a moment and try again."
            : "AI service failed to process your request.";

        return res.status(statusCode).json({
            success: false,
            message: clientMessage,
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};

module.exports = {
    chatWithAI: chatWithAIController,
};