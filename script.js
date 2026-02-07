document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.reveal').forEach(el => {
    el.classList.add('visible');
  });
});

// Mobile navbar dropdown
function toggleMobileMenu() {
  // Only works on mobile (< 1280px)
  if (window.innerWidth >= 1280) return;

  // If portfolio is open, close it instead of toggling dropdown
  if (portfolioOpen) {
    togglePortfolio();
    return;
  }

  const dropdown = document.getElementById('mobileMenu');
  const arrow = document.querySelector('.navbar-arrow');
  dropdown.classList.toggle('open');
  arrow.classList.toggle('open');
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const navbar = document.querySelector('.navbar');
  const dropdown = document.getElementById('mobileMenu');
  if (dropdown && !navbar.contains(e.target)) {
    dropdown.classList.remove('open');
    document.querySelector('.navbar-arrow')?.classList.remove('open');
  }
});

// Portfolio sidebar toggle
let portfolioOpen = false;

function togglePortfolio() {
  const portfolio = document.querySelector('.portfolio');
  const dropdown = document.getElementById('mobileMenu');
  const arrow = document.querySelector('.navbar-arrow');
  const title = document.querySelector('.navbar-title');

  // Close mobile menu if open
  if (dropdown) {
    dropdown.classList.remove('open');
    arrow?.classList.remove('open');
  }

  if (!portfolioOpen) {
    portfolio.style.display = 'flex';
    portfolioOpen = true;

    // On mobile, swap brand to "← Back"
    if (window.innerWidth < 1280) {
      document.body.style.overflow = 'hidden';
      title.textContent = '← Back';
      title.classList.add('navbar-title--back');
      arrow.style.display = 'none';
    }
  } else {
    portfolio.style.display = '';
    portfolioOpen = false;
    document.body.style.overflow = '';

    // Restore brand
    title.textContent = 'Dev';
    title.classList.remove('navbar-title--back');
    arrow.style.display = '';
  }
}

// Reset portfolio state on resize
window.addEventListener('resize', () => {
  const portfolio = document.querySelector('.portfolio');
  const title = document.querySelector('.navbar-title');
  const arrow = document.querySelector('.navbar-arrow');

  if (window.innerWidth >= 1280) {
    // Desktop: let CSS handle it
    portfolio.style.display = '';
    portfolioOpen = false;
    document.body.style.overflow = '';
    title.textContent = 'Dev';
    title.classList.remove('navbar-title--back');
    arrow.style.display = '';
  } else if (portfolioOpen) {
    portfolio.style.display = 'flex';
  }
});