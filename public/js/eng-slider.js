/* TECHOPRINT 2026 - SLIDER */
/* 3 pages, 3 ads each, 4-second transition */

(function() {
    let current = 0;
    const total = 3;
    
    function show(index) {
        current = index;
        document.querySelectorAll('.slide').forEach(function(s, i) {
            s.style.display = i === index ? 'grid' : 'none';
        });
        document.querySelectorAll('.slider-dot').forEach(function(d, i) {
            d.classList.toggle('active', i === index);
        });
    }
    
    window.addEventListener('load', function() {
        show(0);
        setInterval(function() { show((current + 1) % total); }, 4000);
        document.querySelectorAll('.slider-dot').forEach(function(dot, i) {
            dot.onclick = function() { show(i); };
        });
    });
})();
