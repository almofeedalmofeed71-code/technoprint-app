/* TECHOPRINT 2026 - ENG SLIDER */
/* 4-Second Auto-Rotate Logic for Ads ONLY */

const Slider = {
    current: 0,
    interval: null,
    duration: 4000,
    
    init() {
        this.bindDots();
        this.start();
    },
    
    start() {
        this.stop();
        this.interval = setInterval(() => this.next(), this.duration);
    },
    
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    },
    
    next() {
        const dots = document.querySelectorAll('.ads-dot');
        if (!dots.length) return;
        dots[this.current].classList.remove('active');
        this.current = (this.current + 1) % dots.length;
        dots[this.current].classList.add('active');
        this.scrollTo(this.current);
    },
    
    go(index) {
        const dots = document.querySelectorAll('.ads-dot');
        if (!dots.length || index < 0 || index >= dots.length) return;
        dots[this.current].classList.remove('active');
        this.current = index;
        dots[this.current].classList.add('active');
        this.scrollTo(this.current);
        this.start();
    },
    
    scrollTo(index) {
        const container = document.querySelector('.ads-grid');
        if (container) {
            const cards = container.querySelectorAll('.ad-card');
            if (cards[index]) {
                cards[index].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        }
    },
    
    bindDots() {
        document.querySelectorAll('.ads-dot').forEach((dot, i) => {
            dot.style.cursor = 'pointer';
            dot.onclick = () => this.go(i);
        });
    }
};

window.Slider = Slider;
