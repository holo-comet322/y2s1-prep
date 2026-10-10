// Registers the offline service worker. Safe to include on every page —
// browsers without service worker support (or blocked by settings) just skip this.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/y2s1_2/sw.js", { scope: "/y2s1_2/" })
      .catch((err) => console.warn("Service worker registration failed:", err));
  });
}
