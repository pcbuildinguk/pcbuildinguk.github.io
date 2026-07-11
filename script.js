/* ========================================
   DOM ELEMENTS
======================================== */
const loader = document.getElementById('loader');
const scrollProgress = document.getElementById('scroll-progress');
const nav = document.getElementById('nav');
const navToggle = document.getElementById('nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelectorAll('.nav-link, .mobile-link');
const backToTop = document.getElementById('back-to-top');
const testimonialTrack = document.getElementById('testimonial-track');
const testimonialPrev = document.getElementById('testimonial-prev');
const testimonialNext = document.getElementById('testimonial-next');
const testimonialDots = document.getElementById('testimonial-dots');
const testimonialSlider = document.querySelector('.testimonial-slider');
const faqItems = document.querySelectorAll('.faq-item');
const contactForm = document.getElementById('contact-form');

/* ========================================
   DEBOUNCE HELPER
======================================== */
function debounce(fn, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
    };
}

/* ========================================
   LOADING ANIMATION
======================================== */
window.addEventListener('load', () => {
    setTimeout(() => {
        loader.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }, 1500);
});

/* ========================================
   SCROLL HANDLER (UNIFIED)
======================================== */
let lastScrollY = 0;
let isScrolled = false;
let backToTopVisible = false;

function handleScroll() {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollY / docHeight) * 100;

    // Update scroll progress bar
    scrollProgress.style.width = `${progress}%`;

    // Nav background
    if (scrollY > 50 && !isScrolled) {
        nav.classList.add('scrolled');
        isScrolled = true;
    } else if (scrollY <= 50 && isScrolled) {
        nav.classList.remove('scrolled');
        isScrolled = false;
    }

    // Back to top button
    if (scrollY > 400 && !backToTopVisible) {
        backToTop.classList.add('visible');
        backToTopVisible = true;
    } else if (scrollY <= 400 && backToTopVisible) {
        backToTop.classList.remove('visible');
        backToTopVisible = false;
    }

    // Parallax effect on hero (only when in hero section)
    const heroGlow = document.querySelector('.hero-glow');
    const heroVisual = document.querySelector('.pc-mockup');
    if (scrollY < window.innerHeight) {
        if (heroGlow) heroGlow.style.transform = `translate3d(-50%, ${scrollY * 0.15}px, 0)`;
        if (heroVisual) heroVisual.style.transform = `translate3d(0, calc(-50% + ${scrollY * 0.1}px), 0)`;
    }

    // Active nav highlighting (throttled)
    if (Math.abs(scrollY - lastScrollY) > 50) {
        highlightActiveNav();
        lastScrollY = scrollY;
    }
}

let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            handleScroll();
            ticking = false;
        });
        ticking = true;
    }
}, { passive: true });

/* ========================================
   ACTIVE NAV LINK HIGHLIGHTING
======================================== */
let activeSection = '';

function highlightActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.scrollY + 150;

    for (const section of sections) {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            if (activeSection !== sectionId) {
                activeSection = sectionId;
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
            break;
        }
    }
}

/* ========================================
   NAVIGATION & MOBILE MENU
======================================== */
navToggle.addEventListener('click', () => {
    const isActive = navToggle.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = isActive ? 'hidden' : 'auto';
});

function closeMobileMenu() {
    navToggle.classList.remove('active');
    mobileMenu.classList.remove('active');
    document.body.style.overflow = 'auto';
}

document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
});

/* ========================================
   BACK TO TOP BUTTON
======================================== */
backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ========================================
   TESTIMONIAL SLIDER
======================================== */
let currentSlide = 0;
const testimonialCards = document.querySelectorAll('.testimonial-card');
const totalSlides = testimonialCards.length;
let autoSlideInterval;

function createDots() {
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('button');
        dot.classList.add('testimonial-dot');
        if (i === 0) dot.classList.add('active');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => goToSlide(i));
        testimonialDots.appendChild(dot);
    }
}

function updateDots() {
    const dots = testimonialDots.querySelectorAll('.testimonial-dot');
    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
}

function goToSlide(index) {
    currentSlide = ((index % totalSlides) + totalSlides) % totalSlides;
    testimonialTrack.style.transform = `translate3d(-${currentSlide * 100}%, 0, 0)`;
    updateDots();
}

function nextSlide() { goToSlide(currentSlide + 1); }
function prevSlide() { goToSlide(currentSlide - 1); }

function startAutoSlide() {
    autoSlideInterval = setInterval(nextSlide, 5000);
}

function stopAutoSlide() {
    clearInterval(autoSlideInterval);
}

createDots();
testimonialNext.addEventListener('click', nextSlide);
testimonialPrev.addEventListener('click', prevSlide);
testimonialSlider.addEventListener('mouseenter', stopAutoSlide);
testimonialSlider.addEventListener('mouseleave', startAutoSlide);
startAutoSlide();

// Touch swipe
let touchStartX = 0;
testimonialTrack.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
}, { passive: true });

testimonialTrack.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
        diff > 0 ? nextSlide() : prevSlide();
    }
}, { passive: true });

/* ========================================
   FAQ ACCORDION
======================================== */
faqItems.forEach(item => {
    item.querySelector('.faq-question').addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(i => i.classList.remove('active'));
        if (!isActive) item.classList.add('active');
    });
});

/* ========================================
   SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
======================================== */
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ========================================
   COUNTER ANIMATION
======================================== */
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

function animateCounter(el) {
    const target = parseInt(el.dataset.target);
    const duration = 1500;
    const start = performance.now();

    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(target * eased);
        if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
}

document.querySelectorAll('.stat-number[data-target]').forEach(el => counterObserver.observe(el));

/* ========================================
   CONTACT FORM
======================================== */
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value || 'PC Build Inquiry';
    const budget = document.getElementById('budget').value;
    const message = document.getElementById('message').value;

    const body = `Name: ${name}%0D%0AEmail: ${email}%0D%0A${budget ? `Budget: ${budget}%0D%0A` : ''}%0D%0AMessage:%0D%0A${message}`;

    const mailtoLink = `mailto:hello@pcbuild.com?subject=${encodeURIComponent(subject)}&body=${body}`;

    window.location.href = mailtoLink;

    const btn = contactForm.querySelector('button[type="submit"]');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<span>Opening email...</span>';
    btn.disabled = true;

    setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }, 2000);
});

/* ========================================
   SMOOTH SCROLL FOR ANCHOR LINKS
======================================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});

/* ========================================
   INITIAL STATE
======================================== */
highlightActiveNav();
