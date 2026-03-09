/**
 * Service to handle AI Stylist logic, prompt engineering, and context integration.
 */

export const generateStylistPrompt = (userMessage, collection, profile) => {
    const collectionContext = collection.map(item =>
        `- ${item.category} (${item.subCategory}, Color: ${item.color})`
    ).join('\n');

    const profileContext = profile ?
        `User Profile: Gender: ${profile.gender}` :
        'User Profile: Unknown';

    return `
You are Drape, a premium AI Fashion Stylist. 
${profileContext}

The user's wardrobe collection consists of the following items:
${collectionContext || 'The wardrobe is currently empty.'}

User's Request: "${userMessage}"

As a world-class fashion expert:
1. Suggest complete outfits from the user's collection if possible.
2. If items are missing, suggest what they should add to their collection.
3. Tailor all advice specifically to the user's gender (${profile?.gender || 'not specified'}).
4. Use a sophisticated, encouraging, and luxurious tone.
5. Keep the response concise but highly personalized.
`;
};

// Mock function for AI response (to be replaced with actual API call)
export const getStylistResponse = async (userMessage, collection, profile) => {
    const prompt = generateStylistPrompt(userMessage, collection, profile);
    console.log('AI Prompt Generated:', prompt);

    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Placeholder logic for more "intelligent" mock responses
    if (collection.length === 0) {
        return "Your wardrobe is currently a blank canvas. Why not start by adding some foundational pieces like a tailored blazer or a versatile pair of trousers?";
    }

    const categories = collection.map(i => i.category.toLowerCase());
    if (userMessage.toLowerCase().includes('suit') && categories.includes('suit')) {
        return `As a ${profile?.gender || 'stylish'} individual, your tailored suit is a powerful statement. Combining it with a crisp shirt would be immaculate.`;
    }

    return `That sounds like a classic choice. Looking at your collection and considering your profile, I suggest layering your favorite jacket over a neutral base for an effortless ensemble.`;
};
