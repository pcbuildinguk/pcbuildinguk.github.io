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
    const loader = document.getElementById('loader');
    // Extended loader handling for edge cases
    const hideAndRestore = () => {
        loader.classList.add('hidden');
        document.body.style.overflow = 'auto';
    };

    // If all resources already loaded, hide immediately
    if (document.readyState === 'complete' || document.readyState === 'loaded') {
        hideAndRestore();
    } else {
        setTimeout(hideAndRestore, 1500);
    }
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

    scrollProgress.style.width = `${progress}%`;

    if (scrollY > 50 && !isScrolled) {
        nav.classList.add('scrolled');
        isScrolled = true;
    } else if (scrollY <= 50 && isScrolled) {
        nav.classList.remove('scrolled');
        isScrolled = false;
    }

    if (scrollY > 400 && !backToTopVisible) {
        backToTop.classList.add('visible');
        backToTopVisible = true;
    } else if (scrollY <= 400 && backToTopVisible) {
        backToTop.classList.remove('visible');
        backToTopVisible = false;
    }

    const heroGlow = document.querySelector('.hero-glow');
    const heroVisual = document.querySelector('.pc-mockup');
    if (scrollY < window.innerHeight) {
        if (heroGlow) heroGlow.style.transform = `translate3d(-50%, ${scrollY * 0.15}px, 0)`;
        if (heroVisual) heroVisual.style.transform = `translate3d(0, calc(-50% + ${scrollY * 0.1}px), 0)`;
    }

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
    const scrollY = window.scrollY + 80;

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
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(i => {
            i.classList.remove('active');
            i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        });
        if (!isActive) {
            item.classList.add('active');
            question.setAttribute('aria-expanded', 'true');
        }
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
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

/* ========================================
   GALLERY FILTERS
======================================== */
document.querySelectorAll('.gallery-filter').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.gallery-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        document.querySelectorAll('.gallery-item').forEach(item => {
            if (filter === 'all' || item.dataset.category === filter) {
                item.classList.remove('hidden', 'fade-out');
            } else {
                item.classList.add('fade-out');
                setTimeout(() => item.classList.add('hidden'), 300);
            }
        });
    });
});

/* ========================================
   SKILL BAR ANIMATIONS
======================================== */
const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.skill-fill').forEach(fill => {
                fill.style.width = fill.dataset.pct + '%';
            });
            skillObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

document.querySelectorAll('.tech-skills').forEach(el => skillObserver.observe(el));

/* ========================================
   LIVE PRICE TRACKER
======================================== */
let gbpRate = 0.746;
let pricesLive = false;
let priceUpdateTimer = null;

async function fetchExchangeRate() {
    try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await res.json();
        if (data.result === 'success' && data.rates && data.rates.GBP) {
            gbpRate = data.rates.GBP;
            updatePriceDisplay();
            pricesLive = true;
            const badge = document.getElementById('price-live-badge');
            if (badge) {
                badge.textContent = `Live · Updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                badge.classList.add('live');
            }
        }
    } catch (e) {
        console.warn('Price API unavailable, using offline prices');
    }
}

function updatePriceDisplay() {
    document.querySelectorAll('[data-usd-price]').forEach(el => {
        const usd = parseFloat(el.dataset.usdPrice);
        const gbp = Math.round(usd * gbpRate);
        el.textContent = `£${gbp.toLocaleString()}`;
        if (pricesLive) el.classList.add('price-updated');
    });

    const totalEl = document.getElementById('total-price');
    if (totalEl && typeof recalculateTotal === 'function') {
        recalculateTotal();
    }
}

function startPriceRefresh() {
    fetchExchangeRate();
    setInterval(fetchExchangeRate, 5 * 60 * 1000);
}

/* ========================================
   PC CONFIGURATOR — MASSIVE PARTS DATABASE
   Prices in USD (converted to GBP via live API)
======================================== */
const componentData = {

    /* ── CPUs ── */
    cpu: [
        // ENTHUSIAST AMD
        { id: 'cpu001', name: 'AMD Ryzen 9 9950X3D', detail: '16C/32T · 5.7GHz Boost · 120W TDP · 3D V-Cache', tier: 'enthusiast', priceUSD: 699, retailer: 'Scan', inStock: true },
        { id: 'cpu002', name: 'AMD Ryzen 9 9900X3D', detail: '12C/24T · 5.5GHz Boost · 120W TDP · 3D V-Cache', tier: 'enthusiast', priceUSD: 449, retailer: 'Scan', inStock: true },
        { id: 'cpu003', name: 'AMD Ryzen 9 7950X3D', detail: '16C/32T · 5.7GHz Boost · 120W TDP · 3D V-Cache', tier: 'enthusiast', priceUSD: 549, retailer: 'Scan', inStock: true },
        { id: 'cpu004', name: 'AMD Ryzen 9 7900X', detail: '12C/24T · 5.6GHz Boost · 170W TDP', tier: 'high', priceUSD: 349, retailer: 'Scan', inStock: true },
        { id: 'cpu005', name: 'AMD Ryzen 9 5950X', detail: '16C/32T · 4.9GHz Boost · 105W TDP · AM4', tier: 'high', priceUSD: 299, retailer: 'CCL', inStock: true },
        // HIGH-END AMD
        { id: 'cpu006', name: 'AMD Ryzen 7 9800X3D', detail: '8C/16T · 5.2GHz Boost · 120W TDP · 3D V-Cache', tier: 'high', priceUSD: 479, retailer: 'Scan', inStock: true },
        { id: 'cpu007', name: 'AMD Ryzen 7 7800X3D', detail: '8C/16T · 5.0GHz Boost · 120W TDP · 3D V-Cache', tier: 'high', priceUSD: 339, retailer: 'Scan', inStock: true },
        { id: 'cpu008', name: 'AMD Ryzen 7 7700X', detail: '8C/16T · 5.4GHz Boost · 105W TDP', tier: 'high', priceUSD: 229, retailer: 'Scan', inStock: true },
        { id: 'cpu009', name: 'AMD Ryzen 7 5800X3D', detail: '8C/16T · 4.5GHz Boost · 105W TDP · AM4 · 3D V-Cache', tier: 'high', priceUSD: 249, retailer: 'CCL', inStock: true },
        // MID-RANGE AMD
        { id: 'cpu010', name: 'AMD Ryzen 5 7600X', detail: '6C/12T · 5.3GHz Boost · 105W TDP', tier: 'mid', priceUSD: 179, retailer: 'Scan', inStock: true },
        { id: 'cpu011', name: 'AMD Ryzen 5 7600', detail: '6C/12T · 5.1GHz Boost · 65W TDP', tier: 'mid', priceUSD: 149, retailer: 'Scan', inStock: true },
        { id: 'cpu012', name: 'AMD Ryzen 5 5600X', detail: '6C/12T · 4.6GHz Boost · 65W TDP · AM4', tier: 'mid', priceUSD: 119, retailer: 'CCL', inStock: true },
        { id: 'cpu013', name: 'AMD Ryzen 5 5600', detail: '6C/12T · 4.4GHz Boost · 65W TDP · AM4', tier: 'mid', priceUSD: 99, retailer: 'CCL', inStock: true },
        { id: 'cpu014', name: 'AMD Ryzen 5 5500', detail: '6C/12T · 4.2GHz Boost · 65W TDP · AM4', tier: 'budget', priceUSD: 79, retailer: 'CCL', inStock: false },
        { id: 'cpu015', name: 'AMD Ryzen 9 5900XT', detail: '16C/32T · 4.7GHz Boost · 105W TDP · AM4', tier: 'high', priceUSD: 269, retailer: 'Scan', inStock: true },
        { id: 'cpu016', name: 'AMD Ryzen 7 5700X', detail: '8C/16T · 4.6GHz Boost · 65W TDP · AM4', tier: 'mid', priceUSD: 129, retailer: 'CCL', inStock: true },
        { id: 'cpu017', name: 'AMD Ryzen 7 5700G', detail: '8C/16T · 4.6GHz Boost · 65W TDP · AM4 · iGPU', tier: 'mid', priceUSD: 139, retailer: 'CCL', inStock: true },
        { id: 'cpu018', name: 'AMD Ryzen 5 5600GT', detail: '6C/12T · 4.6GHz Boost · 65W TDP · AM4 · iGPU', tier: 'mid', priceUSD: 109, retailer: 'CCL', inStock: true },
        // INTEL ENTHUSIAST
        { id: 'cpu019', name: 'Intel Core Ultra 9 285K', detail: '24C/24T · 5.7GHz Boost · 125W TDP · Arrow Lake', tier: 'enthusiast', priceUSD: 539, retailer: 'Scan', inStock: true },
        { id: 'cpu020', name: 'Intel Core i9-14900K', detail: '24C/32T · 6.0GHz Boost · 253W TDP', tier: 'enthusiast', priceUSD: 499, retailer: 'Scan', inStock: true },
        { id: 'cpu021', name: 'Intel Core i9-14900KS', detail: '24C/32T · 6.2GHz Boost · 253W TDP · Special Edition', tier: 'enthusiast', priceUSD: 599, retailer: 'Scan', inStock: true },
        { id: 'cpu022', name: 'Intel Core i9-13900K', detail: '24C/32T · 5.8GHz Boost · 253W TDP', tier: 'enthusiast', priceUSD: 399, retailer: 'CCL', inStock: true },
        // INTEL HIGH-END
        { id: 'cpu023', name: 'Intel Core Ultra 7 265K', detail: '20C/20T · 5.5GHz Boost · 125W TDP · Arrow Lake', tier: 'high', priceUSD: 339, retailer: 'Scan', inStock: true },
        { id: 'cpu024', name: 'Intel Core i7-14700K', detail: '20C/28T · 5.6GHz Boost · 253W TDP', tier: 'high', priceUSD: 349, retailer: 'Scan', inStock: true },
        { id: 'cpu025', name: 'Intel Core i7-14700KF', detail: '20C/28T · 5.6GHz Boost · 253W TDP · No iGPU', tier: 'high', priceUSD: 319, retailer: 'Scan', inStock: true },
        { id: 'cpu026', name: 'Intel Core i7-13700K', detail: '16C/24T · 5.4GHz Boost · 253W TDP', tier: 'high', priceUSD: 269, retailer: 'CCL', inStock: true },
        { id: 'cpu027', name: 'Intel Core i5-14600K', detail: '14C/20T · 5.3GHz Boost · 181W TDP', tier: 'high', priceUSD: 269, retailer: 'Scan', inStock: true },
        { id: 'cpu028', name: 'Intel Core i5-14600KF', detail: '14C/20T · 5.3GHz Boost · 181W TDP · No iGPU', tier: 'high', priceUSD: 239, retailer: 'Scan', inStock: true },
        // INTEL MID-RANGE
        { id: 'cpu029', name: 'Intel Core Ultra 5 245K', detail: '14C/14T · 5.2GHz Boost · 125W TDP · Arrow Lake', tier: 'mid', priceUSD: 239, retailer: 'Scan', inStock: true },
        { id: 'cpu030', name: 'Intel Core i5-13600K', detail: '14C/20T · 5.1GHz Boost · 181W TDP', tier: 'mid', priceUSD: 199, retailer: 'CCL', inStock: true },
        { id: 'cpu031', name: 'Intel Core i5-13400', detail: '10C/16T · 4.6GHz Boost · 148W TDP', tier: 'mid', priceUSD: 139, retailer: 'CCL', inStock: true },
        { id: 'cpu032', name: 'Intel Core i5-12400F', detail: '6C/12T · 4.4GHz Boost · 117W TDP', tier: 'budget', priceUSD: 89, retailer: 'CCL', inStock: true },
        { id: 'cpu033', name: 'Intel Core i3-14100F', detail: '4C/8T · 4.7GHz Boost · 58W TDP', tier: 'budget', priceUSD: 69, retailer: 'CCL', inStock: true },
    ],

    /* ── GPUs ── */
    gpu: [
        // NVIDIA ENTHUSIAST
        { id: 'gpu001', name: 'NVIDIA GeForce RTX 5090', detail: '32GB GDDR7 · 575W TDP · PCIe 5.0 · Blackwell', tier: 'enthusiast', priceUSD: 1999, retailer: 'Scan', inStock: false },
        { id: 'gpu002', name: 'NVIDIA GeForce RTX 5080', detail: '16GB GDDR7 · 360W TDP · PCIe 5.0 · Blackwell', tier: 'enthusiast', priceUSD: 999, retailer: 'Scan', inStock: true },
        { id: 'gpu003', name: 'NVIDIA GeForce RTX 4090', detail: '24GB GDDR6X · 450W TDP · PCIe 4.0 · Ada Lovelace', tier: 'enthusiast', priceUSD: 1599, retailer: 'Scan', inStock: true },
        { id: 'gpu004', name: 'NVIDIA GeForce RTX 4090 D', detail: '24GB GDDR6X · 425W TDP · China-specific variant', tier: 'enthusiast', priceUSD: 1449, retailer: 'Scan', inStock: false },
        // NVIDIA HIGH-END
        { id: 'gpu005', name: 'NVIDIA GeForce RTX 4080 Super', detail: '16GB GDDR6X · 320W TDP · PCIe 4.0', tier: 'high', priceUSD: 999, retailer: 'Scan', inStock: true },
        { id: 'gpu006', name: 'NVIDIA GeForce RTX 4080', detail: '16GB GDDR6X · 320W TDP · PCIe 4.0', tier: 'high', priceUSD: 899, retailer: 'Scan', inStock: false },
        { id: 'gpu007', name: 'NVIDIA GeForce RTX 4070 Ti Super', detail: '16GB GDDR6X · 285W TDP · PCIe 4.0', tier: 'high', priceUSD: 799, retailer: 'Scan', inStock: true },
        { id: 'gpu008', name: 'NVIDIA GeForce RTX 4070 Super', detail: '12GB GDDR6X · 220W TDP · PCIe 4.0', tier: 'high', priceUSD: 599, retailer: 'Scan', inStock: true },
        { id: 'gpu009', name: 'NVIDIA GeForce RTX 4070', detail: '12GB GDDR6X · 200W TDP · PCIe 4.0', tier: 'high', priceUSD: 499, retailer: 'Scan', inStock: true },
        { id: 'gpu010', name: 'NVIDIA GeForce RTX 4070 GDDR6', detail: '12GB GDDR6 · 200W TDP · Refresh model', tier: 'high', priceUSD: 449, retailer: 'Scan', inStock: true },
        // NVIDIA MID-RANGE
        { id: 'gpu011', name: 'NVIDIA GeForce RTX 4060 Ti 16GB', detail: '16GB GDDR6 · 165W TDP · PCIe 4.0', tier: 'mid', priceUSD: 399, retailer: 'Scan', inStock: true },
        { id: 'gpu012', name: 'NVIDIA GeForce RTX 4060 Ti 8GB', detail: '8GB GDDR6 · 165W TDP · PCIe 4.0', tier: 'mid', priceUSD: 349, retailer: 'Scan', inStock: true },
        { id: 'gpu013', name: 'NVIDIA GeForce RTX 4060', detail: '8GB GDDR6 · 115W TDP · PCIe 4.0', tier: 'mid', priceUSD: 269, retailer: 'Scan', inStock: true },
        { id: 'gpu014', name: 'NVIDIA GeForce RTX 5070 Ti', detail: '16GB GDDR7 · 300W TDP · Blackwell', tier: 'high', priceUSD: 749, retailer: 'Scan', inStock: true },
        { id: 'gpu015', name: 'NVIDIA GeForce RTX 5070', detail: '12GB GDDR7 · 250W TDP · Blackwell', tier: 'high', priceUSD: 549, retailer: 'Scan', inStock: true },
        // NVIDIA BUDGET
        { id: 'gpu016', name: 'NVIDIA GeForce RTX 3050 8GB', detail: '8GB GDDR6 · 130W TDP · PCIe 4.0 · Ampere', tier: 'budget', priceUSD: 179, retailer: 'CCL', inStock: true },
        { id: 'gpu017', name: 'NVIDIA GeForce RTX 3060 12GB', detail: '12GB GDDR6 · 170W TDP · PCIe 4.0', tier: 'budget', priceUSD: 249, retailer: 'CCL', inStock: true },
        { id: 'gpu018', name: 'NVIDIA GeForce RTX 3060 Ti 8GB', detail: '8GB GDDR6 · 200W TDP · PCIe 4.0', tier: 'budget', priceUSD: 299, retailer: 'CCL', inStock: true },
        { id: 'gpu019', name: 'NVIDIA GeForce RTX 3070 8GB', detail: '8GB GDDR6 · 220W TDP · PCIe 4.0', tier: 'mid', priceUSD: 449, retailer: 'CCL', inStock: true },
        { id: 'gpu020', name: 'NVIDIA GeForce RTX 3080 12GB', detail: '12GB GDDR6X · 350W TDP · PCIe 4.0', tier: 'high', priceUSD: 699, retailer: 'CCL', inStock: false },
        { id: 'gpu021', name: 'NVIDIA GeForce RTX 3080 Ti 12GB', detail: '12GB GDDR6X · 350W TDP · PCIe 4.0', tier: 'high', priceUSD: 799, retailer: 'CCL', inStock: false },
        { id: 'gpu022', name: 'NVIDIA GeForce RTX 3090 24GB', detail: '24GB GDDR6X · 350W TDP · PCIe 4.0', tier: 'enthusiast', priceUSD: 1099, retailer: 'CCL', inStock: false },
        // AMD ENTHUSIAST
        { id: 'gpu023', name: 'AMD Radeon RX 9070 XT', detail: '16GB GDDR7 · 304W TDP · RDNA 4', tier: 'enthusiast', priceUSD: 599, retailer: 'Scan', inStock: true },
        { id: 'gpu024', name: 'AMD Radeon RX 9070', detail: '16GB GDDR7 · 220W TDP · RDNA 4', tier: 'high', priceUSD: 449, retailer: 'Scan', inStock: true },
        { id: 'gpu025', name: 'AMD Radeon RX 7900 XTX', detail: '24GB GDDR6 · 355W TDP · PCIe 4.0 · RDNA 3', tier: 'enthusiast', priceUSD: 899, retailer: 'Scan', inStock: true },
        { id: 'gpu026', name: 'AMD Radeon RX 7900 XT', detail: '20GB GDDR6 · 315W TDP · PCIe 4.0 · RDNA 3', tier: 'enthusiast', priceUSD: 749, retailer: 'Scan', inStock: true },
        // AMD HIGH-END
        { id: 'gpu027', name: 'AMD Radeon RX 7800 XT 16GB', detail: '16GB GDDR6 · 263W TDP · PCIe 4.0 · RDNA 3', tier: 'high', priceUSD: 489, retailer: 'Scan', inStock: true },
        { id: 'gpu028', name: 'AMD Radeon RX 7700 XT 12GB', detail: '12GB GDDR6 · 245W TDP · PCIe 4.0 · RDNA 3', tier: 'high', priceUSD: 379, retailer: 'Scan', inStock: true },
        // AMD MID-RANGE
        { id: 'gpu029', name: 'AMD Radeon RX 7600 XT 16GB', detail: '16GB GDDR6 · 165W TDP · PCIe 4.0 · RDNA 3', tier: 'mid', priceUSD: 299, retailer: 'Scan', inStock: true },
        { id: 'gpu030', name: 'AMD Radeon RX 7600 8GB', detail: '8GB GDDR6 · 165W TDP · PCIe 4.0 · RDNA 3', tier: 'mid', priceUSD: 229, retailer: 'Scan', inStock: true },
        { id: 'gpu031', name: 'AMD Radeon RX 6950 XT', detail: '16GB GDDR6 · 335W TDP · PCIe 4.0 · RDNA 2', tier: 'high', priceUSD: 599, retailer: 'CCL', inStock: false },
        { id: 'gpu032', name: 'AMD Radeon RX 6750 XT 12GB', detail: '12GB GDDR6 · 250W TDP · PCIe 4.0 · RDNA 2', tier: 'mid', priceUSD: 349, retailer: 'CCL', inStock: true },
        { id: 'gpu033', name: 'AMD Radeon RX 6650 XT 8GB', detail: '8GB GDDR6 · 180W TDP · PCIe 4.0 · RDNA 2', tier: 'budget', priceUSD: 199, retailer: 'CCL', inStock: true },
        { id: 'gpu034', name: 'AMD Radeon RX 6600 XT 8GB', detail: '8GB GDDR6 · 160W TDP · PCIe 4.0 · RDNA 2', tier: 'budget', priceUSD: 169, retailer: 'CCL', inStock: true },
        { id: 'gpu035', name: 'AMD Radeon RX 6600 8GB', detail: '8GB GDDR6 · 132W TDP · PCIe 4.0 · RDNA 2', tier: 'budget', priceUSD: 139, retailer: 'CCL', inStock: true },
    ],

    /* ── MOTHERBOARDS ── */
    motherboard: [
        // AMD X870E / X870
        { id: 'mb001', name: 'ASUS ROG Crosshair X870E Hero', detail: 'AM5 · X870E · DDR5 · PCIe 5.0 · Wi-Fi 7 · BT 5.4', tier: 'enthusiast', priceUSD: 699, retailer: 'Scan', inStock: true },
        { id: 'mb002', name: 'MSI MEG X870E ACE', detail: 'AM5 · X870E · DDR5 · PCIe 5.0 · Wi-Fi 7', tier: 'enthusiast', priceUSD: 649, retailer: 'Scan', inStock: true },
        { id: 'mb003', name: 'Gigabyte X870E AORUS Master', detail: 'AM5 · X870E · DDR5 · PCIe 5.0 · Wi-Fi 7', tier: 'enthusiast', priceUSD: 599, retailer: 'Scan', inStock: true },
        { id: 'mb004', name: 'ASUS TUF Gaming X870-Plus WiFi', detail: 'AM5 · X870 · DDR5 · PCIe 5.0 · Wi-Fi 6E', tier: 'high', priceUSD: 299, retailer: 'Scan', inStock: true },
        // AMD X670E / X670
        { id: 'mb005', name: 'ASUS ROG Crosshair X670E Hero', detail: 'AM5 · X670E · DDR5 · PCIe 5.0 · Wi-Fi 6E', tier: 'high', priceUSD: 499, retailer: 'Scan', inStock: true },
        { id: 'mb006', name: 'MSI MEG X670E ACE', detail: 'AM5 · X670E · DDR5 · PCIe 5.0', tier: 'high', priceUSD: 449, retailer: 'Scan', inStock: false },
        { id: 'mb007', name: 'Gigabyte X670E AORUS Elite AX', detail: 'AM5 · X670E · DDR5 · PCIe 5.0 · Wi-Fi 6E', tier: 'high', priceUSD: 329, retailer: 'Scan', inStock: true },
        // AMD B650E / B650
        { id: 'mb008', name: 'ASUS ROG Strix B650E-F Gaming WiFi', detail: 'AM5 · B650E · DDR5 · PCIe 5.0 · Wi-Fi 6E', tier: 'high', priceUSD: 249, retailer: 'Scan', inStock: true },
        { id: 'mb009', name: 'MSI MAG B650 Tomahawk WiFi', detail: 'AM5 · B650 · DDR5 · PCIe 5.0 · Wi-Fi 6E', tier: 'mid', priceUSD: 199, retailer: 'Scan', inStock: true },
        { id: 'mb010', name: 'Gigabyte B650 AORUS Elite AX', detail: 'AM5 · B650 · DDR5 · Wi-Fi 6E', tier: 'mid', priceUSD: 179, retailer: 'CCL', inStock: true },
        { id: 'mb011', name: 'ASUS TUF Gaming B650-Plus WiFi', detail: 'AM5 · B650 · DDR5 · Wi-Fi 6', tier: 'mid', priceUSD: 169, retailer: 'CCL', inStock: true },
        { id: 'mb012', name: 'MSI Pro B650-P WiFi', detail: 'AM5 · B650 · DDR5 · Wi-Fi 6E', tier: 'mid', priceUSD: 139, retailer: 'CCL', inStock: true },
        // AMD AM4
        { id: 'mb013', name: 'ASUS ROG Crosshair VIII Hero', detail: 'AM4 · X570 · DDR4 · PCIe 4.0 · Wi-Fi 6', tier: 'high', priceUSD: 299, retailer: 'CCL', inStock: true },
        { id: 'mb014', name: 'MSI MEG X570 ACE', detail: 'AM4 · X570 · DDR4 · PCIe 4.0', tier: 'high', priceUSD: 249, retailer: 'CCL', inStock: true },
        { id: 'mb015', name: 'ASUS ROG Strix X570-E Gaming WiFi II', detail: 'AM4 · X570 · DDR4 · PCIe 4.0 · Wi-Fi 6E', tier: 'high', priceUSD: 229, retailer: 'CCL', inStock: true },
        { id: 'mb016', name: 'MSI MAG X570 Tomahawk WiFi', detail: 'AM4 · X570 · DDR4 · PCIe 4.0 · Wi-Fi 6', tier: 'mid', priceUSD: 169, retailer: 'CCL', inStock: true },
        { id: 'mb017', name: 'Gigabyte B550 AORUS Master', detail: 'AM4 · B550 · DDR4 · PCIe 4.0 · Wi-Fi 6', tier: 'mid', priceUSD: 179, retailer: 'CCL', inStock: true },
        { id: 'mb018', name: 'ASUS ROG Strix B550-F Gaming WiFi', detail: 'AM4 · B550 · DDR4 · PCIe 4.0 · Wi-Fi 6', tier: 'mid', priceUSD: 139, retailer: 'CCL', inStock: true },
        { id: 'mb019', name: 'MSI MAG B550 Tomahawk', detail: 'AM4 · B550 · DDR4 · PCIe 4.0', tier: 'mid', priceUSD: 119, retailer: 'CCL', inStock: true },
        { id: 'mb020', name: 'Gigabyte B550M DS3H AC', detail: 'AM4 · B550 · DDR4 · mATX · Wi-Fi', tier: 'budget', priceUSD: 79, retailer: 'CCL', inStock: true },
        // INTEL Z890
        { id: 'mb021', name: 'ASUS ROG Maximus Z890 Apex', detail: 'LGA1851 · Z890 · DDR5 · PCIe 5.0 · Wi-Fi 7', tier: 'enthusiast', priceUSD: 799, retailer: 'Scan', inStock: true },
        { id: 'mb022', name: 'MSI MEG Z890 ACE', detail: 'LGA1851 · Z890 · DDR5 · PCIe 5.0 · Wi-Fi 7', tier: 'enthusiast', priceUSD: 649, retailer: 'Scan', inStock: true },
        { id: 'mb023', name: 'ASUS ROG Strix Z890-E Gaming WiFi', detail: 'LGA1851 · Z890 · DDR5 · PCIe 5.0 · Wi-Fi 7', tier: 'high', priceUSD: 399, retailer: 'Scan', inStock: true },
        { id: 'mb024', name: 'Gigabyte Z890 AORUS Master', detail: 'LGA1851 · Z890 · DDR5 · PCIe 5.0 · Wi-Fi 7', tier: 'high', priceUSD: 449, retailer: 'Scan', inStock: true },
        { id: 'mb025', name: 'MSI MAG Z890 Tomahawk WiFi', detail: 'LGA1851 · Z890 · DDR5 · Wi-Fi 7', tier: 'high', priceUSD: 299, retailer: 'Scan', inStock: true },
        // INTEL Z790
        { id: 'mb026', name: 'ASUS ROG Maximus Z790 Apex', detail: 'LGA1700 · Z790 · DDR5 · PCIe 5.0 · Wi-Fi 6E', tier: 'enthusiast', priceUSD: 699, retailer: 'Scan', inStock: true },
        { id: 'mb027', name: 'ASUS ROG Maximus Z790 Hero', detail: 'LGA1700 · Z790 · DDR5 · PCIe 5.0 · Wi-Fi 6E', tier: 'enthusiast', priceUSD: 599, retailer: 'Scan', inStock: true },
        { id: 'mb028', name: 'MSI MEG Z790 ACE', detail: 'LGA1700 · Z790 · DDR5 · PCIe 5.0', tier: 'enthusiast', priceUSD: 549, retailer: 'Scan', inStock: true },
        { id: 'mb029', name: 'Gigabyte Z790 AORUS Master', detail: 'LGA1700 · Z790 · DDR5 · PCIe 5.0 · Wi-Fi 6E', tier: 'high', priceUSD: 399, retailer: 'Scan', inStock: true },
        { id: 'mb030', name: 'ASUS ROG Strix Z790-E Gaming WiFi', detail: 'LGA1700 · Z790 · DDR5 · PCIe 5.0 · Wi-Fi 6E', tier: 'high', priceUSD: 349, retailer: 'Scan', inStock: true },
        { id: 'mb031', name: 'MSI MAG Z790 Tomahawk WiFi', detail: 'LGA1700 · Z790 · DDR5 · Wi-Fi 6E', tier: 'high', priceUSD: 279, retailer: 'CCL', inStock: true },
        { id: 'mb032', name: 'Gigabyte Z790 AORUS Elite AX', detail: 'LGA1700 · Z790 · DDR5 · Wi-Fi 6E', tier: 'mid', priceUSD: 229, retailer: 'CCL', inStock: true },
        // INTEL B760 / B650
        { id: 'mb033', name: 'ASUS ROG Strix B760-G Gaming WiFi', detail: 'LGA1700 · B760 · DDR5 · mATX · Wi-Fi 6E', tier: 'mid', priceUSD: 179, retailer: 'CCL', inStock: true },
        { id: 'mb034', name: 'MSI MAG B760 Tomahawk WiFi', detail: 'LGA1700 · B760 · DDR5 · Wi-Fi 6E', tier: 'mid', priceUSD: 169, retailer: 'CCL', inStock: true },
        { id: 'mb035', name: 'Gigabyte B760M AORUS Elite AX', detail: 'LGA1700 · B760 · DDR5 · mATX · Wi-Fi 6E', tier: 'mid', priceUSD: 139, retailer: 'CCL', inStock: true },
        // INTEL H610 / B660
        { id: 'mb036', name: 'ASUS Prime B660-Plus D4', detail: 'LGA1700 · B660 · DDR4', tier: 'budget', priceUSD: 89, retailer: 'CCL', inStock: true },
        { id: 'mb037', name: 'MSI Pro H610M-G', detail: 'LGA1700 · H610 · DDR4 · mATX', tier: 'budget', priceUSD: 59, retailer: 'CCL', inStock: true },
    ],

    /* ── RAM ── */
    ram: [
        // DDR5 HIGH-END
        { id: 'ram001', name: '128GB DDR5 6400 RGB', detail: '4×32GB · CL32 · G.Skill Trident Z5 RGB', tier: 'enthusiast', priceUSD: 499, retailer: 'Scan', inStock: true },
        { id: 'ram002', name: '64GB DDR5 6400 RGB', detail: '2×32GB · CL32 · G.Skill Trident Z5 RGB', tier: 'high', priceUSD: 269, retailer: 'Scan', inStock: true },
        { id: 'ram003', name: '64GB DDR5 6000', detail: '2×32GB · CL30 · Kingston Fury Beast', tier: 'high', priceUSD: 229, retailer: 'Scan', inStock: true },
        { id: 'ram004', name: '64GB DDR5 5600', detail: '2×32GB · CL36 · Corsair Vengeance', tier: 'high', priceUSD: 199, retailer: 'CCL', inStock: true },
        { id: 'ram005', name: '64GB DDR5 5200', detail: '2×32GB · CL40 · Kingston Fury Beast', tier: 'mid', priceUSD: 169, retailer: 'CCL', inStock: true },
        // DDR5 MID-RANGE
        { id: 'ram006', name: '32GB DDR5 6400 RGB', detail: '2×16GB · CL32 · G.Skill Trident Z5 RGB', tier: 'high', priceUSD: 139, retailer: 'Scan', inStock: true },
        { id: 'ram007', name: '32GB DDR5 6000 RGB', detail: '2×16GB · CL30 · Corsair Dominator Platinum', tier: 'high', priceUSD: 129, retailer: 'Scan', inStock: true },
        { id: 'ram008', name: '32GB DDR5 6000', detail: '2×16GB · CL30 · Kingston Fury Beast', tier: 'high', priceUSD: 109, retailer: 'Scan', inStock: true },
        { id: 'ram009', name: '32GB DDR5 5600 RGB', detail: '2×16GB · CL36 · Corsair Vengeance RGB', tier: 'mid', priceUSD: 99, retailer: 'Scan', inStock: true },
        { id: 'ram010', name: '32GB DDR5 5600', detail: '2×16GB · CL36 · Kingston Fury Beast', tier: 'mid', priceUSD: 89, retailer: 'CCL', inStock: true },
        { id: 'ram011', name: '32GB DDR5 5200', detail: '2×16GB · CL40 · Crucial Pro', tier: 'mid', priceUSD: 79, retailer: 'CCL', inStock: true },
        { id: 'ram012', name: '32GB DDR5 4800', detail: '2×16GB · CL40 · Kingston Value', tier: 'budget', priceUSD: 69, retailer: 'CCL', inStock: true },
        // DDR5 BUDGET
        { id: 'ram013', name: '16GB DDR5 6400', detail: '2×8GB · CL32 · G.Skill Trident Z5', tier: 'mid', priceUSD: 79, retailer: 'Scan', inStock: true },
        { id: 'ram014', name: '16GB DDR5 6000', detail: '2×8GB · CL30 · Kingston Fury Beast', tier: 'mid', priceUSD: 69, retailer: 'CCL', inStock: true },
        { id: 'ram015', name: '16GB DDR5 5600', detail: '2×8GB · CL36 · Crucial Pro', tier: 'mid', priceUSD: 59, retailer: 'CCL', inStock: true },
        { id: 'ram016', name: '16GB DDR5 4800', detail: '2×8GB · CL40 · Kingston Value', tier: 'budget', priceUSD: 49, retailer: 'CCL', inStock: true },
        // DDR4 HIGH-END
        { id: 'ram017', name: '64GB DDR4 3600 RGB', detail: '2×32GB · CL16 · G.Skill Trident Z Royal', tier: 'high', priceUSD: 179, retailer: 'CCL', inStock: true },
        { id: 'ram018', name: '64GB DDR4 3600', detail: '2×32GB · CL18 · Kingston Fury Beast', tier: 'high', priceUSD: 149, retailer: 'CCL', inStock: true },
        { id: 'ram019', name: '32GB DDR4 3600 RGB', detail: '2×16GB · CL16 · G.Skill Trident Z5 RGB', tier: 'mid', priceUSD: 89, retailer: 'CCL', inStock: true },
        { id: 'ram020', name: '32GB DDR4 3600', detail: '2×16GB · CL18 · Kingston Fury Beast', tier: 'mid', priceUSD: 69, retailer: 'CCL', inStock: true },
        { id: 'ram021', name: '32GB DDR4 3200 RGB', detail: '2×16GB · CL16 · Corsair Vengeance RGB Pro', tier: 'mid', priceUSD: 69, retailer: 'CCL', inStock: true },
        { id: 'ram022', name: '32GB DDR4 3200', detail: '2×16GB · CL16 · Kingston Fury Beast', tier: 'mid', priceUSD: 59, retailer: 'CCL', inStock: true },
        { id: 'ram023', name: '16GB DDR4 3600', detail: '2×8GB · CL16 · G.Skill Trident Z Neo', tier: 'mid', priceUSD: 45, retailer: 'CCL', inStock: true },
        { id: 'ram024', name: '16GB DDR4 3200', detail: '2×8GB · CL16 · Kingston Fury Beast', tier: 'budget', priceUSD: 35, retailer: 'CCL', inStock: true },
    ],

    /* ── STORAGE ── */
    storage: [
        // PCIe 5.0 NVMe
        { id: 'stor001', name: '4TB PCIe 5.0 NVMe', detail: 'PCIe 5.0 ×4 · 14,500MB/s Read · 14,000MB/s Write · Crucial T700', tier: 'enthusiast', priceUSD: 499, retailer: 'Scan', inStock: true },
        { id: 'stor002', name: '2TB PCIe 5.0 NVMe', detail: 'PCIe 5.0 ×4 · 12,400MB/s Read · 11,800MB/s Write · Samsung 990 Pro', tier: 'high', priceUSD: 279, retailer: 'Scan', inStock: true },
        { id: 'stor003', name: '2TB PCIe 5.0 NVMe WD Black', detail: 'PCIe 5.0 ×4 · 10,000MB/s Read · 10,000MB/s Write · WD SN850X', tier: 'high', priceUSD: 249, retailer: 'Scan', inStock: true },
        { id: 'stor004', name: '1TB PCIe 5.0 NVMe', detail: 'PCIe 5.0 ×4 · 10,000MB/s Read · 9,500MB/s Write · Crucial T700', tier: 'high', priceUSD: 159, retailer: 'Scan', inStock: true },
        // PCIe 4.0 NVMe HIGH-END
        { id: 'stor005', name: '4TB PCIe 4.0 NVMe', detail: 'PCIe 4.0 ×4 · 7,450MB/s Read · 7,000MB/s Write · Samsung 990 Pro', tier: 'high', priceUSD: 299, retailer: 'Scan', inStock: true },
        { id: 'stor006', name: '2TB PCIe 4.0 NVMe', detail: 'PCIe 4.0 ×4 · 7,450MB/s Read · 6,900MB/s Write · Samsung 990 Pro', tier: 'high', priceUSD: 159, retailer: 'Scan', inStock: true },
        { id: 'stor007', name: '2TB PCIe 4.0 NVMe WD Black', detail: 'PCIe 4.0 ×4 · 7,300MB/s Read · 6,600MB/s Write · WD SN850X', tier: 'high', priceUSD: 149, retailer: 'Scan', inStock: true },
        { id: 'stor008', name: '2TB PCIe 4.0 NVMe Kingston', detail: 'PCIe 4.0 ×4 · 7,300MB/s Read · 7,000MB/s Write · KC3000', tier: 'high', priceUSD: 139, retailer: 'Scan', inStock: true },
        // PCIe 4.0 NVMe MID-RANGE
        { id: 'stor009', name: '1TB PCIe 4.0 NVMe', detail: 'PCIe 4.0 ×4 · 5,150MB/s Read · 4,900MB/s Write · Crucial P3 Plus', tier: 'mid', priceUSD: 89, retailer: 'CCL', inStock: true },
        { id: 'stor010', name: '1TB PCIe 4.0 NVMe WD Blue', detail: 'PCIe 4.0 ×4 · 5,150MB/s Read · 4,900MB/s Write · WD SN580', tier: 'mid', priceUSD: 79, retailer: 'CCL', inStock: true },
        { id: 'stor011', name: '1TB PCIe 4.0 NVMe TeamGroup', detail: 'PCIe 4.0 ×4 · 5,000MB/s Read · 4,500MB/s Write · MP44L', tier: 'mid', priceUSD: 69, retailer: 'CCL', inStock: true },
        { id: 'stor012', name: '1TB PCIe 3.0 NVMe', detail: 'PCIe 3.0 ×4 · 3,500MB/s Read · 3,000MB/s Write · Samsung 980', tier: 'budget', priceUSD: 59, retailer: 'CCL', inStock: true },
        { id: 'stor013', name: '1TB PCIe 3.0 NVMe Kingston', detail: 'PCIe 3.0 ×4 · 3,500MB/s Read · 2,100MB/s Write · A2000', tier: 'budget', priceUSD: 49, retailer: 'CCL', inStock: true },
        // BUDGET SATA / PCIe 3
        { id: 'stor014', name: '2TB SATA SSD', detail: 'SATA · 560MB/s Read · 530MB/s Write · Samsung 870 EVO', tier: 'budget', priceUSD: 99, retailer: 'CCL', inStock: true },
        { id: 'stor015', name: '1TB SATA SSD', detail: 'SATA · 560MB/s Read · 530MB/s Write · Crucial MX500', tier: 'budget', priceUSD: 59, retailer: 'CCL', inStock: true },
        { id: 'stor016', name: '512GB SATA SSD', detail: 'SATA · 560MB/s Read · 530MB/s Write · Samsung 870 EVO', tier: 'budget', priceUSD: 39, retailer: 'CCL', inStock: true },
        // HDDs
        { id: 'stor017', name: '8TB HDD 7200RPM', detail: '7200RPM · 256MB Cache · CMR · Seagate IronWolf Pro', tier: 'high', priceUSD: 199, retailer: 'Scan', inStock: true },
        { id: 'stor018', name: '4TB HDD 7200RPM', detail: '7200RPM · 256MB Cache · CMR · Seagate Barracuda', tier: 'mid', priceUSD: 99, retailer: 'CCL', inStock: true },
        { id: 'stor019', name: '4TB HDD 5400RPM', detail: '5400RPM · 256MB Cache · WD Blue', tier: 'budget', priceUSD: 79, retailer: 'CCL', inStock: true },
        { id: 'stor020', name: '2TB HDD 7200RPM', detail: '7200RPM · 64MB Cache · Seagate Barracuda', tier: 'budget', priceUSD: 49, retailer: 'CCL', inStock: true },
        // STORAGE ARRAYS
        { id: 'stor021', name: '4TB + 4TB NVMe RAID 0', detail: 'PCIe 4.0 · 2×2TB striped · 14,600MB/s Read · 13,800MB/s Write', tier: 'enthusiast', priceUSD: 399, retailer: 'Scan', inStock: true },
        { id: 'stor022', name: '2TB + 2TB NVMe RAID 0', detail: 'PCIe 4.0 · 2×2TB striped · 14,600MB/s Read · 13,800MB/s Write', tier: 'high', priceUSD: 299, retailer: 'Scan', inStock: true },
    ],

    /* ── COOLING ── */
    cooling: [
        // CUSTOM WATER COOLING
        { id: 'cool001', name: 'Custom Hardline Loop Complete', detail: 'Dual 360mm rad · Nickel/Acetal blocks · 3×120mm QL fans', tier: 'enthusiast', priceUSD: 899, retailer: 'Scan', inStock: true },
        { id: 'cool002', name: 'Custom Softline Loop Budget', detail: 'Single 360mm rad · PETG tubing · 3×120mm fans', tier: 'high', priceUSD: 499, retailer: 'Scan', inStock: true },
        { id: 'cool003', name: 'EK-Quantum Magnitude D-RGB', detail: 'Full coverage water block · Nickel + Acetal', tier: 'high', priceUSD: 299, retailer: 'Scan', inStock: true },
        { id: 'cool004', name: 'Bykski GPU Water Block + Backplate', detail: 'Full coverage · Nickel plated · For RTX 4090', tier: 'high', priceUSD: 179, retailer: 'CCL', inStock: true },
        // AIO 360mm HIGH-END
        { id: 'cool005', name: 'NZXT Kraken Z73 RGB 360mm', detail: '360mm AIO · 3×120mm QL fans · LCD Display', tier: 'high', priceUSD: 299, retailer: 'Scan', inStock: true },
        { id: 'cool006', name: 'Corsair iCUE H170i Elite LCD 420mm', detail: '420mm AIO · 3×140mm ML RGB fans · LCD Display', tier: 'enthusiast', priceUSD: 349, retailer: 'Scan', inStock: true },
        { id: 'cool007', name: 'Corsair iCUE H150i Elite Capellix 360mm', detail: '360mm AIO · 3×120mm QL fans · Capellix RGB', tier: 'high', priceUSD: 249, retailer: 'Scan', inStock: true },
        { id: 'cool008', name: 'Arctic Liquid Freezer III 360mm', detail: '360mm AIO · VRM fan included · Near-silent', tier: 'high', priceUSD: 119, retailer: 'Scan', inStock: true },
        { id: 'cool009', name: 'be quiet! Silent Loop 2 360mm', detail: '360mm AIO · ARGB · 3×120mm Silent Wings', tier: 'high', priceUSD: 149, retailer: 'CCL', inStock: true },
        // AIO 360mm MID-RANGE
        { id: 'cool010', name: 'Lian Li Galahad 360mm RGB', detail: '360mm AIO · 3×120mm SL120 fans · Dual Chamber', tier: 'mid', priceUSD: 119, retailer: 'CCL', inStock: true },
        { id: 'cool011', name: 'DeepCool LT720 360mm', detail: '360mm AIO · 3×120mm fan · Anti-leak tech', tier: 'mid', priceUSD: 89, retailer: 'CCL', inStock: true },
        { id: 'cool012', name: 'Antec Symphony 360mm ARGB', detail: '360mm AIO · 3×120mm ARGB fans', tier: 'mid', priceUSD: 79, retailer: 'CCL', inStock: true },
        // AIO 240mm / 280mm
        { id: 'cool013', name: 'NZXT Kraken 280mm RGB', detail: '280mm AIO · 2×140mm Aer P fans · LCD Display', tier: 'mid', priceUSD: 199, retailer: 'Scan', inStock: true },
        { id: 'cool014', name: 'Corsair H100i Elite 240mm', detail: '240mm AIO · 2×120mm ML RGB fans', tier: 'mid', priceUSD: 149, retailer: 'CCL', inStock: true },
        { id: 'cool015', name: 'Arctic Liquid Freezer II 240mm', detail: '240mm AIO · VRM fan · Near-silent operation', tier: 'mid', priceUSD: 69, retailer: 'CCL', inStock: true },
        { id: 'cool016', name: 'DeepCool AK620 240mm', detail: '240mm AIO · Dual tower design · 2×120mm fan', tier: 'budget', priceUSD: 59, retailer: 'CCL', inStock: true },
        // AIR COOLING HIGH-END
        { id: 'cool017', name: 'Noctua NH-D15 chromax.black', detail: 'Dual Tower · 2×NF-A15 140mm · 250W TDP', tier: 'high', priceUSD: 109, retailer: 'Scan', inStock: true },
        { id: 'cool018', name: 'Noctua NH-D15s chromax.black', detail: 'Single Tower · 1×NF-A15 140mm · 250W TDP', tier: 'high', priceUSD: 89, retailer: 'Scan', inStock: true },
        { id: 'cool019', name: 'be quiet! Dark Rock Pro 5', detail: 'Dual Tower · 250W TDP · 3×135mm fans', tier: 'high', priceUSD: 89, retailer: 'CCL', inStock: true },
        { id: 'cool020', name: 'be quiet! Dark Rock Elite', detail: 'Dual Tower · 270W TDP · 3×135mm Silent Wings', tier: 'enthusiast', priceUSD: 149, retailer: 'Scan', inStock: true },
        // AIR COOLING MID-RANGE
        { id: 'cool021', name: 'Noctua NH-U12A chromax.black', detail: 'Single Tower · 2×NF-A12 120mm · 250W TDP', tier: 'high', priceUSD: 119, retailer: 'Scan', inStock: true },
        { id: 'cool022', name: 'Thermalright Peerless Assassin 120 SE', detail: 'Dual Tower · 2×120mm · 250W TDP', tier: 'mid', priceUSD: 35, retailer: 'CCL', inStock: true },
        { id: 'cool023', name: 'DeepCool AK620 Zero Dark', detail: 'Dual Tower · 2×120mm · 260W TDP', tier: 'mid', priceUSD: 59, retailer: 'CCL', inStock: true },
        { id: 'cool024', name: 'Scythe Fuma 3', detail: 'Dual Tower · 2×120mm Kaze Flex · 250W TDP', tier: 'mid', priceUSD: 59, retailer: 'CCL', inStock: true },
        // AIR COOLING BUDGET
        { id: 'cool025', name: 'Noctua NH-L9i chromax.black', detail: 'Low-profile · 1×92mm · 65W TDP · 37mm height', tier: 'budget', priceUSD: 49, retailer: 'CCL', inStock: true },
        { id: 'cool026', name: 'be quiet! Pure Rock 2 Black', detail: 'Single Tower · 1×120mm · 150W TDP', tier: 'budget', priceUSD: 39, retailer: 'CCL', inStock: true },
        { id: 'cool027', name: 'DeepCool AG400', detail: 'Single Tower · 1×120mm · 180W TDP', tier: 'budget', priceUSD: 25, retailer: 'CCL', inStock: true },
        { id: 'cool028', name: 'Thermalright Assassin King 120 SE', detail: 'Single Tower · 1×120mm · 180W TDP', tier: 'budget', priceUSD: 19, retailer: 'CCL', inStock: true },
    ],

    /* ── CASES ── */
    case: [
        // PREMIUM FULL TOWER
        { id: 'case001', name: 'Lian Li O11 Dynamic EVO XL', detail: 'Full Tower · E-ATX · Triple Chamber · 420mm GPU support', tier: 'enthusiast', priceUSD: 229, retailer: 'Scan', inStock: true },
        { id: 'case002', name: 'Fractal Torrent Full Tower', detail: 'Full Tower · E-ATX · Open-airflow · 420mm GPU support', tier: 'enthusiast', priceUSD: 249, retailer: 'Scan', inStock: true },
        { id: 'case003', name: 'Phanteks Enthoo Pro 2', detail: 'Full Tower · E-ATX · 2×360mm rad support', tier: 'high', priceUSD: 169, retailer: 'CCL', inStock: true },
        // PREMIUM MID TOWER
        { id: 'case004', name: 'Lian Li O11 Dynamic EVO', detail: 'Mid Tower · ATX · Triple Chamber · 420mm GPU', tier: 'high', priceUSD: 179, retailer: 'Scan', inStock: true },
        { id: 'case005', name: 'NZXT H9 Elite', detail: 'Mid Tower · ATX · Full Tempered Glass · Dual Chamber', tier: 'high', priceUSD: 189, retailer: 'Scan', inStock: true },
        { id: 'case006', name: 'NZXT H7 Flow', detail: 'Mid Tower · ATX · Mesh front · High airflow · 360mm rad', tier: 'high', priceUSD: 129, retailer: 'Scan', inStock: true },
        { id: 'case007', name: 'Corsair 5000D Airflow', detail: 'Mid Tower · ATX · High-Airflow · 360mm rad · 400mm GPU', tier: 'high', priceUSD: 154, retailer: 'Scan', inStock: true },
        { id: 'case008', name: 'Fractal North XL', detail: 'Mid Tower · ATX · Wood/Steel · 360mm rad', tier: 'high', priceUSD: 149, retailer: 'Scan', inStock: true },
        { id: 'case009', name: 'be quiet! Silent Base 802', detail: 'Mid Tower · ATX · Sound-dampened · 420mm rad', tier: 'high', priceUSD: 169, retailer: 'Scan', inStock: true },
        { id: 'case010', name: 'Lian Li Lancool II Mesh', detail: 'Mid Tower · ATX · Mesh front · 360mm rad · RGB', tier: 'high', priceUSD: 119, retailer: 'CCL', inStock: true },
        // HIGH-AIRFLOW MESH
        { id: 'case011', name: 'Fractal North', detail: 'Mid Tower · ATX · Mesh front + side · Wood accent', tier: 'mid', priceUSD: 109, retailer: 'CCL', inStock: true },
        { id: 'case012', name: 'Phanteks Eclipse G360A', detail: 'Mid Tower · ATX · Mesh front · 360mm rad · ARGB', tier: 'mid', priceUSD: 99, retailer: 'CCL', inStock: true },
        { id: 'case013', name: 'Corsair 4000D Airflow', detail: 'Mid Tower · ATX · High-Airflow · 360mm rad', tier: 'mid', priceUSD: 104, retailer: 'CCL', inStock: true },
        { id: 'case014', name: 'NZXT H510 Flow', detail: 'Mid Tower · ATX · Mesh front panel', tier: 'mid', priceUSD: 99, retailer: 'CCL', inStock: true },
        { id: 'case015', name: 'DeepCool CK560', detail: 'Mid Tower · ATX · Mesh front · 360mm rad · ARGB', tier: 'mid', priceUSD: 79, retailer: 'CCL', inStock: true },
        { id: 'case016', name: 'Antec C8 Mesh', detail: 'Mid Tower · ATX · Mesh front · 360mm rad', tier: 'mid', priceUSD: 99, retailer: 'CCL', inStock: true },
        // GLASS SIDE PANEL
        { id: 'case017', name: 'NZXT H510', detail: 'Mid Tower · ATX · Tempered glass side · USB-C', tier: 'mid', priceUSD: 89, retailer: 'CCL', inStock: true },
        { id: 'case018', name: 'Corsair 2000D Airflow', detail: 'Mini Tower · mITX · 3-slot GPU · 240mm rad', tier: 'mid', priceUSD: 119, retailer: 'Scan', inStock: true },
        // MINI / mITX CASES
        { id: 'case019', name: 'Lian Li O11 Dynamic Mini', detail: 'Mini Tower · mATX · Dual Chamber · 360mm GPU', tier: 'mid', priceUSD: 119, retailer: 'Scan', inStock: true },
        { id: 'case020', name: 'Lian Li A3-mATX', detail: 'Mini Tower · mATX · Aluminium · 331mm GPU', tier: 'mid', priceUSD: 99, retailer: 'Scan', inStock: true },
        { id: 'case021', name: 'NZXT H1 V2', detail: 'Mini Tower · mITX · SFF · 305mm GPU · 153mm height', tier: 'high', priceUSD: 249, retailer: 'Scan', inStock: true },
        { id: 'case022', name: 'Fractal Design Ridge', detail: 'Mini Tower · mITX · 2-slot · 330mm GPU · 71mm width', tier: 'mid', priceUSD: 149, retailer: 'Scan', inStock: true },
        { id: 'case023', name: 'Cooler Master NR200P Max', detail: 'Mini Tower · mITX · Pre-built AIO · 330mm GPU', tier: 'high', priceUSD: 399, retailer: 'Scan', inStock: true },
        { id: 'case024', name: 'Dan A4-H2O', detail: 'Ultra-compact · mITX · 1L · 2-slot · 322mm GPU', tier: 'high', priceUSD: 189, retailer: 'CCL', inStock: true },
        { id: 'case025', name: 'Cooler Master MasterBox Q300L', detail: 'Mini Tower · mATX · Tempered glass · Budget', tier: 'budget', priceUSD: 49, retailer: 'CCL', inStock: true },
    ],

    /* ── POWER SUPPLIES ── */
    psu: [
        // PLATINUM / TITANIUM (HIGH-END)
        { id: 'psu001', name: 'Corsair AX1600i', detail: '1600W · 80+ Titanium · Fully Modular · iCUE', tier: 'enthusiast', priceUSD: 599, retailer: 'Scan', inStock: true },
        { id: 'psu002', name: 'ASUS ROG Thor 1200P2', detail: '1200W · 80+ Platinum · OLED display · RGB', tier: 'enthusiast', priceUSD: 399, retailer: 'Scan', inStock: true },
        { id: 'psu003', name: 'Seasonic Prime TX-1000', detail: '1000W · 80+ Titanium · Fully Modular · 12yr warranty', tier: 'enthusiast', priceUSD: 349, retailer: 'Scan', inStock: true },
        { id: 'psu004', name: 'Corsair AX1000', detail: '1000W · 80+ Platinum · Fully Modular', tier: 'high', priceUSD: 249, retailer: 'Scan', inStock: true },
        { id: 'psu005', name: 'be quiet! Dark Power 13 1000W', detail: '1000W · 80+ Titanium · Fully Modular · Overclocking', tier: 'high', priceUSD: 279, retailer: 'Scan', inStock: true },
        // GOLD HIGH-END
        { id: 'psu006', name: 'Corsair RM1000x 2024', detail: '1000W · 80+ Gold · Fully Modular · 135mm ML fan', tier: 'high', priceUSD: 179, retailer: 'Scan', inStock: true },
        { id: 'psu007', name: 'Seasonic Focus GX-850', detail: '850W · 80+ Gold · Fully Modular · 10yr warranty', tier: 'high', priceUSD: 139, retailer: 'Scan', inStock: true },
        { id: 'psu008', name: 'ASUS TUF Gaming 850W', detail: '850W · 80+ Gold · Fully Modular · Military-grade', tier: 'high', priceUSD: 129, retailer: 'CCL', inStock: true },
        { id: 'psu009', name: 'Fractal Ion+ 2 Platinum 860W', detail: '860W · 80+ Platinum · Fully Modular · 10yr warranty', tier: 'high', priceUSD: 129, retailer: 'Scan', inStock: true },
        { id: 'psu010', name: 'Corsair RM850x 2024', detail: '850W · 80+ Gold · Fully Modular · 135mm ML fan', tier: 'high', priceUSD: 139, retailer: 'Scan', inStock: true },
        { id: 'psu011', name: 'MSI MPG A850G 850W', detail: '850W · 80+ Gold · Fully Modular · 10yr warranty', tier: 'mid', priceUSD: 99, retailer: 'CCL', inStock: true },
        // GOLD MID-RANGE
        { id: 'psu012', name: 'Corsair RM750x 2024', detail: '750W · 80+ Gold · Fully Modular · 135mm ML fan', tier: 'mid', priceUSD: 109, retailer: 'Scan', inStock: true },
        { id: 'psu013', name: 'Seasonic Focus GX-750', detail: '750W · 80+ Gold · Fully Modular · 10yr warranty', tier: 'mid', priceUSD: 99, retailer: 'CCL', inStock: true },
        { id: 'psu014', name: 'be quiet! Straight Power 12 750W', detail: '750W · 80+ Platinum · Fully Modular · Silent', tier: 'mid', priceUSD: 119, retailer: 'CCL', inStock: true },
        { id: 'psu015', name: 'Fractal Ion+ 2 Platinum 750W', detail: '750W · 80+ Platinum · Fully Modular · 10yr warranty', tier: 'mid', priceUSD: 99, retailer: 'CCL', inStock: true },
        { id: 'psu016', name: 'Gigabyte P750GM 750W', detail: '750W · 80+ Gold · Fully Modular · 5yr warranty', tier: 'mid', priceUSD: 79, retailer: 'CCL', inStock: true },
        // GOLD BUDGET
        { id: 'psu017', name: 'Corsair RM650x 2024', detail: '650W · 80+ Gold · Fully Modular · 135mm ML fan', tier: 'budget', priceUSD: 89, retailer: 'CCL', inStock: true },
        { id: 'psu018', name: 'Seasonic Focus GX-650', detail: '650W · 80+ Gold · Fully Modular · 10yr warranty', tier: 'budget', priceUSD: 79, retailer: 'CCL', inStock: true },
        { id: 'psu019', name: 'MSI Pro GP650W 650W', detail: '650W · 80+ Gold · Fully Modular · 5yr warranty', tier: 'budget', priceUSD: 59, retailer: 'CCL', inStock: true },
        { id: 'psu020', name: 'be quiet! Pure Power 11 650W', detail: '650W · 80+ Gold · Semi-modular · 5yr warranty', tier: 'budget', priceUSD: 69, retailer: 'CCL', inStock: true },
        { id: 'psu021', name: 'Corsair CV650 650W', detail: '650W · 80+ Bronze · Non-modular · 3yr warranty', tier: 'budget', priceUSD: 49, retailer: 'CCL', inStock: true },
        { id: 'psu022', name: 'EVGA 650 GQ 650W', detail: '650W · 80+ Gold · Semi-modular · 5yr warranty', tier: 'budget', priceUSD: 59, retailer: 'CCL', inStock: true },
        { id: 'psu023', name: 'Cooler Master MWE Gold 650W V2', detail: '650W · 80+ Gold · Fully Modular · 5yr warranty', tier: 'budget', priceUSD: 59, retailer: 'CCL', inStock: true },
        { id: 'psu024', name: 'Thermaltake Toughpower GF3 850W', detail: '850W · 80+ Gold · ATX 3.0 · PCIe 5.0 · 12VHPWR', tier: 'high', priceUSD: 129, retailer: 'Scan', inStock: true },
    ],
};

const selectedComponents = {};
let currentCat = 'cpu';

function getGbpPrice(priceUSD) {
    return Math.round(priceUSD * gbpRate);
}

function renderOptions(category) {
    const container = document.getElementById('config-options');
    const items = componentData[category] || [];
    const catLabels = {
        cpu: 'CPUs & Processors', gpu: 'Graphics Cards', motherboard: 'Motherboards',
        ram: 'Memory (RAM)', storage: 'Storage Drives', cooling: 'Cooling Solutions',
        case: 'PC Cases', psu: 'Power Supplies'
    };
    const catIcons = {
        cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3"/>',
        gpu: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h4v4H6zM14 10h4v4h-4z"/>',
        motherboard: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 9v11M16 9v11M8 13h8"/>',
        ram: '<rect x="2" y="8" width="20" height="8" rx="1"/><path d="M6 8V6M10 8V6M14 8V6M18 8V6M6 16v2M10 16v2M14 16v2M18 16v2"/>',
        storage: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 5v14c0 1.66-4 3-9 3s-9-1.34-9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>',
        cooling: '<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>',
        case: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h8M8 10h8M8 14h4"/>',
        psu: '<rect x="4" y="6" width="16" height="12" rx="2"/><path d="M8 10v4M12 9v6M16 10v4"/>',
    };

    const filteredCount = () => {
        const q = (window.configSearch || '').toLowerCase();
        if (!q) return items.length;
        return items.filter(i => i.name.toLowerCase().includes(q) || i.detail.toLowerCase().includes(q)).length;
    };

    container.innerHTML = `
        <div class="config-options-header">
            <div style="display:flex;align-items:center;gap:10px">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2">${catIcons[category] || ''}</svg>
                <span class="config-options-title">${catLabels[category] || category}</span>
            </div>
            <span class="config-selected-count">${selectedComponents[category] ? '1 selected' : filteredCount() + ' parts'}</span>
        </div>
        <div class="config-options-search">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" id="config-search" placeholder="Search ${(catLabels[category] || category).toLowerCase()}..." autocomplete="off">
        </div>
        <div class="config-grid" id="config-grid">
            ${items.map(item => {
                const gbp = getGbpPrice(item.priceUSD);
                const isSelected = selectedComponents[category]?.id === item.id;
                const tierColors = { enthusiast: '#ff6b00', high: '#0066ff', mid: '#00c853', budget: '#888' };
                return `
                <div class="config-option ${isSelected ? 'selected' : ''} ${!item.inStock ? 'out-of-stock' : ''} config-option-card"
                     data-id="${item.id}" data-cat="${category}"
                     data-name="${item.name.toLowerCase()}" data-detail="${item.detail.toLowerCase()}">
                    <div class="config-option-info">
                        <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px">
                            <span class="tier-badge" style="background:${tierColors[item.tier]}18;color:${tierColors[item.tier]};border:1px solid ${tierColors[item.tier]}40;font-size:0.6rem;padding:1px 6px;border-radius:100px;font-weight:700;text-transform:uppercase;letter-spacing:0.3px">${item.tier}</span>
                            ${!item.inStock ? '<span style="color:#ff4444;font-size:0.6rem">OOS</span>' : ''}
                        </div>
                        <span class="config-option-name">${item.name}</span>
                        <span class="config-option-detail">${item.detail}</span>
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0">
                        <span class="config-option-price" data-usd-price="${item.priceUSD}">£${gbp.toLocaleString()}</span>
                        <span style="font-size:0.6rem;color:var(--text-muted)">${item.retailer}</span>
                        <div class="config-option-check">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                    </div>
                </div>`;
            }).join('')}
        </div>
    `;

    document.getElementById('config-search').addEventListener('input', (e) => {
        window.configSearch = e.target.value;
        filterOptions(e.target.value, category);
    });

    container.querySelectorAll('.config-option-card').forEach(el => {
        el.addEventListener('click', () => {
            if (el.classList.contains('out-of-stock')) return;
            selectComponent(el.dataset.cat, el.dataset.id);
        });
    });
}

function filterOptions(query, category) {
    const q = (query || window.configSearch || '').toLowerCase();
    const cards = document.querySelectorAll('.config-option-card');
    let visible = 0;
    cards.forEach(el => {
        const match = !q || el.dataset.name.includes(q) || el.dataset.detail.includes(q);
        el.style.display = match ? '' : 'none';
        if (match) visible++;
    });
    const countEl = document.querySelector('.config-selected-count');
    if (countEl) {
        countEl.textContent = selectedComponents[category] ? '1 selected' : visible + ' parts';
    }
}

function selectComponent(category, id) {
    const item = componentData[category]?.find(i => i.id === id);
    if (!item) return;
    if (selectedComponents[category]?.id === id) {
        delete selectedComponents[category];
    } else {
        selectedComponents[category] = item;
    }
    renderOptions(category);
    updateSummary();
}

function recalculateTotal() {
    const entries = Object.entries(selectedComponents);
    const total = entries.reduce((sum, [, item]) => sum + getGbpPrice(item.priceUSD), 0);
    const totalEl = document.getElementById('total-price');
    if (totalEl) totalEl.textContent = `£${total.toLocaleString()}`;
}

/* ========================================
   COMPATIBILITY ANALYSIS HELPERS
======================================== */
function parseTdp(detail) {
    const m = (detail || '').match(/(\d+)\s*W\s*TDP/i);
    return m ? parseInt(m[1], 10) : 0;
}

function parsePsuWatts(name) {
    const w = (name || '').match(/(\d{3,4})\s*W\b/i);
    if (w) return parseInt(w[1], 10);
    const nums = (name || '').match(/\d{3,4}/g);
    if (nums) {
        const cand = nums.map(Number).filter(n => n >= 200 && n <= 2000);
        if (cand.length) return cand[0];
    }
    return 0;
}

function estimateComponentPower(item, cat) {
    if (!item) return 0;
    if (cat === 'cpu') {
        const tdp = parseTdp(item.detail);
        return tdp || ({ enthusiast: 150, high: 120, mid: 90, budget: 65 }[item.tier] || 90);
    }
    if (cat === 'gpu') {
        const tdp = parseTdp(item.detail);
        return tdp || ({ enthusiast: 300, high: 220, mid: 150, budget: 90 }[item.tier] || 150);
    }
    if (cat === 'motherboard') return 80;
    if (cat === 'ram') return 20;
    if (cat === 'storage') return 10;
    if (cat === 'cooling') return (item.tier === 'enthusiast' || /custom/i.test(item.name)) ? 30 : 12;
    if (cat === 'case') return 10;
    return 0;
}

function tierRank(t) {
    return { budget: 1, mid: 2, high: 3, enthusiast: 4 }[t] || 2;
}

const COMPAT_ICONS = {
    ok: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
    warn: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>',
    err: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
};

function updateSummary() {
    const list = document.getElementById('summary-list');
    const priceEl = document.getElementById('total-price');
    const compatEl = document.getElementById('compatibility-badge');
    const catLabels = {
        cpu: 'CPU', gpu: 'GPU', motherboard: 'Motherboard',
        ram: 'RAM', storage: 'Storage', cooling: 'Cooling', case: 'Case', psu: 'PSU'
    };

    const entries = Object.entries(selectedComponents);

    if (entries.length === 0) {
        list.innerHTML = `
            <div class="summary-empty">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                <p>Select components to build your PC</p>
            </div>`;
        priceEl.textContent = '£0';
        compatEl.className = 'compatibility-badge';
        compatEl.style.flexDirection = '';
        compatEl.style.alignItems = '';
        compatEl.style.gap = '';
        compatEl.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><span>Select components to start</span>';
        return;
    }

    list.innerHTML = entries.map(([cat, item]) => {
        const gbp = getGbpPrice(item.priceUSD);
        return `
        <div class="summary-item">
            <div>
                <div class="summary-item-label">${catLabels[cat] || cat}</div>
                <div class="summary-item-name">${item.name}</div>
            </div>
            <div style="display:flex;align-items:center">
                <span class="summary-item-price">£${gbp.toLocaleString()}</span>
                <button class="summary-item-remove" data-cat="${cat}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
        </div>`;
    }).join('');

    list.querySelectorAll('.summary-item-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            delete selectedComponents[btn.dataset.cat];
            renderOptions(currentCat);
            updateSummary();
        });
    });

    const total = entries.reduce((sum, [, item]) => sum + getGbpPrice(item.priceUSD), 0);
    priceEl.textContent = `£${total.toLocaleString()}`;

    // ---- Compatibility & fit analysis ----
    const hasCPU = selectedComponents.cpu;
    const hasGPU = selectedComponents.gpu;
    const hasPSU = selectedComponents.psu;
    const hasMB = selectedComponents.motherboard;
    const hasCooling = selectedComponents.cooling;
    const hasRAM = selectedComponents.ram;

    const analysis = []; // each: { sev: 'ok' | 'warn' | 'err', text }

    // Estimated system power draw (CPU + GPU + rest of the system)
    let sysW = 0;
    ['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'cooling', 'case'].forEach(cat => {
        if (selectedComponents[cat]) sysW += estimateComponentPower(selectedComponents[cat], cat);
    });
    if (sysW > 0) sysW += 10; // baseboard / fan overhead

    // PSU fit for the build (covers PSU fit for the CPU + whole system)
    if (hasPSU) {
        const psuW = parsePsuWatts(hasPSU.name);
        if (psuW) {
            if (sysW > 0 && psuW < sysW) {
                analysis.push({ sev: 'err', text: `PSU underpowered — your build draws ~${sysW}W but the ${psuW}W unit won't hold up under load. Risk of shutdowns.` });
            } else if (sysW > 0 && psuW < sysW * 1.25) {
                analysis.push({ sev: 'warn', text: `PSU (${psuW}W) fits your ~${sysW}W build but headroom is tight — fine, just no room for overclocking.` });
            } else if (psuW > Math.ceil(sysW * 1.4 / 50) * 50 * 1.8 && sysW > 0) {
                analysis.push({ sev: 'ok', text: `PSU (${psuW}W) is well over spec for ~${sysW}W — reliable, but you could step down a tier and save.` });
            } else {
                analysis.push({ sev: 'ok', text: `PSU (${psuW}W) is a great match for your ~${sysW}W build — healthy headroom.` });
            }
        } else {
            analysis.push({ sev: 'ok', text: `${hasPSU.name} selected — add the rest of your build for a full wattage check.` });
        }
    } else if (hasCPU || hasGPU) {
        analysis.push({ sev: 'warn', text: 'No PSU selected yet — add one to confirm your build has enough wattage.' });
    }

    // CPU ↔ GPU balance (bottleneck check)
    if (hasCPU && hasGPU) {
        const diff = tierRank(hasGPU.tier) - tierRank(hasCPU.tier);
        if (diff >= 2) {
            analysis.push({ sev: 'warn', text: `Possible CPU bottleneck — ${hasCPU.name} may hold back ${hasGPU.name} at 1080p. A stronger CPU would unlock more FPS.` });
        } else if (diff <= -2) {
            analysis.push({ sev: 'warn', text: `GPU is the limiting part — ${hasGPU.name} is weaker than ${hasCPU.name} deserves. The CPU has headroom for a faster GPU.` });
        } else {
            analysis.push({ sev: 'ok', text: `Well-balanced pairing — ${hasCPU.name} and ${hasGPU.name} are a good match.` });
        }
    }

    // Extra helpful notes
    if (hasCooling && (/custom/i.test(hasCooling.name) || hasCooling.tier === 'enthusiast')) {
        analysis.push({ sev: 'ok', text: `${hasCooling.name} — strong cooling, ideal for sustained loads and overclocking.` });
    }
    if (hasRAM && /DDR5/.test(hasRAM.detail) && hasRAM.priceUSD >= 150) {
        analysis.push({ sev: 'ok', text: 'High-speed DDR5 selected — great for gaming and content creation.' });
    }

    // Render
    if (analysis.length > 0) {
        const worst = analysis.some(a => a.sev === 'err') ? 'error' : analysis.some(a => a.sev === 'warn') ? 'warning' : 'ok';
        const iconKey = worst === 'error' ? 'err' : worst === 'warning' ? 'warn' : 'ok';
        compatEl.className = 'compatibility-badge ' + worst;
        compatEl.style.flexDirection = 'column';
        compatEl.style.alignItems = 'flex-start';
        compatEl.style.gap = '6px';
        compatEl.innerHTML =
            `<div style="display:flex;align-items:center;gap:8px;font-weight:600">${COMPAT_ICONS[iconKey]}&nbsp;Compatibility check</div>` +
            analysis.map(a => `<div style="display:flex;align-items:flex-start;gap:6px;font-size:0.78rem;line-height:1.35"><span style="flex-shrink:0">${COMPAT_ICONS[a.sev]}</span><span>${a.text}</span></div>`).join('');
    } else {
        compatEl.className = 'compatibility-badge warning';
        compatEl.style.flexDirection = '';
        compatEl.style.alignItems = '';
        compatEl.style.gap = '';
        compatEl.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span>Add more parts for compatibility analysis</span>`;
    }
}

document.querySelectorAll('.config-cat').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.config-cat').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCat = btn.dataset.cat;
        renderOptions(currentCat);
    });
});

document.getElementById('config-cta').addEventListener('click', () => {
    const catLabels = { cpu: 'CPU', gpu: 'GPU', motherboard: 'Motherboard', ram: 'RAM', storage: 'Storage', cooling: 'Cooling', case: 'Case', psu: 'PSU' };
    const entries = Object.entries(selectedComponents);
    if (entries.length === 0) {
        alert('Please select at least one component before requesting a build.');
        return;
    }
    const total = entries.reduce((sum, [, item]) => sum + getGbpPrice(item.priceUSD), 0);
    const body = `Hi, I'd like to request the following custom PC build:%0D%0A%0D%0A` +
        entries.map(([cat, item]) => `${catLabels[cat] || cat}: ${item.name} — £${getGbpPrice(item.priceUSD).toLocaleString()}`).join('%0D%0A') +
        `%0D%0A%0D%0ATotal estimated: £${total.toLocaleString()}%0D%0A%0D%0APlease get back to me with availability, final pricing, and build timeline. Thank you!`;
    window.location.href = `mailto:hello@pcbuild.com?subject=${encodeURIComponent('Custom PC Build Request — PC Building UK')}&body=${body}`;
});

renderOptions('cpu');
updateSummary();
startPriceRefresh();

/* ========================================
   BENCHMARK CHARTS
======================================== */
const chartInstances = {};

function initCharts() {
    if (typeof Chart === 'undefined') return;

    const chartObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.chartsInit) {
                entry.target.dataset.chartsInit = 'true';
                createGamingChart();
                createRenderChart();
                createSyntheticChart();
            }
        });
    }, { threshold: 0.2 });

    const benchSection = document.getElementById('benchmark');
    if (benchSection) chartObserver.observe(benchSection);
}

function createGamingChart() {
    if (chartInstances.gaming) return;
    const ctx = document.getElementById('gamingChart');
    if (!ctx) return;
    chartInstances.gaming = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Cyberpunk 2077\n(Ultra RT)', 'Forza Motorsport\n(Extreme)', 'Apex Legends\n(High)', 'Valorant\n(Ultra)', 'Elden Ring\n(Max)', 'MSFS 2024\n(Ultra)'],
            datasets: [{
                label: 'FPS',
                data: [142, 238, 421, 892, 187, 98],
                backgroundColor: ['#0066ff', '#0066ff', '#00c853', '#00c853', '#ff6b00', '#ff6b00'],
                borderRadius: 6,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1a1a1a',
                    titleColor: '#fff',
                    bodyColor: '#a0a0a0',
                    borderColor: '#333',
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: ctx => `${ctx.raw} FPS`
                    }
                }
            },
            scales: {
                x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666', font: { size: 9 } } },
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666' }, beginAtZero: true }
            },
            animation: { duration: 1200, easing: 'easeOutQuart' }
        }
    });
}

function createRenderChart() {
    if (chartInstances.render) return;
    const ctx = document.getElementById('renderChart');
    if (!ctx) return;
    chartInstances.render = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['RTX 4090\n+ 7950X3D', 'RTX 4080S\n+ i9-14900K', 'RTX 4070 Ti S\n+ i7-14700K', 'RTX 4060\n+ i5-14600K', 'RX 7900XTX\n+ R9 7900X', 'RTX 3090\n+ i9-12900K'],
            datasets: [{
                label: 'Minutes',
                data: [2.1, 2.8, 3.4, 5.1, 3.9, 4.6],
                backgroundColor: '#00d4ff',
                borderRadius: 6,
                borderSkipped: false,
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1a1a1a',
                    titleColor: '#fff',
                    bodyColor: '#a0a0a0',
                    borderColor: '#333',
                    borderWidth: 1,
                    padding: 10,
                    callbacks: { label: ctx => `${ctx.raw} min` }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#666' },
                    beginAtZero: true,
                    title: { display: true, text: 'Minutes', color: '#666', font: { size: 10 } }
                },
                y: { grid: { display: false }, ticks: { color: '#888', font: { size: 9 } } }
            },
            animation: { duration: 1400, easing: 'easeOutQuart' }
        }
    });
}

function createSyntheticChart() {
    if (chartInstances.synthetic) return;
    const ctx = document.getElementById('syntheticChart');
    if (!ctx) return;
    chartInstances.synthetic = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Time Spy\nExtreme', 'Port Royal\n(RT)', 'CPU Profile\n(16T)', 'Fire Strike\nUltra', 'Speed Way', 'Night Raid'],
            datasets: [{
                label: 'Score',
                data: [20196, 26381, 1842, 29104, 10044, 19283],
                backgroundColor: (ctx) => {
                    const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 180);
                    gradient.addColorStop(0, '#0066ff');
                    gradient.addColorStop(1, '#00d4ff');
                    return gradient;
                },
                borderRadius: 6,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1a1a1a',
                    titleColor: '#fff',
                    bodyColor: '#a0a0a0',
                    borderColor: '#333',
                    borderWidth: 1,
                    padding: 10,
                    callbacks: { label: ctx => `Score: ${ctx.raw.toLocaleString()}` }
                }
            },
            scales: {
                x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666', font: { size: 9 } } },
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666' }, beginAtZero: true }
            },
            animation: { duration: 1600, easing: 'easeOutQuart' }
        }
    });
}

initCharts();

/* ========================================
   INITIAL STATE
======================================== */
highlightActiveNav();
