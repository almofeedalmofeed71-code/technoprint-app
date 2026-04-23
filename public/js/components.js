/**
 * TECHOPRINT 2026 - COMPONENTS MODULE
 * Reusable UI Components: Slider, Portal Cards, Glass Panels
 */

// ==================== PREMIUM BANNER SLIDER ====================
const PremiumSlider = {
    currentSlide: 0,
    totalSlides: 4,
    interval: null,
    
    init() {
        const sliderTrack = document.getElementById('sliderTrack');
        const dots = document.querySelectorAll('.dot');
        if (!sliderTrack || !dots.length) return;
        
        this.goToSlide(0);
        this.startAutoSlide();
        
        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                this.stopAutoSlide();
                this.goToSlide(i);
                this.startAutoSlide();
            });
        });
    },
    
    goToSlide(index) {
        this.currentSlide = index;
        const sliderTrack = document.getElementById('sliderTrack');
        if (sliderTrack) {
            sliderTrack.style.transform = `translateX(${index * -25}%)`;
        }
        document.querySelectorAll('.dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    },
    
    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.goToSlide(this.currentSlide);
    },
    
    startAutoSlide() {
        this.interval = setInterval(() => this.nextSlide(), 5000);
    },
    
    stopAutoSlide() {
        if (this.interval) clearInterval(this.interval);
    }
};

// ==================== PORTAL CARDS ====================
const PortalCards = {
    portals: [
        { id: 'student', icon: 'fa-graduation-cap', titleKey: 'studentTitle', descKey: 'studentDesc', features: ['library', 'orders', 'tracking', 'upload'], gold: true },
        { id: 'teacher', icon: 'fa-chalkboard-teacher', titleKey: 'teacherTitle', descKey: 'teacherDesc' },
        { id: 'designer', icon: 'fa-palette', titleKey: 'designerTitle', descKey: 'designerDesc' },
        { id: 'publisher', icon: 'fa-book-open', titleKey: 'publisherTitle', descKey: 'publisherDesc' },
        { id: 'library', icon: 'fa-landmark', titleKey: 'libraryTitle', descKey: 'libraryDesc' },
        { id: 'ai', icon: 'fa-robot', titleKey: 'aiTitle', descKey: 'aiDesc' },
        { id: 'delivery', icon: 'fa-truck', titleKey: 'deliveryTitle', descKey: 'deliveryDesc' },
        { id: 'admin', icon: 'fa-crown', titleKey: 'adminTitle', descKey: 'adminDesc', gold: true },
        { id: 'guest', icon: 'fa-user-secret', titleKey: 'guestTitle', descKey: 'guestDesc' }
    ],
    
    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = this.portals.map(p => `
            <div class="portal-card ${p.id}-portal" onclick="openPortal('${p.id}')">
                <div class="portal-icon"><i class="fas ${p.icon}"></i></div>
                <h2 data-i18n-portal="${p.titleKey}">${window.i18n?.t('portal.' + p.titleKey) || ''}</h2>
                <p data-i18n-portal="${p.descKey}">${window.i18n?.t('portal.' + p.descKey) || ''}</p>
                ${p.features ? `<div class="portal-features">
                    ${p.features.map(f => `<span class="feature-tag" data-i18n-portal="f${f.charAt(0).toUpperCase() + f.slice(1)}">${window.i18n?.t('portal.f' + f.charAt(0).toUpperCase() + f.slice(1)) || ''}</span>`).join('')}
                </div>` : ''}
                <button class="portal-btn ${p.gold ? 'gold' : ''}">
                    <i class="fas ${p.id === 'student' ? 'fa-user-graduate' : 'fa-sign-in-alt'}"></i>
                    <span data-i18n-portal="enter${p.id.charAt(0).toUpperCase() + p.id.slice(1)}">${window.i18n?.t('portal.enter' + p.id.charAt(0).toUpperCase() + p.id.slice(1)) || 'Enter'}</span>
                </button>
            </div>
        `).join('');
    }
};

// ==================== TOAST NOTIFICATIONS ====================
const Toast = {
    show(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    }
};
window.showToast = (m, t) => Toast.show(m, t);

// ==================== GLASS PANEL ====================
const GlassPanel = {
    apply(elements) {
        elements.forEach(el => el.classList.add('glass-panel'));
    }
};

// ==================== SPLASH SCREEN ====================
const SplashScreen = {
    hide() {
        setTimeout(() => {
            const splash = document.getElementById('splashScreen');
            if (splash) splash.style.display = 'none';
        }, 3000);
    }
};

// ==================== HORIZONTAL SCROLL ====================
const HorizontalScroll = {
    init() {
        document.querySelectorAll('.horizontal-scroll-section').forEach(section => {
            let startX = 0, scrollLeft = 0, isDown = false;
            
            section.addEventListener('mousedown', e => {
                isDown = true;
                startX = e.pageX - section.offsetLeft;
                scrollLeft = section.scrollLeft;
            });
            
            section.addEventListener('mouseleave', () => isDown = false);
            section.addEventListener('mouseup', () => isDown = false);
            
            section.addEventListener('mousemove', e => {
                if (!isDown) return;
                e.preventDefault();
                section.scrollLeft = scrollLeft - (e.pageX - startX) * 2;
            });
            
            section.addEventListener('touchstart', e => {
                startX = e.touches[0].pageX;
                scrollLeft = section.scrollLeft;
            });
            
            section.addEventListener('touchmove', e => {
                section.scrollLeft = scrollLeft + (startX - e.touches[0].pageX) * 1.5;
            });
        });
    }
};

// ==================== MODAL HELPERS ====================
const Modal = {
    show(id) { document.getElementById(id).style.display = 'flex'; },
    hide(id) { document.getElementById(id).style.display = 'none'; }
};
window.closeModal = id => Modal.hide(id);

// ==================== EXPORT ====================
window.PremiumSlider = PremiumSlider;
window.PortalCards = PortalCards;
window.Toast = Toast;
window.GlassPanel = GlassPanel;
window.SplashScreen = SplashScreen;
window.HorizontalScroll = HorizontalScroll;
window.Modal = Modal;
