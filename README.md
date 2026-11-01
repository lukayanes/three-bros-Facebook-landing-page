# Three Brothers Realty — Facebook Leads Landing Page

Static site for `threebrothershomeoffer.com`, deployed with GitHub Pages.

## Before going live: set the analytics IDs

Both IDs live in **`analytics.js`** (top of the file) and nowhere else —
every page loads that one file.

```js
var TBR_ANALYTICS = {
  GA_MEASUREMENT_ID: "REPLACE_WITH_GA4_ID",   // G-XXXXXXXXXX
  META_PIXEL_ID:     "REPLACE_WITH_PIXEL_ID"  // 15-16 digit number
};
```

- **GA4 ID** — analytics.google.com → Admin → Data Streams → your stream → *Measurement ID*
- **Meta Pixel ID** — business.facebook.com → Events Manager → your pixel → *Data Sources*

Until both are filled in, tracking stays off deliberately, so this site never
reports into the old Summit Group accounts. Check the browser console — it logs
a warning for whichever one is still unset.

## Lead flow

1. `/` — address entry (Google Places autocomplete)
2. `/get-your-offer/` — name / email / phone + SMS consent
3. `/get-your-offer-send/` — reason for selling, asking price, listed with a
   Realtor; submitting sends the complete lead to the CRM, then `/thank-you/`

Steps 1 and 2 keep their answers in the browser (`localStorage`); step 3 sends
everything — address, contact details, consent, step-3 answers, `fbclid`,
`fbc`, `fbp` and UTMs — to the CRM's ingest URL (`CRM_INGEST_URL` in
`script.js`). Nothing is sent before step 3. Since 2026-11-01 these leads go to
the new CRM only (the GoHighLevel form that used to be step 3 was removed).

`script.js` is loaded as `/script.js?v=…`: bump that value in every page when
the script changes, so browsers holding the old copy fetch the new one.

## Deploying

GitHub Pages serves from the repo root. `CNAME` holds the custom domain.

DNS at GoDaddy for `threebrothershomeoffer.com`:

| Type  | Name  | Value                 |
|-------|-------|-----------------------|
| A     | @     | 185.199.108.153       |
| A     | @     | 185.199.109.153       |
| A     | @     | 185.199.110.153       |
| A     | @     | 185.199.111.153       |
| CNAME | www   | `<username>.github.io` |

Then in the repo: **Settings → Pages → Custom domain** → `threebrothershomeoffer.com`
and tick **Enforce HTTPS** once the certificate is issued (can take a few minutes).
