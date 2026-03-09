import { generateOutfit } from './geminiService';

export const getItemsForMagicWand = (collection, selectedItemIds) => {
    const selectedItems = collection.filter((item) => selectedItemIds.includes(item.id));
    return selectedItems.length > 0 ? selectedItems : collection;
};

export const runMagicWandGeneration = async ({
    profilePhoto,
    collection,
    selectedItemIds
}) => {
    if (!collection || collection.length === 0) {
        return { ok: false, reason: "NO_COLLECTION" };
    }
    if (!profilePhoto) {
        return { ok: false, reason: "NO_PROFILE_PHOTO" };
    }

    const itemsToUse = getItemsForMagicWand(collection, selectedItemIds || []);
    const image = await generateOutfit(profilePhoto, itemsToUse);

    if (!image) {
        return { ok: false, reason: "GENERATION_FAILED" };
    }

    return { ok: true, image };
};
