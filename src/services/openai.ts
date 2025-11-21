import type { AIFeedback, EvaluationRequest } from "@/types/exam";

// ===== 보안: 세션 ID 생성 (사용자 추적용) =====
function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "server";

  let sessionId = sessionStorage.getItem("youngscatch_session");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("youngscatch_session", sessionId);
  }
  return sessionId;
}

/**
 * Serverless Function을 통해 영어 스피킹 답변을 평가합니다.
 * (보안을 위해 OpenAI API는 서버에서만 호출)
 */
export async function evaluateSpeaking(
  request: EvaluationRequest
): Promise<AIFeedback> {
  try {
    // Vercel Serverless Function 호출
    const apiUrl = "/api/evaluate";
    const sessionId = getOrCreateSessionId();

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Session-ID": sessionId, // Rate Limiting용 세션 ID
      },
      body: JSON.stringify(request),
    });

    // Rate Limit 헤더 확인
    const rateLimitRemaining = response.headers.get("X-RateLimit-Remaining");
    const rateLimitReset = response.headers.get("X-RateLimit-Reset");

    if (rateLimitRemaining && parseInt(rateLimitRemaining) < 5) {
      console.warn(`⚠️ API 호출 제한 임박: ${rateLimitRemaining}회 남음`);
    }

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));

      if (response.status === 429) {
        const retryAfter = errorData.retryAfter || 3600;
        throw new Error(
          `너무 많은 요청입니다. ${Math.ceil(
            retryAfter / 60
          )}분 후 다시 시도해주세요.`
        );
      }

      throw new Error(errorData.error || `API 요청 실패 (${response.status})`);
    }

    const feedback: AIFeedback = await response.json();
    return feedback;
  } catch (error) {
    console.error("API Error:", error);

    // 사용자 친화적인 에러 메시지
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(
      "AI 평가 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
    );
  }
}
