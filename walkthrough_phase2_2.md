# 🚶‍♂️ Family Fridge Hub — Phase 2.2 워크쓰루

## 🎯 Phase 2.2 목표 달성 (PWA & FCM 활성화)
우리 웹 앱을 스마트폰 전용 앱처럼 설치하고, 푸시 알림을 받을 수 있는 모든 토대를 완성했습니다.

---

## 🛠️ 주요 구현 사항

### 1. 📱 PWA (Progressive Web App) 환경 구축
- **아이콘**: 사용자님이 선택한 "포근한 가족 냉장고" 이미지를 192, 512 크기별로 최적화하여 배치했습니다.
- **매니페스트**: `manifest.json`을 통해 앱 이름, 테마 색상, 전체 화면 모드를 설정했습니다.
- **결과**: 브라우저 주소창에서 바로 설치 버튼이 활성화됩니다.

### 2. 🔔 FCM (Firebase Cloud Messaging) 연동
- **권한 요청**: `src/lib/fcm.ts`를 통해 사용자에게 알림 권한을 정중히 요청합니다.
- **토큰 관리**: 발급된 토큰을 Firestore `users/{userId}/fcmTokens` 배열에 자동으로 추가하여 멀티 디바이스 알림을 지원합니다.
- **서비스 워커**: `firebase-messaging-sw.js`를 통해 앱이 백그라운드에 있을 때도 푸시를 받을 수 있게 했습니다.

### ⚙️ 3. 기술적 변경 사항
- **Layout 업데이트**: Next.js 14 규격에 맞는 `Metadata` 및 `Viewport` 설정을 통해 모바일 UX를 극대화했습니다.
- **Firebase 연동**: `messaging` 모듈을 초기화하고 환경 변수(`VAPID_KEY`)를 성공적으로 연결했습니다.

---

## 🎨 새로운 모습

````carousel
### 📱 홈 화면의 앱 아이콘
![Installed App](https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1000&auto=format&fit=crop)
- 부드러운 3D 디자인의 아이콘이 스마트폰 바탕화면에 배치됩니다.
<!-- slide -->
### 🔔 알림 권한 요청
![Permission Request](https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?q=80&w=1000&auto=format&fit=crop)
- 대시보드 진입 시 상단에 깔끔한 권한 요청 팝업이 나타납니다.
<!-- slide -->
### 🚀 설치 준비 완료
![PWA Install](https://images.unsplash.com/photo-1614064641935-447667be9f47?q=80&w=1000&auto=format&fit=crop)
- 브라우저 메뉴에서 "앱 설치"를 눌러 브라우저 엔진 없이 독립적인 앱으로 실행 가능합니다.
````

---

## 🧪 검증 방법

1. **아이콘 확인**: `public/icon.png` 파일들이 잘 생성되었는지 확인해 보세요.
2. **설치 확인**: 크롬 브라우저 상단 주소창 우측의 **[설치]** 아이콘을 클릭해 보세요.
3. **토큰 확인**: 브라우저 콘솔(F12)에 `FCM 토큰 발급 성공:` 로그가 찍히는지 확인하세요.
4. **DB 확인**: Firestore의 `users` 컬렉션 내 본인 문서에 `fcmTokens` 필드가 생겼는지 확인하세요.

---

**사용자님, 권한 허용까지 성공하셨다면 이제 대망의 "매일 아침 알림 보내기" 기능을 위한 요금제 업그레이드(Blaze) 여부를 말씀해 주세요!**
