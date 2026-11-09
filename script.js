document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.reveal').forEach(el => {
    el.classList.add('visible');
  });

  document.getElementById('profileAge').textContent = `(${new Date().getFullYear() - 2007})`;

  loadProjects();
  loadExperience();
  loadProfile();
  loadTech();
});

const PROJECTS_API_URL = 'https://arjc-back.onrender.com/api/projects';
const EXPERIENCE_API_URL = 'https://arjc-back.onrender.com/api/exp';
const PROFILE_API_URL = 'https://arjc-back.onrender.com/api/profile';
const TECH_API_URL = 'https://arjc-back.onrender.com/api/tech';
const PROJECTS_CACHE_KEY = 'arjc-projects-cache';
const PROJECT_CATEGORIES = {
  0: 'Hardware',
  1: 'Simulation / Game',
  2: 'AI',
  3: 'System',
  5: 'MISC'
};

async function loadProjects() {
  const featuredContainer = document.getElementById('featuredProjects');
  const archiveContainer = document.getElementById('projectArchive');

  renderProjectSkeletons(featuredContainer, archiveContainer);
  const cachedProjects = readCachedProjects();
  if (cachedProjects) {
    renderProjects(cachedProjects, featuredContainer, archiveContainer);
  }

  try {
    const response = await fetch(PROJECTS_API_URL, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Projects API returned ${response.status}`);
    }

    const result = await response.json();
    if (!result || !Array.isArray(result.data)) {
      throw new Error('Projects API returned an invalid data format');
    }

    writeCachedProjects(result.data);
    renderProjects(result.data, featuredContainer, archiveContainer);
  } catch (error) {
    console.error('Unable to load projects:', error);
    if (!cachedProjects) {
      const message = 'Projects are currently unavailable. Please try again later.';
      featuredContainer.replaceChildren(createProjectMessage(message));
      archiveContainer.replaceChildren(createProjectMessage(message));
    }
  }
}

function renderProjects(projects, featuredContainer, archiveContainer) {
  renderFeaturedProjects(featuredContainer, sortProjectsByDate(projects.filter(project => project.high)));
  renderProjectArchive(archiveContainer, projects);
}

function sortProjectsByDate(projects) {
  return [...projects].sort((firstProject, secondProject) => {
    const firstDate = firstProject.date ? Date.parse(firstProject.date) : Number.NEGATIVE_INFINITY;
    const secondDate = secondProject.date ? Date.parse(secondProject.date) : Number.NEGATIVE_INFINITY;
    return secondDate - firstDate;
  });
}

function readCachedProjects() {
  try {
    const cached = JSON.parse(localStorage.getItem(PROJECTS_CACHE_KEY));
    return Array.isArray(cached) ? cached : null;
  } catch (error) {
    console.warn('Unable to read cached projects:', error);
    return null;
  }
}

function writeCachedProjects(projects) {
  try {
    localStorage.setItem(PROJECTS_CACHE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.warn('Unable to cache projects:', error);
  }
}

function renderProjectSkeletons(featuredContainer, archiveContainer) {
  featuredContainer.replaceChildren(
    createLoadingMessage(),
    ...Array.from({ length: 4 }, createFeaturedSkeleton)
  );
  archiveContainer.replaceChildren(
    ...Array.from({ length: 5 }, (_, index) => createArchiveSkeleton(index))
  );
}

function createLoadingMessage() {
  const message = createTextElement('p', 'projects-loading-message', 'loading projects...');
  message.setAttribute('aria-live', 'polite');
  return message;
}

function createFeaturedSkeleton() {
  const card = document.createElement('div');
  card.className = 'featured-card project-skeleton';
  card.innerHTML = `
    <div class="skeleton-block skeleton-image"></div>
    <div class="card-info">
      <div class="skeleton-block skeleton-title"></div>
      <div class="skeleton-block skeleton-description"></div>
      <div class="skeleton-block skeleton-description skeleton-description-short"></div>
      <div class="skeleton-block skeleton-footer"></div>
    </div>
  `;
  return card;
}

function createArchiveSkeleton(index) {
  const section = document.createElement('div');
  section.className = 'project-category project-skeleton';
  section.innerHTML = `
    <div class="category-header">
      <div class="skeleton-block skeleton-category-title"></div>
    </div>
    ${Array.from({ length: index % 2 === 0 ? 3 : 2 }, () => `
      <div class="project-link">
        <div class="skeleton-block skeleton-project-name"></div>
        <div class="skeleton-block skeleton-project-type"></div>
      </div>
    `).join('')}
  `;
  return section;
}

function renderFeaturedProjects(container, projects) {
  container.replaceChildren(...projects.map(createFeaturedCard));
}

function renderProjectArchive(container, projects) {
  const groups = new Map();

  projects.forEach(project => {
    if (!groups.has(project.cat)) {
      groups.set(project.cat, []);
    }
    groups.get(project.cat).push(project);
  });

  container.replaceChildren(...Array.from(groups, ([category, categoryProjects]) => {
    const sortedCategoryProjects = sortProjectsByDate(categoryProjects);
    const section = document.createElement('div');
    section.className = 'project-category';

    const header = document.createElement('div');
    header.className = 'category-header';
    header.append(
      createTextElement('span', 'category-icon', `(${sortedCategoryProjects.length})`),
      createTextElement('h3', 'category-title', `${PROJECT_CATEGORIES[category] || 'Other'} ~~>`)
    );
    section.appendChild(header);
    sortedCategoryProjects.forEach(project => section.appendChild(createProjectLink(project)));
    return section;
  }));
}

function createFeaturedCard(project) {
  const card = document.createElement('div');
  card.className = 'featured-card';
  if (project.live) {
    card.classList.add('featured-card--clickable');
    card.setAttribute('role', 'link');
    card.setAttribute('tabindex', '0');
    card.addEventListener('click', event => {
      if (!event.target.closest('a')) {
        window.location.assign(project.live);
      }
    });
    card.addEventListener('keydown', event => {
      if ((event.key === 'Enter' || event.key === ' ') && !event.target.closest('a')) {
        event.preventDefault();
        window.location.assign(project.live);
      }
    });
  }

  const image = document.createElement('img');
  image.className = 'card-img';
  image.src = project.img;
  image.alt = `${project.name} project illustration`;

  const info = document.createElement('div');
  info.className = 'card-info';
  info.append(
    createTextElement('h3', 'card-title', `${project.name} ~~>`),
    createTextElement('p', 'card-description', project.desc || project.short_desc || '')
  );

  const footer = document.createElement('div');
  footer.className = 'card-footer';
  footer.appendChild(createTextElement('span', 'card-year', getProjectYear(project.date)));

  const link = createProjectAnchor(project, 'card-link', 'github repo ~~>');
  if (link) {
    footer.appendChild(link);
  }

  info.appendChild(footer);
  card.append(image, info);
  return card;
}

function createProjectLink(project) {
  const link = createProjectAnchor(project, 'project-link');
  if (!link) {
    return createTextElement('div', 'project-link', project.name);
  }

  const image = document.createElement('img');
  image.className = 'project-thumbnail';
  image.src = project.img;
  image.alt = '';
  image.loading = 'lazy';

  const details = document.createElement('span');
  details.className = 'project-link-details';
  const date = createTextElement('span', 'project-date', formatProjectDate(project.date));
  link.append(
    image,
    details,
    date
  );
  details.append(
    createTextElement('span', 'project-name', project.name),
    createTextElement('span', 'project-type', project.short_desc || project.desc || '')
  );
  return link;
}

function createProjectAnchor(project, className, label) {
  const url = project.repo || project.live;
  if (!url) {
    return null;
  }

  const link = document.createElement('a');
  link.className = className;
  link.href = url;
  if (/^https?:\/\//i.test(url)) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
  if (label) {
    link.textContent = label;
  }
  return link;
}

function createTextElement(tagName, className, text) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
}

function createProjectMessage(message) {
  return createTextElement('p', 'section-description', message);
}

function getProjectYear(date) {
  return date ? String(date).slice(0, 4) : '';
}

function sortEntriesByStartDate(entries) {
  return [...entries].sort((firstEntry, secondEntry) => {
    const firstDate = firstEntry.from ? Date.parse(firstEntry.from) : Number.NEGATIVE_INFINITY;
    const secondDate = secondEntry.from ? Date.parse(secondEntry.from) : Number.NEGATIVE_INFINITY;
    return secondDate - firstDate;
  });
}

async function loadExperience() {
  const educationContainer = document.getElementById('educationEntries');
  const experienceContainer = document.getElementById('experienceEntries');

  try {
    const response = await fetch(EXPERIENCE_API_URL);
    if (!response.ok) {
      throw new Error(`Experience API returned ${response.status}`);
    }

    const result = await response.json();
    if (!result || !Array.isArray(result.data)) {
      throw new Error('Experience API returned an invalid data format');
    }

    const education = sortEntriesByStartDate(result.data.filter(entry => entry.education));
    const experience = sortEntriesByStartDate(result.data.filter(entry => !entry.education));
    educationContainer.replaceChildren(...education.map(createTimelineItem));
    experienceContainer.replaceChildren(...experience.map(createTimelineItem));
  } catch (error) {
    console.error('Unable to load experience:', error);
    const message = 'Experience information is currently unavailable.';
    educationContainer.replaceChildren(createProjectMessage(message));
    experienceContainer.replaceChildren(createProjectMessage(message));
  }
}

async function loadProfile() {
  try {
    const response = await fetch(PROFILE_API_URL);
    if (!response.ok) {
      throw new Error(`Profile API returned ${response.status}`);
    }

    const result = await response.json();
    if (!result || !Array.isArray(result.data)) {
      throw new Error('Profile API returned an invalid data format');
    }

    const profile = Object.fromEntries(
      result.data.map(entry => [String(entry.key).toLowerCase(), entry.value])
    );
    const name = document.getElementById('profileName');
    const heroName = document.getElementById('profileNameHero');
    const place = document.getElementById('profilePlace');
    const status = document.getElementById('profileStatus');
    const brief = document.getElementById('profileBrief');

    if (profile.name) {
      name.textContent = profile.name;
      heroName.textContent = profile.name;
    }
    if (profile.place) {
      place.textContent = profile.place;
    }
    if (profile.current) {
      status.textContent = profile.current;
    }
    if (profile.brief) {
      brief.innerHTML = profile.brief;
    }
  } catch (error) {
    console.error('Unable to load profile:', error);
  }
}

async function loadTech() {
  const techStack = document.getElementById('techStackList');
  const interests = document.getElementById('interestsList');

  try {
    const response = await fetch(TECH_API_URL);
    if (!response.ok) {
      throw new Error(`Tech API returned ${response.status}`);
    }

    const result = await response.json();
    if (!result || !Array.isArray(result.data)) {
      throw new Error('Tech API returned an invalid data format');
    }

    renderTechStack(techStack, result.data.filter(entry => !entry.interest));
    renderInterests(interests, result.data.filter(entry => entry.interest));
  } catch (error) {
    console.error('Unable to load tech and interests:', error);
    techStack.replaceChildren(createProjectMessage('Tech stack is currently unavailable.'));
    interests.replaceChildren(createProjectMessage('Interests are currently unavailable.'));
  }
}

function renderTechStack(container, entries) {
  const categories = new Map();
  entries.forEach(entry => {
    if (!categories.has(entry.category)) {
      categories.set(entry.category, []);
    }
    categories.get(entry.category).push(entry);
  });

  container.replaceChildren(...Array.from(categories, ([category, categoryEntries]) => {
    const categoryLabel = createTextElement('b', 'skill-category', `// ${category}`);
    const skillItems = document.createElement('li');
    categoryEntries.forEach(entry => {
      const skill = createTextElement('span', 'bigger', entry.tech_name + " ");
      if (entry.col) skill.style.color = entry.col;
      skillItems.appendChild(skill);
    });

    const fragment = document.createDocumentFragment();
    fragment.append(categoryLabel, skillItems);
    return fragment;
  }).flatMap(fragment => Array.from(fragment.childNodes)));
}

function renderInterests(container, entries) {
  container.replaceChildren(...entries.map(entry => {
    const interest = createTextElement('span', 'interest-tag', entry.tech_name);
    if (entry.col) {
      interest.style.color = entry.col;
    }
    return interest;
  }));
}

function createTimelineItem(entry) {
  const item = document.createElement('div');
  item.className = 'timeline-item';

  item.append(
    createTextElement('h3', 'timeline-title', `${entry.title || ''} ~~>`),
    createTextElement('p', 'timeline-subtitle', entry.inst || ''),
    createTextElement('p', 'timeline-date', formatExperienceDates(entry.from, entry.till))
  );

  if (entry.desc) {
    const description = Array.isArray(entry.desc) ? entry.desc : [entry.desc];
    const list = document.createElement('ul');
    list.style.cssText = 'font-size: 0.75rem; color: #9ca3af; padding-left: 1rem; margin-top: 0.25rem; list-style: disc;';
    description.forEach(text => list.appendChild(createTextElement('li', '', text)));
    item.appendChild(list);
  }

  if (entry.url) {
    const link = document.createElement('a');
    link.className = 'timeline-link';
    link.href = entry.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Link ~~>';
    item.appendChild(link);
  }

  return item;
}

function formatExperienceDates(from, till) {
  if (!from) {
    return '';
  }

  const start = formatMonthYear(from);
  if (till && from === till) {
    return start;
  }

  const end = till ? formatMonthYear(till) : 'Present';
  return `${start} – ${end}`;
}

function formatMonthYear(date) {
  const parsedDate = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsedDate.getTime())
    ? String(date)
    : parsedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function formatProjectDate(date) {
  if (!date) {
    return '';
  }

  const projectDate = new Date(`${date}T00:00:00`);
  if (Number.isNaN(projectDate.getTime())) {
    return '';
  }

  const quarter = Math.floor(projectDate.getMonth() / 3) + 1;
  return `Q${quarter} ${projectDate.getFullYear()}`;
}

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
  const portfolioButton = document.querySelector('.navbar-link-portfolio');

  // Close mobile menu if open
  if (dropdown) {
    dropdown.classList.remove('open');
    arrow?.classList.remove('open');
  }

  if (!portfolioOpen) {
    portfolio.style.display = 'flex';
    portfolioOpen = true;

    // On mobile, turn the portfolio control into a close button.
    if (window.innerWidth < 1280) {
      document.body.style.overflow = 'hidden';
      portfolioButton.textContent = 'X';
      arrow.style.display = 'none';
    }
  } else {
    portfolio.style.display = '';
    portfolioOpen = false;
    document.body.style.overflow = '';

    portfolioButton.textContent = 'Portfolio';
    arrow.style.display = '';
  }
}

// Reset portfolio state on resize
window.addEventListener('resize', () => {
  const portfolio = document.querySelector('.portfolio');
  const portfolioButton = document.querySelector('.navbar-link-portfolio');
  const arrow = document.querySelector('.navbar-arrow');

  if (window.innerWidth >= 1280) {
    // Desktop: let CSS handle it
    portfolio.style.display = '';
    portfolioOpen = false;
    document.body.style.overflow = '';
    portfolioButton.textContent = 'Portfolio';
    arrow.style.display = '';
  } else if (portfolioOpen) {
    portfolio.style.display = 'flex';
  }
});