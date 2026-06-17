/* Apollo Cars Hagenow — minimales Vanilla-JS
   Mobiles Menü, aktiver Navigationszustand, Footer-Jahr.
   Sanftes Scrollen + Sticky-Offset werden in CSS gelöst. */
(function () {
  "use strict";

  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("primaryNav");

  /* ---- Mobiles Menü (Burger) ---- */
  function openMenu() {
    nav.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Menü schließen");
  }
  function closeMenu() {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Menü öffnen");
  }
  function isOpen() {
    return nav.classList.contains("is-open");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      isOpen() ? closeMenu() : openMenu();
    });

    // Klick auf einen Menüpunkt schließt das mobile Menü
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a") && isOpen()) closeMenu();
    });

    // Escape schließt das Menü
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) {
        closeMenu();
        toggle.focus();
      }
    });

    // Klick außerhalb schließt das Menü
    document.addEventListener("click", function (e) {
      if (isOpen() && !nav.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    // Beim Wechsel auf Desktop-Breite zurücksetzen
    var mq = window.matchMedia("(min-width: 900px)");
    (mq.addEventListener ? mq.addEventListener.bind(mq, "change") : mq.addListener.bind(mq))(function () {
      if (mq.matches) closeMenu();
    });
  }

  /* ---- Aktiver Navigationspunkt beim Scrollen ---- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav-list .nav-link"));
  var map = {};
  links.forEach(function (link) {
    var id = (link.getAttribute("href") || "").replace("#", "");
    var section = id && document.getElementById(id);
    if (section) map[id] = link;
  });

  var sections = Object.keys(map).map(function (id) { return document.getElementById(id); });

  if ("IntersectionObserver" in window && sections.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          links.forEach(function (l) { l.classList.remove("is-active"); });
          var active = map[entry.target.id];
          if (active) active.classList.add("is-active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ---- Aktuelles Jahr im Footer ---- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
