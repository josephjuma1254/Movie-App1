const API_KEY = 'YOUR_API_KEY_HERE'; // Insert your TMDb API key here
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w300';

const popularContainer = document.querySelector('.moviesGrid');
const tvContainer = document.querySelector('.tvGrid');

function createCard(item, type) {
  const title = item.title || item.name || 'Untitled';
  const date = item.release_date || item.first_air_date || 'Unknown date';
  const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
  const posterPath = item.poster_path ? `${IMAGE_BASE}${item.poster_path}` : '';

  const card = document.createElement('div');
  card.className = 'media-card';
  card.style.background = 'rgba(0,0,0,0.45)';
  card.style.border = '1px solid rgba(255,255,255,0.12)';
  card.style.borderRadius = '14px';
  card.style.overflow = 'hidden';
  card.style.color = '#fff';
  card.style.display = 'flex';
  card.style.flexDirection = 'column';
  card.style.minHeight = '100%';

  const poster = document.createElement('img');
  poster.className = 'media-poster';
  poster.src = posterPath || 'https://via.placeholder.com/300x450?text=No+Image';
  poster.alt = `${title} poster`;
  poster.style.width = '100%';
  poster.style.height = 'auto';
  poster.style.objectFit = 'cover';
  poster.style.display = 'block';
  poster.style.flexShrink = '0';

  const info = document.createElement('div');
  info.className = 'media-info';
  info.style.padding = '1rem';
  info.style.display = 'flex';
  info.style.flexDirection = 'column';
  info.style.gap = '0.5rem';

  const titleEl = document.createElement('h3');
  titleEl.className = 'media-title';
  titleEl.textContent = title;
  titleEl.style.margin = '0';
  titleEl.style.fontSize = '1rem';
  titleEl.style.lineHeight = '1.2';

  const metaEl = document.createElement('p');
  metaEl.className = 'media-meta';
  metaEl.innerHTML = `<strong>Rating:</strong> ${rating} &nbsp;|&nbsp; <strong>${type === 'tv' ? 'First Air Date' : 'Release Date'}:</strong> ${date}`;
  metaEl.style.margin = '0';
  metaEl.style.fontSize = '0.9rem';
  metaEl.style.color = '#d3d3d3';

  info.appendChild(titleEl);
  info.appendChild(metaEl);
  card.appendChild(poster);
  card.appendChild(info);

  return card;
}

function renderCards(container, items, type) {
  container.innerHTML = '';
  if (!items || items.length === 0) {
    showError(container, 'No items found.');
    return;
  }

  container.style.display = 'grid';
  container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(180px, 1fr))';
  container.style.gap = '1rem';
  container.style.alignItems = 'stretch';

  items.forEach((item) => {
    const card = createCard(item, type);
    container.appendChild(card);
  });
}

function showError(container, message) {
  container.innerHTML = '';
  const errorEl = document.createElement('div');
  errorEl.textContent = message;
  errorEl.style.color = '#f1c40f';
  errorEl.style.padding = '1rem';
  errorEl.style.background = 'rgba(0,0,0,0.35)';
  errorEl.style.borderRadius = '12px';
  container.appendChild(errorEl);
}

function filterCards(query, container) {
  const cards = Array.from(container.querySelectorAll('.media-card'));
  const normalizedQuery = query.trim().toLowerCase();
  let visibleCount = 0;

  cards.forEach((card) => {
    const title = card.querySelector('.media-title')?.textContent.toLowerCase() || '';
    const matches = !normalizedQuery || title.includes(normalizedQuery);
    card.style.display = matches ? 'flex' : 'none';
    if (matches) visibleCount += 1;
  });

  if (visibleCount === 0) {
    showError(container, 'No results match your search.');
  }
}

function resetFilters(container) {
  const cards = Array.from(container.querySelectorAll('.media-card'));
  cards.forEach((card) => {
    card.style.display = 'flex';
  });
}

function setupUI() {
  const searchInput = document.querySelector('.search-box');
  const searchButton = document.querySelector('.search-icon');
  const seeAllLinks = Array.from(document.querySelectorAll('.see-all'));
  const playButton = document.querySelector('.btn-primary');
  const infoButton = document.querySelector('.btn-secondary');

  if (searchButton && searchInput) {
    searchButton.addEventListener('click', () => {
      const query = searchInput.value;
      filterCards(query, popularContainer);
      filterCards(query, tvContainer);
    });

    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        searchButton.click();
      }
    });
  }

  seeAllLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const category = link.closest('section')?.querySelector('.category-title')?.textContent || '';
      if (category.includes('Popular Movies')) {
        resetFilters(popularContainer);
        popularContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (category.includes('Trending TV Shows')) {
        resetFilters(tvContainer);
        tvContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  if (playButton) {
    playButton.addEventListener('click', () => {
      alert('Play action triggered for the featured movie.');
    });
  }

  if (infoButton) {
    infoButton.addEventListener('click', () => {
      alert('More info is not available in this demo, but the button is working.');
    });
  }
}

async function fetchMovies() {
  const url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Unable to fetch popular movies.');
  }
  const data = await response.json();
  return data.results || [];
}

async function fetchTVShows() {
  const url = `${BASE_URL}/trending/tv/week?api_key=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Unable to fetch trending TV shows.');
  }
  const data = await response.json();
  return data.results || [];
}

async function initialize() {
  if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
    const message = 'Please add your TMDb API key to Script.js: const API_KEY = "YOUR_API_KEY_HERE";';
    showError(popularContainer, message);
    showError(tvContainer, message);
    return;
  }

  try {
    const [movies, tvShows] = await Promise.all([fetchMovies(), fetchTVShows()]);
    renderCards(popularContainer, movies, 'movie');
    renderCards(tvContainer, tvShows, 'tv');
    setupUI();
  } catch (error) {
    const message = 'Failed to load content. Please try again later.';
    showError(popularContainer, message);
    showError(tvContainer, message);
    console.error(error);
  }
}

window.addEventListener('DOMContentLoaded', initialize);
