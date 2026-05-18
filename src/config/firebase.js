const admin = require('firebase-admin');

const path = require('path');
const fs = require('fs');

let serviceAccount = null;
const keyPath = path.join(__dirname, '../../serviceAccountKey.json');

if (fs.existsSync(keyPath)) {
  try {
    serviceAccount = require(keyPath);
  } catch (e) {
    console.error("Error reading serviceAccountKey.json:", e.message);
  }
}

try {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin Initialized Successfully");
  } else {
    console.warn("Firebase Admin NOT initialized. Please create serviceAccountKey.json in the back/ folder.");
  }
} catch (error) {
  console.error("Firebase Admin Initialization Error", error.stack);
}

module.exports = admin;
