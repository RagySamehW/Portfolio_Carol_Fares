import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&$";

function scrambleIn(el: HTMLElement, final: string, duration = 650): void {
  if (reduceMotion) {
    el.textContent = final;
    return;
  }
  const frameMs = 35;
  const totalFrames = Math.max(1, Math.round(duration / frameMs));
  let frame = 0;
  const timer = window.setInterval(() => {
    frame++;
    const revealCount = Math.floor((frame / totalFrames) * final.length);
    let out = "";
    for (let i = 0; i < final.length; i++) {
      out += i < revealCount ? final[i] : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
    }
    el.textContent = out;
    if (frame >= totalFrames) {
      window.clearInterval(timer);
      el.textContent = final;
    }
  }, frameMs);
}

/** Wraps each word of `el` in a clipping mask + an inner span GSAP can translate. Returns the inner spans. */
function splitWords(el: HTMLElement): HTMLElement[] {
  const text = el.textContent ?? "";
  el.innerHTML = text
    .split(/(\s+)/)
    .map((part) => (part.trim() === "" ? part : `<span class="word-mask"><span class="split-word">${part}</span></span>`))
    .join("");
  return Array.from(el.querySelectorAll<HTMLElement>(".split-word"));
}

let lenisInstance: Lenis | null = null;

function initSmoothScroll(): void {
  if (reduceMotion) return;
  const lenis = new Lenis({
    duration: 1.1,
    easing: (t: number) => 1 - Math.pow(1 - t, 3),
  });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  lenisInstance = lenis;
}

function lockScroll(lock: boolean): void {
  lenisInstance?.[lock ? "stop" : "start"]();
  document.documentElement.style.overflow = lock ? "hidden" : "";
}

function initReveal(): void {
  const targets = document.querySelectorAll<HTMLElement>("[data-reveal], [data-reveal-dir]");
  if (reduceMotion) {
    targets.forEach((el) => el.setAttribute("data-revealed", "true"));
    return;
  }

  // Note: this intentionally does not use IntersectionObserver. The element being
  // revealed starts clip-path-collapsed, and a collapsed clip-path reports zero
  // intersection in Chromium, which would make the observer that is supposed to
  // reveal it never fire. ScrollTrigger reads layout geometry (getBoundingClientRect),
  // which clip-path does not affect, so it sidesteps the deadlock.
  targets.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 6, 5) * 70}ms`;
    ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter: () => el.setAttribute("data-revealed", "true"),
    });
  });
}

function initHeadlineSplits(): void {
  if (reduceMotion) return;
  const headlines = document.querySelectorAll<HTMLElement>("[data-split-reveal]");
  headlines.forEach((el) => {
    const words = splitWords(el);
    gsap.set(words, { yPercent: 110, opacity: 0 });
    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.to(words, { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.035, ease: "power3.out" });
      },
    });
  });
}

function initQuoteSweep(): void {
  const quote = document.querySelector<HTMLElement>("[data-quote-sweep]");
  if (!quote) return;

  if (reduceMotion) return;

  const text = quote.textContent ?? "";
  quote.innerHTML = text
    .split(/(\s+)/)
    .map((part) => (part.trim() === "" ? part : `<span class="sweep-word">${part}</span>`))
    .join("");
  const words = Array.from(quote.querySelectorAll<HTMLElement>(".sweep-word"));

  ScrollTrigger.create({
    trigger: quote,
    start: "top 80%",
    end: "bottom 55%",
    scrub: 0.4,
    onUpdate: (self) => {
      const revealCount = Math.ceil(self.progress * words.length);
      words.forEach((w, i) => w.classList.toggle("is-lit", i < revealCount));
    },
  });
}

function initTileGlow(): void {
  if (reduceMotion) return;
  const tiles = document.querySelectorAll<HTMLElement>(".tile-glow");
  tiles.forEach((tile) => {
    tile.addEventListener("pointermove", (e) => {
      const rect = tile.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      tile.style.setProperty("--mx", `${x}%`);
      tile.style.setProperty("--my", `${y}%`);
    });
  });
}

function initMagnetic(): void {
  if (reduceMotion) return;
  const els = document.querySelectorAll<HTMLElement>("[data-magnetic]");
  const strength = 0.3;
  els.forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * strength;
      const y = (e.clientY - rect.top - rect.height / 2) * strength;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "translate(0, 0)";
    });
  });
}

function initTilt(): void {
  if (reduceMotion) return;
  const els = document.querySelectorAll<HTMLElement>("[data-tilt]");
  const max = 6;
  els.forEach((el) => {
    el.style.transition = "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
    el.addEventListener("pointermove", (e) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
    });
  });
}

function initScrollProgress(): void {
  const bar = document.querySelector<HTMLElement>("[data-scroll-progress]");
  const header = document.querySelector<HTMLElement>("[data-nav]");

  if (bar) {
    ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        bar.style.width = `${self.progress * 100}%`;
      },
    });
  }

  if (header) {
    ScrollTrigger.create({
      trigger: document.body,
      start: "80px top",
      onEnter: () => header.setAttribute("data-scrolled", "true"),
      onLeaveBack: () => header.setAttribute("data-scrolled", "false"),
    });
  }
}

function initCapabilitiesPan(): void {
  const pan = document.querySelector<HTMLElement>("[data-capabilities-pan]");
  const track = document.querySelector<HTMLElement>("[data-capabilities-track]");
  if (!pan || !track) return;

  ScrollTrigger.matchMedia({
    "(min-width: 768px)": () => {
      if (reduceMotion) return;
      pan.setAttribute("data-pan-ready", "true");
      const distance = () => track.scrollWidth - window.innerWidth;

      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: pan,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        pan.removeAttribute("data-pan-ready");
        gsap.set(track, { clearProps: "transform" });
      };
    },
  });
}

function initWorkFilter(): void {
  const pills = document.querySelectorAll<HTMLButtonElement>("[data-filter]");
  const tiles = document.querySelectorAll<HTMLElement>("[data-category]");
  if (!pills.length || !tiles.length) return;

  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      const category = pill.dataset.filter ?? "all";
      pills.forEach((p) => {
        const active = p === pill;
        p.setAttribute("data-active", String(active));
        p.setAttribute("aria-pressed", String(active));
      });
      tiles.forEach((tile) => {
        const matches = category === "all" || tile.dataset.category === category;
        tile.setAttribute("data-hidden", String(!matches));
      });
    });
  });
}

function initMobileNav(): void {
  const toggle = document.querySelector<HTMLButtonElement>("[data-nav-toggle]");
  const menu = document.querySelector<HTMLElement>("[data-nav-menu-mobile]");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const isOpen = menu.getAttribute("data-open") === "true";
    menu.setAttribute("data-open", String(!isOpen));
    toggle.setAttribute("aria-expanded", String(!isOpen));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.setAttribute("data-open", "false");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

interface PaletteItem {
  label: string;
  category: string;
  href: string;
}

const PALETTE_ITEMS: PaletteItem[] = [
  { label: "Home", category: "Page", href: "index.html" },
  { label: "Selected work", category: "Section", href: "index.html#work" },
  { label: "About", category: "Page", href: "about.html" },
  { label: "Contact", category: "Section", href: "index.html#contact" },
  { label: "Kinema Film Festival", category: "Branding", href: "work/kinema.html" },
  { label: "Undertow Records", category: "Poster series", href: "work/undertow.html" },
  { label: "Maren Skincare", category: "Packaging", href: "work/maren.html" },
  { label: "Signal Quarterly", category: "Editorial", href: "work/signal.html" },
];

// Site-root-relative hrefs above need adjusting when the current page already sits inside /work/,
// since the whole site is deployed with relative asset paths (works at any subpath, any domain).
function resolveSiteHref(href: string): string {
  const inWorkDir = /\/work\//.test(location.pathname);
  if (!inWorkDir) return href;
  return href.startsWith("work/") ? href.slice("work/".length) : `../${href}`;
}

function initCommandPalette(): void {
  const root = document.querySelector<HTMLElement>("[data-command-palette]");
  const trigger = document.querySelector<HTMLElement>("[data-command-trigger]");
  const input = document.querySelector<HTMLInputElement>("[data-command-input]");
  const list = document.querySelector<HTMLElement>("[data-command-list]");
  const backdrop = document.querySelector<HTMLElement>("[data-command-backdrop]");
  const main = document.querySelector<HTMLElement>("main");
  if (!root || !trigger || !input || !list) return;

  const items = PALETTE_ITEMS.map((item) => ({ ...item, href: resolveSiteHref(item.href) }));
  let activeIndex = 0;
  let filtered = items;

  const render = () => {
    list.innerHTML = filtered.length
      ? filtered
          .map(
            (item, i) => `
            <li>
              <a href="${item.href}" class="command-palette__item${i === activeIndex ? " is-active" : ""}" data-index="${i}">
                <span>${item.label}</span>
                <span class="command-palette__category">${item.category}</span>
              </a>
            </li>`
          )
          .join("")
      : `<li class="command-palette__empty">No matches.</li>`;
  };

  const isOpen = () => !root.hidden;

  const open = () => {
    root.hidden = false;
    root.setAttribute("aria-hidden", "false");
    if (main) main.inert = true;
    lockScroll(true);
    input.value = "";
    filtered = items;
    activeIndex = 0;
    render();
    window.setTimeout(() => input.focus(), 10);
  };

  const close = () => {
    root.hidden = true;
    root.setAttribute("aria-hidden", "true");
    if (main) main.inert = false;
    lockScroll(false);
    trigger.focus();
  };

  trigger.addEventListener("click", open);
  backdrop?.addEventListener("click", close);

  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      isOpen() ? close() : open();
      return;
    }
    if (!isOpen()) return;
    if (e.key === "Escape") {
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, filtered.length - 1);
      render();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      render();
    } else if (e.key === "Enter") {
      const target = filtered[activeIndex];
      if (target) window.location.href = target.href;
    }
  });

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    filtered = items.filter(
      (item) => item.label.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
    );
    activeIndex = 0;
    render();
  });
}

function initCompareSliders(): void {
  const sliders = document.querySelectorAll<HTMLElement>("[data-compare]");
  sliders.forEach((slider) => {
    const handle = slider.querySelector<HTMLElement>(".compare__handle");
    if (!handle) return;

    const setPosition = (clientX: number) => {
      const rect = slider.getBoundingClientRect();
      const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
      slider.style.setProperty("--compare-pos", `${pct}%`);
    };

    let dragging = false;
    handle.addEventListener("pointerdown", (e) => {
      dragging = true;
      handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener("pointermove", (e) => {
      if (dragging) setPosition(e.clientX);
    });
    handle.addEventListener("pointerup", () => {
      dragging = false;
    });
    handle.addEventListener("keydown", (e) => {
      const rect = slider.getBoundingClientRect();
      const current = parseFloat(slider.style.getPropertyValue("--compare-pos") || "50");
      if (e.key === "ArrowLeft") setPosition(rect.left + (rect.width * Math.max(0, current - 5)) / 100);
      if (e.key === "ArrowRight") setPosition(rect.left + (rect.width * Math.min(100, current + 5)) / 100);
    });
  });
}

function initPrintButton(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>("[data-print]");
  buttons.forEach((btn) => btn.addEventListener("click", () => window.print()));
}

function initYear(): void {
  const el = document.querySelector<HTMLElement>("[data-year]");
  if (el) el.textContent = String(new Date().getFullYear());
}

/** Lightweight 2D stand-in for a WebGL hero background: a halftone dot field that
 * brightens near the pointer. Print-halftone is an on-brand motif for a graphic
 * designer, and a 2D canvas is a fraction of the cost of a real Three.js scene. */
function initHeroCanvas(): void {
  const canvas = document.querySelector<HTMLCanvasElement>("[data-hero-canvas]");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const section = canvas.closest("section") ?? canvas;
  const spacing = 26;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0;
  let height = 0;
  let time = 0;
  let rafId = 0;
  const pointer = { x: -9999, y: -9999 };

  const resize = () => {
    const rect = section.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const drawFrame = () => {
    ctx.clearRect(0, 0, width, height);
    for (let y = spacing / 2; y < height; y += spacing) {
      for (let x = spacing / 2; x < width; x += spacing) {
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const proximity = Math.max(0, 1 - dist / 160);
        const pulse = (Math.sin(time + x * 0.012 + y * 0.012) + 1) / 2;
        const radius = 1 + pulse * 0.6 + proximity * 2.4;
        const alpha = Math.min(0.08 + pulse * 0.08 + proximity * 0.55, 0.9);
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle =
          proximity > 0.12 ? `rgba(232, 85, 46, ${alpha})` : `rgba(239, 237, 230, ${Math.min(alpha, 0.35)})`;
        ctx.fill();
      }
    }
  };

  const loop = () => {
    time += 0.015;
    drawFrame();
    rafId = window.requestAnimationFrame(loop);
  };

  const start = () => {
    if (!rafId) loop();
  };
  const stop = () => {
    window.cancelAnimationFrame(rafId);
    rafId = 0;
  };

  resize();
  window.addEventListener("resize", resize);

  if (reduceMotion) {
    drawFrame();
    return;
  }

  window.addEventListener("pointermove", (e) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
  });
  window.addEventListener("pointerleave", () => {
    pointer.x = -9999;
    pointer.y = -9999;
  });

  new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) start();
      else stop();
    },
    { threshold: 0 }
  ).observe(section);

  start();
}

function initIntro(): void {
  const preloader = document.querySelector<HTMLElement>("[data-preloader]");
  const heroWords = document.querySelectorAll<HTMLElement>("[data-hero-title] .split-word");
  const heroSub = document.querySelector<HTMLElement>("[data-hero-sub]");
  const heroCtas = document.querySelector<HTMLElement>("[data-hero-ctas]");
  const scrambleEl = document.querySelector<HTMLElement>("[data-scramble]");

  const revealHero = () => {
    if (scrambleEl) {
      const final = scrambleEl.dataset.scrambleText ?? scrambleEl.textContent ?? "";
      scrambleIn(scrambleEl, final);
    }

    if (reduceMotion || !heroWords.length) {
      heroWords.forEach((w) => {
        w.style.opacity = "1";
        w.style.transform = "none";
      });
      if (heroSub) {
        heroSub.style.opacity = "1";
        heroSub.style.transform = "none";
      }
      if (heroCtas) {
        heroCtas.style.opacity = "1";
        heroCtas.style.transform = "none";
      }
      return;
    }

    gsap.set(heroWords, { opacity: 0, yPercent: 110 });
    gsap.set([heroSub, heroCtas].filter(Boolean) as HTMLElement[], { opacity: 0, y: 24 });
    gsap
      .timeline({ defaults: { ease: "power3.out" } })
      .to(heroWords, { opacity: 1, yPercent: 0, duration: 0.7, stagger: 0.06 })
      .to(heroSub, { opacity: 1, y: 0, duration: 0.6 }, "-=0.4")
      .to(heroCtas, { opacity: 1, y: 0, duration: 0.6 }, "-=0.4");
  };

  if (!preloader || reduceMotion) {
    if (preloader) preloader.style.display = "none";
    revealHero();
    return;
  }

  const mark = preloader.querySelector<HTMLElement>(".preloader-mark span");
  const tl = gsap.timeline({
    onComplete: () => {
      preloader.style.display = "none";
      revealHero();
    },
  });

  if (mark) {
    tl.from(mark, { yPercent: 110, duration: 0.55, ease: "power3.out" })
      .to(mark, { yPercent: -110, duration: 0.45, ease: "power3.in", delay: 0.2 })
      .to(preloader, { yPercent: -100, duration: 0.55, ease: "power3.inOut" }, "-=0.05");
  } else {
    tl.to(preloader, { opacity: 0, duration: 0.4 });
  }

  // Hard fail-open: a stalled timeline never blocks the page.
  window.setTimeout(() => {
    if (preloader.style.display !== "none") {
      tl.kill();
      preloader.style.display = "none";
      revealHero();
    }
  }, 2500);
}

initSmoothScroll();
initIntro();
initReveal();
initHeadlineSplits();
initQuoteSweep();
initTileGlow();
initMagnetic();
initTilt();
initScrollProgress();
initCapabilitiesPan();
initHeroCanvas();
initWorkFilter();
initMobileNav();
initCommandPalette();
initCompareSliders();
initPrintButton();
initYear();
