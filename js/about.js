document.addEventListener('DOMContentLoaded', () => {
  // Load Navbar and Footer
  const loadSharedComponents = () => {
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    if (!navbarPlaceholder || !footerPlaceholder) {
      console.error('عناصر النافبار أو الفوتر غير موجودة');
      return;
    }

    Promise.all([
      fetch('../../shared/navbar/navbar.html')
        .then(response => {
          if (!response.ok) throw new Error('فشل تحميل النافبار');
          return response.text();
        })
        .then(data => navbarPlaceholder.innerHTML = data)
        .catch(error => console.error('خطأ في تحميل النافبار:', error)),
      fetch('../../shared/footer/footer.html')
        .then(response => {
          if (!response.ok) throw new Error('فشل تحميل الفوتر');
          return response.text();
        })
        .then(data => footerPlaceholder.innerHTML = data)
        .catch(error => console.error('خطأ في تحميل الفوتر:', error))
    ]).catch(error => console.error('خطأ في تحميل المكونات:', error));
  };

  // Hero Slider
  const initHeroSlider = () => {
    const heroSliderContent = document.getElementById('heroSliderContent');
    const heroSlides = heroSliderContent ? Array.from(heroSliderContent.getElementsByClassName('slider-item')) : [];

    if (!heroSliderContent || heroSlides.length === 0) {
      console.error('عناصر السلايدر الرئيسي غير موجودة أو غير صالحة');
      return;
    }

    let currentSlide = 0;
    let autoSlide = null;

    const showSlide = (index) => {
      heroSlides.forEach((slide, i) => slide.classList.toggle('active', i === index));
      currentSlide = index;
    };

    const nextSlide = () => showSlide((currentSlide + 1) % heroSlides.length);

    const startAutoSlide = () => {
      autoSlide = setInterval(nextSlide, 3000);
    };

    const stopAutoSlide = () => {
      if (autoSlide) clearInterval(autoSlide);
    };

    heroSliderContent.addEventListener('mouseenter', stopAutoSlide);
    heroSliderContent.addEventListener('mouseleave', startAutoSlide);
    heroSliderContent.addEventListener('touchstart', stopAutoSlide, { passive: true });
    heroSliderContent.addEventListener('touchend', startAutoSlide, { passive: true });

    showSlide(currentSlide);
    startAutoSlide();
  };

  // Progress Bars
  const initProgressBars = () => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const progressBars = entry.target.querySelectorAll('.progress-bar');
            if (progressBars.length === 0) {
              console.error('No progress bars found in the skills-showcase section');
              return;
            }
            progressBars.forEach((bar, index) => {
              setTimeout(() => {
                const track = bar.closest('.progress-item');
                const value = parseFloat(track?.getAttribute('data-value') || '0');
                if (!isNaN(value) && value >= 0 && value <= 100) {
                  bar.style.transition = `width ${index * 0.2}s ease-in-out`; // Smooth transition
                  bar.style.width = `${value}%`;
                  bar.setAttribute('aria-valuenow', value);
                } else {
                  console.error(`Invalid data-value for progress bar: ${value}`);
                  bar.style.width = '0%';
                }
              }, index * 200);
            });
            observer.unobserve(entry.target); // One-time trigger
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const section = document.querySelector('.skills-showcase');
    if (section) observer.observe(section);
    else console.error('Skills showcase section not found in the DOM');
  };

  // Continuous Slider Class
  class ContinuousSlider {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.track = document.getElementById('sliderTrack');
      this.playPauseBtn = document.getElementById('playPauseBtn');
      this.directionBtn = document.getElementById('directionBtn');
      this.speedSlider = document.getElementById('speedSlider');
      this.speedValue = document.getElementById('speedValue');

      this.isPlaying = true;
      this.direction = -1; // Right to left
      this.baseSpeed = 50;
      this.currentTranslate = 0;
      this.animationId = null;
      this.isDragging = false;
      this.startX = 0;
      this.currentX = 0;
      this.startTranslate = 0;

      this.init();
    }

    init() {
      if (!this.container || !this.track || !this.playPauseBtn || !this.directionBtn || !this.speedSlider || !this.speedValue) {
        console.error('One or more slider elements not found');
        return;
      }
      this.duplicateFlags();
      this.setupEventListeners();
      this.updateSpeedDisplay();
      this.startAnimation();
    }

    duplicateFlags() {
      const originalFlags = this.track.innerHTML;
      this.track.innerHTML = originalFlags + originalFlags + originalFlags;
      const flagWidth = 180;
      const flagCount = 9;
      this.currentTranslate = -(flagWidth * flagCount);
      this.track.style.transform = `translateX(${this.currentTranslate}px)`;
    }

    setupEventListeners() {
      this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
      this.directionBtn.addEventListener('click', () => this.toggleDirection());
      this.speedSlider.addEventListener('input', () => this.updateSpeed());

      this.container.addEventListener('mouseenter', () => this.pauseAnimation());
      this.container.addEventListener('mouseleave', () => this.resumeOnLeave());
      this.container.addEventListener('mousedown', (e) => this.handleStart(e));
      this.container.addEventListener('mousemove', (e) => this.handleMove(e));
      this.container.addEventListener('mouseup', () => this.handleEnd());
      this.container.addEventListener('mouseleave', () => this.handleEnd());

      this.container.addEventListener('touchstart', (e) => this.handleStart(e), { passive: false });
      this.container.addEventListener('touchmove', (e) => this.handleMove(e), { passive: false });
      this.container.addEventListener('touchend', () => this.handleEnd());

      this.container.addEventListener('keydown', (e) => this.handleKeyboard(e));
      this.track.addEventListener('dragstart', (e) => e.preventDefault());
    }

    handleStart(e) {
      this.isDragging = true;
      this.startX = this.getPositionX(e);
      this.startTranslate = this.currentTranslate;
      this.pauseAnimation();
      this.container.style.cursor = 'grabbing';
    }

    handleMove(e) {
      if (!this.isDragging) return;
      e.preventDefault();
      this.currentX = this.getPositionX(e);
      const deltaX = this.currentX - this.startX;
      this.currentTranslate = this.startTranslate + deltaX;
      this.track.style.transform = `translateX(${this.currentTranslate}px)`;
    }

    handleEnd() {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.container.style.cursor = 'grab';
      this.checkBounds();
      if (this.isPlaying) this.startAnimation();
    }

    getPositionX(e) {
      return e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    }

    handleKeyboard(e) {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          this.togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.direction = -1;
          this.updateDirectionButton();
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.direction = 1;
          this.updateDirectionButton();
          break;
      }
    }

    startAnimation() {
      if (!this.isPlaying || this.isDragging) return;
      const animate = () => {
        this.currentTranslate += this.direction * (parseInt(this.speedSlider.value) * 0.3);
        this.track.style.transform = `translateX(${this.currentTranslate}px)`;
        this.checkBounds();
        if (this.isPlaying && !this.isDragging) this.animationId = requestAnimationFrame(animate);
      };
      this.animationId = requestAnimationFrame(animate);
    }

    checkBounds() {
      const flagWidth = 180;
      const flagCount = 9;
      const resetPoint = flagWidth * flagCount;
      if (this.currentTranslate <= -resetPoint * 2) {
        this.currentTranslate = -resetPoint;
        this.track.style.transform = `translateX(${this.currentTranslate}px)`;
      } else if (this.currentTranslate >= 0) {
        this.currentTranslate = -resetPoint;
        this.track.style.transform = `translateX(${this.currentTranslate}px)`;
      }
    }

    pauseAnimation() {
      if (this.animationId) cancelAnimationFrame(this.animationId);
    }

    resumeOnLeave() {
      if (this.isPlaying && !this.isDragging) this.startAnimation();
    }

    togglePlayPause() {
      this.isPlaying = !this.isPlaying;
      this.playPauseBtn.textContent = this.isPlaying ? '⏸️' : '▶️';
      this.playPauseBtn.setAttribute('aria-label', this.isPlaying ? 'إيقاف التشغيل التلقائي' : 'تشغيل التشغيل التلقائي');
      if (this.isPlaying) this.startAnimation();
    }

    toggleDirection() {
      this.direction *= -1;
      this.updateDirectionButton();
    }

    updateDirectionButton() {
      this.directionBtn.textContent = this.direction === -1 ? '⬅️' : '➡️';
      this.directionBtn.setAttribute('aria-label', this.direction === -1 ? 'التمرير من اليمين إلى اليسار' : 'التمرير من اليسار إلى اليمين');
    }

    updateSpeed() {
      const speed = parseInt(this.speedSlider.value);
      const speedLabels = ['بطيء جداً', 'بطيء', 'متوسط', 'سريع', 'سريع جداً'];
      this.speedValue.textContent = speedLabels[speed - 1];
      this.startAnimation(); // Restart animation with new speed
    }

    updateSpeedDisplay() {
      const speed = parseInt(this.speedSlider.value);
      const speedLabels = ['بطيء جداً', 'بطيء', 'متوسط', 'سريع', 'سريع جداً'];
      this.speedValue.textContent = speedLabels[speed - 1];
    }
  }

  // Initialize Components
  loadSharedComponents();
  initHeroSlider();
  initProgressBars();
  new ContinuousSlider('clientSlider');

  // Prevent right-click on images
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      alert('عذرًا، لا يمكن تحميل الصور مباشرة. تواصل معنا للحصول على المحتوى!');
    });
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    const slider = document.querySelector('.client-slider');
    if (slider) {
      // Reset slider position on resize if needed
      slider.style.transform = 'none';
      new ContinuousSlider('clientSlider'); // Reinitialize slider
    }
  });
});