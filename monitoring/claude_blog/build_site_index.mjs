#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";

const index = JSON.parse(readFileSync("monitoring/claude_blog/backfill_2025_index.json", "utf8"));
const articles = index.generated.slice().sort((a, b) => `${b.date} ${b.title}`.localeCompare(`${a.date} ${a.title}`));
const months = Array.from(new Set(articles.map((item) => item.date.slice(0, 7)))).sort().reverse();

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function articleCard(article) {
  const month = article.date.slice(0, 7);
  return `<article class="report-card" data-month="${escapeHtml(month)}" data-search="${escapeHtml(`${article.title} ${article.date} ${article.url}`.toLowerCase())}">
    <div class="date">${escapeHtml(article.date)}</div>
    <h2>${escapeHtml(article.title)}</h2>
    <p class="source"><a href="${escapeHtml(article.url)}" target="_blank" rel="noopener">Claude Blog 原文</a></p>
    <div class="actions">
      <a class="button primary" href="${escapeHtml(article.html)}">查看 HTML 报告</a>
      <a class="button" href="${escapeHtml(article.markdown)}">查看 Markdown</a>
    </div>
  </article>`;
}

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Claude Blog 分析报告索引</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f7f4ee;
      --panel: #fffdfa;
      --text: #211f1c;
      --muted: #6f655c;
      --border: #e5ded3;
      --accent: #8a4524;
      --accent-strong: #69331b;
      --chip: #eee5da;
      --shadow: 0 18px 60px rgba(54, 39, 24, 0.08);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.55;
    }
    header {
      padding: 48px 24px 28px;
      border-bottom: 1px solid var(--border);
      background: linear-gradient(180deg, #fffaf2 0%, #f7f4ee 100%);
    }
    .wrap { max-width: 1180px; margin: 0 auto; }
    h1 {
      margin: 0 0 12px;
      font-size: clamp(32px, 5vw, 56px);
      line-height: 1.05;
      letter-spacing: 0;
    }
    .subtitle { margin: 0; max-width: 820px; color: var(--muted); font-size: 18px; }
    .stats {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
      margin-top: 28px;
    }
    .stat {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px;
      box-shadow: var(--shadow);
    }
    .stat strong { display: block; font-size: 28px; line-height: 1; }
    .stat span { color: var(--muted); font-size: 13px; }
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 2;
      background: rgba(247, 244, 238, 0.94);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      padding: 14px 24px;
    }
    .toolbar-grid {
      display: grid;
      grid-template-columns: 1fr 220px;
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
      padding: 12px 14px;
    }
    main { padding: 28px 24px 64px; }
    .reports {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
    }
    .report-card {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 8px;
      min-height: 220px;
      padding: 18px;
      box-shadow: var(--shadow);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .report-card[hidden] { display: none; }
    .date {
      width: fit-content;
      border-radius: 999px;
      background: var(--chip);
      color: var(--accent-strong);
      padding: 4px 10px;
      font-size: 13px;
      font-weight: 650;
    }
    h2 {
      margin: 0;
      font-size: 19px;
      line-height: 1.28;
      letter-spacing: 0;
    }
    .source { margin: 0; color: var(--muted); }
    a { color: var(--accent); }
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
      font-weight: 620;
    }
    .button.primary {
      background: var(--accent);
      border-color: var(--accent);
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
    }
    @media (max-width: 900px) {
      .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .reports { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 640px) {
      header { padding-top: 34px; }
      .toolbar-grid { grid-template-columns: 1fr; }
      .stats, .reports { grid-template-columns: 1fr; }
      .report-card { min-height: 0; }
    }
  </style>
</head>
<body>
  <header>
    <div class="wrap">
      <h1>Claude Blog 分析报告索引</h1>
      <p class="subtitle">收录 Claude Blog 从 ${escapeHtml(index.date_range.start)} 至 ${escapeHtml(index.date_range.end)} 的文章分析，包含整体摘要、技术创新点和企业场景参考。</p>
      <section class="stats" aria-label="归档统计">
        <div class="stat"><strong>${index.selected_article_count}</strong><span>文章分析</span></div>
        <div class="stat"><strong>${index.generated_report_count}</strong><span>报告文件</span></div>
        <div class="stat"><strong>${months.length}</strong><span>归档月份</span></div>
        <div class="stat"><strong>${escapeHtml(index.generated_at.slice(0, 10))}</strong><span>最后生成</span></div>
      </section>
    </div>
  </header>
  <section class="toolbar">
    <div class="wrap toolbar-grid">
      <input id="search" type="search" placeholder="搜索标题、日期或原文 URL" aria-label="搜索报告">
      <select id="month" aria-label="按月份筛选">
        <option value="">全部月份</option>
        ${months.map((month) => `<option value="${escapeHtml(month)}">${escapeHtml(month)}</option>`).join("")}
      </select>
    </div>
  </section>
  <main>
    <div class="wrap">
      <section id="reports" class="reports">
        ${articles.map(articleCard).join("\n")}
      </section>
      <div id="empty" class="empty">没有匹配的报告。</div>
    </div>
  </main>
  <footer>
    <div class="wrap">Source: <a href="${escapeHtml(index.source)}" target="_blank" rel="noopener">${escapeHtml(index.source)}</a>. Reports generated locally from official Claude Blog pages.</div>
  </footer>
  <script>
    const search = document.getElementById('search');
    const month = document.getElementById('month');
    const cards = Array.from(document.querySelectorAll('.report-card'));
    const empty = document.getElementById('empty');
    function applyFilters() {
      const q = search.value.trim().toLowerCase();
      const m = month.value;
      let visible = 0;
      for (const card of cards) {
        const matchSearch = !q || card.dataset.search.includes(q);
        const matchMonth = !m || card.dataset.month === m;
        const show = matchSearch && matchMonth;
        card.hidden = !show;
        if (show) visible += 1;
      }
      empty.classList.toggle('show', visible === 0);
    }
    search.addEventListener('input', applyFilters);
    month.addEventListener('change', applyFilters);
  </script>
</body>
</html>
`;

writeFileSync("index.html", html, "utf8");
console.log(`wrote index.html with ${articles.length} reports`);
