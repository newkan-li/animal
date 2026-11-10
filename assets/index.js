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
      "<p>" + p.pages + " 页 · 原卷可放大 / 下载 · 文字版可复制</p>" +
      '<div class="pact"><a class="btn" href="paper.html?p=' + p.id + '">查看原卷 →</a>' +
      '<a class="btn ghost" href="paper.html?p=' + p.id + '&mode=text">文字版</a>' +
      '<a class="btn ghost" href="quiz.html?p=' + p.id + '">逐题版</a></div>';
    host.appendChild(s);
  });
})();
