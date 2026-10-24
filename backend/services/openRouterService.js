const OpenAI = require("openai");

const {
    searchProducts,
    getProduct
} = require("../tools/productTools");

const {
    addToCart,
    getCart,
    removeFromCart,
    updateCartQuantity,
    clearCart
} = require("../tools/cartTools");

const {
    addToWishlist,
    getWishlist,
    removeFromWishlist
} = require("../tools/wishlistTools");

const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY
});

// ⚡ TIP 1: हाई-स्पीड मॉडल इस्तेमाल करें जो 400-600ms में रिस्पॉन्ड करता है
// उदा. "google/gemini-2.0-flash-001" या "meta-llama/llama-3.3-70b-instruct"
const MODEL_NAME = process.env.AI_MODEL || "google/gemini-2.0-flash-001";

// ⚡ TIP 2: टूल्स को फ़ंक्शन के बाहर रखें ताकि हर रिक्वेस्ट पर री-क्रिएट न हों
const tools = [
    {
        type: "function",
        function: {
            name: "searchProducts",
            description: "Search grocery products by name or maximum price.",
            parameters: {
                type: "object",
                properties: {
                    query: { type: "string", description: "Product name such as milk, bread." },
                    maxPrice: { type: "number", description: "Maximum price of the product." }
                }
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getProduct",
            description: "Get product details using MongoDB ID.",
            parameters: {
                type: "object",
                properties: {
                    productId: { type: "string", description: "MongoDB product ID." }
                },
                required: ["productId"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "addToCart",
            description: "Add a product to cart.",
            parameters: {
                type: "object",
                properties: {
                    productId: { type: "string" },
                    quantity: { type: "integer" }
                },
                required: ["productId", "quantity"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getCart",
            description: "Get all cart items.",
            parameters: { type: "object", properties: {} }
        }
    },
    {
        type: "function",
        function: {
            name: "removeFromCart",
            description: "Remove product from cart.",
            parameters: {
                type: "object",
                properties: { productId: { type: "string" } },
                required: ["productId"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "updateCartQuantity",
            description: "Update product quantity in cart.",
            parameters: {
                type: "object",
                properties: {
                    productId: { type: "string" },
                    quantity: { type: "integer" }
                },
                required: ["productId", "quantity"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "clearCart",
            description: "Empty entire cart.",
            parameters: { type: "object", properties: {} }
        }
    },
    {
        type: "function",
        function: {
            name: "addToWishlist",
            description: "Add product to wishlist.",
            parameters: {
                type: "object",
                properties: { productId: { type: "string" } },
                required: ["productId"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getWishlist",
            description: "Get wishlist items.",
            parameters: { type: "object", properties: {} }
        }
    },
    {
        type: "function",
        function: {
            name: "removeFromWishlist",
            description: "Remove product from wishlist.",
            parameters: {
                type: "object",
                properties: { productId: { type: "string" } },
                required: ["productId"]
            }
        }
    }
];

// टूल डिस्पैचर
async function executeTool(name, args, userId) {
    switch (name) {
        case "searchProducts": return await searchProducts(args);
        case "getProduct": return await getProduct(args.productId);
        case "addToCart": return await addToCart({ userId, productId: args.productId, quantity: args.quantity });
        case "getCart": return await getCart({ userId });
        case "removeFromCart": return await removeFromCart({ userId, productId: args.productId });
        case "updateCartQuantity": return await updateCartQuantity({ userId, productId: args.productId, quantity: args.quantity });
        case "clearCart": return await clearCart({ userId });
        case "addToWishlist": return await addToWishlist({ userId, productId: args.productId });
        case "getWishlist": return await getWishlist({ userId });
        case "removeFromWishlist": return await removeFromWishlist({ userId, productId: args.productId });
        default: return { success: false, message: "Unknown tool" };
    }
}

async function chatWithAI({ message, userId }) {
    const messages = [
        {
            role: "system",
            content: "You are Grocify AI, a fast grocery shopping assistant. Help users manage cart, wishlist and search products. Keep responses concise and practical. Never reveal MongoDB IDs."
        },
        {
            role: "user",
            content: message
        }
    ];

    let response = await client.chat.completions.create({
        model: MODEL_NAME,
        messages,
        tools,
        tool_choice: "auto",
        temperature: 0.2 // कम टेम्परेचर से आउटपुट तेज़ और टोकन कम खर्च होते हैं
    });

    let assistantMessage = response.choices[0].message;
    let rounds = 0;

    while (assistantMessage.tool_calls?.length) {
        rounds++;
        if (rounds > 5) break;

        messages.push(assistantMessage);

        // ⚡ TIP 3: टूल्स को Promise.all से पैरेलल रन करें
        const toolPromises = assistantMessage.tool_calls.map(async (toolCall) => {
            let args = {};
            try {
                args = JSON.parse(toolCall.function.arguments || "{}");
            } catch (err) {
                return {
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: JSON.stringify({ success: false, message: "Invalid JSON args" })
                };
            }

            const result = await executeTool(toolCall.function.name, args, userId);

            return {
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify(result)
            };
        });

        const toolResponses = await Promise.all(toolPromises);
        messages.push(...toolResponses);

        // अगला रिस्पॉन्स जनरेट करें
        response = await client.chat.completions.create({
            model: MODEL_NAME,
            messages,
            tools,
            tool_choice: "auto",
            temperature: 0.2
        });

        assistantMessage = response.choices[0].message;
    }

    return assistantMessage.content || "Done!";
}

module.exports = { chatWithAI };