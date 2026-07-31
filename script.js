/* ==========================================================================
   THE SHED — site script
   The only parts you should need to touch are marked EDIT ME below.
   ========================================================================== */

/* ---------------------------------------------------------------------
   EDIT ME #1 — Directions link for the "Get Directions" button.
--------------------------------------------------------------------- */
const MAPS_LINK = "https://maps.app.goo.gl/PEKCw93ED7wu2xB89?g_st=i&utm_campaign=ac-im";

/* ---------------------------------------------------------------------
   EDIT ME #2 — Yearly photo albums.
   Add one object per summer. Steps for `link`:
     1. Create an album in Google Photos and add your photos.
     2. Tap Share → turn on "Collaborate" (lets anyone with the link add
        their own photos too — free, no account needed on their end).
     3. Copy the link and paste it below as `link`.
   `cover` is optional — a JPG/PNG you've added to the images/ folder.
   Leave it as "" to show a placeholder until you have one.
--------------------------------------------------------------------- */
const albums = [
  {
    year: "2025",
    title: "The First Gathering",
    blurb: "Where it all began — The Shed goes up, the tradition gets named.",
    link: "https://photos.app.goo.gl/w9jjUbbM1C1P3XRk9",
    cover: "images/shed-photo.jpg"
  },
  {
    year: "2026",
    title: "Shed-Fest 2026",
    blurb: "The lineup is fiction. Brookville Lake is very real. So are the sunburns.",
    link: "https://photos.app.goo.gl/qA5pecH43MmT725U7",
    cover: "images/shedfest-poster.jpg"
  }
];

/* ---------------------------------------------------------------------
   EDIT ME #3 — Shared Glizzy Chomp leaderboard (optional).
   This is what lets everyone's high scores show up on the same board,
   not just saved to their own phone. It runs on Firebase's free tier
   (Realtime Database) — see README.md for the ~5 minute setup.
   Leave every value as "" and the game still works fine — it just skips
   the shared leaderboard and keeps each person's own best score locally.
--------------------------------------------------------------------- */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyACISIYcTV0rdww-Qhr_SR1PxR3otr2HyE",
  authDomain: "glizzy-chomp.firebaseapp.com",
  databaseURL: "https://glizzy-chomp-default-rtdb.firebaseio.com",
  projectId: "glizzy-chomp",
  storageBucket: "glizzy-chomp.firebasestorage.app",
  messagingSenderId: "754041160264",
  appId: "1:754041160264:web:1671ba01f2e94905998e7d"
};

/* ---------------------------------------------------------------------
   Below this line: rendering + interaction logic. No need to edit.
--------------------------------------------------------------------- */

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Directions button
(function setupMapsLink() {
  const btn = document.getElementById("mapsBtn");
  if (MAPS_LINK) {
    btn.href = MAPS_LINK;
  } else {
    btn.remove();
  }
})();

// Mobile nav toggle
(function setupNav() {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("mainNav");
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
})();

// Shared page-scroll lock, used by all four arcade games while a round is
// actively in progress (and, where a game has pause, while paused too) so a
// stray swipe/scroll gesture can't move the page — or, in Glizzy Chomp's
// case, move the tap target out from under a finger mid-tap.
function setPageScrollLocked(locked) {
  // The actual scrolling element in a standards-mode document is <html>,
  // not <body> — locking overflow on body alone silently does nothing.
  document.documentElement.classList.toggle("game-scroll-lock", locked);
  document.body.classList.toggle("game-scroll-lock", locked);
}
// The CSS class alone (overflow:hidden) doesn't reliably stop touch-drag
// scrolling on its own — this is the backup that actually blocks it, and it
// checks the shared class rather than any one game's state, so it covers
// all four without each needing its own copy.
document.addEventListener(
  "touchmove",
  function (e) {
    if (document.documentElement.classList.contains("game-scroll-lock")) e.preventDefault();
  },
  { passive: false }
);

// Arcade tabs
(function setupArcadeTabs() {
  const tabs = document.querySelectorAll(".arcade-tab");
  const panels = document.querySelectorAll(".arcade-frame .game-panel[data-panel]");
  if (!tabs.length) return;

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      const target = tab.getAttribute("data-panel");
      tabs.forEach(function (t) {
        const isActive = t === tab;
        t.classList.toggle("active", isActive);
        t.setAttribute("aria-selected", String(isActive));
      });
      panels.forEach(function (panel) {
        panel.hidden = panel.getAttribute("data-panel") !== target;
      });
    });
  });
})();

// Gallery cards
(function renderAlbums() {
  const grid = document.getElementById("albumGrid");
  const placeholderIcon =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10.5" r="1.5"/><path d="M21 15l-5-5-9 9"/></svg>';

  albums.forEach((album) => {
    const card = document.createElement("article");
    card.className = "album-card";

    const coverHTML = album.cover
      ? '<img src="' + album.cover + '" alt="Photos from ' + album.title + '" loading="lazy">'
      : '<div class="cover-placeholder">' + placeholderIcon + "<span>Photos coming soon</span></div>";

    const actions = [];
    if (album.link) {
      actions.push('<a class="btn btn-small btn-primary" href="' + album.link + '" target="_blank" rel="noopener">View Album</a>');
      actions.push('<a class="btn btn-small" href="' + album.link + '" target="_blank" rel="noopener">Add Your Photos</a>');
    } else {
      actions.push('<span class="eyebrow">Album link coming soon</span>');
    }

    card.innerHTML =
      '<div class="album-cover">' + coverHTML + '<span class="album-year">' + album.year + "</span></div>" +
      '<div class="album-body"><h3>' + album.title + "</h3><p>" + album.blurb + '</p><div class="album-actions">' + actions.join("") + "</div></div>";

    grid.appendChild(card);
  });

  const future = document.createElement("article");
  future.className = "album-card future";
  future.innerHTML =
    '<p class="eyebrow">NEXT SUMMER</p><p>This year\'s album opens once the date is set. Save your best angles.</p>';
  grid.appendChild(future);
})();

// Scroll reveal (skips entirely if the visitor prefers reduced motion)
(function setupReveal() {
  const items = document.querySelectorAll(".reveal");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduced || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((el) => observer.observe(el));
})();

// Hero art fades in via CSS animation automatically — no JS needed.

/* ---------------------------------------------------------------------
   Glizzy Chomp — a 15-second tap game, plus an optional shared
   leaderboard (see EDIT ME #3 above). Each visitor's personal best is
   always saved locally; the shared top-5 board only turns on once
   Firebase is configured — until then it just says so and the game
   still works fine on its own.
--------------------------------------------------------------------- */
(function glizzyChomp() {
  const startBtn = document.getElementById("gcStart");
  const target = document.getElementById("gcTarget");
  const scoreEl = document.getElementById("gcScore");
  const timeEl = document.getElementById("gcTime");
  const bestEl = document.getElementById("gcBest");
  const resultEl = document.getElementById("gcResult");
  const rankEl = document.getElementById("gcRank");
  const submitBox = document.getElementById("scoreSubmit");
  const nameInput = document.getElementById("gcNameInput");
  const submitBtn = document.getElementById("gcSubmitBtn");
  const leaderboardList = document.getElementById("leaderboardList");
  const seasonLabel = document.getElementById("seasonLabel");
  if (!startBtn || !target) return;

  const GAME_LENGTH = 15;
  const BOARD_SIZE = 5;
  const MIN_TAP_INTERVAL = 100; // ms — fastest interval a real tap gets credit for (10/sec ceiling)
  let score = 0;
  let timeLeft = GAME_LENGTH;
  let timer = null;
  let lastTapTime = 0;
  let fallbackBest = 0;
  let currentTop = []; // kept in sync with the shared leaderboard, sorted high to low

  function getBest() {
    try {
      return parseInt(localStorage.getItem("glizzyChompBest") || "0", 10);
    } catch (e) {
      return fallbackBest;
    }
  }
  function setBest(v) {
    try {
      localStorage.setItem("glizzyChompBest", String(v));
    } catch (e) {
      fallbackBest = v;
    }
  }
  function rankFor(s) {
    if (s >= 100) return "Certified Glizzy Saint";
    if (s >= 75) return "Glizzy Bishop";
    if (s >= 41) return "Shed Deacon";
    if (s >= 15) return "Backyard Regular";
    return "Rookie Griller";
  }
  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  bestEl.textContent = getBest();

  /* ---- Shared leaderboard (Firebase Realtime Database) --------------- */
  const leaderboardConfigured = !!(typeof FIREBASE_CONFIG !== "undefined" && FIREBASE_CONFIG.apiKey);
  let scoresRef = null;
  let allEntries = [];
  let seasonStart = 0;

  function renderLeaderboard(entries) {
    if (!leaderboardList) return;
    if (!entries.length) {
      leaderboardList.innerHTML = '<li class="leaderboard-empty">No scores yet — be the first.</li>';
      return;
    }
    leaderboardList.innerHTML = entries
      .map(function (e, i) {
        const name = escapeHTML(String(e.name || "Anonymous Glizzy Fan").slice(0, 24));
        return (
          '<li class="' + (i === 0 ? "rank-1" : "") + '">' +
          '<span class="lb-rank">' + (i + 1) + "</span>" +
          '<span class="lb-name">' + name + "</span>" +
          '<span class="lb-score">' + e.score + "</span>" +
          "</li>"
        );
      })
      .join("");
  }

  function updateSeasonLabel() {
    if (!seasonLabel) return;
    seasonLabel.textContent = seasonStart ? "Season since " + new Date(seasonStart).toLocaleDateString() : "All-time board";
  }

  function computeTop() {
    const eligible = seasonStart ? allEntries.filter(function (e) { return e.ts >= seasonStart; }) : allEntries;
    currentTop = eligible
      .sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score; // higher score first
        return b.ts - a.ts; // ties: newer score ranks higher
      })
      .slice(0, BOARD_SIZE);
    updateSeasonLabel();
    renderLeaderboard(currentTop);
  }

  if (!leaderboardConfigured) {
    if (leaderboardList) leaderboardList.innerHTML = '<li class="leaderboard-empty">Leaderboard not set up yet.</li>';
  } else if (typeof firebase === "undefined") {
    if (leaderboardList) leaderboardList.innerHTML = '<li class="leaderboard-error">Leaderboard couldn\'t load.</li>';
  } else {
    try {
      const app = firebase.apps && firebase.apps.length ? firebase.apps[0] : firebase.initializeApp(FIREBASE_CONFIG);
      scoresRef = firebase.database(app).ref("scores");
      scoresRef.on(
        "value",
        function (snapshot) {
          const val = snapshot.val() || {};
          allEntries = Object.keys(val).map(function (key) {
            return { key: key, name: val[key].name, score: val[key].score, ts: val[key].ts || 0 };
          });
          computeTop();
        },
        function () {
          if (leaderboardList) leaderboardList.innerHTML = '<li class="leaderboard-error">Leaderboard unavailable right now.</li>';
        }
      );
      // A shared "season" marker, set manually from the Firebase console when
      // you want to start the board fresh — see README. Nothing is ever
      // deleted; this just changes which entries count toward the top 5.
      firebase
        .database(app)
        .ref("season/startedAt")
        .on("value", function (snapshot) {
          seasonStart = snapshot.val() || 0;
          computeTop();
        });
    } catch (e) {
      if (leaderboardList) leaderboardList.innerHTML = '<li class="leaderboard-error">Leaderboard unavailable right now.</li>';
    }
  }

  function qualifiesForBoard(s) {
    if (!scoresRef || s <= 0) return false;
    if (currentTop.length < BOARD_SIZE) return true;
    return s > currentTop[currentTop.length - 1].score;
  }
  function submitScore() {
    if (!scoresRef) return;
    const name = (nameInput.value || "").trim().slice(0, 24) || "Anonymous Glizzy Fan";
    submitBtn.disabled = true;
    scoresRef
      .push({ name: name, score: score, ts: Date.now() })
      .then(function () {
        submitBox.classList.add("submitted");
        const note = document.createElement("p");
        note.className = "score-submit-note";
        note.textContent = "Added! Nice glizzying.";
        submitBox.appendChild(note);
      })
      .catch(function () {
        submitBtn.disabled = false;
        const note = document.createElement("p");
        note.className = "score-submit-note score-submit-error";
        note.textContent = "Couldn't save that — check your connection and try again.";
        submitBox.appendChild(note);
      });
  }

  /* ---- Game loop ------------------------------------------------------ */
  function tick() {
    timeLeft -= 1;
    timeEl.textContent = Math.max(timeLeft, 0);
    if (timeLeft <= 0) endGame();
  }

  function startGame() {
    clearInterval(timer); // belt-and-suspenders: never let a stray interval survive a restart
    score = 0;
    lastTapTime = 0;
    timeLeft = GAME_LENGTH;
    scoreEl.textContent = "0";
    timeEl.textContent = String(GAME_LENGTH);
    resultEl.hidden = true;
    submitBox.hidden = true;
    submitBox.classList.remove("submitted");
    submitBox.querySelectorAll(".score-submit-note").forEach(function (n) {
      n.remove();
    });
    nameInput.value = "";
    submitBtn.disabled = false;
    startBtn.hidden = true;
    startBtn.disabled = true;
    target.disabled = false;
    target.focus({ preventScroll: true });
    setPageScrollLocked(true);
    timer = setInterval(tick, 1000);
  }

  function endGame() {
    clearInterval(timer);
    timer = null;
    target.disabled = true;
    startBtn.hidden = false;
    startBtn.disabled = false;
    startBtn.textContent = "Play Again";
    setPageScrollLocked(false);
    const best = Math.max(getBest(), score);
    setBest(best);
    bestEl.textContent = best;
    rankEl.textContent = score + " glizzies — " + rankFor(score);
    resultEl.hidden = false;
    submitBox.hidden = !qualifiesForBoard(score);
  }

  function chomp(event) {
    if (target.disabled) return;
    if (event && event.isTrusted === false) return; // synthetic/scripted click — not a real tap
    const now = performance.now();
    if (now - lastTapTime < MIN_TAP_INTERVAL) return; // too fast to be a real tap — ignored, not counted
    lastTapTime = now;
    score += 1;
    scoreEl.textContent = String(score);
    target.classList.remove("pop");
    // eslint-disable-next-line no-unused-expressions
    target.offsetWidth; // restart the animation
    target.classList.add("pop");
  }

  startBtn.addEventListener("click", startGame);
  target.addEventListener("click", chomp);
  submitBtn.addEventListener("click", submitScore);
  nameInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") submitScore();
  });
})();

/* ---------------------------------------------------------------------
   Perfect Pour — tap to stop a rising beer fill as close to the target
   line as possible without overflowing. Shares the same Firebase project
   as Glizzy Chomp (see EDIT ME #3) but keeps its own leaderboard node
   ("pourScores") since the scoring scale is completely different.
--------------------------------------------------------------------- */
(function perfectPour() {
  const startBtn = document.getElementById("ppStart");
  const glass = document.getElementById("ppGlass");
  const liquid = document.getElementById("ppLiquid");
  const fillEl = document.getElementById("ppFill");
  const streakEl = document.getElementById("ppStreak");
  const bestEl = document.getElementById("ppBest");
  const roundFlashEl = document.getElementById("ppRoundFlash");
  const resultEl = document.getElementById("ppResult");
  const messageEl = document.getElementById("ppMessage");
  const submitBox = document.getElementById("ppSubmitBox");
  const nameInput = document.getElementById("ppNameInput");
  const submitBtn = document.getElementById("ppSubmitBtn");
  const leaderboardList = document.getElementById("ppLeaderboardList");
  const seasonLabel = document.getElementById("ppSeasonLabel");
  if (!startBtn || !glass) return;

  const TARGET = 95; // percent full — the ideal pour
  const SUCCESS_MIN = 90; // fill must land in [SUCCESS_MIN, 100] to continue the streak
  const MAX_TRACKED = 130; // percent — how far past full we keep tracking, for overflow visuals
  const BOARD_SIZE = 5;
  const INITIAL_DURATION_MIN = 2200;
  const INITIAL_DURATION_MAX = 3400;
  const DURATION_STEP = 200; // ms faster each successful round
  const MIN_DURATION = 900; // floor — never gets faster than this
  const ROUND_FLASH_MS = 700;

  let rafId = null;
  let startTime = 0;
  let duration = 2600;
  let currentFill = 0;
  let pouring = false;
  let pendingScore = 0;
  let fallbackBest = 0;
  let currentTop = [];
  let streakCount = 0;
  let sessionScore = 0;
  let sessionInitialDuration = 2600;
  let autoContinueTimer = null;
  let roundFlashHideTimer = null;

  function getBest() {
    try {
      return parseFloat(localStorage.getItem("perfectPourBest") || "0");
    } catch (e) {
      return fallbackBest;
    }
  }
  function setBest(v) {
    try {
      localStorage.setItem("perfectPourBest", String(v));
    } catch (e) {
      fallbackBest = v;
    }
  }
  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  bestEl.textContent = getBest().toFixed(2);

  /* ---- Shared leaderboard --------------------------------------------- */
  const leaderboardConfigured = !!(typeof FIREBASE_CONFIG !== "undefined" && FIREBASE_CONFIG.apiKey);
  let scoresRef = null;
  let allEntries = [];
  let seasonStart = 0;

  function renderLeaderboard(entries) {
    if (!leaderboardList) return;
    if (!entries.length) {
      leaderboardList.innerHTML = '<li class="leaderboard-empty">No pours yet — be the first.</li>';
      return;
    }
    leaderboardList.innerHTML = entries
      .map(function (e, i) {
        const name = escapeHTML(String(e.name || "Anonymous Glizzy Fan").slice(0, 24));
        const scoreDisplay = Number(e.score).toFixed(2);
        return (
          '<li class="' + (i === 0 ? "rank-1" : "") + '">' +
          '<span class="lb-rank">' + (i + 1) + "</span>" +
          '<span class="lb-name">' + name + "</span>" +
          '<span class="lb-score">' + scoreDisplay + "</span>" +
          "</li>"
        );
      })
      .join("");
  }

  function updateSeasonLabel() {
    if (!seasonLabel) return;
    seasonLabel.textContent = seasonStart ? "Season since " + new Date(seasonStart).toLocaleDateString() : "All-time board";
  }

  function computeTop() {
    const eligible = seasonStart ? allEntries.filter(function (e) { return e.ts >= seasonStart; }) : allEntries;
    currentTop = eligible
      .sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return b.ts - a.ts;
      })
      .slice(0, BOARD_SIZE);
    updateSeasonLabel();
    renderLeaderboard(currentTop);
  }

  if (!leaderboardConfigured) {
    if (leaderboardList) leaderboardList.innerHTML = '<li class="leaderboard-empty">Leaderboard not set up yet.</li>';
  } else if (typeof firebase === "undefined") {
    if (leaderboardList) leaderboardList.innerHTML = '<li class="leaderboard-error">Leaderboard couldn\'t load.</li>';
  } else {
    try {
      const app = firebase.apps && firebase.apps.length ? firebase.apps[0] : firebase.initializeApp(FIREBASE_CONFIG);
      scoresRef = firebase.database(app).ref("pourScores");
      scoresRef.on(
        "value",
        function (snapshot) {
          const val = snapshot.val() || {};
          allEntries = Object.keys(val).map(function (key) {
            return { key: key, name: val[key].name, score: val[key].score, ts: val[key].ts || 0 };
          });
          computeTop();
        },
        function () {
          if (leaderboardList) leaderboardList.innerHTML = '<li class="leaderboard-error">Leaderboard unavailable right now.</li>';
        }
      );
      // Same shared season marker Glizzy Chomp uses — one "new season" reset
      // refreshes both boards together.
      firebase
        .database(app)
        .ref("season/startedAt")
        .on("value", function (snapshot) {
          seasonStart = snapshot.val() || 0;
          computeTop();
        });
    } catch (e) {
      if (leaderboardList) leaderboardList.innerHTML = '<li class="leaderboard-error">Leaderboard unavailable right now.</li>';
    }
  }

  function qualifiesForBoard(s) {
    if (!scoresRef || s <= 0) return false;
    if (currentTop.length < BOARD_SIZE) return true;
    return s > currentTop[currentTop.length - 1].score;
  }
  function submitScore() {
    if (!scoresRef) return;
    const name = (nameInput.value || "").trim().slice(0, 24) || "Anonymous Glizzy Fan";
    submitBtn.disabled = true;
    scoresRef
      .push({ name: name, score: pendingScore, ts: Date.now() })
      .then(function () {
        submitBox.classList.add("submitted");
        const note = document.createElement("p");
        note.className = "score-submit-note";
        note.textContent = "Added! Steady hands indeed.";
        submitBox.appendChild(note);
      })
      .catch(function () {
        submitBtn.disabled = false;
        const note = document.createElement("p");
        note.className = "score-submit-note score-submit-error";
        note.textContent = "Couldn't save that — check your connection and try again.";
        submitBox.appendChild(note);
      });
  }

  /* ---- Pour mechanics --------------------------------------------------- */
  function scoreFor(fill) {
    // Distance-based curve off the true (decimal) fill percentage — no
    // rounding before this point, so landing "perfect" is vanishingly rare
    // and near-misses each get their own distinct score.
    const distance = Math.abs(TARGET - fill);
    return Math.max(0, 100 - distance * 3);
  }

  function setLiquidHeight(pct) {
    const clamped = Math.max(0, Math.min(pct, MAX_TRACKED));
    liquid.style.height = Math.min(clamped, 100) + "%";
    fillEl.textContent = Math.min(pct, 999).toFixed(1) + "%";
    glass.classList.toggle("overflowing", pct > 100);
  }

  function durationForRound(roundNumber) {
    const base = Math.max(MIN_DURATION, sessionInitialDuration - (roundNumber - 1) * DURATION_STEP);
    const jitter = (Math.random() - 0.5) * 300;
    return Math.max(MIN_DURATION, base + jitter);
  }

  function frame(now) {
    if (!pouring) return;
    const elapsed = now - startTime;
    currentFill = (elapsed / duration) * MAX_TRACKED;
    setLiquidHeight(currentFill);
    if (currentFill >= MAX_TRACKED) {
      stopPour();
      return;
    }
    rafId = requestAnimationFrame(frame);
  }

  function beginRound() {
    glass.disabled = false;
    glass.classList.remove("overflowing");
    currentFill = 0;
    setLiquidHeight(0);
    duration = durationForRound(streakCount + 1);
    pouring = true;
    startTime = performance.now();
    glass.focus({ preventScroll: true });
    rafId = requestAnimationFrame(frame);
  }

  function startSession() {
    clearTimeout(autoContinueTimer);
    clearTimeout(roundFlashHideTimer);
    roundFlashEl.classList.remove("show");
    resultEl.hidden = true;
    submitBox.hidden = true;
    submitBox.classList.remove("submitted");
    submitBox.querySelectorAll(".score-submit-note").forEach(function (n) {
      n.remove();
    });
    nameInput.value = "";
    submitBtn.disabled = false;
    startBtn.hidden = true;
    startBtn.disabled = true;
    streakCount = 0;
    sessionScore = 0;
    streakEl.textContent = "0";
    sessionInitialDuration = INITIAL_DURATION_MIN + Math.random() * (INITIAL_DURATION_MAX - INITIAL_DURATION_MIN);
    setPageScrollLocked(true);
    beginRound();
  }

  function showRoundFlash(text) {
    roundFlashEl.textContent = text;
    roundFlashEl.classList.remove("show");
    // eslint-disable-next-line no-unused-expressions
    roundFlashEl.offsetWidth; // restart the animation
    roundFlashEl.classList.add("show");
    clearTimeout(roundFlashHideTimer);
    roundFlashHideTimer = setTimeout(function () {
      roundFlashEl.classList.remove("show");
    }, ROUND_FLASH_MS - 250);
  }

  function endSession(finalFill) {
    clearTimeout(roundFlashHideTimer);
    roundFlashEl.classList.remove("show");
    startBtn.hidden = false;
    startBtn.disabled = false;
    startBtn.textContent = "Pour Again";
    setPageScrollLocked(false);

    const roundedTotal = Math.round(sessionScore * 100) / 100;
    pendingScore = roundedTotal;
    const best = Math.max(getBest(), roundedTotal);
    setBest(best);
    bestEl.textContent = best.toFixed(2);

    const failMsg =
      finalFill > 100
        ? "Overflowed at " + finalFill.toFixed(2) + "%."
        : "Only hit " + finalFill.toFixed(2) + "% — needed at least " + SUCCESS_MIN + "%.";

    messageEl.textContent =
      streakCount === 0
        ? failMsg + " No streak this time."
        : failMsg + " Streak of " + streakCount + " banked " + roundedTotal.toFixed(2) + " pts.";

    resultEl.hidden = false;
    submitBox.hidden = !qualifiesForBoard(roundedTotal);
  }

  function stopPour(event) {
    if (!pouring) return;
    if (event && event.isTrusted === false) return; // synthetic/scripted click — not a real tap; the pour just keeps running
    pouring = false;
    cancelAnimationFrame(rafId);
    glass.disabled = true;

    const finalFill = Math.round(currentFill * 100) / 100; // 2-decimal precision
    const success = finalFill >= SUCCESS_MIN && finalFill <= 100;

    if (success) {
      const roundScore = scoreFor(finalFill);
      sessionScore += roundScore;
      streakCount += 1;
      streakEl.textContent = String(streakCount);
      showRoundFlash("+" + roundScore.toFixed(2));
      autoContinueTimer = setTimeout(beginRound, ROUND_FLASH_MS);
    } else {
      endSession(finalFill);
    }
  }

  startBtn.addEventListener("click", startSession);
  glass.addEventListener("click", stopPour);
  submitBtn.addEventListener("click", submitScore);
  nameInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") submitScore();
  });
})();

/* ---------------------------------------------------------------------
   Glizzy Gauntlet — a small hand-built platformer. Canvas-rendered,
   frame-based physics (tuned for ~60fps), single jump (no double-jump),
   touch buttons + keyboard. Shares the same leaderboard/season pattern
   as the other two games, on its own Firebase node ("platformerScores").
--------------------------------------------------------------------- */
(function glizzyGauntlet() {
  const canvas = document.getElementById("pfCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("pfScore");
  const streakEl = document.getElementById("pfStreak");
  const bestEl = document.getElementById("pfBest");
  const overlay = document.getElementById("pfOverlay");
  const overlayStart = document.getElementById("pfOverlayStart");
  const overlayResult = document.getElementById("pfOverlayResult");
  const startBtn = document.getElementById("pfStart");
  const retryBtn = document.getElementById("pfRetry");
  const pauseBtn = document.getElementById("pfPause");
  const resumeBtn = document.getElementById("pfResume");
  const pauseBadge = document.getElementById("pfPauseBadge");
  const lapFlashEl = document.getElementById("pfLapFlash");
  const messageEl = document.getElementById("pfMessage");
  const submitBox = document.getElementById("pfSubmitBox");
  const nameInput = document.getElementById("pfNameInput");
  const submitBtn = document.getElementById("pfSubmitBtn");
  const leftBtn = document.getElementById("pfLeft");
  const rightBtn = document.getElementById("pfRight");
  const jumpBtn = document.getElementById("pfJump");
  const leaderboardList = document.getElementById("pfLeaderboardList");
  const seasonLabel = document.getElementById("pfSeasonLabel");

  /* ---- Constants -------------------------------------------------------- */
  const VIEW_W = 400, VIEW_H = 220;
  const GRAVITY = 0.55;
  const JUMP_VELOCITY = -10.5;
  const MOVE_SPEED = 2.6;
  const MAX_FALL_SPEED = 12;
  const PLAYER_W = 20, PLAYER_H = 28;
  const GROUND_Y = 190;
  const TIME_LIMIT_SEC = 90; // absolute per-attempt safety net, separate from the streak's own time limit
  const BOARD_SIZE = 5;
  const STREAK_TIME_START = 30; // seconds — generous, comfortable even with detours for every glizzy
  const STREAK_TIME_STEP = 3; // gets this much tighter each successful lap
  const STREAK_TIME_FLOOR = 18; // never gets tighter than this
  const LAP_FLASH_MS = 1300;

  const platforms = [
    { x: 0, y: GROUND_Y, w: 280, h: 40 },
    { x: 350, y: GROUND_Y, w: 170, h: 40 },
    { x: 580, y: GROUND_Y, w: 240, h: 40 },
    { x: 895, y: GROUND_Y, w: 85, h: 40 },
    { x: 1050, y: GROUND_Y, w: 400, h: 40 },
    { x: 1520, y: GROUND_Y, w: 380, h: 40 },
    { x: 1970, y: GROUND_Y, w: 230, h: 40 },
    { x: 400, y: 120, w: 60, h: 15 },
    { x: 680, y: 160, w: 28, h: 30 },
    { x: 1100, y: 130, w: 60, h: 15 },
    { x: 1180, y: 110, w: 60, h: 15 }
  ];
  const collectiblesTemplate = [
    { x: 120, y: 170 },
    { x: 430, y: 100 },
    { x: 1210, y: 90 },
    { x: 1600, y: 155 },
    { x: 1750, y: 155 }
  ];
  const goal = { x: 2150, y: GROUND_Y };
  const LEVEL_WIDTH = 2200;

  let collectibles = [];
  let player = {};
  let camera = { x: 0 };
  let leftPressed = false;
  let rightPressed = false;
  let jumpRequested = false;
  let collectedCount = 0;
  let startTime = 0;
  let runFrame = 0;
  let streakCount = 0;
  let sessionScore = 0;
  let currentTimeLimit = STREAK_TIME_START;
  let lapContinueTimer = null;
  let lapFlashHideTimer = null;
  let lapTransitioning = false;
  const TOTAL_COLLECTIBLES = collectiblesTemplate.length;
  let rafId = null;
  let gameState = "idle"; // idle | playing | result
  let fallbackBest = 0;
  let pendingScore = 0;

  function getBest() {
    try {
      return parseInt(localStorage.getItem("glizzyGauntletBest") || "0", 10);
    } catch (e) {
      return fallbackBest;
    }
  }
  function setBest(v) {
    try {
      localStorage.setItem("glizzyGauntletBest", String(v));
    } catch (e) {
      fallbackBest = v;
    }
  }
  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  bestEl.textContent = getBest();

  /* ---- Shared leaderboard ------------------------------------------------ */
  const leaderboardConfigured = !!(typeof FIREBASE_CONFIG !== "undefined" && FIREBASE_CONFIG.apiKey);
  let scoresRef = null;
  let allEntries = [];
  let seasonStart = 0;
  let currentTop = [];

  function renderLeaderboard(entries) {
    if (!leaderboardList) return;
    if (!entries.length) {
      leaderboardList.innerHTML = '<li class="leaderboard-empty">No runs yet — be the first.</li>';
      return;
    }
    leaderboardList.innerHTML = entries
      .map(function (e, i) {
        const name = escapeHTML(String(e.name || "Anonymous Glizzy Fan").slice(0, 24));
        return (
          '<li class="' + (i === 0 ? "rank-1" : "") + '">' +
          '<span class="lb-rank">' + (i + 1) + "</span>" +
          '<span class="lb-name">' + name + "</span>" +
          '<span class="lb-score">' + e.score + "</span>" +
          "</li>"
        );
      })
      .join("");
  }

  function updateSeasonLabel() {
    if (!seasonLabel) return;
    seasonLabel.textContent = seasonStart ? "Season since " + new Date(seasonStart).toLocaleDateString() : "All-time board";
  }

  function computeTop() {
    const eligible = seasonStart ? allEntries.filter(function (e) { return e.ts >= seasonStart; }) : allEntries;
    currentTop = eligible
      .sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return b.ts - a.ts;
      })
      .slice(0, BOARD_SIZE);
    updateSeasonLabel();
    renderLeaderboard(currentTop);
  }

  if (!leaderboardConfigured) {
    if (leaderboardList) leaderboardList.innerHTML = '<li class="leaderboard-empty">Leaderboard not set up yet.</li>';
  } else if (typeof firebase === "undefined") {
    if (leaderboardList) leaderboardList.innerHTML = '<li class="leaderboard-error">Leaderboard couldn\'t load.</li>';
  } else {
    try {
      const app = firebase.apps && firebase.apps.length ? firebase.apps[0] : firebase.initializeApp(FIREBASE_CONFIG);
      scoresRef = firebase.database(app).ref("platformerScores");
      scoresRef.on(
        "value",
        function (snapshot) {
          const val = snapshot.val() || {};
          allEntries = Object.keys(val).map(function (key) {
            return { key: key, name: val[key].name, score: val[key].score, ts: val[key].ts || 0 };
          });
          computeTop();
        },
        function () {
          if (leaderboardList) leaderboardList.innerHTML = '<li class="leaderboard-error">Leaderboard unavailable right now.</li>';
        }
      );
      firebase
        .database(app)
        .ref("season/startedAt")
        .on("value", function (snapshot) {
          seasonStart = snapshot.val() || 0;
          computeTop();
        });
    } catch (e) {
      if (leaderboardList) leaderboardList.innerHTML = '<li class="leaderboard-error">Leaderboard unavailable right now.</li>';
    }
  }

  function qualifiesForBoard(s) {
    if (!scoresRef || s <= 0) return false;
    if (currentTop.length < BOARD_SIZE) return true;
    return s > currentTop[currentTop.length - 1].score;
  }

  function submitScore() {
    if (!scoresRef) return;
    const name = (nameInput.value || "").trim().slice(0, 24) || "Anonymous Glizzy Fan";
    submitBtn.disabled = true;
    scoresRef
      .push({ name: name, score: pendingScore, ts: Date.now() })
      .then(function () {
        submitBox.classList.add("submitted");
        const note = document.createElement("p");
        note.className = "score-submit-note";
        note.textContent = "Added! See you at The Shed.";
        submitBox.appendChild(note);
      })
      .catch(function () {
        submitBtn.disabled = false;
        const note = document.createElement("p");
        note.className = "score-submit-note score-submit-error";
        note.textContent = "Couldn't save that — check your connection and try again.";
        submitBox.appendChild(note);
      });
  }

  /* ---- Physics ------------------------------------------------------------ */
  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function currentProgressPct() {
    return Math.min(1, Math.max(0, player.x / LEVEL_WIDTH));
  }
  function liveScore() {
    return Math.round(currentProgressPct() * 100) + collectedCount * 15;
  }

  function resetRun() {
    player = { x: 20, y: GROUND_Y - PLAYER_H, vy: 0, onGround: true, facing: 1 };
    camera.x = 0;
    collectibles = collectiblesTemplate.map(function (c) {
      return { x: c.x, y: c.y, collected: false };
    });
    collectedCount = 0;
    leftPressed = false;
    rightPressed = false;
    jumpRequested = false;
    runFrame = 0;
    startTime = performance.now();
  }

  function updatePhysics() {
    let vx = 0;
    if (leftPressed) vx -= MOVE_SPEED;
    if (rightPressed) vx += MOVE_SPEED;
    if (vx < 0) player.facing = -1;
    if (vx > 0) player.facing = 1;

    player.x += vx;
    if (player.x < 0) player.x = 0;
    platforms.forEach(function (p) {
      const pr = { x: player.x, y: player.y, w: PLAYER_W, h: PLAYER_H };
      if (rectsOverlap(pr, p)) {
        if (vx > 0) player.x = p.x - PLAYER_W;
        else if (vx < 0) player.x = p.x + p.w;
      }
    });

    player.vy += GRAVITY;
    if (player.vy > MAX_FALL_SPEED) player.vy = MAX_FALL_SPEED;
    player.y += player.vy;
    player.onGround = false;
    platforms.forEach(function (p) {
      const pr = { x: player.x, y: player.y, w: PLAYER_W, h: PLAYER_H };
      if (rectsOverlap(pr, p)) {
        if (player.vy > 0) {
          player.y = p.y - PLAYER_H;
          player.vy = 0;
          player.onGround = true;
        } else if (player.vy < 0) {
          player.y = p.y + p.h;
          player.vy = 0;
        }
      }
    });

    if (jumpRequested && player.onGround) {
      player.vy = JUMP_VELOCITY;
      player.onGround = false;
    }
    jumpRequested = false;

    collectibles.forEach(function (c) {
      if (c.collected) return;
      const dx = player.x + PLAYER_W / 2 - c.x;
      const dy = player.y + PLAYER_H / 2 - c.y;
      if (Math.sqrt(dx * dx + dy * dy) < 22) {
        c.collected = true;
        collectedCount += 1;
      }
    });

    camera.x = Math.max(0, Math.min(player.x - VIEW_W / 2, LEVEL_WIDTH - VIEW_W));

    if (player.y > VIEW_H + 60) {
      endRun("fell");
      return;
    }
    const elapsedSec = (performance.now() - startTime) / 1000;
    if (elapsedSec > TIME_LIMIT_SEC) {
      endRun("timeout");
      return;
    }
    if (player.x + PLAYER_W >= goal.x) {
      handleGoalReached();
      return;
    }

    if ((leftPressed || rightPressed) && player.onGround) runFrame += 1;
    scoreEl.textContent = String(liveScore());
  }

  /* ---- Rendering ------------------------------------------------------------ */
  function drawPlayer() {
    ctx.save();
    ctx.translate(player.x + PLAYER_W / 2, player.y + PLAYER_H / 2);
    if (player.facing < 0) ctx.scale(-1, 1);
    ctx.strokeStyle = "#1b2740";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    const swing = player.onGround && (leftPressed || rightPressed) ? Math.sin(runFrame * 0.4) * 6 : 0;
    ctx.beginPath();
    ctx.moveTo(-4, 8);
    ctx.lineTo(-4 + swing, 15);
    ctx.moveTo(4, 8);
    ctx.lineTo(4 - swing, 15);
    ctx.stroke();
    ctx.fillStyle = "#e3b876";
    ctx.beginPath();
    ctx.ellipse(0, 1, 10, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#1b2740";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "#b23a28";
    ctx.beginPath();
    ctx.ellipse(0, -4, 9, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Pope hat (mitre) — the "Pope Glizzicus" of it all
    ctx.fillStyle = "#fbf5e8";
    ctx.beginPath();
    ctx.moveTo(-6, -8);
    ctx.lineTo(-3, -19);
    ctx.lineTo(0, -15);
    ctx.lineTo(3, -19);
    ctx.lineTo(6, -8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#1b2740";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#c9a227";
    ctx.fillRect(-6, -9, 12, 2.5);
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(4, -2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1b2740";
    ctx.beginPath();
    ctx.arc(4.6, -2, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawGlizzy(c) {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.fillStyle = "#e3b876";
    ctx.beginPath();
    ctx.ellipse(0, 2, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#b23a28";
    ctx.beginPath();
    ctx.ellipse(0, -1, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawGoal() {
    ctx.save();
    const w = 44, h = 50;
    const x0 = goal.x - 2;
    const y0 = goal.y - h;

    // Red walls
    ctx.fillStyle = "#b23a28";
    ctx.fillRect(x0, y0, w, h);

    // White corner trim and fascia strip under the roofline
    ctx.fillStyle = "#fbf5e8";
    ctx.fillRect(x0, y0, 4, h);
    ctx.fillRect(x0 + w - 4, y0, 4, h);
    ctx.fillRect(x0, y0, w, 4);

    // Small white door
    ctx.fillStyle = "#fbf5e8";
    ctx.fillRect(x0 + w / 2 - 7, y0 + h - 24, 14, 24);

    // Black roof slab, overhanging both sides
    ctx.fillStyle = "#1b1815";
    ctx.fillRect(x0 - 7, y0 - 10, w + 14, 12);

    ctx.restore();
  }

  function render() {
    const grad = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    grad.addColorStop(0, "#1b2740");
    grad.addColorStop(0.55, "#7a3a4a");
    grad.addColorStop(1, "#f2a63d");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    ctx.save();
    ctx.translate(-camera.x, 0);

    platforms.forEach(function (p) {
      ctx.fillStyle = "#6b4429";
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = "#5a9c4a";
      ctx.fillRect(p.x, p.y, p.w, 5);
    });

    collectibles.forEach(function (c) {
      if (!c.collected) drawGlizzy(c);
    });

    drawGoal();
    drawPlayer();

    ctx.restore();
  }

  /* ---- State machine ------------------------------------------------------ */
  function showOverlay(mode) {
    overlay.hidden = false;
    overlayStart.hidden = mode !== "start";
    overlayResult.hidden = mode !== "result";
  }

  let pauseStartedAt = 0;

  function startRun() {
    gameState = "playing";
    clearTimeout(lapContinueTimer);
    clearTimeout(lapFlashHideTimer);
    lapFlashEl.classList.remove("show");
    streakCount = 0;
    sessionScore = 0;
    currentTimeLimit = STREAK_TIME_START;
    streakEl.textContent = "0";
    resetRun();
    overlay.hidden = true;
    submitBox.hidden = true;
    submitBox.classList.remove("submitted");
    submitBox.querySelectorAll(".score-submit-note").forEach(function (n) {
      n.remove();
    });
    nameInput.value = "";
    submitBtn.disabled = false;
    pauseBtn.hidden = false;
    setPageScrollLocked(true);
    loop();
  }

  function pauseGame() {
    if (gameState !== "playing" || lapTransitioning) return;
    gameState = "paused";
    cancelAnimationFrame(rafId);
    pauseStartedAt = performance.now();
    pauseBadge.hidden = false;
  }

  function resumeGame() {
    if (gameState !== "paused") return;
    const pausedMs = performance.now() - pauseStartedAt;
    startTime += pausedMs; // so the elapsed-time clock doesn't count the pause
    gameState = "playing";
    pauseBadge.hidden = true;
    loop();
  }

  function showLapFlash(text) {
    lapFlashEl.textContent = text;
    lapFlashEl.classList.remove("show");
    // eslint-disable-next-line no-unused-expressions
    lapFlashEl.offsetWidth; // restart the animation
    lapFlashEl.classList.add("show");
    clearTimeout(lapFlashHideTimer);
    lapFlashHideTimer = setTimeout(function () {
      lapFlashEl.classList.remove("show");
    }, LAP_FLASH_MS - 300); // fades out just before the next lap/result appears, not after
  }

  function handleGoalReached() {
    const elapsedSec = (performance.now() - startTime) / 1000;
    const timeBonus = Math.max(0, Math.round(100 - elapsedSec * 2));
    const roundScore = liveScore() + 150 + timeBonus;
    sessionScore += roundScore;

    const gotAll = collectedCount === TOTAL_COLLECTIBLES;
    const fastEnough = elapsedSec <= currentTimeLimit;

    if (gotAll && fastEnough) {
      streakCount += 1;
      streakEl.textContent = String(streakCount);
      currentTimeLimit = Math.max(STREAK_TIME_FLOOR, currentTimeLimit - STREAK_TIME_STEP);
      scoreEl.textContent = String(sessionScore);
      showLapFlash("+" + roundScore + "! Lap " + streakCount + " · beat " + currentTimeLimit.toFixed(0) + "s");
      cancelAnimationFrame(rafId);
      lapTransitioning = true;
      pauseBtn.disabled = true; // brief window between laps — nothing useful to pause
      lapContinueTimer = setTimeout(function () {
        lapTransitioning = false;
        pauseBtn.disabled = false;
        if (gameState !== "playing") return; // guard in case the game somehow ended during the flash window
        resetRun();
        loop();
      }, LAP_FLASH_MS);
      return;
    }

    const why = !gotAll ? "Missed a glizzy." : "Too slow to keep the streak going.";
    finishSession("Made it to The Shed in " + elapsedSec.toFixed(1) + "s! " + why);
  }

  function finishSession(message) {
    gameState = "result";
    cancelAnimationFrame(rafId);
    clearTimeout(lapContinueTimer);
    clearTimeout(lapFlashHideTimer);
    lapFlashEl.classList.remove("show");
    lapTransitioning = false;
    pauseBtn.hidden = true;
    setPageScrollLocked(false);

    const total = Math.round(sessionScore);
    scoreEl.textContent = String(total);
    const best = Math.max(getBest(), total);
    setBest(best);
    bestEl.textContent = best;
    pendingScore = total;

    messageEl.textContent =
      streakCount > 0
        ? message + " Streak of " + streakCount + " banked " + total + " pts."
        : message + " " + total + " pts.";
    submitBox.hidden = !qualifiesForBoard(total);
    showOverlay("result");
  }

  function endRun(reason) {
    if (gameState !== "playing") return;
    // Fell or ran out the clock entirely — this attempt earns nothing, the
    // streak ends with whatever was already banked from prior clean laps.
    const message =
      reason === "timeout"
        ? "Ran out the clock. (" + Math.round(currentProgressPct() * 100) + "% of the way there)"
        : "Down you go. (" + Math.round(currentProgressPct() * 100) + "% of the way there)";
    finishSession(message);
  }

  function loop() {
    if (gameState !== "playing" || lapTransitioning) return;
    updatePhysics();
    render();
    if (gameState === "playing" && !lapTransitioning) rafId = requestAnimationFrame(loop);
  }

  /* ---- Input ------------------------------------------------------------ */
  function bindHold(el, onDown, onUp) {
    el.addEventListener("pointerdown", function (e) {
      if (e.isTrusted === false) return;
      e.preventDefault();
      onDown();
    });
    ["pointerup", "pointerleave", "pointercancel"].forEach(function (evt) {
      el.addEventListener(evt, onUp);
    });
  }
  bindHold(
    leftBtn,
    function () { leftPressed = true; },
    function () { leftPressed = false; }
  );
  bindHold(
    rightBtn,
    function () { rightPressed = true; },
    function () { rightPressed = false; }
  );
  jumpBtn.addEventListener("pointerdown", function (e) {
    if (e.isTrusted === false) return;
    e.preventDefault();
    jumpRequested = true;
  });

  window.addEventListener("keydown", function (e) {
    if (gameState !== "playing" || e.isTrusted === false) return;
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") leftPressed = true;
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") rightPressed = true;
    if (e.key === "ArrowUp" || e.key === "w" || e.key === "W" || e.key === " ") {
      jumpRequested = true;
      e.preventDefault();
    }
  });
  window.addEventListener("keyup", function (e) {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") leftPressed = false;
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") rightPressed = false;
  });

  startBtn.addEventListener("click", startRun);
  retryBtn.addEventListener("click", startRun);
  pauseBtn.addEventListener("click", pauseGame);
  resumeBtn.addEventListener("click", resumeGame);
  submitBtn.addEventListener("click", submitScore);
  nameInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") submitScore();
  });

  resetRun();
  render();
  showOverlay("start");
})();

/* ---------------------------------------------------------------------
   Glizzy Maze — a small Pac-Man-style chase game. Grid-based movement,
   canvas-rendered, four chasers with distinct AI personalities. Shares
   the same leaderboard/season pattern as the other games, on its own
   Firebase node ("mazeScores").
--------------------------------------------------------------------- */
(function glizzyMaze() {
  const canvas = document.getElementById("mzCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("mzScore");
  const bestEl = document.getElementById("mzBest");
  const overlay = document.getElementById("mzOverlay");
  const overlayStart = document.getElementById("mzOverlayStart");
  const overlayResult = document.getElementById("mzOverlayResult");
  const startBtn = document.getElementById("mzStart");
  const retryBtn = document.getElementById("mzRetry");
  const pauseBtn = document.getElementById("mzPause");
  const resumeBtn = document.getElementById("mzResume");
  const pauseBadge = document.getElementById("mzPauseBadge");
  const messageEl = document.getElementById("mzMessage");
  const submitBox = document.getElementById("mzSubmitBox");
  const nameInput = document.getElementById("mzNameInput");
  const submitBtn = document.getElementById("mzSubmitBtn");
  const leaderboardList = document.getElementById("mzLeaderboardList");
  const seasonLabel = document.getElementById("mzSeasonLabel");
  const swipeZone = document.getElementById("mzSwipeZone");

  /* ---- Maze data ---------------------------------------------------------
     Modeled loosely on the real backyard: pool + shed together, a deck
     connecting to the house, the garage and driveway off to one side, a
     few trees scattered around the yard. Tile codes:
       0 = generic/border wall     1 = open yard (path)
       2 = pool (wall)             3 = shed (wall)
       4 = garage (wall)           5 = house (wall)
       6 = deck (path, tinted)     7 = driveway (path, tinted)
       8 = tree (wall, drawn round)
  --------------------------------------------------------------------- */
  const COLS = 17, ROWS = 21, TILE = 26;
  const TUNNEL_ROW = 6;
  const PASSABLE = { 1: true, 6: true, 7: true, 9: true };

  const maze = [];
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) row.push(1);
    maze.push(row);
  }
  function fillBlock(r0, r1, c0, c1, code) {
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) maze[r][c] = code;
    }
  }
  for (let c = 0; c < COLS; c++) { maze[0][c] = 0; maze[ROWS - 1][c] = 0; }
  for (let r = 0; r < ROWS; r++) { maze[r][0] = 0; maze[r][COLS - 1] = 0; }
  maze[TUNNEL_ROW][0] = 1;
  maze[TUNNEL_ROW][COLS - 1] = 1;

  fillBlock(2, 3, 1, 2, 8);      // tree, top-left
  fillBlock(3, 4, 7, 8, 8);      // tree, top-center
  fillBlock(4, 5, 13, 14, 8);    // tree, top-right
  fillBlock(12, 14, 1, 2, 8);    // tree, left side
  fillBlock(8, 14, 5, 10, 9);    // concrete patio (base rect, carved by the pool below)
  fillBlock(9, 14, 6, 9, 2);     // pool
  fillBlock(11, 13, 10, 11, 3);  // shed, right of pool
  fillBlock(14, 17, 10, 13, 4);  // garage
  fillBlock(17, 19, 2, 8, 5);    // house — narrowed by 1 col on the right, opens a passage to the garage
  fillBlock(15, 16, 6, 9, 6);    // wooden deck — now adjacent to the house
  fillBlock(18, 19, 10, 15, 7);  // driveway — walkable, beside the garage

  const GLITCH_TILES = [[12, 6], [12, 9]]; // Glitch's cut-through the pool
  const PLAYER_START = { col: 14, row: 18 };
  const DEN_CENTER = { col: 8, row: 11 };
  const CHASER_DEFS = [
    { id: "buschman", spawn: { col: 8, row: 8 }, label: "Buschman", color: "#4a7fb5", accent: "#c9c9c9" },
    { id: "shroom", spawn: { col: 5, row: 9 }, label: "Spore Loser", color: "#7a3ab5", accent: "#c9382a" },
    { id: "stable", spawn: { col: 10, row: 9 }, label: "Stable Hand", color: "#8b5a3c", accent: "#e3b876" },
    { id: "glitch", spawn: { col: 8, row: 15 }, label: "The Glitch", color: "#3fafc0", accent: "#1b2740" }
  ];
  const POWER_TILES = [
    { col: 1, row: 1 }, { col: 15, row: 1 }, { col: 15, row: 19 }, { col: 1, row: 15 }
  ];
  const BONUS_SPAWN_TILE = { col: 7, row: 8 };

  const DIRS = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 }
  ];

  function wrapCol(c) {
    if (c < 0) return COLS - 1;
    if (c >= COLS) return 0;
    return c;
  }
  function isOpen(col, row, moverId) {
    const c = wrapCol(col);
    if (row < 0 || row >= ROWS) return false;
    if (moverId === "glitch" && GLITCH_TILES.some(function (t) { return t[0] === row && t[1] === c; })) return true;
    return !!PASSABLE[maze[row][c]];
  }
  function isSpecialTile(col, row) {
    return (col === PLAYER_START.col && row === PLAYER_START.row) ||
      (col === BONUS_SPAWN_TILE.col && row === BONUS_SPAWN_TILE.row) ||
      CHASER_DEFS.some(function (d) { return d.spawn.col === col && d.spawn.row === row; }) ||
      POWER_TILES.some(function (t) { return t.col === col && t.row === row; });
  }

  /* ---- Game constants ---------------------------------------------------- */
  const BOARD_SIZE = 5;
  const PLAYER_SPEED = 1.6;
  const CHASER_SPEED = 1.4;
  const FRIGHTENED_SPEED = 0.9;
  const BURST_SPEED = 1.75;
  const FRIGHTENED_MS = 7000;
  const EATEN_RESPAWN_MS = 3000;
  const RAGE_QUIT_MS = 4000;
  const GRACE_MS = 2200; // chasers just wander for this long at the start of each run
  const SOBER_INTERVAL_MIN = 6000, SOBER_INTERVAL_MAX = 9000, SOBER_DURATION = 2500;
  const BONUS_INTERVAL_MS = 13000, BONUS_LIFETIME_MS = 7000;
  const PELLET_SCORE = 10;
  const POWER_PELLET_SCORE = 50;
  const EAT_CHASER_SCORES = [200, 400, 800, 1600];
  const CLEAR_BONUS = 1000;
  const BONUS_ITEMS = [
    { type: "watermelon", score: 100 },
    { type: "popsicle", score: 150 }
  ];
  const HORSE_FIRST_MIN = 3000, HORSE_FIRST_JITTER = 3000; // first appearance: quick, so nobody misses it
  const HORSE_INTERVAL_MIN = 14000, HORSE_INTERVAL_JITTER = 10000; // subsequent appearances
  const HORSE_SPEED = 1.5; // px/frame — a straight walk, tunnel entrance to tunnel entrance

  /* ---- State -------------------------------------------------------------- */
  let pellets = [];
  let powerPellets = [];
  let totalPellets = 0;
  let player = {};
  let chasers = [];
  let score = 0;
  let gameState = "idle"; // idle | playing | result
  let frightenedUntil = 0;
  let chaserEatStreak = 0;
  let bonusItem = null; // { col, row, type, score, expiresAt }
  let horse = null; // { col, row, x, y, dir, wanderUntil } -- a wandering NPC, not a static bonus tile
  let nextHorseAt = 0;
  let nextBonusAt = 0;
  let rafId = null;
  let fallbackBest = 0;
  let runStartTime = 0;

  function getBest() {
    try { return parseInt(localStorage.getItem("glizzyMazeBest") || "0", 10); }
    catch (e) { return fallbackBest; }
  }
  function setBest(v) {
    try { localStorage.setItem("glizzyMazeBest", String(v)); }
    catch (e) { fallbackBest = v; }
  }
  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  bestEl.textContent = getBest();

  /* ---- Shared leaderboard --------------------------------------------- */
  const leaderboardConfigured = !!(typeof FIREBASE_CONFIG !== "undefined" && FIREBASE_CONFIG.apiKey);
  let scoresRef = null;
  let allEntries = [];
  let seasonStart = 0;
  let currentTop = [];

  function renderLeaderboard(entries) {
    if (!leaderboardList) return;
    if (!entries.length) {
      leaderboardList.innerHTML = '<li class="leaderboard-empty">No runs yet — be the first.</li>';
      return;
    }
    leaderboardList.innerHTML = entries
      .map(function (e, i) {
        const name = escapeHTML(String(e.name || "Anonymous Glizzy Fan").slice(0, 24));
        return (
          '<li class="' + (i === 0 ? "rank-1" : "") + '">' +
          '<span class="lb-rank">' + (i + 1) + "</span>" +
          '<span class="lb-name">' + name + "</span>" +
          '<span class="lb-score">' + e.score + "</span>" +
          "</li>"
        );
      })
      .join("");
  }
  function updateSeasonLabel() {
    if (!seasonLabel) return;
    seasonLabel.textContent = seasonStart ? "Season since " + new Date(seasonStart).toLocaleDateString() : "All-time board";
  }
  function computeTop() {
    const eligible = seasonStart ? allEntries.filter(function (e) { return e.ts >= seasonStart; }) : allEntries;
    currentTop = eligible
      .sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return b.ts - a.ts;
      })
      .slice(0, BOARD_SIZE);
    updateSeasonLabel();
    renderLeaderboard(currentTop);
  }
  if (!leaderboardConfigured) {
    if (leaderboardList) leaderboardList.innerHTML = '<li class="leaderboard-empty">Leaderboard not set up yet.</li>';
  } else if (typeof firebase === "undefined") {
    if (leaderboardList) leaderboardList.innerHTML = '<li class="leaderboard-error">Leaderboard couldn\'t load.</li>';
  } else {
    try {
      const app = firebase.apps && firebase.apps.length ? firebase.apps[0] : firebase.initializeApp(FIREBASE_CONFIG);
      scoresRef = firebase.database(app).ref("mazeScores");
      scoresRef.on(
        "value",
        function (snapshot) {
          const val = snapshot.val() || {};
          allEntries = Object.keys(val).map(function (key) {
            return { key: key, name: val[key].name, score: val[key].score, ts: val[key].ts || 0 };
          });
          computeTop();
        },
        function () {
          if (leaderboardList) leaderboardList.innerHTML = '<li class="leaderboard-error">Leaderboard unavailable right now.</li>';
        }
      );
      firebase.database(app).ref("season/startedAt").on("value", function (snapshot) {
        seasonStart = snapshot.val() || 0;
        computeTop();
      });
    } catch (e) {
      if (leaderboardList) leaderboardList.innerHTML = '<li class="leaderboard-error">Leaderboard unavailable right now.</li>';
    }
  }
  function qualifiesForBoard(s) {
    if (!scoresRef || s <= 0) return false;
    if (currentTop.length < BOARD_SIZE) return true;
    return s > currentTop[currentTop.length - 1].score;
  }
  function submitScore(pendingScore) {
    if (!scoresRef) return;
    const name = (nameInput.value || "").trim().slice(0, 24) || "Anonymous Glizzy Fan";
    submitBtn.disabled = true;
    scoresRef
      .push({ name: name, score: pendingScore, ts: Date.now() })
      .then(function () {
        submitBox.classList.add("submitted");
        const note = document.createElement("p");
        note.className = "score-submit-note";
        note.textContent = "Added! The crew will remember this.";
        submitBox.appendChild(note);
      })
      .catch(function () {
        submitBtn.disabled = false;
        const note = document.createElement("p");
        note.className = "score-submit-note score-submit-error";
        note.textContent = "Couldn't save that — check your connection and try again.";
        submitBox.appendChild(note);
      });
  }
  let pendingScore = 0;

  /* ---- Setup / reset ------------------------------------------------------ */
  function buildPellets() {
    pellets = [];
    powerPellets = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!PASSABLE[maze[r][c]]) continue;
        if (isSpecialTile(c, r)) continue;
        pellets.push({ col: c, row: r });
      }
    }
    POWER_TILES.forEach(function (t) { powerPellets.push({ col: t.col, row: t.row }); });
    totalPellets = pellets.length;
  }

  function cellCenter(col, row) {
    return { x: wrapCol(col) * TILE + TILE / 2, y: row * TILE + TILE / 2 };
  }

  function resetPositions() {
    const pc = cellCenter(PLAYER_START.col, PLAYER_START.row);
    player = { col: PLAYER_START.col, row: PLAYER_START.row, x: pc.x, y: pc.y, dir: { dx: 0, dy: 0 }, nextDir: { dx: 0, dy: 0 }, mouth: 0 };

    chasers = CHASER_DEFS.map(function (def) {
      const c = cellCenter(def.spawn.col, def.spawn.row);
      return {
        id: def.id, label: def.label, color: def.color, accent: def.accent,
        col: def.spawn.col, row: def.spawn.row, x: c.x, y: c.y,
        spawnCol: def.spawn.col, spawnRow: def.spawn.row,
        dir: { dx: 0, dy: 1 },
        mode: "normal", // normal | frightened | eaten
        soberUntil: 0, nextSoberAt: performance.now() + SOBER_INTERVAL_MIN + Math.random() * (SOBER_INTERVAL_MAX - SOBER_INTERVAL_MIN),
        rageUntil: 0, closeStreak: 0, wasClose: false,
        eatenUntil: 0, trail: []
      };
    });

    frightenedUntil = 0;
    chaserEatStreak = 0;
    bonusItem = null;
    nextBonusAt = performance.now() + BONUS_INTERVAL_MS;
    horse = null;
    nextHorseAt = performance.now() + HORSE_FIRST_MIN + Math.random() * HORSE_FIRST_JITTER;
  }

  /* ---- Movement ------------------------------------------------------------ */
  function stepEntity(e, speed, chooseDirFn) {
    if (e.dir.dx === 0 && e.dir.dy === 0) {
      e.dir = chooseDirFn(e);
      if (e.dir.dx === 0 && e.dir.dy === 0) return; // truly stuck (shouldn't happen)
    }
    const rawCol = e.col + e.dir.dx;
    const rawRow = e.row + e.dir.dy;

    // Tunnel wrap: the target column is off the grid entirely. Teleport
    // straight to the far side instead of interpolating pixel-by-pixel
    // across the whole map (which is what caused the "slides all the way
    // across" bug — cellCenter() wraps the column for the target, but the
    // entity's actual on-screen position was still on the near edge).
    if (rawCol < 0 || rawCol >= COLS) {
      const wrapped = wrapCol(rawCol);
      const c = cellCenter(wrapped, rawRow);
      e.col = wrapped;
      e.row = rawRow;
      e.x = c.x;
      e.y = c.y;
      e.dir = chooseDirFn(e);
      return;
    }

    const target = cellCenter(rawCol, rawRow);
    const dx = target.x - e.x, dy = target.y - e.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= speed) {
      e.col = rawCol;
      e.row = rawRow;
      e.x = target.x; e.y = target.y;
      e.dir = chooseDirFn(e);
    } else {
      e.x += (dx / dist) * speed;
      e.y += (dy / dist) * speed;
    }
  }

  function playerChooseDir(e) {
    if (isOpen(e.col + e.nextDir.dx, e.row + e.nextDir.dy, "player") && (e.nextDir.dx || e.nextDir.dy)) {
      return { dx: e.nextDir.dx, dy: e.nextDir.dy };
    }
    if (isOpen(e.col + e.dir.dx, e.row + e.dir.dy, "player")) return e.dir;
    return { dx: 0, dy: 0 };
  }

  function validDirsFor(chaser) {
    const nonReverse = DIRS.filter(function (d) {
      const isReverse = d.dx === -chaser.dir.dx && d.dy === -chaser.dir.dy && (chaser.dir.dx || chaser.dir.dy);
      if (isReverse) return false;
      return isOpen(chaser.col + d.dx, chaser.row + d.dy, chaser.id);
    });
    if (nonReverse.length) return nonReverse;
    return DIRS.filter(function (d) { return isOpen(chaser.col + d.dx, chaser.row + d.dy, chaser.id); });
  }

  function pickTowards(chaser, target, maximize) {
    const candidates = validDirsFor(chaser);
    if (!candidates.length) return { dx: 0, dy: 0 };
    let best = candidates[0], bestDist = null;
    candidates.forEach(function (d) {
      const nc = chaser.col + d.dx, nr = chaser.row + d.dy;
      const dist = (nc - target.col) * (nc - target.col) + (nr - target.row) * (nr - target.row);
      if (bestDist === null || (maximize ? dist > bestDist : dist < bestDist)) {
        bestDist = dist; best = d;
      }
    });
    return best;
  }
  function pickRandom(chaser) {
    const candidates = validDirsFor(chaser);
    if (!candidates.length) return { dx: 0, dy: 0 };
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  function chaserChooseDir(chaser) {
    const now = performance.now();

    if (now - runStartTime < GRACE_MS) {
      return pickRandom(chaser);
    }
    if (chaser.mode === "eaten") {
      return pickTowards(chaser, DEN_CENTER, false);
    }
    // Stable Hand is drawn to the horse above all else -- even mid-fright he can't help it
    if (chaser.id === "stable" && horse) {
      return pickTowards(chaser, { col: horse.col, row: horse.row }, false);
    }
    if (chaser.mode === "frightened") {
      return pickTowards(chaser, { col: player.col, row: player.row }, true);
    }
    if (chaser.rageUntil > now) {
      return { dx: 0, dy: 0 };
    }

    if (chaser.id === "buschman") {
      if (now < chaser.soberUntil) return pickTowards(chaser, { col: player.col, row: player.row }, false);
      if (now >= chaser.nextSoberAt) {
        chaser.soberUntil = now + SOBER_DURATION;
        chaser.nextSoberAt = now + SOBER_DURATION + SOBER_INTERVAL_MIN + Math.random() * (SOBER_INTERVAL_MAX - SOBER_INTERVAL_MIN);
        return pickTowards(chaser, { col: player.col, row: player.row }, false);
      }
      return Math.random() < 0.25 ? pickTowards(chaser, { col: player.col, row: player.row }, false) : pickRandom(chaser);
    }

    if (chaser.id === "shroom") {
      const dist = Math.hypot(chaser.col - player.col, chaser.row - player.row);
      const wasClose = chaser.wasClose;
      chaser.wasClose = dist < 3;
      if (wasClose && dist > 6) {
        chaser.closeStreak += 1;
        if (chaser.closeStreak >= 3) {
          chaser.rageUntil = now + RAGE_QUIT_MS;
          chaser.closeStreak = 0;
          return { dx: 0, dy: 0 };
        }
      }
      return pickTowards(chaser, { col: player.col, row: player.row }, false);
    }

    if (chaser.id === "stable") {
      // horse case is handled earlier, above the frightened check — by this
      // point horse is guaranteed absent
      if (Math.random() < 0.3) return pickRandom(chaser);
      const ahead = { col: player.col + player.dir.dx * 3, row: player.row + player.dir.dy * 3 };
      return pickTowards(chaser, ahead, false);
    }

    // glitch: erratic
    return pickRandom(chaser);
  }

  function chaserSpeed(chaser) {
    if (chaser.mode === "eaten") return CHASER_SPEED * 2.2;
    if (chaser.id === "stable" && horse) return BURST_SPEED;
    if (chaser.mode === "frightened") return FRIGHTENED_SPEED;
    if (chaser.id === "buschman" && performance.now() < chaser.soberUntil) return BURST_SPEED;
    if (chaser.id === "shroom") {
      const dist = Math.hypot(chaser.col - player.col, chaser.row - player.row);
      return dist < 4 ? BURST_SPEED : CHASER_SPEED;
    }
    if (chaser.id === "stable") return CHASER_SPEED * 0.9;
    return CHASER_SPEED;
  }

  /* ---- Game loop ------------------------------------------------------------ */
  function collectPellets() {
    for (let i = pellets.length - 1; i >= 0; i--) {
      if (pellets[i].col === player.col && pellets[i].row === player.row) {
        pellets.splice(i, 1);
        score += PELLET_SCORE;
      }
    }
    for (let i = powerPellets.length - 1; i >= 0; i--) {
      if (powerPellets[i].col === player.col && powerPellets[i].row === player.row) {
        powerPellets.splice(i, 1);
        score += POWER_PELLET_SCORE;
        frightenedUntil = performance.now() + FRIGHTENED_MS;
        chaserEatStreak = 0;
        chasers.forEach(function (ch) {
          if (ch.mode !== "eaten") ch.mode = "frightened";
        });
      }
    }
    if (bonusItem && bonusItem.col === player.col && bonusItem.row === player.row) {
      score += bonusItem.score;
      bonusItem = null;
      nextBonusAt = performance.now() + BONUS_INTERVAL_MS;
    }
  }

  function checkChaserCollisions() {
    const now = performance.now();
    if (now - runStartTime < GRACE_MS) return; // safe start — no collisions while chasers are just wandering
    chasers.forEach(function (ch) {
      if (ch.mode === "eaten") return;
      const dist = Math.hypot(ch.x - player.x, ch.y - player.y);
      if (dist > TILE * 0.6) return;
      if (ch.mode === "frightened") {
        ch.mode = "eaten";
        ch.eatenUntil = now + EATEN_RESPAWN_MS;
        const points = EAT_CHASER_SCORES[Math.min(chaserEatStreak, EAT_CHASER_SCORES.length - 1)];
        score += points;
        chaserEatStreak += 1;
      } else {
        endGame(false);
      }
    });
  }

  function updateBonus() {
    const now = performance.now();
    if (!bonusItem && now >= nextBonusAt) {
      const pick = BONUS_ITEMS[Math.floor(Math.random() * BONUS_ITEMS.length)];
      bonusItem = { col: BONUS_SPAWN_TILE.col, row: BONUS_SPAWN_TILE.row, type: pick.type, score: pick.score, expiresAt: now + BONUS_LIFETIME_MS };
    } else if (bonusItem && now >= bonusItem.expiresAt) {
      bonusItem = null;
      nextBonusAt = now + BONUS_INTERVAL_MS;
    }
  }

  function updateHorse() {
    const now = performance.now();
    if (!horse) {
      if (now >= nextHorseAt) {
        const fromLeft = Math.random() < 0.5;
        horse = {
          x: fromLeft ? -TILE : (COLS + 1) * TILE,
          y: TUNNEL_ROW * TILE + TILE / 2,
          dir: fromLeft ? 1 : -1,
          col: fromLeft ? 0 : COLS - 1,
          row: TUNNEL_ROW
        };
      }
      return;
    }
    horse.x += horse.dir * HORSE_SPEED;
    horse.col = Math.max(0, Math.min(COLS - 1, Math.round(horse.x / TILE)));
    if (horse.x < -TILE * 1.5 || horse.x > (COLS + 1.5) * TILE) {
      horse = null;
      nextHorseAt = now + HORSE_INTERVAL_MIN + Math.random() * HORSE_INTERVAL_JITTER;
    }
  }

  function updateChaserModes() {
    const now = performance.now();
    if (frightenedUntil && now >= frightenedUntil) {
      frightenedUntil = 0;
      chasers.forEach(function (ch) {
        if (ch.mode === "frightened") ch.mode = "normal";
      });
    }
    chasers.forEach(function (ch) {
      if (ch.mode === "eaten" && now >= ch.eatenUntil) {
        ch.mode = "normal";
        const c = cellCenter(ch.spawnCol, ch.spawnRow);
        ch.col = ch.spawnCol;
        ch.row = ch.spawnRow;
        ch.x = c.x;
        ch.y = c.y;
        ch.dir = { dx: 0, dy: 1 };
      }
    });
  }

  function tick() {
    if (gameState !== "playing") return;
    stepEntity(player, PLAYER_SPEED, playerChooseDir);
    player.mouth += 0.25;

    chasers.forEach(function (ch) {
      if (ch.mode === "eaten" && performance.now() < ch.eatenUntil) return; // paused while "returning"
      stepEntity(ch, chaserSpeed(ch), chaserChooseDir);
      const now = performance.now();
      if ((ch.id === "shroom" || ch.id === "glitch") && ch.mode === "normal") {
        if (!ch.lastTrailPush || now - ch.lastTrailPush > 70) {
          ch.trail.push({ x: ch.x, y: ch.y, t: now });
          if (ch.trail.length > 16) ch.trail.shift();
          ch.lastTrailPush = now;
        }
      } else if (ch.trail.length) {
        ch.trail.shift(); // fade out naturally while frightened/eaten instead of snapping away
      }
    });

    collectPellets();
    updateBonus();
    updateHorse();
    updateChaserModes();
    checkChaserCollisions();

    if (gameState === "playing" && pellets.length === 0) {
      score += CLEAR_BONUS;
      endGame(true);
      return;
    }

    if (gameState === "playing") {
      render();
      rafId = requestAnimationFrame(tick);
    }
  }

  /* ---- Rendering ------------------------------------------------------------ */
  const ZONE_COLORS = {
    0: "#173021", // generic/border wall — dark hedge green
    2: "#2f9fd6", // pool
    3: "#b23a28", // shed
    4: "#2b2b2b", // garage
    5: "#15120f", // house
    8: "#1f5c38"  // tree
  };
  const PATH_TINTS = {
    1: "#173a24", // yard grass
    6: "#5c4530", // deck
    7: "#5a5a5a", // driveway
    9: "#9a9a92"  // pool concrete patio
  };

  function drawMaze() {
    ctx.fillStyle = PATH_TINTS[1];
    ctx.fillRect(0, 0, COLS * TILE, ROWS * TILE);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const code = maze[r][c];
        if (code === 1) continue; // already painted as base grass
        if (PATH_TINTS[code]) {
          ctx.fillStyle = PATH_TINTS[code];
          ctx.fillRect(c * TILE, r * TILE, TILE, TILE);
          continue;
        }
        if (code === 8) continue; // trees drawn as circles below, not blocks
        ctx.fillStyle = ZONE_COLORS[code] || ZONE_COLORS[0];
        ctx.fillRect(c * TILE, r * TILE, TILE, TILE);
      }
    }
    // Trees rendered as overlapping circles so they read as foliage, not a block
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (maze[r][c] !== 8) continue;
        ctx.fillStyle = ZONE_COLORS[8];
        ctx.beginPath();
        ctx.arc(c * TILE + TILE / 2, r * TILE + TILE / 2, TILE * 0.62, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    GLITCH_TILES.forEach(function (t) {
      ctx.fillStyle = "rgba(63,175,192,0.4)";
      ctx.fillRect(t[1] * TILE, t[0] * TILE, TILE, TILE);
    });
  }

  function drawHotDog(cx, cy, scale) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.fillStyle = "#e3b876";
    ctx.beginPath();
    ctx.ellipse(0, 2, 7.5, 3.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#b23a28";
    ctx.beginPath();
    ctx.ellipse(0, -1, 6.8, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#f2a63d";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-4.5, -1.5);
    ctx.quadraticCurveTo(-2, -3, 0, -1.5);
    ctx.quadraticCurveTo(2, -3, 4.5, -1.5);
    ctx.stroke();
    ctx.restore();
  }

  function drawBeerMug(cx, cy, scale) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    const x0 = -7, x1 = 7; // body spans 14 wide
    const yTop = -9, yBot = 7; // body spans 16 tall

    // Black outline silhouette
    ctx.fillStyle = "#1b1815";
    ctx.fillRect(x0 - 1.5, yTop - 3, (x1 - x0) + 3, (yBot - yTop) + 6);

    // Glass interior base
    ctx.fillStyle = "#fbf5e8";
    ctx.fillRect(x0, yTop, x1 - x0, yBot - yTop);

    // Beer — gold upper band, amber lower band
    ctx.fillStyle = "#f2a63d";
    ctx.fillRect(x0, yTop + 5, x1 - x0, 6);
    ctx.fillStyle = "#c9711f";
    ctx.fillRect(x0, yTop + 11, x1 - x0, (yBot - (yTop + 11)) - 2);

    // Glass tint at the base
    ctx.fillStyle = "#8fd0e8";
    ctx.fillRect(x0, yBot - 2, x1 - x0, 2);

    // Foam top — jagged, uneven edge for character
    ctx.fillStyle = "#fbf5e8";
    ctx.fillRect(x0, yTop, x1 - x0, 4);
    ctx.fillRect(x0 - 1, yTop - 3, 4, 4);
    ctx.fillRect(x0 + 4, yTop - 4, 4, 5);
    ctx.fillRect(x1 - 3, yTop - 2, 3, 3);

    // Handle — black outline with a blue glass-tint window
    ctx.fillStyle = "#1b1815";
    ctx.fillRect(x1, yTop + 2, 5, 10);
    ctx.fillStyle = "#8fd0e8";
    ctx.fillRect(x1 + 1, yTop + 3.5, 2, 7);

    ctx.restore();
  }

  function drawPellets() {
    pellets.forEach(function (p) {
      drawHotDog(p.col * TILE + TILE / 2, p.row * TILE + TILE / 2, 0.85);
    });
    const pulse = 1 + Math.sin(performance.now() / 150) * 0.12;
    powerPellets.forEach(function (p) {
      drawBeerMug(p.col * TILE + TILE / 2, p.row * TILE + TILE / 2, pulse);
    });
  }

  function drawBonus() {
    if (!bonusItem) return;
    const x = bonusItem.col * TILE + TILE / 2, y = bonusItem.row * TILE + TILE / 2;
    ctx.save();
    ctx.translate(x, y);
    if (bonusItem.type === "watermelon") {
      ctx.fillStyle = "#5a9c4a";
      ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#d9576b";
      ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = "#e3574c";
      ctx.fillRect(-4, -8, 8, 12);
      ctx.strokeStyle = "#e3b876";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, 4); ctx.lineTo(0, 10); ctx.stroke();
    }
    ctx.restore();
  }

  function drawHorse() {
    if (!horse) return;
    ctx.save();
    ctx.translate(horse.x, horse.y);
    if (horse.dir < 0) ctx.scale(-1, 1);

    const legPhase = Math.sin(performance.now() / 85) * 3;
    const BODY = "#8a5a35";
    const DARK = "#2a1c12";
    const HOOF = "#0d0906";

    // Legs (back pair and front pair swing opposite each other for a walking gait)
    ctx.fillStyle = DARK;
    ctx.fillRect(-14 + legPhase, 4, 5, 10);
    ctx.fillRect(-6 - legPhase, 4, 5, 10);
    ctx.fillRect(5 - legPhase, 4, 5, 10);
    ctx.fillRect(13 + legPhase, 4, 5, 10);
    ctx.fillStyle = HOOF;
    ctx.fillRect(-14 + legPhase, 12, 5, 3);
    ctx.fillRect(-6 - legPhase, 12, 5, 3);
    ctx.fillRect(5 - legPhase, 12, 5, 3);
    ctx.fillRect(13 + legPhase, 12, 5, 3);

    // Tail
    ctx.fillStyle = DARK;
    ctx.fillRect(-23, -3, 6, 6);
    ctx.fillRect(-26, 1, 5, 9);

    // Body
    ctx.fillStyle = BODY;
    ctx.fillRect(-18, -8, 30, 14);

    // Neck + head + snout
    ctx.fillRect(7, -19, 10, 15);
    ctx.fillRect(13, -25, 12, 11);
    ctx.fillRect(23, -20, 8, 7);

    // Mane (dark stripe along the back of the neck, head, and spine)
    ctx.fillStyle = DARK;
    ctx.fillRect(7, -19, 4, 15);
    ctx.fillRect(11, -25, 4, 9);
    ctx.fillRect(-18, -8, 25, 3);

    // Ears
    ctx.fillStyle = BODY;
    ctx.beginPath();
    ctx.moveTo(15, -25); ctx.lineTo(17, -30); ctx.lineTo(19, -25); ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(20, -25); ctx.lineTo(22, -30); ctx.lineTo(24, -25); ctx.closePath();
    ctx.fill();

    // Eye
    ctx.fillStyle = "#1b2740";
    ctx.fillRect(27, -18, 2.5, 2.5);

    ctx.restore();
  }

  function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.scale(1.45, 1.45); // match the chasers' scale
    const moving = player.dir.dx !== 0 || player.dir.dy !== 0;
    const swing = moving ? Math.sin(player.mouth * 3) * 5 : 0;
    // Legs
    ctx.strokeStyle = "#1b2740";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-4, 7); ctx.lineTo(-4 + swing, 13);
    ctx.moveTo(4, 7); ctx.lineTo(4 - swing, 13);
    ctx.stroke();
    // Bun
    ctx.fillStyle = "#e3b876";
    ctx.beginPath();
    ctx.ellipse(0, 1, 9, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#1b2740";
    ctx.lineWidth = 1.3;
    ctx.stroke();
    // Sausage
    ctx.fillStyle = "#b23a28";
    ctx.beginPath();
    ctx.ellipse(0, -3, 8, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Pope hat (mitre)
    ctx.fillStyle = "#fbf5e8";
    ctx.beginPath();
    ctx.moveTo(-5.5, -7);
    ctx.lineTo(-2.7, -17);
    ctx.lineTo(0, -13.5);
    ctx.lineTo(2.7, -17);
    ctx.lineTo(5.5, -7);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#1b2740";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#c9a227";
    ctx.fillRect(-5.5, -8, 11, 2.2);
    // Eyes
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(3, -3, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#1b2740";
    ctx.beginPath(); ctx.arc(3.6, -3, 1.1, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawHumanoidBase(bodyColor, skinColor, legPhase) {
    // Legs (walking stance)
    ctx.fillStyle = "#1b2740";
    const legSwing = Math.sin(legPhase) * 2;
    ctx.fillRect(-5 + legSwing, 6, 4, 7);
    ctx.fillRect(1 - legSwing, 6, 4, 7);
    // Torso
    ctx.fillStyle = bodyColor;
    ctx.fillRect(-7, -4, 14, 11);
    // Arms
    ctx.fillStyle = skinColor;
    ctx.fillRect(-9, -2, 3, 7);
    ctx.fillRect(6, -2, 3, 7);
    // Head
    ctx.fillStyle = skinColor;
    ctx.fillRect(-6, -14, 12, 10);
  }

  function drawHair(color, height) {
    ctx.fillStyle = color;
    ctx.fillRect(-6.5, -15, 13, height || 4);
  }

  function drawEyes(offsetY, wide) {
    ctx.fillStyle = "#1b2740";
    const w = wide ? 2.2 : 1.6;
    ctx.fillRect(-4, offsetY, w, w + 1);
    ctx.fillRect(2, offsetY, w, w + 1);
  }

  function drawHeart(cx, cy, size) {
    ctx.fillStyle = "#e3574c";
    ctx.beginPath();
    ctx.arc(cx - size * 0.5, cy, size * 0.5, 0, Math.PI * 2);
    ctx.arc(cx + size * 0.5, cy, size * 0.5, 0, Math.PI * 2);
    ctx.moveTo(cx - size, cy + size * 0.15);
    ctx.lineTo(cx, cy + size * 1.15);
    ctx.lineTo(cx + size, cy + size * 0.15);
    ctx.closePath();
    ctx.fill();
  }

  function drawHeartEyes(offsetY) {
    drawHeart(-3.6, offsetY + 0.8, 3.3);
    drawHeart(3.6, offsetY + 0.8, 3.3);
  }

  function drawChaser(ch) {
    const now = performance.now();
    ctx.save();
    ctx.translate(ch.x, ch.y);

    if (ch.mode === "eaten") {
      ctx.fillStyle = "#fbf5e8";
      ctx.beginPath(); ctx.arc(-3, 0, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(3, 0, 2, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      return;
    }

    if (ch.trail && ch.trail.length) {
      ch.trail.forEach(function (pt, i) {
        const age = (i + 1) / ch.trail.length; // 0 excluded = oldest still gets a little visibility, 1 = newest
        const relX = pt.x - ch.x, relY = pt.y - ch.y;
        if (ch.id === "shroom") {
          const hue = (pt.t / 12) % 360;
          ctx.fillStyle = "hsla(" + hue + ", 90%, 60%, " + (age * 0.7) + ")";
          ctx.beginPath();
          ctx.arc(relX, relY, 6 * age, 0, Math.PI * 2);
          ctx.fill();
        } else if (ch.id === "glitch") {
          ctx.fillStyle = "rgba(225,230,240," + (age * 0.55) + ")";
          ctx.beginPath();
          ctx.arc(relX, relY, 7.5 * age, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    ctx.scale(1.45, 1.45); // bigger overall — small details need the room
    const legPhase = ch.col * 3 + ch.row * 3 + now / 120;
    const skin = "#e3b876";

    if (ch.mode === "frightened") {
      const flash = now - frightenedUntil > -1500 && Math.floor(now / 150) % 2 === 0;
      drawHumanoidBase(flash ? "#3a4a7a" : "#1b2740", flash ? "#5c6a9a" : "#2b3a5a", legPhase);
      if (ch.id === "stable" && horse) {
        drawHeartEyes(-8.5);
      } else {
        ctx.fillStyle = "#fbf5e8";
        ctx.fillRect(-4, -9, 2, 2);
        ctx.fillRect(2, -9, 2, 2);
      }
      ctx.restore();
      return;
    }

    // Slight flicker for Glitch — reads as "not quite stable" without being distracting
    if (ch.id === "glitch" && Math.random() < 0.12) {
      ctx.globalAlpha = 0.55;
    }

    drawHumanoidBase(ch.color, skin, legPhase);

    if (ch.id === "buschman") {
      drawHair("#6b4429", 3);
      const soberFlash = now < ch.soberUntil;
      drawEyes(-10, soberFlash);
      if (soberFlash) {
        ctx.strokeStyle = "#f2a63d";
        ctx.lineWidth = 1;
        ctx.strokeRect(-7, -15, 14, 12);
      }
      // Cap
      ctx.fillStyle = "#1b2740";
      ctx.beginPath();
      ctx.arc(0, -15, 6.3, Math.PI, 0, false);
      ctx.fill();
      ctx.fillRect(3, -16, 6, 2.5); // brim
      ctx.fillStyle = "#c9a227";
      ctx.beginPath(); ctx.arc(0, -18, 1.1, 0, Math.PI * 2); ctx.fill();
      // Beer can in hand
      ctx.fillStyle = "#c9c9c9";
      ctx.fillRect(7, 3, 4, 7);
      ctx.fillStyle = "#4a7fb5";
      ctx.fillRect(7, 4, 4, 2);
    } else if (ch.id === "shroom") {
      drawEyes(-10, false);
      // Big mushroom cap — the whole point is that it can't be missed
      ctx.fillStyle = ch.accent;
      ctx.beginPath();
      ctx.ellipse(0, -13.5, 14, 9.5, 0, Math.PI, 0, false);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#1b2740";
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.fillStyle = "#fbf5e8";
      ctx.beginPath(); ctx.arc(-7, -15.5, 1.9, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(1, -18.5, 1.9, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(7, -14.5, 1.9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#e3b876";
      ctx.fillRect(-3.5, -13, 7, 3);
    } else if (ch.id === "stable") {
      // Dark hair peeking from under the hard hat
      drawHair("#241f18", 4);
      if (horse) drawHeartEyes(-11);
      else drawEyes(-10, false);
      // Hard hat
      ctx.fillStyle = ch.accent;
      ctx.beginPath();
      ctx.arc(0, -14, 6.5, Math.PI, 0, false);
      ctx.fill();
      // Hammer in hand
      ctx.fillStyle = "#8b5a3c";
      ctx.fillRect(8.5, 1, 2, 8);
      ctx.fillStyle = "#5a5a5a";
      ctx.fillRect(6, -1, 7, 3.5);
      ctx.fillStyle = "#3a3a3a";
      ctx.fillRect(6, -1, 2, 3.5);
    } else {
      // Glitch — brown hair and glasses
      drawHair("#5a4230", 5);
      drawEyes(-10, false);
      ctx.strokeStyle = "#1b2740";
      ctx.lineWidth = 1;
      ctx.strokeRect(-5.2, -11, 3.2, 3);
      ctx.strokeRect(2, -11, 3.2, 3);
      ctx.beginPath();
      ctx.moveTo(-2, -9.5);
      ctx.lineTo(2, -9.5);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function render() {
    drawMaze();
    drawPellets();
    drawBonus();
    drawHorse();
    chasers.forEach(drawChaser);
    drawPlayer();
    scoreEl.textContent = String(score);
  }

  /* ---- State machine --------------------------------------------------------- */
  function showOverlay(mode) {
    overlay.hidden = false;
    overlayStart.hidden = mode !== "start";
    overlayResult.hidden = mode !== "result";
  }

  let pauseStartedAt = 0;

  function shiftAllTimers(delta) {
    // Every timed state in the maze uses absolute performance.now() deadlines
    // — pausing means real wall-clock time passes with no gameplay, so every
    // deadline needs to shift forward by exactly how long the pause lasted,
    // or things like fright mode / grace period / respawns would silently
    // lose time (or expire instantly) the moment you resume.
    runStartTime += delta;
    if (frightenedUntil) frightenedUntil += delta;
    nextBonusAt += delta;
    if (bonusItem) bonusItem.expiresAt += delta;
    nextHorseAt += delta;
    chasers.forEach(function (ch) {
      if (ch.soberUntil) ch.soberUntil += delta;
      ch.nextSoberAt += delta;
      if (ch.rageUntil) ch.rageUntil += delta;
      if (ch.eatenUntil) ch.eatenUntil += delta;
    });
  }

  function startRun() {
    gameState = "playing";
    score = 0;
    buildPellets();
    resetPositions();
    runStartTime = performance.now();
    overlay.hidden = true;
    submitBox.hidden = true;
    submitBox.classList.remove("submitted");
    submitBox.querySelectorAll(".score-submit-note").forEach(function (n) { n.remove(); });
    nameInput.value = "";
    submitBtn.disabled = false;
    pauseBtn.hidden = false;
    setPageScrollLocked(true);
    render();
    rafId = requestAnimationFrame(tick);
  }

  function pauseGame() {
    if (gameState !== "playing") return;
    gameState = "paused";
    cancelAnimationFrame(rafId);
    pauseStartedAt = performance.now();
    pauseBadge.hidden = false;
  }

  function resumeGame() {
    if (gameState !== "paused") return;
    const pausedMs = performance.now() - pauseStartedAt;
    shiftAllTimers(pausedMs);
    gameState = "playing";
    pauseBadge.hidden = true;
    rafId = requestAnimationFrame(tick);
  }

  function endGame(cleared) {
    if (gameState !== "playing") return;
    gameState = "result";
    cancelAnimationFrame(rafId);
    pauseBtn.hidden = true;
    setPageScrollLocked(false);

    pendingScore = score;
    const best = Math.max(getBest(), score);
    setBest(best);
    bestEl.textContent = best;

    messageEl.textContent = (cleared ? "Cleared the whole yard! " : "Caught. ") + score + " pts.";
    showOverlay("result");
    submitBox.hidden = !qualifiesForBoard(score);
  }

  /* ---- Input ------------------------------------------------------------------ */
  function setDir(dx, dy) {
    if (gameState !== "playing") return;
    player.nextDir = { dx: dx, dy: dy };
  }

  // Swipe controls — bound to both the canvas and the swipe zone below it,
  // so the whole game area responds the same way. This is the only touch
  // control now; the on-screen d-pad didn't work well on mobile or desktop
  // trackpads, so it's gone in favor of swipe everywhere + keyboard.
  function setupSwipeOn(el) {
    if (!el) return;
    const SWIPE_MIN_PX = 18; // ignore tiny accidental touches
    let touchStartX = 0, touchStartY = 0, tracking = false;

    el.addEventListener(
      "touchstart",
      function (e) {
        if (e.isTrusted === false || e.touches.length !== 1) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        tracking = true;
      },
      { passive: true }
    );

    el.addEventListener(
      "touchmove",
      function (e) {
        if (tracking) e.preventDefault();
      },
      { passive: false }
    );

    el.addEventListener("touchend", function (e) {
      if (e.isTrusted === false || !tracking) return;
      tracking = false;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;
      const absDx = Math.abs(dx), absDy = Math.abs(dy);
      if (Math.max(absDx, absDy) < SWIPE_MIN_PX) return; // too small — treat as a tap, not a swipe
      if (absDx > absDy) setDir(dx > 0 ? 1 : -1, 0);
      else setDir(0, dy > 0 ? 1 : -1);
    });

    el.addEventListener("touchcancel", function () {
      tracking = false;
    });
  }
  setupSwipeOn(canvas);
  setupSwipeOn(swipeZone);

  window.addEventListener("keydown", function (e) {
    if (gameState !== "playing" || e.isTrusted === false) return;
    if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") { setDir(0, -1); e.preventDefault(); }
    if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") { setDir(0, 1); e.preventDefault(); }
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") { setDir(-1, 0); e.preventDefault(); }
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") { setDir(1, 0); e.preventDefault(); }
  });

  startBtn.addEventListener("click", startRun);
  retryBtn.addEventListener("click", startRun);
  pauseBtn.addEventListener("click", pauseGame);
  resumeBtn.addEventListener("click", resumeGame);
  submitBtn.addEventListener("click", function () { submitScore(pendingScore); });
  nameInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") submitScore(pendingScore);
  });
    buildPellets();
  resetPositions();
  render();
  showOverlay("start");
})();
