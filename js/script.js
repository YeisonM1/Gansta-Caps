/* =======================================================
   SCRIPT.JS OPTIMIZADO - RESPONSIVE Y MOBILE-FIRST
   ======================================================= */

document.addEventListener('DOMContentLoaded', () => {
    
    // ===== INICIALIZACIÓN =====
    initTextAnimation();
    initHeroSlider();
    initDropdown();
    initMobileMenu();
    initPerformanceOptimizations();
});

/* =======================================================
   ANIMACIÓN DE TEXTO DEL LOGO (SOLO DESKTOP)
   ======================================================= */
function initTextAnimation() {
    const texto = document.querySelector('.parte-logo__texto');
    
    // Solo ejecutar en dispositivos con suficiente ancho de pantalla
    if (window.innerWidth > 768 && texto) {
        const textoCompleto = texto.textContent;
        texto.textContent = '';
        texto.style.opacity = 1;
        texto.style.borderRight = '2px solid white';

        let i = 0;
        const intervalo = setInterval(() => {
            texto.textContent += textoCompleto[i];
            i++;
            if (i === textoCompleto.length) {
                clearInterval(intervalo);
                // Quitar cursor al final
                setTimeout(() => {
                    texto.style.borderRight = 'none';
                }, 500);
            }
        }, 150);
    }
}

/* =======================================================
   HERO SLIDER (FUNCIONALIDAD ORIGINAL OPTIMIZADA)
   ======================================================= */
function initHeroSlider() {
    const slider = document.querySelector('.hero-slider');
    if (!slider) return;

    const track = slider.querySelector('.hero-track');
    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    const dots = Array.from(slider.querySelectorAll('.hero-dots [role="tab"]'));
    const btnPrev = slider.querySelector('.hero-arrow.prev');
    const btnNext = slider.querySelector('.hero-arrow.next');

    if (!track || slides.length === 0) return;

    const INTERVAL = 4000;
    let index = 0;
    let timer = null;
    let isUserInteracting = false;

    // Función para ir a un slide específico
    function goTo(i) {
        index = (i + slides.length) % slides.length;
        
        if (track) {
            track.style.transform = `translateX(-${index * 100}%)`;
        }

        // Actualizar slides activos
        slides.forEach((slide, k) => {
            slide.classList.toggle('is-active', k === index);
            slide.setAttribute('aria-hidden', k === index ? 'false' : 'true');
        });

        // Actualizar dots
        dots.forEach((dot, k) => {
            dot.setAttribute('aria-selected', k === index ? 'true' : 'false');
        });
    }

    // Navegación
    const next = () => goTo(index + 1);
    const prev = () => goTo(index - 1);

    // Auto-play con respeto a preferencias de usuario
    function startAutoplay() {
        stopAutoplay();
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (isUserInteracting) return;
        timer = setInterval(next, INTERVAL);
    }

    function stopAutoplay() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }

    function resetAutoplay() {
        isUserInteracting = true;
        stopAutoplay();
        setTimeout(() => {
            isUserInteracting = false;
            startAutoplay();
        }, 1000);
    }

    // Event listeners para flechas
    if (btnNext) {
        btnNext.addEventListener('click', () => {
            next();
            resetAutoplay();
        });
    }

    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            prev();
            resetAutoplay();
        });
    }

    // Event listeners para dots
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            goTo(i);
            resetAutoplay();
        });
    });

    // Pausar/reanudar con mouse
    slider.addEventListener('mouseenter', stopAutoplay);
    slider.addEventListener('mouseleave', () => {
        if (!isUserInteracting) startAutoplay();
    });

    // Navegación con teclado
    slider.setAttribute('tabindex', '0');
    slider.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowRight':
                next();
                resetAutoplay();
                break;
            case 'ArrowLeft':
                prev();
                resetAutoplay();
                break;
        }
    });

    // Pausar cuando la pestaña no está visible
    document.addEventListener('visibilitychange', () => {
        document.hidden ? stopAutoplay() : startAutoplay();
    });

    // Touch/swipe support optimizado
    let touchStartX = null;
    let touchStartY = null;
    let isDragging = false;

    const handleTouchStart = (e) => {
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        isDragging = false;
        stopAutoplay();
    };

    const handleTouchMove = (e) => {
        if (!touchStartX || !touchStartY) return;
        
        const touch = e.touches[0];
        const diffX = touch.clientX - touchStartX;
        const diffY = touch.clientY - touchStartY;
        
        // Solo considerar como drag horizontal si el movimiento es principalmente horizontal
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
            isDragging = true;
            e.preventDefault(); // Prevenir scroll
        }
    };

    const handleTouchEnd = (e) => {
        if (!touchStartX || !isDragging) {
            startAutoplay();
            return;
        }

        const touch = e.changedTouches[0];
        const diffX = touch.clientX - touchStartX;
        const threshold = 50;

        if (Math.abs(diffX) > threshold) {
            diffX < 0 ? next() : prev();
        }

        touchStartX = null;
        touchStartY = null;
        isDragging = false;
        resetAutoplay();
    };

    // Agregar listeners de touch
    slider.addEventListener('touchstart', handleTouchStart, { passive: true });
    slider.addEventListener('touchmove', handleTouchMove, { passive: false });
    slider.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Inicializar
    goTo(0);
    startAutoplay();
}

/* =======================================================
   DROPDOWN MENU (FUNCIONALIDAD ORIGINAL)
   ======================================================= */
function initDropdown() {
    const dropdown = document.querySelector('[data-dropdown]');
    if (!dropdown) return;

    const trigger = dropdown.querySelector('.dropdown__chevBtn');
    const menu = dropdown.querySelector('.dropdown__menu');
    const menuItems = dropdown.querySelectorAll('.dropdown__item');

    if (!trigger || !menu) return;

    let isOpen = false;

    function openDropdown() {
        isOpen = true;
        dropdown.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        
        // Focus en el primer item del menú
        if (menuItems.length > 0) {
            menuItems[0].focus();
        }
    }

    function closeDropdown() {
        isOpen = false;
        dropdown.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
    }

    function toggleDropdown() {
        isOpen ? closeDropdown() : openDropdown();
    }

    // Click en el trigger
    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleDropdown();
    });

    // Cerrar al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            closeDropdown();
        }
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) {
            closeDropdown();
            trigger.focus();
        }
    });

    // Navegación con teclado dentro del menú
    menu.addEventListener('keydown', (e) => {
        if (!isOpen) return;

        const currentIndex = Array.from(menuItems).indexOf(e.target);
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0;
                menuItems[nextIndex].focus();
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1;
                menuItems[prevIndex].focus();
                break;
                
            case 'Tab':
                // Cerrar si se sale del menú con Tab
                if (!menu.contains(e.target.nextElementSibling)) {
                    closeDropdown();
                }
                break;
        }
    });
}

/* =======================================================
   MENÚ HAMBURGUESA MÓVIL
   ======================================================= */
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navegacionMobile = document.getElementById('navegacionMobile');
    const navMobileLinks = document.querySelectorAll('.nav-mobile-link');

    if (!menuToggle || !navegacionMobile) return;

    let isMenuOpen = false;

    function openMobileMenu() {
        isMenuOpen = true;
        menuToggle.classList.add('active');
        navegacionMobile.classList.add('active');
        menuToggle.setAttribute('aria-expanded', 'true');
        
        // Prevenir scroll del body
        document.body.style.overflow = 'hidden';
        
        // Focus en el primer enlace
        if (navMobileLinks.length > 0) {
            navMobileLinks[0].focus();
        }
    }

    function closeMobileMenu() {
        isMenuOpen = false;
        menuToggle.classList.remove('active');
        navegacionMobile.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        
        // Restaurar scroll del body
        document.body.style.overflow = 'auto';
    }

    function toggleMobileMenu() {
        isMenuOpen ? closeMobileMenu() : openMobileMenu();
    }

    // Click en botón hamburguesa
    menuToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMobileMenu();
    });

    // Cerrar al hacer click en enlaces del menú
    navMobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });

    // Cerrar al hacer click fuera del menú
    document.addEventListener('click', (e) => {
        if (isMenuOpen && !navegacionMobile.contains(e.target) && !menuToggle.contains(e.target)) {
            closeMobileMenu();
        }
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMenuOpen) {
            closeMobileMenu();
            menuToggle.focus();
        }
    });

    // Cerrar al hacer scroll (UX móvil)
    let lastScrollY = window.scrollY;
    let scrollTimeout;

    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        
        // Solo cerrar si se hace scroll significativo hacia abajo
        if (isMenuOpen && currentScrollY > lastScrollY + 50) {
            closeMobileMenu();
        }
        
        lastScrollY = currentScrollY;
    };

    // Throttle del scroll event
    window.addEventListener('scroll', () => {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
                handleScroll();
                scrollTimeout = null;
            }, 100);
        }
    }, { passive: true });

    // Cerrar al cambiar orientación
    window.addEventListener('orientationchange', () => {
        if (isMenuOpen) {
            setTimeout(closeMobileMenu, 100);
        }
    });

    // Cerrar automáticamente si cambia a desktop
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    mediaQuery.addListener((mq) => {
        if (mq.matches && isMenuOpen) {
            closeMobileMenu();
        }
    });
}

/* =======================================================
   OPTIMIZACIONES DE PERFORMANCE
   ======================================================= */
function initPerformanceOptimizations() {
    
    // Lazy loading para imágenes que no tienen loading="lazy"
    const images = document.querySelectorAll('img:not([loading])');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.loading = 'lazy';
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    // Optimización de resize events
    let resizeTimeout;
    window.addEventListener('resize', () => {
        if (!resizeTimeout) {
            resizeTimeout = setTimeout(() => {
                // Aquí puedes agregar lógica que necesite ejecutarse en resize
                // Por ejemplo, recalcular posiciones, etc.
                resizeTimeout = null;
            }, 150);
        }
    }, { passive: true });

    // Preload de recursos críticos
    const preloadCriticalResources = () => {
        const criticalImages = [
            'img/banner.jpg',
            'img/logo.svg'
        ];

        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    };

    // Solo precargar si no hay conexión lenta
    if ('connection' in navigator) {
        if (navigator.connection.effectiveType !== 'slow-2g') {
            preloadCriticalResources();
        }
    } else {
        preloadCriticalResources();
    }

    // Optimización para dispositivos de bajo rendimiento
    const optimizeForLowEndDevices = () => {
        // Reducir animaciones en dispositivos lentos
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
            document.documentElement.style.setProperty('--animation-duration', '0.1s');
        }

        // Simplificar efectos visuales en móviles de baja gama
        if ('deviceMemory' in navigator && navigator.deviceMemory <= 2) {
            const style = document.createElement('style');
            style.textContent = `
                .card-producto:hover { transform: none !important; }
                .hero-media { transform: none !important; }
            `;
            document.head.appendChild(style);
        }
    };

    optimizeForLowEndDevices();
}

/* =======================================================
   UTILIDADES ADICIONALES
   ======================================================= */

// Función para detectar si es dispositivo móvil
function isMobileDevice() {
    return window.innerWidth <= 768 || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Función para detectar soporte de hover real
function hasHoverSupport() {
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

// Throttle function para eventos frecuentes
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounce function para eventos que necesitan procesamiento pesado
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Función para manejar errores de carga de imágenes
function handleImageErrors() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        img.addEventListener('error', () => {
            // Placeholder o imagen por defecto
            console.warn(`Error cargando imagen: ${img.src}`);
            // Podrías agregar una imagen placeholder aquí
            // img.src = 'img/placeholder.jpg';
        });
    });
}

// Inicializar manejo de errores al cargar el DOM
document.addEventListener('DOMContentLoaded', handleImageErrors);

/* =======================================================
   ACCESIBILIDAD Y FOCUS MANAGEMENT
   ======================================================= */

// Mejorar navegación por teclado
document.addEventListener('keydown', (e) => {
    // Skip links para navegación rápida
    if (e.key === 'Tab' && e.shiftKey && document.activeElement === document.body) {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Saltar al contenido principal';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: #000;
            color: #fff;
            padding: 8px;
            text-decoration: none;
            z-index: 1000;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }
});

// Anunciar cambios dinámicos a lectores de pantalla
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.textContent = message;
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

/* =======================================================
   EXPORT PARA TESTING (SI ES NECESARIO)
   ======================================================= */
if (typeof window !== 'undefined') {
    window.GanstaCapsUtils = {
        isMobileDevice,
        hasHoverSupport,
        throttle,
        debounce,
        announceToScreenReader
    };
}