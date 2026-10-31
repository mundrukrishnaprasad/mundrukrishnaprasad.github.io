// ===== Portfolio JS — loader, nav, reveal, 3D ring carousel =====

document.addEventListener("DOMContentLoaded", () => {
  initLoader();
  initNav();
  initReveal();
  initRing();
  initYear();
});

/* ---------- Preloader ---------- */
function initLoader() {
  const loader = document.getElementById("loader");
  const count = document.getElementById("loaderCount");
  let n = 0;
  const total = 27; // frames of the counter
  const tick = () => {
    n++;
    count.textContent = String(Math.round((n / total) * 100)).padStart(2, "0");
    if (n < total) {
      requestAnimationFrame(tick);
    } else {
      loader.classList.add("done");
      setTimeout(() => loader.remove(), 700);
      // start reveal animations after loader fades
      initRevealNow();
    }
  };
  requestAnimationFrame(tick);
}

/* ---------- Nav ---------- */
function initNav() {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (!toggle) return;
  toggle.addEventListener("click", () => links.classList.toggle("open"));
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => links.classList.remove("open"))
  );
}

/* ---------- Scroll reveal ---------- */
let revealStarted = false;
function initReveal() {
  // real init runs once loader finishes (initRevealNow)
}
function initRevealNow() {
  if (revealStarted) return;
  revealStarted = true;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

  // active nav highlight
  const sections = document.querySelectorAll("section[id], header[id]");
  const navAnchors = document.querySelectorAll(".nav-links a");
  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach((sec) => {
      if (window.scrollY >= sec.offsetTop - 130) current = sec.id;
    });
    navAnchors.forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === "#" + current);
    });
  });
}

/* ---------- 3D Ring carousel ---------- */
function initRing() {
  const ring = document.getElementById("ring");
  if (!ring) return;
  const cards = Array.from(ring.querySelectorAll(".ring-card"));
  const N = cards.length;
  document.getElementById("ringTotal").textContent = String(N).padStart(2, "0");
  const indexEl = document.getElementById("ringIndex");
  const stage = ring.parentElement;

  let rot = 0;
  let vel = 0;
  let dragging = false;
  let lastX = 0;
  let dragDist = 0;
  let lastActive = -1;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const radius = () => {
    // card width / 2 / tan(pi/N) + breathing room
    const w = cards[0].offsetWidth || 280;
    return Math.round(w / 2 / Math.tan(Math.PI / N) + 50);
  };

  const placeCards = () => {
    const R = radius();
    const step = 360 / N;
    cards.forEach((card, i) => {
      card.style.transform = `rotateY(${i * step}deg) translateZ(${R}px)`;
    });
  };

  const updateActive = () => {
    const step = 360 / N;
    // card facing the viewer: index closest to -rot
    const idx = Math.abs(Math.round((-rot % 360) / step)) % N;
    if (idx === lastActive) return;
    lastActive = idx;
    cards.forEach((c, i) => c.classList.toggle("is-active", i === idx));
    indexEl.textContent = String(idx + 1).padStart(2, "0");
  };

  let raf;
  const animate = () => {
    if (!dragging) {
      // auto-rotate slowly unless the user has interacted recently
      if (!reducedMotion && performance.now() - lastInteraction > 3500) {
        vel += (0.06 - vel) * 0.05;
      }
      rot += vel;
      vel *= 0.94;
      if (Math.abs(vel) < 0.01) vel = 0;
    }
    ring.style.transform = `rotateX(-6deg) rotateY(${rot}deg)`;
    updateActive();
    raf = requestAnimationFrame(animate);
  };
  let lastInteraction = 0;

  const onDown = (e) => {
    dragging = true;
    lastX = e.clientX;
    dragDist = 0;
    lastInteraction = performance.now();
    ring.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    dragDist += Math.abs(dx);
    rot += dx * 0.35;
    vel = dx * 0.35;
    ring.style.transform = `rotateX(-6deg) rotateY(${rot}deg)`;
    updateActive();
    lastInteraction = performance.now();
  };
  const onUp = () => {
    dragging = false;
    lastInteraction = performance.now();
  };

  // click → open card link (ignored after a real drag)
  cards.forEach((card) => {
    card.addEventListener("click", (e) => {
      if (dragDist > 6) { e.preventDefault(); return; }
      const href = card.dataset.href;
      if (href && !href.startsWith("#")) window.open(href, "_blank", "noopener");
    });
  });

  stage.addEventListener("pointerdown", onDown);
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);
  window.addEventListener("resize", placeCards);

  placeCards();
  updateActive();
  animate();
}

/* ---------- Footer year ---------- */
function initYear() {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
}
