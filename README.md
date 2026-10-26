# Shanmukha BS — Full Stack Developer Portfolio

A responsive portfolio for Shanmukha BS, featuring the original dark 3D design and an alternate classic layout. Both versions include résumé, project, GitHub, contact, and Firebase sign-in links.

## Features

- Original 3D portfolio: animated particle canvas, scroll effects, 3D orb, tilt cards, responsive layout, GitHub repository explorer, certificates, and résumé preview/download.
- Classic portfolio alternative at `classic.html`, with a link back to the 3D site.
- Firebase Authentication with Google and email/password sign-in, plus Firebase password-reset emails.
- Email notification to the portfolio administrator after a successful sign-in, sent by a Firebase callable function through Resend.
- Local admin editor for profile, skills, certifications, and projects.

## Folder structure

```text
profile/
├── index.html             # Main 3D portfolio
├── classic.html           # Alternate classic portfolio
├── classic.css            # Classic layout styles
├── login.html             # Firebase login page
├── firebase-auth.js       # Firebase Auth UI and callable notification
├── firebase-config.js     # Firebase Web App settings (fill in before use)
├── firebase.json          # Firebase Functions deployment configuration
├── app.js                 # Portfolio interactions and local admin editor
├── style.css              # Main 3D portfolio styles
├── dashboard.html         # Admin project dashboard
├── profile.html           # Admin profile editor
├── functions/
│   ├── index.js           # Sends successful-login email alerts
│   └── package.json       # Cloud Functions dependencies
└── assets/
    ├── IMG-20250923-WA0002.jpg
    ├── resume.pdf
    └── certificate-*.jpg
```

## Local setup

Serve the site over HTTP (Firebase sign-in does not work reliably from a `file://` URL):

```bash
npm start
```

Then open `http://localhost:3000`. Alternatively, use VS Code Live Server or:

```bash
npx serve . -l 3000
```

## Configure Firebase Authentication

1. Create a Firebase project and register a Web App in [Firebase Console](https://console.firebase.google.com/).
2. Copy the Web App `apiKey`, `authDomain`, `projectId`, and `appId` into `firebase-config.js`. The API key is a browser identifier, not a private secret.
3. In **Authentication → Sign-in method**, enable **Google** and **Email/Password**.
4. Add your local development host and GitHub Pages host (for example, `username.github.io`) under **Authentication → Settings → Authorized domains**.
5. Create the administrator email/password account in Firebase Authentication if using email/password. Google sign-in can create its account on first use.
6. Set `adminEmail` in `firebase-config.js` to the email address that should administer the local dashboard.

Password reset is sent using Firebase's email action templates. Configure the sender and password-reset action URL in Firebase Authentication email-template settings.

## Configure admin email alerts

The callable function emails an alert after a successful login. It uses Resend; configure a Resend account and verify a sender domain for production.

```bash
npm install --prefix functions
npm install --global firebase-tools
firebase login
firebase use --add
firebase functions:secrets:set RESEND_API_KEY
```

Set `ADMIN_ALERT_EMAIL` to the administrator's inbox and `LOGIN_ALERT_FROM` to a sender address verified by Resend. The defaults are `sshanmukhabas@gmail.com` and Resend's test sender; the test sender has provider restrictions.

Copy `functions/.env.example` to `functions/.env.<your-firebase-project-id>` and set both values there. The project-specific environment file is ignored by Git. Set the Resend API key separately with Secret Manager; do not put it in an `.env` file or browser code.

Deploy the notification function:

```bash
firebase deploy --only functions
```

## GitHub Pages deployment

1. Push this folder's contents to the root of a GitHub repository.
2. In the repository, open **Settings → Pages** and publish from the `main` branch and `/ (root)` folder.
3. Add the published host to Firebase Authentication's authorized domains.
4. Visit the Pages URL and confirm sign-in, password reset, and admin alert delivery.

GitHub Pages hosts only the static site; Firebase hosts authentication and the email-alert function.

## Security and hosting notes

- The portfolio pages are public. A client-side redirect cannot make static GitHub Pages files private.
- The dashboard and profile editor are gated in the UI by `adminEmail`, but their data is currently stored in each browser's `localStorage`; this is not a secure multi-user admin backend and does not sync between devices.
- Firebase Auth protects sign-in and the callable function requires an authenticated Firebase user. Do not put the Resend API key in browser files; it is stored as a Firebase Functions secret.
- The email alert is for successful sign-ins. Failed login attempts are handled by Firebase Authentication and are not emailed by this function.

© 2026 Shanmukha BS
