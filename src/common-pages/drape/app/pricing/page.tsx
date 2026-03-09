"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white/20">
            <Navbar />

            <main className="flex-1 mx-auto w-full max-w-7xl px-5 py-24 pt-[200px]">
                {/* Header */}
                <div className="mb-24 text-center">
                    <h1 className="text-3xl font-bold tracking-tight mb-4">Pricing</h1>
                    <p className="mx-auto max-w-lg text-sm md:text-base text-white/50 leading-relaxed font-medium">
                        One simple subscription unlocks AI tools and export. Add extra credits only when you need them.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                    <div className="relative overflow-hidden bg-[#0a0a0a] p-10 md:p-14 border border-white/5 shadow-2xl flex flex-col justify-between" style={{ borderRadius: '10px' }}>
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Drape Pro</h2>

                            <div className="mb-10 flex items-baseline gap-2">
                                <span className="text-5xl font-bold tracking-tight">$24.99</span>
                                <span className="text-sm font-medium text-white/30">/month</span>
                            </div>

                            <p className="text-sm font-bold text-white mb-8">
                                Credits top-up: $10 for 100 credits
                            </p>

                            <ul className="space-y-3 mb-12 text-sm text-white/50 font-medium">
                                <li className="leading-relaxed">
                                    Subscription includes 200 credits every month
                                </li>
                                <li className="leading-relaxed">
                                    AI sites/slides cost 10, pages 5, and visuals 2 credits
                                </li>
                                <li className="leading-relaxed">
                                    Export to HTML, PDF, and images included with subscription
                                </li>
                                <li className="leading-relaxed">
                                    Buy extra credits separately any time
                                </li>
                            </ul>

                            <p className="text-[11px] leading-relaxed text-white/50 font-medium max-w-xs mb-12">
                                Free trial includes 15 credits. Subscribe to unlock full AI generation limits and unlimited exports.
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <button
                                className="text-sm font-bold text-white hover:text-white/70 transition-colors tracking-wide cursor-pointer"
                                onClick={async () => {
                                    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
                                    if (!priceId) return;
                                    const res = await fetch("/api/stripe/checkout", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ priceId }),
                                    });
                                    if (res.status === 401) {
                                        window.location.href = "/signup?next=/pricing";
                                        return;
                                    }
                                    const { url } = await res.json() as { url: string };
                                    if (url) window.location.href = url;
                                }}
                            >
                                Subscribe
                            </button>
                        </div>
                    </div>

                    <div className="relative overflow-hidden bg-[#0a0a0a] p-10 md:p-14 border border-white/5 shadow-2xl flex flex-col justify-between" style={{ borderRadius: '10px' }}>
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Drape Teams</h2>

                            <div className="mb-10 flex items-baseline gap-2">
                                <span className="text-5xl font-bold tracking-tight">$24.99</span>
                                <span className="text-sm font-medium text-white/30">/month</span>
                            </div>

                            <p className="text-sm font-bold text-white mb-8">
                                Credits top-up: $10 for 100 credits
                            </p>

                            <ul className="space-y-3 mb-12 text-sm text-white/50 font-medium">
                                <li className="leading-relaxed">
                                    Subscription includes 200 credits every month
                                </li>
                                <li className="leading-relaxed">
                                    AI sites/slides cost 10, pages 5, and visuals 2 credits
                                </li>
                                <li className="leading-relaxed">
                                    Export to HTML, PDF, and images included with subscription
                                </li>
                                <li className="leading-relaxed">
                                    Buy extra credits separately any time
                                </li>
                            </ul>

                            <p className="text-[11px] leading-relaxed text-white/50 font-medium max-w-xs mb-12">
                                Free trial includes 15 credits. Subscribe to unlock full AI generation limits and unlimited exports.
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <button
                                className="text-sm font-bold text-white hover:text-white/70 transition-colors tracking-wide cursor-pointer"
                                onClick={async () => {
                                    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
                                    if (!priceId) return;
                                    const res = await fetch("/api/stripe/checkout", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ priceId }),
                                    });
                                    if (res.status === 401) {
                                        window.location.href = "/signup?next=/pricing";
                                        return;
                                    }
                                    const { url } = await res.json() as { url: string };
                                    if (url) window.location.href = url;
                                }}
                            >
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
