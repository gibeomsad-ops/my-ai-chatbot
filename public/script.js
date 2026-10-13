const STORAGE_KEY = 'chat-history';

const messagesEl = document.getElementById('messages');
const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const resetBtn = document.getElementById('reset-btn');

// 데이터베이스 대신 브라우저에 대화 기록을 저장합니다.
let history = loadHistory();

function loadHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveHistory() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // 저장소를 사용할 수 없으면 현재 탭에서만 기록을 유지합니다.
  }
}

function addMessage(role, content) {
  messagesEl.querySelector('.empty')?.remove();
  const el = document.createElement('div');
  el.className = `message ${role}`;
  el.textContent = content;
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return el;
}

function render() {
  messagesEl.innerHTML = '';
  if (history.length === 0) {
    messagesEl.innerHTML = '<p class="empty">무엇이든 물어보세요!</p>';
    return;
  }
  history.forEach((m) => addMessage(m.role, m.content));
}

function setLoading(loading) {
  sendBtn.disabled = loading;
  input.disabled = loading;
}

async function sendMessage(text) {
  history.push({ role: 'user', content: text });
  saveHistory();
  addMessage('user', text);

  setLoading(true);
  const loadingEl = addMessage('assistant loading', '답변을 생성하는 중...');

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `요청 실패 (${res.status})`);

    loadingEl.remove();
    history.push({ role: 'assistant', content: data.reply });
    saveHistory();
    addMessage('assistant', data.reply);
  } catch (err) {
    loadingEl.remove();
    // 실패한 질문은 기록에서 빼서 다음 요청의 맥락이 꼬이지 않게 합니다.
    history.pop();
    saveHistory();
    messagesEl.lastElementChild?.remove();
    input.value = text;
    addMessage('error', err.message || '오류가 발생했습니다.');
  } finally {
    setLoading(false);
    input.focus();
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text || sendBtn.disabled) return;
  input.value = '';
  autoResize();
  sendMessage(text);
});

// Enter 전송, Shift+Enter 줄바꿈 (한글 입력 조합 중에는 무시)
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    e.preventDefault();
    form.requestSubmit();
  }
});

function autoResize() {
  input.style.height = 'auto';
  input.style.height = `${input.scrollHeight}px`;
}
input.addEventListener('input', autoResize);

resetBtn.addEventListener('click', () => {
  if (history.length && !confirm('대화 기록을 모두 지울까요?')) return;
  history = [];
  saveHistory();
  render();
  input.focus();
});

render();
input.focus();
