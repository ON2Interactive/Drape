(function () {
  const hrefMap = {
    '/signup': '/pages/drape/signup.html',
    '/pricing': '/pages/drape/pricing.html',
    '/faqs': '/pages/drape/faqs.html',
    '/blog': '/pages/drape/blog.html',
    '/help': '/pages/drape/help.html',
    '/contact': '/pages/drape/contact.html',
    '/privacy': '/pages/drape/privacy.html',
    '/terms': '/pages/drape/terms.html',
  };

  function patchLinks() {
    document.querySelectorAll('a[href]').forEach((link) => {
      const href = link.getAttribute('href');
      if (href && hrefMap[href]) {
        link.setAttribute('href', hrefMap[href]);
      }
    });
  }

  function patchNav() {
    const existingPatched = document.querySelector('.common-pill-nav-wrap');
    const navs = Array.from(document.querySelectorAll('body > nav, body > header.common-pill-nav-wrap, body > div.min-h-screen > nav'));

    if (existingPatched) {
      navs.forEach((nav) => {
        if (!nav.closest('.common-pill-nav-wrap')) nav.remove();
      });
      return;
    }

    const nav = navs.find((candidate) => !candidate.closest('.common-pill-nav-wrap'));
    if (!nav) return;

    nav.outerHTML = `
      <header class="common-pill-nav-wrap">
        <div class="common-pill-nav">
          <a href="/" class="common-pill-nav-brand" aria-label="Drape home">
            <img src="/drape-logo.svg" alt="Drape" class="common-pill-nav-logo" />
          </a>
          <nav class="common-pill-nav-links">
            <a href="/pages/drape/pricing.html">Pricing</a>
            <a href="/pages/drape/faqs.html">FAQs</a>
            <a href="/pages/drape/contact.html">Contact</a>
          </nav>
          <a class="common-pill-nav-cta" href="/pages/drape/signup.html">Get Started</a>
        </div>
      </header>
    `;
  }

  function patchFooterCopy() {
    const footer = document.querySelector('footer');
    if (!footer) return;

    const year = new Date().getFullYear();
    footer.className = 'landing-footer';
    footer.innerHTML = `
      <div class="landing-footer-grid"></div>
      <div class="landing-footer-content">
        <a href="/" class="landing-footer-logo-link">
          <img src="/drape-logo.svg" alt="Drape" class="landing-footer-logo" />
        </a>
        <nav class="landing-footer-nav">
          <a href="/pages/drape/signup.html">Sign Up</a>
          <a href="/pages/drape/pricing.html">Pricing</a>
          <a href="/pages/drape/faqs.html">FAQs</a>
          <a href="/pages/drape/blog.html">Blog</a>
          <a href="/pages/drape/help.html">Help</a>
          <a href="/pages/drape/contact.html">Contact</a>
          <a href="/pages/drape/privacy.html">Privacy</a>
          <a href="/pages/drape/terms.html">Terms</a>
        </nav>
        <div class="landing-footer-copy">© ${year} Drape. All rights reserved.</div>
      </div>
    `;
  }

  function applyPatches() {
    const path = window.location.pathname;
    const longformPages = [
      '/pages/drape/faqs.html',
      '/pages/drape/blog.html',
      '/pages/drape/help.html',
      '/pages/drape/privacy.html',
      '/pages/drape/terms.html',
      '/pages/drape/contact.html',
    ];

    if (longformPages.includes(path)) document.body.classList.add('drape-longform-page');

    patchNav();
    patchLinks();
    patchFooterCopy();
  }

  document.addEventListener('DOMContentLoaded', applyPatches);
  window.addEventListener('load', applyPatches);
  window.setTimeout(applyPatches, 50);
  window.setTimeout(applyPatches, 250);
})();
