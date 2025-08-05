# Finday Frontend
Finday는 안면인증 기반 핀테크 시뮬레이션 플랫폼으로, 사용자가 계좌 연결, 카드 신청, 자산 통합 조회, 이체, 거래 생성 등 다양한 금융 기능을 직관적인 인터페이스로 이용할 수 있도록 설계된 프론트엔드 애플리케이션입니다.

본 리포지토리는 해당 서비스의 React 기반 사용자 인터페이스 구현을 포함하며, 로그인 및 회원가입, 메인 홈, 계좌/카드 연결 및 이체, 거래 생성, 소비 분석 등을 지원합니다.

## 프로젝트 구조
```
src/
│
├── components/           // 재사용 가능한 UI 구성요소들
│   ├── FaceAuthModal.js      # 얼굴 인증 모달 (웹캠 캡처 및 DeepFace 연결)
│   ├── ProtectedRoute.js     # 인증된 사용자만 접근 가능하도록 보호된 라우트
│   └── ... 기타 Header, Footer 등
│
├── pages/               // 주요 페이지 컴포넌트들
│   ├── MainHome.js          # 메인 홈화면
│   ├── LoginPage.js         # 1차 로그인 (이메일/비밀번호)
│   ├── SignUpPage.js        # 회원가입 (얼굴 이미지 등록 포함)
│   ├── TransferPage.js      # 계좌 이체
│   ├── TransactionCreatePage.js # 거래 내역 생성
│   ├── TransactionHistoryPage.js # 거래 내역 조회
│   ├── CardManagePage.js    # 카드 관리
│   └── ... 연결/동의 관련 페이지들
│
├── services/
│   └── api.js            # Axios 인스턴스 설정 및 기본 API 요청 함수
│
├── store/
│   └── userStore.js      # Zustand 기반 사용자 글로벌 상태 관리
│
└── App.js                # 전체 라우팅 설정 (React Router)
```

## 인증 흐름 요약
Finday의 로그인 과정은 이중 인증 구조로 되어 있습니다:

1차 인증: 이메일 + 비밀번호 입력 → 서버에서 얼굴 이미지 URL 반환

2차 인증: 웹캠으로 실시간 얼굴 캡처 → 등록된 이미지와 비교 (DeepFace Flask 서버)

인증 성공 시 JWT 저장 및 사용자 정보 조회 후 라우팅

### LoginPage.js (핵심 흐름)
- handleLogin → 이메일/PW 인증 요청
- 얼굴 이미지 URL 수신 → FaceAuthModal 표시
- FaceAuthModal 내부 웹캠 → 얼굴 탐지/3초 대기/캡처
- DeepFace Flask 서버로 전송 → 매칭 성공 시 JWT 발급

## 지원 기능

### 목차

회원가입 및 이중 로그인 (JWT + 얼굴인증)

계좌 연결, 통합조회

카드 연결 및 조회

소비 항목 기반 거래 생성

기간별 소비 내역 조회 및 시각화

총 자산 / 소비 분석 및 계좌별 잔액 통합 확인 및 이체

### 회원가입 및 이중 로그인 (JWT + 얼굴인증)
https://github.com/user-attachments/assets/34d98c80-f593-4d67-8e88-2f6f3fe725ee

---

### 계좌 연결, 통합조회
<img width="1000" height="1000" alt="image" src="https://github.com/user-attachments/assets/c2537045-c385-4bcc-827d-7ed9e6733237" />
1. 홈화면에서 "계좌 연동하기" 버튼을 클릭합니다.

<img width="1000" height="1000" alt="image" src="https://github.com/user-attachments/assets/11dfcadc-f190-48a9-b46d-1cb772ac9e17" />
2. 연동할 금융사를 선택하고 다음을 클릭합니다.

<img width="1000" height="1000" alt="image" src="https://github.com/user-attachments/assets/cdcc6a6e-3a4e-419e-9820-cd305b50fc26" />
3. 정보 연동 동의를 클릭합니다.

<img width="1000" height="1000" alt="image" src="https://github.com/user-attachments/assets/288dafee-2c95-4477-9b0b-5ad1262d4560" />
4. 연동된 계좌 확인

<img width="1000" height="1000" alt="image" src="https://github.com/user-attachments/assets/318947a4-d601-4d55-8a97-ca38e517991a" />
5. 홈화면에서도 확인

---


### 카드 연결 및 조회
<img width="1000" height="1000" alt="image" src="https://github.com/user-attachments/assets/d365849d-e280-43f6-a414-1b66af9d749c" />
1. 홈화면에서 "내 카드"를 클릭합니다.

<img width="1000" height="1000" alt="image" src="https://github.com/user-attachments/assets/06eb81a7-ec1a-4feb-8dea-a6d436bde25f" />
2. 카드 연동 버튼을 클릭합니다.

<img width="1000" height="1000" alt="image" src="https://github.com/user-attachments/assets/fe62ba26-a40c-4203-8507-9c41faa3d959" />
3. 연동할 금융사를 선택합니다.

<img width="1000" height="1000" alt="image" src="https://github.com/user-attachments/assets/74248f35-a68b-4abe-b0fc-6216dadd6709" />
4. 카드 정보 연동 동의를 클릭합니다.

<img width="1000" height="1000" alt="image" src="https://github.com/user-attachments/assets/34f4da97-a04b-4deb-a7df-c1d1ba1adc59" />
5. 연동된 카드를 확인 가능합니다.

---

### 소비 항목 기반 거래 생성
<img width="1000" height="1000" alt="image" src="https://github.com/user-attachments/assets/6dcb7ded-6dfa-4cfe-8b75-172e4a616a33" />
1. 홈화면에서 "거래 생성" 버튼을 클릭합니다.

<img width="1000" height="1000" alt="image" src="https://github.com/user-attachments/assets/0f2e49ee-840e-4be4-a848-df9834024add" />
2. 거래 생성(결제)할 아이템을 클릭합니다.

<img width="1000" height="1000" alt="image" src="https://github.com/user-attachments/assets/f997ac6c-9b02-4ba6-a4ff-7d43ea32661e" />
<img width="1000" height="1000" alt="image" src="https://github.com/user-attachments/assets/7832f4e0-b5b7-42e5-be5b-1bfee4b97cfc" />
3. 결제 화면에서 결제 수단을 선택합니다.

<img width="1000" height="1000" alt="image" src="https://github.com/user-attachments/assets/bacddb3b-6296-4c9f-b9fd-41dd77032bbf" />
<img width="1000" height="1000" alt="image" src="https://github.com/user-attachments/assets/1ea88066-2675-4c0d-9579-e4fe305c72a2" />
4. 안면인증을 진행 후 인증에 성공할 시, 결제가 완료됩니다.

---


### 기간별 소비 내역 조회 및 시각화
<img width="1000" height="1000" alt="image" src="https://github.com/user-attachments/assets/84bf6e30-6501-4f0a-9972-5a018f65d317" />
1. 홈화면에서 "거래 내역" 버튼을 클릭합니다.

<img width="1000" height="1000" alt="image" src="https://github.com/user-attachments/assets/ed4f1d3a-4a04-4038-814b-1100dcb291e5" />
2. 초기값(통합, 최근 30일)으로, 거래 내역을 보여줍니다. (계좌, 카드의 구분이 가능합니다.)

<img width="1000" height="1000" alt="image" src="https://github.com/user-attachments/assets/97fddb8d-955f-48ce-a18e-2247e8aaeb8a" />
3. 연동된 은행 선택, 기간(월별) 선택하여 원하는 거래 내역 정보를 볼 수 있습니다.

---

### 총 자산 / 소비 분석 및 계좌별 잔액 통합 확인 및 이체
<img width="1000" height="1000" alt="image" src="https://github.com/user-attachments/assets/442ca738-05ed-4b71-96e8-cf8feac287c0" />
1. 홈화면에서 "총 자산" 및 "기간별(월 기준) 소비 분석을 확인할 수 있습니다.(초기값 현재 월)

<img width="1000" height="1000" alt="image" src="https://github.com/user-attachments/assets/81d422cb-747f-4dfe-96ef-259088e67532" />
2. 홈화면에서 "계좌 조회 및 이체" 버튼을 클릭합니다.

<img width="1000" height="1000" alt="image" src="https://github.com/user-attachments/assets/fcb048f2-e667-4872-b7b4-9f5d7371acbb" />
3. 연결된 계좌를 확인 가능하며 계좌별 현재 잔액을 확인할 수 있습니다.

<img width="1000" height="1000" alt="image" src="https://github.com/user-attachments/assets/aa76db29-042e-4a89-a81f-5a99cd2f547c" />
4. "이체" 버튼 클릭 시, 얼굴인증을 진행합니다.

<img width="1000" height="1000" alt="image" src="https://github.com/user-attachments/assets/780450da-c9d1-4190-8473-c1b8aea40561" />
5. 인증 성공 시, 계좌 이체 화면으로 이동하며, 모든 정보를 입력(은행 선택 시, 해당 은행에 맞는 계좌 번호 형식 자동 지정)하고 "이체하기" 버튼을 클릭합니다.

<img width="1000" height="1000" alt="image" src="https://github.com/user-attachments/assets/ab7bc2f8-e570-4a6b-a2b5-74f9689196c2" />
6. 이체 성공 시, 계좌 조회 페이지로 이동하며, 잔액 차감이 완료된 현재 잔액을 확인할 수 있습니다.

---

## 기술 스택
React 18 + React Router

Zustand: 사용자 인증 정보 전역관리

Styled-components: 컴포넌트 스타일링

Axios: REST API 통신

@vladmandic/face-api: 웹캠 얼굴 탐지

Webcam.js: 실시간 영상 스트리밍 캡처

## 🧑‍💻 개발자
```
박세연
2년제 인공지능소프트웨어 전공 / 핀테크 & AI 백엔드 개발 지향
✉️ 751psy@gmail.com
```
