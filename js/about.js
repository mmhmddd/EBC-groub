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

  // Client Slider
  const initClientSlider = () => {
    const clientSlider = document.getElementById('clientSlider');
    const flagItems = clientSlider ? Array.from(clientSlider.getElementsByClassName('flag-item')) : [];

    if (!clientSlider || flagItems.length === 0) {
      console.error('عناصر سلايدر العملاء غير موجودة أو غير صالحة');
      return;
    }

    const itemWidth = flagItems[0].offsetWidth + 20; // Include 20px gap from CSS
    const maxScroll = clientSlider.scrollWidth - clientSlider.clientWidth;
    let scrollPosition = 0;
    let direction = 1; // 1 for left-to-right, -1 for right-to-left
    const slideInterval = 3000; // 3 seconds per slide
    const itemsPerScroll = 3; // Scroll 3 items at a time

    const scrollSlider = () => {
      scrollPosition += direction * itemWidth * itemsPerScroll;

      if (scrollPosition >= maxScroll) {
        scrollPosition = maxScroll;
        direction = -1;
      } else if (scrollPosition <= 0) {
        scrollPosition = 0;
        direction = 1;
      }

      clientSlider.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    };

    let autoScroll = setInterval(scrollSlider, slideInterval);

    clientSlider.addEventListener('mouseenter', () => clearInterval(autoScroll));
    clientSlider.addEventListener('mouseleave', () => {
      autoScroll = setInterval(scrollSlider, slideInterval);
    });

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
      const walk = (x - startX) * 1.5;
      clientSlider.scrollLeft = scrollLeft - walk;
      scrollPosition = clientSlider.scrollLeft;
    });

    clientSlider.addEventListener('mouseup', () => {
      isDragging = false;
      autoScroll = setInterval(scrollSlider, slideInterval);
    });

    clientSlider.addEventListener('mouseleave', () => {
      isDragging = false;
      autoScroll = setInterval(scrollSlider, slideInterval);
    });

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
      const walk = (x - startX) * 1.5;
      clientSlider.scrollLeft = scrollLeft - walk;
      scrollPosition = clientSlider.scrollLeft;
    });

    clientSlider.addEventListener('touchend', () => {
      isDragging = false;
      autoScroll = setInterval(scrollSlider, slideInterval);
    });
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