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

1. `index.html` — address entry (Google Places autocomplete)
2. `get-your-offer.html` — name / email / phone
3. `get-your-offer-send.html` — embedded CRM form, receives everything

Carried through the whole funnel and handed to the CRM form:
`address`, `first_name`, `last_name`, `email`, `phone`, `fbclid`, `fbc`, `fbp`,
`utm_source`, `utm_medium`, `utm_campaign`, `lead_source=Facebook`.

The CRM form is a GoHighLevel embed (form `dNKGsbO90msgBMgJWxKQ`). Leads
currently route to the Summit Group CRM — change the iframe URL in
`get-your-offer-send.html` to point somewhere else.

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
