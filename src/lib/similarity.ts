// Levenshtein distance를 이용한 유사도 계산
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[len1][len2];
}

export function calculateSimilarity(str1: string, str2: string): number {
  // 양쪽 문자열을 정규화 (소문자, 공백 정리, 구두점 제거)
  const normalize = (s: string) => 
    s.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const normalized1 = normalize(str1);
  const normalized2 = normalize(str2);

  // Levenshtein distance 계산
  const distance = levenshteinDistance(normalized1, normalized2);
  const maxLength = Math.max(normalized1.length, normalized2.length);

  // 유사도를 퍼센트로 변환 (0-100)
  if (maxLength === 0) return 100;
  const similarity = ((maxLength - distance) / maxLength) * 100;

  return Math.round(similarity);
}
