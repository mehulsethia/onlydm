# App Store listing, v1.0 (copy-paste)

Character limits are Apple's. Counts checked.

## App Information (not on the version page, but set it)

- **Name** (30): `OnlyDM: Quit the Feed`
- **Subtitle** (30): `Instagram DMs. No feed.`
- **Category:** Productivity (secondary: Social Networking)
- **Age rating:** answer the questionnaire honestly. The app shows Instagram's own content, so expect 12+ or 17+ ("unrestricted web access" is Yes).

## Product Page Information (English U.S.)

**Promotional Text** (170, editable any time without a new review)

```
Instagram, minus the scroll. Open straight to your DMs, group chats and friends’ stories. No feed, no Reels, no Explore. Delete the app, keep your people.
```

**Description** (4,000)

```
Only DMs, zero distractions.

You don't open Instagram to scroll. You open it to reply to a friend, and 40 minutes later you're still there. OnlyDM opens Instagram straight to your messages and hides everything else.

WHAT YOU GET
• Opens on your DMs. Group chats, requests, voice notes and photos work as normal.
• No feed. No Reels. No Explore. They're hidden, so there's nothing to fall into.
• Your friends' stories, without the feed around them.
• A post or reel a friend sends you opens on its own. Close it and you're back in your messages, not the feed.

WORKS WITH THE INSTAGRAM YOU ALREADY HAVE
Sign in on Instagram's own page, inside OnlyDM. Then delete the Instagram app, and keep every conversation, group chat and event invite.

PRIVATE BY DESIGN
• OnlyDM never sees or stores your password or your messages.
• No analytics. No ads. No account with us.
• Everything stays on your phone. Sign out any time in Settings.

SEE WHAT SCROLLING COSTS YOU
Answer two quick questions and OnlyDM shows how much of your year goes to scrolling instead of talking to people.

OPTIONAL EXTRAS
Prefer Threads or Facebook messages too? Add them later from Settings.

OnlyDM Pro
Try it free for 7 days on the yearly plan. After that it's billed to your Apple ID, in your local currency. Monthly and yearly plans are available. Subscriptions renew automatically unless cancelled at least 24 hours before the end of the current period. Manage or cancel any time in your Apple ID settings. We remind you 2 days before a trial ends.

Terms of Use: https://www.getonlydm.com/terms/
Privacy Policy: https://www.getonlydm.com/privacy/

OnlyDM is an independent app and is not affiliated with, endorsed by, or sponsored by Instagram, Threads, Facebook or Meta Platforms, Inc. Instagram, Threads and Facebook are trademarks of Meta Platforms, Inc.
```

**Keywords** (100, comma separated, no spaces after commas)

```
dm,messages,screen time,focus,reels,block,distraction,detox,doomscroll,scroll,social,limit,chat,feed
```

(Apple dislikes other companies' trademarks in keywords, so "instagram" is left out. It's already in your name's subtitle and description, which are indexed too.)

**Support URL:** `https://www.getonlydm.com/`  (add a `/support` page later if you want; the FAQ and contact email are on the page)

**Marketing URL:** `https://www.getonlydm.com/`

**Version:** `1.0`

**Copyright:** `2026 OnlyDM`

**Routing App Coverage File:** leave empty.  **App Clip / iMessage App:** leave empty.  **Game Center:** leave unticked.

## Build

Upload with `eas build -p ios --profile production` then `eas submit -p ios --latest`. Wait for processing, then pick it under Build.

## App Review Information

**Sign-in required:** tick it.
- **User name / Password:** credentials for a **dedicated test Instagram account** (not your personal one). Make a fresh account, add 2 or 3 chats so the inbox isn't empty, and turn off two-factor on it, or the reviewer gets stuck at the code step.

**Contact information:** Mehul / Sethia, your phone number (with country code, e.g. +91...), `sethiamehul14@gmail.com`.

**Notes**

```
OnlyDM is a focused Instagram messaging app. It shows Instagram's official website inside the app, with the feed, Reels and Explore sections hidden, so people can reply to friends without being pulled into scrolling.

HOW TO REVIEW
1. Launch the app and tap through the short onboarding (a few questions about time spent on messaging apps).
2. When asked, tap "Sign in on instagram.com" and sign in with the test account provided. Sign-in happens on Instagram's own page. OnlyDM never reads or stores the password.
3. After sign-in you land in the inbox (Direct messages). Open a chat, send a message, open a story from the story row.
4. Try to reach the feed, Reels or Explore: they are blocked and you are returned to Messages. A reel or post shared in a chat opens on its own and closes back to Messages.
5. Subscriptions (OnlyDM Pro, monthly and yearly with a 7-day free trial on yearly) are shown after onboarding. Restore Purchases is on the paywall and in Settings.
6. Settings (gear icon, top right) has Disconnect, Sign out of everything, Privacy Policy, Terms of Use and Contact.

PRIVACY
OnlyDM has no accounts, no servers that hold user data and no analytics. Sessions stay on the device in the web view.

NOT AFFILIATED
OnlyDM is independent and not affiliated with Meta. It does not modify Instagram's servers or use private APIs. It only shows the public website and hides sections of the page on the device.

Contact: sethiamehul14@gmail.com
```

**Attachment:** optional; a 30-second screen recording of steps 1 to 4 helps.

## App Store Version Release

Choose **Manually release this version**. That lets you time the launch with the site, the Search Console submission and your first posts. (Approval can land at any hour.)

## Also needed before you can submit

- **Screenshots:** 6.9-inch iPhone set, 1320 × 2868 (see `docs/screenshots/`). 3 to 10 images.
- **App Privacy:** "Data Not Collected" is accurate if you ship without analytics. Purchases are handled by Apple and RevenueCat; RevenueCat does collect an anonymous app user ID and purchase data, so declare **Purchases** and **Identifiers (User ID)**, not linked to identity, used for app functionality.
- **Privacy Policy URL** (App Privacy page): `https://www.getonlydm.com/privacy/`
- **Export compliance:** the app already sets `ITSAppUsesNonExemptEncryption: false`.
- **Content rights:** the question is "Does your app contain, show, or access third-party content?" Answer **Yes**, because the app shows Instagram's content, then confirm you have the rights necessary: it is the user's own Instagram session on Instagram's own website, and you don't copy or redistribute it.
