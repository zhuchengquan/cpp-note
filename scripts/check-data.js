#!/usr/bin/env node
/* ============================================================
   check-data.js —— 全站数据完整性静态校验（零依赖，node 即可）
   交叉验证 index.html 引用、OUTLINE / TOPICS / TEMPLATES /
   RELATIONS / QUIZ 的内部引用与结构一致性。
   用法：node scripts/check-data.js
   ============================================================ */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'js', 'data');

const errors = [];
const warn = [];
const err = (m) => errors.push(m);

/* ---------- 1. index.html 引用与磁盘文件互查（无死链 / 无孤儿） ---------- */
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map((m) => m[1])
  .filter((u) => !/^(data:|https?:|#)/.test(u));
for (const r of refs) {
  if (!fs.existsSync(path.join(ROOT, r))) err(`index.html 引用了不存在的文件: ${r}`);
}
for (const f of fs.readdirSync(DATA_DIR).filter((x) => x.endsWith('.js'))) {
  const rel = `js/data/${f}`;
  if (!html.includes(rel)) warn(`数据文件未被 index.html 引用（孤儿文件）: ${rel}`);
}

/* ---------- 2. 在沙箱中加载所有数据文件 ---------- */
const sandbox = { window: {}, console };
sandbox.window.TOPICS = {};
vm.createContext(sandbox);
for (const f of fs.readdirSync(DATA_DIR).filter((x) => x.endsWith('.js')).sort()) {
  try {
    vm.runInContext(fs.readFileSync(path.join(DATA_DIR, f), 'utf8'), sandbox, { filename: f });
  } catch (e) {
    err(`数据文件加载异常 ${f}: ${e.message}`);
  }
}
const W = sandbox.window;
const { OUTLINE, TOPICS, TEMPLATES, RELATIONS, QUIZ } = W;
if (!OUTLINE) { err('缺少 window.OUTLINE'); }
if (!TOPICS) { err('缺少 window.TOPICS'); }

/* ---------- 3. 大纲结构 ---------- */
const ids = new Set();
const chapters = [];
(OUTLINE || []).forEach((p, pi) => {
  if (!p.title) err(`第 ${pi + 1} 部分缺 title`);
  if (!Array.isArray(p.chapters) || !p.chapters.length) err(`部分「${p.title}」缺 chapters`);
  (p.chapters || []).forEach((ch, ci) => {
    chapters.push({ pi, ci, title: ch.title, key: `${pi + 1}-${ci + 1}`, count: ch.topics.length });
    for (const t of ch.topics || []) {
      if (ids.has(t.id)) err(`大纲中 topic id 重复: ${t.id}`);
      ids.add(t.id);
      if (!t.title) err(`topic ${t.id} 缺 title`);
      if (!(t.diff >= 1 && t.diff <= 5)) err(`topic ${t.id} diff 越界: ${t.diff}`);
      if (!Array.isArray(t.tags) || !t.tags.length) err(`topic ${t.id} 缺 tags`);
    }
  });
});

/* ---------- 4. TOPICS 与大纲一一对应、围栏配平 ---------- */
for (const id of ids) {
  const d = TOPICS[id];
  if (!d) { err(`TOPICS 缺正文条目: ${id}`); continue; }
  if (typeof d.body !== 'string' || d.body.trim().length < 20) err(`TOPICS ${id} body 异常`);
  if (!d.chapter) err(`TOPICS ${id} 缺 chapter`);
  const fences = (d.body.match(/```/g) || []).length;
  if (fences % 2 !== 0) err(`TOPICS ${id} body 代码围栏不配平(奇数)`);
}
for (const k of Object.keys(TOPICS)) if (!ids.has(k)) err(`TOPICS 含大纲不存在的 id: ${k}`);

/* ---------- 5. 例题 / 练习 / 易错点结构 ---------- */
const LEVELS = ['入门', '基础', '提高', '挑战'];
for (const id of ids) {
  const d = TOPICS[id] || {};
  (d.examples || []).forEach((ex, i) => {
    const tag = `${id}.example[${i}]`;
    if (!ex.title) err(`${tag} 缺 title`);
    if (!LEVELS.includes(ex.level)) err(`${tag} level 非法: ${ex.level}`);
    const nSmp = (ex.samples || []).length;
    if (nSmp > 0 && !ex.code) err(`${tag} 有 ${nSmp} 个样例但缺 code`);
    if (ex.code) {
      const hasMain = /main\s*\(/.test(ex.code);
      if (nSmp > 0 && !hasMain) err(`${tag} 有样例但 code 无 main，无法运行`);
      const fences = (ex.code.match(/```/g) || []).length;
      if (fences !== 0 && fences !== 2) err(`${tag} code 围栏数异常: ${fences}`);
    }
    (ex.samples || []).forEach((s, j) => {
      if (!Array.isArray(s) || s.length !== 2 || typeof s[0] !== 'string' || typeof s[1] !== 'string')
        err(`${tag}.samples[${j}] 必须是 [输入,输出] 二元字符串`);
    });
  });
  (d.exercises || []).forEach((ex2, i) => {
    if (!ex2.title) err(`${id}.exercise[${i}] 缺 title`);
    if (!LEVELS.includes(ex2.level)) err(`${id}.exercise[${i}] level 非法: ${ex2.level}`);
    if (typeof ex2.statement !== 'string' || !ex2.statement.trim()) err(`${id}.exercise[${i}] 缺 statement`);
  });
  (d.pitfalls || []).forEach((p2, i) => {
    if (typeof p2 !== 'string' || !p2.trim()) err(`${id}.pitfalls[${i}] 异常`);
  });
}

/* ---------- 6. TEMPLATES 结构 ---------- */
let tplN = 0;
for (const k of Object.keys(TEMPLATES || {})) {
  if (!ids.has(k)) err(`TEMPLATES key 不在大纲: ${k}`);
  TEMPLATES[k].forEach((t, i) => {
    tplN++;
    const tag = `TEMPLATES[${k}][${i}]`;
    if (!t.title) err(`${tag} 缺 title`);
    if (typeof t.code !== 'string') err(`${tag} code 非字符串`);
    else {
      const fences = (t.code.match(/```/g) || []).length;
      if (fences !== 2) err(`${tag} 围栏数应为 2，实际 ${fences}`);
      if (!/main\s*\(/.test(t.code)) err(`${tag} 无 main`);
    }
    if (t.note !== undefined && typeof t.note !== 'string') err(`${tag} note 非字符串`);
  });
}

/* ---------- 7. RELATIONS 无悬空 / 自环 / 重边 ---------- */
for (const k of Object.keys(RELATIONS || {})) {
  if (!ids.has(k)) err(`RELATIONS key 不在大纲: ${k}`);
  const seen = new Set();
  for (const v of RELATIONS[k]) {
    if (!ids.has(v)) err(`RELATIONS ${k} → 不存在的 id: ${v}`);
    if (v === k) err(`RELATIONS ${k} 自环`);
    if (seen.has(v)) err(`RELATIONS ${k} → ${v} 重复边`);
    seen.add(v);
  }
}

/* ---------- 8. QUIZ 每章一套、答案下标合法 ---------- */
const quizKeys = new Set(Object.keys(QUIZ || {}));
for (const ch of chapters) {
  if (!quizKeys.has(ch.key)) err(`章 ${ch.title}(${ch.key}) 缺 quiz`);
}
for (const qk of quizKeys) {
  const [p, c] = qk.split('-').map(Number);
  if (!OUTLINE[p - 1] || !OUTLINE[p - 1].chapters[c - 1]) err(`QUIZ key 无对应章: ${qk}`);
  (QUIZ[qk] || []).forEach((q, i) => {
    const tag = `QUIZ[${qk}][${i}]`;
    if (!q.q || typeof q.q !== 'string') err(`${tag} 缺题干 q`);
    if (!Array.isArray(q.o) || q.o.length < 2 || q.o.length > 6) err(`${tag} 选项数异常`);
    if (!(Number.isInteger(q.a) && q.a >= 0 && q.a < (q.o || []).length))
      err(`${tag} 答案下标 a 越界: ${q.a}`);
    if (!q.e || typeof q.e !== 'string') err(`${tag} 缺解析 e`);
  });
}

/* ---------- 汇总 ---------- */
console.log(`大纲知识点: ${ids.size} | 章数: ${chapters.length}`);
console.log(`模板: ${tplN} | quiz 套: ${quizKeys.size} | RELATIONS key: ${Object.keys(RELATIONS || {}).length}`);
warn.forEach((w) => console.log('  ⚠️  ' + w));
if (errors.length) {
  console.log(`\n❌ 发现 ${errors.length} 个完整性问题：`);
  errors.slice(0, 200).forEach((e) => console.log('  - ' + e));
  if (errors.length > 200) console.log(`  …以及另外 ${errors.length - 200} 个`);
  process.exit(1);
}
console.log('\n✅ 数据完整性校验全部通过：无悬空引用 / 无结构异常 / 无死链');
