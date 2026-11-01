#!/usr/bin/env node
/* ============================================================
   check-syntax.js —— 对所有自有 JS 做语法检查（node --check）
   零依赖：调用子进程对每个 js 文件执行 node --check。
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SKIP = new Set(['node_modules']);

function walk(dir, out) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP.has(name) || name.startsWith('.')) continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (name.endsWith('.js') && !name.endsWith('.tmp.js')) out.push(full);
  }
  return out;
}

const files = walk(ROOT, []);
let failed = 0;
for (const f of files) {
  const r = spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' });
  if (r.status !== 0) {
    failed++;
    console.log('❌ 语法错误:', path.relative(ROOT, f));
    console.log((r.stderr || r.stdout || '').split('\n').slice(0, 8).join('\n'));
  }
}
if (failed) {
  console.log(`\n${failed} / ${files.length} 个文件语法检查失败`);
  process.exit(1);
}
console.log(`✅ 语法检查通过：${files.length} 个 JS 文件`);
