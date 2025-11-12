# 🎤 영스캐치 (YoungsCatch)

**영어 스피킹을 캐치하다!** 🤖✨

영스캐치는 오픽(OPIc) 시험을 준비하는 수험생을 위한 **AI 기반 실시간 스피킹 피드백 서비스**입니다.
사용자는 로그인 없이 바로 랜덤 질문을 받고, 음성으로 대답하면 AI가 즉시 분석하여 점수(문법·자연스러움)와 구조(MP)를 제공합니다.

---

## ✅ 실제 사용 가능한 사이트

아래 링크에서 바로 사용해볼 수 있습니다:

👉 **https://voice-excel-quiz.lovable.app/**

---

## 🎯 주요 기능

### 🔄 랜덤 문제 출력

- `exam.json`에서 무작위 문항 선택
- 예: _"Describe a memorable trip you took recently."_

### 🎙️ 음성 인식 (Speech-to-Text)

- **Web Speech API**로 실시간 음성 텍스트 변환
- Chrome/Edge 브라우저 지원

### 🤖 AI 피드백 (GPT-4o-mini)

- **문법 정확도** (0-100점)
- **자연스러움** (0-100점)
- **MP 구조 분석** (What / Feeling / Why)
- **개선된 예시 문장** 제시
- **한글 피드백** 제공

### 📊 결과 시각화

- 점수 바 그래프
- MP 구조 체크리스트 (✅/❌)
- 답변 비교 (내 답변 vs 추천 답변)

---

## ⚙️ 기술 스택

| 항목           | 사용 기술                      |
| -------------- | ------------------------------ |
| **프론트엔드** | React 18, TypeScript, Vite     |
| **스타일링**   | Tailwind CSS + shadcn/ui       |
| **음성 인식**  | Web Speech API (브라우저 기본) |
| **AI 서비스**  | OpenAI GPT-4o-mini API         |
| **상태 관리**  | TanStack Query                 |
| **배포**       | Lovable Publish (Vercel 기반)  |

---

## 📁 프로젝트 구조

```
youngs-catch/
├── public/
│   └── exam.json          # 오픽 스타일 문제 Pool
├── src/
│   ├── components/
│   │   ├── QuestionDisplay.tsx    # 문제 표시
│   │   ├── SpeechRecorder.tsx     # 음성 녹음 + STT
│   │   └── AIFeedback.tsx         # AI 피드백 결과
│   ├── services/
│   │   └── openai.ts              # GPT API 통합
│   ├── types/
│   │   └── exam.ts                # 타입 정의
│   └── pages/
│       └── Index.tsx              # 메인 페이지
├── .env.local                     # 환경변수 (Git 제외)
└── README.md
```

## 🚀 실행 방법

### 1. 환경 준비

```bash
# OpenAI API 키 발급 (https://platform.openai.com/api-keys)
# .env.local 파일 생성
echo "VITE_OPENAI_API_KEY=sk-your-api-key-here" > .env.local
```

### 2. 프로젝트 실행

```bash
git clone <repository-url>
cd youngs-catch
npm install
npm run dev
```

### 3. 브라우저 접속

- http://localhost:8080
- **Chrome 또는 Edge 권장** (Web Speech API 완벽 지원)

---

## 📋 사용 방법

1. **랜덤 문제 표시**: 페이지 로드 시 자동으로 문제 표시
2. **녹음 시작**: 마이크 버튼 클릭 → 빨간색 애니메이션 시작
3. **답변하기**: 영어로 자연스럽게 말하기 (30초~1분)
4. **녹음 종료**: 버튼 다시 클릭 → AI 평가 시작
5. **결과 확인**: 문법 점수, 자연스러움 점수, MP 구조 분석
6. **다음 문제**: "다음 문제" 버튼으로 계속 연습

---

## 📌 주의사항

### 🔑 필수 설정

- **OpenAI API 키** 반드시 설정 (무료 크레딧 소진 시 유료)
- `.env.local` 파일은 Git에 커밋되지 않도록 주의

### 🌐 브라우저 지원

- ✅ **Chrome/Edge**: 완벽 지원
- ⚠️ **Firefox**: 제한적 지원
- ❌ **Safari (iOS)**: 음성 인식 제한

## 🎯 타겟 사용자

- **오픽(OPIc) 시험 준비생**
- **단기간 말하기 실력 향상** 원하는 직장인
- **영어 회화 피드백**이 필요한 학습자

---

## 🧩 향후 개선 예정

- [ ] **사용자 계정 시스템** (학습 기록 저장)
- [ ] **발음 정확도 분석** (추가 AI 모델)
- [ ] **커스텀 문제 업로드** (엑셀/PDF 지원)
- [ ] **학습 통계 대시보드** (진행도 추적)
- [ ] **모바일 앱** (React Native)
- [ ] **다국어 지원** (영어 외 언어)

---

## 🤝 기여하기

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 라이선스

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**영어 스피킹 실력을 키우고 싶다면? 지금 바로 영스캐치와 함께 시작하세요!** 🚀🎤
