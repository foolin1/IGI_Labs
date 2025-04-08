document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('slider');
    const slides = slider.querySelector('.slides');
    const slideElements = slider.querySelectorAll('.slide');
    const prevButton = slider.querySelector('.prev');
    const nextButton = slider.querySelector('.next');
    const pagination = slider.querySelectorAll('.pag');
    const settings = {
        loop: slider.dataset.loop === 'true',
        auto: slider.dataset.auto === 'true',
        delay: parseInt(slider.dataset.delay, 10) || 5,
        stopMouseHover: slider.dataset.stopmousehover === 'true',
    };

    let currentSlide = 0;
    let autoSlideInterval;

    const updateSlider = () => {
        slides.style.transform = `translateX(-${currentSlide * 100}%)`;
        pagination.forEach((pag, index) => {
            pag.classList.toggle('active', index === currentSlide);
        });
    };

    const nextSlide = () => {
        currentSlide = (currentSlide + 1) % slideElements.length;
        updateSlider();
    };

    const prevSlide = () => {
        currentSlide = (currentSlide - 1 + slideElements.length) % slideElements.length;
        updateSlider();
    };

    const startAutoSlide = () => {
        if (settings.auto) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = setInterval(nextSlide, settings.delay * 1000);
        }
    };

    if (settings.stopMouseHover) {
        slider.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
        slider.addEventListener('mouseleave', startAutoSlide);
    }

    prevButton?.addEventListener('click', prevSlide);
    nextButton?.addEventListener('click', nextSlide);

    pagination.forEach((pag, index) => {
        pag.addEventListener('click', () => {
            currentSlide = index;
            updateSlider();
        });
    });

    updateSlider();
    startAutoSlide();
});
