(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const html = document.documentElement;
  html.classList.add("is-ready");

  /* Mobile nav with focus management */
  const toggle = document.getElementById("nav-toggle");
  const panel = document.getElementById("nav-panel");
  const backdrop = document.getElementById("nav-backdrop");

  const setNav = (open) => {
    if (!panel || !toggle) return;
    panel.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("nav-open", open);
    if (backdrop) backdrop.hidden = !open;
    if (open) {
      const first = panel.querySelector("a");
      first?.focus();
    } else {
      toggle.focus();
    }
  };

  toggle?.addEventListener("click", () => setNav(!panel.classList.contains("is-open")));
  backdrop?.addEventListener("click", () => setNav(false));
  panel?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setNav(false)));
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel?.classList.contains("is-open")) {
      setNav(false);
    }
  });

  /* Spine + scroll progress */
  const nav = document.querySelector(".site-nav");
  const spine = document.querySelector(".spine");
  const markers = [...document.querySelectorAll(".spine__marker")];
  const sections = [...document.querySelectorAll("[data-section]")];

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (spine) spine.style.setProperty("--spine-progress", String(p));
    nav?.classList.toggle("is-scrolled", window.scrollY > 8);

    let active = sections[0]?.dataset.section || "top";
    const y = window.scrollY + window.innerHeight * 0.28;
    for (const sec of sections) {
      if (sec.offsetTop <= y) active = sec.dataset.section;
    }
    markers.forEach((m) => {
      m.classList.toggle("is-active", m.dataset.spine === active);
    });
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  /* Case enter */
  const cases = [...document.querySelectorAll(".case")];
  if (reduce) {
    cases.forEach((el) => el.classList.add("is-visible", "is-drawn"));
  } else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible", "is-drawn");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }
    );
    cases.forEach((el) => io.observe(el));
  } else {
    cases.forEach((el) => el.classList.add("is-visible", "is-drawn"));
  }

  /* Case expand via dedicated toggle */
  const workList = document.getElementById("work-list");
  const syncCaseToggle = (caseEl, active) => {
    const btn = caseEl.querySelector(".case-toggle");
    if (!btn) return;
    btn.setAttribute("aria-expanded", String(active));
    btn.textContent = active ? "Collapse" : "Expand";
  };

  const focusCase = (caseEl, expand) => {
    const on = expand ?? !caseEl.classList.contains("is-focused");
    cases.forEach((c) => {
      const active = on && c === caseEl;
      c.classList.toggle("is-focused", active);
      syncCaseToggle(c, active);
    });
    workList?.classList.toggle("is-focusing", on);
    if (on && caseEl.id) history.replaceState(null, "", `#${caseEl.id}`);
    else if (!on && location.hash.startsWith("#work-")) history.replaceState(null, "", " ");
  };

  cases.forEach((caseEl) => {
    const btn = caseEl.querySelector(".case-toggle");
    btn?.addEventListener("click", (e) => {
      e.stopPropagation();
      focusCase(caseEl);
    });
  });

  if (location.hash.startsWith("#work-")) {
    const target = document.querySelector(location.hash);
    if (target?.classList.contains("case")) {
      target.classList.add("is-visible", "is-drawn");
      focusCase(target, true);
    }
  }

  /* Diagram scrub (hero + cases) — lights nodes and inbound edges */
  const scrubLive = document.getElementById("scrub-live");
  document.querySelectorAll(".diagram-scrub").forEach((scrub) => {
    const root = scrub.closest(".case-diagram, .hero-plane");
    const nodes = root?.querySelectorAll(".d-node") || [];
    const edges = root?.querySelectorAll(".d-edge, .d-loop") || [];
    const setStep = (step) => {
      scrub.querySelectorAll(".scrub-btn").forEach((btn) => {
        btn.classList.toggle("is-active", Number(btn.dataset.step) === step);
      });
      nodes.forEach((node) => {
        node.classList.toggle("is-active", Number(node.dataset.step) === step);
      });
      edges.forEach((edge) => {
        const edgeStep = edge.dataset.step;
        edge.classList.toggle("is-active", edgeStep !== undefined && Number(edgeStep) === step);
      });
      const activeBtn = scrub.querySelector(`.scrub-btn[data-step="${step}"]`);
      if (scrubLive && scrub.dataset.diagram === "intake-hero" && activeBtn) {
        scrubLive.textContent = `Step: ${activeBtn.textContent}`;
      }
    };
    scrub.querySelectorAll(".scrub-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        setStep(Number(btn.dataset.step));
      });
    });
    setStep(0);
  });

  /* Procedure ledger ↔ cases */
  document.querySelectorAll(".procedure-row").forEach((step) => {
    step.addEventListener("click", () => {
      const link = step.dataset.link;
      const pressed = step.getAttribute("aria-pressed") === "true";
      document.querySelectorAll(".procedure-row").forEach((s) => s.setAttribute("aria-pressed", "false"));
      cases.forEach((c) => c.classList.remove("is-linked"));
      if (pressed) return;
      step.setAttribute("aria-pressed", "true");
      const match = cases.find((c) => c.dataset.method === link);
      if (match) {
        match.classList.add("is-linked", "is-visible", "is-drawn");
        focusCase(match, true);
        match.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      }
    });
  });

  /* Timeline filter with aria-pressed + altitude plate sync */
  const timeline = document.getElementById("timeline");
  const scaleItems = [...document.querySelectorAll(".scale-item")];
  const altitudePlate = document.querySelector(".altitude-plate");
  const altitudeLayers = [...document.querySelectorAll(".altitude-layer")];

  const applyEra = (era) => {
    scaleItems.forEach((item) => {
      const eras = (item.dataset.era || "").split(/\s+/);
      item.classList.toggle("is-lit", era === "all" || eras.includes(era));
    });
    if (altitudePlate) {
      altitudePlate.classList.toggle("is-filtering", era !== "all");
      altitudeLayers.forEach((layer) => {
        const eras = (layer.dataset.era || "").split(/\s+/);
        layer.classList.toggle("is-lit", era === "all" || eras.includes(era));
      });
    }
  };

  timeline?.querySelectorAll(".timeline-year").forEach((btn) => {
    btn.addEventListener("click", () => {
      const era = btn.dataset.era;
      timeline.querySelectorAll(".timeline-year").forEach((b) => {
        const on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", String(on));
      });
      applyEra(era);
    });
  });
})();
