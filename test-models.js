import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

async function listAllModels() {
    if (!API_KEY) {
        throw new Error("Missing GEMINI_API_KEY (or VITE_GEMINI_API_KEY) in environment.");
    }
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json();

        console.log("Available Models:");
        data.models.forEach(m => {
            console.log(`- ${m.name} (methods: ${m.supportedGenerationMethods.join(', ')})`);
        });

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listAllModels();
