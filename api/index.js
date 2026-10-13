import express from 'express';
import OpenAI from 'openai';

const MODEL = 'gpt-4o-mini';
const MAX_HISTORY = 20; // 모델에 보낼 최근 메시지 수
const MAX_CONTENT_LENGTH = 4000; // 메시지 하나당 최대 글자 수
const SYSTEM_PROMPT =
  '당신은 친절하고 도움이 되는 AI 어시스턴트입니다. 이전 대화 맥락을 고려해서 한국어로 간결하고 정확하게 답변하세요.';

const app = express();
app.use(express.json({ limit: '100kb' }));

let client;
function getClient() {
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

// 클라이언트가 보낸 대화 기록을 검증하고 정리
function sanitizeMessages(messages) {
  if (!Array.isArray(messages)) return null;
  const cleaned = messages
    .filter(
      (m) =>
        m &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.trim() !== ''
    )
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CONTENT_LENGTH) }))
    .slice(-MAX_HISTORY);
  if (cleaned.length === 0 || cleaned[cleaned.length - 1].role !== 'user') return null;
  return cleaned;
}

app.post('/api/chat', async (req, res) => {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: '서버에 OPENAI_API_KEY가 설정되지 않았습니다.' });
  }

  const messages = sanitizeMessages(req.body?.messages);
  if (!messages) {
    return res.status(400).json({ error: '올바른 메시지 형식이 아닙니다.' });
  }

  try {
    const completion = await getClient().chat.completions.create({
      model: MODEL,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      temperature: 0.7,
    });
    const reply = completion.choices[0]?.message?.content ?? '';
    res.json({ reply });
  } catch (err) {
    console.error('OpenAI API error:', err);
    const status = err?.status && err.status < 500 ? err.status : 502;
    res.status(status).json({ error: 'AI 응답을 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

export default app;
