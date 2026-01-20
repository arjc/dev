document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.reveal').forEach(el => {
    el.classList.add('visible');
  });
});


function togglePortfolio(thisElement) {
  const portfolio = document.querySelectorAll('.portfolio')[0];
  const other = document.querySelectorAll('.theOtherShi')[0];
  if (portfolio.style.display === 'none' || !portfolio.style.display) {
    portfolio.style.display = 'flex';
    portfolio.style.border = 'none';
    portfolio.style.padding = '5vh 0';
    other.style.display = 'none';
    thisElement.textContent = '< projects';
  } else {
    portfolio.style.display = 'none';
    other.style.display = 'flex';
    thisElement.textContent = 'portfolio';
  }
}
