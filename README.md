# The Shed — website

The story, the build, the rites (hot dogs and drinks), this year's Shed-Fest
lineup, a photo archive, and a little tap game. Plain HTML/CSS/JS — no build
tools, no accounts required to run it, and it costs nothing to host.

## See it before you publish it

Double-click `index.html` to open it in a browser. Everything works locally
except the Google Fonts, which need internet access — that's normal and
will look right once it's actually online.

## 1. Personalize it

**`script.js`** (top of the file, marked `EDIT ME`)
- `MAPS_LINK` — already set to your Brookville Lake link. Swap it if the
  pin ever moves.
- `albums` — one entry per summer, with a title, blurb, and a Google Photos
  `link` (see step 2). Add a new `{ ... }` block each year.

**`index.html`**
- The story section — search for "THE RAISING" to edit the origin copy.
- The hero image — currently `images/hero-stainedglass.jpg`. Swap the file
  (same filename, or update the `src`) if a new version ever gets made.
- The "Address" line in Visiting Hours currently just says "Brookville
  Lake, Indiana" — the Get Directions button already points to the right
  place, but if you want the literal street address displayed as text too,
  find `id="addressLine"` and type it in.
- Shed-Fest section — swap in next year's poster and update the "This
  year's stage" note.

**`images/`**
- Drop new photos in here and reference them by filename. There's one
  extra build photo already included but not used on the page —
  `build-cutting.jpg` — in case you want to swap it into the montage later.

## 2. Set up a photo album people can add to themselves

1. In Google Photos, create a new album for the year.
2. Add whatever photos you've already got.
3. Tap **Share** → **Create link**, then turn on **Collaborate**. That's
   what lets any friend with the link add their own pictures, free, with
   no account needed on your end.
4. Copy that link into the matching album's `link` field in `script.js`.

## 3. Put it online for free (GitHub Pages)

1. Create a free account at [github.com](https://github.com).
2. Click **+** → **New repository**. Name it anything (e.g. `the-shed`),
   leave it Public, click **Create repository**.
3. **Add file** → **Upload files**, drag in everything from this folder
   (`index.html`, `styles.css`, `script.js`, and the `images` folder),
   then **Commit changes**.
4. **Settings** → **Pages** → Source: **Deploy from a branch**, branch
   **main**, folder **/ (root)** → **Save**.
5. Refresh after about a minute — your live URL will be shown, something
   like `https://your-username.github.io/the-shed/`.

Free forever, no domain purchase, updates automatically whenever you
change a file in the repo.

## About the Glizzy Chomp game

It's a 15-second tap game in the Rites section. Ranks:

| Score | Rank |
|---|---|
| 0–14 | Rookie Griller |
| 15–40 | Backyard Regular |
| 41–74 | Shed Deacon |
| 75–99 | Glizzy Bishop |
| 100+ | Certified Glizzy Saint |

**A note on cheating:** the game only counts taps spaced at least 100ms
apart (no human sustains faster than that), which caps the realistic max
score around 140–150 even for someone auto-clicking as fast as possible.
Taps also have to be genuine browser-trusted clicks — a plain scripted
`.click()` call is silently ignored rather than counted. The database
rules also reject any submitted score over 160, so a direct database
write (bypassing the game entirely) can't get around it either. If
someone finds a new way around this, tightening any of these further is
a small change.

Each visitor's personal best always saves to their own browser regardless
of anything below.

## About the Perfect Pour game

The second game in the Rites section, next to Glizzy Chomp. Tap **Pour**,
then tap the glass to stop it — the dashed line marks the target (95%
full). The fill speed is randomized each round (2.2–3.4 seconds) so it
can't be beaten by pure muscle memory. Scoring:

- Land right on the line → up to 100 points
- Under-pour → points drop off the further you are from the line
- Overflow (over 100%) → a much harsher penalty, capped at 40 points max

**A note on cheating:** the obvious exploit here is a script reading the
live fill number and clicking at the exact right instant for a "perfect"
100 every time. The stop-click now only counts if it's a genuine
browser-trusted click (`event.isTrusted`) — a real tap, real mouse click,
or a real automation tool driving actual input all still count, but a
plain scripted `.click()` call (the easy, common way someone would try
this) gets silently ignored. The pour just keeps running past the target
instead, which usually ends in an overflow — so the exploit doesn't just
fail, it actively backfires. Glizzy Chomp's tap handler has the same
check for good measure.

## About the Glizzy Gauntlet game

The third game — a small hand-built platformer, canvas-rendered. Left/right
buttons (or arrow keys / A-D) to move, the jump button (or up arrow / W /
space) to jump. Single jump only, no double-jump. Get from the pool to
The Shed, jump the gaps, clear the crate, grab glizzies along the way if
you want the extra points.

**Scoring:** distance reached (up to 100 pts) + 15 pts per glizzy
collected (5 on the level) + 150 pts for actually reaching The Shed + up
to 100 pts more the faster you finish. Falling or running out the
90-second clock ends the run with whatever you'd banked so far — so
partial attempts still score something, but only finishing gets the big
bonuses.

**A note on cheating:** jump and movement inputs only count if they're
genuine browser-trusted events, same idea as the other two games — a
script firing `.click()` or synthetic key events on the controls gets
silently ignored rather than moving the character.

**If you ever want to tweak the level:** it's defined as a plain array of
platform rectangles near the top of the Glizzy Gauntlet section in
`script.js` (`platforms`, `collectiblesTemplate`, `goal`). The physics
constants above that (`GRAVITY`, `JUMP_VELOCITY`, `MOVE_SPEED`) cap the
maximum jump at about 99px horizontal / 100px vertical — keep new gaps
and platform heights under that with some margin, or a jump literally
becomes impossible to make.

## Setting up the shared leaderboard (top 5, optional)

Without this, all three games still work fine — each just skips its
shared board. With it, everyone's scores show up on the same top-5 list
per game, and anyone who makes a top 5 gets a name field to claim their
spot. All three boards run on Firebase's free tier (Realtime Database),
which comfortably handles leaderboards this size forever at no cost.

Every submitted score is kept permanently — only the *displayed* board
trims to the top 5. Earlier versions deleted anything that fell out of
the top 5, which meant a legitimate score could vanish forever the moment
someone (fairly or not) knocked it off the board. That's fixed now — if
you ever need to clean up bad entries, do it manually from the Data tab
rather than relying on anything automatic.

**Tiebreaks:** if two scores are equal, the more recent one ranks higher.
So a fresh 100 always outranks an old 100 — the board keeps some
movement instead of freezing on whoever got there first.

**Starting a new season:** all three boards (Glizzy Chomp, Perfect Pour,
Glizzy Gauntlet) share one "season" marker. Nothing is ever deleted — this
just changes the cutoff for what counts toward the current top 5, so old
scores stay in the database but drop off the visible board. To start a
fresh season, open your live site, open the browser console (F12, or
right-click → Inspect → Console), and run:
```js
firebase.database().ref('season/startedAt').set(Date.now())
```
All three leaderboards update instantly for everyone. To go back to an
all-time board with no cutoff, run the same command with `null` instead
of `Date.now()`.

**Setup (about 5 minutes):**

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
   and sign in with any Google account.
2. **Add project** → name it anything (e.g. `the-shed`) → you can skip
   Google Analytics (not needed) → **Create project**.
3. In the left sidebar: **Build → Realtime Database → Create Database**.
   Pick any region → start in **locked mode**.
4. Click the **Rules** tab and replace the contents with this, then
   **Publish** (this covers both Glizzy Chomp's leaderboard and Perfect
   Pour's — if you already published the single-game version of this
   earlier, just overwrite it with the version below):
   ```json
   {
     "rules": {
       "scores": {
         ".read": true,
         ".write": true,
         ".indexOn": "score",
         "$entry": {
           ".validate": "newData.hasChildren(['name','score','ts']) && newData.child('name').isString() && newData.child('name').val().length <= 30 && newData.child('score').isNumber() && newData.child('score').val() >= 0 && newData.child('score').val() <= 160"
         }
       },
       "pourScores": {
         ".read": true,
         ".write": true,
         ".indexOn": "score",
         "$entry": {
           ".validate": "newData.hasChildren(['name','score','ts']) && newData.child('name').isString() && newData.child('name').val().length <= 30 && newData.child('score').isNumber() && newData.child('score').val() >= 0 && newData.child('score').val() <= 100"
         }
       },
       "platformerScores": {
         ".read": true,
         ".write": true,
         ".indexOn": "score",
         "$entry": {
           ".validate": "newData.hasChildren(['name','score','ts']) && newData.child('name').isString() && newData.child('name').val().length <= 30 && newData.child('score').isNumber() && newData.child('score').val() >= 0 && newData.child('score').val() <= 500"
         }
       },
       "season": {
         ".read": true,
         ".write": true
       }
     }
   }
   ```
   This keeps all three boards open to anyone (no login needed to play or
   submit a score — appropriate for a small friend-group toy leaderboard)
   while rejecting junk data that doesn't look like a real score.
5. Click the gear icon (top left) → **Project settings** → scroll to
   **Your apps** → click the **</>** (web) icon → register an app (any
   nickname) → you'll get a config object that looks like:
   ```js
   const firebaseConfig = {
     apiKey: "...",
     authDomain: "...",
     databaseURL: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   };
   ```
6. Copy those seven values into `FIREBASE_CONFIG` near the top of
   `script.js` (marked `EDIT ME #3`), then re-upload `script.js` and
   `index.html` to your GitHub repo.

That's it — the leaderboard turns on automatically once `apiKey` is
filled in. If you'd rather have a drinking-game version of the game
instead of (or alongside) Glizzy Chomp, that's a quick add — just ask.
