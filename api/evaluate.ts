import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

// 타입 정의 (프론트엔드와 공유)
interface EvaluationRequest {
  question: string;
  answer: string;
  durationSec?: number;
}

interface FillerUsage {
  used_fillers: string[];
  count: number;
  feedback: string;
}

interface MPStructure {
  what: boolean;
  feeling: boolean;
  why: boolean;
}

interface AIFeedback {
  structure_score: number;
  logic_flow: number;
  mp: MPStructure;
  filler_usage: FillerUsage;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  improved_answer: string;
  feedback_summary: string;
  level: "IL" | "IM1" | "IM2" | "IH";
  tone: "encouraging" | "neutral" | "strict";
}

// ===== 보안: 허용된 도메인 설정 =====
// OpenAI 클라이언트는 핸들러 내부에서 초기화 (Lazy Loading)
const allowedOrigins = [
  "https://voice-excel-quiz.lovable.app",
  "https://youngscatch.vercel.app",
  process.env.NODE_ENV === "development" ? "http://localhost:3000" : null,
  process.env.NODE_ENV === "development" ? "http://localhost:8080" : null,
  process.env.NODE_ENV === "development" ? "http://localhost:5173" : null,
].filter((origin): origin is string => origin !== null);

// ===== 보안: Rate Limiting (간단한 메모리 기반) =====
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const requestCache = new Map<string, RateLimitRecord>();

function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const record = requestCache.get(identifier);
  const limit = 20; // 1시간에 20회
  const windowMs = 3600000; // 1시간

  // 기록이 없거나 시간이 만료된 경우
  if (!record || now > record.resetTime) {
    const resetTime = now + windowMs;
    requestCache.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: limit - 1, resetTime };
  }

  // 제한 초과
  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  // 카운트 증가
  record.count++;
  return {
    allowed: true,
    remaining: limit - record.count,
    resetTime: record.resetTime,
  };
}

// 주기적으로 오래된 기록 정리 (메모리 누수 방지)
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of requestCache.entries()) {
    if (now > record.resetTime) {
      requestCache.delete(key);
    }
  }
}, 600000); // 10분마다

// ===== 보안: 입력 검증 (sanitize) =====
function sanitizeInput(input: string, maxLength: number = 1000): string {
  return input
    .replace(/[\n\r]/g, " ") // 개행 제거 (Prompt Injection 방지)
    .replace(/[<>]/g, "") // HTML 태그 제거
    .replace(/["'`]/g, "") // 따옴표 제거 (Prompt 조작 방지)
    .trim()
    .slice(0, maxLength); // 최대 길이 제한
}

function validateInput(data: any): { valid: boolean; error?: string } {
  if (!data.question || typeof data.question !== "string") {
    return { valid: false, error: "question 필드가 필요합니다." };
  }
  if (!data.answer || typeof data.answer !== "string") {
    return { valid: false, error: "answer 필드가 필요합니다." };
  }
  if (data.question.length < 10 || data.question.length > 500) {
    return { valid: false, error: "question은 10-500자 사이여야 합니다." };
  }
  if (data.answer.length < 5 || data.answer.length > 2000) {
    return { valid: false, error: "answer는 5-2000자 사이여야 합니다." };
  }
  if (data.durationSec !== undefined) {
    const duration = Number(data.durationSec);
    if (isNaN(duration) || duration < 0 || duration > 300) {
      return { valid: false, error: "durationSec은 0-300 사이여야 합니다." };
    }
  }
  return { valid: true };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ===== 보안: API 키 체크 (핸들러 내부에서) =====
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.");
    return res.status(500).json({
      error: "서버 설정 오류입니다. 관리자에게 문의해주세요.",
    });
  }

  // OpenAI 클라이언트 초기화 (핸들러 내부에서 - Lazy Loading)
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // ===== 보안: CORS 설정 (특정 도메인만 허용) =====
  const origin = req.headers.origin;

  // 개발 환경에서는 모든 origin 허용, 프로덕션에서는 제한
  if (
    process.env.NODE_ENV === "development" ||
    (origin && allowedOrigins.includes(origin))
  ) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Session-ID");

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // POST만 허용
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ===== 보안: Rate Limiting =====
  const identifier =
    (req.headers["x-forwarded-for"] as string) ||
    (req.headers["x-session-id"] as string) ||
    "unknown";
  const rateLimit = checkRateLimit(identifier);

  // Rate Limit 헤더 추가
  res.setHeader("X-RateLimit-Limit", "20");
  res.setHeader("X-RateLimit-Remaining", rateLimit.remaining.toString());
  res.setHeader(
    "X-RateLimit-Reset",
    new Date(rateLimit.resetTime).toISOString()
  );

  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: "너무 많은 요청입니다. 1시간에 20회까지 사용 가능합니다.",
      retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
    });
  }

  try {
    // ===== 보안: 입력 검증 =====
    const validation = validateInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const { question, answer, durationSec } = req.body as EvaluationRequest;

    // ===== 보안: 입력 Sanitize (Prompt Injection 방어) =====
    const sanitizedQuestion = sanitizeInput(question, 500);
    const sanitizedAnswer = sanitizeInput(answer, 2000);
    const durationStr = durationSec ? `${durationSec} seconds` : "unknown";

    const prompt = `You are an OPIc evaluator specialized for BEGINNERS (입문자) providing feedback in Korean.

🎯 IMPORTANT: This service is for OPIc BEGINNERS who struggle with:
- Constructing English sentences (not grammar mistakes)
- Starting their first sentence
- Using fillers naturally
- Following logical structure

Focus on STRUCTURE, LOGIC, and FILLER usage, NOT on advanced grammar or vocabulary.

Evaluate the given English answer and respond ONLY in the JSON structure below:

{
  "structure_score": number (0–100),
  "logic_flow": number (0–100),
  "mp": { "what": boolean, "feeling": boolean, "why": boolean },
  "filler_usage": {
    "used_fillers": ["Actually", "For example"],
    "count": number,
    "feedback": "Korean feedback about filler usage"
  },
  "strengths": [ "..." ],
  "weaknesses": [ "..." ],
  "suggestions": [ "..." ],
  "improved_answer": "...",
  "feedback_summary": "...",
  "level": "IL|IM1|IM2|IH",
  "tone": "encouraging|neutral|strict"
}

Input:
- Question: ${sanitizedQuestion}
- Answer: ${sanitizedAnswer}
- Duration: ${durationStr}

Evaluate:
1. Structure Score (0–100): Does the answer follow a logical structure? (Start → Reason → Example → Wrap-up)
   - NOT about grammar correctness, but about having clear beginning, middle, and end
   - 90+ if all 4 parts present, 70-89 if 3 parts, 50-69 if 2 parts, <50 if unclear structure

2. Logic Flow (0–100): Is the flow of ideas coherent and easy to follow?
   - Does each sentence connect to the next?
   - Is there a clear progression of thought?
   - NOT about pronunciation or grammar, but about logical connection

3. MP structure (What, Feeling, Why) - check if present in the answer

4. Filler Usage Analysis:
   - Identify fillers used (Actually, For example, To be honest, Personally, I guess, Honestly, For me, etc.)
   - Count total usage
   - Provide encouraging Korean feedback:
     * If 0 fillers: "필러를 사용하지 않았어요. 'Actually'나 'For example' 같은 필러를 3번 이상 사용하면 말하기가 훨씬 자연스러워질 거예요!"
     * If 1-2 fillers: "필러를 조금 사용했네요! 다음엔 3번 이상 사용해보세요."
     * If 3+ fillers: "훌륭해요! 필러를 자주 사용해서 답변이 자연스러웠어요."

5. Strengths (1-2 sentences in Korean): Focus on what the BEGINNER did well
   - Did they attempt to follow structure?
   - Did they use fillers?
   - Did they try to explain with examples?
   
6. Weaknesses (1-2 sentences in Korean): GENTLE feedback for beginners
   - Missing structure parts?
   - Could use more fillers?
   - Logic jumps too quickly?
   
7. Suggestions (1-2 actionable tips in Korean for BEGINNERS):
   - NOT "use advanced vocabulary" or "fix grammar"
   - INSTEAD: "다음엔 'For example'로 예시를 추가해보세요", "이유를 'The reason is...'로 시작해보세요"

8. Improved Answer: Rewrite in natural English maintaining beginner-friendly structure with fillers included

9. Feedback Summary (2-3 Korean sentences): Warm, encouraging tone for beginners
   - If duration <= 10s: mention it's too short
   - If duration >= 90s: praise their speaking stamina!

10. Level (IL, IM1, IM2, IH) and Tone (always "encouraging" for beginners unless IM2+)

Output Format (JSON only, no markdown):
{
  "structure_score": 75,
  "logic_flow": 80,
  "mp": { "what": true, "feeling": true, "why": false },
  "filler_usage": {
    "used_fillers": ["Actually", "For example"],
    "count": 2,
    "feedback": "필러를 2번 사용했어요! 다음엔 3번 이상 사용해보면 더 자연스러울 거예요."
  },
  "strengths": ["문장 구조를 따라가려고 노력했어요!", "예시를 들어서 설명하려고 했어요."],
  "weaknesses": ["이유 부분이 빠져있어요.", "필러를 조금 더 사용하면 좋겠어요."],
  "suggestions": ["다음엔 'The reason is...'로 이유를 추가해보세요.", "답변 시작을 'To be honest'로 열어보세요."],
  "improved_answer": "To be honest, I recently took a trip to Jeju Island with my family. The reason I enjoyed it was that it was my first vacation in a long time. For example, we explored beautiful beaches and hiked up Hallasan Mountain. So overall, it was an unforgettable experience.",
  "feedback_summary": "문장 구조를 따라가려고 노력한 점이 좋았어요! 다음엔 필러를 3번 이상 사용하고, 이유 부분을 추가하면 IM1 레벨로 올라갈 수 있을 거예요. 입문자로서 아주 잘하고 있어요!",
  "level": "IL",
  "tone": "encouraging"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert English speaking test evaluator. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = completion.choices[0].message.content;
    if (!result) {
      throw new Error("No response from OpenAI");
    }

    const feedback: AIFeedback = JSON.parse(result);
    return res.status(200).json(feedback);
  } catch (error) {
    // ===== 보안: 에러 정보 노출 방지 =====
    if (process.env.NODE_ENV === "production") {
      console.error(
        "API Error:",
        error instanceof Error ? error.message : "Unknown error"
      );
    } else {
      console.error("OpenAI API Error:", error);
    }

    return res.status(500).json({
      error: "AI 평가 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      ...(process.env.NODE_ENV === "development" && {
        debug: error instanceof Error ? error.message : String(error),
      }),
    });
  }
}
