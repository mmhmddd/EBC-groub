document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const articleContainer = document.getElementById('articleContainer');
  const clearFilter = document.getElementById('clearFilter');
  const loader = document.getElementById('loader');
  const carouselInner = document.getElementById('articleCarousel')?.querySelector('.carousel-inner');
  const carouselIndicators = document.getElementById('articleCarousel')?.querySelector('.carousel-indicators');
  const filterBtn = document.getElementById('filterBtn');
  const sidebar = document.getElementById('sidebar');
  const featuredArticles = document.getElementById('featuredArticles');
  const backToTop = document.getElementById('backToTop');
  let allArticles = [];

  // أنشئ كائن الـ Offcanvas مرة واحدة فقط
  const offcanvas = new bootstrap.Offcanvas(sidebar, { scroll: true });

  // تحميل الفلاتر المحفوظة
  const savedCategory = localStorage.getItem('selectedCategory') || '';
  const savedSearch = localStorage.getItem('searchTerm') || '';
  if (savedCategory) categoryFilter.value = savedCategory;
  if (savedSearch) searchInput.value = savedSearch;

  // تحميل وعرض المقالات
  function fetchArticles() {
    loader.style.display = 'block';
    fetch('/assets/data/articles/articles.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Fetched articles:', data);
        if (!Array.isArray(data) || data.length === 0) {
          console.warn('No valid articles data found');
          renderArticles([]);
          renderFeaturedArticles([]);
          return;
        }
        allArticles = data;
        populateCarousel();
        populateCategories();
        renderFeaturedArticles(allArticles.slice(0, 3)); // Initial featured articles
        renderArticles(allArticles);
        filterArticles(allArticles); // Apply initial filter
        toggleFeaturedSection(); // Initial toggle based on search input
      })
      .catch(error => {
        console.error('خطأ في تحميل البيانات:', error);
        articleContainer.innerHTML = '<p class="text-center">فشل تحميل المقالات. تحقق من الاتصال بالإنترنت أو الملف.</p>';
        loader.style.display = 'none';
      })
      .finally(() => {
        loader.style.display = 'none';
      });
  }

  function populateCarousel() {
    if (!carouselInner || !carouselIndicators) {
      console.warn('Carousel elements not found');
      return;
    }
    carouselInner.innerHTML = '';
    carouselIndicators.innerHTML = '';
    const topArticles = allArticles.slice(0, 5);
    topArticles.forEach((article, index) => {
      const isActive = index === 0 ? 'active' : '';
      const slide = document.createElement('div');
      slide.className = `carousel-item ${isActive}`;
      slide.innerHTML = `
        <img src="${article.image}" class="d-block w-100" alt="${article.title}">
        <div class="carousel-caption d-md-block">
          <h5>${article.title}</h5>
          <p>${article.category}</p>
          <a href="${article.slug}" class="article-btn">اقرأ المزيد</a>
        </div>
      `;
      carouselInner.appendChild(slide);

      const indicator = document.createElement('button');
      indicator.setAttribute('data-bs-target', '#articleCarousel');
      indicator.setAttribute('data-bs-slide-to', index);
      indicator.className = isActive ? 'active' : '';
      indicator.setAttribute('aria-label', `Slide ${index + 1}`);
      carouselIndicators.appendChild(indicator);
    });
  }

  function populateCategories() {
    if (!categoryFilter) {
      console.warn('Category filter element not found');
      return;
    }
    const categories = [...new Set(allArticles.map(article => article.category))];
    categoryFilter.innerHTML = '<option value="">الكل</option>';
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.toLowerCase();
      option.textContent = category;
      categoryFilter.appendChild(option);
    });
  }

  function highlightMatches(text, searchTerm) {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  }

  function renderFeaturedArticles(data) {
    if (!featuredArticles) {
      console.error('Featured articles section not found');
      return;
    }
    const grid = featuredArticles.querySelector('.featured-grid');
    grid.innerHTML = '';

    if (!data || data.length === 0) {
      grid.innerHTML = '<p class="text-center">لا يوجد مقالات مميزة.</p>';
      return;
    }

    const searchTerm = ''; // No filtering for featured articles
    data.slice(0, 3).forEach((article, index) => {
      const card = document.createElement('div');
      card.className = 'featured-card';
      card.innerHTML = `
        <div class="featured-image">
          <img src="${article.image || '/assets/images/placeholder.jpg'}" alt="${article.title}" class="img-fluid" loading="lazy">
        </div>
        <div class="featured-details">
          <h5 class="featured-title">${highlightMatches(article.title, searchTerm)}</h5>
          <p class="featured-text">${highlightMatches(article.content || 'لا يوجد محتوى متاح', searchTerm)}</p>
          <div class="featured-buttons">
            <a href="${article.slug || '#'}" class="feature-btn btn-solutions">اقرأ المقال</a>
            <a href="#" class="feature-btn btn-quote" onclick="shareArticle('${article.title}', '${window.location.href + article.slug}')">شارك المقال</a>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  function renderArticles(data) {
    if (!articleContainer || !loader) {
      console.error('Article container or loader not found');
      return;
    }
    articleContainer.innerHTML = '';
    loader.style.display = 'none';

    if (!data || data.length === 0) {
      articleContainer.innerHTML = '<p class="text-center">لا يوجد مقالات متطابقة.</p>';
      return;
    }

    const section = document.createElement('section');
    section.className = 'services-grid';
    const searchTerm = searchInput.value.toLowerCase().trim();
    data.forEach((article, index) => {
      const isEven = index % 2 === 0;
      const featureItem = document.createElement('div');
      featureItem.className = 'feature-item';

      featureItem.innerHTML = `
        <div class="feature-content">
          ${isEven ? `
            <div class="feature-image">
              <img src="${article.image || '/assets/images/placeholder.jpg'}" alt="${article.title}" class="img-fluid" loading="lazy">
            </div>
            <div class="feature-details">
              <h5 class="feature-title">${highlightMatches(article.title, searchTerm)}</h5>
              <p class="feature-text">${highlightMatches(article.content || 'لا يوجد محتوى متاح', searchTerm)}</p>
              <div class="feature-buttons">
                <a href="${article.slug || '#'}" class="feature-btn btn-solutions">اقرأ المقال</a>
                <a href="#" class="feature-btn btn-quote" onclick="shareArticle('${article.title}', '${window.location.href + article.slug}')">شارك المقال</a>
              </div>
            </div>
          ` : `
            <div class="feature-details">
              <h5 class="feature-title">${highlightMatches(article.title, searchTerm)}</h5>
              <p class="feature-text">${highlightMatches(article.content || 'لا يوجد محتوى متاح', searchTerm)}</p>
              <div class="feature-buttons">
                <a href="${article.slug || '#'}" class="feature-btn btn-solutions">اقرأ المقال</a>
                <a href="#" class="feature-btn btn-quote" onclick="shareArticle('${article.title}', '${window.location.href + article.slug}')">شارك المقال</a>
              </div>
            </div>
            <div class="feature-image">
              <img src="${article.image || '/assets/images/placeholder.jpg'}" alt="${article.title}" class="img-fluid" loading="lazy">
            </div>
          `}
        </div>
      `;

      section.appendChild(featureItem);
      if (index < data.length - 1) {
        const hr = document.createElement('hr');
        hr.className = 'divider';
        section.appendChild(hr);
      }
    });

    articleContainer.appendChild(section);
  }

  function filterArticles(data) {
    if (!loader) {
      console.warn('Loader element not found');
      return;
    }
    loader.style.display = 'block'; // Show loader during filtering
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value.toLowerCase();
    const filtered = data.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm) ||
                            article.category.toLowerCase().includes(searchTerm) ||
                            (article.content && article.content.toLowerCase().includes(searchTerm));
      const matchesCategory = !selectedCategory || article.category.toLowerCase() === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    localStorage.setItem('selectedCategory', selectedCategory);
    localStorage.setItem('searchTerm', searchTerm);

    requestAnimationFrame(() => {
      renderArticles(filtered.length > 0 ? filtered : []);
      toggleFeaturedSection(); // Toggle featured section based on search input
      loader.style.display = 'none'; // Hide loader after rendering
    });
  }

  function toggleFeaturedSection() {
    if (featuredArticles) {
      featuredArticles.style.display = searchInput.value.trim() ? 'none' : 'block';
    }
  }

  // Back to top functionality
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) { // Show button after scrolling 300px
      backToTop.style.display = 'block';
    } else {
      backToTop.style.display = 'none';
    }
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.shareArticle = (title, url) => {
    if (navigator.share) {
      navigator.share({ title: title, url: url })
        .catch(error => console.error('خطأ في المشاركة:', error));
    } else {
      alert('المشاركة غير مدعومة في هذا المتصفح. انسخ الرابط: ' + url);
    }
  };

  // الفلاتر
  searchInput.addEventListener('input', () => {
    filterArticles(allArticles);
    toggleFeaturedSection(); // Toggle on every input change
  });
  categoryFilter.addEventListener('change', () => filterArticles(allArticles));
  clearFilter.addEventListener('click', () => {
    searchInput.value = '';
    categoryFilter.value = '';
    localStorage.removeItem('selectedCategory');
    localStorage.removeItem('searchTerm');
    filterArticles(allArticles);
    toggleFeaturedSection(); // Show featured section when cleared
  });

  // زر فتح الفلتر الجانبي
  filterBtn.addEventListener('click', () => {
    offcanvas.show();
  });

  // عند إغلاق الشريط الجانبي
  sidebar.addEventListener('hidden.bs.offcanvas', () => {
    document.body.style.overflow = '';
    const backdrop = document.querySelector('.offcanvas-backdrop');
    if (backdrop) backdrop.remove();
  });

  // تحميل أولي
  fetchArticles();
});