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
  const durationStr = request.durationSec
    ? `${request.durationSec} seconds`
    : "unknown";

  const prompt = `You are an OPIc evaluator providing feedback in Korean.

Evaluate the given English answer and respond ONLY in the JSON structure below:

{
  "grammar": number (0–100),
  "naturalness": number (0–100),
  "mp": { "what": boolean, "feeling": boolean, "why": boolean },
  "strengths": [ "..." ],
  "weaknesses": [ "..." ],
  "suggestions": [ "..." ],
  "improved_answer": "...",
  "feedback_summary": "...",
  "level": "IL|IM1|IM2|IH",
  "tone": "encouraging|neutral|strict"
}

Input:
- Question: ${request.question}
- Answer: ${request.answer}
- Duration: ${durationStr}

Evaluate:
1. Grammar accuracy (0–100): Check for grammatical errors
2. Naturalness (0–100): How natural and fluent the answer sounds
3. MP structure (What, Feeling, Why):
   - What: Does the answer include concrete content/description?
   - Feeling: Does the answer express emotions or feelings?
   - Why: Does the answer explain reasons or causes?
4. Provide 1-2 sentence strengths in Korean (array).
5. Provide 1-2 sentence weaknesses in Korean (array).
6. Provide 1-2 short suggestions in Korean (array) that are actionable.
7. Provide an improved_answer: Rewrite the user's answer in natural, fluent English that demonstrates better grammar, vocabulary, and structure while maintaining the original meaning. This should be a complete, polished English sentence or paragraph.
8. Write a Korean feedback_summary in 2-3 sentences that synthesizes overall performance, includes tone, and if the duration is very short (<= 10 seconds) or long (>= 90 seconds) mention the timing appropriateness.
9. Assign an overall OPIc level (IL, IM1, IM2, IH) and tone (encouraging, neutral, strict).

Output Format (JSON only, no markdown):
{
  "grammar": 85,
  "naturalness": 90,
  "mp": { "what": true, "feeling": true, "why": false },
  "strengths": ["..."],
  "weaknesses": ["..."],
  "suggestions": ["..."],
  "improved_answer": "I recently took a memorable trip to Jeju Island with my family. It was my first vacation in a long time, so I felt incredibly refreshed and excited. We spent three days exploring beautiful beaches, hiking up Hallasan Mountain, and enjoying delicious local food.",
  "feedback_summary": "...",
  "level": "IM2",
  "tone": "encouraging"
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

