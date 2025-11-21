import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Lightbulb, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import type { AIFeedback } from "@/types/exam";

interface AIFeedbackProps {
  feedback: AIFeedback;
  userAnswer: string;
  durationMs?: number;
}

export default function AIFeedbackDisplay({
  feedback,
  userAnswer,
  durationMs = 0,
}: AIFeedbackProps) {
  const [copied, setCopied] = useState(false);
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  const formattedTime = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#4CAF50";
    if (score >= 60) return "#FF9800";
    return "#F44336";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent!";
    if (score >= 80) return "Great!";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    return "Keep practicing!";
  };

  const cardStyle = {
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
    border: "1px solid #F0F0F0",
    fontFamily: "'Pretendard', -apple-system, sans-serif",
  };

  return (
    <div className="space-y-6">
      {/* 점수 카드 */}
      <div style={cardStyle}>
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#111111",
                }}
              >
                📊 평가 결과
              </h3>
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  background: "linear-gradient(100deg, #B39DDB 0%, #CE93D8 42%, #F8BBD0 100%)",
                  color: "white",
                }}
              >
                Level: {feedback.level}
              </span>
            </div>
            <span
              style={{
                fontSize: "14px",
                color: "#6A6A6A",
                fontWeight: 500,
              }}
            >
              ⏱️ Answer time: {formattedTime}
            </span>
          </div>
        </div>
        <div className="space-y-6">
          {/* Grammar Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#111111",
                }}
              >
                문법 정확도 (Grammar)
              </span>
              <span
                className="text-2xl font-bold"
                style={{
                  color: getScoreColor(feedback.grammar),
                }}
              >
                {feedback.grammar}점
              </span>
            </div>
            <Progress value={feedback.grammar} className="h-3" />
            <p
              style={{
                fontSize: "14px",
                color: "#6A6A6A",
                marginTop: "8px",
                fontWeight: 500,
              }}
            >
              {getScoreLabel(feedback.grammar)}
            </p>
          </div>

          {/* Naturalness Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#111111",
                }}
              >
                자연스러움 (Naturalness)
              </span>
              <span
                className="text-2xl font-bold"
                style={{
                  color: getScoreColor(feedback.naturalness),
                }}
              >
                {feedback.naturalness}점
              </span>
            </div>
            <Progress value={feedback.naturalness} className="h-3" />
            <p
              style={{
                fontSize: "14px",
                color: "#6A6A6A",
                marginTop: "8px",
                fontWeight: 500,
              }}
            >
              {getScoreLabel(feedback.naturalness)}
            </p>
          </div>

          {/* MP Structure */}
          <div>
            <span
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#111111",
                display: "block",
                marginBottom: "12px",
              }}
            >
              MP 구조 (What / Feeling / Why)
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div
                className="flex flex-col items-center p-3 rounded-xl"
                style={{
                  background: "#F7F7F7",
                }}
              >
                {feedback.mp.what ? (
                  <CheckCircle2 className="h-8 w-8 mb-2" style={{ color: "#4CAF50" }} />
                ) : (
                  <XCircle className="h-8 w-8 mb-2" style={{ color: "#F44336" }} />
                )}
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#111111",
                  }}
                >
                  What
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#6A6A6A",
                    marginTop: "4px",
                    textAlign: "center",
                  }}
                >
                  무엇을
                </span>
              </div>
              <div
                className="flex flex-col items-center p-3 rounded-xl"
                style={{
                  background: "#F7F7F7",
                }}
              >
                {feedback.mp.feeling ? (
                  <CheckCircle2 className="h-8 w-8 mb-2" style={{ color: "#4CAF50" }} />
                ) : (
                  <XCircle className="h-8 w-8 mb-2" style={{ color: "#F44336" }} />
                )}
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#111111",
                  }}
                >
                  Feeling
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#6A6A6A",
                    marginTop: "4px",
                    textAlign: "center",
                  }}
                >
                  감정
                </span>
              </div>
              <div
                className="flex flex-col items-center p-3 rounded-xl"
                style={{
                  background: "#F7F7F7",
                }}
              >
                {feedback.mp.why ? (
                  <CheckCircle2 className="h-8 w-8 mb-2" style={{ color: "#4CAF50" }} />
                ) : (
                  <XCircle className="h-8 w-8 mb-2" style={{ color: "#F44336" }} />
                )}
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#111111",
                  }}
                >
                  Why
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#6A6A6A",
                    marginTop: "4px",
                    textAlign: "center",
                  }}
                >
                  이유
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 답변 비교 */}
      <div style={cardStyle}>
        <div className="mb-4">
          <h3
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#111111",
            }}
          >
            💬 답변 비교
          </h3>
        </div>
        <div className="space-y-4">
          {/* 사용자 답변 */}
          <div>
            <span
              className="inline-block mb-2 px-3 py-1 rounded-lg text-sm font-semibold"
              style={{
                background: "#F7F7F7",
                color: "#5B4D7C",
              }}
            >
              Your Answer
            </span>
            <div
              className="p-4 rounded-xl"
              style={{
                background: "#F9F9F9",
                border: "1px solid #E8E8E8",
              }}
            >
              <p
                style={{
                  fontSize: "16px",
                  color: "#111111",
                  lineHeight: "1.6",
                }}
              >
                {userAnswer}
              </p>
            </div>
          </div>

          {/* 개선된 영어 문장 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-semibold"
                style={{
                  background: "linear-gradient(100deg, #B39DDB 0%, #CE93D8 42%, #F8BBD0 100%)",
                  color: "white",
                }}
              >
                <Lightbulb className="h-3 w-3" />
                Improved Answer
              </span>

              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(feedback.improved_answer);
                    setCopied(true);
                    toast.success("개선된 답변이 복사되었습니다.");
                    setTimeout(() => setCopied(false), 1500);
                  } catch {
                    toast.error("복사에 실패했습니다.");
                  }
                }}
                className="h-8 px-3 rounded-lg text-xs font-semibold transition-all duration-200 hover:bg-opacity-90 active:scale-95"
                style={{
                  background: "white",
                  color: "#5B4D7C",
                  border: "1px solid #E0E0E0",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
                }}
              >
                {copied ? (
                  <span className="inline-flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> Copied
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </span>
                )}
              </button>
            </div>
            <div
              className="p-4 rounded-xl"
              style={{
                background: "linear-gradient(135deg, #F1F8E9 0%, #E8F5E9 100%)",
                border: "1px solid #C8E6C9",
              }}
            >
              <p
                style={{
                  fontSize: "16px",
                  color: "#2E7D32",
                  lineHeight: "1.7",
                }}
              >
                {feedback.improved_answer}
              </p>
            </div>
          </div>

          {/* 장점/약점/제안 */}
          <div className="grid gap-4">
            <div>
              <span
                className="inline-block mb-2 px-3 py-1 rounded-lg text-sm font-semibold"
                style={{
                  background: "#E8F5E9",
                  color: "#2E7D32",
                }}
              >
                장점 (Strengths)
              </span>
              <ul className="space-y-2" style={{ fontSize: "14px", lineHeight: "1.7" }}>
                {feedback.strengths.map((item, idx) => (
                  <li key={`strength-${idx}`} className="flex gap-2" style={{ color: "#4A4A4A" }}>
                    <span style={{ color: "#4CAF50" }}>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span
                className="inline-block mb-2 px-3 py-1 rounded-lg text-sm font-semibold"
                style={{
                  background: "#FFEBEE",
                  color: "#C62828",
                }}
              >
                약점 (Weaknesses)
              </span>
              <ul className="space-y-2" style={{ fontSize: "14px", lineHeight: "1.7" }}>
                {feedback.weaknesses.map((item, idx) => (
                  <li key={`weak-${idx}`} className="flex gap-2" style={{ color: "#4A4A4A" }}>
                    <span style={{ color: "#F44336" }}>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span
                className="inline-flex items-center gap-1 mb-2 px-3 py-1 rounded-lg text-sm font-semibold"
                style={{
                  background: "#E3F2FD",
                  color: "#1565C0",
                }}
              >
                <Lightbulb className="h-3 w-3" />
                개선 제안 (Suggestions)
              </span>
              <ul className="space-y-2" style={{ fontSize: "14px", lineHeight: "1.7" }}>
                {feedback.suggestions.map((item, idx) => (
                  <li key={`suggest-${idx}`} className="flex gap-2" style={{ color: "#4A4A4A" }}>
                    <span style={{ color: "#2196F3" }}>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* AI 피드백 */}
      <div
        style={{
          ...cardStyle,
          border: "2px solid",
          borderImage: "linear-gradient(100deg, #B39DDB 0%, #CE93D8 42%, #F8BBD0 100%) 1",
        }}
      >
        <div className="mb-4">
          <h3
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#111111",
            }}
          >
            🤖 AI 총평 (Tone: {feedback.tone})
          </h3>
        </div>
        <p
          style={{
            fontSize: "18px",
            lineHeight: "1.8",
            color: "#4A4A4A",
            whiteSpace: "pre-line",
          }}
        >
          {feedback.feedback_summary}
        </p>
      </div>
    </div>
  );
}
