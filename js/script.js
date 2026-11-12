const NASA_API_KEY = 'DEMO_KEY';
const APOD_URL = 'https://api.nasa.gov/planetary/apod';
const FALLBACK_IMAGE = 'img/NASA-Logo-Large.jpg';

const SPACE_FACTS = [
  'A day on Venus is longer than its year.',
  'Neutron stars are so dense that a teaspoon of one would weigh about a billion tons on Earth.',
  'There are more stars in the universe than grains of sand on all of Earth’s beaches.',
  'Footprints left on the Moon by Apollo astronauts could last for millions of years.',
  'Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.',
  'Jupiter’s Great Red Spot is a storm wider than Earth that has raged for centuries.',
  'Saturn is less dense than water. In a big enough bathtub, it would float.',
  'The International Space Station orbits Earth about every 90 minutes.',
  'Olympus Mons on Mars is nearly three times taller than Mount Everest.',
  'The Milky Way and Andromeda galaxies are on course to collide in about 4.5 billion years.'
];

const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const fetchButton = document.getElementById('fetchButton');
const gallery = document.getElementById('gallery');
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalVideoLink = document.getElementById('modalVideoLink');
const modalExplanation = document.getElementById('modalExplanation');

setupDateInputs(startInput, endInput);
showRandomFact();

fetchButton.addEventListener('click', loadGallery);
modal.addEventListener('click', (event) => {
  if (event.target === modal) modal.close();
});

async function loadGallery() {
  fetchButton.disabled = true;
  showMessage('🔄 Loading space photos…');
  try {
    const entries = await fetchApod(startInput.value, endInput.value);
    renderGallery(entries.reverse());
  } catch (error) {
    showMessage(`⚠️ ${error.message}`);
  } finally {
    fetchButton.disabled = false;
  }
}

async function fetchApod(startDate, endDate) {
  const params = new URLSearchParams({
    api_key: NASA_API_KEY,
    start_date: startDate,
    end_date: endDate,
    thumbs: true
  });
  const response = await fetch(`${APOD_URL}?${params}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.msg ?? data.error?.message ?? 'Could not reach NASA. Please try again.');
  }
  return data;
}

function renderGallery(entries) {
  if (entries.length === 0) {
    showMessage('No space photos found for these dates.');
    return;
  }
  gallery.replaceChildren(...entries.map(createCard));
}

function createCard(entry) {
  const card = document.createElement('button');
  card.className = 'gallery-item';
  card.classList.toggle('is-video', !isImage(entry));
  card.innerHTML = `
    <div class="gallery-image"><img src="${previewImage(entry)}" alt="" loading="lazy" /></div>
    <h3>${entry.title}</h3>
    <p class="date">${formatDate(entry.date)}</p>
  `;
  card.addEventListener('click', () => openModal(entry));
  return card;
}

function openModal(entry) {
  modalImage.src = entry.hdurl ?? previewImage(entry);
  modalImage.alt = entry.title;
  modalTitle.textContent = entry.title;
  modalDate.textContent = formatDate(entry.date);
  modalExplanation.textContent = entry.explanation;
  modalVideoLink.hidden = isImage(entry);
  modalVideoLink.href = apodPageUrl(entry.date);
  modal.showModal();
}

function showMessage(text) {
  gallery.innerHTML = `<p class="placeholder">${text}</p>`;
}

function isImage(entry) {
  return entry.media_type === 'image';
}

function previewImage(entry) {
  return isImage(entry) ? entry.url : entry.thumbnail_url ?? FALLBACK_IMAGE;
}

function apodPageUrl(date) {
  const yymmdd = date.slice(2).replaceAll('-', '');
  return `https://apod.nasa.gov/apod/ap${yymmdd}.html`;
}

function formatDate(date) {
  // Without a time, "YYYY-MM-DD" is parsed as UTC midnight, which shows as the previous day in US time zones.
  return new Date(`${date}T00:00`).toLocaleDateString('en-US', { dateStyle: 'long' });
}

function showRandomFact() {
  const randomIndex = Math.floor(Math.random() * SPACE_FACTS.length);
  document.getElementById('spaceFact').textContent = SPACE_FACTS[randomIndex];
}
