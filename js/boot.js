/* Runs in <head> before first paint: picks the audience mode and flags JS so
   there is no flash of the wrong content. Kept as a file (not inline) so the
   Content-Security-Policy can forbid inline scripts. */
(function () {
  var d = document.documentElement, m = "recruiter";
  d.classList.add("js");
  try {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && !sessionStorage.getItem("gc-booted")) d.classList.add("is-booting");
  } catch (e) {}
  try {
    var q = new URLSearchParams(location.search).get("for");
    if (q === "client" || q === "recruiter") m = q;
    else { var s = localStorage.getItem("gc-mode"); if (s === "client" || s === "recruiter") m = s; }
  } catch (e) {}
  d.setAttribute("data-mode", m);
  setTimeout(function () { if (!window.__siteReady) d.classList.add("anim-failed"); }, 4000);
})();
