import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SpeechRecorderProps {
  onTranscriptComplete: (transcript: string, durationMs: number) => void;
  isEvaluating: boolean;
}

export default function SpeechRecorder({
  onTranscriptComplete,
  isEvaluating,
}: SpeechRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const isRecordingRef = useRef(false);
  const transcriptFinalRef = useRef(""); // 최종 인식 누적 버퍼
  const shouldFinalizeRef = useRef(false); // stop 후 onend에서 마무리할지 여부
  const startTsRef = useRef<number | null>(null);

  useEffect(() => {
    // Web Speech API 지원 확인
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      toast.error(
        "이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 또는 Edge를 사용해주세요."
      );
      return;
    }

    // SpeechRecognition 초기화
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = (event: any) => {
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          transcriptFinalRef.current += text + " ";
        } else {
          interim += text;
        }
      }

      // 화면에는 누적 + 임시를 합쳐서 표시
      setTranscript((transcriptFinalRef.current + interim).trim());
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      // 사용자가 중지해서 abort된 경우는 정상 종료로 간주
      if (event.error === "aborted") {
        console.log("Recognition aborted by user (normal)");
        return;
      }
      if (event.error === "no-speech") {
        toast.error("음성이 감지되지 않았습니다. 다시 시도해주세요.");
      } else if (event.error === "not-allowed") {
        toast.error(
          "마이크 권한이 거부되었습니다. 브라우저 설정에서 마이크를 허용해주세요."
        );
      } else {
        toast.error(`음성 인식 오류: ${event.error}`);
      }
      setIsRecording(false);
      isRecordingRef.current = false;
    };

    recognitionRef.current.onend = () => {
      console.log("Recognition ended");
      // stop 호출 후라면 최종 결과로 마무리
      if (shouldFinalizeRef.current) {
        const finalText = (transcriptFinalRef.current || transcript).trim();
        shouldFinalizeRef.current = false;
        if (!finalText) {
          toast.error("음성이 인식되지 않았습니다. 다시 시도해주세요.");
          return;
        }
        const durationMs =
          startTsRef.current !== null ? Date.now() - startTsRef.current : 0;
        toast.success("녹음 완료! AI가 평가 중입니다...");
        onTranscriptComplete(finalText, durationMs);
      }
    };

    return () => {
      if (recognitionRef.current) {
        isRecordingRef.current = false;
        try {
          recognitionRef.current.abort();
        } catch (error) {
          console.error("Cleanup error:", error);
        }
      }
    };
  }, []);

  const startRecording = () => {
    console.log("=== START RECORDING CALLED ===");
    // 버퍼 초기화
    transcriptFinalRef.current = "";
    setTranscript("");
    setIsRecording(true);
    isRecordingRef.current = true;
    startTsRef.current = Date.now();
    try {
      recognitionRef.current.start();
      console.log("Recognition started successfully");
      toast.success("🎤 녹음 시작! 영어로 답변해주세요.");
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast.error("녹음을 시작할 수 없습니다.");
      setIsRecording(false);
      isRecordingRef.current = false;
    }
  };

  const stopRecording = () => {
    console.log("=== STOP RECORDING CALLED ===");
    console.log(
      "Current state - isRecording:",
      isRecording,
      "isRecordingRef:",
      isRecordingRef.current
    );

    // 먼저 ref를 false로 설정하여 onend 핸들러가 동작하지 않도록
    isRecordingRef.current = false;
    setIsRecording(false);
    // onend에서 최종 처리하도록 플래그 설정
    shouldFinalizeRef.current = true;

    if (recognitionRef.current) {
      try {
        console.log("Stopping recognition (graceful)...");
        // stop()을 사용하여 최종 결과를 확정
        recognitionRef.current.stop();
        console.log("Recognition stop requested");
      } catch (error) {
        console.error("Failed to stop recording:", error);
      }
    }
    // 최종 완료 및 onTranscriptComplete 호출은 onend에서 처리
  };

  return (
    <>
      {/* 모바일 하단 고정 액션바 */}
      <div className="fixed inset-x-0 bottom-0 z-40 md:hidden">
        <div className="mx-auto w-full max-w-md">
          <div
            className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 pt-2"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 8px)" }}
          >
            <div className="flex items-center justify-between gap-3">
              <Button
                size="lg"
                className={`h-14 flex-1 ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-primary hover:bg-primary/90"
                }`}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isEvaluating}
              >
                {isEvaluating
                  ? "평가중..."
                  : isRecording
                  ? "녹음 중지"
                  : "녹음 시작"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 데스크톱/태블릿용 카드 UI */}
      <Card className="w-full hidden md:block">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-6">
            {/* 녹음 버튼 */}
            <div className="relative">
              <Button
                size="lg"
                className={`h-16 w-16 md:h-24 md:w-24 rounded-full ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600 animate-pulse"
                    : "bg-primary hover:bg-primary/90"
                }`}
                onClick={(e) => {
                  console.log("=== BUTTON CLICKED ===", {
                    isRecording,
                    isEvaluating,
                  });
                  e.preventDefault();
                  e.stopPropagation();
                  if (isRecording) {
                    console.log("Calling stopRecording()");
                    stopRecording();
                  } else {
                    console.log("Calling startRecording()");
                    startRecording();
                  }
                }}
                disabled={isEvaluating}
              >
                {isEvaluating ? (
                  <Loader2 className="h-10 w-10 animate-spin" />
                ) : isRecording ? (
                  <Square className="h-10 w-10" />
                ) : (
                  <Mic className="h-10 w-10" />
                )}
              </Button>
              {isRecording && (
                <div className="absolute -inset-2 bg-red-500/20 rounded-full animate-ping pointer-events-none" />
              )}
            </div>

            {/* 상태 텍스트 */}
            <div className="text-center">
              {isEvaluating ? (
                <p className="text-lg font-semibold text-primary">
                  AI가 답변을 평가하고 있습니다...
                </p>
              ) : isRecording ? (
                <p className="text-lg font-semibold text-red-500">
                  🔴 녹음 중... 답변이 끝나면 버튼을 다시 눌러주세요
                </p>
              ) : (
                <p className="text-lg font-semibold text-muted-foreground">
                  마이크 버튼을 눌러 답변을 시작하세요
                </p>
              )}
            </div>

            {/* 실시간 트랜스크립트 */}
            {transcript && (
              <div className="w-full p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  📝 You said:
                </p>
                <p className="text-base">{transcript}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
