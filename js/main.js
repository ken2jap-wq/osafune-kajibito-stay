// OSAFUNE KAJIBITO STAY（仮称） — 共通スクリプト
(function () {
  'use strict';

  // 写真枠: --img に指定した画像が実在すれば .has-img を付けてプレースホルダ表記を消す
  document.querySelectorAll('.photo').forEach(function (el) {
    var m = (el.getAttribute('style') || '').match(/url\(([^)]+)\)/);
    if (!m) return;
    var img = new Image();
    // CSS変数内の url() はスタイルシート基準で解決されるため、読み込めた絶対URLを直接指定する
    img.onload = function () {
      el.style.backgroundImage = 'url("' + img.src + '")';
      el.classList.add('has-img');
    };
    img.src = m[1].replace(/['"]/g, '');
  });

  // スクロールでフェードイン
  var fades = document.querySelectorAll('.fade');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    fades.forEach(function (el) { io.observe(el); });
  } else {
    fades.forEach(function (el) { el.classList.add('is-in'); });
  }

  // ドロワー: リンクを押したら閉じる
  var check = document.getElementById('drawerCheck');
  document.querySelectorAll('.drawer-menu a').forEach(function (a) {
    a.addEventListener('click', function () { if (check) check.checked = false; });
  });

  // ヒーロー: 鍛錬の火花（写真・動画が入るまでの仮演出。動画を入れたら canvas ごと削除可）
  var canvas = document.getElementById('sparks');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var W, H, dpr, sparks = [];
    var resize = function () {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // 鎚が落ちるたびに火花が一斉に散る
    var burst = function (n) {
      var cx = W * 0.5, cy = H * 0.86;
      for (var i = 0; i < n; i++) {
        var a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.15;
        var v = 2 + Math.random() * 9;
        sparks.push({
          x: cx + (Math.random() - 0.5) * 40, y: cy,
          vx: Math.cos(a) * v, vy: Math.sin(a) * v,
          life: 1, decay: 0.006 + Math.random() * 0.016,
          w: 0.6 + Math.random() * 1.6
        });
      }
    };
    var t = 0;
    // 火床の光
    var glow = function (strength) {
      var g = ctx.createRadialGradient(W * 0.5, H * 0.9, 0, W * 0.5, H * 0.9, H * 0.55);
      g.addColorStop(0, 'rgba(255,140,60,' + strength + ')');
      g.addColorStop(1, 'rgba(255,90,20,0)');
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    };
    var step = function (drawGlow) {
      t++;
      if (t % 70 === 0) burst(90 + (Math.random() * 60 | 0));
      if (Math.random() < 0.35) burst(1);
      if (drawGlow) {
        ctx.clearRect(0, 0, W, H);
        glow(0.22 + 0.08 * Math.max(0, 1 - (t % 70) / 18));
      }
      ctx.globalCompositeOperation = 'lighter';
      for (var i = sparks.length - 1; i >= 0; i--) {
        var s = sparks[i];
        var px = s.x, py = s.y;
        s.vy += 0.09; s.vx *= 0.995; s.x += s.vx; s.y += s.vy; s.life -= s.decay;
        if (s.life <= 0 || s.y > H + 20) { sparks.splice(i, 1); continue; }
        ctx.strokeStyle = 'rgba(255,' + (110 + 120 * s.life | 0) + ',' + (30 + 90 * s.life | 0) + ',' + s.life + ')';
        ctx.lineWidth = s.w;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(s.x, s.y); ctx.stroke();
      }
    };
    var loop = function () { step(true); requestAnimationFrame(loop); };
    burst(120);
    if (reduced) {
      // 動きを抑える設定の方には、火花が散った瞬間の静止画を一枚だけ描く
      ctx.clearRect(0, 0, W, H);
      glow(0.28);
      for (var k = 0; k < 18; k++) step(false);
    } else {
      loop();
    }
  }

  // 申込フォーム（送信先が決まるまでの仮動作）
  var form = document.getElementById('entryForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = document.getElementById('formMsg');
      if (!form.checkValidity()) { form.reportValidity(); return; }
      msg.textContent = 'ありがとうございます。担当より3営業日以内にご連絡いたします。（※現在はデモ表示です。送信先は未設定）';
    });
  }
})();
