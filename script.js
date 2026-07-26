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
   Glizzy Chomp — a 15-second tap game. Best score is saved locally on
   each visitor's own device (falls back gracefully if storage is
   unavailable, e.g. in a locked-down preview).
--------------------------------------------------------------------- */
(function glizzyChomp() {
  const startBtn = document.getElementById("gcStart");
  const target = document.getElementById("gcTarget");
  const scoreEl = document.getElementById("gcScore");
  const timeEl = document.getElementById("gcTime");
  const bestEl = document.getElementById("gcBest");
  const resultEl = document.getElementById("gcResult");
  const rankEl = document.getElementById("gcRank");
  if (!startBtn || !target) return;

  const GAME_LENGTH = 15;
  let score = 0;
  let timeLeft = GAME_LENGTH;
  let timer = null;
  let fallbackBest = 0;

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
    if (s >= 40) return "Certified Glizzy Saint";
    if (s >= 30) return "Glizzy Bishop";
    if (s >= 20) return "Shed Deacon";
    if (s >= 10) return "Backyard Regular";
    return "Rookie Griller";
  }

  bestEl.textContent = getBest();

  function tick() {
    timeLeft -= 1;
    timeEl.textContent = timeLeft;
    if (timeLeft <= 0) endGame();
  }

  function startGame() {
    score = 0;
    timeLeft = GAME_LENGTH;
    scoreEl.textContent = "0";
    timeEl.textContent = String(GAME_LENGTH);
    resultEl.hidden = true;
    startBtn.hidden = true;
    target.disabled = false;
    target.focus();
    timer = setInterval(tick, 1000);
  }

  function endGame() {
    clearInterval(timer);
    target.disabled = true;
    startBtn.hidden = false;
    startBtn.textContent = "Play Again";
    const best = Math.max(getBest(), score);
    setBest(best);
    bestEl.textContent = best;
    rankEl.textContent = score + " glizzies — " + rankFor(score);
    resultEl.hidden = false;
  }

  function chomp() {
    if (target.disabled) return;
    score += 1;
    scoreEl.textContent = String(score);
    target.classList.remove("pop");
    // eslint-disable-next-line no-unused-expressions
    target.offsetWidth; // restart the animation
    target.classList.add("pop");
  }

  startBtn.addEventListener("click", startGame);
  target.addEventListener("click", chomp);
})();
