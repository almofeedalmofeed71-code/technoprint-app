/* TECHOPRINT 2026 - SLIDER ENGINE */
/* 3 Pages, 3 Ads Each, 4-Second Auto-Transition */

(function() {
    let currentSlide = 0;
    const totalSlides = 3;
    const slideDuration = 4000; // 4 seconds
    
    function goToSlide(index) {
        currentSlide = index;
        document.querySelectorAll('.slide').forEach(function(s, i) {
            s.style.display = i === index ? 'grid' : 'none';
        });
        document.querySelectorAll('.slider-dot').forEach(function(d, i) {
            d.classList.toggle('active', i === index);
        });
    }
    
    function nextSlide() {
        goToSlide((currentSlide + 1) % totalSlides);
    }
    
    window.addEventListener('load', function() {
        goToSlide(0);
        setInterval(nextSlide, slideDuration);
        
        document.querySelectorAll('.slider-dot').forEach(function(dot, i) {
            dot.onclick = function() { goToSlide(i); };
        });
    });
})();
