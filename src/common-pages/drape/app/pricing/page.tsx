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
                        Choose the tier that matches your workflow. Upgrade anytime as your styling needs grow.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                    <div className="relative overflow-hidden bg-[#0a0a0a] p-10 md:p-14 border border-white/5 shadow-2xl flex flex-col justify-between" style={{ borderRadius: '10px' }}>
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Drape Starter</h2>

                            <div className="mb-10 flex items-baseline gap-2">
                                <span className="text-5xl font-bold tracking-tight">$19.99</span>
                                <span className="text-sm font-medium text-white/30">/month</span>
                            </div>

                            <p className="text-sm font-medium text-white/50 mb-8">
                                Billed monthly
                            </p>

                            <ul className="space-y-3 mb-12 text-sm text-white/50 font-medium">
                                <li className="leading-relaxed">
                                    30 generations per month
                                </li>
                                <li className="leading-relaxed">Weekly Plan</li>
                            </ul>

                            <p className="text-[11px] leading-relaxed text-white/50 font-medium max-w-xs mb-12">&nbsp;</p>
                        </div>

                        <div className="flex justify-center">
                            <button
                                className="text-sm font-bold text-white hover:text-white/70 transition-colors tracking-wide cursor-pointer"
                                onClick={() => {
                                    window.location.href = "/pages/drape/signup.html";
                                }}
                            >
                                Get Started
                            </button>
                        </div>
                    </div>

                    <div className="relative overflow-hidden bg-[#0a0a0a] p-10 md:p-14 border border-white/5 shadow-2xl flex flex-col justify-between" style={{ borderRadius: '10px' }}>
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Drape Standard</h2>

                            <div className="mb-10 flex items-baseline gap-2">
                                <span className="text-5xl font-bold tracking-tight">$29.99</span>
                                <span className="text-sm font-medium text-white/30">/month</span>
                            </div>

                            <p className="text-sm font-medium text-white/50 mb-8">
                                Billed monthly
                            </p>

                            <ul className="space-y-3 mb-12 text-sm text-white/50 font-medium">
                                <li className="leading-relaxed">60 generations per month</li>
                                <li className="leading-relaxed">Weekly Plan</li>
                                <li className="leading-relaxed">Video Generation</li>
                            </ul>

                            <p className="text-[11px] leading-relaxed text-white/50 font-medium max-w-xs mb-12">&nbsp;</p>
                        </div>

                        <div className="flex justify-center">
                            <button
                                className="text-sm font-bold text-white hover:text-white/70 transition-colors tracking-wide cursor-pointer"
                                onClick={() => {
                                    window.location.href = "/pages/drape/signup.html";
                                }}
                            >
                                Get Started
                            </button>
                        </div>
                    </div>

                    <div className="relative overflow-hidden bg-[#0a0a0a] p-10 md:p-14 border border-white/5 shadow-2xl flex flex-col justify-between" style={{ borderRadius: '10px' }}>
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Drape Pro</h2>

                            <div className="mb-10 flex items-baseline gap-2">
                                <span className="text-5xl font-bold tracking-tight">$49.99</span>
                                <span className="text-sm font-medium text-white/30">/month</span>
                            </div>

                            <p className="text-sm font-medium text-white/50 mb-8">
                                Billed monthly
                            </p>

                            <ul className="space-y-3 mb-12 text-sm text-white/50 font-medium">
                                <li className="leading-relaxed">Unlimited generations per month</li>
                                <li className="leading-relaxed">Weekly Plan</li>
                                <li className="leading-relaxed">Video Generation</li>
                                <li className="leading-relaxed">Stylist</li>
                            </ul>

                            <p className="text-[11px] leading-relaxed text-white/50 font-medium max-w-xs mb-12">
                                Unlimited usage is subject to fair-use limits to ensure stable performance for all users.
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <button
                                className="text-sm font-bold text-white hover:text-white/70 transition-colors tracking-wide cursor-pointer"
                                onClick={() => {
                                    window.location.href = "/pages/drape/signup.html";
                                }}
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
