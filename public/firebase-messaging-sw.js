importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase 설정 (브라우저 노출 가능 정보)
const firebaseConfig = {
  apiKey: "AIzaSyBQAKWymvf-e0w8KxOfJTzsydbJofoA8WA",
  authDomain: "smart-family-hub-ba86c.firebaseapp.com",
  projectId: "smart-family-hub-ba86c",
  storageBucket: "smart-family-hub-ba86c.firebasestorage.app",
  messagingSenderId: "487196628776",
  appId: "1:487196628776:web:fbfec0519da326c488621d"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 백그라운드 푸시 알림 수신 시 처리
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] 백그라운드 메시지 수신: ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
