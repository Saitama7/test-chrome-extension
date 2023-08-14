const form = document.querySelector('.search-form');
const Analytics = new GAnalytics();

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const searchQuery = new FormData(event.target);
  chrome.tabs.create({
    url: `https://www.bing.com/search?q=${searchQuery.get('query')}`
  });

  Analytics.fireEvent('search', { label: 'search', query: searchQuery.get('query') });
});

document.addEventListener("DOMContentLoaded", () => {
  chrome.runtime.sendMessage({
    message: 'getDials'
  });
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.message === 'get_dials_success') {
    const dials = request.payload;
    const dialsContainer = document.getElementById('dials');
    dials.forEach((dial) => {
      const html = `<a href="${dial.url}" class="dial"><img alt="${dial.title} Logo" src="${dial.logo}" class="dial-img" title="Live Start" /></a>`;
      
      dialsContainer.innerHTML += html;
    });
  }
});