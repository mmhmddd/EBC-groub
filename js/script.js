    document.addEventListener('DOMContentLoaded', () => {
      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target); // توقف عن المراقبة بعد التنشيط
          }
        });
      }, { threshold: 0.5 }); // يبدأ التحريك عندما يظهر 50% من القسم

      const section = document.querySelector('.services-section');
      if (section) observer.observe(section);
    });

  document.addEventListener('DOMContentLoaded', () => {
      const slider = document.getElementById('testimonialsSlider');
      const cards = Array.from(slider.querySelectorAll('.testimonial-card'));
      const dots = Array.from(document.querySelectorAll('.dot'));
      const prevBtn = document.getElementById('prevBtn');
      const nextBtn = document.getElementById('nextBtn');
      let currentIndex = 0;
      const totalCards = cards.length;

      function updateSlider() {
        // Remove all classes first
        cards.forEach(card => {
          card.classList.remove('center', 'side');
          card.style.display = 'block'; // Ensure all cards are visible by default
        });

        // Calculate indices for center, previous, and next cards
        const prevIndex = (currentIndex - 1 + totalCards) % totalCards;
        const nextIndex = (currentIndex + 1) % totalCards;

        // Apply classes based on position
        cards.forEach((card, index) => {
          if (index === currentIndex) {
            card.classList.add('center');
          } else if (index === prevIndex || index === nextIndex) {
            card.classList.add('side');
          } else {
            card.style.display = 'none'; // Hide cards that are not prev, current, or next
          }
        });

        // Update dots
        dots.forEach((dot, index) => {
          dot.classList.toggle('active', index === currentIndex);
        });
      }

      // Previous button click
      prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + totalCards) % totalCards;
        updateSlider();
      });

      // Next button click
      nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % totalCards;
        updateSlider();
      });

      // Dot click
      dots.forEach(dot => {
        dot.addEventListener('click', () => {
          currentIndex = parseInt(dot.dataset.index);
          updateSlider();
        });
      });

      // Initialize slider
      updateSlider();
    });