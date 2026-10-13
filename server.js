// 로컬 개발용 서버. Vercel에서는 public/ 은 정적 파일로, api/index.js 는 서버리스 함수로 동작합니다.
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import app from './api/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// .env 의 OPENAI_API_KEY 를 process.env 로 불러옵니다 (Vercel에서는 대시보드 환경 변수 사용).
try {
  process.loadEnvFile(path.join(__dirname, '.env'));
} catch {
  console.warn('.env 파일이 없습니다. OPENAI_API_KEY 환경 변수를 설정하세요.');
}
const PORT = process.env.PORT || 3000;

const server = express();
server.use(app);
server.use(express.static(path.join(__dirname, 'public')));

server.listen(PORT, () => {
  console.log(`http://localhost:${PORT} 에서 실행 중`);
});
