# test-chrome-extension
<img width="1440" alt="Screenshot 2023-08-15 at 1 42 16 AM" src="https://github.com/Saitama7/test-chrome-extension/assets/19621981/e6f2f075-5e05-41ac-b140-b37ba3f58a07">

## TODO:

### Please create a new extension that :
* takes over the NewTab and displays own NewTab page
* feature1: have a search bar with a search button
  1. on search, a new tab will open on www.bing.com/q=[SEARCH_TERM]
  2. on search, a new GoogleAnalytics event is recorded: label = search
* feature2: have a dial/tile type (like on Speed Dial) - 50x50, that displays a logo and goes to www.livestartpage.com
  1. on click, open the website in the same page
  2. on click, a new GA even is recorded: label = web_site_name;
* events should be fired every time, we should have the ability to count such events per day
* please follow the GA documentation and guidelines for Analytics
GA documentation for extensions: https://developer.chrome.com/docs/extensions/mv3/tut_analytics/ GA measurementID: G-3YXME2HPDH
