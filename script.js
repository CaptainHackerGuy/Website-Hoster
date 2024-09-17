import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  remove,
  get,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

import { 
    FIREBASE_API_KEY, 
    FIREBASE_AUTH_DOMAIN, 
    FIREBASE_DATABASE_URL, 
    FIREBASE_PROJECT_ID, 
    FIREBASE_STORAGE_BUCKET, 
    FIREBASE_MESSAGING_SENDER_ID, 
    FIREBASE_APP_ID 
} from './config.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: FIREBASE_API_KEY,
    authDomain: FIREBASE_AUTH_DOMAIN,
    databaseURL: FIREBASE_DATABASE_URL,
    projectId: FIREBASE_PROJECT_ID,
    storageBucket: FIREBASE_STORAGE_BUCKET,
    messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
    appId: FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Handle website creation
document
  .getElementById("website-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const websiteUrl = document.getElementById("website-url").value;
    const htmlFile = document.getElementById("html-file").files[0];
    const cssFile = document.getElementById("css-file").files[0];
    const jsFile = document.getElementById("js-file").files[0];

    if (!websiteUrl || !htmlFile) {
      alert("Please provide a website URL and HTML file.");
      return;
    }

    try {
      // Check if website already exists
      const snapshot = await get(ref(database, "websites"));
      if (snapshot.exists()) {
        const websites = snapshot.val();
        for (const key in websites) {
          if (websites[key].title === websiteUrl) {
            alert("A website with this URL already exists.");
            return;
          }
        }
      }

      const htmlContent = await readFileContent(htmlFile);
      const cssContent = cssFile ? await readFileContent(cssFile) : "";
      const jsContent = jsFile ? await readFileContent(jsFile) : "";

      const key = generateKey();
      const websiteData = {
        title: websiteUrl,
        html: htmlContent,
        css: cssContent,
        javascript: jsContent,
      };

      await set(ref(database, "websites/" + key), websiteData);
      document.getElementById(
        "website-key"
      ).textContent = `Your website key is: ${key}`;
      alert(
        "Website Created Successfully! Check your key to edit/delete it later."
      );
    } catch (error) {
      console.error("Error uploading website:", error);
      alert("Error uploading website. Check console for details.");
    }
  });

// Handle website editing
document
  .getElementById("edit-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const key = document.getElementById("edit-key").value;
    const htmlFile = document.getElementById("edit-html-file").files[0];
    const cssFile = document.getElementById("edit-css-file").files[0];
    const jsFile = document.getElementById("edit-js-file").files[0];

    if (!key) {
      alert("Please enter the key.");
      return;
    }

    try {
      const snapshot = await get(ref(database, "websites/" + key));
      if (!snapshot.exists()) {
        alert("No website found with this key.");
        return;
      }

      const websiteData = snapshot.val();
      const htmlContent = htmlFile
        ? await readFileContent(htmlFile)
        : websiteData.html;
      const cssContent = cssFile
        ? await readFileContent(cssFile)
        : websiteData.css;
      const jsContent = jsFile
        ? await readFileContent(jsFile)
        : websiteData.javascript;

      await set(ref(database, "websites/" + key), {
        title: websiteData.title,
        html: htmlContent,
        css: cssContent,
        javascript: jsContent,
      });

      alert("Website updated successfully!");
    } catch (error) {
      console.error("Error updating website:", error);
      alert("Error updating website. Check console for details.");
    }
  });

// Handle website deletion
document
  .getElementById("delete-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const key = document.getElementById("website-key-input").value;

    if (!key) {
      alert("Please enter the key.");
      return;
    }

    try {
      await remove(ref(database, "websites/" + key));
      alert("Website successfully deleted!");
    } catch (error) {
      console.error("Error deleting website:", error);
      alert("Error deleting website. Check console for details.");
    }
  });

// Handle website search
document
  .getElementById("search-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const searchUrl = document.getElementById("search-url").value;

    if (!searchUrl) {
      alert("Please enter a URL to search.");
      return;
    }

    try {
      const snapshot = await get(ref(database, "websites"));
      if (snapshot.exists()) {
        const websites = snapshot.val();
        for (const key in websites) {
          if (websites[key].title === searchUrl) {
            displayWebsite(
              websites[key].html,
              websites[key].css,
              websites[key].javascript
            );
            return;
          }
        }
        alert("Website not found.");
      } else {
        alert("No websites available.");
      }
    } catch (error) {
      console.error("Error retrieving websites:", error);
      alert("Error retrieving websites. Check console for details.");
    }
  });

function readFileContent(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function generateKey(length = 20) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function displayWebsite(html, css, javascript) {
  const frame = document.getElementById("website-frame");
  const doc = frame.contentDocument || frame.contentWindow.document;

  doc.open();
  doc.write(html);

  if (css) {
    const style = doc.createElement("style");
    style.textContent = css;
    doc.head.appendChild(style);
  }

  if (javascript) {
    const script = doc.createElement("script");
    script.textContent = javascript;
    doc.body.appendChild(script);
  }

  doc.close();
  document.getElementById("website-display").classList.remove("hidden");
}
