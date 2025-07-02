document.addEventListener('DOMContentLoaded', () => {
  // Load Navbar and Footer
  const loadSharedComponents = () => {
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    if (!navbarPlaceholder || !footerPlaceholder) {
      console.error('عناصر النافبار أو الفوتر غير موجودة');
      return;
    }

    fetch('../../shared/navbar/navbar.html')
      .then(response => {
        if (!response.ok) throw new Error('فشل تحميل النافبار');
        return response.text();
      })
      .then(data => {
        navbarPlaceholder.innerHTML = data;
      })
      .catch(error => console.error('خطأ في تحميل النافبار:', error));

    fetch('../../shared/footer/footer.html')
      .then(response => {
        if (!response.ok) throw new Error('فشل تحميل الفوتر');
        return response.text();
      })
      .then(data => {
        footerPlaceholder.innerHTML = data;
      })
      .catch(error => console.error('خطأ في تحميل الفوتر:', error));
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

    const showSlide = (index) => {
      heroSlides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });
      currentSlide = index;
    };

    const nextSlide = () => showSlide((currentSlide + 1) % heroSlides.length);

    let autoSlide = setInterval(nextSlide, 3000);

    heroSliderContent.addEventListener('mouseenter', () => clearInterval(autoSlide));
    heroSliderContent.addEventListener('mouseleave', () => {
      autoSlide = setInterval(nextSlide, 3000);
    });

    showSlide(currentSlide);
  };


  // Progress Bars
  const initProgressBars = () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const progressBars = entry.target.querySelectorAll('.progress-bar');
          if (progressBars.length === 0) {
            console.warn('لم يتم العثور على أشرطة التقدم في قسم العرض');
            return;
          }
          progressBars.forEach((bar, index) => {
            setTimeout(() => {
              const track = bar.parentElement.parentElement;
              const value = parseFloat(track.getAttribute('data-value'));
              if (!isNaN(value) && value >= 0 && value <= 100) {
                bar.style.width = `${value}%`;
              } else {
                console.warn(`قيمة data-value غير صالحة لشريط التقدم: ${value}`);
              }
            }, index * 300);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    const section = document.querySelector('.skills-showcase');
    if (section) {
      observer.observe(section);
    } else {
      console.warn('قسم عرض المهارات غير موجود');
    }
  };

  // Initialize all components
  loadSharedComponents();
  initHeroSlider();
  initClientSlider();
  initProgressBars();
});




    class ContinuousSlider {
            constructor(containerId) {
                this.container = document.getElementById(containerId);
                this.track = document.getElementById('sliderTrack');
                this.playPauseBtn = document.getElementById('playPauseBtn');
                this.directionBtn = document.getElementById('directionBtn');
                this.speedSlider = document.getElementById('speedSlider');
                this.speedValue = document.getElementById('speedValue');
                
                // Configuration
                this.isPlaying = true;
                this.direction = -1; // -1 for right to left, 1 for left to right
                this.baseSpeed = 50; // Base speed in milliseconds
                this.currentTranslate = 0;
                this.animationId = null;
                
                // Touch/Mouse handling
                this.isDragging = false;
                this.startX = 0;
                this.currentX = 0;
                this.startTranslate = 0;
                
                this.init();
            }

            init() {
                this.duplicateFlags();
                this.setupEventListeners();
                this.updateSpeedDisplay();
                this.startAnimation();
            }

            duplicateFlags() {
                const originalFlags = this.track.innerHTML;
                // Create multiple copies for seamless loop
                this.track.innerHTML = originalFlags + originalFlags + originalFlags;
                
                // Calculate initial position to start from middle set
                const flagWidth = 180; // 160px width + 20px gap
                const flagCount = 9; // Original number of flags
                this.currentTranslate = -(flagWidth * flagCount);
                this.track.style.transform = `translateX(${this.currentTranslate}px)`;
            }

            setupEventListeners() {
                // Play/Pause button
                this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
                
                // Direction button
                this.directionBtn.addEventListener('click', () => this.toggleDirection());
                
                // Speed control
                this.speedSlider.addEventListener('input', () => this.updateSpeed());
                
                // Mouse events
                this.container.addEventListener('mouseenter', () => this.pauseOnHover());
                this.container.addEventListener('mouseleave', () => this.resumeOnLeave());
                this.container.addEventListener('mousedown', (e) => this.handleStart(e));
                this.container.addEventListener('mousemove', (e) => this.handleMove(e));
                this.container.addEventListener('mouseup', () => this.handleEnd());
                this.container.addEventListener('mouseleave', () => this.handleEnd());
                
                // Touch events
                this.container.addEventListener('touchstart', (e) => this.handleStart(e), { passive: false });
                this.container.addEventListener('touchmove', (e) => this.handleMove(e), { passive: false });
                this.container.addEventListener('touchend', () => this.handleEnd());
                
                // Keyboard navigation
                this.container.addEventListener('keydown', (e) => this.handleKeyboard(e));
                
                // Prevent drag on images
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
                
                this.track.classList.add('no-transition');
                this.track.style.transform = `translateX(${this.currentTranslate}px)`;
            }

            handleEnd() {
                if (!this.isDragging) return;
                
                this.isDragging = false;
                this.container.style.cursor = 'grab';
                this.track.classList.remove('no-transition');
                
                // Check bounds and reset if needed
                this.checkBounds();
                
                if (this.isPlaying) {
                    this.startAnimation();
                }
            }

            getPositionX(e) {
                return e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            }

            handleKeyboard(e) {
                switch(e.key) {
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
                    this.currentTranslate += this.direction * 0.5;
                    this.track.style.transform = `translateX(${this.currentTranslate}px)`;
                    
                    this.checkBounds();
                    
                    if (this.isPlaying && !this.isDragging) {
                        this.animationId = requestAnimationFrame(animate);
                    }
                };
                
                this.animationId = requestAnimationFrame(animate);
            }

            checkBounds() {
                const flagWidth = 180;
                const flagCount = 9;
                const resetPoint = flagWidth * flagCount;
                
                if (this.currentTranslate <= -resetPoint * 2) {
                    this.currentTranslate = -resetPoint;
                    this.track.classList.add('no-transition');
                    this.track.style.transform = `translateX(${this.currentTranslate}px)`;
                    requestAnimationFrame(() => {
                        this.track.classList.remove('no-transition');
                    });
                } else if (this.currentTranslate >= 0) {
                    this.currentTranslate = -resetPoint;
                    this.track.classList.add('no-transition');
                    this.track.style.transform = `translateX(${this.currentTranslate}px)`;
                    requestAnimationFrame(() => {
                        this.track.classList.remove('no-transition');
                    });
                }
            }

            pauseAnimation() {
                if (this.animationId) {
                    cancelAnimationFrame(this.animationId);
                    this.animationId = null;
                }
            }

            pauseOnHover() {
                this.pauseAnimation();
            }

            resumeOnLeave() {
                if (this.isPlaying && !this.isDragging) {
                    this.startAnimation();
                }
            }

            togglePlayPause() {
                this.isPlaying = !this.isPlaying;
                this.playPauseBtn.textContent = this.isPlaying ? '⏸️' : '▶️';
                this.playPauseBtn.setAttribute('aria-label', this.isPlaying ? 'إيقاف التشغيل التلقائي' : 'تشغيل التشغيل التلقائي');
                
                if (this.isPlaying) {
                    this.startAnimation();
                } else {
                    this.pauseAnimation();
                }
            }

            toggleDirection() {
                this.direction *= -1;
                this.updateDirectionButton();
            }

            updateDirectionButton() {
                this.directionBtn.textContent = this.direction === -1 ? '⬅️' : '➡️';
                this.directionBtn.setAttribute('aria-label', 
                    this.direction === -1 ? 'التمرير من اليمين إلى اليسار' : 'التمرير من اليسار إلى اليمين'
                );
            }

            updateSpeed() {
                const speed = parseInt(this.speedSlider.value);
                const speedLabels = ['بطيء جداً', 'بطيء', 'متوسط', 'سريع', 'سريع جداً'];
                this.speedValue.textContent = speedLabels[speed - 1];
                
                // Adjust animation speed by changing the step size
                this.direction = this.direction > 0 ? speed * 0.3 : -speed * 0.3;
            }

            updateSpeedDisplay() {
                const speed = parseInt(this.speedSlider.value);
                const speedLabels = ['بطيء جداً', 'بطيء', 'متوسط', 'سريع', 'سريع جداً'];
                this.speedValue.textContent = speedLabels[speed - 1];
            }
        }

        // Initialize the slider when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            new ContinuousSlider('clientSlider');
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            // Reinitialize if needed
            const slider = document.querySelector('.continuous-slider');
            if (slider) {
                // Handle responsive adjustments
            }
        });