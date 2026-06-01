const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let serviceAccount = null;
const keyPath = path.join(__dirname, '../../serviceAccountKey.json');

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (e) {
    console.error('FIREBASE_SERVICE_ACCOUNT parse error:', e.message);
  }
} else if (fs.existsSync(keyPath)) {
  try {
    serviceAccount = require(keyPath);
  } catch (e) {
    console.error('Error reading serviceAccountKey.json:', e.message);
  }
}

try {
  if (admin.apps && admin.apps.length) {
    console.log('Firebase Admin already initialized');
  } else if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin Initialized Successfully (serviceAccount)');
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
    console.log('Firebase Admin initialized using application default credentials');
  } else {
    console.warn('Firebase Admin NOT initialized. Provide serviceAccountKey.json or set FIREBASE_SERVICE_ACCOUNT / GOOGLE_APPLICATION_CREDENTIALS.');
  }
} catch (error) {
  if (error && error.message && error.message.includes('already exists')) {
    console.warn('Firebase App already exists, skipping initialization');
  } else {
    console.error('Firebase Admin Initialization Error', error.stack || error);
  }
}

module.exports = admin;
