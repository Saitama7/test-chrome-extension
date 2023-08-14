// @ts-nocheck
const form = document.querySelector('.search-form');
const newDialAddForm = document.querySelector('.new-dial-form-wrapper');
const addDialElement = document.querySelector('.add-dial');
const newDialFormCancelButton = document.getElementById('new-dial-form-cancel');
const newDialFormSaveButton = document.getElementById('new-dial-form-save');
const urlPattern = /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#()?&//=]*)/;
const Analytics = new GAnalytics();
const logoParseURL = 'https://besticon-demo.herokuapp.com/allicons.json?url=';

/**
 * Search submit handler
 */
form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const searchQuery = new FormData(event.target);
  chrome.tabs.create({
    url: `https://www.bing.com/search?q=${searchQuery.get('query')}`
  });

  Analytics.fireEvent('search', { label: 'search', query: searchQuery.get('query') });
});

/**
 * *****************************************************************************
 */

// NEW DIAL ADD PART
function openNewDialAddForm() {
  newDialAddForm.classList.add('active')
}

function closeNewDialAddForm() {
  newDialAddForm.classList.remove('active')
}

/**
 * 
 * using heroku app parses link
 * @param {String} url website url where we want to parse logo
 * @returns fethed json with icons
 */
async function parseLogoFromURL(url) {
  if (!url) {
    console.log('Unable to parse logo. Wrong url!');
    return;
  }

  try {
    const response = await fetch(`${logoParseURL}${url}`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.log(`Parsing error: ${error}`);
    return null;
  }
}

async function newDialSave() {
  const titleField = document.getElementById('website-title');
  const urlField = document.getElementById('website-url');
  const urlErrorLabel = document.querySelector('.url-format-error');
  const emptyFieldErrorText = document.querySelector('.field-error-label')

  if (!titleField.value) {
    emptyFieldErrorText.classList.add('active-error');
  } else {
    emptyFieldErrorText.classList.remove('active-error');
  }

  if (!urlField.value || !urlPattern.test(urlField.value)) {
    urlErrorLabel.classList.add('active-error');
  } else {
    urlErrorLabel.classList.remove('active-error');
  }

  try {
    const parseResult = await parseLogoFromURL(urlField.value);
    const logoURL = parseResult?.icons[0]?.url || 'images/broken-logo.png';
    chrome.runtime.sendMessage({
      message: 'addDial',
      payload: {
        url: urlField.value,
        title: titleField.value,
        logo: logoURL
      }
    });

    chrome.runtime.sendMessage({
    message: 'getDials'
  });
    closeNewDialAddForm();
    titleField.value = '';
    urlField.value = '';
  } catch (error) {
    console.log(error);
  }
}

/**
 * *****************************************************************************
 */

// EVENT LISTENERS

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener('contextmenu', event => event.preventDefault());
  addDialElement.addEventListener('click', () => openNewDialAddForm());
  newDialFormCancelButton.addEventListener('click', () => closeNewDialAddForm());
  newDialFormSaveButton.addEventListener('click', () => newDialSave());

  chrome.runtime.sendMessage({
    message: 'getDials'
  });
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.message === 'get_dials_success') {
    const dials = request.payload;
    const dialsContainer = document.getElementById('dials');
    dialsContainer.innerHTML = '';
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