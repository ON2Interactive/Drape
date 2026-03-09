"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";

export default function FAQPage() {
    const faqs = [
        {
            question: "What is Drape?",
            answer: "Drape is an AI fashion styling workspace that helps you build a wardrobe collection, generate looks, plan outfits for the week, and get live styling guidance from your Stylist. It runs in the browser, so there is nothing to install."
        },
        {
            question: "How does Drape work?",
            answer: "You upload a profile image, add pieces from your wardrobe or collection, and use Drape to create outfits in multiple ways. You can try on selected items, generate looks from prompts, ask the Stylist for recommendations, preview looks as video, and save favorites for later."
        },
        {
            question: "What can I do inside Drape?",
            answer: "Drape supports Intelligent Try On, Drape Remix for alternate scenes and environments, Drape Prompt for guided look generation from selected pieces, Drape Stylist for live outfit recommendations, Drape Plan for weekly outfit planning, video preview, favorites, sharing, and downloads."
        },
        {
            question: "Do I need to install anything?",
            answer: "No. Drape runs entirely in the browser. Open your workspace, upload your collection, and start styling."
        },
        {
            question: "Does Drape save my work automatically?",
            answer: "Yes. Your collection, favorites, videos, and weekly plan are designed to persist so you can refresh the browser and continue where you left off. Some assets are stored locally in the browser to keep the workspace responsive."
        },
        {
            question: "How does pricing work?",
            answer: (
                <>
                    Drape pricing details are available on the <Link href="/pages/drape/pricing.html" className="underline hover:text-white transition-colors">Pricing</Link> page. Plans are designed to give you access to styling, generation, and export features in one workflow.
                </>
            )
        },
        {
            question: "How does the Drape subscription work?",
            answer: "Drape uses a subscription model rather than a credit-based workflow. Your plan gives you access to the styling workspace, wardrobe management, look generation features, and related tools included with your subscription."
        },
        {
            question: "Do I need to manage credits or top-ups?",
            answer: "No. Drape is designed around a subscription model, so you do not need to track credits or purchase top-ups as part of the core experience."
        },
        {
            question: "What is Nano Banana 2?",
            answer: "Nano Banana 2 is the image generation model used inside Drape for core fashion image generation tasks, including look creation, try-on flows, and certain styling outputs."
        },
        {
            question: "What is Drape Stylist?",
            answer: "Drape Stylist is a live assistant that can review the items in your collection, discuss what you want to wear, recommend combinations, and generate a look based on your direction."
        },
        {
            question: "What is Drape Plan?",
            answer: "Drape Plan builds a weekly outfit plan from your collection so you can map looks across the week. It is designed to help reduce repetition and turn saved pieces into a practical wearing schedule."
        },
        {
            question: "Can I save, download, or share looks?",
            answer: "Yes. Generated looks can be saved to Favorites, downloaded, and shared. Video previews can also be saved and downloaded."
        },
        {
            question: "Can I use Drape across devices?",
            answer: "Yes. Drape is cloud-based and browser-first, so you can open the workspace from different devices and continue working with the same wardrobe system."
        }
    ];

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white/20">
            <Navbar />

            <main className="flex-1 mx-auto w-full max-w-[1100px] px-5 py-24 pt-[200px]">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-10 text-white">FAQs</h1>

                <div className="space-y-12">
                    {faqs.map((faq, index) => (
                        <div key={index} className="w-full max-w-[1100px]">
                            <h2 className="text-lg md:text-xl font-bold text-white mb-3 tracking-tight">
                                {faq.question}
                            </h2>
                            <div className="text-sm md:text-base text-white/50 leading-relaxed font-regular">
                                {faq.answer}
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}
