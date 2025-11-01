import { useState } from "react";
import * as XLSX from "xlsx";
import ExcelUploader from "@/components/ExcelUploader";
import SentencePractice from "@/components/SentencePractice";
import { toast } from "sonner";

interface Sentence {
  순번: number;
  한글: string;
  영어: string;
  암기날짜: string;
}

const Index = () => {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<Sentence>(worksheet);

      if (jsonData.length === 0) {
        toast.error("엑셀 파일에 데이터가 없습니다.");
        return;
      }

      // 필수 컬럼 확인
      const firstRow = jsonData[0];
      if (!firstRow.한글 || !firstRow.영어) {
        toast.error("엑셀 파일 형식이 올바르지 않습니다. '한글'과 '영어' 컬럼이 필요합니다.");
        return;
      }

      setSentences(jsonData);
      toast.success(`${jsonData.length}개의 문장을 불러왔습니다!`);
    } catch (error) {
      console.error("파일 읽기 오류:", error);
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
