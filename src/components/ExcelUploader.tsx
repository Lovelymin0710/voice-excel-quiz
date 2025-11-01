import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ExcelUploaderProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

const ExcelUploader = ({ onFileUpload, isLoading }: ExcelUploaderProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <Card className="p-8 text-center border-2 border-dashed hover:border-primary transition-colors">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">엑셀 파일 업로드</h2>
          <p className="text-muted-foreground mb-4">
            순번 | 한글 | 영어 | 암기날짜 형식의 엑셀 파일을 업로드하세요
          </p>
        </div>
        <label htmlFor="file-upload">
          <Button disabled={isLoading} asChild>
            <span className="cursor-pointer">
              {isLoading ? "파일 읽는 중..." : "📂 파일 선택"}
            </span>
          </Button>
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </Card>
  );
};

export default ExcelUploader;
