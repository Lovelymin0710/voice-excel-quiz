# 🧠 영스체크 (YoungsCheck)

영스체크는 사용자가 영어 문장을 **말하기(Speaking)**로 외웠는지 확인할 수 있는 웹 애플리케이션입니다.  
한글 문장을 보고 영어로 말하면, 웹이 음성을 텍스트로 변환하고 정답 문장과 비교하여 **의미가 비슷한지 판단**합니다.

---

## ✅ 실제 사용 가능한 사이트

아래 링크에서 바로 사용해볼 수 있습니다:

👉 **https://voice-excel-quiz.lovable.app/?utm_source=lovable-editor**

---

## ✅ 주요 기능

✔ **엑셀 업로드 (.xlsx)**  
| 순번 | 한글 | 영어 | 암기날짜 | 형식의 문장을 불러옵니다.

✔ **한글 문장 표시 & 영어 말하기**  
- 한국어 문장을 보고 영어로 말하기  
- Web Speech API로 음성을 텍스트로 변환  

✔ **정답 비교 & 채점 결과 제공**  
- You said: 사용자가 말한 문장  
- Correct is: 정답 영어 문장  
- Similarity %: 문장 유사도  
- 기준 이상일 경우 ✅ O, 아니면 ❌ X

---

## ⚙ 기술 스택

| 항목 | 사용 기술 |
|------|-----------|
| 프레임워크 | React, TypeScript, Vite |
| 스타일 | Tailwind CSS + shadcn/ui |
| 음성 인식 | Web Speech API (브라우저 기본 기능, 무료) |
| 엑셀 파싱 | SheetJS (xlsx.js) |
| 배포 | Lovable Publish (Vercel 기반) |

---

## 📁 폴더 구조

```plaintext
voice-excel-quiz/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
└── README.md

🚀 실행 방법
git clone https://github.com/Lovelymin0710/voice-excel-quiz.git
cd voice-excel-quiz
npm install
npm run dev

📌 주의사항

크롬 및 엣지 브라우저 권장 (Web Speech API 지원)
iPhone Safari에서는 음성 인식 제한 가능
OpenAI, Whisper API 사용하지 않음 → 완전 무료

🧩 향후 개선 예정

 GPT 기반 의미 비교 정확도 강화
 오답 문장 자동 반복 학습
 학습 기록 저장 (LocalStorage / DB)
 PWA 적용하여 앱처럼 설치 가능
 발음 정확도 피드백 기능 추가
