const CACHE_NAME = "campusnav-v1";

const APP_FILES = [
    "./",
    "./index.html",
    "./manifest.json",
    "./css/style.css",
    "./js/app.js",
    "./js/map.js",
    "./assets/logo.png"
];


/* =========================================================
   INSTALL
========================================================= */

self.addEventListener("install", event => {

    console.log("CampusNav PWA: Installing...");

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(APP_FILES);

            })

    );

    self.skipWaiting();

});


/* =========================================================
   ACTIVATE
========================================================= */

self.addEventListener("activate", event => {

    console.log("CampusNav PWA: Activated.");

    event.waitUntil(

        caches.keys()
            .then(cacheNames => {

                return Promise.all(

                    cacheNames
                        .filter(name => name !== CACHE_NAME)
                        .map(name => caches.delete(name))

                );

            })

    );

    self.clients.claim();

});


/* =========================================================
   FETCH
========================================================= */

self.addEventListener("fetch", event => {

    /*
     * Google Maps and external API requests should
     * continue going directly to the network.
     */

    const requestURL =
        new URL(event.request.url);

    if (
        requestURL.hostname.includes("googleapis.com") ||
        requestURL.hostname.includes("gstatic.com")
    ) {

        return;

    }


    /*
     * Application files:
     * Cache first, then network.
     */

    event.respondWith(

        caches.match(event.request)
            .then(cachedResponse => {

                if (cachedResponse) {

                    return cachedResponse;

                }

                return fetch(event.request)
                    .then(response => {

                        /*
                         * Only cache valid responses.
                         */

                        if (
                            !response ||
                            response.status !== 200 ||
                            response.type === "opaque"
                        ) {

                            return response;

                        }

                        const responseClone =
                            response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {

                                cache.put(
                                    event.request,
                                    responseClone
                                );

                            });

                        return response;

                    });

            })

    );

});