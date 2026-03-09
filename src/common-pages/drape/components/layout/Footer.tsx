import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative overflow-hidden border-t border-white/10 bg-[#17171a] px-6 py-[120px] pb-20">
            <div
                className="pointer-events-none absolute inset-0 z-0 opacity-20"
                style={{
                    backgroundImage: `linear-gradient(to right, #ffffff0d 1px, transparent 1px), linear-gradient(to bottom, #ffffff0d 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            <div className="relative z-10 mx-auto flex max-w-[1100px] flex-col items-end">
                <Link href="/" className="mb-9 inline-block">
                    <Logo className="h-[60px] w-auto" />
                </Link>

                <nav className="mb-[72px] flex flex-col items-end gap-2">
                    <Link href="/pages/drape/signup.html" className="text-base font-medium text-white/50 transition-all duration-300 hover:scale-105 hover:text-white active:scale-95">Sign Up</Link>
                    <Link href="/pages/drape/pricing.html" className="text-base font-medium text-white/50 transition-all duration-300 hover:scale-105 hover:text-white active:scale-95">Pricing</Link>
                    <Link href="/pages/drape/faqs.html" className="text-base font-medium text-white/50 transition-all duration-300 hover:scale-105 hover:text-white active:scale-95">FAQs</Link>
                    <Link href="/pages/drape/blog.html" className="text-base font-medium text-white/50 transition-all duration-300 hover:scale-105 hover:text-white active:scale-95">Blog</Link>
                    <Link href="/pages/drape/help.html" className="text-base font-medium text-white/50 transition-all duration-300 hover:scale-105 hover:text-white active:scale-95">Help</Link>
                    <Link href="/pages/drape/contact.html" className="text-base font-medium text-white/50 transition-all duration-300 hover:scale-105 hover:text-white active:scale-95">Contact</Link>
                    <Link href="/pages/drape/privacy.html" className="text-base font-medium text-white/50 transition-all duration-300 hover:scale-105 hover:text-white active:scale-95">Privacy</Link>
                    <Link href="/pages/drape/terms.html" className="text-base font-medium text-white/50 transition-all duration-300 hover:scale-105 hover:text-white active:scale-95">Terms</Link>
                </nav>

                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">
                    © {currentYear} Drape. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
