// 랭킹 API: GET /api/scores?id=… (상위 20명 + 내 순위), POST /api/scores (기록 올리기)
// 게임 페이지는 GitHub Pages(github.io)에 있고, 이 서버는 Netlify에 있어서 다른 주소의 요청을 허용해요.
import { getStore } from '@netlify/blobs';
import { cleanEntry, applyScore, publicView } from '../lib/board.mjs';

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
  'access-control-max-age': '86400',
};
const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...CORS },
});

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  const store = getStore({ name: 'leaderboard', consistency: 'strong' });
  const board = (await store.get('board', { type: 'json' })) || [];

  if (req.method === 'GET') {
    const id = new URL(req.url).searchParams.get('id') || '';
    return json(publicView(board, id));
  }

  if (req.method === 'POST') {
    let body;
    try { body = await req.json(); } catch { return json({ error: '잘못된 요청이에요' }, 400); }
    const entry = cleanEntry(body);
    if (!entry) return json({ error: '기록 형식이 올바르지 않아요' }, 400);
    const result = applyScore(board, entry);
    await store.setJSON('board', result.board);
    return json({ ok: true, improved: result.improved, rank: result.rank, best: result.best });
  }

  return json({ error: '지원하지 않는 요청이에요' }, 405);
};

export const config = { path: '/api/scores' };
