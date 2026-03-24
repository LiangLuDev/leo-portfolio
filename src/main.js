/* ============================================
   Leo Portfolio — Interactions
   ============================================ */
import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
).matches;

/* If user prefers no motion, reveal everything and bail */
if (prefersReducedMotion) {
    document.querySelectorAll('.reveal').forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
    });
} else {
    /* ------------------------------------------
       Text Scramble on Hero Name
       ------------------------------------------ */
    const heroName = document.querySelector('.hero-name');
    if (heroName) {
        const finalText = heroName.getAttribute('data-text') || heroName.textContent;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#&';
        let frame = 0;
        const totalFrames = 42;

        heroName.textContent = '';
        heroName.style.opacity = '1';

        setTimeout(() => {
            const interval = setInterval(() => {
                const progress = frame / totalFrames;
                const revealed = Math.floor(progress * finalText.length);
                let display = '';

                for (let i = 0; i < finalText.length; i++) {
                    if (finalText[i] === ' ') {
                        display += ' ';
                    } else if (i < revealed) {
                        display += finalText[i];
                    } else {
                        display += chars[Math.floor(Math.random() * chars.length)];
                    }
                }

                heroName.textContent = display;
                frame++;

                if (frame > totalFrames) {
                    heroName.innerHTML = finalText.replace(
                        /\.$/,
                        '<span class="accent">.</span>'
                    );
                    clearInterval(interval);
                }
            }, 28);
        }, 350);
    }

    /* ------------------------------------------
       Hero Content Stagger
       ------------------------------------------ */
    const heroElements = [
        { sel: '.hero-greeting', delay: 0.1 },
        { sel: '.hero-role', delay: 0.8 },
        { sel: '.hero-desc', delay: 1.0 },
        { sel: '.hero-cta', delay: 1.2 },
        { sel: '.hero-scroll', delay: 1.5 },
    ];

    heroElements.forEach(({ sel, delay }) => {
        const el = document.querySelector(sel);
        if (el) {
            gsap.from(el, {
                opacity: 0,
                y: 20,
                duration: 0.8,
                delay,
                ease: 'power3.out',
            });
        }
    });

    /* ------------------------------------------
       Dot Grid Background (canvas)
       ------------------------------------------ */
    const canvas = document.querySelector('.dot-grid');
    if (canvas && !matchMedia('(pointer: coarse)').matches) {
        const ctx = canvas.getContext('2d');
        const GAP = 32;
        const BASE_R = 1;
        const BASE_ALPHA = 0.07;
        const MOUSE_RADIUS = 150;
        let mouseX = -9999;
        let mouseY = -9999;

        function resize() {
            const h = document.documentElement.scrollHeight;
            const w = window.innerWidth;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = w + 'px';
            canvas.style.height = h + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function draw() {
            const w = parseInt(canvas.style.width);
            const h = parseInt(canvas.style.height);
            ctx.clearRect(0, 0, w, h);

            // Mouse position in page coordinates
            const mx = mouseX;
            const my = mouseY + window.scrollY;

            const cols = Math.ceil(w / GAP) + 1;
            const rows = Math.ceil(h / GAP) + 1;

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const baseX = c * GAP;
                    const baseY = r * GAP;

                    const dx = baseX - mx;
                    const dy = baseY - my;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    let alpha = BASE_ALPHA;
                    let offsetX = 0;
                    let offsetY = 0;
                    let radius = BASE_R;

                    if (dist < MOUSE_RADIUS) {
                        const t = 1 - dist / MOUSE_RADIUS;
                        // Brighten near mouse
                        alpha = BASE_ALPHA + t * 0.18;
                        // Gentle push away
                        const pushStrength = t * t * 6;
                        if (dist > 1) {
                            offsetX = (dx / dist) * pushStrength;
                            offsetY = (dy / dist) * pushStrength;
                        }
                        // Slightly larger
                        radius = BASE_R + t * 0.6;
                    }

                    ctx.beginPath();
                    ctx.arc(baseX + offsetX, baseY + offsetY, radius, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
                    ctx.fill();
                }
            }

            requestAnimationFrame(draw);
        }

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        document.addEventListener('mouseleave', () => {
            mouseX = -9999;
            mouseY = -9999;
        });

        resize();
        draw();

        // Debounced resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resize, 200);
        });

        // Re-measure on content height change (after animations)
        setTimeout(resize, 2000);
    }

    /* ------------------------------------------
       Mouse-following ambient glow
       ------------------------------------------ */
    const glow = document.querySelector('.cursor-glow');
    if (glow) {
        let mx = window.innerWidth / 2;
        let my = window.innerHeight / 2;
        let gx = mx;
        let gy = my;

        document.addEventListener('mousemove', (e) => {
            mx = e.clientX;
            my = e.clientY;
        });

        // Smooth lerp follow — GPU only (transform)
        function updateGlow() {
            gx += (mx - gx) * 0.08;
            gy += (my - gy) * 0.08;
            glow.style.transform = `translate(${gx - 300}px, ${gy - 300}px)`;
            requestAnimationFrame(updateGlow);
        }
        requestAnimationFrame(updateGlow);

        // Hide on touch devices
        if (matchMedia('(pointer: coarse)').matches) {
            glow.style.opacity = '0';
        }
    }

    /* ------------------------------------------
       Nav — glassmorphism on scroll
       ------------------------------------------ */
    const nav = document.querySelector('.nav');
    ScrollTrigger.create({
        start: 'top -80',
        onUpdate(self) {
            if (self.scroll() > 80) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        },
    });

    /* ------------------------------------------
       Scroll Progress Bar
       ------------------------------------------ */
    gsap.to('.scroll-progress', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { scrub: 0.3 },
    });

    /* ------------------------------------------
       Section Reveal Animations
       ------------------------------------------ */
    document.querySelectorAll('.reveal').forEach((el) => {
        gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 88%',
                toggleActions: 'play none none none',
            },
        });
    });

    /* ------------------------------------------
       Project Cards — Stagger In
       ------------------------------------------ */
    const cards = gsap.utils.toArray('.project-card');
    cards.forEach((card, i) => {
        gsap.from(card, {
            opacity: 0,
            y: 50,
            duration: 0.7,
            delay: i * 0.12,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.projects-grid',
                start: 'top 82%',
                toggleActions: 'play none none none',
            },
        });
    });

    /* ------------------------------------------
       Contact Links — Stagger In
       ------------------------------------------ */
    const contactLinks = gsap.utils.toArray('.contact-link');
    contactLinks.forEach((link, i) => {
        gsap.from(link, {
            opacity: 0,
            y: 30,
            duration: 0.6,
            delay: i * 0.1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.contact-links',
                start: 'top 90%',
                toggleActions: 'play none none none',
            },
        });
    });
}
