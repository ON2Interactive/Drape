"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";

export default function HelpPage() {
    const helpSections = [
        {
            title: "Getting Started",
            description: (
                <>
                    New to Drape? <Link href="/pages/drape/signup.html" className="underline hover:text-white transition-colors">Create your account</Link>, then upload your profile image, add items to your collection, and start building looks in the workspace.
                </>
            ),
            items: [
                "Sign up and open the Drape workspace",
                "Upload or update your profile image",
                "Add wardrobe pieces to your collection",
                "Start creating looks from your saved items"
            ]
        },
        {
            title: "Building Your Collection",
            description: "Your collection is the foundation of Drape. Add the clothing pieces you actually own so generated looks, styling advice, and weekly plans stay grounded in your wardrobe.",
            items: [
                "Upload items into your collection panel",
                "Select one or more pieces to use in a look",
                "Keep your collection current so the Stylist recommendations stay accurate",
                "Use real collection items to drive try-ons, prompts, and planning"
            ]
        },
        {
            title: "Creating Looks",
            description: "Drape gives you multiple ways to create outfits depending on how you want to work. You can use Intelligent Try On, Drape Prompt, Drape Remix, or ask the Stylist to guide the process.",
            items: [
                "Use Intelligent Try On to see selected items on your profile",
                "Use Drape Prompt to generate a look from selected collection pieces and instructions",
                "Use Drape Remix to change the background or scene",
                "Save the best generated looks to Favorites"
            ]
        },
        {
            title: "Using Drape Stylist",
            description: "Drape Stylist is a live assistant that can review your collection, respond to spoken requests, recommend combinations, and generate an outfit based on what you ask for.",
            items: [
                "Open Stylist from the left menu",
                "Use the mic to start a live session",
                "Ask for looks based on your collection and occasion",
                "Say when you are done and let Stylist generate the outfit"
            ]
        },
        {
            title: "Drape Plan",
            description: "Drape Plan helps you turn your collection into a weekly outfit schedule. It can generate looks across the week so you can plan ahead and reduce repetition.",
            items: [
                "Open Plan from the workspace",
                "Generate a weekly set of looks from your collection",
                "Review each day and regenerate when needed",
                "Keep your weekly plan saved so it stays available after refresh"
            ]
        },
        {
            title: "Video, Favorites, and Sharing",
            description: "Generated looks can move beyond still images. Drape supports video preview, favorites, downloads, and sharing so you can keep the looks that matter.",
            items: [
                "Generate a video preview from a look",
                "Save images and videos to Favorites",
                "Download generated assets directly from the workspace",
                "Share standout looks when you are ready"
            ]
        },
        {
            title: "Troubleshooting",
            description: "If something does not look right, most workflow issues can be resolved quickly by refreshing the browser, checking your saved collection items, or trying the action again from the workspace.",
            items: [
                "Refresh the browser if a static page looks stale",
                "Make sure the items you want are actually in your collection before generating",
                "If a model action fails, try the action again before changing your setup",
                "Use the Contact page if you need direct support"
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white/20">
            <Navbar />

            <main className="flex-1 mx-auto w-full max-w-[1100px] px-5 py-24 pt-[200px]">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-10 text-white">Help Center</h1>

                <div className="space-y-16">
                    {helpSections.map((section, index) => (
                        <div key={index} className="w-full max-w-[1100px]">
                            <h2 className="text-lg md:text-xl font-bold text-white mb-4 tracking-tight">
                                {section.title}
                            </h2>
                            <p className="text-sm md:text-base text-white/50 leading-relaxed font-regular mb-6">
                                {section.description}
                            </p>
                            {section.items && (
                                <ul className="space-y-3">
                                    {section.items.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm md:text-base text-white/50 font-regular">
                                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-white/40" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}
