document.addEventListener('DOMContentLoaded', () => {
  // Intersection Observer for testimonial section
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  const section = document.querySelector('.testimonial-section');
  if (section) observer.observe(section);

  // Slider functionality
  const slider = document.getElementById('testimonialsSlider');
  const cards = Array.from(slider.querySelectorAll('.testimonial-card'));
  const dots = Array.from(document.querySelectorAll('.dot'));
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  let currentIndex = 0;
  const totalCards = cards.length;

  function updateSlider() {
    cards.forEach((card, index) => {
      card.classList.remove('center', 'side');
      card.style.display = 'block';

      const prevIndex = (currentIndex - 1 + totalCards) % totalCards;
      const nextIndex = (currentIndex + 1) % totalCards;

      if (index === currentIndex) {
        card.classList.add('center');
      } else if (index === prevIndex || index === nextIndex) {
        card.classList.add('side');
      } else {
        card.style.display = 'none';
      }
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });

    // Scroll to center the current card on mobile
    if (window.innerWidth <= 768) {
      const currentCard = cards[currentIndex];
      currentCard.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
      });
    }
  }

  // Navigation button events
  prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + totalCards) % totalCards;
    updateSlider();
  });

  nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % totalCards;
    updateSlider();
  });

  // Dot navigation
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      currentIndex = parseInt(dot.dataset.index);
      updateSlider();
    });
  });

  // Touch support for mobile
  let touchStartX = 0;
  let touchEndX = 0;

  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  slider.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX > 50) {
      // Swipe left
      currentIndex = (currentIndex + 1) % totalCards;
      updateSlider();
    } else if (touchEndX - touchStartX > 50) {
      // Swipe right
      currentIndex = (currentIndex - 1 + totalCards) % totalCards;
      updateSlider();
    }
  });

  // Initialize slider
  updateSlider();

  // Update slider on window resize
  window.addEventListener('resize', updateSlider);
});