// Add visible class to reveal elements after page loads
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.reveal').forEach(el => {
    el.classList.add('visible');
  });
});
