const API_KEY = "AIzaSyAhmIbo09mJU4zwau2uA5jTsDqpStEOI6k";

async function test() {
    const imageData = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
    
    const kickOffResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:predictLongRunning`, {
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
                        imageBytes: imageData,
                        mimeType: "image/png"
                    },
                    referenceType: "asset"
                }]
            }],
            parameters: {
                resolution: "720p"
            }
        })
    });
    
    console.log("Veo Status:", kickOffResponse.status);
    const text = await kickOffResponse.text();
    console.log("Veo Body:", text);
}
test();
