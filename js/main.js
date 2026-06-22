// ============================================================
// SCROLL-TRIGGERED DESK ANIMATION
// ============================================================
(function() {
    const hero = document.getElementById('hero');
    const heroTopContent = document.getElementById('heroTopContent');
    const deskSurface = document.getElementById('deskSurface');
    const deskItems = document.querySelectorAll('.desk-item');
    const heroActions = document.getElementById('heroActions');
    const scrollHint = document.getElementById('scrollHint');

    // Ensure ALL desk items start completely hidden
    deskItems.forEach(item => {
        item.classList.remove('visible');
        item.style.opacity = '0';
        item.style.transform = 'scale(0.8)';
        item.style.pointerEvents = 'none';
    });

    // Hide actions and desk surface initially
    if (heroActions) {
        heroActions.classList.remove('visible');
        heroActions.style.opacity = '0';
        heroActions.style.pointerEvents = 'none';
    }

    if (deskSurface) {
        deskSurface.style.opacity = '0';
    }

    let isComplete = false;

    function updateHero() {
        const rect = hero.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Scroll progress: 0 = hero fully visible, 1 = hero fully scrolled past
        const scrollProgress = Math.max(0, Math.min(1, (windowHeight - rect.top) / (windowHeight * 1.3)));

        // 1. TOP CONTENT (Logo + Slogan): Shrink and fade
        if (heroTopContent) {
            const scale = Math.max(0.3, 1 - scrollProgress * 0.7);
            const opacity = Math.max(0, 1 - scrollProgress * 1.3);
            heroTopContent.style.transform = `scale(${scale})`;
            heroTopContent.style.opacity = opacity;
            heroTopContent.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        }

        // 2. DESK SURFACE: Appear after 15% scroll
        if (deskSurface) {
            const deskOpacity = Math.min(1, Math.max(0, (scrollProgress - 0.1) * 4));
            deskSurface.style.opacity = deskOpacity;
            deskSurface.style.transition = 'opacity 0.5s ease';
        }

        // 3. DESK ITEMS: Each item appears at different scroll positions
        deskItems.forEach((item) => {
            const delay = parseFloat(item.dataset.delay) || 0;
            // Start appearing from 15% + delay, complete by 70%
            const startThreshold = 0.15 + delay * 0.1;
            const endThreshold = 0.15 + delay * 0.1 + 0.4;
            
            let itemProgress = 0;
            if (scrollProgress > startThreshold) {
                itemProgress = Math.min(1, (scrollProgress - startThreshold) / (endThreshold - startThreshold));
            }
            
            // Apply styles based on progress
            if (itemProgress > 0.05) {
                item.classList.add('visible');
                item.style.opacity = Math.min(1, itemProgress * 1.5);
                item.style.pointerEvents = 'none';
                
                // Scale from 0.7 to 1
                const scale = 0.7 + itemProgress * 0.3;
                // Preserve rotation but apply scale
                const currentTransform = window.getComputedStyle(item).transform;
                if (currentTransform === 'none') {
                    item.style.transform = `scale(${scale})`;
                } else {
                    // Try to extract rotation and apply scale
                    const match = currentTransform.match(/rotate\(([^)]+)\)/);
                    if (match) {
                        const rotation = match[1];
                        item.style.transform = `rotate(${rotation}) scale(${scale})`;
                    } else {
                        item.style.transform = `scale(${scale})`;
                    }
                }
            } else {
                item.classList.remove('visible');
                item.style.opacity = '0';
                item.style.pointerEvents = 'none';
            }
        });

        // 4. HERO ACTIONS: Appear when desk is mostly assembled (after 70% scroll)
        if (scrollProgress > 0.7 && !isComplete) {
            isComplete = true;
            if (heroActions) {
                heroActions.classList.add('visible');
                heroActions.style.opacity = '1';
                heroActions.style.pointerEvents = 'auto';
                heroActions.style.transition = 'opacity 0.8s ease';
            }
            if (scrollHint) {
                scrollHint.style.opacity = '0';
                scrollHint.style.transition = 'opacity 0.6s ease';
            }
        }

        // 5. SCROLL HINT: Fade out gradually
        if (scrollHint && scrollProgress > 0.1) {
            const hintOpacity = Math.max(0, 1 - (scrollProgress - 0.1) * 5);
            scrollHint.style.opacity = hintOpacity;
        }
    }

    // Throttled scroll handler with requestAnimationFrame
    let ticking = false;
    let animationId = null;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateHero();
                ticking = false;
            });
            ticking = true;
        }
    });

    // Also update on resize and orientation change
    window.addEventListener('resize', () => {
        if (animationId) cancelAnimationFrame(animationId);
        animationId = requestAnimationFrame(updateHero);
    });

    window.addEventListener('orientationchange', () => {
        setTimeout(updateHero, 300);
    });

    // Force initial update after DOM is ready
    setTimeout(updateHero, 100);
    setTimeout(updateHero, 300);
    setTimeout(updateHero, 600);

    // Also update on theme change (dark/light)
    const themeObserver = new MutationObserver(() => {
        setTimeout(updateHero, 100);
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();


// ============================================================
// LOADING PROGRESS
// ============================================================
const loadingItems = { total: 0, loaded: 0, progress: 0 };
const loadingOverlay = document.getElementById('loading-overlay');
const progressBar = document.getElementById('loading-progress-bar');
const percentageDisplay = document.getElementById('loading-percentage');
const loadingText = document.getElementById('loading-text');

function updateLoadingProgress() {
    const percent = Math.min(Math.round((loadingItems.loaded / loadingItems.total) * 100), 100);
    loadingItems.progress = percent;
    progressBar.style.width = percent + '%';
    percentageDisplay.textContent = percent + '%';
    
    if (percent < 30) loadingText.textContent = 'Initializing...';
    else if (percent < 60) loadingText.textContent = 'Loading resources...';
    else if (percent < 85) loadingText.textContent = 'Preparing content...';
    else if (percent < 100) loadingText.textContent = 'Almost ready...';
    else loadingText.textContent = 'Complete!';

    if (percent >= 100) {
        setTimeout(() => loadingOverlay.classList.add('hidden'), 400);
    }
}

function trackLoadedItem() {
    loadingItems.loaded++;
    updateLoadingProgress();
}


// ============================================================
// HEADER SCROLL
// ============================================================
function handleHeaderScroll() {
    const header = document.getElementById('main-header');
    if (window.pageYOffset > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

window.addEventListener('scroll', () => {
    handleHeaderScroll();
});


// ============================================================
// THEME MANAGER
// ============================================================
class ThemeManager {
    constructor() {
        this.btn = document.getElementById('theme-toggle');
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.applyTheme(this.currentTheme);
        this.btn.addEventListener('click', () => this.toggleTheme());
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        this.currentTheme = newTheme;
    }

    applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            this.btn.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.documentElement.removeAttribute('data-theme');
            this.btn.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }
}


// ============================================================
// LANGUAGE MANAGER
// ============================================================
const TRANSLATIONS = {
    en: {
        'nav.home': 'Home',
        'nav.services': 'Services',
        'nav.portfolio': 'Projects',
        'nav.about': 'About',
        'nav.contact': 'Contact',
        'hero.cta.portfolio': 'View Our Work',
        'hero.cta.contact': "Let's Talk",
        'services.title': 'Our Services',
        'services.subtitle': 'From concept to execution, we deliver design solutions that make your brand stand out.',
        'services.graphic.title': 'Graphic Design',
        'services.graphic.desc': 'We create visually stunning designs that communicate your brand\'s message effectively. From logos to complete brand identities.',
        'services.motion.title': 'Motion Design',
        'services.motion.desc': 'Bring your ideas to life with captivating motion graphics and animations. Perfect for explainer videos and social media.',
        'services.web.title': 'Web Design',
        'services.web.desc': 'We design responsive, user-friendly websites that not only look great but perform exceptionally across all devices.',
        'portfolio.title': 'Our Projects',
        'portfolio.subtitle': 'Browse our work — click a project to preview it in detail.',
        'portfolio.filter.all': 'All',
        'portfolio.filter.graphic': 'Graphic',
        'portfolio.filter.motion': 'Motion',
        'portfolio.filter.web': 'Web',
        'portfolio.search': 'Search projects...',
        'portfolio.select': 'Select a project from the list',
        'portfolio.projects': 'Projects',
        'portfolio.loading': 'Loading projects...',
        'about.title': 'About the Founder',
        'about.name': 'Wassef Ben Slimane',
        'about.role': 'Lead Designer & Creative Director',
        'about.desc1': 'A polyvalent creative with over 10 years of experience bridging design, gaming, and AI. Based in Tunisia, I\'ve had the privilege of working with clients across France, Germany, Japan, USA, Hong Kong, and Malaysia — bringing a global perspective to every project.',
        'about.desc2': 'My journey has been shaped by diverse roles: I\'m a proud Capcom Ambassador in the gaming industry, a certified Adobe Trainer, a certified Unreal Engine 5 Game Designer, and a Google Certified Generative AI Engineer. These experiences allow me to blend traditional design with cutting-edge technology.',
        'about.desc3': 'Beyond design, I\'m deeply committed to giving back. I\'ve served in numerous charitable volunteer initiatives and currently act as Treasurer in a sports association — because I believe great design is about more than aesthetics; it\'s about making a positive impact.',
        'contact.title': 'Get In Touch',
        'contact.subtitle': 'Have a project in mind? We\'d love to hear about it.',
        'contact.info.title': 'Contact Information',
        'contact.info.desc': 'Reach out to us for any inquiries about our services or to discuss your next project.',
        'contact.name': 'Name',
        'contact.email': 'Email',
        'contact.subject': 'Subject',
        'contact.message': 'Message',
        'contact.submit': 'Send Message',
        'footer.companyTitle': 'Tunetek Studio Design',
        'footer.companyDesc': 'We craft modern branding, web design, and motion graphics that help businesses grow with clear visuals and smooth experiences.',
        'footer.quickLinksTitle': 'Quick Links',
        'footer.linkHome': 'Home',
        'footer.linkServices': 'Services',
        'footer.linkProjects': 'Projects',
        'footer.linkFounder': 'About',
        'footer.linkContact': 'Contact',
        'footer.contactTitle': 'Contact',
        'footer.socialTitle': 'Follow Us',
        'footer.copyright': '© 2016 - 2026 Tunetek Studio Design. All rights reserved.',
        'footer.credit': 'Created with ❤ by Wassef Ben Slimane'
    },
    fr: {
        'nav.home': 'Accueil',
        'nav.services': 'Services',
        'nav.portfolio': 'Projets',
        'nav.about': 'À propos',
        'nav.contact': 'Contact',
        'hero.cta.portfolio': 'Voir nos travaux',
        'hero.cta.contact': 'Contactez-nous',
        'services.title': 'Nos Services',
        'services.subtitle': 'Du concept à la réalisation, nous livrons des solutions de design qui font ressortir votre marque.',
        'services.graphic.title': 'Design Graphique',
        'services.graphic.desc': 'Nous créons des designs visuellement époustouflants qui communiquent efficacement le message de votre marque. Des logos aux identités complètes.',
        'services.motion.title': 'Motion Design',
        'services.motion.desc': 'Donnez vie à vos idées avec des animations et motion graphics captivantes. Parfaits pour les vidéos explicatives et les réseaux sociaux.',
        'services.web.title': 'Design Web',
        'services.web.desc': 'Nous concevons des sites web responsifs et conviviaux qui sont à la fois magnifiques et performants sur tous les appareils.',
        'portfolio.title': 'Nos Projets',
        'portfolio.subtitle': 'Parcourez notre travail — cliquez sur un projet pour le prévisualiser en détail.',
        'portfolio.filter.all': 'Tous',
        'portfolio.filter.graphic': 'Graphique',
        'portfolio.filter.motion': 'Motion',
        'portfolio.filter.web': 'Web',
        'portfolio.search': 'Rechercher des projets...',
        'portfolio.select': 'Sélectionnez un projet dans la liste',
        'portfolio.projects': 'Projets',
        'portfolio.loading': 'Chargement des projets...',
        'about.title': 'À propos du Fondateur',
        'about.name': 'Wassef Ben Slimane',
        'about.role': 'Designer Principal & Directeur Créatif',
        'about.desc1': 'Un créatif polyvalent avec plus de 10 ans d\'expérience à la croisée du design, du gaming et de l\'IA. Basé en Tunisie, j\'ai eu le privilège de travailler avec des clients à travers la France, l\'Allemagne, le Japon, les États-Unis, Hong Kong et la Malaisie — apportant une perspective globale à chaque projet.',
        'about.desc2': 'Mon parcours a été façonné par des rôles divers : je suis un fier Ambassadeur Capcom dans l\'industrie du jeu vidéo, un Formateur Certifié Adobe, un Concepteur de Jeux Certifié Unreal Engine 5, et un Ingénieur IA Générative Certifié Google. Ces expériences me permettent de fusionner le design traditionnel avec la technologie de pointe.',
        'about.desc3': 'Au-delà du design, je suis profondément engagé à redonner. J\'ai participé à de nombreuses initiatives bénévoles caritatives et je suis actuellement Trésorier dans une association sportive — parce que je crois qu\'un bon design va au-delà de l\'esthétique ; il s\'agit d\'avoir un impact positif.',
        'contact.title': 'Contactez-nous',
        'contact.subtitle': 'Vous avez un projet en tête ? Nous serions ravis d\'en discuter.',
        'contact.info.title': 'Informations de contact',
        'contact.info.desc': 'Contactez-nous pour toute question sur nos services ou pour discuter de votre prochain projet.',
        'contact.name': 'Nom',
        'contact.email': 'Email',
        'contact.subject': 'Sujet',
        'contact.message': 'Message',
        'contact.submit': 'Envoyer le message',
        'footer.companyTitle': 'Tunetek Studio Design',
        'footer.companyDesc': 'Nous créons des identités de marque, des sites web et des animations qui aident les entreprises à grandir grâce à des visuels clairs et des expériences fluides.',
        'footer.quickLinksTitle': 'Liens rapides',
        'footer.linkHome': 'Accueil',
        'footer.linkServices': 'Services',
        'footer.linkProjects': 'Projets',
        'footer.linkFounder': 'À propos',
        'footer.linkContact': 'Contact',
        'footer.contactTitle': 'Contact',
        'footer.socialTitle': 'Suivez-nous',
        'footer.copyright': '© 2016 - 2026 Tunetek Studio Design. Tous droits réservés.',
        'footer.credit': 'Créé avec ❤ par Wassef Ben Slimane'
    }
};

class LanguageManager {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'en';
        this.elements = document.querySelectorAll('[data-i18n]');
        this.langEnBtn = document.getElementById('lang-en');
        this.langFrBtn = document.getElementById('lang-fr');
        this.setupListeners();
        this.applyLanguage(this.currentLang);
    }

    setupListeners() {
        this.langEnBtn.addEventListener('click', () => this.setLanguage('en'));
        this.langFrBtn.addEventListener('click', () => this.setLanguage('fr'));
    }

    setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('language', lang);
        this.applyLanguage(lang);
        this.langEnBtn.classList.toggle('active', lang === 'en');
        this.langFrBtn.classList.toggle('active', lang === 'fr');
    }

    applyLanguage(lang) {
        this.elements.forEach(el => {
            const key = el.dataset.i18n;
            if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = TRANSLATIONS[lang][key];
                } else {
                    el.innerHTML = TRANSLATIONS[lang][key];
                }
            }
        });
    }
}


// ============================================================
// SCROLL ANIMATIONS (Fade In)
// ============================================================
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    document.querySelectorAll('.fade-in, .service-card, .about-grid .fade-in, .contact-info, .contact-form').forEach(el => {
        observer.observe(el);
    });
}


// ============================================================
// SMOOTH NAVIGATION
// ============================================================
function setupSmoothNavigation() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const headerHeight = document.getElementById('main-header').offsetHeight;
                window.scrollTo({
                    top: target.getBoundingClientRect().top + window.pageYOffset - headerHeight,
                    behavior: 'smooth'
                });
                document.getElementById('nav-container').classList.remove('active');
                document.getElementById('hamburger').innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    });
}


// ============================================================
// CONTACT FORM
// ============================================================
function setupContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        btn.disabled = true;
        
        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { 'Accept': 'application/json' }
            });
            
            if (response.ok) {
                btn.innerHTML = '<i class="fas fa-check"></i> Sent!';
                form.reset();
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }, 3000);
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error';
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 3000);
        }
    });
}


// ============================================================
// HAMBURGER MENU
// ============================================================
function setupHamburgerMenu() {
    const hamburger = document.getElementById('hamburger');
    const navContainer = document.getElementById('nav-container');
    
    if (hamburger && navContainer) {
        hamburger.addEventListener('click', () => {
            navContainer.classList.toggle('active');
            hamburger.innerHTML = navContainer.classList.contains('active') ? 
                '<i class="fas fa-times"></i>' : 
                '<i class="fas fa-bars"></i>';
        });
    }
}


// ============================================================
// HERO MUTE (removed video, keeping for compatibility)
// ============================================================
function setupHeroMute() {
    // Hero video was removed, but keeping function for compatibility
}


// ============================================================
// FILE MANIFEST (for portfolio)
// ============================================================
const GITHUB_BASE = 'https://raw.githubusercontent.com/WBenz/Tunetek-Studio-Design/main/';

const PROJECT_MANIFEST = {
    graphic: [
        // ... (Add your graphic project files here)
    ],
    motion: [
        // ... (Add your motion project files here)
    ],
    web: [
        // ... (Add your web project files here)
    ]
};


// ============================================================
// PORTFOLIO MANAGER (Simplified version)
// ============================================================
class PortfolioManager {
    constructor() {
        this.allProjects = { graphic: [], motion: [], web: [] };
        this.loadProjects();
    }

    loadProjects() {
        // Load projects from manifest
        // This is a simplified version - full version would process files
        console.log('Portfolio loaded');
    }
}


// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize managers
    const theme = new ThemeManager();
    const language = new LanguageManager();
    const portfolio = new PortfolioManager();
    
    // Setup features
    setupScrollAnimations();
    setupSmoothNavigation();
    setupContactForm();
    setupHamburgerMenu();
    
    // Initial loading progress
    loadingItems.total = 3;
    trackLoadedItem();
    trackLoadedItem();
    trackLoadedItem();
    
    console.log('Tunetek Studio Design initialized successfully!');
});