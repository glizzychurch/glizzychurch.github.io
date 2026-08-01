# The Shed — website

The story, the build, the rites (hot dogs and drinks), this year's Shed-Fest
lineup, a photo archive, and a small arcade of games. Plain HTML/CSS/JS — no
build tools, no accounts required to run it, and it costs nothing to host.

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

## About the Arcade section

All the games live in one section now (tab bar at the top: Glizzy Maze,
Glizzy Chomp, Perfect Pour, Glizzy Gauntlet), instead of being stacked
one after another down the page. Glizzy Maze is the default tab shown
when the section loads. Only the selected game is actually rendered —
the others sit hidden — so adding more games later doesn't make the
page any longer. Each tab is just a button with a matching `data-panel`
value on both the tab and its game panel in `index.html`; adding a 5th
game later means adding one more tab button and one more panel with the
same `data-panel` name, no other wiring needed.

## About the Glizzy Chomp game

It's a 15-second tap game in the Arcade section. Ranks:

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

The second game in the Arcade section. Tap **Pour**, then tap the glass to
stop it — the dashed line marks the target (95% full). Land it well and
the next glass queues up immediately, a little faster than the last one.
Miss badly and the streak's over.

**Scoring:** every pour is scored off the *true* decimal fill percentage
(not rounded to a whole number), so "great" pours land at things like
99.94 or 98.71 instead of piling up on a single number 100 — that's what
was causing the leaderboard to fill up with identical scores before.

**Streak mechanics:**
- A pour continues the streak only if it lands between 90% and 100% full.
  Anything under 90%, or any overflow past 100%, ends the run immediately
  — no forgiveness, no cash-out partway through.
- Each successful pour adds its score to a running session total. *That's*
  what raises the ceiling — one great pour tops out near 100, but a real
  streak can land 500+.
- The fill speed gets faster after every successful round (with a little
  randomness mixed in so it's never exactly predictable), down to a floor
  where it stops getting harder — otherwise a long streak would eventually
  become physically unplayable rather than just difficult.
- Whatever you'd banked when the streak ends is what gets submitted to
  the leaderboard.

**A note on cheating:** the obvious exploit here is a script reading the
live fill number and clicking at the exact right instant for a "perfect"
pour every time. The stop-click only counts if it's a genuine
browser-trusted click (`event.isTrusted`) — a real tap, real mouse click,
or a real automation tool driving actual input all still count, but a
plain scripted `.click()` call (the easy, common way someone would try
this) gets silently ignored. The pour just keeps running past the target
instead, which usually ends the streak in an overflow — so the exploit
doesn't just fail, it actively backfires. Glizzy Chomp's tap handler has
the same check for good measure.

## About the Glizzy Gauntlet game

The third game — a small hand-built platformer, canvas-rendered. Left/right
buttons (or arrow keys / A-D) to move, the jump button (or up arrow / W /
space) to jump. Single jump only, no double-jump. Get from the pool to
The Shed (an actual little shed now — red walls, white trim, black roof,
not a flagpole), jump the gaps, clear the crate, grab every glizzy along
the way.

**Streak mode:** reach The Shed and the level immediately resets for
another lap — you keep going as long as you don't fall or get caught.
There's no collectible quota and no time limit to beat anymore; those
used to gate whether the streak continued at all, which meant a
near-perfect lap that missed one glizzy or ran a beat too slow scored
nothing extra for the attempt. Now every successful lap counts toward
the score, however it went. Each lap's score banks into a running
session total, which is what gets submitted to the leaderboard.

**Scoring, per lap:** a time-based score, higher for a faster
completion (`BASE_TIME_SCORE` minus `TIME_SCORE_RATE` per second
elapsed, floored at `MIN_TIME_SCORE` so a slow-but-successful lap still
earns something real) plus `COLLECTIBLE_BONUS` (15) per glizzy
collected — no requirement to grab all of them, partial credit for
whatever you get. Falling, timing out (the 90-second absolute safety
net), or getting caught ends the run with zero credit for that specific
attempt — only whatever was already banked from prior clean laps.

**A note on cheating:** jump and movement inputs only count if they're
genuine browser-trusted events, same idea as the other games — a script
firing `.click()` or synthetic key events on the controls gets silently
ignored rather than moving the character.

**If you ever want to tweak the level:** it's defined as a plain array of
platform rectangles near the top of the Glizzy Gauntlet section in
`script.js` (`platforms`, `collectiblesTemplate`, `goal`). The physics
constants above that (`GRAVITY`, `JUMP_VELOCITY`, `MOVE_SPEED`) cap the
maximum jump at about 99px horizontal / 100px vertical — keep new gaps
and platform heights under that with some margin, or a jump literally
becomes impossible to make.

**Two bugs fixed:** leaderboard submissions across all four games used
to silently swallow write failures — if Firebase rejected a score (for
example, a streak total over the old validation cap, before it was
raised), the UI still claimed "Added!" even though nothing was actually
saved. All four games now show an honest error and re-enable the submit
button on failure instead. Separately, the lap-transition flash text
("+230! Lap 2...") never actually hid itself after appearing — it stayed
at full opacity indefinitely, showing through on top of whatever came
next. Both this and Perfect Pour's identical round-flash bug are fixed
to fade out on their own before the next state appears.

**Each lap of a streak now uses a different, progressively harder
layout** instead of repeating the same level. Three hand-built variants
in a `LEVELS` array in the Gauntlet section of `script.js`. The original
pool-less level was dropped from the rotation entirely — the pool
crossing is now baked into every lap from the start, per feedback that
it made a better default experience than the plain original:

- **Lap 1** — the pool crossing (the gap at x=980 replaced with three
  inflatables), no chasers yet.
- **Lap 2** — same layout, Buschman now patrols most of ground E and
  will end your run on contact.
- **Lap 3 and beyond** — Buschman plus Stable Hand, each patrolling a
  wide stretch of their own platform. This tier repeats for every lap
  after.

The inflatables themselves were widened from 30px to 45px after
feedback that they were hard to land on — the gaps between them just
shrink accordingly (was 65/55/40px, now 65/40/25px), so the crossing is
strictly easier, not repositioned.

`loadLevel(index)` swaps `platforms`, `collectiblesTemplate`, `goal`,
`LEVEL_WIDTH`, and the chaser zones all at once; it's called on every
lap transition using `streakCount` as the index (clamped to the last
level once you're past lap 3), so the level actually changes underneath
you mid-streak.

**Chaser obstacles now use the actual Maze character art**, not a
simplified stand-in. The first version drew a plain colored ellipse with
stick legs and a small prop icon — close in spirit but visually just
read as "a different-colored version of the player," which wasn't the
goal. `drawHumanoidBase`, the hair-drawing helper, and the per-character
detail blocks (Buschman's cap and beer can, Stable Hand's hard hat and
hammer) are now a direct port of the exact same functions from the Maze
section, just called from Gauntlet's own scope since the two games are
separate IIFEs and can't share functions directly. Same body shape, same
colors, same props as their Maze appearances.

**Chasers patrol a wide stretch of their platform now, not a narrow
band.** The very first version confined each chaser to a zone under
~60px, specifically so a single jump could clear the entire zone in one
continuous hop without ever landing mid-zone. That constraint doesn't
apply anymore: since reaching the goal always continues the streak
regardless of speed, there's no need to clear an entire zone in one
jump — the player can simply walk normally and jump over the chaser
specifically at the moment of passing him, wherever he happens to be.
Buschman now patrols x:1220-1590 (370px, nearly all of ground E,
including underneath both staircase platforms) and Stable Hand patrols
x:1690-2030 (340px), both spanning most of their ground segment.
Touching one while grounded still ends the run exactly like falling into
a pit; **jumping over one is still always safe regardless of timing**,
since the collision check is skipped entirely while airborne. Chasers
still don't start moving until the player is within about 220px of
`startX`, so they don't drift to a corner and sit there for the entire
earlier part of the level before the player ever arrives.

**Landing on a chaser's head stuns him instead of just passing over
safely.** A stomp requires falling (`player.vy > 0`, so jumping up into
him from below doesn't count) with the player's feet landing in a band
roughly across his head and shoulders (`ch.y - 24` to `ch.y - 4`) rather
than his whole body — walking into him at ground level is still a
regular catch, not a stomp, even though both involve contact. A
successful stomp freezes him in place (`stunnedUntil`, 2 seconds) and
gives the player a small bounce (`STOMP_BOUNCE`, about 60% of a normal
jump) rather than continuing to fall straight through him. While
stunned he stops moving entirely and can't catch the player even at
point-blank range, with three small spinning stars over his head as the
tell. Verified the full lifecycle directly: stomping him and then
standing right next to him at ground level for the whole 2-second
window left him motionless and harmless the entire time; waiting past
that window with the player still standing there resulted in a normal
catch, confirming he goes back to being dangerous once it wears off.

**Chaser zones can safely overlap elevated platforms now — this took
two attempts to get right.** Buschman's zone originally overlapped the
staircase platforms built for reaching a nearby collectible. A chaser
only tracks x — it has no concept of "the player is safely elevated
above me" beyond a grounded/airborne check — so standing on that
staircase (left of his zone's own left edge at the time) pulled him
toward the player and pinned him against his `startX` boundary, unable
to follow any further; from the player's view, he just stopped and sat
there. First fix: moved his zone to start past where the staircase ends,
avoiding the overlap entirely. That worked, but it meant he couldn't
approach a player standing anywhere near the pool exit or the staircase,
which read as a *different* flavor of "stuck" even though it was
technically working as designed — a chaser waiting at his own boundary
because the player hadn't entered his territory. The actual fix: the
chaser collision check requires the player be near actual ground level
(`player.y >= GROUND_Y - PLAYER_H - 15`) before it can trigger at all,
which was *already true* by the time the zone got relocated — meaning
the elevation check alone was sufficient, and the zone never needed to
avoid the staircase in the first place. His zone now extends back to
x:1220 (right where ground E begins) through x:1590, walking freely
underneath both staircase platforms — standing on either one stays
correctly safe the whole time, confirmed by tracking his position live
while parked on the platform for several seconds. If you're chasing a
similar bug, check whether an elevation or other safety check already
covers the case before reaching for a zone-relocation fix — the
relocation can end up solving the wrong half of the problem.

The pool itself is just a blue rectangle drawn behind the platforms
(`pool: { x0, x1 }` on a level, drawn in `render()`) — falling into it
ends the run the same as any other pit, nothing pool-specific about the
fail state. Inflatable platforms are regular platform objects with
`type: "inflatable"` and a `color`, rendered as a filled oval instead of
the usual brown/green block.

**Jump input is now buffered, and has coyote time** — two standard
platformer techniques, added after feedback that jumps sometimes felt
laggy and caused avoidable falls. Previously, a jump pressed even one
frame before actually landing was silently dropped (the game only
checked "is a jump requested AND are you on the ground *this exact
frame*", then cleared the request regardless of the outcome) — pressing
early, which happens constantly in real play, just didn't do anything.
Now: `JUMP_BUFFER_MS` (120ms) keeps a jump request alive for a short
window so it fires the instant you land if you pressed slightly early,
and `COYOTE_MS` (90ms) does the same in reverse — a jump pressed just
after walking off an edge still fires, as if you'd jumped a beat before
leaving the ground. Both are standard, expected behavior in essentially
every platformer; their absence was the bug, not a deliberate difficulty
choice.

**Fixed a false "Caught" bug:** the chaser collision check only tested
whether the player was grounded and horizontally close — it didn't check
*how high up*. The staircase platforms near Buschman's zone (built for
reaching a collectible) sit directly above his patrol path, so landing
on them to grab that collectible was getting flagged as a catch even
though the player was clearly elevated and safe. Fixed by also requiring
the player's y-position to be near actual ground level, not just
"standing on solid ground" — an elevated platform above a chaser is now
correctly always safe. Verified both directions: standing on the
staircase above Buschman no longer ends the run, and standing at his
actual ground level still does.

**Mobile-specific sizing:** the game canvas for all four Arcade games
was rendering noticeably smaller than it needed to on narrow phones —
measured it directly and found `.game-panel`'s side padding alone was
eating 56px of a 390px-wide screen. Tightened that padding specifically
under 480px width (`--space-1` instead of `--space-3`), which grows the
canvas by about 16% on a typical phone without touching desktop at all.
The Gauntlet jump button also gets noticeably bigger (74px → 92px) under
the same breakpoint.

**Fixed garbled/overlapping text on the lap-transition flash, mobile
specifically:** same root cause as an earlier bug in the start-screen
overlay — `.pour-round-flash` (used by both Gauntlet's lap flash and
Perfect Pour's round flash) is nested inside a `line-height: 0`
container (a trick to remove the canvas's default inline-element gap),
and never had its own line-height set to override that inheritance. On
wider desktop screens the flash text fit on one line so the bug was
invisible; on narrow mobile widths the text wraps to two lines, and with
inherited `line-height: 0` those two lines collapse on top of each
other into unreadable overlapping text. Fixed by giving the shared class
its own explicit `line-height`, the same fix pattern as before, just
on an element outside the overlay this time — worth keeping in mind if
any other text ends up added inside these canvas-wrap containers later.

## About the Glizzy Maze game

The fourth game — a small Pac-Man-style chase, canvas-rendered, grid-based
movement. Swipe, the on-screen swipe zone, or arrow keys / WASD. Clear
every glizzy in the yard while four chasers try to catch you. Grab a
"Cold One" — an actual little pixel-art beer mug now, gold-to-amber
beer, foam head, blue glass tint — in each corner to turn the tables for
a few seconds. Chasers turn vulnerable and you can eat them for an
escalating bonus (200, 400, 800, 1600 for a perfect run of four in one
window). Watermelon,
popsicle, and horse bonus items occasionally appear near the pool for
extra points.

The maze is laid out like the actual backyard — pool and shed together
(with a grey concrete patio ring around the pool), a wooden deck
connecting to the house, the garage and driveway off to the side, a few
trees scattered around. There's a tunnel on the left and right edges at
the top of the yard (classic Pac-Man wraparound) — walk off one side and
you come out the other.

There's a ~2 second safe-start at the beginning of every run — the crew
just wanders harmlessly for a moment before they start actually hunting,
same idea as the "ghosts leave the house gradually" pacing in the
original game. Without it, a chaser spawning close to you could end the
run before you'd even gotten your bearings.

Both this game and Glizzy Gauntlet have a **Pause** button next to the
score while playing. Pausing shows a small "Paused" badge, not a full
screen-darkening overlay — the map and everyone's positions stay fully
visible underneath, on purpose, so you can actually look around while
stopped. It's also not just a visual freeze: every timed thing in the
game (fright mode, a chaser's next "sober" burst, the grace-period
clock, bonus items about to expire) gets shifted forward by however long
the pause lasted, so stepping away for a minute doesn't secretly cost
you a power-up or drop a chaser back into a state it shouldn't be in yet.

On mobile, movement is swipe-only now — swipe left/right/up/down
anywhere on the game screen or in the swipe zone below it (the on-screen
d-pad is gone; it didn't work well on touch or trackpads, and one clear
gesture area is more reliable than four small buttons). On desktop,
keyboard controls are unchanged: arrow keys or WASD.

**Page-scroll lock applies to all four games now, not just this one** —
while any round is in progress (or paused, where a game has pause), the
whole page is locked so a swipe can't drag the site around, and in
Glizzy Chomp's case, can't shift the tap target out from under a
finger mid-tap. One bug worth noting for the curious: the lock was
originally only applied to `<body>`, which silently did nothing —
`<html>`, not `<body>`, is the actual scrolling element in a
standards-mode page, so the fix locks both.

**The four chasers** are humanoid now (not ghost blobs), each with a
prop that makes them recognizable at a glance, plus real distinct
behavior rather than reskinned copies of each other:
- **Buschman** — cap, and a beer can in hand, Busch blue color scheme.
  Mostly drifts harmlessly, but periodically "sobers up" for a few
  seconds and beelines an accurate, faster intercept — watch for the
  eyes snapping open, that's your warning.
- **Spore Loser** — the classic red-and-white toadstool cap, plus a
  short psychedelic color-cycling trail behind him as he moves. Hunts
  you directly and gets faster the closer he gets. Juke him enough
  times in a row (get close, then escape, repeated) and he rage-quits —
  vanishes for a few seconds before respawning.
- **Stable Hand** — dark hair, hard hat, and a hammer in hand. The
  weakest chaser, slower and partly random — until the horse shows up
  (see below), at which point he gets heart eyes, a burst of speed, and
  makes a beeline for it, ignoring everything else.
- **The Glitch** — brown hair, glasses, a faint flicker in his own
  outline, and a soft smoke-wisp trail. Moves close to randomly, no real
  pattern to learn, and has one shortcut tile pair through the pool that
  only he can use.

**The horse** walks a straight line across the yard, tunnel entrance to
tunnel entrance — not a wandering NPC, not a collectible. The first one
shows up quickly (3-6 seconds into a run, so nobody misses it), then
every 14-24 seconds after that (randomized) another one walks through.
It's purely a distraction: there's no bonus for reaching it yourself,
its entire job is pulling Stable Hand off whatever he was doing. The
moment it appears, he gets big heart eyes, a speed boost, and makes a
dead-straight beeline for it until it's gone.

The player character is the same hot-dog mascot from Glizzy Gauntlet
(same body, drawn the same way), topped with a tall pope hat — a nod to
"Pope Glizzicus" from the Glizzy Chomp leaderboard.

**Scoring:** 10 pts per glizzy, 50 per power pellet, the escalating
chaser-eat bonus above, 100–150 per bonus item, and 1000 for clearing
every cap in the yard. Getting caught (while not powered up) or clearing
the board both end the run and submit whatever you'd built.

**A note on cheating:** movement inputs only count if they're genuine
browser-trusted events, same pattern as the other three games — a script
firing synthetic key or click events on the controls gets silently
ignored.

**If you ever want to tweak the maze:** it's a plain 2D array generated
near the top of the Glizzy Maze section in `script.js`, built from named
zones (`fillBlock` calls for the pool, shed, garage, house, deck,
driveway, and trees) rather than a hand-typed grid — easier to move a
whole feature at once than to hand-edit individual tiles. If you resize
or reshape anything, run a quick connectivity check before trusting it —
a maze with an unreachable pocket will strand pellets no one can ever
collect. `GLITCH_TILES` marks the one shortcut only that character can
use, currently a cut straight through the pool.

## Setting up the shared leaderboard (top 5, optional)

Without this, all four games still work fine — each just skips its
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

**Starting a new season:** all four boards (Glizzy Chomp, Perfect Pour,
Glizzy Gauntlet, Glizzy Maze) share one "season" marker. Nothing is ever
deleted — this just changes the cutoff for what counts toward the current
top 5, so old scores stay in the database but drop off the visible board.
To start a fresh season, open your live site, open the browser console
(F12, or right-click → Inspect → Console), and run:
```js
firebase.database().ref('season/startedAt').set(Date.now())
```
All four leaderboards update instantly for everyone. To go back to an
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
           ".validate": "newData.hasChildren(['name','score','ts']) && newData.child('name').isString() && newData.child('name').val().length <= 30 && newData.child('score').isNumber() && newData.child('score').val() >= 0 && newData.child('score').val() <= 3000"
         }
       },
       "platformerScores": {
         ".read": true,
         ".write": true,
         ".indexOn": "score",
         "$entry": {
           ".validate": "newData.hasChildren(['name','score','ts']) && newData.child('name').isString() && newData.child('name').val().length <= 30 && newData.child('score').isNumber() && newData.child('score').val() >= 0 && newData.child('score').val() <= 100000"
         }
       },
       "mazeScores": {
         ".read": true,
         ".write": true,
         ".indexOn": "score",
         "$entry": {
           ".validate": "newData.hasChildren(['name','score','ts']) && newData.child('name').isString() && newData.child('name').val().length <= 30 && newData.child('score').isNumber() && newData.child('score').val() >= 0 && newData.child('score').val() <= 15000"
         }
       },
       "season": {
         ".read": true,
         ".write": true
       }
     }
   }
   ```
   This keeps all four boards open to anyone (no login needed to play or
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
