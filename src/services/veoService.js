const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyAhmIbo09mJU4zwau2uA5jTsDqpStEOI6k";
const PRIMARY_VEO_MODEL = import.meta.env.VITE_VEO_MODEL || "veo-2.0-generate-001";
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseDataUri = (dataUri) => {
    const mimeMatch = dataUri.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/png";
    return {
        mimeType,
        data: dataUri.split(",")[1]
    };
};

const withApiKey = (url) => `${url}${url.includes("?") ? "&" : "?"}key=${API_KEY}`;

const buildPayload = (prompt, mimeType, data) => ({
    instances: [{
        prompt,
        image: {
            bytesBase64Encoded: data,
            mimeType
        }
    }],
    parameters: {
        resolution: "720p",
        aspectRatio: "9:16",
        personGeneration: "allow_adult"
    }
});

const readVideoUriFromOperation = (op) => {
    return (
        op?.response?.generatedVideos?.[0]?.video?.uri
        || op?.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri
        || op?.response?.generatedSamples?.[0]?.video?.uri
        || null
    );
};

export const generateVideoFromImage = async (imageDataUri, prompt = "") => {
    if (!API_KEY || !imageDataUri) return null;

    const { mimeType, data } = parseDataUri(imageDataUri);
    const userPrompt = prompt?.trim();
    const safePrompt = "Create a short, photoreal fashion runway clip from this image with gentle camera motion and natural garment movement.";
    const promptsToTry = userPrompt && userPrompt !== safePrompt
        ? [userPrompt, safePrompt]
        : [safePrompt];

    const modelsToTry = [PRIMARY_VEO_MODEL, "veo-2.0-generate-001"].filter(
        (model, index, arr) => model && arr.indexOf(model) === index
    );

    let operation = null;
    let kickoffError = "";

    for (const model of modelsToTry) {
        for (const activePrompt of promptsToTry) {
            const payload = buildPayload(activePrompt, mimeType, data);
            const kickoff = await fetch(
                withApiKey(`${BASE_URL}/models/${model}:predictLongRunning`),
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                }
            );

            if (kickoff.ok) {
                operation = await kickoff.json();
                if (operation?.name) break;
            } else {
                kickoffError = await kickoff.text();
            }
        }
        if (operation?.name) break;
    }

    if (!operation?.name) {
        throw new Error(`Veo kickoff failed: ${kickoffError || "No operation name returned."}`);
    }

    const startedAt = Date.now();
    const timeoutMs = 4 * 60 * 1000;

    while (Date.now() - startedAt < timeoutMs) {
        await sleep(5000);

        const pollRes = await fetch(withApiKey(`${BASE_URL}/${operation.name}`));
        if (!pollRes.ok) {
            const errText = await pollRes.text();
            throw new Error(`Veo poll failed: ${errText}`);
        }

        const pollData = await pollRes.json();
        if (!pollData.done) continue;

        if (pollData.error) {
            throw new Error(pollData.error.message || "Veo returned an operation error.");
        }

        const videoUri = readVideoUriFromOperation(pollData);
        if (!videoUri) {
            throw new Error("Veo completed but no video URI was returned.");
        }

        const videoRes = await fetch(withApiKey(videoUri));
        if (!videoRes.ok) {
            const errText = await videoRes.text();
            throw new Error(`Failed to download generated video: ${errText}`);
        }

        const blob = await videoRes.blob();
        return URL.createObjectURL(blob);
    }

    throw new Error("Timed out while waiting for Veo video generation.");
};
