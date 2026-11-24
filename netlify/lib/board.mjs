// 랭킹판 규칙 (저장소와 분리해서 테스트하기 쉽게 둠)
export const MAX_ROWS = 300;   // 저장해 두는 최대 인원
export const TOP_N = 20;      // 화면에 보여 주는 인원
export const MAX_BEST = 100000;
const DEFAULT_NICK = '익명 등반가';

// 들어온 기록을 검사하고 정리해요. 잘못된 값이면 null.
export function cleanEntry(body) {
  if (!body || typeof body !== 'object') return null;
  const id = String(body.id ?? '');
  if (!/^[A-Za-z0-9-]{8,64}$/.test(id)) return null;
  const best = Math.floor(Number(body.best));
  if (!Number.isFinite(best) || best < 1 || best > MAX_BEST) return null;
  const nick = String(body.nick ?? '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 10) || DEFAULT_NICK;
  const stars = Math.max(0, Math.min(10000, Math.floor(Number(body.stars)) || 0));
  const zone = String(body.zone ?? '').slice(0, 10);
  return { id, nick, best, stars, zone };
}

// 한 사람당 최고 기록 하나만 남겨요. 더 낮은 기록이면 닉네임만 바꿔요.
export function applyScore(board, entry, now = Date.now()) {
  const rows = Array.isArray(board) ? board.slice() : [];
  const i = rows.findIndex(r => r.id === entry.id);
  let improved = false;
  if (i < 0) {
    rows.push({ ...entry, at: now });
    improved = true;
  } else if (entry.best > rows[i].best) {
    rows[i] = { ...entry, at: now };
    improved = true;
  } else {
    rows[i] = { ...rows[i], nick: entry.nick };
  }
  rows.sort((a, b) => b.best - a.best || a.at - b.at);
  if (rows.length > MAX_ROWS) rows.length = MAX_ROWS;
  const rank = rows.findIndex(r => r.id === entry.id) + 1;
  const mine = rank ? rows[rank - 1] : null;
  return { board: rows, improved, rank: rank || null, best: mine ? mine.best : entry.best };
}

// 다른 사람의 id는 내보내지 않아요 (id를 알면 그 사람 행세를 할 수 있으니까요)
export function publicView(board, id) {
  const rows = Array.isArray(board) ? board : [];
  const top = rows.slice(0, TOP_N).map(r => ({ nick: r.nick, best: r.best, stars: r.stars, zone: r.zone, me: !!id && r.id === id }));
  const i = id ? rows.findIndex(r => r.id === id) : -1;
  return { top, mine: i >= 0 ? { rank: i + 1, best: rows[i].best } : null };
}
