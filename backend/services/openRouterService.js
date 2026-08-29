
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


async function chatWithAI({ message, userId }) {

    const tools = [

        // =========================
        // PRODUCT SEARCH
        // =========================

        {
            type: "function",
            function: {
                name: "searchProducts",
                description: "Search grocery products by name or maximum price.",
                parameters: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "Product name such as milk, eggs, bread or cheese."
                        },
                        maxPrice: {
                            type: "number",
                            description: "Maximum price of the product."
                        }
                    }
                }
            }
        },


        // =========================
        // GET PRODUCT
        // =========================

        {
            type: "function",
            function: {
                name: "getProduct",
                description: "Get a specific grocery product using its MongoDB ID.",
                parameters: {
                    type: "object",
                    properties: {
                        productId: {
                            type: "string",
                            description: "MongoDB product ID."
                        }
                    },
                    required: ["productId"]
                }
            }
        },


        // =========================
        // ADD TO CART
        // =========================

        {
            type: "function",
            function: {
                name: "addToCart",
                description: "Add a grocery product to the authenticated user's cart.",
                parameters: {
                    type: "object",
                    properties: {
                        productId: {
                            type: "string",
                            description: "MongoDB product ID."
                        },
                        quantity: {
                            type: "integer",
                            description: "Quantity to add."
                        }
                    },
                    required: ["productId", "quantity"]
                }
            }
        },


        // =========================
        // GET CART
        // =========================

        {
            type: "function",
            function: {
                name: "getCart",
                description: "Get all products from the authenticated user's cart.",
                parameters: {
                    type: "object",
                    properties: {}
                }
            }
        },


        // =========================
        // REMOVE FROM CART
        // =========================

        {
            type: "function",
            function: {
                name: "removeFromCart",
                description: "Remove a product completely from the user's cart.",
                parameters: {
                    type: "object",
                    properties: {
                        productId: {
                            type: "string",
                            description: "MongoDB product ID."
                        }
                    },
                    required: ["productId"]
                }
            }
        },


        // =========================
        // UPDATE CART QUANTITY
        // =========================

        {
            type: "function",
            function: {
                name: "updateCartQuantity",
                description: "Change the quantity of a product already in the user's cart.",
                parameters: {
                    type: "object",
                    properties: {
                        productId: {
                            type: "string",
                            description: "MongoDB product ID."
                        },
                        quantity: {
                            type: "integer",
                            description: "New quantity."
                        }
                    },
                    required: ["productId", "quantity"]
                }
            }
        },


        // =========================
        // CLEAR CART
        // =========================

        {
            type: "function",
            function: {
                name: "clearCart",
                description: "Remove all products from the authenticated user's cart.",
                parameters: {
                    type: "object",
                    properties: {}
                }
            }
        },


        // =========================
        // ADD TO WISHLIST
        // =========================

        {
            type: "function",
            function: {
                name: "addToWishlist",
                description: "Add a grocery product to the authenticated user's wishlist.",
                parameters: {
                    type: "object",
                    properties: {
                        productId: {
                            type: "string",
                            description: "MongoDB product ID."
                        }
                    },
                    required: ["productId"]
                }
            }
        },


        // =========================
        // GET WISHLIST
        // =========================

        {
            type: "function",
            function: {
                name: "getWishlist",
                description: "Get all products from the authenticated user's wishlist.",
                parameters: {
                    type: "object",
                    properties: {}
                }
            }
        },


        // =========================
        // REMOVE FROM WISHLIST
        // =========================

        {
            type: "function",
            function: {
                name: "removeFromWishlist",
                description: "Remove a product completely from the user's wishlist.",
                parameters: {
                    type: "object",
                    properties: {
                        productId: {
                            type: "string",
                            description: "MongoDB product ID."
                        }
                    },
                    required: ["productId"]
                }
            }
        }
    ];


    // =========================
    // AI INSTRUCTIONS
    // =========================

    const messages = [

        {
            role: "system",
            content: `
You are Grocify AI, a grocery shopping assistant.

You help users find products, manage their cart and manage their wishlist.

IMPORTANT RULES:

1. When the user asks to find or search for a product, use searchProducts.

2. When the user mentions a maximum price, pass that amount as maxPrice.

3. Never invent products, prices or product IDs.

4. Use only product information returned by the database.

5. When the user asks to add something to the cart, use addToCart.

6. When the user asks to see the cart, use getCart.

7. When the user asks to remove something from the cart, use removeFromCart.

8. When the user asks to change the quantity of a cart item, use updateCartQuantity.

9. When the user asks to clear, empty or delete everything from the cart, use clearCart.

10. When the user asks to add a product to the wishlist, use addToWishlist.

11. When the user asks to see the wishlist, use getWishlist.

12. When the user asks to remove a product from the wishlist, use removeFromWishlist.

13. The userId is provided by the backend.

14. Never ask the user for their userId.

15. Never modify another user's cart or wishlist.

16. If the user gives a budget, do not exceed that budget.

17. Use the actual prices returned by MongoDB.

18. If a requested product does not exist, clearly tell the user.

19. Never show MongoDB product IDs to the user.

20. Keep responses short, clear and grocery-focused.

21. If an action is successfully completed, clearly tell the user what happened.
`
        },

        {
            role: "user",
            content: message
        }
    ];


    // =========================
    // FIRST AI REQUEST
    // =========================

    let response = await client.chat.completions.create({
        model: "openrouter/free",
        messages,
        tools,
        tool_choice: "auto"
    });


    let assistantMessage = response.choices[0].message;

    let rounds = 0;


    // =========================
    // TOOL CALL LOOP
    // =========================

    while (assistantMessage.tool_calls?.length) {

        rounds++;

        if (rounds > 10) {
            return "I couldn't complete the request. Please try again.";
        }


        messages.push(assistantMessage);


        for (const toolCall of assistantMessage.tool_calls) {

            const functionName = toolCall.function.name;

            let args = {};

            try {
                args = JSON.parse(
                    toolCall.function.arguments || "{}"
                );
            } catch (error) {

                console.error("Invalid tool arguments:", error);

                messages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: JSON.stringify({
                        success: false,
                        message: "Invalid tool arguments."
                    })
                });

                continue;
            }


            console.log("AI TOOL:", functionName);
            console.log("AI TOOL ARGS:", args);


            let result;


            // =========================
            // PRODUCT TOOLS
            // =========================

            if (functionName === "searchProducts") {

                result = await searchProducts(args);

            }

            else if (functionName === "getProduct") {

                result = await getProduct(
                    args.productId
                );

            }


            // =========================
            // CART TOOLS
            // =========================

            else if (functionName === "addToCart") {

                result = await addToCart({
                    userId,
                    productId: args.productId,
                    quantity: args.quantity
                });

            }

            else if (functionName === "getCart") {

                result = await getCart({
                    userId
                });

            }

            else if (functionName === "removeFromCart") {

                result = await removeFromCart({
                    userId,
                    productId: args.productId
                });

            }

            else if (functionName === "updateCartQuantity") {

                result = await updateCartQuantity({
                    userId,
                    productId: args.productId,
                    quantity: args.quantity
                });

            }

            else if (functionName === "clearCart") {

                result = await clearCart({
                    userId
                });

            }


            // =========================
            // WISHLIST TOOLS
            // =========================

            else if (functionName === "addToWishlist") {

                result = await addToWishlist({
                    userId,
                    productId: args.productId
                });

            }

            else if (functionName === "getWishlist") {

                result = await getWishlist({
                    userId
                });

            }

            else if (functionName === "removeFromWishlist") {

                result = await removeFromWishlist({
                    userId,
                    productId: args.productId
                });

            }


            // =========================
            // UNKNOWN TOOL
            // =========================

            else {

                result = {
                    success: false,
                    message: "Unknown tool."
                };
            }


            console.log("TOOL RESULT:", result);


            messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify(result)
            });
        }


        // =========================
        // ASK AI AGAIN
        // =========================

        response = await client.chat.completions.create({
            model: "openrouter/free",
            messages,
            tools,
            tool_choice: "auto"
        });


        assistantMessage = response.choices[0].message;
    }


    // =========================
    // FINAL RESPONSE
    // =========================

    return assistantMessage.content || "Done!";
}


module.exports = {
    chatWithAI
};

