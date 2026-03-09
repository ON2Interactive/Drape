const API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

async function test(imagePayload) {
    if (!API_KEY) {
        throw new Error("Missing GEMINI_API_KEY (or VITE_GEMINI_API_KEY) in environment.");
    }
    const fetch = require('node-fetch'); // ensuring node-fetch or native is used, actually node 18+ has fetch natively
    // We will just use native fetch if available
    
    console.log("Testing:", JSON.stringify(imagePayload));
    const kickOffResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:predictLongRunning?key=${API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            instances: [{
                prompt: "A test prompt.",
                referenceImages: [{
                    referenceType: "asset",
                    image: imagePayload
                }]
            }],
            parameters: { resolution: "720p" }
        })
    });
    
    //console.log("Status:", kickOffResponse.status);
    const text = await kickOffResponse.text();
    console.log("Response:", text);
}

async function runAll() {
    const b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
    await test({ bytesBase64Encoded: b64 });
    await test({ base64: b64 });
    await test({ b64: b64 });
    await test({ bytesBase64: b64 });
    await test({ imageBytes: b64 });
    await test({ image_bytes: b64 });
    await test({ bytes_base64_encoded: b64 });
}
runAll();
