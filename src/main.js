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
