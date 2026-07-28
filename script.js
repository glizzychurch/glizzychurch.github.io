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
    link: "",
    cover: "images/shed-photo.jpg"
  },
  {
    year: "2026",
    title: "Shed-Fest 2026",
    blurb: "The lineup is fiction. Brookville Lake is very real. So are the sunburns.",
    link: "",
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
      .catch(function () {})
      .then(function () {
        submitBox.classList.add("submitted");
        const note = document.createElement("p");
        note.className = "score-submit-note";
        note.textContent = "Added! Nice glizzying.";
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
    target.focus();
    timer = setInterval(tick, 1000);
  }

  function endGame() {
    clearInterval(timer);
    timer = null;
    target.disabled = true;
    startBtn.hidden = false;
    startBtn.disabled = false;
    startBtn.textContent = "Play Again";
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
  const bestEl = document.getElementById("ppBest");
  const resultEl = document.getElementById("ppResult");
  const messageEl = document.getElementById("ppMessage");
  const submitBox = document.getElementById("ppSubmitBox");
  const nameInput = document.getElementById("ppNameInput");
  const submitBtn = document.getElementById("ppSubmitBtn");
  const leaderboardList = document.getElementById("ppLeaderboardList");
  const seasonLabel = document.getElementById("ppSeasonLabel");
  if (!startBtn || !glass) return;

  const TARGET = 95; // percent full — the ideal pour
  const MAX_TRACKED = 130; // percent — how far past full we keep tracking
  const BOARD_SIZE = 5;

  let rafId = null;
  let startTime = 0;
  let duration = 2600;
  let currentFill = 0;
  let pouring = false;
  let pendingScore = 0;
  let fallbackBest = 0;
  let currentTop = [];

  function getBest() {
    try {
      return parseInt(localStorage.getItem("perfectPourBest") || "0", 10);
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

  bestEl.textContent = getBest();

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
      .catch(function () {})
      .then(function () {
        submitBox.classList.add("submitted");
        const note = document.createElement("p");
        note.className = "score-submit-note";
        note.textContent = "Added! Steady hands indeed.";
        submitBox.appendChild(note);
      });
  }

  /* ---- Pour mechanics --------------------------------------------------- */
  function messageFor(fill, score) {
    if (fill > 100) return "Overflowed! Wasted a good beer.";
    if (score >= 85) return "Perfect pour.";
    if (score >= 60) return "Pretty good.";
    if (score >= 30) return "Rookie move.";
    return "Barely wet the glass.";
  }

  function scoreFor(fill) {
    if (fill > 100) {
      const over = fill - 100;
      return Math.max(0, Math.round(40 - over * 4));
    }
    const distance = Math.abs(TARGET - fill);
    return Math.max(0, Math.round(100 - distance * 3));
  }

  function setLiquidHeight(pct) {
    const clamped = Math.max(0, Math.min(pct, MAX_TRACKED));
    liquid.style.height = Math.min(clamped, 100) + "%";
    fillEl.textContent = Math.round(Math.min(pct, 999)) + "%";
    glass.classList.toggle("overflowing", pct > 100);
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

  function startPour() {
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
    glass.disabled = false;
    glass.classList.remove("overflowing");
    currentFill = 0;
    setLiquidHeight(0);
    duration = 2200 + Math.random() * 1200; // 2.2s–3.4s, randomized each round
    pouring = true;
    startTime = performance.now();
    glass.focus();
    rafId = requestAnimationFrame(frame);
  }

  function stopPour(event) {
    if (!pouring) return;
    if (event && event.isTrusted === false) return; // synthetic/scripted click — not a real tap; the pour just keeps running
    pouring = false;
    cancelAnimationFrame(rafId);
    glass.disabled = true;
    startBtn.hidden = false;
    startBtn.disabled = false;
    startBtn.textContent = "Pour Again";

    const finalFill = Math.round(currentFill * 10) / 10;
    const score = scoreFor(finalFill);
    pendingScore = score;
    const best = Math.max(getBest(), score);
    setBest(best);
    bestEl.textContent = best;
    messageEl.textContent = messageFor(finalFill, score) + " (" + Math.round(finalFill) + "% full, " + score + " pts)";
    resultEl.hidden = false;
    submitBox.hidden = !qualifiesForBoard(score);
  }

  startBtn.addEventListener("click", startPour);
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
  const bestEl = document.getElementById("pfBest");
  const overlay = document.getElementById("pfOverlay");
  const overlayStart = document.getElementById("pfOverlayStart");
  const overlayResult = document.getElementById("pfOverlayResult");
  const startBtn = document.getElementById("pfStart");
  const retryBtn = document.getElementById("pfRetry");
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
  const TIME_LIMIT_SEC = 90;
  const BOARD_SIZE = 5;

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
      .catch(function () {})
      .then(function () {
        submitBox.classList.add("submitted");
        const note = document.createElement("p");
        note.className = "score-submit-note";
        note.textContent = "Added! See you at The Shed.";
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
      endRun(false, "fell");
      return;
    }
    const elapsedSec = (performance.now() - startTime) / 1000;
    if (elapsedSec > TIME_LIMIT_SEC) {
      endRun(false, "timeout");
      return;
    }
    if (player.x + PLAYER_W >= goal.x) {
      endRun(true, "goal");
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
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(goal.x, goal.y);
    ctx.lineTo(goal.x, goal.y - 70);
    ctx.stroke();
    ctx.fillStyle = "#b23a28";
    ctx.beginPath();
    ctx.moveTo(goal.x, goal.y - 70);
    ctx.lineTo(goal.x + 22, goal.y - 61);
    ctx.lineTo(goal.x, goal.y - 52);
    ctx.closePath();
    ctx.fill();
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

  function startRun() {
    gameState = "playing";
    resetRun();
    overlay.hidden = true;
    submitBox.hidden = true;
    submitBox.classList.remove("submitted");
    submitBox.querySelectorAll(".score-submit-note").forEach(function (n) {
      n.remove();
    });
    nameInput.value = "";
    submitBtn.disabled = false;
    loop();
  }

  function endRun(success, reason) {
    if (gameState !== "playing") return;
    gameState = "result";
    cancelAnimationFrame(rafId);

    const elapsedSec = (performance.now() - startTime) / 1000;
    let score = liveScore();
    let message;
    if (success) {
      const timeBonus = Math.max(0, Math.round(100 - elapsedSec * 2));
      score += 150 + timeBonus;
      message = "Made it to The Shed in " + elapsedSec.toFixed(1) + "s!";
    } else if (reason === "timeout") {
      message = "Ran out the clock. (" + Math.round(currentProgressPct() * 100) + "% of the way there)";
    } else {
      message = "Down you go. (" + Math.round(currentProgressPct() * 100) + "% of the way there)";
    }

    scoreEl.textContent = String(score);
    const best = Math.max(getBest(), score);
    setBest(best);
    bestEl.textContent = best;
    pendingScore = score;
    messageEl.textContent = message + " — " + score + " pts";
    submitBox.hidden = !qualifiesForBoard(score);
    showOverlay("result");
  }

  function loop() {
    if (gameState !== "playing") return;
    updatePhysics();
    render();
    if (gameState === "playing") rafId = requestAnimationFrame(loop);
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
  submitBtn.addEventListener("click", submitScore);
  nameInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") submitScore();
  });

  resetRun();
  render();
  showOverlay("start");
})();
