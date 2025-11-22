# 🎤 영스캐치 (YoungsCatch)

**영어 스피킹을 캐치하다!** 🤖✨

영스캐치는 오픽(OPIc) **입문자 특화** AI 실시간 스피킹 피드백 서비스입니다.
사용자는 로그인 없이 바로 랜덤 질문을 받고, 음성으로 대답하면 AI가 **구조·논리·필러 사용**을 중심으로 입문자에게 친화적인 피드백을 제공합니다.

---

## ✅ 실제 사용 가능한 사이트

아래 링크에서 바로 사용해볼 수 있습니다:

👉 **https://youngscatch.vercel.app**

---

## 🎯 주요 기능

### 🎯 입문자 특화 (NEW!)

- **문장 뼈대 (Sentence Skeleton)**: Start → Reason → Example → Wrap-up 구조 제공
- **필러 추천**: 질문마다 2개의 필러(Actually, For example 등) 추천
- **필러 사용 분석**: 몇 번 사용했는지 체크하고 피드백
- **구조 완성도 점수**: 문법이 아닌 문장 구조의 완성도 평가
- **논리 흐름 점수**: 문장 간 연결성 평가

### 🔄 랜덤 문제 출력

- `exam.json`에서 무작위 문항 선택
- OPIc 레벨별 필터링 (IL, IM, IH, AL)
- 예: _"Describe a memorable trip you took recently."_

### 🎙️ 음성 인식 (Speech-to-Text)

- **Web Speech API**로 실시간 음성 텍스트 변환
- Chrome/Edge 브라우저 지원
- 질문 음성 읽기 (TTS) 기능

### 🤖 AI 피드백 (GPT-4o-mini)

- **구조 완성도** (0-100점) - 입문자 맞춤
- **논리 흐름** (0-100점) - 입문자 맞춤
- **필러 사용 분석** (사용한 필러 목록, 횟수, 피드백)
- **MP 구조 분석** (What / Feeling / Why)
- **개선된 예시 문장** 제시
- **한글 피드백** 제공 (격려 중심)

### 📊 결과 시각화

- 점수 바 그래프
- MP 구조 체크리스트 (✅/❌)
- 필러 사용 현황 (버블 표시)
- 답변 비교 (내 답변 vs 추천 답변)

---

## ⚙️ 기술 스택

| 항목              | 사용 기술                              |
| ----------------- | -------------------------------------- |
| **프론트엔드**    | React 18, TypeScript, Vite             |
| **스타일링**      | Tailwind CSS + shadcn/ui + Pretendard  |
| **음성 인식**     | Web Speech API (브라우저 기본)         |
| **AI 서비스**     | OpenAI GPT-4o-mini API                 |
| **백엔드**        | Vercel Serverless Functions            |
| **상태 관리**     | TanStack Query                         |
| **배포**          | Vercel                                 |

---

## 📁 프로젝트 구조

```
voice-excel-quiz/
├── api/                           # Vercel Serverless Functions (NEW!)
│   └── evaluate.ts                # OpenAI API 호출 (보안)
├── public/
│   ├── exam.json                  # 오픽 스타일 문제 Pool (Skeleton 포함)
│   └── youngscatch-character.png  # 캐릭터 이미지
├── src/
│   ├── components/
│   │   ├── QuestionDisplay.tsx    # 문제 표시 + Skeleton + 필러
│   │   ├── SpeechRecorder.tsx     # 음성 녹음 + STT
│   │   └── AIFeedback.tsx         # AI 피드백 결과 (필러 분석 포함)
│   ├── services/
│   │   └── openai.ts              # API 호출 (서버로 변경)
│   ├── types/
│   │   └── exam.ts                # 타입 정의 (Skeleton, Filler 포함)
│   └── pages/
│       ├── Landing.tsx            # 랜딩 페이지
│       └── Index.tsx              # 메인 페이지
├── .env.local                     # 환경변수 (Git 제외)
├── vercel.json                    # Vercel 설정 (NEW!)
└── README.md
```

## 🚀 실행 방법

### 1. 환경 준비

```bash
# OpenAI API 키 발급 (https://platform.openai.com/api-keys)
# .env.local 파일 생성 (VITE_ 접두사 없음!)
echo "OPENAI_API_KEY=sk-your-api-key-here" > .env.local
```

⚠️ **중요**: `VITE_` 접두사를 사용하지 마세요! 보안을 위해 서버사이드에서만 사용합니다.

### 2. 패키지 설치

```bash
git clone <repository-url>
cd voice-excel-quiz
npm install
```

### 3. 로컬 개발 (Vercel CLI 사용)

```bash
# Vercel CLI 설치 (처음 한 번만)
npm i -g vercel

# 로컬에서 Serverless Functions와 함께 실행
vercel dev
```

**또는** Vite만 실행 (API는 작동하지 않음):

```bash
npm run dev
```

### 4. 브라우저 접속

- Vercel Dev: http://localhost:3000
- Vite Dev: http://localhost:8080
- **Chrome 또는 Edge 권장** (Web Speech API 완벽 지원)

---

## 🔒 보안 개선 사항 (NEW!)

### 이전 문제점

```
❌ OpenAI API 키가 클라이언트에 노출 (VITE_OPENAI_API_KEY)
❌ 누구나 브라우저 개발자 도구에서 키 확인 가능
❌ 악의적 사용자가 키를 훔쳐 무제한 API 호출 가능
```

### 해결 방법

```
✅ Vercel Serverless Functions 사용
✅ API 키는 서버에서만 관리 (process.env.OPENAI_API_KEY)
✅ 클라이언트는 /api/evaluate 엔드포인트만 호출
✅ API 키가 브라우저에 절대 노출되지 않음
```

### 아키텍처

```
Before (취약):
사용자 브라우저 → OpenAI API (직접 호출)
               ↑
            API 키 노출!

After (보안):
사용자 브라우저 → Vercel Serverless Function → OpenAI API
                         ↑
                    API 키는 서버에만 존재!
```

---

## 📋 사용 방법

1. **랜딩 페이지**: "Start" 버튼 클릭
2. **문제 확인**: 
   - 🎯 오늘의 필러 확인 (예: "Actually", "For example")
   - 📝 문장 뼈대 확인 (Start → Reason → Example → Wrap-up)
3. **녹음 시작**: 마이크 버튼 클릭 → 빨간색 애니메이션 시작
4. **답변하기**: 영어로 자연스럽게 말하기 (30초~2분)
   - 필러를 3번 이상 사용해보세요!
   - 문장 뼈대를 따라가보세요!
5. **녹음 종료**: 버튼 다시 클릭 → AI 평가 시작
6. **결과 확인**: 
   - 구조 완성도, 논리 흐름 점수
   - 필러 사용 현황 (몇 번 사용했는지)
   - MP 구조 분석
7. **다음 문제**: "다음 문제" 버튼으로 계속 연습

---

## 📌 주의사항

### 🔑 필수 설정

- **OpenAI API 키** 반드시 설정 (무료 크레딧 소진 시 유료)
- `.env.local` 파일은 Git에 커밋되지 않도록 주의
- **Vercel 환경 변수 설정** 필요 (배포 시):
  - Vercel Dashboard → Settings → Environment Variables
  - Key: `OPENAI_API_KEY`
  - Value: `sk-proj-...`

### 🌐 브라우저 지원

- ✅ **Chrome/Edge**: 완벽 지원
- ⚠️ **Firefox**: 제한적 지원
- ❌ **Safari (iOS)**: 음성 인식 제한

### 🔒 보안 (NEW! - 2024.11.21 보안 강화)

#### ✅ 적용된 보안 조치

1. **API 키 보호**
   - ❌ **절대** API 키를 `VITE_` 접두사로 설정하지 마세요
   - ✅ 서버사이드에서만 관리 (`process.env.OPENAI_API_KEY`)
   - ✅ 클라이언트에 절대 노출되지 않음

2. **Rate Limiting** 🆕
   - ✅ **1시간당 20회** 제한 (IP + 세션 ID 기반)
   - ✅ API 남용 및 비용 폭탄 방지
   - ✅ Rate Limit 헤더 제공

3. **CORS 보호** 🆕
   - ✅ 특정 도메인만 허용 (wildcard `*` 금지)
   - ✅ 허용: `voice-excel-quiz.lovable.app`, `youngscatch.vercel.app`

4. **입력 검증 및 Sanitize** 🆕
   - ✅ 모든 입력 필드 검증 (길이, 타입)
   - ✅ Prompt Injection 방어 (개행, HTML 태그, 따옴표 제거)

5. **보안 헤더** 🆕
   - ✅ `X-Content-Type-Options: nosniff`
   - ✅ `X-Frame-Options: DENY`
   - ✅ `X-XSS-Protection: 1; mode=block`
   - ✅ `Permissions-Policy: microphone=(self)`

6. **타입 안전성** 🆕
   - ✅ Web Speech API 타입 정의
   - ✅ `any` 타입 제거

자세한 내용은 [SECURITY.md](SECURITY.md)를 참조하세요.

## 🎯 타겟 사용자

- **오픽(OPIc) 입문자** (IM1~IM3 목표)
- **영어 문장 조합이 어려운 학습자**
- **말문이 막히는 학습자**
- **필러 사용법을 배우고 싶은 학습자**

---

## 🧩 향후 개선 예정

### 기능
- [ ] **5분 타이머 시각화** (현재는 측정만)
- [ ] **필러 하이라이트** (답변에서 필러 강조 표시)
- [ ] **진행도 트래킹** (오늘 몇 개 연습, 필러 사용률 추이)
- [ ] **사용자 계정 시스템** (학습 기록 저장)
- [ ] **발음 정확도 분석** (추가 AI 모델)
- [ ] **커스텀 문제 업로드** (엑셀/PDF 지원)
- [ ] **학습 통계 대시보드** (진행도 추적)

### 보안 (추가 개선)
- [ ] **Redis 기반 Rate Limiting** (현재는 메모리 기반)
- [ ] **CAPTCHA 추가** (봇 방지)
- [ ] **의존성 취약점 해결** (`xlsx` 패키지 제거 또는 대체)

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

**입문자도 5분 만에 영어 문장이 만들어지고 말문이 열립니다!** 💬✨
