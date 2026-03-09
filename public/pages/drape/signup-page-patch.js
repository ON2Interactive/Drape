function patchSignupPage() {
  const leftImage =
    document.querySelector('img[alt="MagXStudio Studio"]') ||
    document.querySelector('img[alt="Drape studio"]');

  if (leftImage) {
    leftImage.setAttribute('src', '/Assets/Hero-BG.png');
    leftImage.setAttribute('alt', 'Drape studio');
  }

  const logoLink = Array.from(document.querySelectorAll('a')).find((node) =>
    node.className?.includes('transition-opacity') && node.querySelector('svg')
  );

  if (logoLink) {
    logoLink.innerHTML = '<img src="/drape-logo.svg" alt="Drape" class="h-12 w-auto" />';
  }

  return Boolean(leftImage || logoLink);
}

document.addEventListener('DOMContentLoaded', () => {
  if (patchSignupPage()) return;

  const observer = new MutationObserver(() => {
    if (patchSignupPage()) {
      observer.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  window.setTimeout(() => observer.disconnect(), 8000);
});
