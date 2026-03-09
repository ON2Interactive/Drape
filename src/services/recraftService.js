export const RECRAFT_API_KEY = "52zP3IwVzSK4c9FDgYoFymVPUZeXhtPtbJ0KSGjtsxTp4CKuSvx6uGhOKtmxw8Kt";
import { getOutfitDescription } from './geminiService';

function base64ToBlob(base64) {
    const mimeMatch = base64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const b64Data = base64.split(',')[1];
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: mime });
}

/**
 * Generates an outfit using Recraft AI imageToImage.
 */
export const generateOutfitWithRecraft = async (base64UserImage, collectionItems) => {
    try {
        const description = await getOutfitDescription(base64UserImage, collectionItems);
        const finalPrompt = description
            ? `Photorealistic high-fashion shoot. Dress the person exactly in this outfit: ${description}. Keep the person's face and pose identical.`
            : "Dress the person in a highly stylish modern high-fashion outfit. Keep the person's face and pose identical.";

        const blob = base64ToBlob(base64UserImage);
        const formData = new FormData();
        formData.append("image", blob, "image.png");
        formData.append("prompt", finalPrompt);
        formData.append("style", "realistic_image");
        formData.append("strength", "0.5");
        formData.append("response_format", "b64_json");

        const response = await fetch("https://external.api.recraft.ai/v1/images/imageToImage", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${RECRAFT_API_KEY}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Recraft API Error:", errorText);
            return null;
        }

        const data = await response.json();
        if (data.data && data.data.length > 0 && data.data[0].b64_json) {
            return `data:image/png;base64,${data.data[0].b64_json}`;
        }
        return null;
    } catch (e) {
        console.error("Error generating outfit with Recraft:", e);
        return null;
    }
};

/**
 * Remixes the background using Recraft AI imageToImage.
 */
export const generateRemixBackgroundWithRecraft = async (base64Image) => {
    try {
        const blob = base64ToBlob(base64Image);
        const formData = new FormData();
        formData.append("image", blob, "image.png");

        const prompt = `Keep the person and their outfit exactly as they are. Completely replace the background environment with an epic, photorealistic high-fashion scene (e.g., Paris Fashion Week runway, Amalfi Coast balcony, minimalistic photo studio, neon-lit cyberpunk street). Ensure the lighting blends naturally.`;

        formData.append("prompt", prompt);
        formData.append("style", "realistic_image");
        formData.append("strength", "0.5");
        formData.append("response_format", "b64_json");

        const response = await fetch("https://external.api.recraft.ai/v1/images/imageToImage", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${RECRAFT_API_KEY}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Recraft API Error:", errorText);
            return null;
        }

        const data = await response.json();
        if (data.data && data.data.length > 0 && data.data[0].b64_json) {
            return `data:image/png;base64,${data.data[0].b64_json}`;
        }
        return null;

    } catch (e) {
        console.error("Error generating remix with Recraft:", e);
        return null;
    }
};

/**
 * Removes the profile photo background using Recraft imageToImage.
 */
export const removeProfileBackgroundWithRecraft = async (base64Image) => {
    try {
        const blob = base64ToBlob(base64Image);
        const formData = new FormData();
        formData.append("image", blob, "profile.png");
        formData.append(
            "prompt",
            "Remove the background from this profile photo. Keep the person exactly the same and return only a clean subject cutout on a pure black background."
        );
        formData.append("style", "realistic_image");
        formData.append("strength", "0.4");
        formData.append("response_format", "b64_json");

        const response = await fetch("https://external.api.recraft.ai/v1/images/imageToImage", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${RECRAFT_API_KEY}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Recraft API Error:", errorText);
            return null;
        }

        const data = await response.json();
        if (data.data && data.data.length > 0 && data.data[0].b64_json) {
            return `data:image/png;base64,${data.data[0].b64_json}`;
        }
        return null;
    } catch (e) {
        console.error("Error removing background with Recraft:", e);
        return null;
    }
};
