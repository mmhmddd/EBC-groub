document.addEventListener('DOMContentLoaded', function () {
  const navbarToggler = document.querySelector('.navbar-toggler');
  const navbarCollapse = document.querySelector('#navbarNav');

  // Toggle navbar collapse on toggler click
  navbarToggler.addEventListener('click', function () {
    navbarCollapse.classList.toggle('show');
  });

  // Close navbar collapse and dropdowns when clicking anywhere on the document
  document.addEventListener('click', function (event) {
    const isClickInsideNavbar = event.target.closest('.navbar');
    const isClickOnToggler = event.target.closest('.navbar-toggler');
    const isClickOnNavLink = event.target.closest('.nav-link') || event.target.closest('.dropdown-item');

    if (!isClickInsideNavbar || isClickOnNavLink) {
      // Close navbar collapse if clicking outside or on a nav link
      navbarCollapse.classList.remove('show');
    }

    // If clicking the toggler, prevent closing immediately (handled by toggle above)
    if (isClickOnToggler) {
      return;
    }
  });
});