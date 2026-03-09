import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

type Post = {
  id: string;
  title: string;
  excerpt: string;
  createdAt: string;
  image: string;
};

const posts: Post[] = [
  {
    id: "collection-first-styling",
    title: "Building a Collection-First Styling Workflow",
    excerpt:
      "Why Drape starts with what users actually own, and how collection-aware outfit generation creates more useful styling decisions.",
    createdAt: "March 9, 2026",
    image: "/Assets/UI.png",
  },
  {
    id: "motion-preview",
    title: "From Still Look to Motion Preview",
    excerpt:
      "A look at how Drape turns generated outfits into short video previews so users can evaluate styling in motion before saving or sharing.",
    createdAt: "March 7, 2026",
    image: "/Assets/Hero-BG.png",
  },
  {
    id: "weekly-plan",
    title: "Why Weekly Outfit Planning Matters",
    excerpt:
      "Drape Plan turns wardrobe decisions into a reusable weekly system, helping users organize looks ahead of time without losing flexibility.",
    createdAt: "March 5, 2026",
    image: "/Assets/Plan.png",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Navbar />
      <main className="mx-auto max-w-[1100px] px-6 pt-40 pb-24">
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">Blog</h1>
          <p className="max-w-2xl text-base leading-7 text-white/55">
            Notes on AI styling, outfit planning, product direction, and how Drape is being built.
          </p>
        </header>

        <div className="space-y-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="flex flex-col gap-5 rounded-2xl border border-white/8 bg-white/[0.02] p-5 md:flex-row md:items-center"
            >
              <div className="h-28 w-full overflow-hidden rounded-xl border border-white/8 bg-white/5 md:h-28 md:w-44 md:flex-shrink-0">
                <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-white/35">{post.createdAt}</p>
                <h2 className="mb-3 text-2xl font-semibold tracking-tight text-white">{post.title}</h2>
                <p className="text-base leading-7 text-white/55">{post.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
