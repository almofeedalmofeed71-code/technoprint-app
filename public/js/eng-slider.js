/* TECHOPRINT 2026 - ENG SLIDER */
/* 3 Slides x 3 Companies = 9 Total Ads */

const Slider = {
    current: 0,
    companies: [
        ['شركة النور', 'مطبعة Bagdad', 'دار النشر'],
        ['تصميم مطبوعات', 'ورق فاخر', 'توصيل سريع'],
        ['طباعة كتب', 'بروشورات', 'كروت اعمال']
    ],
    interval: null,
    duration: 5000,
    
    init() {
        this.render();
        this.bindDots();
        this.start();
    },
    
    render() {
        const slideEl = document.querySelector('.slide');
        if (!slideEl) return;
        
        const companies = this.companies[this.current];
        const startIdx = this.current * 3;
        
        slideEl.innerHTML = companies.map((name, i) => {
            const imgIdx = startIdx + i + 1;
            return `
                <div class="slide-block">
                    <img src="https://picsum.photos/400/300?random=${imgIdx}" alt="${name}">
                    <div class="company-info">
                        <p class="company-name">${name}</p>
                    </div>
                </div>
            `;
        }).join('');
        
        document.querySelectorAll('.slider-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === this.current);
        });
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
        this.current = (this.current + 1) % 3;
        this.render();
    },
    
    go(index) {
        this.current = index;
        this.render();
        this.start();
    },
    
    bindDots() {
        document.querySelectorAll('.slider-dot').forEach((dot, i) => {
            dot.onclick = () => this.go(i);
        });
    }
};

window.Slider = Slider;
