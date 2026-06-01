// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here if you import the scripts.
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// TODO: Replace with your actual Firebase Web Config
const firebaseConfig = {
  apiKey: "AIzaSyACnKFQZU-Um7ClUkzaghS2evOBq-wFpRk",
  authDomain: "satish-jadav.firebaseapp.com",
  projectId: "satish-jadav",
  storageBucket: "satish-jadav.firebasestorage.app",
  messagingSenderId: "792889150456",
  appId: "1:792889150456:web:46761d975a2085c07a240d",
  measurementId: "G-PMEKTXH6DH"
};

try {
  if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      console.log('[firebase-messaging-sw.js] Received background message ', payload);
      const notificationTitle = payload.notification.title || 'New Notification';
      const notificationOptions = {
        body: payload.notification.body || 'You have a new message.',
        icon: '/favicon.ico'
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  } else {
    console.warn("[firebase-messaging-sw.js] Firebase is not configured. Please add your credentials.");
  }
} catch (error) {
  console.error("Service worker initialization error", error);
}