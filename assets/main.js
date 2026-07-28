(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduce) {
    document.querySelectorAll(".case").forEach((el) => el.classList.add("is-visible"));
    document.querySelector(".method-steps")?.classList.add("is-drawn");
    return;
  }

  const cases = document.querySelectorAll(".case");
  if (cases.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    cases.forEach((el) => io.observe(el));
  } else {
    cases.forEach((el) => el.classList.add("is-visible"));
  }

  const method = document.querySelector(".method-steps");
  if (method && "IntersectionObserver" in window) {
    const mio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-drawn");
            mio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );
    mio.observe(method);
  } else if (method) {
    method.classList.add("is-drawn");
  }
})();
