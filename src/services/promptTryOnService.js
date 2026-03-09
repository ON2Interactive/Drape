import { generateOutfitFromPromptEndpoint } from './geminiService';

export const getSelectedItemsForPromptTryOn = (collection, selectedItemIds) => {
    return collection.filter((item) => selectedItemIds.includes(item.id));
};

export const runPromptTryOnGeneration = async ({
    profilePhoto,
    collection,
    selectedItemIds,
    userPrompt
}) => {
    if (!collection || collection.length === 0) {
        return { ok: false, reason: "NO_COLLECTION" };
    }
    if (!selectedItemIds || selectedItemIds.length === 0) {
        return { ok: false, reason: "NO_SELECTED_ITEMS" };
    }
    if (!userPrompt || !userPrompt.trim()) {
        return { ok: false, reason: "NO_PROMPT" };
    }
    if (!profilePhoto) {
        return { ok: false, reason: "NO_PROFILE_PHOTO" };
    }

    const selectedItems = getSelectedItemsForPromptTryOn(collection, selectedItemIds);
    if (!selectedItems.length) {
        return { ok: false, reason: "NO_SELECTED_ITEMS" };
    }

    const image = await generateOutfitFromPromptEndpoint(profilePhoto, selectedItems, userPrompt);
    if (!image) {
        return { ok: false, reason: "GENERATION_FAILED" };
    }

    return { ok: true, image };
};
