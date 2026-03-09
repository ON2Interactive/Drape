import { generateVideoFromImage } from './veoService';

export const DEFAULT_VIDEO_PROMPT = "Create a short, photoreal fashion runway clip from this image with gentle camera motion and natural garment movement.";

export const isVideoFavorited = (favorites, videoUrl) => {
    return favorites?.some((fav) => fav.type === 'video' && fav.url === videoUrl);
};

export const createVideoFavorite = (videoUrl) => ({
    id: Date.now(),
    type: 'video',
    url: videoUrl,
    date: new Date().toISOString()
});

export const shouldRevokePreviousVideoUrl = (previousVideoUrl, favorites) => {
    if (!previousVideoUrl) return false;
    return !isVideoFavorited(favorites, previousVideoUrl);
};

export const downloadVideoFromUrl = (videoUrl) => {
    if (!videoUrl) return;
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `drape-video-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const runVideoGeneration = async ({ sourceImage, prompt = DEFAULT_VIDEO_PROMPT }) => {
    if (!sourceImage) {
        return { ok: false, reason: 'NO_SOURCE_IMAGE' };
    }

    try {
        const videoUrl = await generateVideoFromImage(sourceImage, prompt);
        if (!videoUrl) {
            return { ok: false, reason: 'GENERATION_FAILED' };
        }
        return { ok: true, videoUrl };
    } catch (error) {
        return { ok: false, reason: 'GENERATION_ERROR', error };
    }
};
