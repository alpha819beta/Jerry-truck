# Appalachian Assists Website

The website for Appalachian Assists (hauling, landscaping and transport, 681-220-0257).
It runs **entirely on Firebase's free Spark plan, with no credit card**:

- **Firebase Hosting** serves the site as plain static files.
- **Cloud Firestore** stores requests, invoices, photos, reviews, events and subscribers.
- **Firebase Authentication** handles the owner login.
- **EmailJS** (free: 200 emails/month) sends email alerts, invoices and newsletters.

> The previous server-based version (Twilio texts, Stripe, SQLite) is saved in `../Jerry-truck-server-backup`.

## What's included

**Public site**
- **Home**: overview, services, delivery rates, recent job photos, reviews, upcoming events, contact info, plus **Book Now** and **Get an Estimate** buttons.
- **Get an Estimate**: contact info and job details → **alert sent to the owner** (email, and optionally as a text; see "Getting alerts as texts").
- **Book Now**: pick materials and loads (live total), contact info, address, preferred date, extra details → **alert sent to the owner**.
- **Our Work**: job photo gallery with full-screen viewer.
- **Reviews**: approved reviews and a "leave a review" form (you approve before it shows), plus a link to review on Facebook.
- **Events**: monthly calendar and an upcoming list.
- **Newsletter**: email signup with one-click unsubscribe; customers can also opt in while booking.

**Owner portal** (`/admin`)
- **Requests**: every estimate and booking. Call/text the customer, keep private notes, change status, and **create an invoice** pre-filled with what they ordered. Add distance, fuel, labor or other fees, or a discount.
- **Invoices**: invoices from requests or **custom invoices from scratch**.
  - **Text to customer** opens the Messages app on your phone with the invoice link already written. Just hit send (free, from your own number).
  - **Email to customer** sends through EmailJS. **Copy link** lets you paste it into Messenger, etc.
  - Customers see a printable invoice page. Add your own Square/PayPal/Stripe **payment link** to show a "Pay Online" button.
  - Mark invoices paid (cash, check, …) or void them. Shows outstanding and paid-this-month totals.
- **Photos**: upload many at once from your phone; they're shrunk automatically.
- **Reviews**: approve or hide reviews, and copy reviews from your Facebook page (shown with a Facebook badge).
- **Events**: click a day on the calendar to add an event; click an event to edit it.
- **Newsletter**: write, send yourself a test, then send to all subscribers.
- **Materials & Prices**: edit the price list used on the home page and Book Now form.

## One-time setup (about 20 minutes)

### 1. Create the Firebase project (free, no card)
1. Go to <https://console.firebase.google.com> → **Add project**. You can turn Google Analytics off.
2. **Build → Firestore Database → Create database**, Production mode, pick a US location.
3. **Build → Authentication → Get started → Email/Password → Enable**. Then **Users → Add user** with the owner's email and a strong password.
4. **Project settings (gear) → General → Your apps → Web (`</>`)**. Register an app (skip Hosting setup there) and copy the config values.

### 2. Configure the site
```bash
npm install
cp .env.example .env.local     # fill in the Firebase values (and EmailJS, step 4)
cp .firebaserc.example .firebaserc
```
In `.firebaserc`, replace `YOUR-PROJECT-ID` with your Firebase project ID (it appears in 3 places).

### 3. Deploy
```bash
npx firebase login
npx firebase hosting:sites:create YOUR-PROJECT-ID-admin   # the separate owner-portal site
npm run deploy                                            # builds, then uploads site + security rules
```
- Public site: `https://YOUR-PROJECT-ID.web.app`
- Owner portal: `https://YOUR-PROJECT-ID-admin.web.app` (goes straight to the login)

The public site doesn't include the `/admin` pages at all; they only exist on the admin site.
Your data is protected by [`firestore.rules`](firestore.rules): only the owner account can read requests, invoices and subscribers.

Put those two addresses into `.env.local` as `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_ADMIN_URL`, then `npm run deploy` again.
A custom domain (e.g. `appalachianassists.com`) can be connected for free under **Hosting → Add custom domain**; you only pay for the domain itself.

### 4. Make yourself the owner
Open the owner portal and log in. It will show your **user ID** with instructions. In **Firestore Database**, create a collection named `admins`, add a document whose **Document ID is that user ID** (add any field, e.g. `name` = `owner`), and reload.
On first login, click **Load starter content** to load the price list and starter photos.

### 5. Email alerts (EmailJS)
1. Sign up free at <https://www.emailjs.com>.
2. **Email Services → Add New Service** (e.g. Gmail) → note the **Service ID**.
3. **Email Templates → Create New Template** twice:
   - **Owner alert**: *To Email* = your email; *Subject* = `{{subject}}`; *Content* = `{{message}}`. Note its **Template ID**.
   - **Customer**: *To Email* = `{{to_email}}`; *Subject* = `{{subject}}`; *Content* = `{{message}}`; *Reply To* = your email. Note its **Template ID**.
4. **Account → General** → copy the **Public Key**.
5. **Account → Security**: add your site's domains (`YOUR-PROJECT-ID.web.app`, `YOUR-PROJECT-ID-admin.web.app`, your custom domain) under allowed origins so other websites can't use your account.
6. Put the four values in `.env.local` and `npm run deploy`.

### Getting alerts as texts (free)
In the **Owner alert** template, add your phone's email-to-text address as a second recipient (BCC). For example `6812200257@vtext.com` (Verizon) or `6812200257@tmomail.net` (T-Mobile). Carriers are phasing these out, and some no longer offer them, so test it. Alternatively, turn on notifications for that email account in your phone's mail app.

## Free-plan limits (plenty for a small business)
| Service | Free limit |
|---|---|
| Firestore | 1 GB stored, 50,000 reads and 20,000 writes per day |
| Hosting | 10 GB storage, 360 MB/day transfer |
| EmailJS | 200 emails/month (alerts + invoices + newsletters combined) |

If the newsletter list grows past what EmailJS's free plan covers, export subscribers from the portal and use a free newsletter service such as MailerLite or Brevo.

## Local development
```bash
npm run dev    # http://localhost:3000 (owner portal at /admin)
```
This uses your real Firebase project. To test without touching real data, use the emulators: `npx firebase emulators:start --only firestore,auth` (requires Java), and start the site with `NEXT_PUBLIC_USE_EMULATORS=1` set.

## Business info
Phone, Facebook link, service area, hours and the "What we do" text are in [`src/lib/site.ts`](src/lib/site.ts). Add a public email there to show it on the site.
Brand images are in `public/brand/`; print/marketing graphics (flyers, QR code) are in `marketing/`.

## Tech
Next.js 15 (static export) · React 19 · Tailwind CSS 4 · Firebase (Hosting, Firestore, Auth) · EmailJS.
