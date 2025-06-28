(function() {
  'use strict';
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-status');
  const formspreeEndpoint = 'https://formspree.io/f/manjabbr';

  form.addEventListener('submit', function(event) {
    event.preventDefault();
    event.stopPropagation();

    if (!validateForm()) {
      form.classList.add('was-validated');
      feedback.style.display = 'block';
      feedback.className = 'mt-2 text-danger';
      feedback.textContent = 'يرجى تصحيح الأخطاء في النموذج.';
      setTimeout(() => feedback.style.display = 'none', 5000);
      return;
    }

    const formData = new FormData(form);

    fetch(formspreeEndpoint, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`فشل الإرسال: ${response.statusText}`);
      }
    })
    .then(data => {
      feedback.style.display = 'block';
      feedback.className = 'mt-2 text-success';
      feedback.textContent = 'تم إرسال الرسالة بنجاح!';
      form.reset();
    })
    .catch(error => {
      feedback.style.display = 'block';
      feedback.className = 'mt-2 text-danger';
      feedback.textContent = 'حدث خطأ أثناء الإرسال: ' + error.message;
      console.error('خطأ مفصل:', error);
    })
    .finally(() => {
      setTimeout(() => feedback.style.display = 'none', 5000);
      form.classList.remove('was-validated');
    });
  });

  function validateForm() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!/^[أ-يa-zA-Z\s]+$/.test(name)) return false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
    if (message.length < 10) return false;

    return true;
  }

  // Show FAQ answer based on dropdown selection
  const faqSelect = document.querySelector('.faq-dropdown select');
  const faqAnswers = document.querySelectorAll('.faq-answer p');
  faqSelect.addEventListener('change', function() {
    faqAnswers.forEach(answer => answer.style.display = 'none');
    if (this.value) {
      document.getElementById(this.value).style.display = 'block';
    }
  });
})();

