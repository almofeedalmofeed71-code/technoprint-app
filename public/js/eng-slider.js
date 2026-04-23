/* TECHOPRINT 2026 - ENG SLIDER */
/* 5-Second Auto-Rotate for Ads */

const Slider = {
    current: 0,
    interval: null,
    duration: 5000,
    
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
        const dots = document.querySelectorAll('.slider-dot, .ads-dot');
        if (!dots.length) return;
        dots[this.current].classList.remove('active');
        this.current = (this.current + 1) % dots.length;
        dots[this.current].classList.add('active');
    },
    
    go(index) {
        const dots = document.querySelectorAll('.slider-dot, .ads-dot');
        if (!dots.length || index < 0 || index >= dots.length) return;
        dots[this.current].classList.remove('active');
        this.current = index;
        dots[this.current].classList.add('active');
        this.start();
    },
    
    bindDots() {
        document.querySelectorAll('.slider-dot, .ads-dot').forEach((dot, i) => {
            dot.style.cursor = 'pointer';
            dot.onclick = () => this.go(i);
        });
    }
};

window.Slider = Slider;
