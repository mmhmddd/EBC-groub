document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const articleContainer = document.getElementById('articleContainer');
  const clearFilter = document.getElementById('clearFilter');
  const loader = document.getElementById('loader');
  const carouselInner = document.getElementById('articleCarousel').querySelector('.carousel-inner');
  const carouselIndicators = document.getElementById('articleCarousel').querySelector('.carousel-indicators');
  const filterBtn = document.getElementById('filterBtn');
  const sidebar = document.getElementById('sidebar');
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
    fetch('/assets/data/articles/articles.json')
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        allArticles = data;
        populateCarousel();
        populateCategories();
        renderArticles(allArticles);
        filterArticles(allArticles);
      })
      .catch(error => console.error('خطأ في تحميل البيانات:', error));
  }

  function populateCarousel() {
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
    const categories = [...new Set(allArticles.map(article => article.category))];
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.toLowerCase();
      option.textContent = category;
      categoryFilter.appendChild(option);
    });
  }

  function renderArticles(data) {
    articleContainer.innerHTML = '';
    loader.style.display = 'none';
    if (!data || data.length === 0) {
      articleContainer.innerHTML = '<p class="text-center">لا يوجد مقالات متطابقة.</p>';
      return;
    }
    data.forEach((article, index) => {
      const isEven = index % 2 === 0;
      const row = document.createElement('div');
      row.className = `row article-row ${isEven ? '' : 'reverse'}`;
      row.innerHTML = `
        <div class="col-12">
          <div class="row">
            ${isEven ? `
              <div class="col-4 article-image">
                <img src="${article.image}" alt="${article.title}">
              </div>
              <div class="col-8 article-content">
                <div class="article-header">
                  <h3 class="article-title">${article.title}</h3>
                  <p class="article-category">${article.category}</p>
                </div>
                <p class="article-description">${article.content}</p>
                <div class="article-actions">
                  <a href="${article.slug}" class="article-btn">اقرأ المقال</a>
                  <a href="#" class="share-btn" onclick="shareArticle('${article.title}', '${window.location.href + article.slug}')">مشاركة</a>
                </div>
              </div>
            ` : `
              <div class="col-8 article-content">
                <div class="article-header">
                  <h3 class="article-title">${article.title}</h3>
                  <p class="article-category">${article.category}</p>
                </div>
                <p class="article-description">${article.content}</p>
                <div class="article-actions">
                  <a href="${article.slug}" class="article-btn">اقرأ المقال</a>
                  <a href="#" class="share-btn" onclick="shareArticle('${article.title}', '${window.location.href + article.slug}')">مشاركة</a>
                </div>
              </div>
              <div class="col-4 article-image">
                <img src="${article.image}" alt="${article.title}">
              </div>
            `}
          </div>
        </div>
      `;
      articleContainer.appendChild(row);
      if (index < data.length - 1) {
        const hr = document.createElement('hr');
        hr.className = 'divider';
        articleContainer.appendChild(hr);
      }
    });
  }

  function filterArticles(data) {
    loader.style.display = 'block';
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
      loader.style.display = 'none';
    });
  }

  window.shareArticle = (title, url) => {
    if (navigator.share) {
      navigator.share({ title: title, url: url })
        .catch(error => console.error('خطأ في المشاركة:', error));
    } else {
      alert('المشاركة غير مدعومة في هذا المتصفح. انسخ الرابط: ' + url);
    }
  };

  // الفلاتر
  searchInput.addEventListener('input', () => filterArticles(allArticles));
  categoryFilter.addEventListener('change', () => filterArticles(allArticles));
  clearFilter.addEventListener('click', () => {
    searchInput.value = '';
    categoryFilter.value = '';
    localStorage.removeItem('selectedCategory');
    localStorage.removeItem('searchTerm');
    filterArticles(allArticles);
  });

  // زر فتح الفلتر الجانبي
  filterBtn.addEventListener('click', () => {
    offcanvas.show(); // استخدم نفس الكائن دائمًا
  });

  // عند إغلاق الشريط الجانبي
  sidebar.addEventListener('hidden.bs.offcanvas', () => {
    document.body.style.overflow = ''; // التأكد من إعادة التمرير
    const backdrop = document.querySelector('.offcanvas-backdrop');
    if (backdrop) backdrop.remove();  // حذف الخلفية المظللة إن وجدت
  });

  // تحميل أولي
  fetchArticles();
});
