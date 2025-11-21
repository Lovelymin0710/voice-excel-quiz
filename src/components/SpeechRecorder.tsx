import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";

// ===== 타입 안전성: Web Speech API 타입 정의 =====
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

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
  const recognitionRef = useRef<SpeechRecognition | null>(null);
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

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
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

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
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
            className="border-t px-4 pt-2 backdrop-blur-sm"
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              borderColor: "#F0F0F0",
              paddingBottom: "calc(env(safe-area-inset-bottom) + 8px)",
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isEvaluating}
                className="h-14 flex-1 rounded-xl font-bold text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  fontFamily: "'Pretendard', -apple-system, sans-serif",
                  fontSize: "16px",
                  fontWeight: 700,
                  background: isRecording
                    ? "linear-gradient(100deg, #F44336 0%, #E91E63 100%)"
                    : "linear-gradient(100deg, #B39DDB 0%, #CE93D8 42%, #F8BBD0 100%)",
                  boxShadow: isRecording
                    ? "0 8px 24px rgba(244, 67, 54, 0.4), inset 0 -2px 8px rgba(0,0,0,0.1)"
                    : "0 8px 24px rgba(179, 157, 219, 0.4), inset 0 -2px 8px rgba(0,0,0,0.1)",
                }}
              >
                {isEvaluating
                  ? "평가중..."
                  : isRecording
                  ? "녹음 중지"
                  : "녹음 시작"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 데스크톱/태블릿용 카드 UI */}
      <div
        className="w-full hidden md:block rounded-2xl p-6"
        style={{
          background: "white",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
          border: "1px solid #F0F0F0",
        }}
      >
        <div className="flex flex-col items-center gap-6">
          {/* 녹음 버튼 */}
          <div className="relative">
            <button
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
              className={`h-16 w-16 md:h-24 md:w-24 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                isRecording ? "animate-pulse" : ""
              }`}
              style={{
                fontFamily: "'Pretendard', -apple-system, sans-serif",
                background: isRecording
                  ? "linear-gradient(100deg, #F44336 0%, #E91E63 100%)"
                  : "linear-gradient(100deg, #B39DDB 0%, #CE93D8 42%, #F8BBD0 100%)",
                boxShadow: isRecording
                  ? "0 12px 32px rgba(244, 67, 54, 0.5), inset 0 -3px 10px rgba(0,0,0,0.15), inset 0 2px 8px rgba(255,255,255,0.3)"
                  : "0 12px 32px rgba(179, 157, 219, 0.5), inset 0 -3px 10px rgba(0,0,0,0.15), inset 0 2px 8px rgba(255,255,255,0.3)",
                color: "white",
              }}
            >
              {isEvaluating ? (
                <Loader2 className="h-10 w-10 animate-spin" />
              ) : isRecording ? (
                <Square className="h-10 w-10" />
              ) : (
                <Mic className="h-10 w-10" />
              )}
            </button>
            {isRecording && (
              <div className="absolute -inset-2 bg-red-500/20 rounded-full animate-ping pointer-events-none" />
            )}
          </div>

          {/* 상태 텍스트 */}
          <div className="text-center">
            {isEvaluating ? (
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#5B4D7C",
                  fontFamily: "'Pretendard', -apple-system, sans-serif",
                }}
              >
                AI가 답변을 평가하고 있습니다...
              </p>
            ) : isRecording ? (
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#F44336",
                  fontFamily: "'Pretendard', -apple-system, sans-serif",
                }}
              >
                🔴 녹음 중... 답변이 끝나면 버튼을 다시 눌러주세요
              </p>
            ) : (
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#6A6A6A",
                  fontFamily: "'Pretendard', -apple-system, sans-serif",
                }}
              >
                마이크 버튼을 눌러 답변을 시작하세요
              </p>
            )}
          </div>

          {/* 실시간 트랜스크립트 */}
          {transcript && (
            <div
              className="w-full p-4 rounded-xl"
              style={{
                background: "#F7F7F7",
              }}
            >
              <p
                style={{
                  fontSize: "14px",
                  color: "#6A6A6A",
                  marginBottom: "8px",
                  fontWeight: 500,
                  fontFamily: "'Pretendard', -apple-system, sans-serif",
                }}
              >
                📝 You said:
              </p>
              <p
                style={{
                  fontSize: "16px",
                  color: "#111111",
                  lineHeight: "1.6",
                  fontFamily: "'Pretendard', -apple-system, sans-serif",
                }}
              >
                {transcript}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
