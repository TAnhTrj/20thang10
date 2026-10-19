/* =====================================================
   NỘI DUNG - SỬA Ở ĐÂY
   ===================================================== */
var MESSAGE = "Chúc mừng bạn đã bắt được hộp quà! 🎉 Chúc bạn một ngày 20/10 ngập tràn niềm vui, luôn xinh đẹp, rạng rỡ và hạnh phúc trọn vẹn nhé! ❤️";

var ESCAPES = 3; // số lần hộp quà chạy trốn trước khi mở

var btnTexts = [
  "Trượt rồi! Bắt lại đi 😜",
  "Vẫn chưa bắt được đâu 🏃💨",
  "Lần cuối nè, bấm là mở thật 👉🎁"
];
var introTexts = [
  "Quà xịn đâu dễ mở thế! Bấm vào hộp quà đang bay đi 😆",
  "Nhanh tay lên, hộp quà chạy nhanh lắm đó! ✨",
  "Thôi không trêu nữa, bấm thêm một lần là mở được 🥰"
];

// Danh sách nhạc. src có thể là tên file cùng thư mục hoặc link trực tiếp tới file .mp3
// label = dòng nhỏ hiện trong khung nhạc, title = tên bài hát
var TRACKS = {
  wait:   { label: "Nhạc chờ",       title: "Nàng Thơ",   src: "NangTho.mp3" },
  mom:    { label: "Dành cho mẹ",    title: "Mẹ Yêu  ",     src: "MeYeu.mp3"  },
  friend: { label: "Dành cho bạn",   title: "Cứ Thế - Orange & Hoàng Dũng",    src: "CuThe.mp3" },
  her:    { label: "Dành cho em",    title: "Vẫn Yêu - Rhymastic",     src: "VanYeu.mp3"  }
};

// Tâm thư. track = nhạc sẽ phát khi mở thư đó (khoá trong TRACKS ở trên).
// "\n" là xuống dòng. Thêm/bớt thư bằng cách thêm/bớt một khối { ... },
var LETTERS = [
  { to: "Gửi mẹ 💌",  track: "mom",    text: "Gửi mẹ, người vẫn hỏi con đã ăn cơm chưa mỗi lần gọi điện. Ngày 20/10, con chúc mẹ khỏe mạnh và mong được chăm sóc mẹ nhiều hơn.con mong mẹ cười nhiều hơn, lo ít đi và luôn cảm nhận được tình yêu của cả nhà.Cảm ơn mẹ vì đã tin con cả những lúc con thiếu tự tin nhất.Cảm ơn mẹ vì tất cả." },
  { to: "Gửi bạn 💌", track: "friend", text: "Chúc bạn ngày 20/10 thật vui vẻ, luôn xinh đẹp, rạng rỡ và gặp nhiều may mắn trong cuộc sống. Mong mọi điều tốt đẹp sẽ đến với bạn, những ước mơ sớm thành hiện thực và mỗi ngày đều có thật nhiều lý do để mỉm cười." },
  { to: "Gửi em 💌",  track: "her",    text: "Chúng ta đã cùng nhau đi qua nhiều ngày vui buồn, và anh càng trân trọng hơn những điều bình dị mà cả hai đang có. Chúc em ngày 20/10 thật hạnh phúc. Mong rằng dù thời gian có trôi qua, chúng ta vẫn luôn dành cho nhau sự quan tâm, kiên nhẫn và chân thành như những ngày đầu gặp gỡ." }
];

var VOLUME = 0.7; // âm lượng nhạc nền, từ 0 đến 1

/* =====================================================
   PHẦN CHẠY - thường không cần sửa
   ===================================================== */
var btn      = document.getElementById('gift');
var intro    = document.getElementById('intro');
var card     = document.getElementById('card');
var bgm      = document.getElementById('bgm');
var muteBtn  = document.getElementById('mute');
var playerEl = document.getElementById('player');
var nowLabel = document.getElementById('nowLabel');
var nowTitle = document.getElementById('nowTitle');

var count    = 0;
var current  = null;   // khoá bài đang chọn
var wantPlay = true;   // người xem có muốn nghe nhạc không (false khi bấm tắt)
var fadeTimer;

/* ---------- Nhạc ---------- */
function fadeTo(target, ms, done) {
  clearInterval(fadeTimer);
  var start = bgm.volume, steps = 10, i = 0;
  fadeTimer = setInterval(function () {
    i++;
    bgm.volume = Math.max(0, Math.min(1, start + (target - start) * i / steps));
    if (i >= steps) { clearInterval(fadeTimer); if (done) done(); }
  }, ms / steps);
}

function tryPlay() {
  if (!wantPlay) return;
  var p = bgm.play();
  if (p && p.then) {
    p.then(function () { fadeTo(VOLUME, 500); }).catch(function () {});
  }
}

// Đổi sang bài khác (mờ dần bài cũ, rồi vào bài mới)
function setTrack(key) {
  if (key === current || !TRACKS[key]) return;
  var first = (current === null);
  current = key;
  var t = TRACKS[key];
  nowLabel.textContent = t.label;
  nowTitle.textContent = t.title;
  nowTitle.title = t.title;

  function load() {
    bgm.src = t.src;
    bgm.load();
    if (wantPlay) tryPlay();
  }
  if (first || bgm.paused) { bgm.volume = 0; load(); }
  else { fadeTo(0, 350, load); }
}

bgm.addEventListener('play',  function () { playerEl.classList.add('on'); });
bgm.addEventListener('pause', function () { playerEl.classList.remove('on'); });
bgm.addEventListener('error', function () {
  if (current) nowTitle.textContent = "Không tải được nhạc";
});

muteBtn.addEventListener('click', function () {
  if (wantPlay) {
    wantPlay = false; bgm.pause(); muteBtn.textContent = '🔇';
  } else {
    wantPlay = true; muteBtn.textContent = '🔊'; bgm.volume = VOLUME; tryPlay();
  }
});

// Trình duyệt thường chặn nhạc tự phát: nếu bị chặn thì phát ở lần chạm đầu tiên
function startOnFirstTouch(e) {
  if (e.target && e.target.closest && e.target.closest('#mute')) return;
  if (wantPlay && bgm.paused) tryPlay();
}
document.addEventListener('pointerdown', startOnFirstTouch);
document.addEventListener('keydown', startOnFirstTouch);

// Mở trang: vào nhạc chờ ngay
setTrack('wait');

/* ---------- Hộp quà ---------- */
function moveRandom() {
  var pad = 16;
  var maxX = Math.max(pad, window.innerWidth  - btn.offsetWidth  - pad);
  var maxY = Math.max(pad, window.innerHeight - btn.offsetHeight - pad);
  btn.style.left = (pad + Math.random() * (maxX - pad)) + 'px';
  btn.style.top  = (pad + Math.random() * (maxY - pad)) + 'px';
}

function onClick() {
  if (count < ESCAPES) {
    if (!btn.classList.contains('flying')) {
      // Đưa nút ra thẳng <body> để position:fixed luôn tính theo màn hình
      var r = btn.getBoundingClientRect();
      document.body.appendChild(btn);
      btn.classList.add('flying');
      btn.style.left = r.left + 'px';
      btn.style.top  = r.top  + 'px';
      void btn.offsetWidth;
    }
    moveRandom();
    btn.textContent   = btnTexts[count];
    intro.textContent = introTexts[count];
    card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
    count++;
  } else {
    openGift();
  }
}

function openGift() {
  btn.style.display = 'none';
  intro.style.display = 'none';
  document.getElementById('msg').style.display = 'block';

  var out = document.getElementById('typed');
  var chars = Array.from(MESSAGE);
  var i = 0;
  (function type() {
    if (i < chars.length) { out.textContent += chars[i++]; setTimeout(type, 40); }
    else { showLetters(); }
  })();

  setInterval(petal, 200);
}

/* ---------- Tâm thư + đổi nhạc theo thư ---------- */
function refreshMusic() {
  var opened = document.querySelector('.letter[open]');
  setTrack(opened ? opened.getAttribute('data-track') : 'wait');
}

function showLetters() {
  var box = document.getElementById('letters');
  LETTERS.forEach(function (l) {
    var d = document.createElement('details');
    d.className = 'letter';
    d.setAttribute('data-track', l.track);
    var s = document.createElement('summary'); s.textContent = l.to;
    var p = document.createElement('p');       p.textContent = l.text;
    d.appendChild(s); d.appendChild(p);

    d.addEventListener('toggle', function () {
      if (d.open) {
        // Chỉ cho mở một thư một lúc để nhạc không bị lẫn
        document.querySelectorAll('.letter[open]').forEach(function (o) {
          if (o !== d) o.open = false;
        });
      }
      refreshMusic();
    });
    box.appendChild(d);
  });
}

/* ---------- Hoa rơi ---------- */
function petal() {
  var icons = ['🌸', '🌹', '✨', '💖', '🌷', '💝'];
  var p = document.createElement('div');
  p.className = 'petal';
  p.textContent = icons[Math.floor(Math.random() * icons.length)];
  p.style.left = Math.random() * 100 + 'vw';
  p.style.fontSize = (16 + Math.random() * 16) + 'px';
  p.style.animationDuration = (2.5 + Math.random() * 2.5) + 's';
  p.style.opacity = 0.45 + Math.random() * 0.55;
  document.body.appendChild(p);
  setTimeout(function () { p.remove(); }, 5200);
}

btn.addEventListener('click', onClick);
