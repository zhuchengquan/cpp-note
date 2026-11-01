/* ============================================================
   store.js —— 本地数据层
   所有学习数据都保存在 localStorage：
     · 学习进度  status  { topicId: 0未学 | 1学习中 | 2已掌握 }
     · 笔记      notes   { topicId: { md, updated } }
     · 设置      conf    { theme, fontSize, ai:{provider,baseUrl,key,model} }
     · AI 历史   aiChat  [{ role, content, time }]
   ============================================================ */

(function () {
  const K = {
    status: 'cppnote.status.v1',
    notes:  'cppnote.notes.v1',
    conf:   'cppnote.conf.v1',
    chat:   'cppnote.aiChat.v1',
    last:   'cppnote.lastTopic.v1',
    study:  'cppnote.study.v1',
    fav:    'cppnote.fav.v2',
    wrong:  'cppnote.wrong.v1',
    quiz:   'cppnote.quiz.v1',
    days:   'cppnote.studyDays.v1',
  };

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch (e) {
      console.warn('读取本地数据失败', key, e);
      return fallback;
    }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); }
    catch (e) { console.warn('写入本地数据失败', key, e); }
  }

  const DEFAULT_CONF = {
    theme: 'light',
    fontSize: 16,
    noteOpen: false,
    ai: { provider: 'deepseek', baseUrl: '', key: '', model: '' },
  };

  const Store = {
    /* ---------- 学习进度 ---------- */
    getAllStatus() { return read(K.status, {}); },
    getStatus(id) { return read(K.status, {})[id] || 0; },
    setStatus(id, s) {
      const m = read(K.status, {});
      m[id] = s;
      write(K.status, m);
    },
    masteredCount() {
      const m = read(K.status, {});
      return Object.values(m).filter(v => v === 2).length;
    },

    /* ---------- 笔记 ---------- */
    getAllNotes() { return read(K.notes, {}); },
    getNote(id) {
      const n = read(K.notes, {})[id];
      return n ? n.md : '';
    },
    saveNote(id, md) {
      const all = read(K.notes, {});
      if (md && md.trim()) {
        all[id] = { md, updated: Date.now() };
      } else {
        delete all[id]; // 空笔记直接删除，节省空间
      }
      write(K.notes, all);
    },
    noteCount() { return Object.keys(read(K.notes, {})).length; },

    /* ---------- 设置 ---------- */
    getConf() {
      return Object.assign({}, DEFAULT_CONF, read(K.conf, {}));
    },
    setConf(patch) {
      const c = Object.assign(this.getConf(), patch);
      write(K.conf, c);
      return c;
    },
    setAiConf(patch) {
      const c = this.getConf();
      c.ai = Object.assign({}, c.ai, patch);
      write(K.conf, c);
      return c.ai;
    },
    getAiConf() { return this.getConf().ai; },

    /* ---------- 上次学习 ---------- */
    getLast() { return read(K.last, null); },
    setLast(id) { write(K.last, id); },

    /* ---------- 连续学习打卡 ---------- */
    touchStudy() {
      const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const today = new Date();
      const key = ymd(today);
      const rec = read(K.study, { last: null, streak: 0, total: 0 });
      if (rec.last === key) return rec;
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      rec.streak = rec.last === ymd(y) ? (rec.streak || 0) + 1 : 1;
      rec.last = key;
      rec.total = (rec.total || 0) + 1;
      write(K.study, rec);
      return rec;
    },
    getStreak() { return read(K.study, { streak: 0, total: 0 }); },

    /* ---------- 学习日历（每天一条，供看板热力图与时长统计） ----------
       days: { 'YYYY-MM-DD': { t: 访问知识点次数, q: 答题数, d: 当日日期序号 } } */
    _ymd(d) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    },
    bumpDay(field, n = 1) {
      const key = this._ymd(new Date());
      const days = read(K.days, {});
      const rec = days[key] || { t: 0, q: 0 };
      rec[field] = (rec[field] || 0) + n;
      days[key] = rec;
      write(K.days, days);
      return rec;
    },
    getDays() { return read(K.days, {}); },

    /* ---------- 收藏 / 错题本 ----------
       key 规则： topicId + '|t|' + idx（模板）/ topicId + '|e|' + idx（练习） */
    toggleIn(list, key) {
      const data = read(K[list], []);
      const i = data.indexOf(key);
      if (i === -1) data.push(key); else data.splice(i, 1);
      write(K[list], data);
      return i === -1;
    },
    hasIn(list, key) { return read(K[list], []).includes(key); },
    getList(list) { return read(K[list], []); },
    removeFrom(list, key) {
      write(K[list], read(K[list], []).filter(k => k !== key));
    },
    parseKey(key) {
      const m = key.split('|');
      return { topic: m[0], type: m[1], idx: Number(m[2]) };
    },

    /* ---------- 章末测验成绩 ---------- */
    getQuizScore(chKey) {
      return read(K.quiz, {})[chKey] || null; // {score,total,date}
    },
    setQuizScore(chKey, score, total) {
      const all = read(K.quiz, {});
      const prev = all[chKey];
      if (!prev || score > prev.score)
        all[chKey] = { score, total, date: new Date().toISOString().slice(0, 10) };
      write(K.quiz, all);
    },
    allQuizScores() { return read(K.quiz, {}); },

    /* ---------- AI 对话历史 ---------- */
    getChat() { return read(K.chat, []); },
    saveChat(arr) { write(K.chat, arr.slice(-200)); }, // 最多保留 200 条
    clearChat() { localStorage.removeItem(K.chat); },

    /* ---------- 备份 / 恢复 ---------- */
    exportAll() {
      return {
        app: 'cpp-note',
        version: 1,
        time: new Date().toISOString(),
        status: read(K.status, {}),
        notes: read(K.notes, {}),
        fav: read(K.fav, []),
        wrong: read(K.wrong, []),
        quiz: read(K.quiz, {}),
        study: read(K.study, {}),
        days: read(K.days, {}),
        conf: (() => { const c = read(K.conf, {}); if (c.ai) c.ai = Object.assign({}, c.ai, { key: '' }); return c; })(),
        chat: read(K.chat, []),
      };
    },
    importAll(data, mode) {
      if (!data || data.app !== 'cpp-note') throw new Error('备份文件格式不正确');
      const merge = mode === 'merge';

      /* 学习进度：合并时同一知识点取较高状态，旧备份不能把已掌握降级 */
      if (data.status) {
        if (merge) {
          const cur = read(K.status, {});
          for (const [id, st] of Object.entries(data.status))
            cur[id] = Math.max(cur[id] || 0, st);
          write(K.status, cur);
        } else write(K.status, data.status);
      }
      if (data.notes) write(K.notes, merge ? Object.assign(read(K.notes, {}), data.notes) : data.notes);
      if (data.fav)   write(K.fav, merge ? [...new Set([...read(K.fav, []), ...data.fav])] : data.fav);
      if (data.wrong) write(K.wrong, merge ? [...new Set([...read(K.wrong, []), ...data.wrong])] : data.wrong);
      /* 测验成绩：合并时同一章保留更高分 */
      if (data.quiz) {
        if (merge) {
          const cur = read(K.quiz, {});
          for (const [ch, rec] of Object.entries(data.quiz))
            if (!cur[ch] || rec.score > cur[ch].score) cur[ch] = rec;
          write(K.quiz, cur);
        } else write(K.quiz, data.quiz);
      }
      /* 打卡：合并时保留更长 streak、更多 total、更近 last */
      if (data.study) {
        if (merge) {
          const cur = read(K.study, {}), b = data.study;
          write(K.study, {
            streak: Math.max(cur.streak || 0, b.streak || 0),
            total: Math.max(cur.total || 0, b.total || 0),
            last: (cur.last || '') >= (b.last || '') ? cur.last : b.last,
          });
        } else write(K.study, data.study);
      }
      /* 学习日历：按天合并字段求和 */
      if (data.days) {
        if (merge) {
          const cur = read(K.days, {});
          for (const [day, rec] of Object.entries(data.days)) {
            const a = cur[day] || { t: 0, q: 0 };
            cur[day] = { t: (a.t || 0) + (rec.t || 0), q: (a.q || 0) + (rec.q || 0) };
          }
          write(K.days, cur);
        } else write(K.days, data.days);
      }
      /* AI 对话：合并时拼接并按 role+content 去重，不覆盖本地近期对话 */
      if (data.chat) {
        if (merge) {
          const cur = read(K.chat, []);
          const seen = new Set(cur.map(m => m.role + '|' + m.content));
          for (const m of data.chat) {
            const k = m.role + '|' + m.content;
            if (!seen.has(k)) { seen.add(k); cur.push(m); }
          }
          write(K.chat, cur.slice(-200));
        } else write(K.chat, data.chat);
      }
      // 设置合入但不覆盖现有 API Key（备份不含 key）
      if (data.conf) {
        const cur = this.getConf();
        const incoming = data.conf;
        if (incoming.ai) incoming.ai.key = cur.ai.key;
        write(K.conf, Object.assign({}, cur, incoming, { ai: Object.assign({}, cur.ai, incoming.ai) }));
      }
    },
    resetProgress() { localStorage.removeItem(K.status); localStorage.removeItem(K.last); },
    resetAll() { Object.values(K).forEach(k => localStorage.removeItem(k)); },
  };

  window.Store = Store;
})();
