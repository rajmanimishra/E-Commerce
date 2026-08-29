require("dotenv").config();

const { testOpenRouter } = require("./services/openRouterService");

async function test() {
    try {
        console.log("1. Starting OpenRouter test...");
        console.log("2. Sending request...");

        const response = await testOpenRouter();

        console.log("3. OpenRouter responded!");
        console.log("AI RESPONSE:");
        console.log(response);

    } catch (error) {
        console.error("OPENROUTER ERROR:");

        if (error.status) {
            console.error("Status:", error.status);
        }

        console.error(error.message);
    }
}

test();