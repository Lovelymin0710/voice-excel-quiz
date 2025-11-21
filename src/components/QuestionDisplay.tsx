import { useEffect, useRef, useState } from "react";
import type { Question } from "@/types/exam";
import { Volume2, VolumeX, Eye, EyeOff } from "lucide-react";

interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
}

export default function QuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
}: QuestionDisplayProps) {
  const [isHidden, setIsHidden] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showKo, setShowKo] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis ?? null;
    return () => {
      if (synthRef.current?.speaking || synthRef.current?.pending) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const getLevelClass = (level: string) => {
    switch (level) {
      case "IL":
        return "bg-gray-500 text-white";
      case "IM":
        return "bg-blue-500";
      case "IH":
        return "bg-purple-600";
      case "AL":
        return "bg-black text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const stopSpeak = () => {
    if (!synthRef.current) return;
    if (synthRef.current.speaking || synthRef.current.pending) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
  };

  const speakQuestion = () => {
    if (!synthRef.current) {
      return;
    }
    if (synthRef.current.speaking || synthRef.current.pending) {
      stopSpeak();
      return;
    }

    const text = question.question;
    if (!text?.trim()) return;

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 0.95;
    utter.pitch = 1.0;
    const voices = synthRef.current.getVoices?.() || [];
    const enVoice =
      voices.find((v) => v.lang?.toLowerCase().startsWith("en-us")) ||
      voices.find((v) => v.lang?.toLowerCase().startsWith("en"));
    if (enVoice) utter.voice = enVoice;

    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);

    utterRef.current = utter;
    synthRef.current.speak(utter);
  };

  return (
    <div
      className="w-full rounded-2xl p-5"
      style={{
        background: "white",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
        border: "1px solid #F0F0F0",
        fontFamily: "'Pretendard', -apple-system, sans-serif",
      }}
    >
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <span
            className="px-3 py-1 rounded-full text-sm font-medium"
            style={{
              background: "#F7F7F7",
              color: "#5B4D7C",
              border: "1px solid #E0E0E0",
            }}
          >
            Question {questionNumber} / {totalQuestions}
          </span>
          <div className="flex gap-2 items-center">
            <span
              className="px-2 py-1 rounded-lg text-xs font-medium"
              style={{
                background: "#F0F0F0",
                color: "#6A6A6A",
              }}
            >
              {question.category}
            </span>
            <span
              className="px-2 py-1 rounded-lg text-xs font-semibold text-white"
              style={{
                background: getLevelClass(question.difficulty).includes("IL")
                  ? "#9E9E9E"
                  : getLevelClass(question.difficulty).includes("IM")
                  ? "#64B5F6"
                  : getLevelClass(question.difficulty).includes("IH")
                  ? "#9C27B0"
                  : "#212121",
              }}
            >
              {question.difficulty}
            </span>
            <button
              onClick={() => setIsHidden((v) => !v)}
              title={isHidden ? "질문 보이기" : "질문 숨기기"}
              className="h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-[#F7F7F7]"
              style={{ color: "#6A6A6A" }}
            >
              {isHidden ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={isSpeaking ? stopSpeak : speakQuestion}
              title={isSpeaking ? "읽기 중지" : "질문 듣기"}
              className="h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-[#F7F7F7]"
              style={{ color: "#6A6A6A" }}
            >
              {isSpeaking ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>

            {/* 한국어 해석 토글 */}
            <button
              onClick={() => setShowKo((v) => !v)}
              title={showKo ? "한글 해석 숨기기" : "한글 해석 보기"}
              disabled={!question.ko}
              className="h-8 px-2 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F7F7F7]"
              style={{
                color: question.ko ? "#5B4D7C" : "#D0D0D0",
              }}
            >
              {showKo ? "한글 숨기기" : "한글 보기"}
            </button>
          </div>
        </div>
        <h2
          className={`text-2xl leading-relaxed mb-0 ${
            isHidden ? "blur-sm select-none" : ""
          }`}
          style={{
            color: "#111111",
            fontWeight: 600,
            fontSize: "24px",
            lineHeight: "1.6",
          }}
        >
          {question.question}
        </h2>
      </div>
      <div className="space-y-4">
        {question.ko && showKo && (
          <div
            className="p-4 rounded-xl"
            style={{
              background: "#F9F9F9",
              border: "1px solid #E8E8E8",
            }}
          >
            <p
              className="text-sm leading-relaxed"
              style={{
                color: "#4A4A4A",
                fontSize: "14px",
                lineHeight: "1.7",
              }}
            >
              {question.ko}
            </p>
          </div>
        )}
        <div
          className="p-4 rounded-xl"
          style={{
            background: "#F7F7F7",
          }}
        >
          <p
            className="text-sm"
            style={{
              color: "#6A6A6A",
              fontSize: "14px",
              lineHeight: "1.6",
            }}
          >
            💡 <strong style={{ color: "#5B4D7C" }}>Tip:</strong> 답변할 때{" "}
            <strong>What</strong>(무엇을), <strong>Feeling</strong>(감정),{" "}
            <strong>Why</strong>(이유)를 포함하면 좋은 점수를 받을 수 있어요!
          </p>
        </div>
      </div>
    </div>
  );
}
