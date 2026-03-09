import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyAhmIbo09mJU4zwau2uA5jTsDqpStEOI6k";

async function listAllModels() {
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
