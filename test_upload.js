const API_KEY = "AIzaSyAhmIbo09mJU4zwau2uA5jTsDqpStEOI6k";

async function test() {
    // 1x1 black pixel base64
    const imageData = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
    const binaryStr = atob(imageData);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
    }
    
    // Upload
    const uploadUrl = `https://generativelanguage.googleapis.com/upload/v1beta/files?uploadType=media&key=${API_KEY}`;
    const uploadRes = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'image/png' },
        body: bytes
    });
    
    console.log("Upload Status:", uploadRes.status);
    const uploadData = await uploadRes.json();
    console.log("Upload Data:", uploadData);
    
    if (uploadData.file && uploadData.file.uri) {
        // Now test Veo kick-off
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
                            fileData: {
                                mimeType: "image/png",
                                fileUri: uploadData.file.uri
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
        
        console.log("Veo Status:", kickOffResponse.status);
        const text = await kickOffResponse.text();
        console.log("Veo Body:", text);
    }
}
test();
