(function () {
  var host = document.getElementById("plist");
  if (!host) return;
  var P = window.PAPERS || [];
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  if (!P.length) { host.innerHTML = '<p class="notice">暂无试卷。</p>'; return; }
  P.forEach(function (p) {
    var s = document.createElement("section");
    s.className = "pcard";
    s.innerHTML = '<span class="ptag">' + esc(p.note) + "</span>" +
      "<h2>" + esc(p.title) + "</h2>" +
      "<p>" + p.pages + " 页 · 逐题练习 · 含答案与解析</p>" +
      '<div class="pact"><a class="btn" href="quiz.html?p=' + p.id + '">进入逐题版 →</a></div>';
    host.appendChild(s);
  });
})();
