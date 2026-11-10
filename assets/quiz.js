(function () {
  var P = window.PAPERS || [];
  var qs = new URLSearchParams(location.search);
  var pid = qs.get("p") || "p1";
  var paper = P.filter(function (x) { return x.id === pid; })[0] || { id: pid, title: pid, pages: 0 };
  var host = document.getElementById("qhost"), stat = document.getElementById("qstat");
  var title = document.getElementById("qtitle"), meta = document.getElementById("qmeta");
  var store = jget("quiz_" + pid, {}), exam = null;

  function jget(n, d) { try { return JSON.parse(localStorage.getItem("animal_" + n)) || d; } catch (e) { return d; } }
  function jset(n, v) { try { localStorage.setItem("animal_" + n, JSON.stringify(v)); } catch (e) { } }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function save() { jset("quiz_" + pid, store); }
  function key(si, n) { return si + ":" + n; }
  function isJudge(a) { return a === "√" || a === "×" || a === "对" || a === "错"; }
  function isLetter(a) { return /^[A-Ea-e]$/.test(String(a || "").trim()); }
  function isChoice(s) { return /选择/.test(s.type); }
  function isJudgeSec(s) { return /判断/.test(s.type); }
  function isFill(s) { return /填空/.test(s.type); }

  document.getElementById("qwrong").onclick = function () {
    var w = document.getElementById("wrongbook");
    if (w) w.scrollIntoView({ behavior: "smooth", block: "start" });
    else alert("暂无错题，继续加油！");
  };
  document.getElementById("qreset").onclick = function () {
    if (!confirm("清空本试卷的全部作答记录，重新做？")) return;
    store = {}; save(); render();
  };

  function answerText(it) {
    var a = it.a;
    if (a === "√" || a === "对") return "正确 ✓";
    if (a === "×" || a === "错") return "错误 ✗";
    return a || "（原卷未提供答案，请对照原卷）";
  }
  function secStats(s, si) {
    var got = 0, max = 0, wrong = 0, ans = 0;
    s.items.forEach(function (it) {
      max += s.score;
      var st = store[key(si, it.n)];
      if (st && (st.pick != null || st.done)) { ans++; if (st.ok) got += s.score; else wrong++; }
    });
    return { got: got, max: max, wrong: wrong, ans: ans };
  }
  function allStats() {
    var o = { got: 0, max: 0, wrong: 0, ans: 0, total: 0 };
    (exam ? exam.sections : []).forEach(function (s, si) {
      var x = secStats(s, si);
      o.got += x.got; o.max += x.max; o.wrong += x.wrong; o.ans += x.ans; o.total += s.items.length;
    });
    return o;
  }
  function updateStat() {
    var o = allStats();
    stat.textContent = "得分 " + o.got + "/" + o.max + " · 已答 " + o.ans + "/" + o.total + " · 错题 " + o.wrong;
    var wb = document.getElementById("qwrong");
    if (wb) wb.textContent = "📕 错题本 " + o.wrong;
  }

  function markCard(card, s, it, st) {
    var auto = null;
    if (isChoice(s)) auto = isLetter(it.a) ? "choice" : null;
    else if (isJudgeSec(s)) auto = isJudge(it.a) ? "judge" : null;
    if (!auto || !st) return;
    Array.prototype.forEach.call(card.querySelectorAll(".qopt"), function (b) {
      var v = b.getAttribute("data-opt");
      b.classList.add("locked");
      if (auto === "choice") {
        if (v === String(it.a).trim().toUpperCase()) b.classList.add("right");
        if (st.pick === v && v !== String(it.a).trim().toUpperCase()) b.classList.add("wrong");
      } else {
        if (v === it.a) b.classList.add("right");
        if (st.pick === v && v !== it.a) b.classList.add("wrong");
      }
    });
  }

  function reveal(card) {
    var a = card.querySelector(".qans"), g = card.querySelector(".qgrade"), b = card.querySelector("[data-show]");
    if (a) a.hidden = false;
    if (g) g.hidden = false;
    if (b) { b.disabled = true; b.textContent = "已显示答案"; }
  }

  function card(s, si, it) {
    var st = store[key(si, it.n)] || {};
    var k = "q" + si + "-" + it.n;
    var auto = isChoice(s) ? (isLetter(it.a) ? "choice" : null) : (isJudgeSec(s) ? (isJudge(it.a) ? "judge" : null) : null);
    var h = '<div class="qcard" id="' + k + '"><div class="qhead"><b>' + it.n + '.</b><span class="chip">' + esc(s.type) + " · " + s.score + " 分</span></div>" +
      '<div class="qstem">' + esc(it.q) + "</div>";
    if (isChoice(s) && it.options && it.options.length) {
      h += '<div class="qopts">';
      it.options.forEach(function (o, i) {
        var L = String.fromCharCode(65 + i);
        if (auto) h += '<button class="qopt" data-opt="' + L + '">' + L + ". " + esc(o) + "</button>";
        else h += '<div class="qopt locked">' + L + ". " + esc(o) + "</div>";
      });
      h += "</div>";
    } else if (isJudgeSec(s) && auto) {
      h += '<div class="qopts"><button class="qopt" data-opt="√">✓ 正确</button><button class="qopt" data-opt="×">✗ 错误</button></div>';
    } else if (isFill(s)) {
      h += '<input class="qinput" data-fill value="' + esc(st.text || "") + '" placeholder="填写答案（多个空用；分隔）">';
    }
    if (!auto) h += '<div class="navrow qredo"><button class="btn ghost" data-show>显示答案</button></div>';
    var at = it.a;
    if (at === "√" || at === "对") at = "正确 ✓";
    else if (at === "×" || at === "错") at = "错误 ✗";
    h += '<div class="qans" hidden><b>答案：</b><div class="qatext">' + esc(at || "（原卷未提供答案，请对照原卷）") + "</div>" +
      (it.e ? '<div class="qexp"><b>解析：</b>' + esc(it.e) + "</div>" : "") + "</div>";
    if (!auto) {
      h += '<div class="qgrade" hidden><span class="chip">自评</span><button class="btn ghost" data-grade="ok">✓ 我答对了</button><button class="btn ghost" data-grade="no">✗ 我答错了</button></div>';
    }
    h += "</div>";
    return h;
  }

  function render() {
    if (!exam) return;
    title.textContent = exam.title;
    meta.textContent = paper.title + " ｜ 共 " + exam.sections.reduce(function (a, s) { return a + s.items.length; }, 0) + " 题 ｜ 答案与解析来自原卷";
    var wrong = [];
    exam.sections.forEach(function (s, si) {
      s.items.forEach(function (it) {
        var st = store[key(si, it.n)];
        if (st && (st.pick != null || st.done) && !st.ok) wrong.push({ s: s, si: si, it: it });
      });
    });
    var wrongHtml = "";
    if (wrong.length) {
      wrongHtml = '<section class="qsec pcard wrongbook" id="wrongbook"><h2>📕 错题本 <span class="chip">' + wrong.length + ' 题</span></h2>' +
        wrong.map(function (o) {
          var k = o.si + ":" + o.it.n;
          return '<div class="witem"><div><b>' + esc(o.s.type) + " · 第 " + o.it.n + ' 题</b><div class="wq">' +
            esc(o.it.q.slice(0, 90)) + '…</div><div class="wa">答案：' + esc(answerText(o.it)) +
            '</div></div><button class="btn ghost" data-redo="' + k + '">🔄 重做这道题</button></div>';
        }).join("") + "</section>";
    }
    host.innerHTML = wrongHtml + exam.sections.map(function (s, si) {
      var cs = secStats(s, si);
      return '<section class="qsec pcard"><h2>' + esc(s.type) + ' <span class="chip">每题 ' + s.score + ' 分</span>' +
        '<span class="chip">本节 ' + cs.got + "/" + cs.max + " · 错题 " + cs.wrong + '</span></h2>' +
        s.items.map(function (it) { return card(s, si, it); }).join("") + "</section>";
    }).join("");
    bind();
    updateStat();
  }

  function rerender() {
    var y = window.scrollY;
    render();
    window.scrollTo(0, y);
  }

  function bind() {
    Array.prototype.forEach.call(host.querySelectorAll(".qcard"), function (c) {
      var id = c.id.slice(1), parts = id.split("-"), si = +parts[0], n = +parts[1];
      var s = exam.sections[si], it = s.items.filter(function (x) { return x.n === n; })[0];
      var k = key(si, n), st = store[k] || {};
      var auto = isChoice(s) ? (isLetter(it.a) ? "choice" : null) : (isJudgeSec(s) ? (isJudge(it.a) ? "judge" : null) : null);
      if (auto) {
        Array.prototype.forEach.call(c.querySelectorAll(".qopt"), function (b) {
          b.onclick = function () {
            if (store[k] && store[k].pick != null) return;
            var v = b.getAttribute("data-opt");
            store[k] = { pick: v, ok: auto === "choice" ? v === String(it.a).trim().toUpperCase() : v === it.a };
            save(); rerender();
          };
        });
        if (st.pick != null) { markCard(c, s, it, st); reveal(c); }
      } else {
        var input = c.querySelector("[data-fill]");
        if (input) input.oninput = function () { store[k] = store[k] || {}; store[k].text = input.value; save(); };
        var show = c.querySelector("[data-show]");
        if (show) show.onclick = function () { reveal(c); };
        Array.prototype.forEach.call(c.querySelectorAll("[data-grade]"), function (b) {
          b.onclick = function () {
            if (store[k] && store[k].done) return;
            var ok = b.getAttribute("data-grade") === "ok";
            store[k] = { done: true, ok: ok, text: (store[k] && store[k].text) || "" }; save();
            rerender();
          };
        });
        if (st.done) {
          reveal(c);
          var okb = c.querySelector('[data-grade="ok"]'), nob = c.querySelector('[data-grade="no"]');
          if (st.ok && okb) okb.classList.add("on");
          if (!st.ok && nob) nob.classList.add("wrong");
          Array.prototype.forEach.call(c.querySelectorAll("[data-grade]"), function (x) { x.disabled = true; });
        }
      }
      var rb = document.createElement("button");
      rb.className = "btn ghost qredo";
      rb.textContent = "🔄 重做本题";
      rb.onclick = function () { delete store[k]; save(); render(); };
      c.appendChild(rb);
    });
    Array.prototype.forEach.call(host.querySelectorAll("[data-redo]"), function (b) {
      b.onclick = function () {
        var p = b.getAttribute("data-redo").split(":"), si = +p[0], n = +p[1];
        delete store[key(si, n)]; save(); render();
        setTimeout(function () {
          var el = document.getElementById("q" + si + "-" + n);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 60);
      };
    });
  }

  var sc = document.createElement("script");
  sc.src = "data/exam-" + pid + ".js?v=20261110d";
  sc.onload = function () {
    exam = window.EXAMS && window.EXAMS[pid];
    if (!exam) { host.innerHTML = '<p class="notice">未找到逐题数据。</p>'; return; }
    render();
  };
  sc.onerror = function () { host.innerHTML = '<p class="notice">逐题数据加载失败。</p>'; };
  document.head.appendChild(sc);
})();
