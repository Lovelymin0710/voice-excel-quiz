import OpenAI from "openai";
import type { AIFeedback, EvaluationRequest } from "@/types/exam";

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // 클라이언트 사이드에서 사용 (프로덕션에서는 백엔드 권장)
});

/**
 * GPT-4o를 사용하여 영어 스피킹 답변을 평가합니다.
 */
export async function evaluateSpeaking(
  request: EvaluationRequest
): Promise<AIFeedback> {
  const prompt = `You are an English speaking test evaluator (similar to OPIc).
Evaluate the student's answer.

Input:
- Question: ${request.question}
- Answer: ${request.answer}

Evaluate:
1. Grammar accuracy (0–100): Check for grammatical errors
2. Naturalness (0–100): How natural and fluent the answer sounds
3. MP structure (What, Feeling, Why):
   - What: Does the answer include concrete content/description?
   - Feeling: Does the answer express emotions or feelings?
   - Why: Does the answer explain reasons or causes?
4. Suggest one improved version of the answer (make it more natural and complete)
5. Write a short Korean feedback (2-3 sentences, constructive and encouraging)

Output Format (JSON only, no markdown):
{
  "grammar": 85,
  "naturalness": 90,
  "mp": {
    "what": true,
    "feeling": true,
    "why": false
  },
  "suggestion": "I felt refreshed because it was my first trip after a long time.",
  "feedback": "문법은 좋지만 이유(Why)가 부족해요. 감정 표현은 잘 했어요!"
}`;

  try {
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
    return feedback;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw new Error(
      "AI 평가 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
    );
  }
}

