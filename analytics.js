/* =========================================================
   THREE BROTHERS REALTY — analytics
   ---------------------------------------------------------
   EDIT THE TWO IDs BELOW. Nothing else in the site needs
   changing — every page loads this one file.

   GA4  : analytics.google.com -> Admin -> Data Streams
          -> your stream -> "Measurement ID"  (looks like G-XXXXXXXXXX)
   PIXEL: business.facebook.com -> Events Manager
          -> your pixel -> "Data Sources" (a 15-16 digit number)

   Until these are filled in, tracking stays OFF on purpose —
   that keeps Three Brothers traffic out of the old Summit
   Group accounts rather than quietly polluting them.
   ========================================================= */

var TBR_ANALYTICS = {
  GA_MEASUREMENT_ID: "REPLACE_WITH_GA4_ID",      // e.g. "G-ABC1234XYZ"
  META_PIXEL_ID:     "REPLACE_WITH_PIXEL_ID"     // e.g. "1234567890123456"
};

(function () {
  var cfg = TBR_ANALYTICS;
  var unset = function (v) { return !v || v.indexOf("REPLACE_WITH") === 0; };

  /* ---------- Google Analytics 4 ---------- */
  if (unset(cfg.GA_MEASUREMENT_ID)) {
    console.warn("[analytics] GA4 not configured — set GA_MEASUREMENT_ID in analytics.js");
  } else {
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + cfg.GA_MEASUREMENT_ID;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag("js", new Date());
    gtag("config", cfg.GA_MEASUREMENT_ID);
  }

  /* ---------- Meta (Facebook) Pixel ---------- */
  if (unset(cfg.META_PIXEL_ID)) {
    console.warn("[analytics] Meta Pixel not configured — set META_PIXEL_ID in analytics.js");
    return;
  }

  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0";
    n.queue = []; t = b.createElement(e); t.async = !0;
    t.src = v; s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

  fbq("init", cfg.META_PIXEL_ID);
  fbq("track", "PageView");

  /* noscript fallback, injected so the ID lives in one place */
  document.addEventListener("DOMContentLoaded", function () {
    var ns = document.createElement("noscript");
    var img = document.createElement("img");
    img.height = 1; img.width = 1; img.style.display = "none";
    img.src = "https://www.facebook.com/tr?id=" + cfg.META_PIXEL_ID + "&ev=PageView&noscript=1";
    ns.appendChild(img);
    document.body.appendChild(ns);
  });
})();
