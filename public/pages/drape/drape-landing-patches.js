(() => {
  const patchSessionSection = () => {
    const section = document.querySelector('.session-section');
    if (!section) return false;
    if (section.dataset.drapePatched === '1') return true;

    const container = section.querySelector('.max-w-4xl.mx-auto') || section.querySelector('.max-w-4xl');
    if (!container) return false;

    container.innerHTML = `
      <div class="drape-session-copy">
        <h2>Cloud-Based Workflow. No Software Downloads.</h2>
        <div class="drape-session-paragraphs">
          <p>Drape runs entirely in the browser, so there is nothing to install, patch, or manage. Open your workspace and start styling immediately from any modern device.</p>
          <p>Your collection, generated looks, weekly plans, and saved favourites stay connected to the same workflow, making it easy to move between inspiration, outfit generation, and planning without breaking context.</p>
          <p>Because Drape is cloud-based, your workflow is available wherever you need it. Review looks on one device, return later on another, and keep building from the same wardrobe system.</p>
        </div>
      </div>
    `;

    section.dataset.drapePatched = '1';
    section.classList.add('session-section--drape');
    return true;
  };

  const runPatches = () => {
    patchSessionSection();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runPatches, { once: true });
  } else {
    runPatches();
  }

  const observer = new MutationObserver(() => {
    patchSessionSection();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  window.addEventListener('load', runPatches, { once: true });
})();
