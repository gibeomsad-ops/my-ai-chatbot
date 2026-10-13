# AI 챗봇

HTML/CSS/JavaScript + Node.js/Express + OpenAI `gpt-4o-mini`로 만든 간단한 챗봇입니다.

## 구조

```
api/index.js      Express 앱 (POST /api/chat) — Vercel 서버리스 함수
public/           프론트엔드 (index.html, style.css, script.js)
server.js         로컬 개발용 서버
vercel.json       /api/* 요청을 api/index.js로 연결
```

데이터베이스 없이, 대화 기록은 브라우저 `localStorage`에 저장하고 매 요청마다 서버로 함께 보냅니다.
서버는 최근 20개 메시지에 시스템 프롬프트를 붙여 OpenAI에 전달하므로 이전 대화 맥락이 답변에 반영됩니다.

## 로컬 실행

```bash
npm install
cp .env.example .env   # .env 에 OPENAI_API_KEY 입력
npm run dev            # http://localhost:3000
```

## Vercel 배포

1. GitHub에 올린 뒤 Vercel에서 Import 하거나, `npx vercel` 실행
2. Vercel 프로젝트 Settings → Environment Variables 에 `OPENAI_API_KEY` 추가
3. 재배포
