(function () {
  var P = window.PAPERS || [];
  var qs = new URLSearchParams(location.search);
  var id = qs.get("p") || (P[0] && P[0].id);
  var paper = P.filter(function (x) { return x.id === id; })[0];
  if (!paper) { document.getElementById("ptitle").textContent = "未找到试卷"; return; }
  document.title = paper.title + " · 生理学试卷库";
  document.getElementById("ptitle").textContent = paper.title;
  document.getElementById("pmeta").textContent = paper.note + " ｜ 共 " + paper.pages + " 页";

  var page = parseInt(localStorage.getItem("animal_pg_" + id), 10) || 1;
  if (page < 1 || page > paper.pages) page = 1;
  var mode = qs.get("mode") === "text" ? "text" : "img";
  var textLoaded = false;

  var pimg = document.getElementById("pimg"), viewer = document.getElementById("viewer");
  var ptext = document.getElementById("ptext"), pnum = document.getElementById("pnum");
  var prev = document.getElementById("prev"), next = document.getElementById("next");
  var zoom = document.getElementById("zoom"), textbtn = document.getElementById("textbtn");
  var dl = document.getElementById("dl"), printBtn = document.getElementById("print");

  dl.href = paper.pdf; dl.setAttribute("download", paper.id + ".pdf");
  var qlink = document.getElementById("qlink"); if (qlink) qlink.href = "quiz.html?p=" + paper.id;
  printBtn.onclick = function () { window.open(paper.pdf, "_blank"); };

  function imgSrc(n) { return paper.dir + "/p-" + String(n).padStart(3, "0") + ".jpg"; }
  function preload(n) { if (n >= 1 && n <= paper.pages) { var i = new Image(); i.src = imgSrc(n); } }

  function applyZoom() {
    pimg.style.width = zoom.value === "100" ? "100%" : zoom.value + "%";
  }

  function showImg() {
    mode = "img";
    viewer.hidden = false; ptext.hidden = true;
    textbtn.textContent = "文字版"; zoom.disabled = false;
    pnum.textContent = "第 " + page + " / " + paper.pages + " 页";
    prev.disabled = page <= 1; next.disabled = page >= paper.pages;
    pimg.src = imgSrc(page);
    applyZoom();
    localStorage.setItem("animal_pg_" + id, page);
    preload(page + 1); preload(page - 1);
  }

  function showText() {
    mode = "text";
    viewer.hidden = true; ptext.hidden = false;
    textbtn.textContent = "原卷"; zoom.disabled = true;
    pnum.textContent = "文字版 · " + paper.pages + " 页";
    prev.disabled = true; next.disabled = true;
    if (textLoaded) return;
    textLoaded = true;
    ptext.textContent = "文字版加载中…";
    fetch(paper.text).then(function (r) { return r.text(); }).then(function (t) {
      ptext.textContent = t;
    }).catch(function () { ptext.textContent = "文字版加载失败，请查看原卷。"; });
  }

  prev.onclick = function () { if (page > 1) { page--; showImg(); } };
  next.onclick = function () { if (page < paper.pages) { page++; showImg(); } };
  zoom.onchange = applyZoom;
  textbtn.onclick = function () { if (mode === "img") showText(); else showImg(); };

  document.addEventListener("keydown", function (e) {
    if (mode !== "img") return;
    var t = e.target;
    if (t && /^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName)) return;
    if (e.key === "ArrowLeft") prev.click();
    if (e.key === "ArrowRight") next.click();
  });

  if (mode === "text") showText(); else showImg();
})();
