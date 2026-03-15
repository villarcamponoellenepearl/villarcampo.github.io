lucide.createIcons();

const html = document.documentElement;
function getTheme() { return html.getAttribute('data-theme') || 'dark'; }
function applyTheme(t) {
  html.setAttribute('data-theme', t);
  localStorage.setItem('pearl-theme', t);
  const isDark = t === 'dark';
  ['themeIcon','themeIconMob'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.setAttribute('data-lucide', isDark ? 'moon' : 'sun');
  });
  ['themeLabel','themeLabelMob'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = isDark ? 'Dark' : 'Light';
  });
  lucide.createIcons();
}
function toggleTheme() { applyTheme(getTheme() === 'dark' ? 'light' : 'dark'); }
applyTheme(localStorage.getItem('pearl-theme') || 'dark');
document.getElementById('themeToggle').addEventListener('click', toggleTheme);
document.getElementById('themeToggleMob').addEventListener('click', toggleTheme);

(function() {
  const cv = document.getElementById('ambientCanvas');
  const cx = cv.getContext('2d');
  let W, H, mX = innerWidth / 2, mY = innerHeight / 2;

  function resize() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  document.addEventListener('mousemove', e => { mX = e.clientX; mY = e.clientY; }, { passive: true });

  const COUNT = 70;
  const pts = Array.from({ length: COUNT }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    vx: (Math.random() - .5) * .5,
    vy: (Math.random() - .5) * .5,
  }));

  let last = 0;
  function draw(ts) {
    requestAnimationFrame(draw);
    if (ts - last < 25) return; // ~40fps
    last = ts;
    cx.clearRect(0, 0, W, H);

    const isDark = getTheme() === 'dark';
    const ac = isDark ? '157,111,255' : '124,79,224';
    const ac2 = isDark ? '200,77,255' : '168,40,232';

    pts.forEach(p => {
      
      const dx = mX - p.x, dy = mY - p.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      p.vx += dx / d * .018;
      p.vy += dy / d * .018;
      p.vx *= .96; p.vy *= .96;
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

      cx.beginPath();
      cx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
      cx.fillStyle = `rgba(${ac},.55)`;
      cx.fill();
    });

   
    for (let i = 0; i < COUNT; i++) {
      for (let j = i + 1; j < COUNT; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const a = (1 - dist / 100) * .18;
          cx.beginPath();
          cx.moveTo(pts[i].x, pts[i].y);
          cx.lineTo(pts[j].x, pts[j].y);
          cx.strokeStyle = `rgba(${i % 3 === 0 ? ac2 : ac},${a})`;
          cx.lineWidth = .5;
          cx.stroke();
        }
      }
    }
  }
  requestAnimationFrame(draw);
})();


const prog = document.getElementById('progress-bar');
window.addEventListener('scroll', () => {
  const h = document.documentElement;
  prog.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
}, { passive: true });

const dot  = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  dot.style.left = mx + 'px'; dot.style.top = my + 'px';
});
(function animCursor() {
  rx += (mx - rx) * .12; ry += (my - ry) * .12;
  ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
  requestAnimationFrame(animCursor);
})();

const interactiveEls = 'a,button,.skill-chip,.proj-card,.edu-card,.c-card,.soft-item,.soc-btn,.pipe-node,.t-tag,.a-tag,.proj-tag';
document.querySelectorAll(interactiveEls).forEach(el => {
  el.addEventListener('mouseenter', () => ring.classList.add('hov'));
  el.addEventListener('mouseleave', () => ring.classList.remove('hov'));
});
document.addEventListener('mousedown', () => ring.classList.add('pressing'));
document.addEventListener('mouseup',   () => ring.classList.remove('pressing'));


const tip = document.getElementById('tooltip');
let tipTimer;
document.querySelectorAll('[data-tooltip]').forEach(el => {
  el.addEventListener('mouseenter', () => {
    clearTimeout(tipTimer);
    tipTimer = setTimeout(() => {
      tip.textContent = el.dataset.tooltip;
      tip.classList.add('show');
    }, 320);
  });
  el.addEventListener('mousemove', e => {
    tip.style.left = (e.clientX + 14) + 'px';
    tip.style.top  = (e.clientY - 38) + 'px';
  });
  el.addEventListener('mouseleave', () => {
    clearTimeout(tipTimer);
    tip.classList.remove('show');
  });
});


const navEl = document.getElementById('nav');
const navAs = document.querySelectorAll('.nav-links a');
const sects  = Array.from(document.querySelectorAll('section[id]'));

window.addEventListener('scroll', () => {
  navEl.classList.toggle('scrolled', window.scrollY > 30);
  document.getElementById('backTop').classList.toggle('visible', window.scrollY > 400);
  let cur = '';
  sects.forEach(s => { if (window.scrollY >= s.offsetTop - 120) cur = s.id; });
  navAs.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
}, { passive: true });


const ham = document.getElementById('hamburger');
const mob = document.getElementById('mobileMenu');
ham.addEventListener('click', () => {
  ham.classList.toggle('open');
  mob.classList.toggle('open');
});
function closeMenu() { ham.classList.remove('open'); mob.classList.remove('open'); }


document.getElementById('backTop').addEventListener('click', () =>
  window.scrollTo({ top: 0, behavior: 'smooth' }));



const revEls = document.querySelectorAll('.fade-up,.fade-left,.fade-right,.fade-scale');
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revObs.unobserve(e.target); } });
}, { threshold: .07 });
revEls.forEach(el => revObs.observe(el));


function countUp(el) {
  const target = +el.dataset.target;
  const dur = 1400;
  const start = performance.now();
  (function step(now) {
    const t = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(ease * target);
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = target;
  })(start);
}

const statsObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('[data-target]').forEach(countUp);
      statsObs.unobserve(e.target);
    }
  });
}, { threshold: .6 });
const statsEl = document.querySelector('.hero-stats');
if (statsEl) statsObs.observe(statsEl);


const roles = ['IT Student','Vibe Coder', 'Beginner ML Enthusiast', 'Web Developer'];
let rIdx = 0, cIdx = 0, deleting = false;
const twEl = document.getElementById('tw');
function type() {
  const cur = roles[rIdx];
  if (deleting) {
    cIdx--; twEl.textContent = cur.substring(0, cIdx);
    if (cIdx === 0) { deleting = false; rIdx = (rIdx + 1) % roles.length; setTimeout(type, 380); return; }
    setTimeout(type, 42);
  } else {
    cIdx++; twEl.textContent = cur.substring(0, cIdx);
    if (cIdx === cur.length) { setTimeout(() => { deleting = true; type(); }, 2100); return; }
    setTimeout(type, 72);
  }
}
setTimeout(type, 1300);


const acName = document.getElementById('heroAccentName');
if (acName) {
  acName.addEventListener('mouseenter', () => {
    let n = 0;
    const iv = setInterval(() => {
      acName.style.letterSpacing = (n % 2 === 0) ? `${-.03 + (Math.random() - .5) * .04}em` : '-.03em';
      acName.style.transform = (n % 2 === 0) ? `skewX(${(Math.random() - .5) * 5}deg)` : '';
      if (++n > 8) { clearInterval(iv); acName.style.transform = ''; acName.style.letterSpacing = ''; }
    }, 55);
  });
}


const titleObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting || e.target.dataset.revealed) return;
    e.target.dataset.revealed = '1';
    const text = e.target.textContent;
    e.target.innerHTML = '';
    [...text].forEach((ch, i) => {
      const s = document.createElement('span');
      s.textContent = ch === ' ' ? '\u00A0' : ch;
      s.style.cssText = `display:inline-block;opacity:0;transform:translateY(18px);
        transition:opacity .45s ${i * .022}s ease,transform .45s ${i * .022}s ease`;
      e.target.appendChild(s);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        s.style.opacity = '1'; s.style.transform = 'none';
      }));
    });
    titleObs.unobserve(e.target);
  });
}, { threshold: .35 });
document.querySelectorAll('.s-title').forEach(el => titleObs.observe(el));


const pContainer = document.getElementById('particles');
function spawnParticle() {
  const p = document.createElement('div');
  p.className = 'prt';
  const dur = 5 + Math.random() * 8, delay = Math.random() * 4, size = 1 + Math.random() * 2.5;
  const hue = 270 + Math.random() * 60;
  p.style.cssText = `left:${Math.random()*100}%;bottom:${Math.random()*30}%;
    animation-duration:${dur}s;animation-delay:${delay}s;
    width:${size}px;height:${size}px;background:hsl(${hue},70%,65%);`;
  pContainer.appendChild(p);
  setTimeout(() => p.remove(), (dur + delay) * 1000 + 300);
}
setInterval(spawnParticle, 650);


document.querySelectorAll('.skill-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.skill-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const grp = tab.dataset.group;
    document.querySelectorAll('.skill-group').forEach(sg => {
      const show = grp === 'all' || sg.dataset.cat === grp;
      if (show) {
        sg.classList.remove('hidden');
        sg.classList.add('pop-in');
        setTimeout(() => sg.classList.remove('pop-in'), 400);
      } else {
        sg.classList.add('hidden');
      }
    });
  });
});


if (!document.getElementById('_rippleStyle')) {
  const s = document.createElement('style');
  s.id = '_rippleStyle';
  s.textContent = '@keyframes _ripple{to{transform:scale(3);opacity:0}}';
  document.head.appendChild(s);
}
document.querySelectorAll('.skill-chip').forEach(chip => {
  chip.style.cursor = 'pointer';
  chip.addEventListener('click', e => {
    const r = chip.getBoundingClientRect();
    const rpl = document.createElement('span');
    const size = Math.max(r.width, r.height);
    rpl.style.cssText = `position:absolute;border-radius:50%;
      width:${size}px;height:${size}px;
      left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px;
      background:var(--accent);opacity:.14;transform:scale(0);
      animation:_ripple .55s ease-out forwards;pointer-events:none;z-index:5;`;
    chip.appendChild(rpl);
    setTimeout(() => rpl.remove(), 600);
  });
});


document.querySelectorAll('.proj-card').forEach(card => {
  const spot = card.querySelector('.proj-spotlight');
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top)  / r.height;
    const rx = (py - .5) * -10, ry = (px - .5) * 10;
    card.style.transform = `translateY(-8px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    card.style.transformStyle = 'preserve-3d';
    if (spot) spot.style.background =
      `radial-gradient(circle 200px at ${px*100}% ${py*100}%,var(--glow),transparent)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; card.style.transformStyle = ''; });
});


document.querySelectorAll('.btn-primary,.soc-btn').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width  / 2)) * .25;
    const dy = (e.clientY - (r.top  + r.height / 2)) * .25;
    btn.style.transform = `translate(${dx}px,${dy}px) translateY(-3px)`;
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

const sparkObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const nodes = e.target.querySelectorAll('.pipe-node,.pipe-arr,.t-tag');
    nodes.forEach((n, i) => {
      n.style.opacity = '0';
      n.style.transform = 'translateY(10px)';
      setTimeout(() => {
        n.style.transition = 'opacity .4s ease, transform .4s ease';
        n.style.opacity = '1';
        n.style.transform = '';
      }, i * 75);
    });
    sparkObs.unobserve(e.target);
  });
}, { threshold: .25 });
const sp = document.getElementById('sparkPipeline');
if (sp) sparkObs.observe(sp);


const ccObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.querySelectorAll('.c-card').forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateX(-16px)';
      setTimeout(() => {
        card.style.transition = 'opacity .5s ease, transform .5s ease';
        card.style.opacity = '1';
        card.style.transform = '';
      }, i * 80);
    });
    ccObs.unobserve(e.target);
  });
}, { threshold: .15 });
const ccWrap = document.querySelector('.contact-cards');
if (ccWrap) ccObs.observe(ccWrap);