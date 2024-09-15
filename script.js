// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getDatabase, ref, set, remove, get } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAIPBGFVvGhQCaEj_kBiHi4BqjClaQgfLY",
  authDomain: "webserver-c9057.firebaseapp.com",
  projectId: "webserver-c9057",
  storageBucket: "webserver-c9057.appspot.com",
  messagingSenderId: "907721642809",
  appId: "1:907721642809:web:e2c6e92b828979fe2a8ee8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Create a new website
document.getElementById('create-website-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const url = document.getElementById('website-url').value;
  const htmlFile = document.getElementById('html-file').files[0];
  const cssFile = document.getElementById('css-file').files[0];
  const jsFile = document.getElementById('js-file').files[0];

  if (!htmlFile) {
    alert("HTML file is required.");
    return;
  }

  const readFile = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });

  try {
    const html = await readFile(htmlFile);
    const css = cssFile ? await readFile(cssFile) : '';
    const javascript = jsFile ? await readFile(jsFile) : '';
    const key = generateKey();

    await set(ref(database, `websites/${key}`), {
      title: url,
      html,
      css,
      javascript
    });

    document.getElementById('creation-key').textContent = `Key: ${key}`;
    alert("Website successfully created and added to the database!");
  } catch (error) {
    alert(`Error creating website: ${error.message}`);
  }
});

// Generate a 20-character alphanumeric key
function generateKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < 20; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

// Delete a website
document.getElementById('delete-website-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const key = document.getElementById('delete-key').value;

  try {
    await remove(ref(database, `websites/${key}`));
    alert("Website successfully deleted!");
  } catch (error) {
    alert(`Error deleting website: ${error.message}`);
  }
});

// Search and display a website
document.getElementById('search-btn').addEventListener('click', async (event) => {
  event.preventDefault();

  const searchUrl = document.getElementById('search-url').value;

  try {
    const snapshot = await get(ref(database, 'websites'));
    if (snapshot.exists()) {
      const websites = snapshot.val();
      let found = false;
      for (const key in websites) {
        if (websites[key].title === searchUrl) {
          displayWebsite(websites[key].html, websites[key].css, websites[key].javascript);
          found = true;
          break;
        }
      }
      if (!found) {
        alert("Website not found.");
      }
    } else {
      alert("No websites available.");
    }
  } catch (error) {
    console.error("Error retrieving websites:", error);
    alert("Error retrieving websites: " + error.message);
  }
});

// Display the website in the iframe
function displayWebsite(html, css, javascript) {
  const frame = document.getElementById('website-frame');
  const document = frame.contentDocument || frame.contentWindow.document;

  document.open();
  document.write(html);

  if (css) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  if (javascript) {
    const script = document.createElement('script');
    script.textContent = javascript;
    document.body.appendChild(script);
  }

  document.close();
  document.getElementById('website-display').classList.remove('hidden');
}
