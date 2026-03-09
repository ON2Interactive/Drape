/**
 * Converts a base64 string to a Blob object.
 * @param {string} base64 - The base64 string (can include data URI prefix).
 * @returns {Blob} - The resulting Blob.
 */
export const base64ToBlob = (base64) => {
    const mimeMatch = base64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const b64Data = base64.split(',')[1] || base64;

    try {
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
    } catch (e) {
        console.error("Failed to convert base64 to Blob:", e);
        return null;
    }
};
