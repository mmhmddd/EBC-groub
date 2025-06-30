document.addEventListener('DOMContentLoaded', () => {
  // Load Navbar and Footer
  const loadSharedComponents = () => {
    fetch('../../shared/navbar/navbar.html')
      .then(response => response.text())
      .then(data => {
        document.getElementById('navbar-placeholder').innerHTML = data;
      })
      .catch(error => console.error('خطأ في تحميل النافبار:', error));

    fetch('../../shared/footer/footer.html')
      .then(response => response.text())
      .then(data => {
        document.getElementById('footer-placeholder').innerHTML = data;
      })
      .catch(error => console.error('خطأ في تحميل الفوتر:', error));
  };

  // Hero Slider
  const initHeroSlider = () => {
    const heroSliderContent = document.getElementById('heroSliderContent');
    const heroSlides = Array.from(heroSliderContent.getElementsByClassName('slider-item'));

    if (!heroSliderContent || heroSlides.length === 0) {
      console.error('عناصر السلايدر الرئيسي غير موجودة أو غير صالحة');
      return;
    }

    let currentSlide = 0;

    const showSlide = (index) => {
      heroSlides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });
      currentSlide = index;
    };

    const nextSlide = () => showSlide((currentSlide + 1) % heroSlides.length);

    // Auto-slide every 3 seconds
    let autoSlide = setInterval(nextSlide, 3000);

    // Pause on hover
    heroSliderContent.addEventListener('mouseenter', () => clearInterval(autoSlide));
    heroSliderContent.addEventListener('mouseleave', () => {
      autoSlide = setInterval(nextSlide, 3000);
    });

    showSlide(currentSlide);
  };

  // Client Slider
  const initClientSlider = () => {
    const clientSlider = document.getElementById('clientSlider');
    const clientPrevArrow = document.getElementById('clientPrevArrow');
    const clientNextArrow = document.getElementById('clientNextArrow');
    const flagItems = Array.from(clientSlider.getElementsByClassName('flag-item'));

    if (!clientSlider || !clientPrevArrow || !clientNextArrow || flagItems.length === 0) {
      console.error('عناصر سلايدر العملاء غير موجودة أو غير صالحة');
      return;
    }

    const itemWidth = flagItems[0].offsetWidth + 20;
    let scrollPosition = 0;
    const maxScroll = Math.max(0, (flagItems.length - Math.floor(clientSlider.offsetWidth / itemWidth)) * itemWidth);

    const scrollSlider = (direction) => {
      scrollPosition += direction * itemWidth * 3;
      if (scrollPosition > maxScroll) scrollPosition = 0;
      if (scrollPosition < 0) scrollPosition = maxScroll;
      clientSlider.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    };

    clientPrevArrow.addEventListener('click', () => scrollSlider(-1));
    clientNextArrow.addEventListener('click', () => scrollSlider(1));

    // Auto-scroll
    let autoScroll = setInterval(() => scrollSlider(1), 3000);

    // Pause on hover
    clientSlider.addEventListener('mouseenter', () => clearInterval(autoScroll));
    clientSlider.addEventListener('mouseleave', () => {
      autoScroll = setInterval(() => scrollSlider(1), 3000);
    });

    // Drag functionality
    let isDragging = false;
    let startX;
    let scrollLeft;

    clientSlider.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.pageX - clientSlider.offsetLeft;
      scrollLeft = clientSlider.scrollLeft;
      clearInterval(autoScroll);
    });

    clientSlider.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - clientSlider.offsetLeft;
      const walk = (x - startX) * 2;
      clientSlider.scrollLeft = scrollLeft - walk;
    });

    clientSlider.addEventListener('mouseup', () => {
      isDragging = false;
      autoScroll = setInterval(() => scrollSlider(1), 3000);
    });

    clientSlider.addEventListener('mouseleave', () => {
      isDragging = false;
      autoScroll = setInterval(() => scrollSlider(1), 3000);
    });

    // Touch support
    clientSlider.addEventListener('touchstart', (e) => {
      isDragging = true;
      startX = e.touches[0].pageX - clientSlider.offsetLeft;
      scrollLeft = clientSlider.scrollLeft;
      clearInterval(autoScroll);
    });

    clientSlider.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.touches[0].pageX - clientSlider.offsetLeft;
      const walk = (x - startX) * 2;
      clientSlider.scrollLeft = scrollLeft - walk;
    });

    clientSlider.addEventListener('touchend', () => {
      isDragging = false;
      autoScroll = setInterval(() => scrollSlider(1), 3000);
    });
  };

  // Initialize
  loadSharedComponents();
  initHeroSlider();
  initClientSlider();
});