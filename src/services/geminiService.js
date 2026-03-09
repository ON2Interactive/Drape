import { GoogleGenerativeAI } from "@google/generative-ai";

// Note: In a production app, the API key should be handled via a secure backend
// or environment variables. For now, we'll look for it in the environment.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyAhmIbo09mJU4zwau2uA5jTsDqpStEOI6k";
const genAI = new GoogleGenerativeAI(API_KEY);

const DEFAULT_MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-1.5-flash-latest";
const PROFILE_IMAGE_MODEL = import.meta.env.VITE_GEMINI_PROFILE_MODEL || "gemini-2.5-flash-image";
const OUTFIT_MODEL = import.meta.env.VITE_GEMINI_OUTFIT_MODEL || "gemini-2.5-flash-image";
const PROMPT_OUTFIT_MODEL = import.meta.env.VITE_GEMINI_PROMPT_MODEL || "gemini-2.5-flash-image";
const REMIX_MODEL = import.meta.env.VITE_GEMINI_REMIX_MODEL || OUTFIT_MODEL;
const REMIX_SCENES = [
    "a dramatic high-fashion runway with cinematic lighting",
    "a solid pure black studio backdrop",
    "a solid pure white studio backdrop",
    "a New York street at night with neon lights and reflective pavement",
    "a quiet Paris street with elegant Haussmann architecture",
    "a Milan fashion district street with luxury storefronts",
    "a minimal editorial photo studio with soft diffused lighting",
    "a futuristic neon-lit city scene with polished fashion editorial mood",
    "a luxury hotel lobby with warm sculptural lighting",
    "a rooftop terrace at golden hour overlooking a modern city skyline"
];

const model = genAI.getGenerativeModel({
    model: DEFAULT_MODEL,
});

const outfitModel = genAI.getGenerativeModel({
    model: OUTFIT_MODEL,
});

const remixModel = genAI.getGenerativeModel({
    model: REMIX_MODEL,
});

const profileImageModel = genAI.getGenerativeModel({
    model: PROFILE_IMAGE_MODEL,
});

const profileImageFallbackModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-image",
});

const toInlineDataPart = (base64DataUri) => {
    const mimeMatch = base64DataUri.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
    return {
        inlineData: {
            data: base64DataUri.split(',')[1],
            mimeType: mimeType
        }
    };
};

/**
 * Processes a profile image using Gemini.
 * @param {string} base64Image - The base64 string of the image.
 * @returns {Promise<string>} - The processed image base64 data URI.
 */
export const processProfileImage = async (base64Image) => {
    if (!API_KEY) {
        console.warn("No Gemini API Key found. Simulating cleanup...");
        await new Promise(resolve => setTimeout(resolve, 2000));
        return base64Image;
    }

    try {
        const mimeTypeMatch = base64Image.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,/);
        const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
        const imageData = base64Image.split(',')[1];

        const request = {
            contents: [{
                role: 'user',
                parts: [
                    {
                        inlineData: {
                            data: imageData,
                            mimeType: mimeType
                        }
                    },
                    { text: "Remove the background from this profile photo while keeping the person unchanged and photorealistic. Return only the isolated subject on a solid pure black background (#000000). Do not add new objects, text, effects, or style changes." }
                ]
            }]
        };

        const modelsToTry = [profileImageModel];
        if (PROFILE_IMAGE_MODEL !== "gemini-2.5-flash-image") {
            modelsToTry.push(profileImageFallbackModel);
        }

        for (const activeModel of modelsToTry) {
            for (let attempt = 1; attempt <= 2; attempt++) {
                const result = await activeModel.generateContent(request);
                const response = await result.response;
                const parts = response.candidates?.[0]?.content?.parts || [];

                for (const part of parts) {
                    if (part.inlineData?.data) {
                        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    }
                }
            }
        }

        console.warn("Gemini image edit returned no inline image. Using original image.");
        return base64Image;
    } catch (error) {
        console.error("Error processing image with Gemini:", error);
        return base64Image;
    }
};

/**
 * Helps determine the closest supported Gemini image aspect ratio.
 */
const getClosestAspectRatio = async (base64String) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const ratio = img.width / img.height;
            const ratios = [
                { str: "1:1", val: 1.0 },
                { str: "3:4", val: 0.75 },
                { str: "4:3", val: 1.333 },
                { str: "9:16", val: 0.5625 },
                { str: "16:9", val: 1.777 }
            ];

            let closest = ratios[0];
            let minDiff = Math.abs(ratio - ratios[0].val);

            for (let i = 1; i < ratios.length; i++) {
                const diff = Math.abs(ratio - ratios[i].val);
                if (diff < minDiff) {
                    minDiff = diff;
                    closest = ratios[i];
                }
            }
            resolve(closest.str);
        };
        img.onerror = () => resolve("1:1"); // Fallback
        img.src = base64String;
    });
};

/**
 * Generates an outfit by dressing the user silhouette with collection items.
 */
export const generateOutfit = async (base64UserImage, collectionItems, userPrompt = "") => {
    if (!API_KEY || !collectionItems || collectionItems.length === 0) return null;

    try {
        const aspectRatio = await getClosestAspectRatio(base64UserImage);
        const parts = [];

        const userMimeMatch = base64UserImage.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,/);
        const userMimeType = userMimeMatch ? userMimeMatch[1] : "image/jpeg";
        parts.push({
            inlineData: {
                data: base64UserImage.split(',')[1],
                mimeType: userMimeType
            }
        });

        collectionItems.forEach(item => {
            if (item.image) {
                const itemMimeMatch = item.image.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,/);
                const itemMimeType = itemMimeMatch ? itemMimeMatch[1] : "image/jpeg";
                parts.push({
                    inlineData: {
                        data: item.image.split(',')[1],
                        mimeType: itemMimeType
                    }
                });
            }
        });

        const promptIntro = userPrompt ? `USER DIRECTIVE: "${userPrompt}"\n\n` : "";
        parts.push({
            text: `You are an expert AI fashion stylist. ${promptIntro}The first image is the user's base silhouette. The following images are clothing items. Please generate a high-quality, photorealistic image of this exact person wearing these exact clothing items. Output only the final composited image. Aspect ratio: ${aspectRatio}.`
        });

        const result = await outfitModel.generateContent({
            contents: [{ role: 'user', parts: parts }]
        });

        const response = await result.response;
        const responseParts = response.candidates?.[0]?.content?.parts || [];
        for (const part of responseParts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (error) {
        console.error("Error generating outfit:", error);
        return null;
    }
};

/**
 * Generates an outfit from selected collection items using a dedicated prompt endpoint.
 * This intentionally uses a separate Nano Banana endpoint path from the magic wand flow.
 */
export const generateOutfitFromPromptEndpoint = async (base64UserImage, selectedItems, userPrompt) => {
    if (!API_KEY || !selectedItems || selectedItems.length === 0) return null;
    if (!userPrompt || !userPrompt.trim()) return null;

    try {
        const aspectRatio = await getClosestAspectRatio(base64UserImage);
        const parts = [toInlineDataPart(base64UserImage)];
        const selectedItemSummary = selectedItems
            .map((item, index) => `item ${index + 1}: ${item.color || 'unknown color'} ${item.category || 'item'}`)
            .join(', ');

        selectedItems.forEach((item) => {
            if (item.image) {
                parts.push(toInlineDataPart(item.image));
            }
        });

        parts.push({
            text: `You are an expert AI fashion stylist. USER DIRECTIVE: "${userPrompt.trim()}". The first image is the user's base silhouette. The following images are the only selected clothing items from their collection: ${selectedItemSummary}. Use only those selected items to create a high-quality, photorealistic try-on image of this exact person. Do not add other garments. Do not substitute another item. Do not change colors or prints. Keep the face, body proportions, and pose consistent. The final image must have a solid pure black background that fills the entire frame edge-to-edge. Never use white side bars, white side panels, gray bars, borders, frames, or extra background objects. Output only the final composited image. Aspect ratio: ${aspectRatio}.`
        });

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${PROMPT_OUTFIT_MODEL}:generateContent?key=${API_KEY}`;
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ role: "user", parts }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Prompt endpoint error:", errorText);
            return null;
        }

        const data = await response.json();
        const responseParts = data.candidates?.[0]?.content?.parts || [];
        for (const part of responseParts) {
            if (part.inlineData?.data) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }

        return null;
    } catch (error) {
        console.error("Error generating prompt outfit:", error);
        return null;
    }
};

/**
 * Remixes the background of an image.
 */
export const generateRemixBackground = async (base64Image) => {
    if (!API_KEY) return null;

    try {
        if (!base64Image || !base64Image.startsWith('data:image/')) {
            console.warn("Remix background requires an inline image data URI.");
            return null;
        }

        const aspectRatio = await getClosestAspectRatio(base64Image);
        const mimeMatch = base64Image.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,/);
        const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
        const selectedScene = REMIX_SCENES[Math.floor(Math.random() * REMIX_SCENES.length)];

        const parts = [
            {
                inlineData: {
                    data: base64Image.split(',')[1],
                    mimeType: mimeType
                }
            },
            {
                text: `Completely replace the background environment with ${selectedScene}. Keep the person and outfit exactly the same. Do not change pose, garments, styling, body proportions, or identity. Blend the lighting naturally so the subject feels convincingly placed in the new scene. Output ONLY the image. Aspect ratio: ${aspectRatio}.`
            }
        ];

        const result = await remixModel.generateContent({
            contents: [{ role: 'user', parts: parts }]
        });

        const response = await result.response;
        const responseParts = response.candidates?.[0]?.content?.parts || [];
        for (const part of responseParts) {
            if (part.inlineData?.data) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        console.warn("Remix generation completed without returning an image.");
        return null;
    } catch (error) {
        console.error("Error generating remix:", error);
        return null;
    }
};

/**
 * Description bridge for Recraft (optional, but keeping for stability if used elsewhere).
 */
export const getOutfitDescription = async (base64UserImage, collectionItems) => {
    if (!API_KEY || !collectionItems || collectionItems.length === 0) return null;
    try {
        const parts = [];
        const userMimeMatch = base64UserImage.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,/);
        const userMimeType = userMimeMatch ? userMimeMatch[1] : "image/jpeg";
        parts.push({
            inlineData: {
                data: base64UserImage.split(',')[1],
                mimeType: userMimeType
            }
        });
        collectionItems.forEach(item => {
            if (item.image) {
                const itemMimeMatch = item.image.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,/);
                const itemMimeType = itemMimeMatch ? itemMimeMatch[1] : "image/jpeg";
                parts.push({
                    inlineData: {
                        data: item.image.split(',')[1],
                        mimeType: itemMimeType
                    }
                });
            }
        });
        parts.push({
            text: "Describe the outfit that would result from putting these items on this person. 2-3 sentences."
        });
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: parts }]
        });
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error getting description:", error);
        return "stylish outfit";
    }
};
