/* ============================================================
   ai.js —— AI 私教（OpenAI 兼容接口，浏览器直连，无需后端）
   支持 DeepSeek / 通义千问 / 智谱 GLM / Kimi / OpenAI / 自定义
   ============================================================ */

(function () {

  /* 服务商预设：选择后自动填充接口地址与模型名 */
  const PROVIDERS = [
    { id: 'deepseek', name: 'DeepSeek（性价比高，推荐）', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
    { id: 'qwen',     name: '通义千问 Qwen（有免费额度）', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-plus' },
    { id: 'zhipu',    name: '智谱 GLM（有免费额度）',       baseUrl: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4-flash' },
    { id: 'kimi',     name: 'Kimi 月之暗面',               baseUrl: 'https://api.moonshot.cn/v1', model: 'moonshot-v1-8k' },
    { id: 'openai',   name: 'OpenAI（需海外网络）',         baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
    { id: 'custom',   name: '自定义（任何 OpenAI 兼容接口）', baseUrl: '', model: '' },
  ];

  /**
   * 流式对话
   * @param {Array} messages  [{role:'system'|'user'|'assistant', content}]
   * @param {Object} cb       { onDelta(片段, 全文), signal: AbortSignal }
   * @returns {Promise<string>} 完整回复
   */
  async function chat(messages, cb = {}) {
    const ai = Store.getAiConf();
    if (!ai.key) {
      const err = new Error('还没有配置 API Key');
      err.code = 'NO_KEY';
      throw err;
    }
    if (!ai.baseUrl || !ai.model) {
      const err = new Error('接口地址或模型名为空');
      err.code = 'BAD_CONF';
      throw err;
    }

    const url = ai.baseUrl.replace(/\/+$/, '') + '/chat/completions';
    let res;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + ai.key,
        },
        body: JSON.stringify({
          model: ai.model,
          messages,
          stream: true,
          temperature: 0.5,
        }),
        signal: cb.signal,
      });
    } catch (e) {
      if (e.name === 'AbortError') throw e;
      const err = new Error('网络连接失败：' + e.message + '（可能是跨域限制或网络问题）');
      err.code = 'NETWORK';
      throw err;
    }

    if (!res.ok) {
      let detail = '';
      try { detail = (await res.text()).slice(0, 300); } catch (e) {}
      const tip = res.status === 401 ? 'API Key 错误或已失效（401）'
        : res.status === 402 || res.status === 429 ? '余额不足或请求过于频繁（' + res.status + '）'
        : res.status === 404 ? '接口地址/模型名错误（404）'
        : '服务端返回错误（HTTP ' + res.status + '）';
      const err = new Error(tip + (detail ? '\n' + detail : ''));
      err.code = 'HTTP_' + res.status;
      throw err;
    }

    /* 解析 SSE 流：data: {...}\n\n */
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '', full = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let nl;
      while ((nl = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (!line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (data === '[DONE]') {
          return full;
        }
        try {
          const json = JSON.parse(data);
          const piece = json.choices && json.choices[0] && json.choices[0].delta && json.choices[0].delta.content;
          if (piece) {
            full += piece;
            cb.onDelta && cb.onDelta(piece, full);
          }
        } catch (e) {
          /* 个别服务商会发非 JSON 心跳行，忽略即可 */
        }
      }
    }
    return full;
  }

  /** 连接测试：发一条极短消息 */
  async function test() {
    const ai = Store.getAiConf();
    if (!ai.key) throw new Error('请先填写 API Key');
    const res = await fetch(ai.baseUrl.replace(/\/+$/, '') + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + ai.key },
      body: JSON.stringify({
        model: ai.model,
        messages: [{ role: 'user', content: 'ping，请回复 pong' }],
        stream: false,
        max_tokens: 10,
      }),
    });
    if (!res.ok) {
      let detail = '';
      try { detail = (await res.text()).slice(0, 200); } catch (e) {}
      throw new Error('HTTP ' + res.status + ' ' + detail);
    }
    return true;
  }

  /** 生成给 AI 的系统提示词（带当前学习上下文） */
  function systemPrompt(ctx) {
    const mastered = Store.masteredCount();
    const total = window.flatTopics().length;
    let s =
      '你是一名经验丰富的信息学奥林匹克竞赛（CSP-J/S、NOIP）C++ 金牌教练，' +
      '正在指导一名从零基础起步的中学生学员。你的回答要求：\n' +
      '1. 由浅入深、语言通俗，善用生活化类比；Markdown 排版清晰。\n' +
      '2. 代码使用 C++17，可使用万能头 #include <bits/stdc++.h> 和 using namespace std；' +
      '关键行必须有充分的中文注释，变量命名清晰，符合竞赛书写规范。\n' +
      '3. 学员问题目时，先给题意分析与思路提示、引导其独立思考，不要立刻给完整答案；' +
      '只有学员明确说"给我答案/看代码/不会写"时才给完整可编译代码。\n' +
      '4. 主动提醒数据范围与类型选择（int 还是 long long）、边界条件和易错点。\n' +
      '5. 回答控制在合理长度，重点突出；可以用表格对比、用分步骤列表讲解。\n' +
      `学员当前整体进度：已掌握 ${mastered}/${total} 个知识点。\n`;

    if (ctx && ctx.topic) {
      s += `\n学员正在学习知识点：《${ctx.topic.title}》（所属：${ctx.partTitle} · ${ctx.chapterTitle}，难度 ${ctx.topic.diff}/5）。`;
      if (ctx.hasContent === false) {
        s += '该知识点在本手册中的详细讲义尚未编写，请你临时充当讲义作者，系统地把这个知识点给学员讲清楚（含概念、代码模板、例题）。';
      } else {
        s += '请结合这个知识点的内容回答学员的追问。';
      }
    }
    return s;
  }

  window.AI = { PROVIDERS, chat, test, systemPrompt };
})();
