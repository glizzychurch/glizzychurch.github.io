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
          currentTop = Object.keys(val)
            .map(function (key) {
              return { key: key, name: val[key].name, score: val[key].score };
            })
            .sort(function (a, b) {
              return b.score - a.score;
            })
            .slice(0, BOARD_SIZE);
          renderLeaderboard(currentTop);
        },
        function () {
          if (leaderboardList) leaderboardList.innerHTML = '<li class="leaderboard-error">Leaderboard unavailable right now.</li>';
        }
      );
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
          currentTop = Object.keys(val)
            .map(function (key) {
              return { key: key, name: val[key].name, score: val[key].score };
            })
            .sort(function (a, b) {
              return b.score - a.score;
            })
            .slice(0, BOARD_SIZE);
          renderLeaderboard(currentTop);
        },
        function () {
          if (leaderboardList) leaderboardList.innerHTML = '<li class="leaderboard-error">Leaderboard unavailable right now.</li>';
        }
      );
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
