import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Question } from "@/types/exam";
import { Button } from "@/components/ui/button";
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
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="text-sm">
            Question {questionNumber} / {totalQuestions}
          </Badge>
          <div className="flex gap-2 items-center">
            <Badge variant="secondary">{question.category}</Badge>
            <Badge className={getLevelClass(question.difficulty)}>
              {question.difficulty}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => setIsHidden((v) => !v)}
              title={isHidden ? "질문 보이기" : "질문 숨기기"}
            >
              {isHidden ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={isSpeaking ? stopSpeak : speakQuestion}
              title={isSpeaking ? "읽기 중지" : "질문 듣기"}
            >
              {isSpeaking ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>

            {/* 한국어 해석 토글 */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => setShowKo((v) => !v)}
              title={showKo ? "한글 해석 숨기기" : "한글 해석 보기"}
              disabled={!question.ko}
            >
              {showKo ? "한글 숨기기" : "한글 보기"}
            </Button>
          </div>
        </div>
        <CardTitle
          className={`text-2xl leading-relaxed ${
            isHidden ? "blur-sm select-none" : ""
          }`}
        >
          {question.question}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {question.ko && showKo && (
          <div className="mb-3 p-3 rounded-md border bg-background">
            <p className="text-sm leading-relaxed">{question.ko}</p>
          </div>
        )}
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> 답변할 때 <strong>What</strong>(무엇을),{" "}
            <strong>Feeling</strong>(감정), <strong>Why</strong>(이유)를
            포함하면 좋은 점수를 받을 수 있어요!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
