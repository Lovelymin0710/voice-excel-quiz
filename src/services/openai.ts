import type { AIFeedback, EvaluationRequest } from "@/types/exam";

/**
 * Serverless Function을 통해 영어 스피킹 답변을 평가합니다.
 * (보안을 위해 OpenAI API는 서버에서만 호출)
 */
export async function evaluateSpeaking(
  request: EvaluationRequest
): Promise<AIFeedback> {
  try {
    // Vercel Serverless Function 호출
    const apiUrl = '/api/evaluate';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `API 요청 실패 (${response.status})`);
    }

    const feedback: AIFeedback = await response.json();
    return feedback;
  } catch (error) {
    console.error("API Error:", error);
    throw new Error(
      "AI 평가 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
    );
  }
}
