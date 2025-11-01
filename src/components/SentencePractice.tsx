import { useState } from "react";
import { Mic, MicOff, CheckCircle, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { calculateSimilarity } from "@/lib/similarity";

interface Sentence {
  순번: number;
  한글: string;
  영어: string;
  암기날짜: string;
}

interface SentencePracticeProps {
  sentences: Sentence[];
  onReset: () => void;
}

const SentencePractice = ({ sentences, onReset }: SentencePracticeProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [result, setResult] = useState<{
    similarity: number;
    isCorrect: boolean;
  } | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  const currentSentence = sentences[currentIndex];
  const progress = ((currentIndex + 1) / sentences.length) * 100;

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("이 브라우저는 음성 인식을 지원하지 않습니다.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.lang = 'en-US';
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;

    recognitionInstance.onstart = () => {
      setIsListening(true);
      toast.info("말씀하세요...");
    };

    recognitionInstance.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserAnswer(transcript);
      setIsListening(false);
      toast.success("음성이 인식되었습니다!");
    };

    recognitionInstance.onerror = (event) => {
      setIsListening(false);
      toast.error(`음성 인식 오류: ${event.error}`);
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    setRecognition(recognitionInstance);
    recognitionInstance.start();
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const checkAnswer = () => {
    if (!userAnswer.trim()) {
      toast.error("먼저 음성을 녹음하세요!");
      return;
    }

    const similarity = calculateSimilarity(userAnswer.toLowerCase(), currentSentence.영어.toLowerCase());
    const isCorrect = similarity >= 70;

    setResult({ similarity, isCorrect });

    if (isCorrect) {
      toast.success(`정답입니다! (유사도: ${similarity}%)`);
    } else {
      toast.error(`틀렸습니다. (유사도: ${similarity}%)`);
    }
  };

  const nextSentence = () => {
    if (currentIndex < sentences.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer("");
      setResult(null);
    } else {
      toast.success("모든 문장을 완료했습니다!");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">
          문제 {currentIndex + 1} / {sentences.length}
        </div>
        <Button variant="outline" size="sm" onClick={onReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          다시 시작
        </Button>
      </div>

      <Progress value={progress} className="h-2" />

      <Card className="p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="text-sm text-muted-foreground">Korean:</div>
          <div className="text-3xl font-bold">{currentSentence.한글}</div>
        </div>

        <div className="flex justify-center gap-3">
          {!isListening ? (
            <Button onClick={startListening} size="lg" className="gap-2">
              <Mic className="w-5 h-5" />
              ▶ 말하기 시작
            </Button>
          ) : (
            <Button onClick={stopListening} variant="destructive" size="lg" className="gap-2">
              <MicOff className="w-5 h-5" />
              ⏹ 말하기 종료
            </Button>
          )}
          <Button onClick={checkAnswer} variant="secondary" size="lg" className="gap-2">
            <CheckCircle className="w-5 h-5" />
            ✅ 채점
          </Button>
        </div>

        {userAnswer && (
          <div className="space-y-4 p-6 bg-muted rounded-lg">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">You said:</div>
              <div className="text-lg">{userAnswer}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Correct is:</div>
              <div className="text-lg font-medium">{currentSentence.영어}</div>
            </div>

            {result && (
              <div className={`text-center py-4 rounded-lg ${result.isCorrect ? 'bg-success/10' : 'bg-destructive/10'}`}>
                <div className={`text-2xl font-bold ${result.isCorrect ? 'text-success' : 'text-destructive'}`}>
                  Similar: {result.similarity}% ({result.isCorrect ? 'O' : 'X'})
                </div>
              </div>
            )}
          </div>
        )}

        {currentIndex < sentences.length - 1 && (
          <div className="flex justify-center">
            <Button onClick={nextSentence} size="lg" className="gap-2">
              ⏭ 다음 문장
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        )}

        {currentIndex === sentences.length - 1 && result && (
          <div className="text-center text-muted-foreground">
            마지막 문장입니다. '다시 시작' 버튼을 눌러 처음부터 다시 연습하세요.
          </div>
        )}
      </Card>
    </div>
  );
};

export default SentencePractice;
