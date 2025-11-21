# 보안 정책 (Security Policy)

## 🔒 적용된 보안 조치

### 1. API 키 보호
- ✅ OpenAI API 키는 **서버사이드에서만** 관리
- ✅ 클라이언트에 절대 노출되지 않음
- ✅ 환경 변수 체크 (`OPENAI_API_KEY`)

### 2. CORS 보호
- ✅ 특정 도메인만 허용 (wildcard `*` 금지)
- ✅ 허용된 도메인:
  - `https://voice-excel-quiz.lovable.app`
  - `https://youngscatch.vercel.app`
  - `localhost` (개발 모드만)

### 3. Rate Limiting
- ✅ **1시간당 20회** 제한
- ✅ IP + 세션 ID 기반 추적
- ✅ Rate Limit 헤더 제공:
  - `X-RateLimit-Limit`: 최대 요청 수
  - `X-RateLimit-Remaining`: 남은 요청 수
  - `X-RateLimit-Reset`: 초기화 시간

### 4. 입력 검증 및 Sanitize
- ✅ 모든 입력 필드 검증 (question, answer, durationSec)
- ✅ 길이 제한:
  - `question`: 10-500자
  - `answer`: 5-2000자
  - `durationSec`: 0-300초
- ✅ Prompt Injection 방어:
  - 개행 문자 제거
  - HTML 태그 제거
  - 따옴표 제거

### 5. 보안 헤더
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-Frame-Options: DENY`
- ✅ `X-XSS-Protection: 1; mode=block`
- ✅ `Referrer-Policy: strict-origin-when-cross-origin`
- ✅ `Permissions-Policy: microphone=(self)`

### 6. 에러 정보 보호
- ✅ 프로덕션 환경에서 상세 에러 숨김
- ✅ 개발 환경에서만 디버그 정보 제공

### 7. 타입 안전성
- ✅ Web Speech API 타입 정의 추가
- ✅ `any` 타입 제거

---

## 🚨 취약점 신고

보안 취약점을 발견하셨다면:

1. **공개 이슈로 보고하지 마세요**
2. 이메일로 비공개 신고: [보안 담당자 이메일]
3. 다음 정보를 포함해주세요:
   - 취약점 설명
   - 재현 방법
   - 영향 범위

---

## 📋 보안 체크리스트 (배포 전 확인)

### 환경 변수
- [ ] `OPENAI_API_KEY`가 Vercel 환경 변수로 설정됨
- [ ] `.env.local`이 Git에 커밋되지 않음 (`.gitignore` 확인)
- [ ] `VITE_` 접두사가 API 키에 사용되지 않음

### CORS 설정
- [ ] `allowedOrigins`에 프로덕션 도메인 추가
- [ ] `Access-Control-Allow-Origin: *` 사용 안 함

### Rate Limiting
- [ ] Rate Limit 테스트 완료
- [ ] Redis 또는 메모리 기반 캐시 작동 확인

### 입력 검증
- [ ] 모든 API 엔드포인트에 입력 검증 적용
- [ ] Sanitize 함수 작동 확인

---

## 🔄 정기 보안 점검

### 매주
- [ ] `npm audit` 실행 및 취약점 수정
- [ ] Rate Limit 로그 확인

### 매월
- [ ] 의존성 업데이트 (`npm update`)
- [ ] OpenAI API 사용량 확인
- [ ] Vercel 로그 검토

### 매 분기
- [ ] 보안 정책 검토 및 업데이트
- [ ] 침투 테스트 (Penetration Testing)

---

## 📚 참고 자료

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Vercel Security Best Practices](https://vercel.com/docs/security)
- [OpenAI API Best Practices](https://platform.openai.com/docs/guides/safety-best-practices)

---

**최종 업데이트**: 2024-11-21  
**다음 검토 예정**: 2025-02-21

