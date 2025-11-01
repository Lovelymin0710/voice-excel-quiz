import { useState } from "react";
import * as XLSX from "xlsx";
import { z } from "zod";
import ExcelUploader from "@/components/ExcelUploader";
import SentencePractice from "@/components/SentencePractice";
import { toast } from "sonner";

interface Sentence {
  순번: number;
  한글: string;
  영어: string;
  암기날짜: string;
}

// Security: Validate Excel content to prevent XSS and resource exhaustion
const sentenceSchema = z.object({
  순번: z.union([z.number(), z.string()]).pipe(z.coerce.number().int().positive()),
  한글: z.union([z.string(), z.number()])
    .transform(val => String(val).trim())
    .refine(val => val.length > 0, "한글 내용이 비어있습니다")
    .refine(val => val.length <= 500, "한글 내용이 너무 깁니다 (최대 500자)")
    .refine(
      (val) => !val.startsWith('=') && !val.startsWith('+') && !val.startsWith('-') && !val.startsWith('@'),
      "수식이 포함된 셀은 허용되지 않습니다"
    ),
  영어: z.union([z.string(), z.number()])
    .transform(val => String(val).trim())
    .refine(val => val.length > 0, "영어 내용이 비어있습니다")
    .refine(val => val.length <= 500, "영어 내용이 너무 깁니다 (최대 500자)")
    .refine(
      (val) => !val.startsWith('=') && !val.startsWith('+') && !val.startsWith('-') && !val.startsWith('@'),
      "수식이 포함된 셀은 허용되지 않습니다"
    ),
  암기날짜: z.union([z.string(), z.number(), z.undefined()]).transform(val => val ? String(val) : '').optional(),
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_ROWS = 1000;

const Index = () => {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    try {
      // Security: Validate file size to prevent memory exhaustion
      if (file.size > MAX_FILE_SIZE) {
        toast.error("파일이 너무 큽니다. 최대 5MB까지 업로드 가능합니다.");
        return;
      }

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<Sentence>(worksheet);

      if (jsonData.length === 0) {
        toast.error("엑셀 파일에 데이터가 없습니다.");
        return;
      }

      // Security: Limit number of rows to prevent resource exhaustion
      if (jsonData.length > MAX_ROWS) {
        toast.error(`파일에 데이터가 너무 많습니다. 최대 ${MAX_ROWS}개의 행까지 처리 가능합니다.`);
        return;
      }

      // 필수 컬럼 확인
      const firstRow = jsonData[0];
      if (!firstRow.한글 || !firstRow.영어) {
        toast.error("엑셀 파일 형식이 올바르지 않습니다. '한글'과 '영어' 컬럼이 필요합니다.");
        return;
      }

      // Security: Validate and sanitize each row
      const validatedData: Sentence[] = [];
      for (let i = 0; i < jsonData.length; i++) {
        try {
          const validated = sentenceSchema.parse(jsonData[i]);
          validatedData.push({
            순번: validated.순번,
            한글: validated.한글,
            영어: validated.영어,
            암기날짜: validated.암기날짜 || '',
          });
        } catch (error) {
          if (error instanceof z.ZodError) {
            toast.error(`${i + 1}번째 행 오류: ${error.errors[0].message}`);
          } else {
            toast.error(`${i + 1}번째 행을 처리할 수 없습니다.`);
          }
          return;
        }
      }

      // 문장 순서를 랜덤으로 섞기
      const shuffled = [...validatedData].sort(() => Math.random() - 0.5);
      setSentences(shuffled);
      toast.success(`${validatedData.length}개의 문장을 불러왔습니다! (랜덤 순서)`);
    } catch (error) {
      // Security: Don't expose internal error details
      if (import.meta.env.DEV) {
        console.error("파일 읽기 오류:", error);
      }
      toast.error("파일을 읽는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSentences([]);
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            영어 문장 암기 확인
          </h1>
          <p className="text-xl text-muted-foreground">
            음성으로 영어 문장을 말하고 즉시 채점받으세요
          </p>
        </header>

        <main className="max-w-4xl mx-auto">
          {sentences.length === 0 ? (
            <ExcelUploader onFileUpload={handleFileUpload} isLoading={isLoading} />
          ) : (
            <SentencePractice sentences={sentences} onReset={handleReset} />
          )}
        </main>

        <footer className="text-center mt-12 text-sm text-muted-foreground">
          <p>💡 음성 인식이 잘 안 된다면 마이크 권한을 확인하세요</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
