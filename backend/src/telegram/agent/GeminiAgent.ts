import { GoogleGenerativeAI } from "@google/generative-ai";
import { tools, executeTool } from "./tools.js";

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.warn("⚠️ GEMINI_API_KEY is not set. Agent will not work.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

// Map our simpler tools definition to Gemini's expected format
const formattedTools = {
    functionDeclarations: tools.map(t => ({
        name: t.name,
        description: t.description,
        parameters: t.parameters
    }))
};

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash", // Fast and capable
    tools: [formattedTools],
});

export class GeminiAgent {
    private chatSession: any;

    constructor() {
        this.chatSession = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: "You are Minties AI, a helpful financial assistant for the Minties app on Mantle Network. You help users manage savings, buy real estate assets, and track goals. Be concise and friendly." }],
                },
                {
                    role: "model",
                    parts: [{ text: "Hello! I am Minties AI. How can I help you save or invest today? 🚀" }],
                },
            ],
        });
    }

    async processMessage(message: string, telegramCtx?: any): Promise<string> {
        try {
            if (!apiKey) return "I'm currently offline (API Key missing).";

            // 1. Send message to model
            console.log(`🤖 Agent thinking... Input: "${message}"`);
            let result = await this.chatSession.sendMessage(message);
            let response = await result.response;
            let text = response.text();

            // 2. Handle Function Calls
            let functionCalls = response.functionCalls();

            // Loop for multi-step tool execution
            while (functionCalls && functionCalls.length > 0) {
                console.log("🛠️ Function Calls:", functionCalls);

                const toolResponses = [];

                for (const call of functionCalls) {
                    // Provide context (like telegramId) to the tool if needed
                    const args = { ...call.args, telegramId: telegramCtx?.from?.id };

                    const toolResult = await executeTool(call.name, args);
                    console.log(`🔧 Tool [${call.name}] Output:`, toolResult);

                    toolResponses.push({
                        functionResponse: {
                            name: call.name,
                            response: { output: toolResult } // Gemini expects object
                        }
                    });
                }

                // Send tool results back to model
                result = await this.chatSession.sendMessage(toolResponses);
                response = await result.response;
                text = response.text(); // Get new explanation
                functionCalls = response.functionCalls(); // Check if it wants to do more
            }

            return text;

        } catch (error: any) {
            console.error("Agent Error:", error);
            return "Sorry, I had trouble thinking about that. Please try again.";
        }
    }
}
