import { messaging, db } from "./firebase";
import { getToken } from "firebase/messaging";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

export const requestForToken = async (userId: string) => {
  if (!userId || typeof window === "undefined") return null;

  try {
    // 1. 서비스 워커 직접 등록 (Next.js 환경에서 더 안정적)
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    console.log("서비스 워커 등록 성공:", registration);

    // 2. 브라우저 알림 권한 요청
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("알림 권한이 거부되었습니다.");
      return null;
    }

    // 3. FCM 인스턴스 가져오기
    const msg = await messaging();
    if (!msg) return null;

    // 4. 토큰 발급 (서비스 워커 객체를 직접 전달)
    const currentToken = await getToken(msg, {
      serviceWorkerRegistration: registration,
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    if (currentToken) {
      console.log("FCM 토큰 발급 성공:", currentToken);
      
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        fcmTokens: arrayUnion(currentToken)
      });
      
      return currentToken;
    } else {
      console.log("토큰을 가져올 수 없습니다. 권한을 확인해주세요.");
      return null;
    }
  } catch (err) {
    console.error("FCM 토큰 생성 중 오류:", err);
    return null;
  }
};
