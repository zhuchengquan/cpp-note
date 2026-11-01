/* ============================================================
   stats.js —— 学习数据看板（#/stats）
   总览指标 / 各部分进度 / 近 20 周学习热力图 / 测验成绩 /
   错题与收藏 / 学习建议。所有数据仅来自本地 Store。
   ============================================================ */
(function () {
  'use strict';

  const $ = (s) => document.querySelector(s);

  function pct(a, b) { return b ? Math.round(a / b * 100) : 0; }

  /* GitHub 风格热力图：最近 weeks 列 × 7 行 */
  function heatmapHtml(days, weeks = 20) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    /* 对齐到本周一（周日=0 归到 6） */
    const dow = (today.getDay() + 6) % 7;
    const start = new Date(today); start.setDate(start.getDate() - dow - (weeks - 1) * 7);
    const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const cols = [];
    const cursor = new Date(start);
    for (let w = 0; w < weeks; w++) {
      const col = [];
      for (let d = 0; d < 7; d++) {
        const key = ymd(cursor);
        const future = cursor > today;
        const rec = days[key];
        const load = !rec ? 0 : (rec.t + rec.q * 0.5);
        col.push({ key, future, load, t: rec && rec.t, q: rec && rec.q, label: cursor.getMonth() + 1 + '/' + cursor.getDate() });
        cursor.setDate(cursor.getDate() + 1);
      }
      cols.push(col);
    }
    const level = (load) => load <= 0 ? 0 : load < 2 ? 1 : load < 5 ? 2 : load < 10 ? 3 : 4;
    const monthLabels = cols.map((col, i) => {
      const first = col[0];
      return i === 0 || (i > 0 && first.key.slice(5, 7) !== cols[i - 1][0].key.slice(5, 7))
        ? `<span style="grid-column:${i + 1}">${first.label.split('/')[0]}月</span>` : '';
    }).join('');

    const cells = cols.map((col) =>
      '<div class="hm-col">' + col.map((c) => {
        if (c.future) return '<i class="hm-cell future" title=""></i>';
        const tip = `${c.key}${c.t ? ' · 学习 ' + c.t + ' 个知识点' : ''}${c.q ? ' · 答题 ' + c.q : ''}${(!c.t && !c.q) ? ' · 未学习' : ''}`;
        return `<i class="hm-cell lv${level(c.load)}" title="${tip}"></i>`;
      }).join('') + '</div>').join('');

    const active = Object.values(days).filter((r) => (r.t || r.q)).length;
    return `
      <div class="heatmap">
        <div class="hm-months">${monthLabels}</div>
        <div class="hm-grid">${cells}</div>
        <div class="hm-legend"><span>少</span>
          <i class="hm-cell lv0"></i><i class="hm-cell lv1"></i><i class="hm-cell lv2"></i><i class="hm-cell lv3"></i><i class="hm-cell lv4"></i>
          <span>多</span><span class="hm-active">近 ${weeks * 7} 天学习 ${active} 天</span></div>
      </div>`;
  }

  /* 找出建议复习（已标"学习中"最久未掌握，或错题本中的题所属知识点） */
  function suggestions(flat) {
    const status = Store.getAllStatus();
    const studying = flat.filter((t) => status[t.id] === 1);
    const wrongKeys = Store.getList('wrong');
    const wrongTopics = new Set(wrongKeys.map((k) => k.split('|')[0]));
    const tips = [];
    if (studying.length) {
      tips.push({ icon: '🟠', text: `有 ${studying.length} 个知识点标记为「学习中」，建议尽快收尾并做章末测验：` +
        studying.slice(0, 3).map((t) => t.title).join('、') + (studying.length > 3 ? ' 等' : '') });
    }
    if (wrongTopics.size) {
      const titles = [...wrongTopics].slice(0, 3).map((id) => {
        const loc = window.findTopicLocation(id); return loc ? loc.meta.title : id;
      });
      tips.push({ icon: '❌', text: `错题本涉及 ${wrongTopics.size} 个知识点，建议优先回看：${titles.join('、')}` });
    }
    const next = flat.find((t) => status[t.id] !== 2);
    if (!studying.length && next) tips.push({ icon: '🚀', text: `继续推进新内容：下一个未掌握的知识点是《${next.title}》` });
    if (!tips.length) tips.push({ icon: '🎉', text: '全部知识点已掌握！可以用默写模式与真题精讲保持手感。' });
    return tips;
  }

  function renderStats() {
    const flat = window.flatTopics();
    const total = flat.length;
    const status = Store.getAllStatus();
    const mastered = flat.filter((t) => status[t.id] === 2).length;
    const learning = flat.filter((t) => status[t.id] === 1).length;
    const notStart = total - mastered - learning;

    const tplTotal = Object.values(window.TEMPLATES || {}).reduce((s, l) => s + l.length, 0);
    const notes = Store.getAllNotes();
    const noteN = Object.keys(notes).length;
    const favN = Store.getList('fav').length;
    const wrongN = Store.getList('wrong').length;
    const streak = Store.getStreak();
    const days = Store.getDays();
    const scores = Store.allQuizScores();
    const quizDone = Object.keys(scores).length;
    const quizFull = Object.values(scores).filter((r) => r.score === r.total).length;
    const quizTotalN = Object.keys(window.QUIZ || {}).length;
    const avgScore = quizDone ? Math.round(Object.values(scores).reduce((s, r) => s + r.score / r.total, 0) / quizDone * 100) : 0;

    document.getElementById('breadcrumb').innerHTML =
      '<a href="#/">首页</a> · <b>📊 学习数据看板</b>';

    const kpis = [
      ['📚', mastered + ' / ' + total, '已掌握知识点', pct(mastered, total)],
      ['🟠', learning, '学习中', pct(learning, total)],
      ['🔥', streak.streak || 0, '连续学习天数', null],
      ['📝', noteN, '笔记条数', null],
      ['🧩', tplTotal, '可背诵模板', null],
      ['✅', quizDone + '/' + quizTotalN, '已完成测验', quizDone ? pct(quizDone, quizTotalN) : 0],
    ];
    const kpiHtml = kpis.map(([icon, val, label, p]) => `
      <div class="stat-card">
        <div class="sc-icon">${icon}</div>
        <div class="sc-val">${val}</div>
        <div class="sc-label">${label}</div>
        ${p != null ? `<div class="sc-bar"><i style="width:${p}%"></i></div>` : ''}
      </div>`).join('');

    /* 各部分进度 */
    const partHtml = window.OUTLINE.map((p) => {
      const topics = p.chapters.flatMap((c) => c.topics);
      const m = topics.filter((t) => status[t.id] === 2).length;
      const l = topics.filter((t) => status[t.id] === 1).length;
      const pp = pct(m, topics.length);
      return `<div class="sp-row">
        <a class="sp-name" href="#/t/${(topics.find((t) => status[t.id] !== 2) || topics[0]).id}">${p.icon} ${p.title}</a>
        <div class="sp-track"><i style="width:${pp}%"></i></div>
        <span class="sp-num"><b>${m}</b>/${topics.length}${l ? ` <em>+${l}</em>` : ''}</span>
      </div>`;
    }).join('');

    /* 掌握度环形（三段状态条） */
    const seg = `
      <div class="master-seg">
        <i style="width:${pct(mastered, total)}%" class="ms-mastered" title="已掌握"></i><i style="width:${pct(learning, total)}%" class="ms-learning" title="学习中"></i><i style="width:${pct(notStart, total)}%" class="ms-none" title="未开始"></i>
      </div>
      <div class="master-legend">
        <span><i class="dot ms-mastered"></i>已掌握 ${mastered}</span>
        <span><i class="dot ms-learning"></i>学习中 ${learning}</span>
        <span><i class="dot ms-none"></i>未开始 ${notStart}</span>
      </div>`;

    /* 测验成绩列表（最佳分） */
    const quizRows = window.OUTLINE.map((part, pi) => {
      const items = part.chapters.map((ch, ci) => {
        const key = `${pi + 1}-${ci + 1}`;
        const sc = scores[key];
        const n = (window.QUIZ[key] || []).length;
        if (!n) return '';
        const ratio = sc ? sc.score / sc.total : 0;
        const cls = !sc ? 'none' : ratio === 1 ? 'full' : ratio >= 0.6 ? 'ok' : 'low';
        return `<a class="qr-item ${cls}" href="#/quiz/${key}">
          <span class="qr-title">${ch.title}</span>
          <span class="qr-score">${sc ? `${sc.score}/${sc.total}` : '未测'}</span></a>`;
      }).join('');
      return items ? `<div class="tpl-cat-title">${part.icon} ${part.title}</div><div class="quiz-result-grid">${items}</div>` : '';
    }).join('');

    const tipsHtml = suggestions(flat).map((t) =>
      `<li><span class="sg-icon">${t.icon}</span><span>${t.text}</span></li>`).join('');

    document.getElementById('content').innerHTML = `
      <div class="topic-head">
        <h1>📊 学习数据看板</h1>
        <div class="topic-meta">
          <span class="tag">累计学习 ${streak.total || 0} 天</span>
          <span>平均测验正确率 ${quizDone ? avgScore + '%' : '—'}</span>
          <span>满分测验 ${quizFull} 套</span>
          <span>错题 ${wrongN} · 收藏 ${favN}</span>
        </div>
      </div>

      <div class="stat-grid">${kpiHtml}</div>

      <div class="dash-panel">
        <h3>🎯 总体掌握度</h3>
        ${seg}
      </div>

      <div class="dash-panel">
        <h3>📅 学习活动（近 20 周）</h3>
        ${heatmapHtml(days)}
      </div>

      <div class="dash-panel">
        <h3>📚 各部分进度</h3>
        ${partHtml}
      </div>

      <div class="dash-cols">
        <div class="dash-panel">
          <h3>✅ 章末测验成绩</h3>
          <div class="qr-summary">已完成 <b>${quizDone}</b> / ${quizTotalN} 套 · 满分 <b>${quizFull}</b> 套${quizDone ? ` · 平均正确率 <b>${avgScore}%</b>` : ''}</div>
          ${quizRows}
        </div>
        <div class="dash-panel">
          <h3>💡 学习建议</h3>
          <ul class="suggest-list">${tipsHtml}</ul>
          <div class="dash-quick">
            <a class="btn-ghost" style="display:inline-block" href="#/book/wrong">❌ 错题本 (${wrongN})</a>
            <a class="btn-ghost" style="display:inline-block" href="#/drill">📝 默写挑战</a>
            <a class="btn-ghost" style="display:inline-block" href="#/quiz">📝 全部测验</a>
          </div>
        </div>
      </div>
    `;
  }

  window.StatsPage = { render: renderStats };
})();
