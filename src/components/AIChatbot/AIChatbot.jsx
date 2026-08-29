
import { useState } from "react";

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: "Hi! 👋 I'm Grocify AI. What would you like to buy?"
        }
    ]);

    const sendMessage = async () => {
        if (!message.trim() || loading) {
            return;
        }

        const userMessage = message.trim();

        // Show user's message
        setMessages((prev) => [
            ...prev,
            {
                role: "user",
                content: userMessage
            }
        ]);

        setMessage("");
        setLoading(true);

        try {
            // Get JWT token
            const token = localStorage.getItem("token");

            if (!token) {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        content: "Please login first to use Grocify AI."
                    }
                ]);

                return;
            }

            // Send message to Render backend
            const response = await fetch(
                "https://e-commerce-z6p4.onrender.com/api/ai/chat",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        message: userMessage
                    })
                }
            );

            const data = await response.json();

            console.log("AI RESPONSE:", data);

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "AI service failed"
                );
            }

            // Show AI response
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        data.response ||
                        "Sorry, I couldn't find an answer."
                }
            ]);

        } catch (error) {
            console.error("AI Chat Error:", error);

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        "Sorry, I couldn't process your request. Please try again."
                }
            ]);

        } finally {
            setLoading(false);
        }
    };


    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };


    return (
        <>
            {/* ========================= */}
            {/* CHAT BUTTON */}
            {/* ========================= */}

            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="
                        fixed
                        bottom-6
                        right-6
                        z-50
                        flex
                        h-16
                        w-16
                        items-center
                        justify-center
                        rounded-full
                        bg-green-600
                        text-2xl
                        text-white
                        shadow-xl
                        transition
                        duration-200
                        hover:scale-105
                        hover:bg-green-700
                    "
                    aria-label="Open Grocify AI"
                >
                    🤖
                </button>
            )}


            {/* ========================= */}
            {/* CHAT WINDOW */}
            {/* ========================= */}

            {isOpen && (
                <div
                    className="
                        fixed
                        bottom-6
                        right-6
                        z-50
                        flex
                        h-[550px]
                        w-[360px]
                        flex-col
                        overflow-hidden
                        rounded-2xl
                        bg-white
                        shadow-2xl
                    "
                >

                    {/* ========================= */}
                    {/* HEADER */}
                    {/* ========================= */}

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            bg-green-600
                            px-4
                            py-4
                            text-white
                        "
                    >

                        <div>
                            <h2 className="text-lg font-bold">
                                Grocify AI 🤖
                            </h2>

                            <p className="text-xs opacity-90">
                                Your grocery assistant
                            </p>
                        </div>

                        <button
                            onClick={() => setIsOpen(false)}
                            className="
                                text-xl
                                transition
                                hover:scale-110
                            "
                            aria-label="Close chatbot"
                        >
                            ✕
                        </button>

                    </div>


                    {/* ========================= */}
                    {/* MESSAGES */}
                    {/* ========================= */}

                    <div
                        className="
                            flex-1
                            space-y-3
                            overflow-y-auto
                            bg-gray-50
                            p-4
                        "
                    >

                        {messages.map((item, index) => (
                            <div
                                key={index}
                                className={`flex ${item.role === "user"
                                    ? "justify-end"
                                    : "justify-start"
                                    }`}
                            >

                                <div
                                    className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${item.role === "user"
                                        ? "rounded-br-none bg-green-600 text-white"
                                        : "rounded-bl-none bg-white text-gray-800 shadow"
                                        }`}
                                >
                                    {item.content}
                                </div>

                            </div>
                        ))}


                        {/* Loading message */}

                        {loading && (
                            <div className="flex justify-start">

                                <div
                                    className="
                                        rounded-2xl
                                        rounded-bl-none
                                        bg-white
                                        px-4
                                        py-2
                                        text-sm
                                        text-gray-500
                                        shadow
                                    "
                                >
                                    Grocify AI is typing...
                                </div>

                            </div>
                        )}

                    </div>


                    {/* ========================= */}
                    {/* INPUT AREA */}
                    {/* ========================= */}

                    <div
                        className="
                            flex
                            gap-2
                            border-t
                            bg-white
                            p-3
                        "
                    >

                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask Grocify AI..."
                            disabled={loading}
                            className="
                                flex-1
                                rounded-xl
                                border
                                px-3
                                py-2
                                text-sm
                                outline-none
                                focus:border-green-500
                                disabled:bg-gray-100
                            "
                        />

                        <button
                            onClick={sendMessage}
                            disabled={
                                loading ||
                                !message.trim()
                            }
                            className="
                                rounded-xl
                                bg-green-600
                                px-4
                                py-2
                                text-sm
                                font-medium
                                text-white
                                transition
                                hover:bg-green-700
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >
                            {loading ? "..." : "Send"}
                        </button>

                    </div>

                </div>
            )}
        </>
    );
};

export default AIChatbot;

