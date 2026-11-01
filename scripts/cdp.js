#!/usr/bin/env node
/* 极简但健壮的 CDP WebSocket 客户端（零依赖）：
   - 客户端→服务端始终为小的文本帧（带 mask）
   - 服务端→客户端帧不 mask，支持 16/64 位长度、continuation 分片、ping/pong */
'use strict';
const net = require('net');
const crypto = require('crypto');

function createWS(wsUrl) {
  const u = new URL(wsUrl);
  const key = crypto.randomBytes(16).toString('base64');
  const sock = net.connect(u.port, u.hostname);
  const waiters = new Map();
  const handlers = new Map();
  let nextId = 1, buf = Buffer.alloc(0), handshaken = false, frag = null;

  function sendFrame(str) {
    const payload = Buffer.from(str);
    const len = payload.length;
    let header;
    if (len < 126) header = Buffer.from([0x81, 0x80 | len]);
    else if (len < 65536) {
      header = Buffer.alloc(4); header[0] = 0x81; header[1] = 0x80 | 126; header.writeUInt16BE(len, 2);
    } else {
      header = Buffer.alloc(10); header[0] = 0x81; header[1] = 0x80 | 127; header.writeBigUInt64BE(BigInt(len), 2);
    }
    const mask = crypto.randomBytes(4);
    const masked = Buffer.alloc(len);
    for (let i = 0; i < len; i++) masked[i] = payload[i] ^ mask[i % 4];
    sock.write(Buffer.concat([header, mask, masked]));
  }
  const call = (method, params) => new Promise((resolve, reject) => {
    const id = nextId++;
    waiters.set(id, { resolve, reject });
    sendFrame(JSON.stringify({ id, method, params: params || {} }));
  });
  const on = (method, fn) => handlers.set(method, fn);

  function emitText(payload) {
    let msg;
    try { msg = JSON.parse(payload.toString('utf8')); } catch (e) { return; }
    if (msg.id && waiters.has(msg.id)) {
      const w = waiters.get(msg.id); waiters.delete(msg.id);
      msg.error ? w.reject(new Error(msg.error.message)) : w.resolve(msg.result);
    } else if (msg.method && handlers.has(msg.method)) {
      handlers.get(msg.method)(msg.params);
    }
  }

  function parse() {
    while (buf.length >= 2) {
      const b0 = buf[0], b1 = buf[1];
      const opcode = b0 & 0x0f;
      let len = b1 & 0x7f;
      let off = 2;
      if (len === 126) { if (buf.length < 4) return; len = buf.readUInt16BE(2); off = 4; }
      else if (len === 127) { if (buf.length < 10) return; len = Number(buf.readBigUInt64BE(2)); off = 10; }
      if (buf.length < off + len) return; // 等更多数据
      let payload = buf.slice(off, off + len);
      buf = buf.slice(off + len);

      if (opcode === 0x9) { // ping → pong
        const h = Buffer.from([0x8a, 0x80 | payload.length]);
        const m = crypto.randomBytes(4);
        sock.write(Buffer.concat([h, m, payload.map((v, i) => v ^ m[i % 4])]));
        continue;
      }
      if (opcode === 0x8) continue; // close
      if (opcode === 0x0) { frag = frag ? Buffer.concat([frag, payload]) : payload; continue; }
      if (opcode === 0x1) {
        const full = frag ? Buffer.concat([frag, payload]) : payload;
        frag = null;
        emitText(full);
      }
    }
  }

  return new Promise((resolve, reject) => {
    sock.on('data', (chunk) => {
      if (!handshaken) {
        buf = Buffer.concat([buf, chunk]);
        const marker = buf.indexOf('\r\n\r\n');
        if (marker >= 0) {
          handshaken = true;
          buf = buf.slice(marker + 4);
          resolve({ call, on });
          parse();
        }
        return;
      }
      buf = Buffer.concat([buf, chunk]);
      parse();
    });
    sock.on('error', reject);
    sock.write(
      `GET ${u.pathname} HTTP/1.1\r\nHost: ${u.hostname}\r\nUpgrade: websocket\r\n` +
      `Connection: Upgrade\r\nSec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n\r\n`);
  });
}

module.exports = { createWS };
