const slider = document.getElementById('clientSlider');
const leftArrow = document.getElementById('leftArrow');
const rightArrow = document.getElementById('rightArrow');

const itemWidth = 170; // شامل الـ margin بين العناصر
const intervalTime = 2000; // التمرير كل ثانيتين

function autoScroll() {
  // إذا وصلنا لنهاية السلايدر، نرجع لبدايته
  if (slider.scrollLeft + slider.offsetWidth >= slider.scrollWidth - itemWidth) {
    slider.scrollTo({ left: 0, behavior: 'smooth' });
  } else {
    slider.scrollBy({ left: itemWidth, behavior: 'smooth' });
  }
}

// بدء التمرير التلقائي
let autoScrollInterval = setInterval(autoScroll, intervalTime);

// إعادة تشغيل التمرير التلقائي بعد أي تفاعل يدوي
function resetAutoScroll() {
  clearInterval(autoScrollInterval);
  autoScrollInterval = setInterval(autoScroll, intervalTime);
}

// التحكم بالسهمين
leftArrow.addEventListener('click', () => {
  slider.scrollBy({ left: -itemWidth, behavior: 'smooth' });
  resetAutoScroll();
});

rightArrow.addEventListener('click', () => {
  slider.scrollBy({ left: itemWidth, behavior: 'smooth' });
  resetAutoScroll();
});

// التحكم بالسحب (الماوس)
let isDown = false;
let startX;
let scrollLeft;

slider.addEventListener('mousedown', (e) => {
  isDown = true;
  slider.classList.add('dragging');
  startX = e.pageX - slider.offsetLeft;
  scrollLeft = slider.scrollLeft;
  resetAutoScroll();
});

slider.addEventListener('mouseleave', () => {
  isDown = false;
  slider.classList.remove('dragging');
});

slider.addEventListener('mouseup', () => {
  isDown = false;
  slider.classList.remove('dragging');
});

slider.addEventListener('mousemove', (e) => {
  if (!isDown) return;
  e.preventDefault();
  const x = e.pageX - slider.offsetLeft;
  const walk = (x - startX) * 1.5;
  slider.scrollLeft = scrollLeft - walk;
});
