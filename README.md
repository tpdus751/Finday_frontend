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

### 회원가입 및 이중 로그인 (JWT + 얼굴인증)
https://github.com/user-attachments/assets/34d98c80-f593-4d67-8e88-2f6f3fe725ee

### 계좌 연결, 통합조회, 이체
<img width="1346" height="452" alt="image" src="https://github.com/user-attachments/assets/c2537045-c385-4bcc-827d-7ed9e6733237" />
1. 계좌 연동하기 버튼을 누릅니다.

<img width="1919" height="1030" alt="image" src="https://github.com/user-attachments/assets/11dfcadc-f190-48a9-b46d-1cb772ac9e17" />
2. 연동할 금융사를 선택하고 다음을 누릅니다.

<img width="1919" height="1024" alt="image" src="https://github.com/user-attachments/assets/cdcc6a6e-3a4e-419e-9820-cd305b50fc26" />
3. 정보 연동 동의를 누릅니다.

<img width="1919" height="1026" alt="image" src="https://github.com/user-attachments/assets/288dafee-2c95-4477-9b0b-5ad1262d4560" />
4. 연동된 계좌 확인

<img width="1042" height="385" alt="image" src="https://github.com/user-attachments/assets/318947a4-d601-4d55-8a97-ca38e517991a" />
5. 홈화면에서도 확인

### 카드 연결 및 조회

### 소비 항목 기반 거래 생성

### 월별 소비 내역 조회 및 시각화

### 총 자산/계좌별 잔액 통합 확인

## 기술 스택
React 18 + React Router

Zustand: 사용자 인증 정보 전역관리

Styled-components: 컴포넌트 스타일링

Axios: REST API 통신

@vladmandic/face-api: 웹캠 얼굴 탐지

Webcam.js: 실시간 영상 스트리밍 캡처

## 🧑‍💻 개발자
박세연
2년제 소프트웨어 전공 / 핀테크 & AI 백엔드 개발 지향
✉️ 751psy@gmail.com
