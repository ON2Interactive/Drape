const API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

async function test() {
    if (!API_KEY) {
        throw new Error("Missing GEMINI_API_KEY (or VITE_GEMINI_API_KEY) in environment.");
    }
    // 1x1 black pixel base64
    const imageData = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
    
    const kickOffResponse = await fetch(`${BASE_URL}/models/veo-3.1-generate-preview:predictLongRunning`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': API_KEY
        },
        body: JSON.stringify({
            instances: [{
                prompt: "A cinematic, living portrait of this fashion look.",
                referenceImages: [{
                    image: {
                        inlineData: {
                            mimeType: "image/png",
                            data: imageData
                        }
                    },
                    referenceType: "asset"
                }]
            }],
            parameters: {
                resolution: "720p"
            }
        })
    });
    
    console.log("Status:", kickOffResponse.status);
    const text = await kickOffResponse.text();
    console.log("Body:", text);
}
test();
