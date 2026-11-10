(function () {
  var KEY = "animal_theme";
  var saved = null;
  try { saved = localStorage.getItem(KEY) || localStorage.getItem("math_theme") || sessionStorage.getItem(KEY); } catch (e) { }
  var theme = saved || "light";
  document.documentElement.setAttribute("data-theme", theme);
  window.__setTheme = function (t) {
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem(KEY, t); localStorage.setItem("math_theme", t); sessionStorage.setItem(KEY, t); } catch (e) { }
  };
  window.addEventListener("DOMContentLoaded", function () {
    var host = document.createElement("div");
    host.className = "theme-switch";
    host.style.cssText = "position:fixed;right:12px;bottom:12px;z-index:99;display:flex;gap:6px";
    var btns = [];
    [["light", "浅色"], ["sepia", "护眼"], ["dark", "深色"]].forEach(function (o) {
      var b = document.createElement("button");
      b.textContent = o[1];
      b.className = "navbtn";
      b.setAttribute("data-theme-btn", o[0]);
      if (theme === o[0]) b.classList.add("on");
      b.style.cssText = "padding:5px 10px;font-size:12px;opacity:.9";
      b.onclick = function () {
        window.__setTheme(o[0]);
        btns.forEach(function (x) { x.classList.toggle("on", x.getAttribute("data-theme-btn") === o[0]); });
      };
      btns.push(b);
      host.appendChild(b);
    });
    document.body.appendChild(host);
  });
})();
