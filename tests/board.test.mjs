import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanEntry, applyScore, publicView, TOP_N } from '../netlify/lib/board.mjs';

const ID_A = 'aaaaaaaa-1111-2222-3333-444444444444';
const ID_B = 'bbbbbbbb-1111-2222-3333-444444444444';

test('rejects bad entries', () => {
  assert.equal(cleanEntry(null), null);
  assert.equal(cleanEntry({ id: 'short', best: 10 }), null);
  assert.equal(cleanEntry({ id: ID_A, best: 0 }), null);
  assert.equal(cleanEntry({ id: ID_A, best: 999999 }), null);
  assert.equal(cleanEntry({ id: ID_A + '<script>', best: 10 }), null);
});

test('cleans nickname and fills defaults', () => {
  const e = cleanEntry({ id: ID_A, best: 12.7, nick: '  아주아주긴닉네임입니다요  ', stars: -3 });
  assert.equal(e.best, 12);
  assert.equal(e.nick, '아주아주긴닉네임입니');
  assert.equal(e.stars, 0);
  assert.equal(cleanEntry({ id: ID_A, best: 5 }).nick, '익명 등반가');
});

test('keeps only each player best and ranks them', () => {
  let r = applyScore([], cleanEntry({ id: ID_A, best: 50, nick: 'A' }), 1);
  assert.equal(r.improved, true); assert.equal(r.rank, 1);
  r = applyScore(r.board, cleanEntry({ id: ID_B, best: 80, nick: 'B' }), 2);
  assert.equal(r.rank, 1);
  r = applyScore(r.board, cleanEntry({ id: ID_A, best: 30, nick: 'A2' }), 3);
  assert.equal(r.improved, false); assert.equal(r.best, 50); assert.equal(r.rank, 2);
  assert.equal(r.board.length, 2);
  assert.equal(r.board[1].nick, 'A2');
  r = applyScore(r.board, cleanEntry({ id: ID_A, best: 90, nick: 'A3' }), 4);
  assert.equal(r.improved, true); assert.equal(r.rank, 1);
});

test('public view hides ids and marks me', () => {
  const { board } = applyScore([], cleanEntry({ id: ID_A, best: 50 }), 1);
  const v = publicView(board, ID_A);
  assert.equal(v.top[0].me, true);
  assert.equal('id' in v.top[0], false);
  assert.deepEqual(v.mine, { rank: 1, best: 50 });
  assert.equal(publicView(board, ID_B).mine, null);
  let b = [];
  for (let i = 0; i < 30; i++) b = applyScore(b, cleanEntry({ id: 'player-' + String(i).padStart(4, '0'), best: i + 1 }), i).board;
  assert.equal(publicView(b, '').top.length, TOP_N);
});
