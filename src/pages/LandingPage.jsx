import { useEffect, useRef, useState } from 'react';
import drapeLogo from '../assets/drape-logo.svg';
import './LandingPage.css';

const stylistCards = [
  {
    title: 'Talk Naturally',
    body: 'Ask for dinner looks, work outfits, travel styling, or specific pieces the way you would speak to a personal stylist.'
  },
  {
    title: 'Collection-Aware',
    body: 'The Stylist works from the items already in your collection, so recommendations stay grounded in what you actually own.'
  },
  {
    title: 'Refine the Look',
    body: 'Adjust the brief as you go. Ask for one item only, change the mood, or shift the setting until the outfit feels right.'
  },
  {
    title: 'Generate on Command',
    body: 'When the conversation is done, Drape turns the direction into a generated outfit you can review, save, and build from.'
  }
];

const howItWorks = [
  'Upload your profile and build your collection with pieces you actually own, so every look starts from your wardrobe.',
  'Select items, speak to Stylist, or prompt Drape directly to generate outfits in the way that feels most natural to you.',
  'Save favourites, preview motion, share standout looks, and turn the best outfits into a plan for the week ahead.'
];

const stylistSlides = [
  { src: '/slideshow/01.png', alt: 'Drape stylist preview one' },
  { src: '/slideshow/02.png', alt: 'Drape stylist preview two' }
];

const footerLinks = [
  ['Sign Up', '/pages/drape/signup.html'],
  ['Pricing', '/pages/drape/pricing.html'],
  ['FAQs', '/pages/drape/faqs.html'],
  ['Blog', '/pages/drape/blog.html'],
  ['Help', '/pages/drape/help.html'],
  ['Contact', '/pages/drape/contact.html'],
  ['Privacy', '/pages/drape/privacy.html'],
  ['Terms', '/pages/drape/terms.html']
];

export default function LandingPage() {
  const currentYear = new Date().getFullYear();
  const [activeSlide, setActiveSlide] = useState(0);
  const heroRef = useRef(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % stylistSlides.length);
    }, 4000);

    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll('.reveal'));
    if (!elements.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return undefined;

    let frame = null;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    const animate = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      hero.style.setProperty('--hero-shift-x', `${currentX.toFixed(2)}px`);
      hero.style.setProperty('--hero-shift-y', `${currentY.toFixed(2)}px`);

      if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
        frame = window.requestAnimationFrame(animate);
      } else {
        frame = null;
      }
    };

    const start = () => {
      if (frame === null) {
        frame = window.requestAnimationFrame(animate);
      }
    };

    const onPointerMove = (event) => {
      const rect = hero.getBoundingClientRect();
      const relativeX = (event.clientX - rect.left) / rect.width - 0.5;
      const relativeY = (event.clientY - rect.top) / rect.height - 0.5;
      targetX = relativeX * 28;
      targetY = relativeY * 20;
      start();
    };

    const onPointerLeave = () => {
      targetX = 0;
      targetY = 0;
      start();
    };

    hero.addEventListener('pointermove', onPointerMove);
    hero.addEventListener('pointerleave', onPointerLeave);

    return () => {
      hero.removeEventListener('pointermove', onPointerMove);
      hero.removeEventListener('pointerleave', onPointerLeave);
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  return (
    <div className="landing" ref={heroRef}>
      <div className="landing-hero-bg" aria-hidden="true">
        <img src="/Assets/Hero-BG.png" alt="" className="landing-hero-bg-image" />
      </div>
      <header className="landing-nav-wrap">
        <div className="landing-nav reveal reveal-nav is-visible">
          <a href="/" className="landing-nav-brand" aria-label="Drape home">
            <img src={drapeLogo} alt="Drape" className="landing-logo" />
          </a>
          <nav className="landing-links">
            <a href="/pages/drape/pricing.html" target="_blank" rel="noreferrer">
              Pricing
            </a>
            <a href="/pages/drape/faqs.html" target="_blank" rel="noreferrer">
              FAQs
            </a>
            <a href="/pages/drape/contact.html" target="_blank" rel="noreferrer">
              Contact
            </a>
          </nav>
          <a className="landing-nav-cta" href="/?workspace=1">
            Get Started
          </a>
        </div>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <img src={drapeLogo} alt="Drape" className="landing-hero-logo reveal reveal-up is-visible" />
          <h1 className="reveal reveal-up is-visible reveal-delay-1">
            Drape - Personal AI Fashion Stylist &amp; Wardrobe Assistant
          </h1>
          <p className="reveal reveal-up is-visible reveal-delay-2">
            AI styling, outfit planning, and try-ons built around your collection.
          </p>
          <a className="landing-btn-ghost reveal reveal-up is-visible reveal-delay-3" href="/?workspace=1">
            Get Started
          </a>
        </section>
      </main>

      <section className="landing-section landing-section-dark">
        <div className="landing-section-container landing-section-container-wide">
          <h2 className="landing-section-title reveal reveal-up">Intelligent Try On</h2>
          <div className="landing-media-frame reveal reveal-up reveal-delay-1">
            <img src="/Assets/UI.png" alt="Drape UI preview" className="landing-ui-image" />
          </div>
          <p className="landing-section-summary landing-section-summary-dark reveal reveal-up">
            Style with intention using the path that fits the moment. Create realistic looks with
            Intelligent Try On, generate fresh combinations with Drape Remix, direct the outcome with
            Drape Prompt, or speak with Drape Stylist for live collection-based guidance. Save generated
            looks to favourites, download what works, and share standout outfits when you are ready.
          </p>
        </div>
      </section>

      <section className="landing-section landing-section-light">
        <div className="landing-section-container landing-section-container-wide">
          <div className="stylist-heading reveal reveal-up">
            <div className="stylist-kicker">Stylist</div>
            <h2 className="landing-section-title">Hey Drape, style a dinner look from my collection.</h2>
          </div>

          <div className="stylist-card-grid">
            {stylistCards.map((card, index) => (
              <article key={card.title} className={`stylist-card reveal reveal-up reveal-delay-${Math.min(index + 1, 4)}`}>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            ))}
          </div>

          <div className="stylist-slideshow landing-media-frame reveal reveal-up">
            <div className="stylist-slide-frame">
              {stylistSlides.map((slide, index) => (
                <img
                  key={slide.alt}
                  src={slide.src}
                  alt={slide.alt}
                  className={`stylist-slide ${index === activeSlide ? 'is-active' : ''}`}
                />
              ))}
            </div>
            <div className="stylist-slide-dots">
              {stylistSlides.map((slide, index) => (
                <button
                  key={slide.alt}
                  type="button"
                  className={`stylist-slide-dot ${index === activeSlide ? 'is-active' : ''}`}
                  onClick={() => setActiveSlide(index)}
                  aria-label={`Go to stylist slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section landing-section-dark">
        <div className="landing-section-container">
          <h2 className="landing-section-title landing-section-title-left reveal reveal-up">How It Works</h2>
          <div className="how-it-works-list">
            {howItWorks.map((body, index) => (
              <article key={body} className={`how-step reveal reveal-up reveal-delay-${Math.min(index + 1, 4)}`}>
                <div className="how-step-number">{String(index + 1).padStart(2, '0')}</div>
                <p className="how-step-description">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section landing-section-dark">
        <div className="landing-section-container landing-section-container-narrow">
          <h2 className="landing-section-title landing-section-title-left reveal reveal-up">Plan</h2>
          <div className="cloud-copy">
            <p className="reveal reveal-up reveal-delay-1">
              Drape Plan turns your saved looks and collection pieces into a wearable week, so you can
              map outfits across workdays, weekends, and events without starting from scratch each time.
            </p>
            <p className="reveal reveal-up reveal-delay-2">
              Build a full week automatically, rotate through your wardrobe with more intention, and keep
              a clear view of what to wear next based on the pieces you already own.
            </p>
            <p className="reveal reveal-up reveal-delay-3">
              Because Plan stays connected to your collection, generated looks, and favourites, it becomes
              an ongoing wardrobe system rather than a one-off outfit suggestion.
            </p>
          </div>
        </div>
      </section>

      <section className="landing-section landing-section-dark">
        <div className="landing-section-container landing-section-container-narrow">
          <h2 className="landing-section-title landing-section-title-left reveal reveal-up">Video</h2>
          <div className="cloud-copy">
            <p className="reveal reveal-up reveal-delay-1">
              Turn generated looks into motion with Drape Video, so standout outfits can be previewed in
              a more editorial, expressive format before you save or share them.
            </p>
            <p className="reveal reveal-up reveal-delay-2">
              Generate short fashion clips directly from your looks, then review them in a minimal video
              modal, download the final result, or add the best ones to your favourites.
            </p>
            <p className="reveal reveal-up reveal-delay-3">
              Video extends the same workflow as the rest of Drape, which means your saved looks, motion
              previews, and favourites all stay connected inside one styling environment.
            </p>
          </div>
        </div>
      </section>

      <section className="landing-section landing-section-dark">
        <div className="landing-section-container landing-section-container-narrow">
          <h2 className="landing-section-title landing-section-title-left reveal reveal-up">AI Background</h2>
          <div className="cloud-copy">
            <p className="reveal reveal-up reveal-delay-1">
              Remix generated looks into new environments with AI Background, so the same outfit can be
              reimagined on a runway, in a city at night, inside a studio, or against a clean solid backdrop.
            </p>
            <p className="reveal reveal-up reveal-delay-2">
              Keep the person and the outfit intact while changing only the setting, making it easy to
              explore different editorial moods without rebuilding the look from the beginning.
            </p>
            <p className="reveal reveal-up reveal-delay-3">
              From black and white studio backdrops to New York, Paris, or Milan-inspired scenes, AI
              Background gives each look more context, atmosphere, and visual range.
            </p>
          </div>
        </div>
      </section>

      <section className="landing-section landing-section-dark">
        <div className="landing-section-container landing-section-container-narrow">
          <h2 className="landing-section-title landing-section-title-left reveal reveal-up">Share</h2>
          <div className="cloud-copy">
            <p className="reveal reveal-up reveal-delay-1">
              Share standout looks and motion previews directly from Drape, so your strongest outfit
              ideas can move quickly from private styling to client review, team feedback, or personal use.
            </p>
            <p className="reveal reveal-up reveal-delay-2">
              Whether you are working with still images or video, Drape keeps sharing built into the same
              generation flow, making it easy to send what works without exporting into another tool first.
            </p>
            <p className="reveal reveal-up reveal-delay-3">
              The result is a cleaner workflow where favourites, downloads, and share-ready outputs stay
              connected to the same wardrobe system and styling session.
            </p>
          </div>
        </div>
      </section>

      <section className="landing-section landing-section-dark">
        <div className="landing-section-container landing-section-container-narrow">
          <h2 className="landing-section-title landing-section-title-left reveal reveal-up">
            Cloud-Based. No Software Downloads.
          </h2>
          <div className="cloud-copy">
            <p className="reveal reveal-up reveal-delay-1">
              Drape runs entirely in the browser, so there is nothing to install, patch, or manage.
              Open your workspace and start styling immediately from any modern device.
            </p>
            <p className="reveal reveal-up reveal-delay-2">
              Your collection, generated looks, weekly plans, and saved favourites stay connected to the
              same workflow, making it easy to move between inspiration, outfit generation, and planning
              without breaking context.
            </p>
            <p className="reveal reveal-up reveal-delay-3">
              Because Drape is cloud-based, your workflow is available wherever you need it. Review looks
              on one device, return later on another, and keep building from the same wardrobe system.
            </p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-grid" />
        <div className="landing-footer-content">
          <a href="/" className="landing-footer-logo-link">
            <img src={drapeLogo} alt="Drape" className="landing-footer-logo" />
          </a>

          <nav className="landing-footer-nav">
            {footerLinks.map(([label, href]) => (
              <a key={label} href={href} target="_blank" rel="noreferrer">
                {label}
              </a>
            ))}
          </nav>

          <div className="landing-footer-copy">© {currentYear} Drape. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
