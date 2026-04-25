// ── LYRIC GROUPS ──
const GROUPS = [
  [17,  ["Girl you're the one", "You're the one"]],
  [20,  ["I think of all days", "I can't deny"]],
  [24,  ["Say you dey make man go crazy"]],
  [27,  ["And you're the one", "You're the one wey dey make me okay"]],
  [31,  ["I no dey lie", "I no dey lie"]],
  [36,  ["Even on the phone o", "Girl you make I go low"]],
  [41,  ["Your sweet talks and melos", "E dey make I go Low", "And I no fit to high"]],
  [49,  ["Cause you wey dey make me high oo"]],
  [52,  ["You dey for my heart o girl eer", "Nobody sweet like you my vanilla", "Sweet in her short nickas"]],
  [61,  ["She's called Helena with pretty face oo"]],
  [64,  ["Look into my eyes", "And bae tell me something nice"]],
  [69,  ["I Don shy I Don kpai", "Your love I can't deny"]],
  [75,  ["Be like you don't get it", "Be like you don't notice", "I dey for your notice"]],
  [80,  ["And you dey, you dey for my heart o"]],
  [84,  ["Be like you don't get it", "Be like you don't notice", "I dey for your notice"]],
  [89,  ["And you dey, you dey for my heart o"]],
  [93,  ["Girl you're the one", "You're the one"]],
  [95,  ["I think of all days", "I can't deny"]],
  [99,  ["Say you dey make man go crazy"]],
  [102, ["And you're the one", "You're the one wey dey make me okay"]],
  [107, ["I no dey lie", "I no dey lie"]],
  [113, ["Nobody sweet like you my vanilla", "Sweet in her short nickas"]],
  [117, ["She's called Helena with pretty face oo"]],
  [120, ["Look into my eyes", "And bae tell me something nice"]],
  [126, ["I Don shy I Don kpai", "Your love I can't deny"]],
  [132, ["Nobody sweet like you my vanilla", "Sweet in her short nickas"]],
  [136, ["She's called Helena with pretty face oo"]],
  [141, ["Look into my eyes", "And bae tell me something nice"]],
  [145, ["I Don shy I Don kpai", "Your love I can't deny"]],
];

// ── STATE ──
var aud = null;
var playing = false;
var curGroup = -1;
var groupEls = [];
var bars = [];

// ── INIT — runs after page loads ──
window.onload = function () {

  aud = document.getElementById('aud');
  aud.volume = 0.85;

  // Build lyric badges
  var box = document.getElementById('lyric-box');
  GROUPS.forEach(function (item) {
    var lines = item[1];
    var div = document.createElement('div');
    div.className = 'group';
    lines.forEach(function (txt) {
      var badge = document.createElement('div');
      badge.className = 'badge';
      badge.textContent = txt;
      div.appendChild(badge);
    });
    box.appendChild(div);
    groupEls.push(div);
  });

  // Build visualizer bars
  var vizEl = document.getElementById('viz');
  for (var i = 0; i < 18; i++) {
    var b = document.createElement('div');
    b.className = 'vb';
    b.style.height = '8px';
    vizEl.appendChild(b);
    bars.push(b);
  }

  // Floating hearts
  for (var i = 0; i < 14; i++) {
    var h = document.createElement('div');
    h.className = 'fheart';
    h.textContent = ['♥','❤','💕','💖','♡'][Math.floor(Math.random()*5)];
    h.style.left = (Math.random()*100) + '%';
    h.style.bottom = (Math.random()*10) + '%';
    h.style.fontSize = (0.6 + Math.random()*1.2) + 'rem';
    h.style.animationDuration = (9 + Math.random()*10) + 's';
    h.style.animationDelay = (Math.random()*8) + 's';
    document.body.appendChild(h);
  }

  // Petals
  for (var i = 0; i < 10; i++) {
    var p = document.createElement('div');
    p.className = 'petal';
    p.style.left = (Math.random()*100) + '%';
    p.style.top = '-5%';
    p.style.animationDuration = (8 + Math.random()*9) + 's';
    p.style.animationDelay = (Math.random()*8) + 's';
    document.body.appendChild(p);
  }

  // Splash hearts
  var sh = document.getElementById('splash-hearts');
  for (var i = 0; i < 20; i++) {
    var sd = document.createElement('div');
    sd.textContent = '♥';
    sd.style.position = 'absolute';
    sd.style.fontSize = (0.7 + Math.random()*1.5) + 'rem';
    sd.style.left = (Math.random()*100) + '%';
    sd.style.top = (Math.random()*100) + '%';
    sd.style.opacity = (0.08 + Math.random()*0.25);
    sd.style.animation = 'fh ' + (8+Math.random()*9) + 's linear ' + (Math.random()*6) + 's infinite';
    sh.appendChild(sd);
  }

  // Button events
  document.getElementById('start-btn').addEventListener('click', startExp);
  document.getElementById('play-btn').addEventListener('click', togglePlay);
  document.getElementById('dl-btn').addEventListener('click', dlAudio);
  document.getElementById('prog-track').addEventListener('click', seek);
  document.getElementById('vol').addEventListener('input', function () {
    aud.volume = +this.value;
  });

  // Audio events
  aud.addEventListener('loadedmetadata', function () {
    document.getElementById('dt').textContent = fmt(aud.duration);
  });

  aud.addEventListener('ended', function () {
    playing = false;
    document.getElementById('play-btn').innerHTML = '&#9654;';
  });

  aud.addEventListener('timeupdate', function () {
    var t = aud.currentTime;
    var dur = aud.duration || 1;
    document.getElementById('prog-fill').style.width = (t / dur * 100) + '%';
    document.getElementById('ct').textContent = fmt(t);
    syncGroups(t);
  });

  // Canvas background
  initCanvas();

  // Visualizer loop
  animViz();
};

// ── FORMAT TIME ──
function fmt(s) {
  var m = Math.floor(s / 60);
  var ss = Math.floor(s % 60);
  return m + ':' + (ss < 10 ? '0' : '') + ss;
}

// ── SYNC LYRICS ──
function syncGroups(t) {
  var idx = -1;
  for (var i = 0; i < GROUPS.length; i++) {
    if (t >= GROUPS[i][0]) idx = i;
    else break;
  }

  if (idx === -1) {
    groupEls.forEach(function (el) {
      el.classList.remove('active', 'leaving');
    });
    curGroup = -1;
    return;
  }

  if (idx === curGroup) return;

  // Hide old group
  if (curGroup >= 0 && groupEls[curGroup]) {
    var old = groupEls[curGroup];
    old.querySelectorAll('.badge').forEach(function (b) {
      b.classList.remove('show');
    });
    old.classList.remove('active');
    old.classList.add('leaving');
    setTimeout(function () {
      old.classList.remove('leaving');
    }, 380);
  }

  // Show new group
  curGroup = idx;
  var ag = groupEls[idx];
  ag.classList.remove('leaving');
  ag.classList.add('active');

  // Stagger badges
  var badges = ag.querySelectorAll('.badge');
  badges.forEach(function (badge, i) {
    badge.classList.remove('show');
    setTimeout(function () {
      badge.classList.add('show');
    }, i * 120);
  });
}

// ── PLAY / PAUSE ──
function togglePlay() {
  if (aud.paused) {
    aud.play();
    playing = true;
    document.getElementById('play-btn').innerHTML = '&#9646;&#9646;';
  } else {
    aud.pause();
    playing = false;
    document.getElementById('play-btn').innerHTML = '&#9654;';
  }
}

// ── SEEK ──
function seek(e) {
  var r = e.currentTarget.getBoundingClientRect();
  aud.currentTime = ((e.clientX - r.left) / r.width) * (aud.duration || 0);
}

// ── START FROM SPLASH ──
function startExp() {
  document.getElementById('splash').classList.add('gone');
  aud.play().then(function () {
    playing = true;
    document.getElementById('play-btn').innerHTML = '&#9646;&#9646;';
  }).catch(function () {
    playing = false;
  });
}

// ── DOWNLOAD ──
function dlAudio() {
  var a = document.createElement('a');
  a.href = aud.currentSrc;
  a.download = 'Vanilla - El Baronn.mp3';
  a.click();
}

// ── VISUALIZER ──
function animViz() {
  if (playing) {
    bars.forEach(function (b) {
      b.style.height = (6 + Math.random() * 44) + 'px';
    });
  }
  setTimeout(animViz, 110);
}

// ── CANVAS BACKGROUND ──
function initCanvas() {
  var cv = document.getElementById('bg-canvas');
  var ctx = cv.getContext('2d');
  var W, H;

  function resize() {
    W = cv.width = window.innerWidth;
    H = cv.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  var blobs = [];
  var hues = [340,320,350,310,330,345,315,325,335];
  for (var i = 0; i < 9; i++) {
    blobs.push({
      x: Math.random(), y: Math.random(),
      r: 70 + Math.random() * 150,
      h: hues[i],
      vx: (Math.random() - 0.5) * 0.0003,
      vy: (Math.random() - 0.5) * 0.00025,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.07 + Math.random() * 0.07
    });
  }

  var couples = [];
  for (var i = 0; i < 4; i++) {
    couples.push({
      x: Math.random(), y: 0.5 + Math.random() * 0.4,
      scale: 0.5 + Math.random() * 0.7,
      alpha: 0.03 + Math.random() * 0.06,
      vx: (Math.random() - 0.5) * 0.0002,
      phase: Math.random() * Math.PI * 2
    });
  }

  var hearts = [];
  for (var i = 0; i < 22; i++) {
    hearts.push({
      x: Math.random(), y: 1 + Math.random() * 0.5,
      size: 5 + Math.random() * 12,
      vy: -0.0005 - Math.random() * 0.0007,
      vx: (Math.random() - 0.5) * 0.00025,
      alpha: 0, ta: 0.2 + Math.random() * 0.4,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.008
    });
  }

  function drawCouple(x, y, sc, al) {
    ctx.save();
    ctx.globalAlpha = al;
    ctx.translate(x, y);
    ctx.scale(sc, sc);
    ctx.fillStyle = '#1a0410';
    ctx.beginPath(); ctx.arc(-20, -85, 13, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-30, -72);
    ctx.bezierCurveTo(-32, -38, -24, 2, -22, 22);
    ctx.bezierCurveTo(-12, 2, -10, -38, -10, -72);
    ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(20, -83, 11, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(10, -72);
    ctx.bezierCurveTo(8, -38, 16, 2, 18, 22);
    ctx.bezierCurveTo(28, 2, 30, -38, 30, -72);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#1a0410'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-10, -48); ctx.lineTo(10, -50); ctx.stroke();
    ctx.restore();
  }

  function drawHeart(x, y, sz, rot, al) {
    ctx.save();
    ctx.globalAlpha = al;
    ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sz, sz);
    ctx.fillStyle = 'hsl(' + (340 + Math.sin(Date.now()*0.0008)*18) + ',80%,62%)';
    ctx.beginPath();
    ctx.moveTo(0, -0.3);
    ctx.bezierCurveTo(0.5, -1, 1.2, -0.3, 1.2, 0.4);
    ctx.bezierCurveTo(1.2, 1, 0, 1.5, 0, 1.5);
    ctx.bezierCurveTo(0, 1.5, -1.2, 1, -1.2, 0.4);
    ctx.bezierCurveTo(-1.2, -0.3, -0.5, -1, 0, -0.3);
    ctx.fill();
    ctx.restore();
  }

  var t = 0;
  function frame() {
    requestAnimationFrame(frame);
    t += 0.016;
    ctx.clearRect(0, 0, W, H);

    var bg = ctx.createRadialGradient(W*0.5, H*0.38, 40, W*0.5, H*0.38, Math.max(W,H)*0.85);
    bg.addColorStop(0, '#2e0620');
    bg.addColorStop(0.55, '#1a0312');
    bg.addColorStop(1, '#0d0507');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    blobs.forEach(function (b) {
      b.x += b.vx; b.y += b.vy;
      if (b.x < -0.2) b.x = 1.2;
      if (b.x > 1.2)  b.x = -0.2;
      if (b.y < -0.2) b.y = 1.2;
      if (b.y > 1.2)  b.y = -0.2;
      var pulse = 1 + Math.sin(t + b.phase) * 0.18;
      var g = ctx.createRadialGradient(b.x*W, b.y*H, 0, b.x*W, b.y*H, b.r*pulse);
      g.addColorStop(0, 'hsla(' + b.h + ',75%,28%,' + b.alpha + ')');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    });

    couples.forEach(function (c) {
      c.x += c.vx;
      if (c.x < -0.15) c.x = 1.15;
      if (c.x > 1.15)  c.x = -0.15;
      drawCouple(c.x*W, c.y*H + Math.sin(t*0.35 + c.phase)*5, c.scale, c.alpha);
    });

    hearts.forEach(function (h) {
      h.y += h.vy; h.x += h.vx; h.rot += h.vr;
      if (h.y < -0.15) { h.y = 1.05; h.x = Math.random(); h.alpha = 0; }
      if (h.alpha < h.ta) h.alpha += 0.0025;
      drawHeart(h.x*W, h.y*H, h.size, h.rot, h.alpha);
    });

    var v = ctx.createRadialGradient(W*0.5, H*0.5, H*0.15, W*0.5, H*0.5, H*0.9);
    v.addColorStop(0, 'transparent');
    v.addColorStop(1, 'rgba(4,0,2,0.75)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, W, H);
  }
  frame();
}