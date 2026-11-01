#!/usr/bin/env node
/* ============================================================
   make-icons.js —— 零依赖生成 PWA 图标（SVG 源 + 192/512 PNG）
   设计：蓝紫渐变底 + 白色 C++ 字形；maskable 为满版图。
   直接用 zlib 手写 PNG 编码，无需任何第三方库。
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ICON_DIR = path.join(__dirname, '..', 'icons');
fs.mkdirSync(ICON_DIR, { recursive: true });

/* ---------- SVG 源（任意尺寸矢量，浏览器/现代 PWA 直接可用） ---------- */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2563eb"/>
      <stop offset="1" stop-color="#7c3aed"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#g)"/>
  <!-- C：开口圆环 -->
  <path d="M225 132 a124 124 0 1 0 0 248 a124 124 0 0 0 0-248
           M225 205 a52 52 0 1 1 0 102 a52 52 0 0 1 0-102 z"
        fill-rule="evenodd" fill="#ffffff"/>
  <!-- 右侧开口遮罩（用底色把圆环右边截断） -->
  <path d="M300 150 L360 120 L360 392 L300 362 Z" fill="url(#g)"/>
  <!-- 两个加号 -->
  <g fill="#fde047">
    <rect x="365" y="170" width="27" height="80" rx="9"/>
    <rect x="338" y="196" width="80" height="27" rx="9"/>
    <rect x="365" y="298" width="27" height="80" rx="9"/>
    <rect x="338" y="324" width="80" height="27" rx="9"/>
  </g>
</svg>`;
fs.writeFileSync(path.join(ICON_DIR, 'icon.svg'), svg);

/* ---------- 极简像素画布 + PNG 编码 ---------- */
function createCanvas(size) {
  return { size, data: new Uint8Array(size * size * 4) };
}
function setPx(cv, x, y, r, g, b, a) {
  x = Math.round(x); y = Math.round(y);
  if (x < 0 || y < 0 || x >= cv.size || y >= cv.size) return;
  const i = (y * cv.size + x) * 4;
  /* 简单覆盖（绘制均在不透明底上） */
  cv.data[i] = r; cv.data[i + 1] = g; cv.data[i + 2] = b; cv.data[i + 3] = a == null ? 255 : a;
}
function lerp(a, b, t) { return Math.round(a + (b - a) * t); }

/* 在高倍画布上绘制，再降采样，获得抗锯齿边缘 */
const SS = 4;
function drawIcon(size, { maskable }) {
  const big = drawIconRaw(size * SS, { maskable });
  const cv = createCanvas(size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
        const i = (((y * SS) + sy) * (size * SS) + (x * SS) + sx) * 4;
        const w = big.data[i + 3] / 255;
        r += big.data[i] * w; g += big.data[i + 1] * w; b += big.data[i + 2] * w; a += big.data[i + 3];
      }
      const n = SS * SS, outA = a / n;
      const i = (y * size + x) * 4;
      if (outA > 0) {
        cv.data[i] = Math.round(r / n / (outA / 255));
        cv.data[i + 1] = Math.round(g / n / (outA / 255));
        cv.data[i + 2] = Math.round(b / n / (outA / 255));
      }
      cv.data[i + 3] = Math.round(outA);
    }
  }
  return cv;
}

function roundRectMask(S, radius, x, y) {
  if (radius <= 0) return true;
  const cx = Math.min(Math.max(x, radius), S - radius);
  const cy = Math.min(Math.max(y, radius), S - radius);
  return Math.hypot(x - cx, y - cy) <= radius;
}

function drawIconRaw(S, { maskable }) {
  const cv = createCanvas(S);
  const radius = maskable ? 0 : S * 0.22;
  const c0 = [37, 99, 235];   // #2563eb
  const c1 = [124, 58, 237];  // #7c3aed

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      if (!roundRectMask(S, radius, x, y)) { setPx(cv, x, y, 0, 0, 0, 0); continue; }
      const t = (x + y) / (2 * S);
      setPx(cv, x, y, lerp(c0[0], c1[0], t), lerp(c0[1], c1[1], t), lerp(c0[2], c1[2], t), 255);
    }
  }

  /* 白色 C：居中略偏左的圆环，右侧开口 */
  const ccx = S * 0.44, ccy = S * 0.5, R = S * 0.235, thick = S * 0.082;
  const gap0 = -Math.PI / 3.1, gap1 = Math.PI / 3.1;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const dx = x - ccx, dy = y - ccy;
      const d = Math.hypot(dx, dy);
      if (Math.abs(d - R) > thick / 2) continue;
      const ang = Math.atan2(dy, dx);
      if (ang > gap0 && ang < gap1) continue;
      setPx(cv, x, y, 255, 255, 255, 255);
    }
  }

  /* 两个黄色加号，整齐排在右侧（C++ 字形） */
  const plus = (px, py, arm, w) => {
    const half = arm / 2, hw = w / 2, rr = hw; // 端点圆角半径
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      let inside = false;
      if (Math.abs(x - px) <= half && Math.abs(y - py) <= hw) inside = true;
      if (Math.abs(x - px) <= hw && Math.abs(y - py) <= half) inside = true;
      /* 圆角端点 */
      const ends = [[px - half, py], [px + half, py], [px, py - half], [px, py + half]];
      for (const [ex, ey] of ends) {
        if (Math.hypot(Math.max(Math.abs(x - ex) - 0, 0), Math.max(Math.abs(y - ey) - 0, 0)) <= rr &&
            Math.abs(x - ex) + Math.abs(y - ey) <= arm / 2 + hw) { /* no-op keep rect */ }
      }
      if (inside) setPx(cv, x, y, 253, 224, 71, 255);
    }
  };
  plus(S * 0.735, S * 0.375, S * 0.15, S * 0.052);
  plus(S * 0.735, S * 0.625, S * 0.15, S * 0.052);

  return cv;
}

/* CRC32 */
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function encodePng(cv) {
  const S = cv.size;
  const raw = Buffer.alloc(S * (S * 4 + 1));
  for (let y = 0; y < S; y++) {
    raw[y * (S * 4 + 1)] = 0; // filter none
    Buffer.from(cv.data.buffer, y * S * 4, S * 4).copy(raw, y * (S * 4 + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(S, 0); ihdr.writeUInt32BE(S, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0; // 8-bit RGBA
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0)),
  ]);
}

for (const [name, size, maskable] of [
  ['icon-192.png', 192, false],
  ['icon-512.png', 512, false],
  ['icon-maskable-512.png', 512, true],
]) {
  fs.writeFileSync(path.join(ICON_DIR, name), encodePng(drawIcon(size, { maskable })));
  console.log('生成', name);
}
/* 180x180 apple-touch（满底，iOS 会自动加圆角） */
fs.writeFileSync(path.join(ICON_DIR, 'apple-touch-icon.png'), encodePng(drawIcon(180, { maskable: true })));
console.log('生成 apple-touch-icon.png 与 icon.svg');
