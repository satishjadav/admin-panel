// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here if you import the scripts.
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// TODO: Replace with your actual Firebase Web Config
const firebaseConfig = {
  apiKey: "AIzaSyBNsNd1OSPgjTm9NxX38MZq_pdE5cpUy3A",
  authDomain: "manalsoftech-6807e.firebaseapp.com",
  projectId: "manalsoftech-6807e",
  storageBucket: "manalsoftech-6807e.appspot.com",
  messagingSenderId: "1023155540439",
  appId: "1:1023155540439:web:8f7f2f268931822bbffb92"
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