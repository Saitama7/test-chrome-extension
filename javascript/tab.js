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
  document.addEventListener('contextmenu', event => event.preventDefault());
  chrome.runtime.sendMessage({
    message: 'getDials'
  });
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.message === 'get_dials_success') {
    const dials = request.payload;
    const dialsContainer = document.getElementById('dials');
    dials.forEach((dial, index) => {
      const html = `<div data="${index}" class="dial"><img alt="${dial.title} Logo" src="${dial.logo}" class="dial-img" title="${dial.title}" /></div>`;
      
      dialsContainer.innerHTML += html;
    });

    document.querySelectorAll('.dial').forEach((dial) => {
    dial.addEventListener('click', (event) => {
      event.stopPropagation()
      const websiteName = event.target.children[0].attributes.title.value;
      const targetIndex = event.target.attributes.data.value;
      Analytics.fireEvent('website_click', { label: websiteName, website_url: dials[targetIndex].url });
      chrome.tabs.getCurrent((tab) => {
        chrome.tabs.update(tab.id, { url: dials[targetIndex].url });
      });
    });
  });
  }
});