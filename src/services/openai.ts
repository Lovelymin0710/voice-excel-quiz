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
- Question: ${request.question}
- Answer: ${request.answer}
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

