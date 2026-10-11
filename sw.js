// Y2S1 Prep — offline cache service worker
// Bump CACHE_VERSION whenever page content changes or new pages/images are added,
// so the old cache is discarded and the new list gets fetched fresh.
const CACHE_VERSION = "y2s1-prep-v4";

const PRECACHE_URLS = [
  "/y2s1_2/ee2005-prep/ac-machines.html",
  "/y2s1_2/ee2005-prep/ac-quiz-drill.html",
  "/y2s1_2/ee2005-prep/dc-machines.html",
  "/y2s1_2/ee2005-prep/exam-by-topic.html",
  "/y2s1_2/ee2005-prep/exam-focus.html",
  "/y2s1_2/ee2005-prep/exam-practice.html",
  "/y2s1_2/ee2005-prep/index.html",
  "/y2s1_2/ee2005-prep/style.css",
  "/y2s1_2/ee2005-prep/week1-classic.html",
  "/y2s1_2/ee2005-prep/week1.html",
  "/y2s1_2/ee2005-prep/week2-classic.html",
  "/y2s1_2/ee2005-prep/week2.html",
  "/y2s1_2/ee2005-prep/week3-classic.html",
  "/y2s1_2/ee2005-prep/week3.html",
  "/y2s1_2/ee2005-prep/week4-classic.html",
  "/y2s1_2/ee2005-prep/week4.html",
  "/y2s1_2/ee2005-prep/week5-classic.html",
  "/y2s1_2/ee2005-prep/week5.html",
  "/y2s1_2/ee2005-prep/week6-classic.html",
  "/y2s1_2/ee2005-prep/week6.html",
  "/y2s1_2/ee2005-prep/week7-classic.html",
  "/y2s1_2/ee2005-prep/week7.html",
  "/y2s1_2/ie2104-prep/exam-by-topic.html",
  "/y2s1_2/ie2104-prep/exam-focus.html",
  "/y2s1_2/ie2104-prep/exam-practice.html",
  "/y2s1_2/ie2104-prep/index.html",
  "/y2s1_2/ie2104-prep/quiz2-practice.html",
  "/y2s1_2/ie2104-prep/routine.html",
  "/y2s1_2/ie2104-prep/style.css",
  "/y2s1_2/ie2104-prep/week1-classic.html",
  "/y2s1_2/ie2104-prep/week1.html",
  "/y2s1_2/ie2104-prep/week10-classic.html",
  "/y2s1_2/ie2104-prep/week10.html",
  "/y2s1_2/ie2104-prep/week11-classic.html",
  "/y2s1_2/ie2104-prep/week11.html",
  "/y2s1_2/ie2104-prep/week12-classic.html",
  "/y2s1_2/ie2104-prep/week12.html",
  "/y2s1_2/ie2104-prep/week13-classic.html",
  "/y2s1_2/ie2104-prep/week13.html",
  "/y2s1_2/ie2104-prep/week2-classic.html",
  "/y2s1_2/ie2104-prep/week2.html",
  "/y2s1_2/ie2104-prep/week3-classic.html",
  "/y2s1_2/ie2104-prep/week3.html",
  "/y2s1_2/ie2104-prep/week4-classic.html",
  "/y2s1_2/ie2104-prep/week4.html",
  "/y2s1_2/ie2104-prep/week5-classic.html",
  "/y2s1_2/ie2104-prep/week5.html",
  "/y2s1_2/ie2104-prep/week6-classic.html",
  "/y2s1_2/ie2104-prep/week6.html",
  "/y2s1_2/ie2104-prep/week7-classic.html",
  "/y2s1_2/ie2104-prep/week7.html",
  "/y2s1_2/ie2104-prep/week8-classic.html",
  "/y2s1_2/ie2104-prep/week8.html",
  "/y2s1_2/ie2104-prep/week9-classic.html",
  "/y2s1_2/ie2104-prep/week9.html",
  "/y2s1_2/ie2106-prep/exam-focus.html",
  "/y2s1_2/ie2106-prep/exam-practice.html",
  "/y2s1_2/ie2106-prep/hypothesis-testing.html",
  "/y2s1_2/ie2106-prep/index.html",
  "/y2s1_2/ie2106-prep/quiz-practice.html",
  "/y2s1_2/ie2106-prep/style.css",
  "/y2s1_2/ie2106-prep/week1-classic.html",
  "/y2s1_2/ie2106-prep/week1.html",
  "/y2s1_2/ie2106-prep/week10.html",
  "/y2s1_2/ie2106-prep/week11.html",
  "/y2s1_2/ie2106-prep/week12.html",
  "/y2s1_2/ie2106-prep/week13.html",
  "/y2s1_2/ie2106-prep/week2-classic.html",
  "/y2s1_2/ie2106-prep/week2.html",
  "/y2s1_2/ie2106-prep/week3-classic.html",
  "/y2s1_2/ie2106-prep/week3.html",
  "/y2s1_2/ie2106-prep/week4-classic.html",
  "/y2s1_2/ie2106-prep/week4.html",
  "/y2s1_2/ie2106-prep/week5-classic.html",
  "/y2s1_2/ie2106-prep/week5.html",
  "/y2s1_2/ie2106-prep/week6-classic.html",
  "/y2s1_2/ie2106-prep/week6.html",
  "/y2s1_2/ie2106-prep/week7.html",
  "/y2s1_2/ie2106-prep/week8.html",
  "/y2s1_2/ie2106-prep/week9.html",
  "/y2s1_2/index.html",
  "/y2s1_2/style.css",
  "/y2s1_2/ie2104-prep/images/q3_zoom.png",
  "/y2s1_2/ie2104-prep/images/q4_full.png",
  "/y2s1_2/ie2104-prep/images/q5_full.png",
  "/y2s1_2/ie2104-prep/images/t6q1a_zoom.png",
  "/y2s1_2/ie2104-prep/images/t7q1_circuit.png",
  "/y2s1_2/ie2104-prep/images/w-070.png",
  "/y2s1_2/ie2104-prep/images/w-072.png",
  "/y2s1_2/ie2104-prep/images/w-074.png",
  "/y2s1_2/ie2104-prep/images/w-080.png",
  "/y2s1_2/ie2104-prep/images/w-082.png",
  "/y2s1_2/ie2104-prep/images/w-084.png",
  "/y2s1_2/ie2104-prep/images/w-133.png",
  "/y2s1_2/ie2104-prep/images/w-179.png",
  "/y2s1_2/ie2104-prep/images/w-201.png",
  "/y2s1_2/ie2104-prep/images2/t-1.png",
  "/y2s1_2/ie2104-prep/images2/t-2.png",
  "/y2s1_2/ie2104-prep/images2/t-3.png",
  "/y2s1_2/ie2104-prep/images2/t-4.png",
  "/y2s1_2/ie2104-prep/images2/t-6.png",
  "/y2s1_2/ie2104-prep/images2/t-7.png",
  "/y2s1_2/ie2104-prep/images2/t-8.png",
  "/y2s1_2/ie2104-prep/images2/t10q1_zoom.png",
  "/y2s1_2/manifest.json",
  "/y2s1_2/icons/icon-192.png",
  "/y2s1_2/icons/icon-512.png",
  "/y2s1_2/icons/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      // addAll fails entirely if any single URL 404s, so cache one-by-one
      // and ignore individual failures instead of aborting the whole install.
      return Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((err) => console.warn("Precache failed for", url, err))
        )
      );
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Network-first, falling back to cache when offline.
// On a successful network fetch, the cache is refreshed with the latest version,
// so pages (and any image/asset they load) stay up to date and get cached
// automatically the moment they're viewed online — not just the pages listed above.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache good responses, so a 404 or error page never overwrites a good cached copy.
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // Fallback for navigations to an uncached page while offline.
          if (event.request.mode === "navigate") {
            return caches.match("/y2s1_2/index.html");
          }
        })
      )
  );
});
