import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyAhmIbo09mJU4zwau2uA5jTsDqpStEOI6k";
const STYLIST_MODEL = import.meta.env.VITE_GEMINI_STYLIST_MODEL || import.meta.env.VITE_GEMINI_SPECIALIST_MODEL || "gemini-2.5-flash";
const genAI = new GoogleGenerativeAI(API_KEY);

const stylistModel = genAI.getGenerativeModel({
    model: STYLIST_MODEL,
});

const toInlineDataPart = (base64DataUri) => {
    const mimeMatch = base64DataUri.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
    return {
        inlineData: {
            data: base64DataUri.split(',')[1],
            mimeType
        }
    };
};

const buildHistoryText = (history = []) => {
    if (!history.length) return "No prior chat history.";
    return history
        .slice(-8)
        .map((m) => `${m.role === 'assistant' ? 'Assistant' : 'User'}: ${m.content}`)
        .join('\n');
};

export const askStylistAdvice = async ({ question, collection = [], profile = null, history = [] }) => {
    if (!question?.trim()) return "Ask me anything about your wardrobe and I'll help.";
    if (!API_KEY) return "Stylist is unavailable because API key is missing.";

    try {
        const profileContext = `Profile context: gender=${profile?.gender || 'unknown'}.`;
        const collectionSummary = collection.length
            ? collection.map((item, index) =>
                `${index + 1}. category=${item.category || 'Unknown'}, subCategory=${item.subCategory || 'Unknown'}, color=${item.color || 'Unknown'}`
            ).join('\n')
            : 'No collection items uploaded yet.';

        const parts = [
            {
                text: [
                    "You are Drape Stylist, a concise fashion advisor inside a styling app.",
                    "Use the user's collection to give practical outfit suggestions, pairing advice, and purchase-gap guidance.",
                    "Be direct, clear, and specific.",
                    profileContext,
                    "Collection summary:",
                    collectionSummary,
                    "Recent chat history:",
                    buildHistoryText(history),
                    `Current user request: ${question.trim()}`
                ].join('\n')
            }
        ];

        collection
            .filter((item) => item.image)
            .slice(0, 8)
            .forEach((item, index) => {
                parts.push({ text: `Collection image ${index + 1}: ${item.category || 'Item'} (${item.color || 'unknown color'})` });
                parts.push(toInlineDataPart(item.image));
            });

        const result = await stylistModel.generateContent({
            contents: [{ role: 'user', parts }]
        });
        const response = await result.response;
        return response.text() || "I reviewed your collection, but couldn't form a response. Try rephrasing.";
    } catch (error) {
        console.error("Stylist advice failed:", error);
        return "Stylist is temporarily unavailable. Please try again.";
    }
};
