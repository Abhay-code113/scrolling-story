/**
 * WE ARE STARDUST — script.js
 */

'use strict';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max + 1));
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================
   HERO CANVAS — PARTICLE STAR FIELD
   ============================================================ */

class HeroCanvas {
    constructor(canvasEl) {
        this.canvas = canvasEl;
        this.ctx = canvasEl.getContext('2d');
        this.stars = [];
        this.nebulaClouds = [];
        this.raf = null;
        this.mouseX = 0;
        this.mouseY = 0;
        this.init();
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.canvas.offsetWidth * dpr;
        this.canvas.height = this.canvas.offsetHeight * dpr;
        this.ctx.scale(dpr, dpr);
        this.w = this.canvas.offsetWidth;
        this.h = this.canvas.offsetHeight;
    }

    createStars(n = 320) {
        this.stars = [];
        for (let i = 0; i < n; i++) {
            this.stars.push({
                x: rand(0, this.w),
                y: rand(0, this.h),
                r: rand(0.3, 1.8),
                speed: rand(0.02, 0.08),
                phase: rand(0, Math.PI * 2),
                color: this._starColor(),
                drift: { x: rand(-0.1, 0.1), y: rand(0.02, 0.12) },
            });
        }
    }

    createNebulaClouds() {
        const colors = [
            'rgba(155,114,239,',
            'rgba(79,195,247,',
            'rgba(224,64,251,',
            'rgba(245,200,66,',
        ];
        this.nebulaClouds = Array.from({ length: 6 }, () => ({
            x: rand(0, this.w),
            y: rand(0, this.h),
            rx: rand(80, 280),
            ry: rand(60, 180),
            color: colors[randInt(0, colors.length - 1)],
            opacity: rand(0.03, 0.1),
            phase: rand(0, Math.PI * 2),
            speed: rand(0.002, 0.006),
        }));
    }

    _starColor() {
        const choices = ['255,255,255', '245,200,66', '155,114,239', '79,195,247', '224,64,251'];
        return choices[randInt(0, choices.length - 1)];
    }

    init() {
        this.resize();
        this.createStars();
        this.createNebulaClouds();

        window.addEventListener('resize', () => {
            this.resize();
            this.createStars();
            this.createNebulaClouds();
        });

        if (!prefersReducedMotion) {
            document.addEventListener('mousemove', (e) => {
                this.mouseX = e.clientX;
                this.mouseY = e.clientY;
            });
        }

        this.animate(0);
    }

    drawNebulae(t) {
        this.nebulaClouds.forEach(c => {
            const a = c.opacity + Math.sin(t * c.speed + c.phase) * 0.03;
            const grd = this.ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, Math.max(c.rx, c.ry));
            grd.addColorStop(0, `${c.color}${clamp(a, 0, 0.2)})`);
            grd.addColorStop(1, `${c.color}0)`);
            this.ctx.save();
            this.ctx.scale(1, c.ry / c.rx);
            this.ctx.beginPath();
            this.ctx.ellipse(c.x, c.y * (c.rx / c.ry), c.rx, c.rx, 0, 0, Math.PI * 2);
            this.ctx.fillStyle = grd;
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    drawStars(t) {
        const parallaxX = prefersReducedMotion ? 0 : (this.mouseX - this.w / 2) * 0.008;
        const parallaxY = prefersReducedMotion ? 0 : (this.mouseY - this.h / 2) * 0.008;

        this.stars.forEach(s => {
            const twinkle = 0.5 + 0.5 * Math.sin(t * s.speed * 60 + s.phase);
            const alpha = clamp(0.2 + 0.8 * twinkle, 0, 1);

            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(s.x + parallaxX * s.r, s.y + parallaxY * s.r, s.r, 0, Math.PI * 2);

            if (s.r > 1.2) {
                const grd = this.ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
                grd.addColorStop(0, `rgba(${s.color},${alpha})`);
                grd.addColorStop(1, `rgba(${s.color},0)`);
                this.ctx.fillStyle = grd;
                this.ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
            } else {
                this.ctx.fillStyle = `rgba(${s.color},${alpha})`;
            }

            this.ctx.fill();
            this.ctx.restore();

            s.y += s.drift.y;
            s.x += s.drift.x * Math.sin(t * 0.3 + s.phase);
            if (s.y > this.h + 5) { s.y = -5; s.x = rand(0, this.w); }
        });
    }

    animate(ts) {
        const t = ts * 0.001;
        this.ctx.clearRect(0, 0, this.w, this.h);

        const bg = this.ctx.createLinearGradient(0, 0, 0, this.h);
        bg.addColorStop(0, '#030014');
        bg.addColorStop(0.5, '#07021f');
        bg.addColorStop(1, '#030014');
        this.ctx.fillStyle = bg;
        this.ctx.fillRect(0, 0, this.w, this.h);

        this.drawNebulae(t);
        this.drawStars(t);

        this.raf = requestAnimationFrame(ts => this.animate(ts));
    }
}

/* ============================================================
   SCROLL PROGRESS BAR
   ============================================================ */

function initProgressBar() {
    const bar = $('#progressBar');
    if (!bar) return;

    function update() {
        const scrolled = window.scrollY;
        const total = document.documentElement.scrollHeight - window.innerHeight;
        const pct = total > 0 ? (scrolled / total) * 100 : 0;
        bar.style.width = `${clamp(pct, 0, 100)}%`;
        bar.setAttribute('aria-valuenow', Math.round(pct));
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
}

/* ============================================================
   NAV SCROLL BEHAVIOR + ACTIVE CHAPTER
   ============================================================ */

function initNav() {
    const nav = $('#nav');
    const chapters = $$('[data-chapter]');
    const navLinks = $$('.nav-chapter');

    if (!nav) return;

    let lastScroll = 0;

    nav.style.transition = 'transform 0.4s cubic-bezier(0.16,1,0.3,1), background 0.6s, padding 0.6s, backdrop-filter 0.6s';

    function onScroll() {
        const y = window.scrollY;

        if (y > 60) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        if (!prefersReducedMotion) {
            if (y > lastScroll && y > window.innerHeight) {
                nav.style.transform = 'translateY(-100%)';
            } else {
                nav.style.transform = 'translateY(0)';
            }
        }

        lastScroll = y;

        let activeChapter = 0;
        chapters.forEach((ch, i) => {
            const rect = ch.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.5) activeChapter = i;
        });

        navLinks.forEach((link, i) => {
            link.classList.toggle('active', i === activeChapter);
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

/* ============================================================
   SCROLL REVEAL — INTERSECTION OBSERVER
   ============================================================ */

function initScrollReveal() {
    const elements = $$('.scroll-reveal');
    if (!elements.length) return;

    if (prefersReducedMotion) {
        elements.forEach(el => el.classList.add('visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -60px 0px',
    });

    elements.forEach(el => observer.observe(el));
}

/* ============================================================
   JOURNEY STICKY SECTION & GALAXY CANVAS
   ============================================================ */

class GalaxyCanvas {
    constructor(canvasEl) {
        this.canvas = canvasEl;
        this.ctx = canvasEl.getContext('2d');
        this.targetPhase = 0;
        this.lerpPhase = 0;
        this.raf = null;
        this.particles = [];
        this.init();
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.canvas.offsetWidth * dpr;
        this.canvas.height = this.canvas.offsetHeight * dpr;
        this.ctx.scale(dpr, dpr);
        this.w = this.canvas.offsetWidth;
        this.h = this.canvas.offsetHeight;
        this.cx = this.w / 2;
        this.cy = this.h / 2;
    }

    createParticles() {
        this.particles = Array.from({ length: 200 }, () => ({
            angle: rand(0, Math.PI * 2),
            r: rand(20, Math.min(this.w, this.h) * 0.44),
            speed: rand(0.0003, 0.001),
            size: rand(0.5, 2.5),
            color: `hsl(${randInt(190, 290)}, 80%, ${randInt(60, 95)}%)`,
            phase: rand(0, Math.PI * 2),
        }));
    }

    setPhase(p) {
        this.targetPhase = clamp(p, 0, 2);
    }

    drawPhase0(t, blend) {
        for (let i = 0; i < 120; i++) {
            const seed = i * 137.508;
            const x = (Math.sin(seed) * 0.5 + 0.5) * this.w;
            const y = (Math.cos(seed * 1.3) * 0.5 + 0.5) * this.h;
            const sz = 0.5 + (Math.sin(t * 0.8 + seed) * 0.5 + 0.5) * 1.5;
            const a = (0.3 + (Math.sin(t * 1.2 + seed * 2) * 0.5 + 0.5) * 0.7) * blend;
            this.ctx.beginPath();
            this.ctx.arc(x, y, sz, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsl(${(seed * 37 + 200) % 360}, 70%, 80%)`;
            this.ctx.globalAlpha = a;
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        }
    }

    drawPhase1(t, blend) {
        const cx = this.cx, cy = this.cy;

        this.particles.forEach(p => {
            p.angle += p.speed * (1 + this.lerpPhase * 2);
            const pr = p.r * (0.4 + 0.6 * blend);
            const x = cx + Math.cos(p.angle) * pr;
            const y = cy + Math.sin(p.angle) * pr;
            const a = (0.4 + 0.6 * Math.sin(t * 2 + p.phase)) * blend;

            this.ctx.beginPath();
            this.ctx.arc(x, y, p.size * blend, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = a;
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        });

        const maxR = Math.min(this.w, this.h) * 0.25;
        const grd = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * blend);
        grd.addColorStop(0, `rgba(245,200,66,${0.7 * blend})`);
        grd.addColorStop(0.4, `rgba(232,132,60,${0.35 * blend})`);
        grd.addColorStop(1, `rgba(155,114,239,0)`);
        this.ctx.fillStyle = grd;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, maxR * blend, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawPhase2(t, blend) {
        const cx = this.cx, cy = this.cy;
        const sunR = 28;

        const sunGrd = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, sunR * 3);
        sunGrd.addColorStop(0, `rgba(255,255,200,${blend})`);
        sunGrd.addColorStop(0.3, `rgba(245,200,66,${0.9 * blend})`);
        sunGrd.addColorStop(0.6, `rgba(232,132,60,${0.5 * blend})`);
        sunGrd.addColorStop(1, `rgba(232,132,60,0)`);
        this.ctx.fillStyle = sunGrd;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, sunR * 3, 0, Math.PI * 2);
        this.ctx.fill();

        const planets = [
            { orbitR: 70, r: 4, speed: 0.8, color: '#b0bec5', phase: 0 },
            { orbitR: 110, r: 6, speed: 0.5, color: '#4fc3f7', phase: 1.2 },
            { orbitR: 155, r: 5, speed: 0.32, color: '#ef5350', phase: 2.4 },
            { orbitR: 200, r: 9, speed: 0.18, color: '#ff9a76', phase: 0.7 },
            { orbitR: 255, r: 7, speed: 0.11, color: '#ffd54f', phase: 3.1 },
        ];

        planets.forEach(pl => {
            const angle = t * pl.speed + pl.phase;
            const px = cx + Math.cos(angle) * pl.orbitR * blend;
            const py = cy + Math.sin(angle) * pl.orbitR * blend;

            this.ctx.beginPath();
            this.ctx.arc(cx, cy, pl.orbitR * blend, 0, Math.PI * 2);
            this.ctx.strokeStyle = `rgba(200,192,232,${0.1 * blend})`;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.arc(px, py, pl.r * blend, 0, Math.PI * 2);
            this.ctx.fillStyle = pl.color;
            this.ctx.globalAlpha = blend;
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        });
    }

    animate(ts) {
        const t = ts * 0.001;
        this.lerpPhase = lerp(this.lerpPhase, this.targetPhase, 0.04);

        this.ctx.clearRect(0, 0, this.w, this.h);
        this.ctx.fillStyle = '#030014';
        this.ctx.fillRect(0, 0, this.w, this.h);

        const p = this.lerpPhase;

        if (p < 1) {
            this.drawPhase0(t, 1 - p);
            if (p > 0) this.drawPhase1(t, p);
        } else {
            const p2 = p - 1;
            this.drawPhase1(t, 1 - p2);
            if (p2 > 0) this.drawPhase2(t, p2);
        }

        this.raf = requestAnimationFrame(ts => this.animate(ts));
    }

    init() {
        this.resize();
        this.createParticles();
        window.addEventListener('resize', () => { this.resize(); this.createParticles(); });
        this.animate(0);
    }
}

function initJourney() {
    const panels = $$('.journey-panel');
    if (!panels.length) return;

    const canvasEl = $('#galaxyCanvas');
    let galaxy;
    if (canvasEl) galaxy = new GalaxyCanvas(canvasEl);

    const dots = $$('#stickyDots .sdot');

    const panelObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const idx = parseInt(entry.target.dataset.panel, 10);
                if (galaxy) galaxy.setPhase(idx);
                dots.forEach((d, i) => d.classList.toggle('active', i === idx));
            }
        });
    }, { threshold: 0.4 });

    panels.forEach(p => panelObserver.observe(p));
}

/* ============================================================
   DNA STRAND BUILDER
   ============================================================ */

function buildDnaStrand() {
    const container = $('#dnaStrand');
    if (!container) return;

    const H = 400;
    const steps = 14;

    for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1);
        const y = t * H;
        const wave = Math.sin(t * Math.PI * 3) * 60;

        const left = document.createElement('div');
        left.className = 'dna-node';
        left.style.left = `${50 + wave}px`;
        left.style.top = `${y}px`;
        left.style.position = 'absolute';
        left.style.animationDelay = `${-t * 1.5}s`;

        const right = document.createElement('div');
        right.className = 'dna-node dna-node-b';
        const rightX = 150 - wave;
        right.style.left = `${rightX}px`;
        right.style.top = `${y}px`;
        right.style.position = 'absolute';
        right.style.animationDelay = `${-t * 1.5 + 0.5}s`;

        const bar = document.createElement('div');
        bar.className = 'dna-bar';
        const lx = 50 + wave + 6;
        const barW = Math.abs(rightX - lx);
        bar.style.left = `${Math.min(lx, rightX)}px`;
        bar.style.top = `${y + 5}px`;
        bar.style.width = `${barW}px`;
        bar.style.position = 'absolute';
        bar.style.opacity = i % 2 === 0 ? '0.35' : '0.2';

        container.appendChild(left);
        container.appendChild(right);
        container.appendChild(bar);
    }
}

/* ============================================================
   STARS CANVAS (CLIMAX)
   ============================================================ */

class StarsCanvas {
    constructor(canvasEl) {
        this.canvas = canvasEl;
        this.ctx = canvasEl.getContext('2d');
        this.stars = [];
        this.shootingStars = [];
        this.raf = null;
        this.init();
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.canvas.offsetWidth * dpr;
        this.canvas.height = this.canvas.offsetHeight * dpr;
        this.ctx.scale(dpr, dpr);
        this.w = this.canvas.offsetWidth;
        this.h = this.canvas.offsetHeight;
    }

    createStars(n = 500) {
        this.stars = Array.from({ length: n }, () => ({
            x: rand(0, this.w),
            y: rand(0, this.h),
            r: rand(0.2, 1.6),
            phase: rand(0, Math.PI * 2),
            speed: rand(0.3, 1.5),
            color: `hsl(${randInt(200, 340)}, 70%, 85%)`,
        }));
    }

    spawnShootingStar() {
        if (this.shootingStars.length < 3 && !prefersReducedMotion) {
            this.shootingStars.push({
                x: rand(0, this.w),
                y: rand(0, this.h * 0.5),
                vx: rand(3, 6),
                vy: rand(1.5, 3.5),
                len: rand(80, 160),
                alpha: 1,
                decay: rand(0.012, 0.025),
            });
        }
    }

    init() {
        this.resize();
        this.createStars();
        window.addEventListener('resize', () => { this.resize(); this.createStars(); });

        if (!prefersReducedMotion) {
            setInterval(() => this.spawnShootingStar(), 2200);
        }

        this.animate(0);
    }

    animate(ts) {
        const t = ts * 0.001;
        this.ctx.clearRect(0, 0, this.w, this.h);

        this.stars.forEach(s => {
            const a = 0.3 + 0.7 * (Math.sin(t * s.speed + s.phase) * 0.5 + 0.5);
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            this.ctx.fillStyle = s.color;
            this.ctx.globalAlpha = a;
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        });

        this.shootingStars = this.shootingStars.filter(ss => ss.alpha > 0);
        this.shootingStars.forEach(ss => {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.moveTo(ss.x, ss.y);
            this.ctx.lineTo(ss.x - ss.vx * ss.len * 0.1, ss.y - ss.vy * ss.len * 0.1);
            const grd = this.ctx.createLinearGradient(
                ss.x, ss.y,
                ss.x - ss.vx * ss.len * 0.1,
                ss.y - ss.vy * ss.len * 0.1
            );
            grd.addColorStop(0, `rgba(255,255,255,${ss.alpha})`);
            grd.addColorStop(1, 'rgba(255,255,255,0)');
            this.ctx.strokeStyle = grd;
            this.ctx.lineWidth = 1.5;
            this.ctx.stroke();
            this.ctx.restore();

            ss.x += ss.vx;
            ss.y += ss.vy;
            ss.alpha -= ss.decay;
        });

        this.raf = requestAnimationFrame(ts => this.animate(ts));
    }
}

function initStarsCanvas() {
    const canvas = $('#starsCanvas');
    if (!canvas) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !canvas._initialized) {
                canvas._initialized = true;
                new StarsCanvas(canvas);
                observer.unobserve(canvas);
            }
        });
    }, { threshold: 0.1 });

    observer.observe(canvas);
}

/* ============================================================
   GAZE RAYS
   ============================================================ */

function buildGazeRays() {
    const container = $('#gazeRays');
    if (!container) return;

    const count = 7;
    const spread = 60;

    for (let i = 0; i < count; i++) {
        const ray = document.createElement('div');
        ray.className = 'gaze-ray';
        const angle = -spread / 2 + (spread / (count - 1)) * i;
        ray.style.transform = `translateX(-50%) rotate(${angle}deg)`;
        ray.style.animationDelay = `${-i * 0.3}s`;
        ray.style.height = `${100 + i * 15}px`;
        ray.style.opacity = `${0.3 + (1 - Math.abs(angle) / spread) * 0.6}`;
        container.appendChild(ray);
    }
}

/* ============================================================
   ENDING STAR FIELD
   ============================================================ */

function buildEndingStars() {
    const container = $('#endingStars');
    if (!container) return;

    for (let i = 0; i < 90; i++) {
        const star = document.createElement('div');
        star.className = 'ending-star';
        const size = rand(1, 3.5);
        star.style.cssText = `
      left: ${rand(0, 100)}%;
      top:  ${rand(0, 100)}%;
      width:  ${size}px;
      height: ${size}px;
      --td: ${rand(2, 6)}s;
      --d:  ${rand(0, 5)}s;
    `;
        container.appendChild(star);
    }
}

/* ============================================================
   SMOOTH SCROLL LINKS
   ============================================================ */

function initSmoothScroll() {
    $$('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const target = document.querySelector(link.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
    });
}

/* ============================================================
   PARALLAX BACKGROUND GLOWS
   ============================================================ */

function initParallax() {
    if (prefersReducedMotion) return;

    const glows = $$('.bg-glow');
    if (!glows.length) return;

    let ticking = false;

    function update() {
        const sy = window.scrollY;
        glows.forEach((g, i) => {
            const dir = i % 2 === 0 ? 1 : -1;
            const speed = 0.04 + (i * 0.01);
            g.style.transform = `translateY(${sy * speed * dir}px)`;
        });
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });
}

/* ============================================================
   INIT
   ============================================================ */

function init() {
    const heroCanvasEl = $('#heroCanvas');
    if (heroCanvasEl) new HeroCanvas(heroCanvasEl);

    initProgressBar();
    initNav();
    initScrollReveal();
    initJourney();
    buildDnaStrand();
    initStarsCanvas();
    buildGazeRays();
    buildEndingStars();
    initSmoothScroll();
    initParallax();

    console.log('%c✦ We Are Stardust', 'color:#9b72ef;font-size:1.4rem;font-family:serif;');
    console.log('%cThe universe spent 13.8 billion years making you. Worth it.', 'color:#f5c842;font-size:0.9rem;font-style:italic;');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
