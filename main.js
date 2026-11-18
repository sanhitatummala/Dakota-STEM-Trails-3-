/* =========================================================
   Dakota STEM Trails — interactions & animations
   ========================================================= */
(function () {
  "use strict";

  var doc = document.documentElement;
  var body = document.body;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var curtain = document.querySelector(".page-curtain");

  /* ---------- Split headlines into animated words ---------- */
  document.querySelectorAll("[data-split]").forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.setAttribute("aria-label", el.textContent.trim());
    el.innerHTML = words
      .map(function (w, i) {
        return '<span class="w" aria-hidden="true"><span style="--i:' + i + '">' + w + "</span></span>";
      })
      .join(" ");
    el.classList.add("split");
  });

  /* ---------- Intro: lift the curtain ---------- */
  function intro() {
    if (curtain) curtain.classList.add("is-out");
    body.classList.add("loaded");
    setTimeout(startReveals, reduceMotion ? 0 : 380);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(intro, 120); });
  } else {
    setTimeout(intro, 120);
  }

  // Coming back via the browser back button (bfcache): reset curtain
  window.addEventListener("pageshow", function (e) {
    if (e.persisted && curtain) {
      curtain.classList.remove("is-in");
      curtain.classList.add("is-out");
    }
  });

  /* ---------- Page transitions on internal links ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (!a || reduceMotion || !curtain) return;
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#" || a.target === "_blank" || a.hasAttribute("download")) return;
    if (/^(mailto:|tel:|https?:)/i.test(href)) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    // same page link -> just scroll top
    var current = location.pathname.split("/").pop() || "index.html";
    if (href === current) { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); closeNav(); return; }
    // Let the browser follow the link normally (so links ALWAYS work),
    // and just play the curtain animation while the next page loads.
    curtain.classList.remove("is-out");
    curtain.classList.add("is-in");
    // Safety net: if for any reason the page doesn't change, lift the curtain again.
    setTimeout(function () {
      curtain.classList.remove("is-in");
      curtain.classList.add("is-out");
    }, 1800);
  });

  /* ---------- Reveal on scroll ---------- */
  function finishReveal(el) {
    // Clean up so hover / tilt transforms work freely afterwards
    setTimeout(function () {
      el.removeAttribute("data-reveal");
      el.style.removeProperty("--d");
    }, 1900 + (parseFloat(el.style.getPropertyValue("--d")) || 0) * 1000);
  }

  function startReveals() {
    // auto-stagger children of [data-stagger]
    document.querySelectorAll("[data-stagger]").forEach(function (group) {
      var step = parseFloat(group.getAttribute("data-stagger")) || 0.12;
      group.querySelectorAll(":scope > [data-reveal]").forEach(function (child, i) {
        if (!child.style.getPropertyValue("--d")) child.style.setProperty("--d", (i * step).toFixed(2) + "s");
      });
    });

    var targets = document.querySelectorAll("[data-reveal], .split");
    if (!("IntersectionObserver" in window) || reduceMotion) {
      targets.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add("is-visible");
        if (el.hasAttribute("data-reveal")) finishReveal(el);
        io.unobserve(el);
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Header state + scroll progress + parallax ---------- */
  var header = document.querySelector(".site-header");
  var progress = document.querySelector(".scroll-progress");
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("scrolled", y > 24);
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
    }
    if (!reduceMotion) {
      var vh = window.innerHeight;
      parallaxEls.forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        var speed = parseFloat(el.getAttribute("data-parallax")) || 0.08;
        var offset = (r.top + r.height / 2 - vh / 2) * -speed;
        el.style.transform = "translate3d(0," + offset.toFixed(1) + "px,0)";
      });
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  function closeNav() {
    if (!header) return;
    header.classList.remove("nav-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = header.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });
  }

  /* ---------- Back to top ---------- */
  document.querySelectorAll("[data-to-top]").forEach(function (btn) {
    btn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }); });
  });

  /* ---------- 3D tilt cards ---------- */
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll("[data-tilt]").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        if (card.hasAttribute("data-reveal")) return;
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty("--ry", (px * 8).toFixed(2) + "deg");
        card.style.setProperty("--rx", (py * -8).toFixed(2) + "deg");
      });
      card.addEventListener("mouseleave", function () {
        card.style.setProperty("--ry", "0deg");
        card.style.setProperty("--rx", "0deg");
      });
    });
  }

  /* ---------- Contact form (FormSubmit AJAX) ---------- */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    var status = form.querySelector(".form-status");
    var submit = form.querySelector(".btn-submit");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (form.querySelector('[name="_honey"]').value) return; // bot
      submit.classList.add("is-loading");
      submit.disabled = true;
      status.className = "form-status";

      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });

      fetch(form.getAttribute("data-endpoint"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data)
      })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res && (res.success === true || res.success === "true")) {
            status.textContent = "Thank you for reaching out! We'll get back to you soon.";
            status.className = "form-status show success";
            form.reset();
          } else { throw new Error("failed"); }
        })
        .catch(function () {
          status.innerHTML = 'Sorry, something went wrong. Please email us directly at <a href="mailto:dakotastemtrails@gmail.com"><u>dakotastemtrails@gmail.com</u></a>.';
          status.className = "form-status show error";
        })
        .finally(function () {
          submit.classList.remove("is-loading");
          submit.disabled = false;
        });
    });
  }
})();
