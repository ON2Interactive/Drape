const DB_NAME = 'drape-media-db';
const DB_VERSION = 1;
const VIDEO_STORE = 'favorite-videos';

const openDb = () => new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(VIDEO_STORE)) {
            db.createObjectStore(VIDEO_STORE);
        }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
});

const withStore = async (mode, action) => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(VIDEO_STORE, mode);
        const store = tx.objectStore(VIDEO_STORE);
        const request = action(store);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const cacheVideoFavoriteBlob = async (storageId, sourceUrl) => {
    if (!storageId || !sourceUrl) return;
    const response = await fetch(sourceUrl);
    if (!response.ok) {
        throw new Error('Failed to fetch video for persistence.');
    }
    const blob = await response.blob();
    await withStore('readwrite', (store) => store.put(blob, storageId));
};

export const createVideoPosterFromUrl = async (videoUrl) => {
    if (!videoUrl) return null;

    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.src = videoUrl;
        video.muted = true;
        video.playsInline = true;
        video.preload = 'metadata';
        video.crossOrigin = 'anonymous';

        const cleanup = () => {
            video.removeAttribute('src');
            video.load();
        };

        video.onloadeddata = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth || 360;
            canvas.height = video.videoHeight || 640;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                cleanup();
                resolve(null);
                return;
            }
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const poster = canvas.toDataURL('image/jpeg', 0.82);
            cleanup();
            resolve(poster);
        };

        video.onerror = () => {
            cleanup();
            resolve(null);
        };
    });
};

export const getVideoFavoriteObjectUrl = async (storageId) => {
    if (!storageId) return null;
    const blob = await withStore('readonly', (store) => store.get(storageId));
    if (!blob) return null;
    return URL.createObjectURL(blob);
};

export const deleteVideoFavoriteBlob = async (storageId) => {
    if (!storageId) return;
    await withStore('readwrite', (store) => store.delete(storageId));
};
