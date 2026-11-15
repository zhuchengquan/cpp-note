/* ============================================================
   app.js —— 学习手册主应用
   路由 / Markdown 渲染 / 大纲与搜索 / 进度 / 笔记 / AI 面板 / 设置
   ============================================================ */

(function () {
  'use strict';

  /* 版本号（单一事实来源；index.html 与 PWA 缓存版本同步） */
  const APP_VERSION = '1.1.3';
  window.APP_VERSION = APP_VERSION;

  /* 受控调试/自检钩子（不暴露内部数据写操作） */
  window.__app = {
    sanitizeMd: (s) => safeMd(s, true),
    applyTheme: (t) => applyTheme(t),
    getTheme: () => document.documentElement.dataset.theme,
  };

  /* 全局错误兜底：避免单点异常导致整站白屏；开发期在控制台保留详情 */
  window.addEventListener('error', (e) => {
    console.error('[app error]', e.message, e.filename, e.lineno);
    if (window.showGlobalError) {
      window.showGlobalError('页面出现一个小问题，但你可以继续学习（详情见控制台）。');
    }
  });
  window.addEventListener('unhandledrejection', (e) => {
    console.error('[unhandled promise]', e.reason);
  });

  /* ---------------- 小工具 ---------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  let toastTimer = null;
  function showToast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2200);
  }
  /* 供全局 error 监听调用（比普通 toast 停留更久） */
  window.showGlobalError = function (msg) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 5000);
  };

  function debounce(fn, ms) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      /* file:// 等非安全上下文兜底 */
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
  }

  /* ---------------- Markdown 渲染 ---------------- */

  /* 本地渲染库缺失时的极简 Markdown 兜底（保证内容永远能看）
     支持：代码围栏、标题、无序/有序列表、引用块、GFM 表格、分割线、
     行内 `代码`、**加粗**、[链接](url) */
  function fallbackMarkdown(src) {
    const lines = src.split('\n');
    let html = '', inUl = false, inOl = false, inCode = false, inQuote = false, inTable = false;
    let codeLang = '', codeBuf = [], quoteBuf = [], tableBuf = [];
    const inline = s => escapeHtml(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
    const closeList = () => {
      if (inUl) { html += '</ul>'; inUl = false; }
      if (inOl) { html += '</ol>'; inOl = false; }
    };
    const closeQuote = () => {
      if (!inQuote) return;
      html += `<blockquote>${quoteBuf.map(inline).join('<br>')}</blockquote>`;
      inQuote = false; quoteBuf = [];
    };
    const isTableSep = l => /^\s*\|?(\s*:?-{2,}:?\s*\|)+\s*:?-{0,}:?\s*\|?\s*$/.test(l);
    const flushTable = () => {
      inTable = false;
      if (tableBuf.length < 2) { tableBuf.forEach(l => { html += `<p>${inline(l)}</p>`; }); tableBuf = []; return; }
      const cells = row => row.replace(/^\s*\|/, '').replace(/\|\s*$/, '')
        .split('|').map(c => c.trim());
      const head = cells(tableBuf[0]);
      html += '<table><thead><tr>' + head.map(c => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>';
      html += tableBuf.slice(2).map(r =>
        '<tr>' + cells(r).map(c => `<td>${inline(c)}</td>`).join('') + '</tr>').join('');
      html += '</tbody></table>';
      tableBuf = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().startsWith('```')) {
        if (!inCode) {
          closeList(); closeQuote(); if (inTable) flushTable();
          inCode = true; codeLang = line.trim().slice(3) || 'cpp'; codeBuf = [];
        } else {
          html += `<pre><code class="language-${escapeHtml(codeLang)}">${codeBuf.join('\n')}</code></pre>`;
          inCode = false;
        }
        continue;
      }
      if (inCode) { codeBuf.push(escapeHtml(line)); continue; }

      /* GFM 表格：连续含 | 的行，下一行是分隔线时进入表格模式 */
      if (inTable) {
        if (line.includes('|')) { tableBuf.push(line); continue; }
        flushTable();
      } else if (line.includes('|') && isTableSep(lines[i + 1] || '')) {
        closeList(); closeQuote();
        inTable = true; tableBuf = [line];
        continue;
      }

      /* 引用块：连续 > 行合并 */
      if (/^\s*>\s?/.test(line)) {
        closeList();
        inQuote = true;
        quoteBuf.push(line.replace(/^\s*>\s?/, ''));
        continue;
      }
      closeQuote();

      const t = line.trim();
      if (t === '') { closeList(); continue; }
      if (/^([-*_])\1{2,}$/.test(t)) { closeList(); html += '<hr>'; continue; }

      let mm;
      if ((mm = t.match(/^(#{1,4})\s+(.*)$/))) {
        closeList();
        html += `<h${mm[1].length}>${inline(mm[2])}</h${mm[1].length}>`;
      } else if (/^[-*]\s+\[[ xX]\]\s+/.test(t)) {
        /* GFM 任务列表：- [ ] / - [x] */
        if (!inUl) { closeList(); html += '<ul class="task-list">'; inUl = true; }
        const box = /^[-*]\s+\[[xX]\]/.test(t) ? '☑' : '☐';
        html += `<li>${box} ${inline(t.replace(/^[-*]\s+\[[ xX]\]\s+/, ''))}</li>`;
      } else if (/^[-*]\s+/.test(t)) {
        if (!inUl) { closeList(); html += '<ul>'; inUl = true; }
        html += `<li>${inline(t.replace(/^[-*]\s+/, ''))}</li>`;
      } else if (/^\d+[.、]\s+/.test(t)) {
        if (!inOl) { closeList(); html += '<ol>'; inOl = true; }
        html += `<li>${inline(t.replace(/^\d+[.、]\s+/, ''))}</li>`;
      } else {
        closeList();
        html += `<p>${inline(line)}</p>`;
      }
    }
    closeQuote(); closeList();
    if (inTable) flushTable();
    return html;
  }

  function renderMd(src) {
    if (!src) return '';
    if (window.marked) {
      return window.marked.parse(src, { breaks: true, gfm: true });
    }
    return fallbackMarkdown(src);
  }

  /* 安全渲染：先 Markdown 再用 DOMPurify 消毒，杜绝 AI 回复 / 用户笔记 /
     备份导入内容里的 XSS。自有讲义内容是受信任的，但统一走此出口也无害
     （会保留 class、target 等，配置见下方 ALLOWED_ATTR）。
     DOMPurify 意外缺失时退化为转义 <script> 等危险标签的保守策略，绝不裸渲染。 */
  function sanitizeHtml(html) {
    if (window.DOMPurify && window.DOMPurify.sanitize) {
      return window.DOMPurify.sanitize(html, {
        ADD_ATTR: ['target', 'rel', 'class', 'id', 'data-*', 'colspan', 'rowspan', 'align'],
        FORBID_TAGS: ['style'],
      });
    }
    /* 兜底：无 DOMPurify 时去掉 script/iframe/object/事件属性（仅极端离线缺库场景） */
    return String(html)
      .replace(/<\s*(script|iframe|object|embed|link|meta)[\s\S]*?(\1)?>/gi, '')
      .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
      .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
      .replace(/javascript:/gi, '');
  }

  /* untrusted=true：内容来自 AI / 用户输入，强制消毒；
     自有讲义传 false（已由编者审核，保留排版）。 */
  function safeMd(src, untrusted) {
    const html = renderMd(src);
    return untrusted ? sanitizeHtml(html) : html;
  }

  /** 渲染后增强：代码高亮、复制按钮、语言标签、提示框配色 */
  function enhance(root) {
    /* 代码块：工具栏包裹层（语言 + 复制） */
    root.querySelectorAll('pre code').forEach(codeEl => {
      const pre = codeEl.closest('pre');
      /* 默写填空代码块含 input，禁止高亮/包裹（否则填空被销毁） */
      if (codeEl.querySelector('input.blank-input')) return;
      if (window.hljs) {
        try {
          if (!codeEl.classList.contains('hljs')) window.hljs.highlightElement(codeEl);
        } catch (e) { /* 高亮失败不影响显示 */ }
      }
      if (pre.dataset.enhanced) return;
      pre.dataset.enhanced = '1';
      const lang = (codeEl.className.match(/language-(\w+)/) || [, ''])[1];

      const wrap = document.createElement('div');
      wrap.className = 'code-wrap';
      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(pre);

      const bar = document.createElement('div');
      bar.className = 'code-bar';
      const left = document.createElement('span');
      left.className = 'bar-left';
      left.innerHTML = '<span class="bar-dots"><i></i><i></i><i></i></span>' +
        '<span class="bar-lang">' + (lang ? (lang === 'cpp' ? 'C++' : lang) : 'code') + '</span>';
      bar.appendChild(left);

      /* 只有"C++ 且含 main 的完整程序"提供在线运行：
         text/bash 等纯文本块、以及正文里的语法/待分析片段（无 main）运行只会报编译错，故仅可复制 */
      const hasMain = /\bmain\s*\(/.test(codeEl.innerText);
      const runnable = hasMain && (!lang || lang === 'cpp' || lang === 'c++' || lang === 'cc');
      if (runnable) {
        const runBtn = document.createElement('button');
        runBtn.className = 'code-run';
        runBtn.type = 'button';
        runBtn.textContent = '▶ 运行';
        runBtn.title = '在沙箱中编译运行（Wandbox 在线服务）';
        runBtn.addEventListener('click', () => openRunner(codeEl.innerText.replace(/\n$/, '')));
        bar.appendChild(runBtn);
      }

      const btn = document.createElement('button');
      btn.className = 'code-copy';
      btn.type = 'button';
      btn.innerHTML = '📋 <span>复制</span>';
      btn.addEventListener('click', async () => {
        await copyText(codeEl.innerText);
        btn.innerHTML = '✓ <span>已复制</span>';
        btn.classList.add('done');
        setTimeout(() => { btn.innerHTML = '📋 <span>复制</span>'; btn.classList.remove('done'); }, 1500);
      });
      bar.appendChild(btn);
      wrap.insertBefore(bar, pre);
    });

    /* 提示框：按开头文字着色 */
    root.querySelectorAll('blockquote').forEach(bq => {
      const head = bq.textContent.slice(0, 24);
      if (/易错|警告|注意|危险|❗|⚠️/.test(head)) bq.classList.add('warn');
      if (/坑|错误做法|不要|千万别/.test(head)) bq.classList.add('pit');
    });

    /* 外链新窗口 */
    root.querySelectorAll('a[href^="http"]').forEach(a => { a.target = '_blank'; a.rel = 'noopener'; });
  }

  /* ---------------- 大纲渲染 ---------------- */
  let currentId = null;

  function renderOutline() {
    const nav = $('#outlineNav');
    nav.innerHTML = window.OUTLINE.map(p => {
      const topics = p.chapters.flatMap(c => c.topics);
      return `
      <div class="nav-part" data-part="${p.part}">
        <button class="nav-part-title" type="button">
          ${p.icon} <span>${p.title}</span><span class="count-part"></span><span class="arrow">▼</span>
        </button>
        <div class="nav-body">
          ${p.chapters.map(c => `
            <div class="nav-chapter">
              <div class="nav-chapter-title">${c.title}</div>
              ${c.topics.map(t => {
                const s = Store.getStatus(t.id);
                return `
                <button class="nav-topic" type="button" data-id="${t.id}"
                        data-search="${escapeHtml((t.title + ' ' + (t.tags || []).join(' ')).toLowerCase())}">
                  <span class="t-dot ${s === 1 ? 'studying' : s === 2 ? 'mastered' : ''}">${s === 2 ? '✓' : ''}</span>
                  <span class="t-title">${t.title}</span>
                  <span class="t-diff">${'★'.repeat(t.diff)}</span>
                </button>`;
              }).join('')}
            </div>`).join('')}
          <div class="nav-part-progress"><i></i></div>
        </div>
      </div>`;
    }).join('');

    /* 折叠（记忆状态） */
    const collapsedParts = Store.getConf().sideCollapse || [];
    nav.querySelectorAll('.nav-part').forEach(el => {
      if (collapsedParts.includes(Number(el.dataset.part))) el.classList.add('collapsed');
    });
    nav.querySelectorAll('.nav-part-title').forEach(btn => {
      btn.addEventListener('click', () => {
        const el = btn.closest('.nav-part');
        el.classList.toggle('collapsed');
        const set = new Set(Store.getConf().sideCollapse || []);
        const p = Number(el.dataset.part);
        if (el.classList.contains('collapsed')) set.add(p); else set.delete(p);
        Store.setConf({ sideCollapse: [...set] });
      });
    });
    /* 跳转 */
    nav.querySelectorAll('.nav-topic').forEach(btn => {
      btn.addEventListener('click', () => { location.hash = '#/t/' + btn.dataset.id; });
      btn.addEventListener('dblclick', () => cycleStatus(btn.dataset.id));
    });
    updateProgressUI();
  }

  /* 展开当前知识点所在部分；仅当其在侧栏不可见时滚动 */
  function revealInNav(id) {
    if (!id) return;
    $$('.nav-part').forEach(el => {
      const has = !!el.querySelector(`.nav-topic[data-id="${CSS.escape(id)}"]`);
      if (has) el.classList.remove('collapsed');
    });
    const btn = $(`.nav-topic[data-id="${CSS.escape(id)}"]`);
    if (btn) {
      const r = btn.getBoundingClientRect();
      if (r.top < 90 || r.bottom > window.innerHeight - 20) {
        btn.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  }

  function cycleStatus(id) {
    const s = Store.getStatus(id);
    Store.setStatus(id, (s + 1) % 3);
    updateProgressUI();
    if (currentId === id) renderTopicIntoDom(id);
    showToast(['标记为：未学习', '标记为：学习中 🟠', '标记为：已掌握 🟢'][Store.getStatus(id)]);
  }

  function updateProgressUI() {
    const all = window.flatTopics();
    const mastered = Store.masteredCount();
    const pct = Math.round(mastered / all.length * 100);
    $('#footProgressText').textContent = `已掌握 ${mastered} / ${all.length}`;
    $('#footProgressBar').style.width = pct + '%';

    /* 侧栏各部分进度 */
    $$('.nav-part').forEach((el, idx) => {
      const p = window.OUTLINE[idx];
      const topics = p.chapters.flatMap(c => c.topics);
      const m = topics.filter(t => Store.getStatus(t.id) === 2).length;
      el.querySelector('.nav-part-progress i').style.width = (m / topics.length * 100) + '%';
      el.querySelector('.count-part').textContent = `${m}/${topics.length}`;
      /* 圆点状态同步 */
      el.querySelectorAll('.nav-topic').forEach(btn => {
        const st = Store.getStatus(btn.dataset.id);
        const dot = btn.querySelector('.t-dot');
        dot.className = 't-dot ' + (st === 1 ? 'studying' : st === 2 ? 'mastered' : '');
        dot.textContent = st === 2 ? '✓' : '';
      });
    });

    /* 当前页高亮 */
    $$('.nav-topic').forEach(b => {
      const on = b.dataset.id === currentId;
      b.classList.toggle('active', on);
      if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
  }

  /* 搜索过滤（标题 + 标签 + 正文全文） */
  const plainCache = {};
  function topicPlain(id) {
    if (plainCache[id] !== undefined) return plainCache[id];
    const t = window.TOPICS[id];
    if (!t) { plainCache[id] = ''; return ''; }
    let txt = [t.body, t.summary,
      ...(t.examples || []).map(e => e.title + ' ' + (e.statement || '')),
      ...(t.exercises || []).map(e => e.title),
    ].join(' ');
    txt = txt.replace(/```[\s\S]*?```/g, '代码 ')
             .replace(/[#>*`|\-!\\\[\](){}]/g, ' ')
             .toLowerCase();
    plainCache[id] = txt;
    return txt;
  }

  function bindSearch() {
    const input = $('#searchInput');
    input.addEventListener('input', () => {
      const kw = input.value.trim().toLowerCase();
      $$('.nav-topic').forEach(btn => {
        const ok = !kw || btn.dataset.search.includes(kw) || topicPlain(btn.dataset.id).includes(kw);
        btn.classList.toggle('search-hide', !ok);
      });
      /* 有搜索词时展开所有部分并隐藏无匹配章节 */
      $$('.nav-part').forEach(part => {
        part.classList.toggle('collapsed', false);
        part.querySelectorAll('.nav-chapter').forEach(ch => {
          const anyVisible = Array.from(ch.querySelectorAll('.nav-topic')).some(b => !b.classList.contains('search-hide'));
          ch.style.display = (!kw || anyVisible) ? '' : 'none';
        });
        const partVisible = Array.from(part.querySelectorAll('.nav-topic')).some(b => !b.classList.contains('search-hide'));
        part.style.display = (!kw || partVisible) ? '' : 'none';
      });
      if (!kw) {
        $$('.nav-part,.nav-chapter').forEach(e => e.style.display = '');
        const collapsed = Store.getConf().sideCollapse || [];
        $$('.nav-part').forEach(el =>
          el.classList.toggle('collapsed', collapsed.includes(Number(el.dataset.part))));
      }
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const first = $('.nav-topic:not(.search-hide)');
        if (first) first.click();
      }
    });
  }

  /* ---------------- 路由 ---------------- */
  function renderTemplatesPage(kw = '', partFilter = 0) {
    currentId = null;
    bindNoteForTopic(null, null);
    $('#breadcrumb').innerHTML = `<a href="#/">首页</a> · <b>🧩 核心模板速查</b>`;

    const groups = [];
    let total = 0;
    window.flatTopics().forEach(t => {
      const list = (window.TEMPLATES || {})[t.id];
      if (!list || !list.length) return;
      const loc = window.findTopicLocation(t.id);
      groups.push({ topic: t, loc, list });
      total += list.length;
    });

    const filterBtns = [
      [0, '全部'], [1, '🌱 入门篇'], [2, '🚀 普及篇'], [3, '🏆 提高篇'],
    ].map(([v, label]) =>
      `<button type="button" data-p="${v}" class="${partFilter === v ? 'active' : ''}">${label}</button>`).join('');

    $('#content').innerHTML = `
      <div class="tpl-page">
        <div class="topic-head"><h1>🧩 核心模板速查</h1>
          <div class="topic-meta"><span class="tag">${total} 个可背诵模板</span><span>赛前复习 · 复制即用</span></div>
        </div>
        <div class="tpl-toolbar">
          <input id="tplSearch" type="search" placeholder="搜索模板：如 Dijkstra、背包、并查集…" value="${escapeHtml(kw)}" />
          <div class="tpl-filter">${filterBtns}</div>
        </div>
        <div id="tplList"></div>
      </div>`;

    const listEl = $('#tplList');
    const draw = () => {
      const k = $('#tplSearch').value.trim().toLowerCase();
      let out = '';
      let shown = 0;
      window.OUTLINE.forEach((part, pi) => {
        if (partFilter && partFilter !== pi + 1) return;
        const cards = [];
        groups.filter(g => g.loc.part === part).forEach(g => {
          g.list.forEach((tpl, ti) => {
            const hay = (tpl.title + ' ' + (tpl.note || '') + ' ' + tpl.code + ' ' + g.topic.title).toLowerCase();
            if (k && !hay.includes(k)) return;
            shown++;
            cards.push(`
              <div class="tpl-card">
                <div class="tpl-head">
                  <span class="tpl-icon">🧩</span>${escapeHtml(tpl.title)}
                  <span class="ex-actions" style="margin-left:auto">
                    <button class="mini-act ${Store.hasIn('fav', g.topic.id+'|t|'+ti) ? 'on' : ''}" type="button"
                            data-act="fav" data-key="${g.topic.id}|t|${ti}">☆</button>
                    <button class="mini-act" type="button"
                            data-act="drill" data-topic="${g.topic.id}" data-idx="${ti}">📝 默写</button>
                    <a class="mini-act" href="#/t/${g.topic.id}">📖</a>
                  </span>
                </div>
                ${tpl.note ? `<div class="tpl-note md-body">${renderMd(tpl.note)}</div>` : ''}
                ${renderMd(tpl.code || '')}
              </div>`);
          });
        });
        if (cards.length) {
          out += `<div class="tpl-cat-title">${part.icon} ${part.title}
            <span class="tpl-cat-meta">${cards.length} 个模板</span></div>${cards.join('')}`;
        }
      });
      listEl.innerHTML = shown ? out
        : '<div class="tpl-no-hit">没有匹配的模板，换个关键词试试 🔍</div>';
      enhance(listEl);
      bindCardActions(listEl);
    };
    $('#tplSearch').addEventListener('input', draw);
    $$('.tpl-filter button').forEach(btn => btn.addEventListener('click', () => {
      const v = $('#tplSearch').value;
      renderTemplatesPage(v, Number(btn.dataset.p));
      const inp = document.getElementById('tplSearch');
      if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
    }));
    draw();
  }

  function router() {
    const hash = location.hash || '#/';
    const m = hash.match(/^#\/t\/([\w-]+)/);
    const qm = hash.match(/^#\/quiz\/?([\w-]+)/);
    $('#runnerPanel').classList.remove('open');
    if (hash === '#/tpl') {
      currentId = null;
      renderTemplatesPage();
    } else if (hash === '#/stats') {
      currentId = null;
      window.StatsPage.render();
      bindNoteForTopic(null, null);
    } else if (hash === '#/book' || hash === '#/book/fav' || hash === '#/book/wrong') {
      currentId = null;
      renderBook(hash.endsWith('wrong') ? 'wrong' : 'fav');
    } else if (hash === '#/drill') {
      currentId = null;
      renderDrillPage();
    } else if (hash === '#/quiz' || hash === '#/quiz/') {
      currentId = null;
      renderQuizHome();
    } else if (qm) {
      currentId = null;
      renderQuiz(qm[1]);
    } else if (m) {
      currentId = m[1];
      renderTopic(m[1]);
    } else {
      currentId = null;
      renderHome();
    }
    updateProgressUI();
    closeSidebarMobile();
    window.scrollTo(0, 0);
  }

  /* ---------------- 首页 ---------------- */
  function renderHome() {
    const all = window.flatTopics();
    const mastered = Store.masteredCount();
    const pct = Math.round(mastered / all.length * 100);
    const last = Store.getLast();
    const noteN = Store.noteCount();
    const streak = Store.getStreak();
    const tplTotal = Object.values(window.TEMPLATES || {}).reduce((s, l) => s + l.length, 0);

    $('#breadcrumb').innerHTML = '🏠 <b>首页</b>';

    $('#content').innerHTML = `
      <div class="hero">
        <h1>信息学 C++ 学习手册</h1>
        <p>面向 CSP-J / CSP-S 信奥学员的系统化讲义：${all.length} 个知识点 · 大量带注释代码 · 例题精讲 · 课后练习 · 个人笔记 · AI 私教答疑。跟着大纲走，从零基础走到提高组。</p>
        <div class="hero-actions">
          ${last ? `<a class="btn-white" href="#/t/${last}">▶ 继续学习：${locTitle(last)}</a>`
                 : `<a class="btn-white" href="#/t/intro-oi">🚀 从零开始学习</a>`}
          <a class="btn-outline-w" href="#/tpl">🧩 模板速查${tplTotal ? ` · ${tplTotal}` : ''}</a>
          <button class="btn-outline-w" id="homeAiBtn">🤖 向 AI 私教提问</button>
          ${streak.streak >= 2 ? `<span class="streak-badge">🔥 连续学习 ${streak.streak} 天</span>` : ''}
        </div>
        <div class="hero-progress">
          <div class="hp-label"><span>总体掌握进度</span><span>${mastered} / ${all.length}（${pct}%）${noteN ? ` · 已记 ${noteN} 条笔记` : ''}</span></div>
          <div class="hp-bar"><i style="width:${pct}%"></i></div>
        </div>
      </div>

      <div class="section-title">📚 课程大纲</div>
      <div class="part-grid">
        ${window.OUTLINE.map(p => {
          const topics = p.chapters.flatMap(c => c.topics);
          const m = topics.filter(t => Store.getStatus(t.id) === 2).length;
          const firstUndone = topics.find(t => Store.getStatus(t.id) !== 2) || topics[0];
          return `
          <a class="part-card" href="#/t/${firstUndone.id}">
            <div class="pc-icon">${p.icon}</div>
            <h3>${p.title}</h3>
            <p>${p.desc}</p>
            <div class="pc-bar"><i style="width:${Math.round(m / topics.length * 100)}%"></i></div>
            <div class="pc-meta"><span>${p.chapters.length} 章 · ${topics.length} 个知识点</span><b>${m}/${topics.length} 已掌握</b></div>
          </a>`;
        }).join('')}
      </div>

      <div class="section-title">🎯 巩固与自测</div>
      <div class="part-grid">
        <a class="part-card" href="#/stats">
          <div class="pc-icon">📊</div>
          <h3>学习数据看板</h3>
          <p>掌握度总览 · 近 20 周学习热力图 · 各部分进度 · 测验成绩与个性化复习建议</p>
        </a>
        <a class="part-card" href="#/quiz">
          <div class="pc-icon">📝</div>
          <h3>章末测验</h3>
          <p>${Object.keys(window.QUIZ || {}).length} 套卷子 · 选择即判分、附解析，最佳成绩自动记录</p>
        </a>
        <a class="part-card" href="#/drill">
          <div class="pc-icon">📝</div>
          <h3>背模板默写</h3>
          <p>${tplTotal} 个核心模板随机抽测，关键标识符挖空，检查你是否真能默写出来</p>
        </a>
        <a class="part-card" href="#/book">
          <div class="pc-icon">⭐</div>
          <h3>收藏与错题</h3>
          <p>收藏练习题与模板，标记做错的题，考前集中复习</p>
        </a>
      </div>

      <div class="section-title">🧭 怎么使用这本手册</div>
      <div class="steps-grid">
        ${[
          ['1', '📖 读讲义', '按大纲顺序阅读，每个概念都配有可运行的 C++ 代码'],
          ['2', '🧪 看例题', '先自己想 3 分钟，再展开题解对照思路与代码'],
          ['3', '✏️ 做练习', '课后练习只给提示不给答案，逼自己独立完成'],
          ['4', '📝 记笔记', '右侧笔记栏随时记录，自动保存在本机、可导出'],
          ['5', '🤖 问 AI', '卡住就让 AI 私教讲解代码、举一反三出题'],
          ['6', '✅ 标掌握', '双击侧栏圆点或页面顶部按钮标记学习状态'],
        ].map(([n, t, d]) => `
          <div class="step-item"><span class="step-num">${n}</span><h4>${t}</h4><p>${d}</p></div>
        `).join('')}
      </div>

      <div class="section-title">🗺️ 信奥学习路线建议</div>
      <div class="roadmap md-body">
        <ol>
          <li><b>第 1 阶段（1~3 个月）入门篇：</b>吃透语法与三种结构，能手写排序、枚举模拟题，目标校内/CSP-J 选择题。</li>
          <li><b>第 2 阶段（3~6 个月）普及算法：</b>排序、贪心、二分、递归分治、前缀和、搜索与入门 DP，刷完洛谷入门→普及−。</li>
          <li><b>第 3 阶段（6~12 个月）CSP-J 冲刺：</b>背包/线性 DP、BFS/DFS、数学基础、栈队列树，目标 CSP-J 一等奖。</li>
          <li><b>第 4 阶段（1 年以上）CSP-S：</b>图论全家桶、线段树/树状数组、高级 DP、数论组合，目标 CSP-S 一等/NOIP 获奖。</li>
        </ol>
        <blockquote><strong>💡 建议：</strong>看懂 ≠ 会写。每个知识点至少独立敲完 3 道题，代码不看题解能复现，才算真正掌握。</blockquote>
      </div>
    `;
    $('#homeAiBtn').addEventListener('click', () => openAi());
    bindNoteForTopic(null);
  }

  function locTitle(id) {
    const loc = window.findTopicLocation(id);
    return loc ? loc.meta.title : '';
  }

  /* ---------------- 知识点页 ---------------- */
  function renderTopic(id) {
    const loc = window.findTopicLocation(id);
    const content = $('#content');
    if (!loc) {
      content.innerHTML = `<div class="placeholder-box"><div class="ph-icon">🤔</div><h2>找不到这个知识点</h2>
        <p>地址可能有误。</p><div class="ph-actions"><a class="btn-primary" style="display:inline-block" href="#/">返回首页</a></div></div>`;
      return;
    }
    Store.setLast(id);
    Store.touchStudy();
    Store.bumpDay('t', 1);
    renderTopicIntoDom(id);
  }

  function renderTopicIntoDom(id) {
    const loc = window.findTopicLocation(id);
    if (!loc) return;
    const { part, chapter, meta } = loc;
    const data = window.TOPICS[id];
    const s = Store.getStatus(id);

    $('#breadcrumb').innerHTML =
      `<a href="#/">首页</a> · ${part.icon} ${part.title} · <span>${chapter.title}</span> · <b>${meta.title}</b>`;

    const headHtml = `
      <div class="topic-head">
        <h1>${meta.title}</h1>
        <div class="topic-meta">
          <span class="diff-stars">难度 ${'★'.repeat(meta.diff)}${'☆'.repeat(5 - meta.diff)}</span>
          <span>🕐 ${data && data.time ? data.time : '约 20 分钟'}</span>
          ${(meta.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}
          <span class="status-switch" role="group" title="标记学习状态（侧栏双击圆点也行）">
            <button type="button" data-s="0" class="${s === 0 ? 'on' : ''}">○ 未学</button>
            <button type="button" data-s="1" class="${s === 1 ? 'on' : ''}">🟠 学习中</button>
            <button type="button" data-s="2" class="${s === 2 ? 'on' : ''}">🟢 已掌握</button>
          </span>
        </div>
      </div>`;

    let bodyHtml;
    if (data) {
      const tplList = (window.TEMPLATES || {})[id];
      bodyHtml = `
        <article class="md-body">${renderMd(data.body || '')}</article>
        ${tplList && tplList.length ? templatesBlockHtml(tplList, id) : ''}
        ${data.examples && data.examples.length ? `
          <h2 class="block-head">🧪 例题精讲 <span class="count-badge">${data.examples.length} 道</span></h2>
          ${data.examples.map((ex, i) => exampleHtml(ex, i)).join('')}
        ` : ''}
        ${data.pitfalls && data.pitfalls.length ? pitfallsHtml(data.pitfalls) : ''}
        ${data.exercises && data.exercises.length ? `
          <h2 class="block-head">🎯 课后练习 <span class="count-badge">${data.exercises.length} 道</span></h2>
          ${data.exercises.map((ex, i) => exerciseHtml(ex, i, meta, id)).join('')}
        ` : ''}
        ${data.summary ? `<div class="summary-box md-body"><h3>📌 本知识点小结</h3>${renderMd(data.summary)}</div>` : ''}
        ${quizEntryHtml(id)}
        ${relationsHtml(id)}
      `;
    } else {
      bodyHtml = placeholderHtml(loc);
    }

    bodyHtml += pagerHtml(id);
    $('#content').innerHTML = headHtml + bodyHtml;
    enhance($('#content'));
    bindCardActions($('#content'));

    /* 状态切换 */
    $$('.status-switch button').forEach(btn => {
      btn.addEventListener('click', () => {
        Store.setStatus(id, Number(btn.dataset.s));
        updateProgressUI();
        renderTopicIntoDom(id);
      });
    });

    /* 例题中的"问 AI" */
    $$('.ask-ai-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        openAi();
        appendUserPrompt(btn.dataset.prompt);
      });
    });

    /* 占位页：让 AI 先讲解 */
    const phBtn = $('#phAiBtn');
    if (phBtn) phBtn.addEventListener('click', () => {
      openAi();
      appendUserPrompt(`手册里《${meta.title}》的讲义还没写，请系统地给我讲解：概念、原理、C++ 代码模板、一道带完整题解的例题。`);
    });

    bindNoteForTopic(id, meta);
    currentId = id;
    updateProgressUI();
    revealInNav(id);
  }

  /* ---------- 例题卡片 ---------- */
  function exampleHtml(ex, i) {
    const samples = (ex.samples || []).map(([sin, sout]) => `
      <div class="io-grid">
        <div class="io-box"><h5>样例输入</h5><pre>${escapeHtml(sin)}</pre></div>
        <div class="io-box"><h5>样例输出</h5><pre>${escapeHtml(sout)}</pre></div>
      </div>`).join('');
    let code = ex.code || '';
    if (code && !code.includes('```')) code = '```cpp\n' + code.replace(/^\n+|\n+$/g, '') + '\n```';
    const hasSol = ex.analysis || code;
    return `
    <div class="example-card${ex.source ? ' is-real' : ''}">
      <div class="ex-head">📖 例 ${i + 1}：${ex.title}
        <span class="ex-level lv-${ex.level || '基础'}">${ex.level || '基础'}</span>
        ${ex.source ? `<span class="ex-source" title="真题/经典名题来源">🏆 ${escapeHtml(ex.source)}</span>` : ''}
      </div>
      <div class="ex-body">
        ${ex.statement ? `<div class="md-body">${renderMd(ex.statement)}</div>` : ''}
        ${ex.input ? `<div class="io-box" style="margin-top:10px"><h5>输入格式</h5><div class="md-body" style="padding:10px 12px">${renderMd(ex.input)}</div></div>` : ''}
        ${ex.output ? `<div class="io-box" style="margin-top:10px"><h5>输出格式</h5><div class="md-body" style="padding:10px 12px">${renderMd(ex.output)}</div></div>` : ''}
        ${samples}
        ${ex.hint ? `<div class="md-body"><blockquote>${renderMd(ex.hint)}</blockquote></div>` : ''}
        ${hasSol ? `
        <details>
          <summary>先自己动手做一做，再点这里看完整题解与参考代码</summary>
          <div class="ex-solution-body md-body">
            ${ex.analysis ? renderMd(ex.analysis) : ''}
            ${code ? renderMd(code) : ''}
          </div>
        </details>` : ''}
      </div>
    </div>`;
  }

  function pitfallsHtml(items) {
    return `
    <h2 class="block-head">⚠️ 易错点与避坑指南</h2>
    <div class="pitfalls-box md-body">
      <h3>这些错误新手最容易犯：</h3>
      <ul>${items.map(p => `<li>${renderMdInline(p)}</li>`).join('')}</ul>
    </div>`;
  }

  function exerciseHtml(ex, i, meta, topicId) {
    const prompt =
      `我在做《${meta.title}》的练习题「${ex.title}」，题目如下：\n\n${ex.statement.replace(/[#*`>/]/g, '').slice(0, 600)}\n\n` +
      `请先不要给完整答案，给我一些思路提示和需要注意的数据范围、边界条件；如果我追问再给代码。`;
    const favKey = `${topicId}|e|${i}`;
    return `
    <div class="exercise-card">
      <div class="ex-head">🎯 练习 ${i + 1}：${ex.title}
        <span class="ex-level lv-${ex.level || '基础'}">${ex.level || '基础'}</span>
        <span class="ex-actions">
          <button class="mini-act ${Store.hasIn('fav', favKey) ? 'on' : ''}" type="button"
                  data-act="fav" data-key="${favKey}" title="收藏到我的收藏本">☆ 收藏</button>
          <button class="mini-act wrong ${Store.hasIn('wrong', favKey) ? 'on' : ''}" type="button"
                  data-act="wrong" data-key="${favKey}" title="标记为错题，方便复习">✗ 错题</button>
          <button class="ask-ai-btn" type="button" data-prompt="${escapeHtml(prompt)}">🤖 提示</button>
        </span>
      </div>
      <div class="exercise-statement md-body">${renderMd(ex.statement)}</div>
      ${ex.hint ? `<details><summary></summary><div class="md-body" style="padding:6px 0">${renderMd(ex.hint)}</div></details>` : ''}
    </div>`;
  }

  /* 行内片段：允许 **加粗** 与 `代码` */
  function renderMdInline(s) {
    return renderMd(s).replace(/^<\/?p[^>]*>|<\/p>$/g, '').replace(/<\/?p>/g, '');
  }

  function pagerHtml(id) {
    const flat = window.flatTopics();
    const idx = flat.findIndex(t => t.id === id);
    const prev = idx > 0 ? flat[idx - 1] : null;
    const next = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null;
    return `
    <nav class="pager">
      ${prev ? `<a class="prev" href="#/t/${prev.id}"><span>← 上一个知识点</span>${prev.title}</a>` : '<a class="disabled"></a>'}
      ${next ? `<a class="next" href="#/t/${next.id}"><span>下一个知识点 →</span>${next.title}</a>` : '<a class="disabled"></a>'}
    </nav>`;
  }

  /* ---------- 核心模板速记区块（知识点页，默认折叠） ---------- */
  function tplActionsHtml(topicId, i) {
    const key = `${topicId}|t|${i}`;
    return `<span class="ex-actions">
      <button class="mini-act ${Store.hasIn('fav', key) ? 'on' : ''}" type="button"
              data-act="fav" data-key="${key}">☆ 收藏</button>
      <button class="mini-act" type="button"
              data-act="drill" data-topic="${topicId}" data-idx="${i}">📝 默写</button>
    </span>`;
  }

  function templatesBlockHtml(list, topicId) {
    const cards = list.map((t, i) => `
      <div class="tpl-card" data-tplcard="${topicId}-${i}">
        <div class="tpl-head"><span class="tpl-icon">🧩</span>${escapeHtml(t.title)}${tplActionsHtml(topicId, i)}</div>
        ${t.note ? `<div class="tpl-note md-body">${renderMd(t.note)}</div>` : ''}
        ${renderMd(t.code || '')}
      </div>`).join('');
    return `
      <details class="tpl-block" open>
        <summary>🧩 核心模板速记<span class="tpl-count">${list.length}</span></summary>
        <div class="tpl-body">${cards}</div>
      </details>`;
  }

  /* ---------- 知识图谱：先修 / 后续 ---------- */
  function relationsHtml(id) {
    const R = window.RELATIONS || {};
    const pre = R[id] || [];
    const next = Object.keys(R).filter(k => (R[k] || []).includes(id));
    const chip = rid => {
      const loc = window.findTopicLocation(rid);
      return loc ? `<a class="rel-chip" href="#/t/${rid}">${loc.meta.title}</a>` : '';
    };
    if (!pre.length && !next.length) return '';
    return `
    <div class="rel-nav">
      <div class="rel-group">
        <h4>📐 先修知识</h4>
        ${pre.length ? pre.map(chip).join('') : '<span class="rel-empty">无，可直接学习</span>'}
      </div>
      <div class="rel-group">
        <h4>🚀 后续延伸</h4>
        ${next.length ? next.map(chip).join('') : '<span class="rel-empty">无</span>'}
      </div>
    </div>`;
  }

  /* 未编写内容的占位页 */
  function placeholderHtml(loc) {
    const { meta, chapter, part } = loc;
    return `
    <div class="placeholder-box">
      <div class="ph-icon">🚧</div>
      <h2>《${meta.title}》详细讲义编写中</h2>
      <p style="color:var(--muted)">${part.icon} ${part.title} · ${chapter.title}</p>
      <p style="margin-top:10px">本知识点将涵盖：</p>
      <ul style="text-align:left;max-width:560px;margin:14px auto">
        <li>${meta.preview || '内容筹备中'}</li>
        <li>概念详解 + 带详细中文注释的代码模板</li>
        <li>多道由易到难的例题（含思路分析与参考代码）</li>
        <li>易错点总结与课后练习</li>
      </ul>
      <p style="font-size:13px;color:var(--muted)">不必等待 —— 配置好 API Key 后，可以先让 AI 私教给你系统讲解这个知识点。</p>
      <div class="ph-actions">
        <button class="btn-primary" id="phAiBtn" type="button">🤖 让 AI 先给我讲讲</button>
        <a class="btn-ghost" style="display:inline-block" href="#/">← 回首页选别的</a>
      </div>
    </div>`;
  }

  /* ---------------- 笔记面板 ---------------- */
  let noteTopicId = null;
  const noteSaveDebounced = debounce(() => {
    if (!noteTopicId) return;
    Store.saveNote(noteTopicId, $('#noteEditor').value);
    $('#noteStatus').textContent = '✓ 已自动保存 ' + new Date().toLocaleTimeString();
  }, 450);

  function bindNoteForTopic(id, meta) {
    noteTopicId = id;
    const editor = $('#noteEditor');
    const preview = $('#notePreview');
    /* 切换知识点时统一回到编辑视图，避免上一个知识点停在预览模式造成按钮标签与视图不符 */
    editor.hidden = false;
    preview.hidden = true;
    if (!id) {
      editor.disabled = true;
      editor.value = '';
      preview.innerHTML = '<p style="color:var(--muted);padding:20px">在首页无法记笔记，请先打开一个知识点。</p>';
      $('#noteSub').textContent = '打开任意知识点即可开始记录';
      return;
    }
    editor.disabled = false;
    editor.value = Store.getNote(id);
    preview.innerHTML = editor.value.trim() ? safeMd(editor.value, true) : '<p style="color:var(--muted)">还没有笔记，点击右上角「预览」可切换回编辑模式。</p>';
    enhance(preview);
    $('#noteSub').textContent = '当前笔记属于：' + meta.title + '（自动保存）';
    $('#noteStatus').textContent = editor.value ? '上次记录：' + new Date((Store.getAllNotes()[id] || {}).updated || Date.now()).toLocaleString() : '未开始记录';
    $('#noteModeBtn').textContent = '预览';
  }

  function initNotePanel() {
    $('#noteEditor').addEventListener('input', () => {
      $('#noteStatus').textContent = '保存中…';
      noteSaveDebounced();
    });
    $('#noteModeBtn').addEventListener('click', () => {
      const editor = $('#noteEditor');
      const preview = $('#notePreview');
      const editing = !editor.hidden;
      if (editing) {
        Store.saveNote(noteTopicId, editor.value);
        $('#noteStatus').textContent = '✓ 已保存 ' + new Date().toLocaleTimeString();
        preview.innerHTML = editor.value.trim()
          ? safeMd(editor.value, true)
          : '<p style="color:var(--muted)">还没有笔记内容。</p>';
        enhance(preview);
        editor.hidden = true;
        preview.hidden = false;
        $('#noteModeBtn').textContent = '编辑';
      } else {
        preview.hidden = true;
        editor.hidden = false;
        $('#noteModeBtn').textContent = '预览';
        editor.focus();
      }
    });
    $('#noteToggleBtn').addEventListener('click', toggleNotePanel);
    $('#noteCloseBtn').addEventListener('click', () => document.body.classList.remove('note-open'));
  }

  function toggleNotePanel() {
    const open = document.body.classList.toggle('note-open');
    Store.setConf({ noteOpen: open });
    if (open) setTimeout(() => $('#noteEditor').focus(), 260);
  }

  /* ---------------- AI 面板 ---------------- */
  let aiMessages = [];
  let aiBusy = false;
  let aiAbort = null;
  let aiRenderTimer = null;

  function initAi() {
    aiMessages = Store.getChat();
    $('#aiFab').addEventListener('click', openAi);
    $('#aiCloseBtn').addEventListener('click', closeAi);
    $('#aiClearBtn').addEventListener('click', () => {
      aiMessages = [];
      Store.clearChat();
      renderAiMessages(true);
      showToast('对话已清空');
    });
    $('#aiSendBtn').addEventListener('click', sendAi);
    $('#aiStopBtn').addEventListener('click', () => { if (aiAbort) aiAbort.abort(); });
    $('#aiInput').addEventListener('keydown', e => {
      // isComposing：中文输入法正在组词时按 Enter 是确认候选字，不能当发送
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); sendAi(); }
    });
    renderAiMessages(true);
  }

  function openAi() {
    $('#aiPanel').hidden = false;
    document.body.classList.add('ai-open');
    const ai = Store.getAiConf();
    const provider = AI.PROVIDERS.find(p => p.id === ai.provider);
    $('#aiProviderTag').textContent = ai.key
      ? (provider ? provider.name.split('（')[0] : '已配置')
      : '未配置 Key';
    renderAiChips();
    setTimeout(() => $('#aiInput').focus(), 100);
  }
  function closeAi() {
    $('#aiPanel').hidden = true;
    document.body.classList.remove('ai-open');
  }

  function currentAiContext() {
    if (!currentId) return null;
    const loc = window.findTopicLocation(currentId);
    if (!loc) return null;
    return {
      topic: loc.meta,
      partTitle: loc.part.title,
      chapterTitle: loc.chapter.title,
      hasContent: !!window.TOPICS[currentId],
    };
  }

  function renderAiChips() {
    const box = $('#aiQuick');
    let chips;
    const ctx = currentAiContext();
    if (ctx) {
      chips = [
        { t: '🦞 通俗讲一遍', send: `请用最通俗的语言、配生活类比，把《${ctx.topic.title}》给一个零基础学员讲一遍，最后给一段最小可运行示例代码。` },
        { t: '📝 出 3 道练习', send: `根据《${ctx.topic.title}》给我出 3 道由易到难的练习题（给题目、数据范围、样例，先不要给答案）。` },
        { t: '⚠️ 易错点', send: `总结《${ctx.topic.title}》在竞赛中最容易丢分的 5 个易错点，每个配一小段错误代码和改正方法。` },
        { t: '🔍 检查我的代码', focus: true },
      ];
      if (!ctx.hasContent) {
        chips.unshift({ t: '📖 先给我讲这个知识点', send: `手册里《${ctx.topic.title}》的讲义还没写，请系统地给我讲解：概念、原理、C++ 代码模板、一道带完整题解的例题。` });
      }
    } else {
      chips = [
        { t: '🧭 制定学习计划', send: '我是零基础，想参加一年后的 CSP-J，请帮我制定一份按月的学习计划。' },
        { t: '🔍 检查我的代码', focus: true },
      ];
    }
    box.innerHTML = '';
    chips.forEach(c => {
      const b = document.createElement('button');
      b.className = 'ai-chip';
      b.type = 'button';
      b.textContent = c.t;
      b.addEventListener('click', () => {
        if (c.focus) {
          const ta = $('#aiInput');
          ta.placeholder = '把你的代码或报错信息粘贴到这里，然后按 Enter 发送…';
          ta.focus();
          showToast('请把代码粘贴到输入框');
        } else {
          appendUserPrompt(c.send);
        }
      });
      box.appendChild(b);
    });
  }

  function renderAiMessages(resetWelcome) {
    const box = $('#aiMessages');
    box.innerHTML = '';
    if (!aiMessages.length) {
      box.innerHTML = `
        <div class="ai-welcome">
          <span class="big">🤖</span>
          <b>你的专属信息学私教</b>
          <p>我懂 CSP-J/S 全部知识点。可以让我：<br>
          通俗讲解 · 逐行分析代码 · 找 Bug · 举一反三出题 · 讲题但不直接喂答案</p>
          <p style="margin-top:10px;font-size:12px">${Store.getAiConf().key ? '✅ 已配置 API Key' : '⚠️ 还未配置 API Key，点右上角 ⚙️ 设置即可，Key 只存在你的电脑上'}</p>
        </div>`;
      return;
    }
    aiMessages.forEach(m => appendAiBubble(m.role, m.content, false));
    box.scrollTop = box.scrollHeight;
  }

  function appendAiBubble(role, content, scroll = true) {
    const box = $('#aiMessages');
    /* 清除欢迎语 */
    const w = box.querySelector('.ai-welcome');
    if (w) w.remove();
    const wrap = document.createElement('div');
    wrap.className = 'ai-msg ' + (role === 'user' ? 'user' : 'ai');
    wrap.innerHTML = `<span class="avatar">${role === 'user' ? '🧑‍🎓' : '🤖'}</span>
      <div class="ai-bubble ${role === 'assistant' ? 'md-body' : ''}"></div>`;
    const bubble = wrap.querySelector('.ai-bubble');
    if (role === 'assistant') bubble.innerHTML = safeMd(content, true); // AI 内容不可信，消毒
    else bubble.textContent = content;
    box.appendChild(wrap);
    if (role === 'assistant') enhance(bubble);
    if (scroll) box.scrollTop = box.scrollHeight;
    return wrap;
  }

  function appendUserPrompt(text) {
    $('#aiInput').value = text;
    sendAi();
  }

  async function sendAi() {
    if (aiBusy) return;
    const input = $('#aiInput');
    const text = input.value.trim();
    if (!text) { input.focus(); return; }

    const aiConf = Store.getAiConf();
    if (!aiConf.key) {
      openAi();
      const errWrap = appendAiBubble('assistant', '**还没有配置 API Key**，我还不能开口回答哦。\n\n请点击页面右上角 **⚙️ 设置 → 🤖 AI 私教**，选择服务商并填入 Key（只保存在你的浏览器中）。配置好后再问我一次！');
      errWrap.classList.add('error');
      return;
    }

    input.value = '';
    aiMessages.push({ role: 'user', content: text });
    Store.saveChat(aiMessages);
    appendAiBubble('user', text);

    /* 组装请求：系统提示 + 最近 14 条历史；过滤空内容（旧版可能存过空回复，会触发部分服务商 400） */
    const sys = AI.systemPrompt(currentAiContext());
    const history = aiMessages.slice(-15, -1)
      .filter(m => m.content && m.content.trim())
      .map(m => ({ role: m.role, content: m.content }));
    const payload = [{ role: 'system', content: sys }, ...history, { role: 'user', content: text }];

    /* 气泡 + 打字状态 */
    const wrap = appendAiBubble('assistant', '');
    const bubble = wrap.querySelector('.ai-bubble');
    bubble.classList.add('ai-typing');
    setAiSending(true);

    let answer = '';
    aiAbort = new AbortController();
    let lastPaint = 0;

    try {
      answer = await AI.chat(payload, {
        signal: aiAbort.signal,
        onDelta: (_piece, full) => {
          answer = full;
          const now = Date.now();
          if (now - lastPaint > 120) {
            lastPaint = now;
            bubble.innerHTML = safeMd(full, true) + '<span class="ai-caret"></span>';
            $('#aiMessages').scrollTop = $('#aiMessages').scrollHeight;
          }
        },
      });
      bubble.classList.remove('ai-typing');
      if (!answer.trim()) {
        /* 空回复（内容过滤/模型异常）：提示并丢弃，绝不持久化空 assistant 消息 */
        wrap.classList.add('error');
        bubble.innerHTML = safeMd('⚠️ **这次没有返回内容**：可能触发了服务商的内容过滤，或模型暂时异常。换个问法再试一次。', true);
        enhance(bubble);
        return;
      }
      bubble.innerHTML = safeMd(answer, true);
      enhance(bubble);
      aiMessages.push({ role: 'assistant', content: answer });
      Store.saveChat(aiMessages);
    } catch (e) {
      bubble.classList.remove('ai-typing');
      if (e.name === 'AbortError') {
        if (answer) {
          bubble.innerHTML = safeMd(answer, true) + '\n\n<blockquote>⏹️ 已停止生成</blockquote>';
          enhance(bubble);
          aiMessages.push({ role: 'assistant', content: answer + '\n\n（已停止生成）' });
          Store.saveChat(aiMessages);
        } else {
          wrap.remove();
        }
      } else {
        wrap.classList.add('error');
        bubble.innerHTML = `❌ **出错了**：${escapeHtml(e.message)}
          <br><br>👉 请检查 ⚙️ 设置中的服务商、Key 与模型名；` +
          (e.code === 'NETWORK' ? '若在 file:// 下被浏览器拦截，可在项目目录运行 <code>python -m http.server</code> 后访问 localhost。' : '余额不足也会报错。');
      }
    } finally {
      setAiSending(false);
      aiAbort = null;
      $('#aiMessages').scrollTop = $('#aiMessages').scrollHeight;
    }
  }

  function setAiSending(busy) {
    aiBusy = busy;
    $('#aiSendBtn').hidden = busy;
    $('#aiStopBtn').hidden = !busy;
    $('#aiInput').disabled = busy;
  }

  /* ---------------- 设置弹窗 ---------------- */
  function initSettings() {
    const mask = $('#modalMask');
    const open = () => { mask.hidden = false; refreshDataStats(); };
    $('#settingsBtn').addEventListener('click', open);
    $('#modalCloseBtn').addEventListener('click', () => { mask.hidden = true; });
    mask.addEventListener('click', e => { if (e.target === mask) mask.hidden = true; });

    /* Tabs */
    $$('.tab-btn').forEach(btn => btn.addEventListener('click', () => {
      $$('.tab-btn').forEach(b => b.classList.toggle('active', b === btn));
      $$('.tab-pane').forEach(p => p.classList.toggle('active', p.dataset.pane === btn.dataset.tab));
    }));

    /* AI 服务商 */
    const sel = $('#aiProvider');
    sel.innerHTML = AI.PROVIDERS.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    const conf = Store.getAiConf();
    sel.value = conf.provider;
    if (!conf.baseUrl) fillProvider(sel.value);
    else { $('#aiBaseUrl').value = conf.baseUrl; $('#aiModel').value = conf.model; $('#aiKey').value = conf.key; }

    sel.addEventListener('change', () => {
      fillProvider(sel.value);
      persistAi();
    });
    ['aiBaseUrl', 'aiModel', 'aiKey'].forEach(id => $('#' + id).addEventListener('input', persistAi));

    $('#aiKeyEye').addEventListener('click', () => {
      const k = $('#aiKey');
      k.type = k.type === 'password' ? 'text' : 'password';
      $('#aiKeyEye').textContent = k.type === 'password' ? '显示' : '隐藏';
    });

    $('#aiTestBtn').addEventListener('click', async () => {
      const r = $('#aiTestResult');
      r.textContent = '测试中…';
      r.className = 'test-result';
      try {
        await AI.test();
        r.textContent = '✅ 连接成功，可以开始提问了';
        r.className = 'test-result ok';
      } catch (e) {
        r.textContent = '❌ ' + e.message;
        r.className = 'test-result fail';
      }
    });

    /* 外观 */
    $$('.theme-card').forEach(card => card.addEventListener('click', () => applyTheme(card.dataset.setTheme)));
    const range = $('#fontSizeRange');
    range.value = Store.getConf().fontSize || 16;
    $('#fontSizeVal').textContent = range.value + 'px';
    range.addEventListener('input', () => {
      document.documentElement.style.setProperty('--base-font', range.value + 'px');
      $('#fontSizeVal').textContent = range.value + 'px';
      Store.setConf({ fontSize: Number(range.value) });
    });

    /* 数据 */
    $('#exportJsonBtn').addEventListener('click', exportJson);
    $('#exportNotesBtn').addEventListener('click', exportNotes);
    $('#importBtn').addEventListener('click', () => $('#importFile').click());
    $('#importFile').addEventListener('change', importJson);
    $('#resetProgressBtn').addEventListener('click', () => {
      if (confirm('确定清空全部学习进度吗？笔记会保留。')) {
        Store.resetProgress();
        updateProgressUI();
        refreshDataStats();
        router();
        showToast('学习进度已清空');
      }
    });
    $('#resetAllBtn').addEventListener('click', () => {
      if (confirm('警告：将删除所有进度、笔记、设置和 AI 对话记录，且无法恢复！确定继续吗？')) {
        Store.resetAll();
        showToast('全部数据已清空，刷新页面…');
        setTimeout(() => location.reload(), 800);
      }
    });
  }

  function fillProvider(id) {
    const p = AI.PROVIDERS.find(x => x.id === id);
    if (!p) return;
    if (p.baseUrl) $('#aiBaseUrl').value = p.baseUrl;
    if (p.model) $('#aiModel').value = p.model;
  }
  function persistAi() {
    Store.setAiConf({
      provider: $('#aiProvider').value,
      baseUrl: $('#aiBaseUrl').value.trim(),
      model: $('#aiModel').value.trim(),
      key: $('#aiKey').value.trim(),
    });
  }

  function refreshDataStats() {
    const all = window.flatTopics();
    $('#dataStats').innerHTML = `
      <div class="data-stat"><b>${Store.masteredCount()}/${all.length}</b><span>已掌握知识点</span></div>
      <div class="data-stat"><b>${Store.noteCount()}</b><span>笔记条数</span></div>
      <div class="data-stat"><b>${Store.getChat().length}</b><span>AI 对话消息</span></div>`;
    $$('.theme-card').forEach(c => c.classList.toggle('active', c.dataset.setTheme === Store.getConf().theme));
  }

  function download(filename, text, mime = 'application/json') {
    const blob = new Blob([text], { type: mime + ';charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function dateTag() {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  }

  function exportJson() {
    persistAi();
    download(`cpp-note-backup-${dateTag()}.json`, JSON.stringify(Store.exportAll(), null, 2));
    showToast('备份已导出');
  }

  function exportNotes() {
    const notes = Store.getAllNotes();
    const flat = window.flatTopics();
    let md = `# 信息学 C++ 学习笔记导出\n\n> 导出时间：${new Date().toLocaleString()} · 共 ${Object.keys(notes).length} 条\n\n---\n\n`;
    for (const t of flat) {
      const n = notes[t.id];
      if (!n) continue;
      md += `## ${t.title}\n\n<small>${t.chapterTitle}</small>\n\n${n.md}\n\n---\n\n`;
    }
    download(`cpp-note-notes-${dateTag()}.md`, md, 'text/markdown');
    showToast('笔记已导出为 Markdown');
  }

  function importJson(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const mode = confirm('选择导入方式：\n\n确定 = 合并（保留现有数据，补入备份内容）\n取消 = 覆盖（清空现有数据后完全还原备份）')
          ? 'merge' : 'overwrite';
        Store.importAll(data, mode);
        showToast('导入成功，正在刷新…');
        setTimeout(() => location.reload(), 700);
      } catch (err) {
        alert('导入失败：' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  /* ---------------- 主题 ---------------- */
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    Store.setConf({ theme });
    $$('.theme-card').forEach(c => c.classList.toggle('active', c.dataset.setTheme === theme));
    $('#themeBtn').textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  /* ---------------- 移动端侧栏 ---------------- */
  function closeSidebarMobile() {
    document.body.classList.remove('sidebar-open');
  }

  /* ============================================================
     v3 功能一：收藏 / 错题本
     ============================================================ */
  function bindCardActions(scope) {
    scope.querySelectorAll('[data-act="fav"]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const on = Store.toggleIn('fav', btn.dataset.key);
        btn.classList.toggle('on', on);
        btn.textContent = btn.textContent.includes('收藏')
          ? (on ? '★ 已收藏' : '☆ 收藏')
          : (on ? '★' : '☆');
        showToast(on ? '已加入收藏' : '已取消收藏');
      });
    });
    scope.querySelectorAll('[data-act="wrong"]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const on = Store.toggleIn('wrong', btn.dataset.key);
        btn.classList.toggle('on', on);
        btn.textContent = on ? '✗ 错题本' : '✗ 错题';
        showToast(on ? '已加入错题本，复习后可在此移除' : '已从错题本移除');
      });
    });
    scope.querySelectorAll('[data-act="drill"]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        startInlineDrill(btn.dataset.topic, Number(btn.dataset.idx), btn);
      });
    });
  }

  function renderBook(tab = 'fav') {
    currentId = null;
    bindNoteForTopic(null, null);
    $('#breadcrumb').innerHTML = `<a href="#/">首页</a> · <b>${tab === 'fav' ? '⭐ 我的收藏' : '❌ 错题本'}</b>`;

    const favKeys = Store.getList('fav');
    const wrongKeys = Store.getList('wrong');
    const renderItem = key => {
      const { topic, type, idx } = Store.parseKey(key);
      const loc = window.findTopicLocation(topic);
      if (!loc) return '';
      if (type === 't') {
        const tpl = ((window.TEMPLATES || {})[topic] || [])[idx];
        if (!tpl) return '';
        return `<div class="book-item" data-bookkey="${key}">
          <div class="bi-head">
            <span class="bi-title">🧩 ${escapeHtml(tpl.title)}</span>
            <span class="bi-src">来自《${loc.meta.title}》</span>
            <span class="ex-actions" style="margin-left:auto">
              <a class="mini-act" href="#/t/${topic}">📖 去学习</a>
              <button class="mini-act" data-bookdel="${key}">移除</button>
            </span>
          </div>
          <div class="md-body">${renderMd(tpl.code || '')}</div>
        </div>`;
      }
      const ex = (window.TOPICS[topic] && window.TOPICS[topic].exercises || [])[idx];
      if (!ex) return '';
      return `<div class="book-item" data-bookkey="${key}">
        <div class="bi-head">
          <span class="bi-title">🎯 ${escapeHtml(ex.title)}</span>
          <span class="ex-level lv-${ex.level || '基础'}">${ex.level || '基础'}</span>
          <span class="bi-src">来自《${loc.meta.title}》</span>
          <span class="ex-actions" style="margin-left:auto">
            <a class="mini-act" href="#/t/${topic}">📖 去学习</a>
            ${tab === 'wrong' ? `<button class="mini-act" data-bookmastered="${key}">✓ 已掌握，移除</button>` : ''}
            <button class="mini-act" data-bookdel="${key}">移除</button>
          </span>
        </div>
        <div class="md-body">${renderMd(ex.statement || '')}</div>
        ${ex.hint ? `<details style="margin-top:8px"><summary>查看提示</summary><div class="md-body">${renderMd(ex.hint)}</div></details>` : ''}
      </div>`;
    };

    const keys = tab === 'fav' ? favKeys : wrongKeys;
    const tplN = keys.filter(k => Store.parseKey(k).type === 't').length;
    $('#content').innerHTML = `
      <div class="topic-head"><h1>${tab === 'fav' ? '⭐ 我的收藏' : '❌ 错题本'}</h1>
        <div class="topic-meta">
          <span class="tag">${keys.length} 条${tab === 'fav' ? `（模板 ${tplN} · 练习 ${keys.length - tplN}）` : ''}</span>
        </div>
      </div>
      <div class="book-tabs">
        <button type="button" data-booktab="fav" class="${tab === 'fav' ? 'active' : ''}">⭐ 收藏 ${favKeys.length}</button>
        <button type="button" data-booktab="wrong" class="${tab === 'wrong' ? 'active' : ''}">❌ 错题 ${wrongKeys.length}</button>
      </div>
      <div id="bookList">${
        keys.length
          ? [...keys].reverse().map(renderItem).join('')
          : `<div class="book-empty">${tab === 'fav'
              ? '还没有收藏。练习题上点 ☆、模板卡上点 ☆ 即可收进来。'
              : '错题本是空的。做练习时把没掌握的题标记为 ✗ 错题，方便考前集中复习。'}</div>`
      }</div>`;
    enhance($('#content'));
    bindCardActions($('#content'));
    $$('[data-booktab]').forEach(b => b.addEventListener('click', () => renderBook(b.dataset.booktab)));
    $$('[data-bookdel]').forEach(b => b.addEventListener('click', () => {
      Store.removeFrom('fav', b.dataset.bookdel);
      Store.removeFrom('wrong', b.dataset.bookdel);
      renderBook(tab);
    }));
    $$('[data-bookmastered]').forEach(b => b.addEventListener('click', () => {
      Store.removeFrom('wrong', b.dataset.bookmastered);
      showToast('已标记掌握，继续加油！');
      renderBook('wrong');
    }));
  }

  /* ============================================================
     v3 功能二：背模板默写模式
     ============================================================ */
  const DRILL_BLACKLIST = new Set(('int long short char bool double float void const constexpr auto ' +
    'for if else while do return struct class namespace using true false nullptr new delete this ' +
    'typedef unsigned signed enum static inline default switch case break continue goto sizeof ' +
    'template typename public private protected include define ifdef ifndef endif').split(' '));

  function chooseDrillWords(code) {
    const freq = {};
    code.split('\n').forEach(line => {
      if (line.trim().startsWith('#')) return;
      const clean = line.replace(/\/\/.*$/, '')
        .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
        .replace(/'(?:[^'\\\n]|\\.)*'/g, "''");
      (clean.match(/[A-Za-z_][A-Za-z0-9_]{1,}/g) || []).forEach(w => {
        if (!DRILL_BLACKLIST.has(w) && w.length >= 2) freq[w] = (freq[w] || 0) + 1;
      });
    });
    const cand = Object.entries(freq).sort((a, b) => b[1] - a[1] || b[0].length - a[0].length);
    const words = new Set();
    let total = 0;
    for (const [w, c] of cand) {
      words.add(w); total += c;
      if (words.size >= 5 || total >= 9) break;
    }
    return words;
  }

  function drillCodeHtml(code, words) {
    let html = '';
    const re = /(\/\/[^\n]*|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|#[^\n]*|\s+|[A-Za-z_][A-Za-z0-9_]*|.)/g;
    let m;
    while ((m = re.exec(code))) {
      const tok = m[0];
      if (/^[A-Za-z_]/.test(tok) && words.has(tok)) {
        html += `<input class="blank-input" data-ans="${escapeHtml(tok)}" size="${Math.max(tok.length + 1, 3)}" placeholder="${'?'.repeat(tok.length)}">`;
      } else {
        html += escapeHtml(tok);
      }
    }
    return html;
  }

  function drillBarHtml(scoreArea) {
    return `<div class="drill-bar">
      <button type="button" class="primary" data-drill="check">✓ 检查答案</button>
      <button type="button" data-drill="reveal">👀 显示答案</button>
      <button type="button" data-drill="close">✕ 退出默写</button>
      <span class="drill-score">${scoreArea || ''}</span>
    </div>
    <div class="drill-hint">挖空的是本模板的关键标识符，全部填对才算掌握。可对照上方原模板。</div>`;
  }

  function bindDrillBar(box, onClose) {
    const scoreEl = box.querySelector('.drill-score');
    box.querySelector('[data-drill="check"]').addEventListener('click', () => {
      let right = 0;
      const blanks = box.querySelectorAll('.blank-input');
      blanks.forEach(inp => {
        const ok = inp.value.trim() === inp.dataset.ans;
        inp.classList.toggle('good', ok);
        inp.classList.toggle('bad', !ok);
        if (ok) right++;
      });
      scoreEl.textContent = `得分 ${right} / ${blanks.length}` + (right === blanks.length ? ' 🎉 全对！' : '');
    });
    box.querySelector('[data-drill="reveal"]').addEventListener('click', () => {
      box.querySelectorAll('.blank-input').forEach(inp => {
        inp.value = inp.dataset.ans;
        inp.classList.add('good'); inp.classList.remove('bad');
      });
      scoreEl.textContent = '已显示答案，请再默写一遍';
    });
    box.querySelector('[data-drill="close"]').addEventListener('click', () => {
      box.remove();
      if (onClose) onClose();
    });
  }

  function startInlineDrill(topicId, idx, btn) {
    const tpl = (window.TEMPLATES[topicId] || [])[idx];
    if (!tpl) return;
    const card = btn.closest('.tpl-card');
    const existed = card.querySelector('.drill-box');
    if (existed) { existed.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    // 取围栏内纯代码
    const code = tpl.code.replace(/^```[a-z]*\n?/, '').replace(/```$/, '').trimEnd() + '\n';
    const words = chooseDrillWords(code);
    const box = document.createElement('div');
    box.className = 'drill-box tpl-card';
    box.style.margin = '12px 16px 16px';
    box.innerHTML = `<div class="tpl-head"><span class="tpl-icon">📝</span>默写自测：${escapeHtml(tpl.title)}</div>
      ${drillBarHtml('')}
      <div class="code-wrap" style="margin:0 16px 16px"><pre><code class="language-cpp">${drillCodeHtml(code, words)}</code></pre></div>`;
    card.appendChild(box);
    bindDrillBar(box);
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* 随机默写挑战页 */
  function renderDrillPage() {
    currentId = null;
    bindNoteForTopic(null, null);
    $('#breadcrumb').innerHTML = `<a href="#/">首页</a> · <a href="#/tpl">模板速查</a> · <b>📝 默写自测</b>`;
    const all = [];
    Object.entries(window.TEMPLATES || {}).forEach(([topic, list]) =>
      list.forEach((tpl, i) => all.push({ topic, i, tpl })));
    const pick = () => all[Math.floor(Math.random() * all.length)];
    const draw = item => {
      const code = item.tpl.code.replace(/^```[a-z]*\n?/, '').replace(/```$/, '').trimEnd() + '\n';
      const words = chooseDrillWords(code);
      const loc = window.findTopicLocation(item.topic);
      $('#content').innerHTML = `
        <div class="topic-head"><h1>📝 背模板默写自测</h1>
          <div class="topic-meta"><span class="tag">共 ${all.length} 个模板随机抽取</span>
          <span>来自《<a href="#/t/${item.topic}">${loc ? loc.meta.title : item.topic}</a>》</span></div>
        </div>
        <div class="tpl-card">
          <div class="tpl-head"><span class="tpl-icon">🧩</span>${escapeHtml(item.tpl.title)}
            <span class="ex-actions" style="margin-left:auto">
              <button class="mini-act" id="drillNext">🔄 换一个</button>
              <a class="mini-act" href="#/t/${item.topic}">📖 看讲解</a>
            </span>
          </div>
          ${item.tpl.note ? `<div class="tpl-note md-body">${renderMd(item.tpl.note)}</div>` : ''}
          ${drillBarHtml('')}
          <div class="code-wrap" style="margin:0 16px 16px"><pre><code class="language-cpp">${drillCodeHtml(code, words)}</code></pre></div>
        </div>`;
      bindDrillBar($('#content').querySelector('.tpl-card'), null);
      $('#drillNext').addEventListener('click', () => draw(pick()));
      enhance($('#content'));
    };
    draw(pick());
  }

  /* ============================================================
     v3 功能三：章末测验
     ============================================================ */
  function chapterKeyOf(topicId) {
    for (let p = 0; p < window.OUTLINE.length; p++) {
      for (let c = 0; c < window.OUTLINE[p].chapters.length; c++) {
        if (window.OUTLINE[p].chapters[c].topics.some(t => t.id === topicId))
          return { key: `${p + 1}-${c + 1}`, title: window.OUTLINE[p].chapters[c].title, partNo: p + 1 };
      }
    }
    return null;
  }

  function quizEntryHtml(topicId) {
    const ch = chapterKeyOf(topicId);
    if (!ch) return '';
    const qs = window.QUIZ[ch.key] || [];
    const score = Store.getQuizScore(ch.key);
    return `<div class="quiz-entry">
      📝 学完本章了？做一份<b>《${ch.title}》章末测验</b>（${qs.length} 题，约 3 分钟）
      ${score ? `<span class="qc-badge ${score.score === score.total ? 'full' : 'part'}">最佳 ${score.score}/${score.total}</span>` : ''}
      <a class="btn btn-primary" href="#/quiz/${ch.key}">开始测验 →</a>
    </div>`;
  }

  function renderQuizHome() {
    currentId = null;
    bindNoteForTopic(null, null);
    $('#breadcrumb').innerHTML = `<a href="#/">首页</a> · <b>📝 章末测验</b>`;
    const scores = Store.allQuizScores();
    const grid = window.OUTLINE.map((part, pi) => {
      const items = part.chapters.map((ch, ci) => {
        const key = `${pi + 1}-${ci + 1}`;
        const sc = scores[key];
        const n = (window.QUIZ[key] || []).length;
        return `<a class="quiz-ch" href="#/quiz/${key}">
          ${sc ? `<span class="qc-badge ${sc.score === sc.total ? 'full' : 'part'}">${sc.score}/${sc.total}</span>` : ''}
          <div class="qc-title">${ch.title}</div>
          <div class="qc-meta">${n} 题${sc ? ' · 最佳 ' + sc.score + '/' + sc.total : sc === undefined && !n ? ' · 题库建设中' : ''}</div>
        </a>`;
      }).join('');
      return `<div class="tpl-cat-title">${part.icon} ${part.title}</div><div class="quiz-grid">${items}</div>`;
    }).join('');
    $('#content').innerHTML = `
      <div class="topic-head"><h1>📝 章末综合测验</h1>
        <div class="topic-meta"><span class="tag">${Object.keys(window.QUIZ).length} 套卷子 · ${Object.values(window.QUIZ).reduce((s, q) => s + q.length, 0)} 道题</span>
        <span>提交后显示得分与逐题解析，最佳成绩自动记录</span></div>
      </div>${grid}`;
  }

  function renderQuiz(chKey) {
    if (typeof chKey !== 'string' || !chKey) {
      location.hash = '#/quiz';   // 无效/空 key：回到测验首页，防止后续 split 崩溃
      return;
    }
    currentId = null;
    bindNoteForTopic(null, null);
    const [p, c] = chKey.split('-').map(Number);
    const ch = (window.OUTLINE[p - 1] || {}).chapters && window.OUTLINE[p - 1].chapters[c - 1];
    const qs = ch ? window.QUIZ[chKey] : null;
    if (!ch || !qs) { location.hash = '#/quiz'; return; }
    $('#breadcrumb').innerHTML = `<a href="#/">首页</a> · <a href="#/quiz">章末测验</a> · <b>${ch.title}</b>`;
    const picked = Array(qs.length).fill(-1);
    const prev = Store.getQuizScore(chKey);

    $('#content').innerHTML = `
      <div class="topic-head"><h1>📝 ${ch.title} · 章末测验</h1>
        <div class="topic-meta"><span class="tag">${qs.length} 道单选题</span>
        ${prev ? `<span>历史最佳：${prev.score}/${prev.total}</span>` : ''}
        <a class="btn-ghost" style="padding:6px 14px;border:1px solid var(--border-strong);border-radius:9px" href="#/quiz">← 全部章节</a></div>
      </div>
      <div id="quizQs">${qs.map((q, i) => `
        <div class="q-card" data-qi="${i}">
          <div class="q-num">${i + 1}. ${escapeHtml(q.q)}</div>
          ${q.o.map((opt, oi) =>
            `<button type="button" class="q-opt" data-oi="${oi}"><b>${'ABCD'[oi]}.</b> ${escapeHtml(opt)}</button>`).join('')}
          <div class="q-exp">💡 ${escapeHtml(q.e)}</div>
        </div>`).join('')}
      </div>
      <div style="margin:18px 0;display:flex;gap:10px;align-items:center">
        <button class="btn btn-primary" id="quizSubmit">📤 提交答卷</button>
        <button class="btn btn-ghost" id="quizRetry" style="display:none">🔄 再做一遍</button>
        <span id="quizScore" style="font-weight:700"></span>
      </div>`;

    $$('#quizQs .q-card').forEach((card, i) => {
      card.querySelectorAll('.q-opt').forEach(btn => {
        btn.addEventListener('click', () => {
          if (card.classList.contains('graded')) return;
          picked[i] = Number(btn.dataset.oi);
          card.querySelectorAll('.q-opt').forEach(b => b.classList.remove('sel'));
          btn.classList.add('sel');
        });
      });
    });
    $('#quizSubmit').addEventListener('click', () => {
      if (picked.includes(-1)) {
        if (!confirm('还有题目未作答，确定提交吗？')) return;
      }
      let score = 0;
      $$('#quizQs .q-card').forEach((card, i) => {
        card.classList.add('graded');
        card.querySelectorAll('.q-opt').forEach(btn => {
          const oi = Number(btn.dataset.oi);
          btn.classList.toggle('right', oi === qs[i].a);
          if (oi === picked[i] && oi !== qs[i].a) btn.classList.add('wrong');
        });
        if (picked[i] === qs[i].a) score++;
      });
      Store.setQuizScore(chKey, score, qs.length);
      Store.bumpDay('q', qs.length);
      const el = $('#quizScore');
      el.innerHTML = `<span style="color:${score === qs.length ? 'var(--green)' : score >= qs.length / 2 ? 'var(--accent)' : 'var(--red)'}">
        得分 ${score} / ${qs.length} ${score === qs.length ? '🎉 满分！' : score >= qs.length / 2 ? '不错，回看错题解析' : '建议复习本章再来'}</span>`;
      $('#quizSubmit').style.display = 'none';
      $('#quizRetry').style.display = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    $('#quizRetry').addEventListener('click', () => renderQuiz(chKey));
  }

  /* ============================================================
     v3 功能四：C++ 在线运行沙箱（Wandbox）
     ============================================================ */
  /* 代码实时高亮：透明 textarea 叠在高亮层上，两层排版参数完全一致。
     依赖内置 highlight.js（v11）；缺失时退化为纯转义文本，仍可正常编辑。 */
  let runHl = null;
  function initRunHighlight() {
    const ta = $('#runCode');
    const pre = $('.run-hl');
    const codeEl = $('#runHl');
    if (!ta || !pre || !codeEl) return null;

    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const syncScroll = () => { pre.scrollTop = ta.scrollTop; pre.scrollLeft = ta.scrollLeft; };

    function paint() {
      const src = ta.value;
      let html = null;
      if (window.hljs && typeof window.hljs.highlight === 'function') {
        try {
          html = window.hljs.highlight(src, { language: 'cpp', ignoreIllegals: true }).value;
        } catch (e) { html = null; }
      }
      /* 末尾补一个换行：保证最后一行在 pre 里始终可见（与 textarea 高度对齐） */
      codeEl.innerHTML = (html == null ? esc(src) : html) + '\n';
      syncScroll();
    }

    let raf = 0;
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = 0; paint(); });
    };

    ta.addEventListener('input', schedule);
    ta.addEventListener('scroll', syncScroll, { passive: true });
    /* Tab 缩进 4 空格（Shift+Tab 反向缩进），让手写代码更顺手 */
    ta.addEventListener('keydown', e => {
      if (e.key !== 'Tab' || e.ctrlKey || e.metaKey || e.altKey) return;
      e.preventDefault();
      const start = ta.selectionStart, end = ta.selectionEnd, v = ta.value;
      if (e.shiftKey) {
        /* 反向缩进：删除光标前最多 4 个空格 */
        const lineStart = v.lastIndexOf('\n', start - 1) + 1;
        const lead = v.slice(lineStart, start);
        const cut = lead.length - lead.replace(/^ {1,4}/, '').length;
        if (cut > 0) {
          ta.value = v.slice(0, start - cut) + v.slice(start);
          ta.selectionStart = ta.selectionEnd = start - cut;
        }
      } else {
        const indent = '    ';
        ta.value = v.slice(0, start) + indent + v.slice(end);
        ta.selectionStart = ta.selectionEnd = start + indent.length;
      }
      schedule();
    });

    /* 面板尺寸变化后需重新对齐（pre 高度取 textarea 实际内容高度无关，靠滚动同步即可） */
    runHl = { paint, syncScroll };
    return runHl;
  }

  function openRunner(code) {
    $('#runCode').value = code || `#include <iostream>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << '\\n';
    return 0;
}
`;
    $('#runStdin').value = '';
    const out = $('#runOut');
    out.className = ''; out.textContent = '';
    $('#runnerPanel').classList.add('open');
    /* 面板变为可见后再高亮（隐藏时尺寸为 0，浏览器仍能排版，但先 paint 更稳） */
    if (runHl) runHl.paint();
    $('#runCode').scrollTop = 0;
    setTimeout(() => { $('#runCode').focus(); if (runHl) runHl.syncScroll(); }, 60);
  }
  function initRunner() {
    initRunHighlight();
    $('#runCloseBtn').addEventListener('click', () => $('#runnerPanel').classList.remove('open'));
    $('#runBtn').addEventListener('click', async () => {
      const btn = $('#runBtn');
      const out = $('#runOut');
      btn.disabled = true;
      btn.textContent = '⏳ 编译中…';
      out.className = 'show';
      out.textContent = '正在连接 Wandbox 编译服务…';
      try {
        const res = await fetch('https://wandbox.org/api/compile.json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            compiler: 'gcc-head',
            code: $('#runCode').value,
            stdin: $('#runStdin').value,
            'compiler-option-raw': '-std=c++17\n-O2\n-Wall', // Wandbox 多选项必须换行分隔
            save: false,
          }),
        });
        if (!res.ok) throw new Error('服务返回 HTTP ' + res.status);
        const d = await res.json();
        out.className = 'show ' + (d.status === '0' ? 'ok' : 'err');
        out.innerHTML = '';
        const meta = document.createElement('div');
        meta.className = 'run-meta';
        const sigName = { 134: '异常终止(abort)', 136: '算术错误(如除以0)', 139: '段错误(数组越界/未初始化)', 137: '超时或超内存被终止' }[Number(d.status)];
        meta.textContent = `退出码 ${d.status}${sigName ? ' · ' + sigName : ''}${d.compiler_error ? ' · 有编译错误/警告' : ''}`;
        out.appendChild(meta);
        /* 程序需要输入却没填标准输入时，n 未初始化极易段错误，给出针对性提示 */
        const code = $('#runCode').value, stdin = $('#runStdin').value;
        const needsInput = /\b(cin|scanf|getline)\b|f?scanf/.test(code);
        if (d.status !== '0' && !d.compiler_error && needsInput && !stdin.trim()) {
          const hint = document.createElement('div');
          hint.className = 'run-hint';
          hint.textContent = '💡 程序似乎需要从标准输入读取数据，但上方「标准输入」是空的：变量读不到值（未初始化）常导致段错误。请把例题的样例输入粘贴到「标准输入」框后再运行。';
          out.appendChild(hint);
        }
        const pre = document.createElement('pre');
        pre.textContent = (d.program_output || '') + (d.program_error || '') +
          (d.status !== '0' ? '\n' + (d.compiler_error || '') : '');
        out.appendChild(pre);
      } catch (e) {
        out.className = 'show err';
        out.textContent = '运行失败：' + e.message +
          '\n可能原因：网络无法访问 wandbox.org，或浏览器拦截了跨域请求。可稍后重试，或配置代理后再用。';
      }
      btn.disabled = false;
      btn.textContent = '▶ 编译并运行';
    });
  }

  /* ---------------- 快捷键帮助 ---------------- */
  function initHelp() {
    const mask = $('#helpMask');
    const open = () => { mask.hidden = false; };
    const close = () => { mask.hidden = true; };
    $('#helpCloseBtn').addEventListener('click', close);
    mask.addEventListener('click', e => { if (e.target === mask) close(); });
    window.__closeHelp = close;
  }

  /* ---------------- 命令面板（Ctrl/⌘ + K） ---------------- */
  const COMMANDS = [
    { id: 'home', icon: '🏠', label: '回到首页', kw: 'home shouye 首页', run: () => { location.hash = '#/'; } },
    { id: 'stats', icon: '📊', label: '学习数据看板', kw: 'stats kanban 看板 统计 进度', run: () => { location.hash = '#/stats'; } },
    { id: 'tpl', icon: '🧩', label: '核心模板速查', kw: 'template moban 模板', run: () => { location.hash = '#/tpl'; } },
    { id: 'quiz', icon: '📝', label: '章末测验', kw: 'quiz ceyan 测验 考试', run: () => { location.hash = '#/quiz'; } },
    { id: 'drill', icon: '✍️', label: '背模板默写挑战', kw: 'drill moxie 默写 背诵', run: () => { location.hash = '#/drill'; } },
    { id: 'book', icon: '⭐', label: '我的收藏', kw: 'book fav shoucang 收藏', run: () => { location.hash = '#/book'; } },
    { id: 'wrong', icon: '❌', label: '错题本', kw: 'wrong cuoti 错题', run: () => { location.hash = '#/book/wrong'; } },
    { id: 'ai', icon: '🤖', label: '打开 AI 私教', kw: 'ai chat 私教 提问', run: () => { openAi(); } },
    { id: 'note', icon: '📝', label: '打开 / 关闭笔记面板', kw: 'note biji 笔记', run: () => { toggleNotePanel(); } },
    { id: 'theme', icon: '🎨', label: '切换主题', kw: 'theme zhuti 主题 深色', run: () => {
        const cur = document.documentElement.dataset.theme;
        applyTheme(cur === 'light' ? 'eye' : cur === 'eye' ? 'dark' : 'light');
      } },
    { id: 'settings', icon: '⚙️', label: '打开设置', kw: 'settings shezhi 设置', run: () => { $('#settingsBtn').click(); } },
  ];

  function initCommandPalette() {
    const mask = $('#cmdkMask');
    const input = $('#cmdkInput');
    const results = $('#cmdkResults');
    let activeIdx = 0;
    let currentItems = [];

    const open = () => { mask.hidden = false; input.value = ''; draw(''); setTimeout(() => input.focus(), 30); };
    const close = () => { mask.hidden = true; };

    function topicHay(t) {
      return (t.title + ' ' + (t.tags || []).join(' ') + ' ' + (t.partTitle || '') + ' ' + (t.chapterTitle || '')).toLowerCase();
    }

    function draw(kw) {
      kw = kw.trim().toLowerCase();
      const cmdHits = COMMANDS.filter(c => !kw || c.label.toLowerCase().includes(kw) || c.kw.includes(kw));
      let topicHits = [];
      if (!kw) {
        /* 默认：继续学习 + 各部分首项 */
        const last = Store.getLast();
        topicHits = window.flatTopics().filter(t => t.id === last).slice(0, 1);
      } else {
        topicHits = window.flatTopics().filter(t => topicHay(t).includes(kw)).slice(0, 8);
      }
      currentItems = [
        ...cmdHits.map(c => ({ type: 'cmd', data: c })),
        ...topicHits.map(t => ({ type: 'topic', data: t })),
      ];
      if (currentItems.length > 12) currentItems = currentItems.slice(0, 12);
      activeIdx = 0;

      const cmdHtml = cmdHits.length ? `<div class="cmdk-group">操作</div>` +
        cmdHits.map((c, i) => {
          const idx = currentItems.findIndex(x => x.type === 'cmd' && x.data.id === c.id);
          return `<button class="cmdk-item ${idx === activeIdx ? 'active' : ''}" data-i="${idx}" role="option">
            <span class="ci-icon">${c.icon}</span><span class="ci-label">${c.label}</span></button>`;
        }).join('') : '';
      const topicHtml = topicHits.length ? `<div class="cmdk-group">知识点</div>` +
        topicHits.map(t => {
          const idx = currentItems.findIndex(x => x.type === 'topic' && x.data.id === t.id);
          return `<button class="cmdk-item ${idx === activeIdx ? 'active' : ''}" data-i="${idx}" role="option">
            <span class="ci-icon">📖</span><span class="ci-label">${t.title}</span>
            <span class="ci-sub">${t.partIcon || ''} ${t.chapterTitle || ''}</span></button>`;
        }).join('') : '';
      results.innerHTML = currentItems.length
        ? cmdHtml + topicHtml
        : '<div class="cmdk-empty">没有匹配项，换个关键词试试</div>';

      results.querySelectorAll('.cmdk-item').forEach(btn => {
        btn.addEventListener('click', () => choose(Number(btn.dataset.i)));
        btn.addEventListener('mousemove', () => setActive(Number(btn.dataset.i)));
      });
    }

    function setActive(i) {
      activeIdx = i;
      results.querySelectorAll('.cmdk-item').forEach(b =>
        b.classList.toggle('active', Number(b.dataset.i) === i));
      const cur = results.querySelector('.cmdk-item.active');
      if (cur) cur.scrollIntoView({ block: 'nearest' });
    }

    function choose(i) {
      const item = currentItems[i];
      if (!item) return;
      close();
      if (item.type === 'cmd') item.data.run();
      else location.hash = '#/t/' + item.data.id;
    }

    input.addEventListener('input', () => draw(input.value));
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(Math.min(activeIdx + 1, currentItems.length - 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(Math.max(activeIdx - 1, 0)); }
      else if (e.key === 'Enter') { e.preventDefault(); choose(activeIdx); }
      else if (e.key === 'Escape') { close(); }
    });
    mask.addEventListener('click', e => { if (e.target === mask) close(); });

    /* 注册到全局快捷键 */
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        mask.hidden ? open() : close();
      }
    });
    window.__cmdk = { open, close };
  }

  /* ---------------- 快捷键与初始化 ---------------- */
  function bindGlobal() {
    $('#menuBtn').addEventListener('click', () => document.body.classList.toggle('sidebar-open'));
    $('#sidebarMask').addEventListener('click', closeSidebarMobile);
    $('#themeBtn').addEventListener('click', () => {
      const cur = document.documentElement.dataset.theme;
      applyTheme(cur === 'light' ? 'eye' : cur === 'eye' ? 'dark' : 'light');
    });

    document.addEventListener('keydown', e => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        toggleNotePanel();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        document.body.classList.toggle('sidebar-open');
      }
      if (e.key === 'Escape') {
        $('#modalMask').hidden = true;
        $('#helpMask').hidden = true;
        closeAi();
        $('#runnerPanel').classList.remove('open');
        closeSidebarMobile();
      }
      if (!typing && e.key === '/' ) {
        e.preventDefault();
        $('#searchInput').focus();
      }
      /* ? 打开快捷键帮助（Shift+/） */
      if (!typing && (e.key === '?' || (e.shiftKey && e.key === '/'))) {
        e.preventDefault();
        $('#helpMask').hidden = false;
      }
      /* ← / → 在知识点页快速翻页（不与输入框、弹窗冲突） */
      if (!typing && currentId && !e.ctrlKey && !e.metaKey && !e.altKey &&
          (e.key === 'ArrowLeft' || e.key === 'ArrowRight') &&
          $('#modalMask').hidden && $('#helpMask').hidden) {
        const sel = $('.pager a.' + (e.key === 'ArrowLeft' ? 'prev' : 'next') + ':not(.disabled)');
        if (sel) sel.click();
      }
    });

    window.addEventListener('hashchange', router);

    /* 模板速查入口 */
    $('#tplNavBtn').addEventListener('click', () => { location.hash = '#/tpl'; });
    /* 学习看板入口 */
    $('#statsNavBtn').addEventListener('click', () => { location.hash = '#/stats'; });
    /* 收藏/错题本入口 */
    $('#bookBtn').addEventListener('click', () => { location.hash = '#/book'; });
    initRunner();

    /* 阅读进度 + 回到顶部（rAF 节流） */
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const doc = document.documentElement;
        const max = doc.scrollHeight - doc.clientHeight;
        const rpct = max > 0 ? doc.scrollTop / max * 100 : 0;
        const rp = $('#readProgress');
        rp.style.width = rpct + '%';
        rp.setAttribute('aria-valuenow', Math.round(rpct));
        $('#toTop').classList.toggle('show', doc.scrollTop > 420);
        ticking = false;
      });
    }, { passive: true });
    $('#toTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    /* 打印（Ctrl+P / 导出 PDF）前自动展开折叠的题解与模板，之后恢复 */
    window.addEventListener('beforeprint', () => {
      window.__wasClosed = Array.from(document.querySelectorAll('details:not([open])'));
      window.__wasClosed.forEach(d => d.setAttribute('open', ''));
    });
    window.addEventListener('afterprint', () => {
      (window.__wasClosed || []).forEach(d => d.removeAttribute('open'));
      window.__wasClosed = [];
    });
  }

  function init() {
    const conf = Store.getConf();
    applyTheme(conf.theme);
    if (conf.fontSize) {
      document.documentElement.style.setProperty('--base-font', conf.fontSize + 'px');
    }
    /* 笔记面板仅在宽屏自动恢复；窄屏下面板会盖住正文，不自动弹出 */
    if (conf.noteOpen && window.innerWidth > 860) document.body.classList.add('note-open');

    renderOutline();
    bindSearch();
    initNotePanel();
    initAi();
    initSettings();
    initHelp();
    initCommandPalette();
    bindGlobal();
    router();

    /* 首屏已渲染，移除启动遮罩 */
    requestAnimationFrame(() => {
      const boot = document.getElementById('appBoot');
      if (boot) { boot.classList.add('done'); setTimeout(() => boot.remove(), 300); }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
