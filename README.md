# PrimeScriptLab Website

This is a static website for the Fiverr gig:

https://www.fiverr.com/primescriptlab_/make-a-script-for-almost-any-programming-language

## Files

- `index.html` - public storefront, packages, order form, PayPal section and local dashboard.
- `styles.css` - responsive modern styling.
- `config.js` - editable prices, services, packages, contact email and PayPal settings.
- `app.js` - package selection, live quote, saved orders, CSV export and PayPal SDK logic.
- `assets/prime-script-lab-hero.png` - generated hero image used by the website.

## Open locally

Open this file in a browser:

`C:\Users\srdan\Documents\New project 4\primescriptlab-site\index.html`

Because it is a static website, it can also be deployed to Netlify, Vercel, GitHub Pages or regular web hosting.

## Match your exact Fiverr packages

Open `config.js` and edit:

- `packages`
- `languages`
- `scriptTypes`
- `addons`
- `integrationPrice`
- `contactEmail`

The current prices are starter placeholders because Fiverr did not expose the exact package table to the crawler. Replace them with the exact Fiverr prices when you have them.

## Connect PayPal

1. Create or log into a PayPal business account.
2. Create a PayPal REST app in the PayPal Developer Dashboard.
3. Copy the live client ID.
4. In `config.js`, replace:

```js
clientId: "YOUR_PAYPAL_CLIENT_ID"
```

with your real live client ID.

5. Set `currency` if you want something other than `USD`.
6. Deploy the website and test a small live payment.

For real production use, add a small backend for secure order storage, email notifications and PayPal webhooks. The current dashboard saves orders in the visitor's browser using `localStorage`, which is good for demo/testing but not enough for real clients.
