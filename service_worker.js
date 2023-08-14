let db = null;

const liveStartData = {
  url: 'https://www.livestartpage.com',
  logo: 'images/LiveStart/logo.png',
  title: 'Live Start Page'
};

function insertToDB(dial) {
  if (!db) return;

  const insertTransaction = db.transaction('dials', 'readwrite');
  const objectStore = insertTransaction.objectStore('dials');

  return new Promise((resolve, reject) => {
    insertTransaction.oncomplete = () => (resolve(true));

    insertTransaction.onerror = (error) => {
      console.error(`DB transaction error: ${error}`);
      resolve(false)
    };

    const request = objectStore.add(dial);

    request.oncomplete = () => console.log('New dial added successfully!')
  });
}

function createDB() {
  const request = indexedDB.open('TestDB');

  request.onsuccess = (event) => {
    db = event.target.result;
    insertToDB(liveStartData);
  };

  request.onupgradeneeded = (event) => {
    db = event.target.result;

    db.createObjectStore('dials', {
      keyPath: 'url'
    });
  }

  request.onerror = (error) => {
    console.error(`DB creation error: ${error}`);
  };
}

function connectToDB() {
  const request = indexedDB.open('TestDB');

  return new Promise((resolve, reject) => {
    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

  request.onerror = (error) => {
    console.error(`DB connection error: ${error}`)
    reject(error);
  }
  })
}

function getDials(url) {
  if (!db) return;

  const get_transaction = db.transaction("dials", "readonly");
  const objectStore = get_transaction.objectStore("dials");

  return new Promise((resolve, reject) => {
    const request = url ? objectStore.get(url) : objectStore.getAll();
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (error) => reject(error);
  });
}

function updateDial(dial) {
  if (!db) return;

  const put_transaction = db.transaction("dials", "readwrite");
  const objectStore = put_transaction.objectStore("dials");

  return new Promise((resolve, reject) => {
    const request = objectStore.get(dial.url);
    
    request.onsuccess = () => {
      objectStore.put(dial);
      resolve(true);
    }

    request.onerror = (error) => {
      console.log(`DB Update error: ${error}`);
      reject(error);
    }
  });
}

function deleteDial(url) {
  if (!db) return;

  const delete_transaction = db.transaction("dials", "readwrite");
  const objectStore = delete_transaction.objectStore("dials");

  return new Promise((resolve, reject) => {
    delete_transaction.oncomplete = () => {
      console.log("Delete transaction completed");
      resolve(true);
    }

    delete_transaction.onerror = (error) => {
      console.log(`Deleting error: ${error}`)
        reject(error);
    }

    objectStore.delete(url);
  });
}

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    createDB();
    chrome.tabs.create({
      url: "newTab.html"
    });
  };
});

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({
    url: 'newTab.html'
  });
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.message === 'getDials') {
    connectToDB().then(() => {
      getDials()?.then((res) => {
        chrome.runtime.sendMessage({
          message: 'get_dials_success',
          payload: res
        });
      });
    });
  }

  if (request.message === 'addDial') {
    updateDial(request.payload);
  }
});