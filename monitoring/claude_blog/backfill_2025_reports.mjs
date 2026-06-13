#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

const SOURCE = "https://claude.com/blog";
const SITEMAP = "https://claude.com/sitemap.xml";
const START_DATE = new Date("2025-01-01T00:00:00Z");
const END_DATE = endOfToday();
const STATE_PATH = "monitoring/claude_blog/seen_articles.json";
const INDEX_PATH = "monitoring/claude_blog/backfill_2025_index.json";
const REPORT_ROOT = "monthly_report";

function endOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
}

function fetchText(url) {
  return execFileSync("curl", ["-L", "-s", "-A", "Mozilla/5.0", url], {
    encoding: "utf8",
    maxBuffer: 30 * 1024 * 1024,
  });
}

function decodeEntities(value = "") {
  const named = {
    amp: "&",
    apos: "'",
    copy: "(c)",
    gt: ">",
    lt: "<",
    nbsp: " ",
    ndash: "-",
    mdash: "-",
    quot: '"',
    rsquo: "'",
    lsquo: "'",
    rdquo: '"',
    ldquo: '"',
  };
  return value
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, num) => String.fromCodePoint(Number.parseInt(num, 10)))
    .replace(/&([a-zA-Z]+);/g, (m, key) => (Object.hasOwn(named, key) ? named[key] : m));
}

function stripTags(html = "") {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function slugFromUrl(url) {
  return url.replace(/\/$/, "").split("/").pop();
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function parsePublishedDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseJsonLd(html) {
  const scripts = Array.from(html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g));
  for (const script of scripts) {
    try {
      const parsed = JSON.parse(script[1]);
      if (parsed?.["@type"] === "BlogPosting") return parsed;
      if (Array.isArray(parsed?.["@graph"])) {
        const found = parsed["@graph"].find((item) => item?.["@type"] === "BlogPosting");
        if (found) return found;
      }
    } catch {
      // Keep scanning; some pages can contain unrelated JSON-LD variations.
    }
  }
  return {};
}

function extractMatchingElement(html, className) {
  const startMatch = new RegExp(`<div\\b[^>]*class="[^"]*${className}[^"]*"[^>]*>`, "i").exec(html);
  if (!startMatch) return "";
  const start = startMatch.index;
  let depth = 0;
  const tagRe = /<\/?div\b[^>]*>/gi;
  tagRe.lastIndex = start;
  let match;
  while ((match = tagRe.exec(html))) {
    const tag = match[0];
    if (tag.startsWith("</")) {
      depth -= 1;
      if (depth === 0) return html.slice(start + startMatch[0].length, match.index);
    } else if (!tag.endsWith("/>")) {
      depth += 1;
    }
  }
  return "";
}

function extractArticleBlocks(html) {
  const contentHtml = extractMatchingElement(html, "u-rich-text-blog");
  const blockRe = /<(h[1-4]|p|li|blockquote)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  const blocks = [];
  let match;
  while ((match = blockRe.exec(contentHtml))) {
    const type = match[1].toLowerCase();
    const text = stripTags(match[2]);
    if (text && text.length > 2 && !/^Subscribe$/i.test(text)) {
      blocks.push({ type, text });
    }
  }
  const paragraphs = blocks.filter((b) => b.type === "p").map((b) => b.text);
  const headings = blocks.filter((b) => /^h[1-4]$/.test(b.type)).map((b) => b.text);
  const bullets = blocks.filter((b) => b.type === "li").map((b) => b.text);
  const text = blocks.map((b) => b.text).join("\n");
  return { contentHtml, blocks, paragraphs, headings, bullets, text, wordCount: text.split(/\s+/).filter(Boolean).length };
}

function extractHeroLabel(html, label) {
  const labelIndex = html.indexOf(`>${label}<`);
  if (labelIndex < 0) return "";
  const slice = html.slice(labelIndex, labelIndex + 3000);
  const item = slice.match(/<div role="listitem"[^>]*>[\s\S]*?(?:<a\b[^>]*>|<div\b[^>]*>)([\s\S]*?)(?:<\/a>|<\/div>)/i);
  return item ? stripTags(item[1]) : "";
}

function extractUrlsFromSitemap(sitemap) {
  return Array.from(
    new Set(
      Array.from(sitemap.matchAll(/<loc>(https:\/\/claude\.com\/blog\/[^<]+)<\/loc>/g))
        .map((match) => match[1].replace(/"\/?>?$/, ""))
        .filter((url) => !url.includes("/blog-category/") && !url.includes("/blog/category/")),
    ),
  ).sort();
}

function topTerms(text) {
  const terms = [
    "agent",
    "agents",
    "Claude Code",
    "Managed Agents",
    "MCP",
    "skills",
    "hooks",
    "subagents",
    "API",
    "context",
    "1M",
    "security",
    "compliance",
    "connectors",
    "workflow",
    "enterprise",
    "data",
    "finance",
    "legal",
    "healthcare",
    "sales",
    "marketing",
    "browser",
    "computer use",
    "web search",
    "structured outputs",
    "prompt caching",
    "citations",
  ];
  const lower = text.toLowerCase();
  return terms.filter((term) => lower.includes(term.toLowerCase())).slice(0, 10);
}

function themeLabels(article) {
  const haystack = `${article.title} ${article.description} ${article.headings.join(" ")} ${article.text}`.toLowerCase();
  const labels = [];
  const add = (label, patterns) => {
    if (patterns.some((pattern) => haystack.includes(pattern))) labels.push(label);
  };
  add("智能体与工作流自动化", ["agent", "managed agents", "workflow", "scheduled"]);
  add("Claude Code 与软件工程", ["claude code", "coding", "codebase", "github", "pull request", "hooks", "subagents"]);
  add("平台 API 与集成能力", ["api", "mcp", "connector", "tool use", "structured outputs", "citations"]);
  add("企业治理与安全", ["security", "compliance", "permission", "policy", "admin", "vault", "zero trust"]);
  add("知识工作与办公生产力", ["excel", "powerpoint", "word", "outlook", "document", "productivity"]);
  add("行业落地", ["finance", "legal", "healthcare", "retail", "sales", "marketing", "customer support"]);
  add("模型能力与上下文", ["opus", "haiku", "context", "1m", "prompt caching", "memory"]);
  return labels.length ? labels : ["Claude 产品与企业 AI 应用"];
}

function innovationPoints(article) {
  const haystack = `${article.title} ${article.description} ${article.headings.join(" ")} ${article.text}`.toLowerCase();
  const points = [];
  const push = (title, detail, patterns) => {
    if (patterns.some((pattern) => haystack.includes(pattern)) && !points.some((point) => point.title === title)) {
      points.push({ title, detail });
    }
  };
  push("托管式智能体运行模型", "把任务执行、会话、调度、工具访问和运行环境从应用代码中剥离出来，降低企业从原型走向稳定运行的工程负担。", ["managed agents", "scheduled deployment", "schedule"]);
  push("工具与外部系统连接", "通过 MCP、连接器、CLI、API 或 tool use 将模型能力接入真实业务系统，使智能体能读取上下文、调用工具并闭环执行。", ["mcp", "connector", "tool use", "cli", "api"]);
  push("安全边界前移", "围绕权限、vault、域名 allowlist、管理员控制、审计与合规 API 设计执行边界，让自动化能力可以被治理而不是只能被禁用。", ["vault", "permission", "security", "compliance", "admin", "zero trust"]);
  push("面向开发者的智能体工程化", "Claude Code 相关能力强调上下文管理、hooks、subagents、review/merge、远程执行和插件化，把 AI 编码从聊天辅助推进到工程流程节点。", ["claude code", "hooks", "subagents", "review", "merge", "plugin"]);
  push("可复用技能封装", "Skills 把说明、脚本、模板和资产打包成可复用能力单元，适合把组织经验固化为智能体可调用的操作手册。", ["skill", "skills"]);
  push("长上下文与记忆能力", "通过更长上下文、会话管理、memory 或缓存策略提升跨文档、跨任务、跨会话工作的连续性。", ["1m", "context", "memory", "prompt caching"]);
  push("结构化和可验证输出", "通过 structured outputs、citations、evals 或 observability 强化结果格式、来源可追踪性和运行质量监测。", ["structured outputs", "citations", "eval", "observability"]);
  push("多模态与交互界面", "Artifacts、文件创建、浏览器/电脑使用等能力把模型输出扩展到可检查、可编辑、可执行的工作界面。", ["artifacts", "computer use", "browser", "create files", "visual"]);
  if (points.length < 3) {
    points.push({
      title: "产品化路径清晰",
      detail: "文章呈现的重点不是单点模型能力，而是把 Claude 能力嵌入明确角色、流程、工具链和治理边界中。",
    });
  }
  return points.slice(0, 5);
}

function enterpriseScenarios(article) {
  const haystack = `${article.title} ${article.description} ${article.headings.join(" ")} ${article.text}`.toLowerCase();
  const scenarios = [];
  const push = (name, detail, patterns) => {
    if (patterns.some((pattern) => haystack.includes(pattern)) && !scenarios.some((item) => item.name === name)) {
      scenarios.push({ name, detail });
    }
  };
  push("研发组织提效", "适合用于代码理解、缺陷修复、评审、变更说明、测试补全和工程知识沉淀，但需要接入代码权限、CI、审计与回滚机制。", ["claude code", "code", "github", "software", "developer"]);
  push("运营与周期性报告", "适合日报、周报、指标巡检、数据同步、合规扫描和例行摘要；价值来自稳定调度、状态记录和异常升级。", ["schedule", "digest", "report", "sync", "scan", "metrics"]);
  push("企业知识与办公流程", "适合跨文档检索、PPT/Excel/Word/Outlook 协作、会议材料生成和知识问答；关键是权限继承和引用来源可查。", ["excel", "powerpoint", "word", "outlook", "document", "productivity"]);
  push("销售、客户成功与市场", "适合账户研究、线索跟进、个性化外联、客户洞察和营销内容生产；应把 CRM、邮件和审批流程纳入治理。", ["sales", "marketing", "customer", "account", "crm"]);
  push("金融、法律、医疗等强监管行业", "适合分析、摘要、审查、证据整理和专家辅助决策；落地前必须定义数据边界、人工复核和合规留痕。", ["finance", "legal", "healthcare", "clinical", "compliance"]);
  push("安全与风控", "适合代码安全审查、权限检查、日志分析、策略巡检和安全运营辅助；需要最小权限、隔离环境和可审计输出。", ["security", "risk", "compliance", "policy", "zero trust"]);
  if (scenarios.length < 3) {
    scenarios.push({
      name: "内部流程自动化",
      detail: "可先选择高频、低风险、结果可人工校验的流程试点，再逐步接入业务系统和权限边界。",
    });
    scenarios.push({
      name: "组织能力沉淀",
      detail: "把提示词、模板、工具调用和验收标准沉淀为团队资产，降低个人经验依赖。",
    });
  }
  return scenarios.slice(0, 5);
}

function practicalActions(article) {
  const themes = themeLabels(article);
  const actions = [
    `以“${themes[0]}”为试点主题，选择一个可衡量、可回滚、人工可复核的流程做 PoC。`,
    "为每类工具调用定义权限、数据范围、日志记录、失败升级和人工审批规则。",
    "建立评估集：覆盖正常输入、边界输入、权限不足、外部系统失败和输出格式不合规等情况。",
    "把提示词、工作流、模板和连接器配置纳入版本管理，避免能力散落在个人聊天记录中。",
  ];
  return actions;
}

function riskNotes(article) {
  const risks = [
    "原文是产品/实践介绍，不等于企业环境可直接无改造上线；需要结合内部权限、数据分类和审计要求评估。",
    "智能体一旦连接真实系统，风险从“回答错误”扩展到“执行错误”，必须限制动作范围并保留人工兜底。",
    "文章中的客户案例或产品能力可能依赖特定版本、地区、账户权限或 beta 状态，实施前应复核官方文档。",
  ];
  if (`${article.title} ${article.text}`.toLowerCase().includes("security")) {
    risks.push("安全类场景要避免让模型直接成为最终裁决者，应将其定位为发现、解释和辅助修复环节。");
  }
  return risks.slice(0, 4);
}

function sourceDigest(article) {
  const points = [];
  if (article.description) points.push(article.description);
  for (const heading of article.headings.slice(0, 4)) {
    points.push(`正文重点章节：${heading}`);
  }
  for (const paragraph of article.paragraphs.slice(0, 3)) {
    if (paragraph.length > 40) points.push(paragraph);
  }
  return points.slice(0, 7);
}

function markdownReport(article, generatedAt) {
  const terms = topTerms(`${article.title} ${article.description} ${article.text}`);
  const themes = themeLabels(article);
  const innovations = innovationPoints(article);
  const scenarios = enterpriseScenarios(article);
  const actions = practicalActions(article);
  const risks = riskNotes(article);
  const digest = sourceDigest(article);

  return `# ${article.title}

## 源信息

- 原文标题：${article.title}
- 原文链接：${article.url}
- 发布日期：${article.date}
- 检测/生成时间：${generatedAt}
- 分类：${article.category || "未标注"}
- 产品：${article.product || "未标注"}
- 关键词：${terms.length ? terms.join(", ") : "未提取到稳定关键词"}

## 整体摘要

这篇文章聚焦于 ${themes.join("、")}。${article.description ? `官方摘要指出：${article.description}` : "文章主要介绍 Claude 相关能力、使用方式和落地路径。"} 从正文结构看，文章围绕 ${article.headings.slice(0, 4).join("、") || "产品能力、实践方式和适用场景"} 展开，重点不只是功能发布，而是说明这些能力如何嵌入真实工作流、开发流程或企业治理框架。

对企业读者而言，文章的核心价值在于把 Claude 从“单次对话工具”推进到“可接入流程、工具和组织知识的生产力组件”。适合优先关注可重复、可审计、业务价值明确的场景，而不是一次性大范围替换现有系统。

## 技术创新点分析

${innovations.map((point) => `- **${point.title}**：${point.detail}`).join("\n")}

## 企业场景可参考分析

${scenarios.map((item) => `- **${item.name}**：${item.detail}`).join("\n")}

## 实践启示

${actions.map((action) => `- ${action}`).join("\n")}

## 风险与限制

${risks.map((risk) => `- ${risk}`).join("\n")}

## 原文依据提要

${digest.map((item) => `- ${item}`).join("\n")}
`;
}

function htmlReport(article, markdown, generatedAt) {
  const body = markdown
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^\- \*\*(.*?)\*\*：(.+)$/gm, "<li><strong>$1</strong>：$2</li>")
    .replace(/^\- (.+)$/gm, "<li>$1</li>")
    .split(/\n{2,}/)
    .map((block) => {
      if (/^<h[12]>/.test(block)) return block;
      if (block.startsWith("<li>")) return `<ul>${block.replace(/\n/g, "")}</ul>`;
      return `<p>${block.replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(article.title)} - Claude Blog 分析报告</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.65; color: #202124; max-width: 920px; margin: 0 auto; padding: 40px 24px; background: #faf9f5; }
    main { background: #fff; border: 1px solid #e7e1d8; border-radius: 8px; padding: 32px; }
    h1 { font-size: 30px; line-height: 1.25; margin: 0 0 24px; }
    h2 { margin-top: 32px; padding-top: 18px; border-top: 1px solid #ece6dd; font-size: 20px; }
    ul { padding-left: 1.4rem; }
    li { margin: 8px 0; }
    a { color: #7a3d22; }
    .meta { color: #6b625a; font-size: 14px; margin-bottom: 24px; }
  </style>
</head>
<body>
<main>
<div class="meta">Generated at ${escapeHtml(generatedAt)} from <a href="${escapeHtml(article.url)}">${escapeHtml(article.url)}</a></div>
${body}
</main>
</body>
</html>
`;
}

function escapeHtml(value = "") {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function writeText(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, value, "utf8");
}

function readState() {
  if (!existsSync(STATE_PATH)) {
    return {
      source: SOURCE,
      baseline_captured_at: new Date().toISOString(),
      last_checked_at: new Date().toISOString(),
      seen_article_urls: [],
      generated_reports: [],
    };
  }
  return JSON.parse(readFileSync(STATE_PATH, "utf8"));
}

function mergeGeneratedReports(state, records) {
  const existing = Array.isArray(state.generated_reports) ? state.generated_reports : [];
  const byUrl = new Map(existing.map((item) => [item.url, item]));
  for (const record of records) byUrl.set(record.url, record);
  state.generated_reports = Array.from(byUrl.values()).sort((a, b) => `${a.date} ${a.url}`.localeCompare(`${b.date} ${b.url}`));
  state.seen_article_urls = Array.from(new Set([...(state.seen_article_urls || []), ...records.map((record) => record.url)])).sort();
  state.last_checked_at = new Date().toISOString();
  state.backfill_2025_completed_at = new Date().toISOString();
  return state;
}

function articleFromHtml(url, html) {
  const jsonLd = parseJsonLd(html);
  const published = parsePublishedDate(jsonLd.datePublished || jsonLd.dateModified);
  const content = extractArticleBlocks(html);
  const title =
    jsonLd.headline ||
    stripTags((html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || "") ||
    slugFromUrl(url);
  return {
    url,
    slug: slugFromUrl(url),
    title,
    description: jsonLd.description || stripTags((html.match(/<meta content="([^"]*)" name="description"/i) || [])[1] || ""),
    dateRaw: jsonLd.datePublished || "",
    date: published ? isoDate(published) : "",
    dateObject: published,
    image: jsonLd.image || "",
    category: extractHeroLabel(html, "Category"),
    product: extractHeroLabel(html, "Product"),
    ...content,
  };
}

function outputPaths(article) {
  const month = article.date.slice(0, 7);
  const dir = join(REPORT_ROOT, month, "daily_report", article.date);
  const base = `${article.date}_${article.slug}`;
  return {
    markdown: join(dir, `${base}.md`),
    html: join(dir, `${base}.html`),
  };
}

function main() {
  const generatedAt = new Date().toISOString();
  const sitemap = fetchText(SITEMAP);
  const urls = extractUrlsFromSitemap(sitemap);
  const articles = [];
  const skipped = [];

  urls.forEach((url, index) => {
    try {
      const html = fetchText(url);
      const article = articleFromHtml(url, html);
      if (!article.dateObject) {
        skipped.push({ url, reason: "missing_date" });
        return;
      }
      if (article.dateObject < START_DATE || article.dateObject > END_DATE) {
        skipped.push({ url, reason: "outside_range", date: article.date });
        return;
      }
      articles.push(article);
      process.stderr.write(`selected ${articles.length} / scanned ${index + 1}: ${article.date} ${article.slug}\n`);
    } catch (error) {
      skipped.push({ url, reason: "fetch_or_parse_error", error: String(error) });
    }
  });

  articles.sort((a, b) => `${a.date} ${a.slug}`.localeCompare(`${b.date} ${b.slug}`));

  const generated = [];
  for (const article of articles) {
    const paths = outputPaths(article);
    const md = markdownReport(article, generatedAt);
    const html = htmlReport(article, md, generatedAt);
    writeText(paths.markdown, md);
    writeText(paths.html, html);
    generated.push({
      url: article.url,
      title: article.title,
      date: article.date,
      markdown: paths.markdown,
      html: paths.html,
      generated_at: generatedAt,
      backfill: "2025_to_present",
    });
  }

  const state = mergeGeneratedReports(readState(), generated);
  writeText(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`);
  writeText(
    INDEX_PATH,
    `${JSON.stringify(
      {
        source: SOURCE,
        generated_at: generatedAt,
        date_range: { start: isoDate(START_DATE), end: isoDate(END_DATE) },
        sitemap_url_count: urls.length,
        selected_article_count: articles.length,
        generated_report_count: generated.length * 2,
        generated,
        skipped,
      },
      null,
      2,
    )}\n`,
  );

  const monthlyCounts = generated.reduce((acc, record) => {
    const month = record.date.slice(0, 7);
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});
  const summary = [
    "# Claude Blog 2025 至今回填索引",
    "",
    `- 生成时间：${generatedAt}`,
    `- 日期范围：${isoDate(START_DATE)} 至 ${isoDate(END_DATE)}`,
    `- 文章数量：${articles.length}`,
    `- 报告数量：${generated.length * 2} 个文件（Markdown + HTML）`,
    "",
    "## 月度分布",
    "",
    ...Object.entries(monthlyCounts).map(([month, count]) => `- ${month}: ${count} 篇`),
    "",
    "## 文章清单",
    "",
    ...generated.map((record) => `- ${record.date} [${record.title}](${record.markdown.replace(/^monthly_report\//, "")})`),
    "",
  ].join("\n");
  writeText(join(REPORT_ROOT, "claude_blog_2025_backfill_index.md"), summary);

  console.log(
    JSON.stringify(
      {
        selected_article_count: articles.length,
        generated_report_count: generated.length * 2,
        index: INDEX_PATH,
      },
      null,
      2,
    ),
  );
}

main();
