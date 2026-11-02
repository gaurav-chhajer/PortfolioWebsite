/* Merged-build additions: phone menu, share-link button, contact button label. */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var root = document.documentElement;
  var C = window.SITE_CONFIG || {};

  /* ---- Phone menu ------------------------------------------------------ */
  var nav = $("#nav"), btn = $("#menu-btn"), links = $("#nav-links");
  function setOpen(open) {
    if (!nav || !btn) return;
    nav.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Close menu" : "Menu");
  }
  if (btn && nav && links) {
    btn.addEventListener("click", function () { setOpen(!nav.classList.contains("is-open")); });
    links.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); btn.focus(); }
    });
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("is-open") && !nav.contains(e.target)) setOpen(false);
    });
    window.matchMedia("(min-width: 761px)").addEventListener("change", function (m) { if (m.matches) setOpen(false); });
  }

  /* ---- Copy link to this view ------------------------------------------ */
  var share = $("#share-view"), live = $("#live-status");
  if (share) {
    var label = share.textContent;
    share.addEventListener("click", function () {
      var url = location.href;
      try {
        var u = new URL(location.href);
        u.hash = ""; u.search = "";
        u.searchParams.set("for", root.getAttribute("data-mode") || "recruiter");
        url = u.toString();
      } catch (e) {}
      function done(msg) {
        share.textContent = msg; if (live) live.textContent = msg;
        setTimeout(function () { share.textContent = label; }, 2200);
      }
      try { navigator.clipboard.writeText(url).then(function () { done("Link copied"); }, function () { done(url); }); }
      catch (e) { done(url); }
    });
  }

  /* ---- Contact button says what it does -------------------------------- */
  var sendLabel = document.querySelector("[data-send-label]");
  if (sendLabel && C.formKey) sendLabel.textContent = "Send message";
})();
