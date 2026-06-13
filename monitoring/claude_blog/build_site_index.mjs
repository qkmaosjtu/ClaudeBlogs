#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";

const index = JSON.parse(readFileSync("monitoring/claude_blog/backfill_2025_index.json", "utf8"));
const strategy = JSON.parse(readFileSync("monitoring/ai_native_engineering_strategy.json", "utf8"));
const articles = index.generated.slice().sort((a, b) => `${b.date} ${b.title}`.localeCompare(`${a.date} ${a.title}`));
const months = Array.from(new Set(articles.map((item) => item.date.slice(0, 7)))).sort().reverse();
const priorityRules = Object.fromEntries(strategy.priorityRules.map((rule) => [rule.id, rule]));
const levelWeight = { A: 5, B: 3, C: 1 };

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalize(value = "") {
  return String(value).toLowerCase();
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function findMatches(haystack, terms) {
  return unique(terms).filter((term) => haystack.includes(normalize(term)));
}

function scoreArea(haystack, area) {
  const terms = [...area.keywords, ...(area.companies || [])];
  const matches = findMatches(haystack, terms);
  const score = matches.length * (levelWeight[area.level] || 1);
  return { ...area, matches, score };
}

function classifyArticle(article) {
  const haystack = normalize(`${article.title}\n${article.url}`);
  const areaScores = strategy.focusAreas
    .map((area) => scoreArea(haystack, area))
    .filter((area) => area.score > 0)
    .sort((a, b) => b.score - a.score || (levelWeight[b.level] || 0) - (levelWeight[a.level] || 0));
  const primaryArea =
    areaScores[0] ||
    {
      id: "watchlist",
      level: "C",
      label: "收藏观察",
      description: "标题和 URL 暂未命中高权重工程主题，保留为低优先级观察。",
      matches: [],
      score: 0
    };

  const p0Matches = findMatches(haystack, priorityRules.P0.triggers);
  const p1Matches = findMatches(haystack, priorityRules.P1.triggers);
  const p2Matches = findMatches(haystack, priorityRules.P2.triggers);
  let priority = "P2";
  if (p0Matches.length > 0) {
    priority = "P0";
  } else if (p1Matches.length > 0 || primaryArea.level === "A" || primaryArea.level === "B") {
    priority = "P1";
  }

  const loweredSignals = findMatches(haystack, strategy.lowerPriorityFilters);
  const relevance = Math.max(
    5,
    Math.min(
      100,
      24 +
        primaryArea.score * 5 +
        p0Matches.length * 12 +
        p1Matches.length * 7 +
        areaScores.length * 4 -
        loweredSignals.length * 10
    )
  );

  return {
    ...article,
    classification: {
      priority,
      priorityLabel: priorityRules[priority].label,
      primaryArea,
      areaScores,
      relevance,
      signals: unique([...p0Matches, ...p1Matches, ...p2Matches, ...primaryArea.matches]).slice(0, 6),
      loweredSignals
    }
  };
}

const enrichedArticles = articles.map(classifyArticle);
const priorityCounts = strategy.priorityRules.map((rule) => ({
  ...rule,
  count: enrichedArticles.filter((article) => article.classification.priority === rule.id).length
}));
const areaCounts = strategy.focusAreas.map((area) => ({
  ...area,
  count: enrichedArticles.filter((article) => article.classification.primaryArea.id === area.id).length
}));
const watchlistArea = {
  id: "watchlist",
  level: "C",
  label: "收藏观察",
  description: "未命中高权重标题信号，但仍保留在归档中用于后续检索。",
  count: enrichedArticles.filter((article) => article.classification.primaryArea.id === "watchlist").length
};
const visibleAreas = [...areaCounts.filter((area) => area.count > 0), ...(watchlistArea.count > 0 ? [watchlistArea] : [])];

function priorityBadge(priority) {
  const label = priorityRules[priority].label;
  return `<span class="badge priority ${escapeHtml(priority.toLowerCase())}">${escapeHtml(label)}</span>`;
}

function areaBadge(area) {
  return `<span class="badge level-${escapeHtml(area.level.toLowerCase())}">${escapeHtml(area.level)}级 · ${escapeHtml(area.label)}</span>`;
}

function articleCard(article) {
  const month = article.date.slice(0, 7);
  const { classification } = article;
  const signals = classification.signals.length ? classification.signals : ["低频观察"];
  const searchText = normalize(
    `${article.title} ${article.date} ${article.url} ${classification.priorityLabel} ${classification.primaryArea.label} ${signals.join(" ")}`
  );

  return `<article class="report-card" data-month="${escapeHtml(month)}" data-priority="${escapeHtml(classification.priority)}" data-area="${escapeHtml(classification.primaryArea.id)}" data-search="${escapeHtml(searchText)}">
    <div class="card-top">
      <span class="date">${escapeHtml(article.date)}</span>
      ${priorityBadge(classification.priority)}
    </div>
    <h2>${escapeHtml(article.title)}</h2>
    <div class="meta-row">
      ${areaBadge(classification.primaryArea)}
      <span class="score">${classification.relevance} 分</span>
    </div>
    <p class="signals">命中信号：${signals.map(escapeHtml).join(" / ")}</p>
    <p class="source"><a href="${escapeHtml(article.url)}" target="_blank" rel="noopener">原文</a></p>
    <div class="actions">
      <a class="button primary" href="${escapeHtml(article.html)}">阅读分析</a>
      <a class="button" href="${escapeHtml(article.markdown)}">Markdown</a>
    </div>
  </article>`;
}

function focusCard(area) {
  const keywords = area.keywords.slice(0, 6);
  return `<article class="focus-card">
    <div class="card-top">
      <span class="badge level-${escapeHtml(area.level.toLowerCase())}">${escapeHtml(area.level)}级</span>
      <span class="count">${area.count || 0} 篇</span>
    </div>
    <h3>${escapeHtml(area.label)}</h3>
    <p>${escapeHtml(area.description)}</p>
    <div class="chips">${keywords.map((keyword) => `<span>${escapeHtml(keyword)}</span>`).join("")}</div>
  </article>`;
}

function priorityCard(rule) {
  return `<article class="priority-card">
    <div class="card-top">
      ${priorityBadge(rule.id)}
      <span class="count">${rule.count} 篇</span>
    </div>
    <p>${escapeHtml(rule.description)}</p>
  </article>`;
}

function sourceList() {
  return strategy.watchSources
    .map(
      (source) => `<li>
        <a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.name)}</a>
        <span>${escapeHtml(source.coverage)}</span>
      </li>`
    )
    .join("");
}

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(strategy.site.title)} | AI 软件工程与 Agent Infra 日更</title>
  <meta name="description" content="${escapeHtml(strategy.site.description)}">
  <style>
    :root {
      color-scheme: light;
      --bg: #f6f7f9;
      --panel: #ffffff;
      --panel-soft: #eef5ff;
      --text: #172033;
      --muted: #5d6675;
      --border: #dde3eb;
      --blue: #1f6feb;
      --blue-strong: #174ea6;
      --green: #167d5a;
      --amber: #9a6700;
      --red: #c03536;
      --violet: #7048b6;
      --shadow: 0 16px 44px rgba(23, 32, 51, 0.08);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.55;
    }
    a { color: var(--blue); }
    header {
      padding: 42px 24px 30px;
      border-bottom: 1px solid var(--border);
      background: #fff;
    }
    .wrap { max-width: 1220px; margin: 0 auto; }
    .eyebrow {
      margin: 0 0 10px;
      color: var(--blue-strong);
      font-size: 14px;
      font-weight: 720;
    }
    h1 {
      margin: 0 0 12px;
      font-size: clamp(34px, 5vw, 58px);
      line-height: 1.05;
      letter-spacing: 0;
    }
    .subtitle { margin: 0; max-width: 900px; color: var(--muted); font-size: 18px; }
    .stats {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
      margin-top: 28px;
    }
    .stat, .focus-card, .priority-card, .report-card, .source-panel {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 8px;
      box-shadow: var(--shadow);
    }
    .stat { padding: 16px; }
    .stat strong { display: block; font-size: 28px; line-height: 1; }
    .stat span { color: var(--muted); font-size: 13px; }
    .section {
      padding: 28px 24px 0;
    }
    .section-head {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: end;
      margin-bottom: 14px;
    }
    .section h2 {
      margin: 0;
      font-size: 24px;
      letter-spacing: 0;
    }
    .section-note {
      margin: 0;
      color: var(--muted);
      max-width: 760px;
    }
    .priority-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
    }
    .focus-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
    }
    .priority-card, .focus-card, .source-panel {
      padding: 16px;
    }
    .focus-card h3 {
      margin: 12px 0 8px;
      font-size: 18px;
      letter-spacing: 0;
    }
    .focus-card p, .priority-card p {
      margin: 0;
      color: var(--muted);
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 12px;
    }
    .chips span {
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 4px 9px;
      background: #f9fbfd;
      color: var(--muted);
      font-size: 12px;
    }
    .source-panel {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 18px;
      align-items: start;
    }
    .source-panel ul {
      margin: 0;
      padding-left: 18px;
    }
    .source-panel li {
      margin: 0 0 8px;
    }
    .source-panel li span {
      display: block;
      color: var(--muted);
      font-size: 13px;
    }
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 2;
      background: rgba(246, 247, 249, 0.94);
      backdrop-filter: blur(12px);
      border-block: 1px solid var(--border);
      padding: 14px 24px;
      margin-top: 28px;
    }
    .toolbar-grid {
      display: grid;
      grid-template-columns: 1fr 170px 220px 170px;
      gap: 12px;
      align-items: center;
    }
    input, select {
      width: 100%;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--panel);
      color: var(--text);
      font: inherit;
      padding: 11px 12px;
    }
    main { padding: 28px 24px 64px; }
    .reports {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
    }
    .report-card {
      min-height: 260px;
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .report-card[hidden] { display: none; }
    .card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .date, .badge, .score {
      width: fit-content;
      border-radius: 999px;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
    }
    .date { background: #eef2f7; color: #364152; }
    .badge { background: #eef2f7; color: #364152; }
    .badge.p0 { background: #fff1f1; color: var(--red); }
    .badge.p1 { background: #eef7f3; color: var(--green); }
    .badge.p2 { background: #fff8e8; color: var(--amber); }
    .badge.level-a { background: #eef5ff; color: var(--blue-strong); }
    .badge.level-b { background: #f1edff; color: var(--violet); }
    .badge.level-c { background: #fff8e8; color: var(--amber); }
    .count { color: var(--muted); font-size: 13px; font-weight: 650; }
    h2 {
      margin: 0;
      font-size: 19px;
      line-height: 1.28;
      letter-spacing: 0;
    }
    .meta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }
    .score { background: #f6f8fa; color: var(--muted); }
    .signals, .source { margin: 0; color: var(--muted); }
    .signals { font-size: 14px; }
    .actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: auto;
    }
    .button {
      display: inline-flex;
      align-items: center;
      min-height: 38px;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 8px 12px;
      text-decoration: none;
      color: var(--text);
      background: #fff;
      font-size: 14px;
      font-weight: 650;
    }
    .button.primary {
      background: var(--blue);
      border-color: var(--blue);
      color: #fff;
    }
    .empty {
      display: none;
      margin-top: 24px;
      border: 1px dashed var(--border);
      border-radius: 8px;
      padding: 24px;
      color: var(--muted);
      background: var(--panel);
    }
    .empty.show { display: block; }
    footer {
      border-top: 1px solid var(--border);
      padding: 24px;
      color: var(--muted);
      font-size: 14px;
      background: #fff;
    }
    @media (max-width: 1040px) {
      .priority-grid, .focus-grid, .reports { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .toolbar-grid { grid-template-columns: 1fr 160px 1fr; }
      .toolbar-grid select:last-child { grid-column: span 3; }
      .source-panel { grid-template-columns: 1fr; }
    }
    @media (max-width: 680px) {
      header { padding-top: 34px; }
      .stats, .priority-grid, .focus-grid, .reports, .toolbar-grid { grid-template-columns: 1fr; }
      .toolbar-grid select:last-child { grid-column: auto; }
      .section-head { display: block; }
      .report-card { min-height: 0; }
    }
  </style>
</head>
<body>
  <header>
    <div class="wrap">
      <p class="eyebrow">${escapeHtml(strategy.site.tagline)}</p>
      <h1>${escapeHtml(strategy.site.title)}</h1>
      <p class="subtitle">${escapeHtml(strategy.site.description)}</p>
      <section class="stats" aria-label="归档统计">
        <div class="stat"><strong>${index.selected_article_count}</strong><span>已分析文章</span></div>
        <div class="stat"><strong>${priorityCounts.find((item) => item.id === "P0").count}</strong><span>P0 高优先级信号</span></div>
        <div class="stat"><strong>${months.length}</strong><span>归档月份</span></div>
        <div class="stat"><strong>${escapeHtml(index.generated_at.slice(0, 10))}</strong><span>最后生成</span></div>
      </section>
    </div>
  </header>

  <section class="section">
    <div class="wrap">
      <div class="section-head">
        <h2>优先级规则</h2>
        <p class="section-note">${escapeHtml(strategy.site.updateCadence)}</p>
      </div>
      <div class="priority-grid">
        ${priorityCounts.map(priorityCard).join("\n")}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="section-head">
        <h2>关注模型</h2>
        <p class="section-note">A级主题直接决定选题，B级主题必须能服务 AI 改造软件工程，C级主题只有出现代码理解、Agent 或工程效率突破时才进入主视野。</p>
      </div>
      <div class="focus-grid">
        ${areaCounts.map(focusCard).join("\n")}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap source-panel">
      <div>
        <h2>日更情报源</h2>
        <p class="section-note">当前历史归档来自 Claude 官方博客；后续每日任务按同一套策略扩展到重点公司、研究会议和工程实践来源。</p>
      </div>
      <ul>${sourceList()}</ul>
    </div>
  </section>

  <section class="toolbar">
    <div class="wrap toolbar-grid">
      <input id="search" type="search" placeholder="搜索标题、日期、主题或信号" aria-label="搜索报告">
      <select id="priority" aria-label="按优先级筛选">
        <option value="">全部优先级</option>
        ${strategy.priorityRules.map((rule) => `<option value="${escapeHtml(rule.id)}">${escapeHtml(rule.label)}</option>`).join("")}
      </select>
      <select id="area" aria-label="按关注领域筛选">
        <option value="">全部关注领域</option>
        ${visibleAreas.map((area) => `<option value="${escapeHtml(area.id)}">${escapeHtml(area.level)}级 · ${escapeHtml(area.label)}</option>`).join("")}
      </select>
      <select id="month" aria-label="按月份筛选">
        <option value="">全部月份</option>
        ${months.map((month) => `<option value="${escapeHtml(month)}">${escapeHtml(month)}</option>`).join("")}
      </select>
    </div>
  </section>

  <main>
    <div class="wrap">
      <section id="reports" class="reports">
        ${enrichedArticles.map(articleCard).join("\n")}
      </section>
      <div id="empty" class="empty">没有匹配的报告。</div>
    </div>
  </main>
  <footer>
    <div class="wrap">Archive source: <a href="${escapeHtml(index.source)}" target="_blank" rel="noopener">${escapeHtml(index.source)}</a>. Strategy: <code>monitoring/ai_native_engineering_strategy.json</code>.</div>
  </footer>
  <script>
    const search = document.getElementById('search');
    const month = document.getElementById('month');
    const priority = document.getElementById('priority');
    const area = document.getElementById('area');
    const cards = Array.from(document.querySelectorAll('.report-card'));
    const empty = document.getElementById('empty');
    function applyFilters() {
      const q = search.value.trim().toLowerCase();
      const m = month.value;
      const p = priority.value;
      const a = area.value;
      let visible = 0;
      for (const card of cards) {
        const matchSearch = !q || card.dataset.search.includes(q);
        const matchMonth = !m || card.dataset.month === m;
        const matchPriority = !p || card.dataset.priority === p;
        const matchArea = !a || card.dataset.area === a;
        const show = matchSearch && matchMonth && matchPriority && matchArea;
        card.hidden = !show;
        if (show) visible += 1;
      }
      empty.classList.toggle('show', visible === 0);
    }
    search.addEventListener('input', applyFilters);
    month.addEventListener('change', applyFilters);
    priority.addEventListener('change', applyFilters);
    area.addEventListener('change', applyFilters);
  </script>
</body>
</html>
`;

writeFileSync("index.html", html, "utf8");
console.log(`wrote index.html with ${enrichedArticles.length} reports`);
console.log(priorityCounts.map((item) => `${item.id}:${item.count}`).join(" "));
