/* TECHOPRINT 2026 - MEGA SLIDER LOGIC */
/* 4s Auto-Rotation for 9-Company Ad Matrix */

window.addEventListener('DOMContentLoaded', function() {
    initMegaSlider();
});

function initMegaSlider() {
    const megaTrack = document.getElementById('megaTrack');
    const megaDots = document.querySelectorAll('.mega-dot');
    let currentSlide = 0;
    const totalSlides = 3;
    let autoPlayInterval;

    if (!megaTrack) return;

    function goToSlide(index) {
        currentSlide = index;
        megaTrack.style.transform = `translateX(-${currentSlide * 33.3333}%)`;
        megaDots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        goToSlide(currentSlide);
    }

    // Auto-play every 4 seconds
    function startAutoPlay() {
        autoPlayInterval = setInterval(nextSlide, 4000);
    }

    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }

    // Dot click handlers
    megaDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            stopAutoPlay();
            goToSlide(index);
            startAutoPlay();
        });
    });

    // Start auto-play
    startAutoPlay();

    // Pause on hover
    const megaSlider = document.getElementById('megaSlider');
    if (megaSlider) {
        megaSlider.addEventListener('mouseenter', stopAutoPlay);
        megaSlider.addEventListener('mouseleave', startAutoPlay);
    }
}

// Export for global access
window.initMegaSlider = initMegaSlider;
