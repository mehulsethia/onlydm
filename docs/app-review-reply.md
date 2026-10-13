# Reply to App Review: Guideline 2.1, Information Needed (submission e3769fd4, build 1.0.0 (14))

Paste the block below into **Reply to App Review**, and the same text into **App Review Information → Notes**
(Apple asks for both). Fill the three `[...]` items first.

```
Hello App Review,

Thank you. Here is the information requested for OnlyDM: Quit the Feed.

1. SCREEN RECORDING
Attached: [filename.mov], recorded on a physical iPhone [model] running iOS [version] from a TestFlight build.
It starts from launching the app and shows: onboarding, signing in on instagram.com, the inbox, sending a message,
opening a story, trying to reach the feed (blocked, returns to Messages), the subscription screen (each plan's title,
length and price, plus the Terms of Use and Privacy Policy links), Restore Purchases, and Settings (Disconnect and
Sign out of everything).
OnlyDM has no account creation of its own, so there is no registration or account deletion flow. Users sign in with
their existing Instagram account on Instagram's own page, and can remove it at any time with Settings → Disconnect
or Sign out of everything. The app has no user-generated content of its own (see 4).

2. PURPOSE AND AUDIENCE
OnlyDM is for people who want to reply to friends on Instagram without being pulled into the feed. It opens
Instagram's official website straight to Direct Messages and hides the feed, Reels and Explore sections on the
device. It also shows the user's friends' stories and, optionally, Threads and Facebook messages. The target
audience is adults and teens who already use Instagram and want to spend less time scrolling.

3. HOW TO USE IT (TEST ACCOUNT)
Instagram test account (no two-factor):
  User name: [test account user name]
  Password:  [test account password]
Steps: launch the app, tap through the short onboarding, tap "Sign in on instagram.com" and sign in with the account
above. You land in the inbox. Open a chat and send a message, open a story. Settings is the gear icon at the top right.
Sign-in happens on Instagram's own page. OnlyDM never reads or stores the password.

4. EXTERNAL SERVICES
- Instagram (instagram.com), Threads (threads.com) and Facebook/Messenger (facebook.com), shown inside the app's web
  view. All messaging and content come from these sites. OnlyDM has no servers that hold user data.
- Apple In-App Purchase, with RevenueCat (revenuecat.com) validating receipts and entitlements.
- No analytics, no ads, no other third-party services.
Content moderation, reporting and blocking are provided by Instagram's own interface inside the web view. OnlyDM adds
no user-generated content features of its own.

5. REGIONAL DIFFERENCES
The app works the same in every region. Only subscription prices differ, because they come from the App Store
storefront in the user's local currency.

6. REGULATED INDUSTRY / PROTECTED MATERIAL
OnlyDM is not in a regulated industry. It is independent and not affiliated with Meta. It uses no private APIs and
does not modify Instagram's servers. It shows the public website, with sections hidden on the device, to the signed-in
user's own account.

7. IN-APP PURCHASES (OnlyDM Pro), shown after onboarding and from Settings → Plans and pricing
- Annual (auto-renewable subscription): $19.99 per year, with a 7-day free trial for new subscribers.
- Monthly (auto-renewable subscription): $3.99 per month.
- Lifetime (non-consumable): $49.99, one time.
All are in the "OnlyDM Pro" group and unlock the inbox. The subscription screen shows each plan's title, length and
price, with links to the Terms of Use and Privacy Policy, plus Restore Purchases. Manage or cancel any time in Apple ID
settings.

Contact: sethiamehul14@gmail.com
```

## Before you reply

1. **Record on a real iPhone** (not the simulator), on a build that launches. Build 14 is the one under review. Builds 19 and
   later crash at launch (see the investigation), so do not record from those. Cover every item listed in section 1 of
   the reply, in that order.
2. **Test Instagram account:** a fresh dedicated one with 2-3 chats and two-factor off. Do not use your own.
3. **Attach the recording** in the reply (Apple accepts a file upload).
4. **Check the live site:** https://www.getonlydm.com/terms/ must show the current prices ($19.99 yearly, ₹999) and
   the Lifetime line. Deploy `site/` first if it does not.
5. After replying, press **Resubmit to App Review**. If Apple says a new build is needed, submit one that launches.
