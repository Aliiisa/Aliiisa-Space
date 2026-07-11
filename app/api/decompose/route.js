import { spawn } from "child_process";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const LEVEL_ONE_CELLS = [
  {
    title: "市场需求",
    detail: "先确认这件事有没有真实的人在找、在问、在愿意花钱解决。",
  },
  {
    title: "自身技能",
    detail: "盘点你眼下就能拿出来交付的能力、经验、工具和资源。",
  },
  {
    title: "可卖产品",
    detail: "把能力包装成清晰具体的服务、模板、陪跑或虚拟商品。",
  },
  {
    title: "客户群体",
    detail: "先锁定第一批最容易触达、最可能付费的人。",
  },
  {
    title: "找客户渠道",
    detail: "优先使用今天就能开始触达客户的平台、社群或熟人链路。",
  },
  {
    title: "定价",
    detail: "先用容易成交的试单价验证，再慢慢优化正式报价。",
  },
  {
    title: "交付",
    detail: "明确客户付款后，你要交什么、多久交、用什么形式交。",
  },
  {
    title: "最小验证",
    detail: "用最低成本测试：有没有人愿意问、愿意约、愿意付钱。",
  },
];

const LEVEL_TWO_DEFAULT = [
  {
    title: "观察用户反馈",
    detail: "先把真实吐槽、评论、求助和困扰收集出来，不急着下判断。",
  },
  {
    title: "搜索同类方案",
    detail: "看看别人已经怎么做，优先找正在卖、正在被问、正在被比较的方案。",
  },
  {
    title: "询问身边朋友",
    detail: "找不同背景的人聊一轮，确认问题是不是高频、明确、愿意解决。",
  },
  {
    title: "整理痛点频率",
    detail: "把收集到的问题按重复次数和紧急程度排一排，先看高频项。",
  },
  {
    title: "筛选付费意愿",
    detail: "判断这些问题里，哪些更像是用户愿意花钱省时间的。",
  },
  {
    title: "拆成最小方案",
    detail: "把想法拆成今天就能拿出来的最小服务或最小产品。",
  },
  {
    title: "记录竞品空白",
    detail: "顺手记下同类方案没讲清楚、没服务到、没做好在哪里。",
  },
  {
    title: "回填判断结论",
    detail: "把这一轮观察形成的结论回填到详情里，方便后面继续判断。",
  },
];

const LEVEL_THREE_TEMPLATES = [
  {
    match: ["观察", "反馈", "原话", "评论", "痛点", "用户", "困扰"],
    cells: [
      { title: "列10个对象", detail: "在15分钟里写出10个最可能遇到这类问题的人。" },
      { title: "发一句提问", detail: "给其中3个人发一句短问题，只问一个明确困扰。" },
      { title: "记录原话", detail: "把收到的原话直接记进备忘录，不要先替别人总结。" },
      { title: "提炼关键词", detail: "从原话里圈出重复出现的3到5个关键词。" },
      { title: "按频率排序", detail: "按出现次数从高到低排一下，先找最常见那条。" },
      { title: "搜现成解法", detail: "去平台搜一搜，看是否已经有人在卖相关解法。" },
      { title: "记价格销量", detail: "顺手记下1到3个同类方案的价格和销量线索。" },
      { title: "回填观察结论", detail: "把这轮观察结论回填到上一层详情里，写清谁最痛、痛在哪。" },
    ],
  },
  {
    match: ["询问", "朋友", "访谈", "聊天", "私信", "咨询"],
    cells: [
      { title: "选3位对象", detail: "先选出3位最适合聊这件事的人，别贪多。" },
      { title: "准备5句提问", detail: "提前写好5句自然问题，避免聊天时越问越散。" },
      { title: "逐个发出去", detail: "把问题逐个发出，优先让对方讲最近真实经历。" },
      { title: "标记高频词", detail: "把每个人回答里的高频词和情绪词做个标记。" },
      { title: "判断付费意愿", detail: "看他们更想自己熬过去，还是愿意付费换省事。" },
      { title: "追问成交信号", detail: "继续追问一句：什么情况下你会马上找人帮你做？" },
      { title: "整理阻碍点", detail: "把犹豫、抗拒和不信任的原因单独列出来。" },
      { title: "回填访谈结论", detail: "把访谈里最值得做的一条结论回填到详情页。" },
    ],
  },
  {
    match: ["搜索", "同类", "竞品", "案例", "方案", "服务"],
    cells: [
      { title: "搜10条结果", detail: "围绕当前主题先搜10条结果，别只看第一页。" },
      { title: "记标题套路", detail: "记录别人怎么命名、怎么包装、怎么打第一眼吸引力。" },
      { title: "记报价区间", detail: "摘下3到5个价格区间，判断高低价差在哪。" },
      { title: "看卖点重点", detail: "观察哪些卖点被反复强调，哪些被忽略。" },
      { title: "找评论疑问", detail: "翻评论区，记下用户最常问的疑问和担心。" },
      { title: "找体验缺口", detail: "挑出同类方案没解释清楚、没做到位的地方。" },
      { title: "留3个样本", detail: "保留3个最值得参考的样本，方便后面对比。" },
      { title: "回填竞品判断", detail: "把竞品观察结论回填详情，写清你准备怎么避开同质化。" },
    ],
  },
  {
    match: ["排序", "优先级", "打分", "筛选", "频率", "选择"],
    cells: [
      { title: "列8条备选", detail: "把和当前主题有关的8条备选方向一次写出来。" },
      { title: "设3个标准", detail: "用高频、易交付、愿付费这3个标准来打分。" },
      { title: "逐条打分", detail: "每一条备选都按1到5分打分，不要凭感觉跳过。" },
      { title: "排出前3名", detail: "选出总分最高的3条，先做最可能成的一条。" },
      { title: "删低分项", detail: "把最低分的方向先放弃，减少后面分心。" },
      { title: "补验证动作", detail: "为第一名方向补一条当天就能做的验证动作。" },
      { title: "写选择理由", detail: "用一句话写清为什么先做它，而不是别的。" },
      { title: "回填优先级", detail: "把排序结果回填详情，方便后面一直沿同一判断走。" },
    ],
  },
  {
    match: ["价格", "定价", "报价", "售卖", "客单"],
    cells: [
      { title: "找3个参考价", detail: "围绕当前主题先找3个真实可比的参考价。" },
      { title: "写低中高档", detail: "写出低价、中价、高价三个档位，先不纠结精确数字。" },
      { title: "标试单价格", detail: "先定一个最容易成交的试单价，只为了验证。" },
      { title: "写包含内容", detail: "把这个价格包含什么、不包含什么写清楚。" },
      { title: "补加价项", detail: "顺手写1到2个可加价的小升级项。" },
      { title: "测朋友反应", detail: "把价格发给1位朋友，看第一反应是贵还是值。" },
      { title: "记顾虑点", detail: "把对价格的犹豫点记下来，后面再优化话术。" },
      { title: "回填定价结论", detail: "把试单价和判断依据回填到详情页。" },
    ],
  },
  {
    match: ["验证", "测试", "试卖", "发布", "上线", "最小"],
    cells: [
      { title: "写最小版本", detail: "先用一句话写出当前主题的最小可卖版本。" },
      { title: "准备1张封面", detail: "做1张够清楚的封面，不求完美，只求能发。" },
      { title: "写一版文案", detail: "写一版发布文案，讲清适合谁、解决什么、怎么买。" },
      { title: "选1个平台", detail: "只选一个今天最容易发出去的平台，先别多线铺开。" },
      { title: "发出测试帖", detail: "今天先发1条测试内容，观察收藏、私信、评论。" },
      { title: "记首轮反馈", detail: "把第一轮反馈按想买、不懂、无感三类记下来。" },
      { title: "调1处表达", detail: "根据反馈只改1处最关键的表达。" },
      { title: "回填验证结果", detail: "把测试结果回填详情，写清是否值得继续做。" },
    ],
  },
  {
    match: ["交付", "制作", "模板", "内容", "资源", "产品"],
    cells: [
      { title: "列交付清单", detail: "把最终要交付的八成内容先列出来。" },
      { title: "选交付形式", detail: "确定是文档、模板、语音、视频还是链接形式。" },
      { title: "搭基础框架", detail: "先搭出最简单的框架，让内容有骨架可填。" },
      { title: "补关键样例", detail: "至少补1个样例，让用户一看就知道怎么用。" },
      { title: "写使用说明", detail: "用3句话说明怎么打开、怎么用、用完得到什么。" },
      { title: "检查可发送性", detail: "确认今天真的能顺利发给别人，不会卡在格式上。" },
      { title: "设交付时点", detail: "写清付款后多久交付，减少后面来回解释。" },
      { title: "回填交付说明", detail: "把交付方式和样例说明回填到详情页。" },
    ],
  },
];

const FORBIDDEN_ABSTRACT_WORDS = [
  "提升",
  "优化",
  "加强",
  "赋能",
  "布局",
  "打造",
  "深耕",
  "构建",
  "完善",
  "增强",
  "升级",
  "梳理一下",
  "分析一下",
  "做规划",
  "做分析",
  "形成闭环",
  "提高转化",
  "建立优势",
  "扩大影响力",
  "提升价值感",
];

const WEAK_TITLES = [
  "用户分析",
  "市场分析",
  "产品优化",
  "渠道研究",
  "内容优化",
  "价值提升",
  "方案设计",
  "策略优化",
  "用户调研",
  "竞品分析",
];

function fallbackCellsByLevel(level, center) {
  const topic = String(center || "待拆解").trim() || "待拆解";
  const lower = topic.toLowerCase();
  const includesAny = (...keywords) =>
    keywords.some((keyword) => topic.includes(keyword) || lower.includes(String(keyword).toLowerCase()));

  if (level === 1) return LEVEL_ONE_CELLS;
  if (level === 2) return LEVEL_TWO_DEFAULT;

  const matched = LEVEL_THREE_TEMPLATES.find((item) => includesAny(...item.match));
  return matched?.cells || [
    { title: "列出对象", detail: `围绕“${topic}”先列出今天要接触的对象或材料。` },
    { title: "提出问题", detail: "只问一个关键问题，先拿到真实反馈。" },
    { title: "记录答案", detail: "把看到或听到的答案原样记下来。" },
    { title: "提炼重点", detail: "从记录里挑出最值得继续追的重点。" },
    { title: "做出判断", detail: "写一句今天的判断，不要模糊带过。" },
    { title: "补一条验证", detail: "顺手补一条当天就能完成的小验证动作。" },
    { title: "整理结论", detail: "把过程和结论整理成一段短说明。" },
    { title: "回填详情", detail: "把这轮执行结果回填到上一层详情，方便继续推进。" },
  ];
}

function normalizeCell(cell, fallback) {
  if (typeof cell === "string") {
    const title = cell.trim();
    return {
      title: title || fallback?.title || "待拆解",
      detail: fallback?.detail || `${title || "这个格子"}的判断依据、执行方法和下一步动作。`,
    };
  }

  return {
    title: String(cell?.title || fallback?.title || "待拆解").trim(),
    detail: String(
      cell?.detail || fallback?.detail || "补充这个格子的判断依据、执行步骤和验证方式。"
    ).trim(),
  };
}

function hasBrokenText(value) {
  const text = String(value || "").trim();
  if (!text) return true;
  if (text.includes("\uFFFD")) return true;
  const questionMatches = text.match(/[?？]/g) || [];
  const chineseMatches = text.match(/[\u4e00-\u9fff]/g) || [];
  return questionMatches.length >= 3 && chineseMatches.length <= questionMatches.length;
}

function compactText(value) {
  return String(value || "")
    .replace(/[\s　]+/g, "")
    .replace(/[0-9一二三四五六七八九十①②③④⑤⑥⑦⑧]/g, "")
    .trim();
}

function titleLooksWeak(title) {
  const text = String(title || "").trim();
  if (!text) return true;
  if (WEAK_TITLES.some((item) => text.includes(item))) return true;
  return FORBIDDEN_ABSTRACT_WORDS.some((item) => text.includes(item));
}

function detailLooksWeak(detail, level) {
  const text = String(detail || "").trim();
  if (!text) return true;
  if (FORBIDDEN_ABSTRACT_WORDS.some((item) => text.includes(item))) return true;
  if (level === 3) {
    const actionHits = ["写", "发", "搜", "记", "问", "列", "选", "改", "看", "整理", "记录", "发布", "联系", "统计"].filter((item) => text.includes(item)).length;
    const quantityHits = /[0-9一二三四五六七八九十]+/.test(text);
    if (actionHits < 1) return true;
    if (!quantityHits && text.length < 12) return true;
  }
  return false;
}

function cellsAreDistinct(cells) {
  const titles = cells
    .map((cell) => compactText(cell?.title))
    .filter(Boolean);

  if (titles.length < 8) return false;
  if (new Set(titles).size < 7) return false;

  const repeatedRoots = titles.filter((title, index) => titles.indexOf(title) !== index);
  return repeatedRoots.length < 2;
}

const TOPIC_FAMILIES = [
  { id: "demand", match: ["市场需求", "需求", "痛点", "困扰", "反馈", "评论", "求助"], signals: ["用户", "痛点", "反馈", "评论", "求助", "原话", "频率", "需求"] },
  { id: "skill", match: ["自身技能", "技能", "能力", "经验", "资源", "擅长"], signals: ["技能", "经验", "案例", "工具", "能力", "样品", "资源", "交付"] },
  { id: "product", match: ["可卖产品", "产品", "商品", "服务", "模板", "资料", "课程"], signals: ["产品", "服务", "样品", "模板", "清单", "交付物", "卖点", "版本"] },
  { id: "customer", match: ["客户群体", "客户", "人群", "用户画像", "买家", "受众"], signals: ["客户", "用户", "人群", "画像", "场景", "购买", "付费", "名单"] },
  { id: "channel", match: ["找客户渠道", "渠道", "获客", "引流", "触达", "私信", "发布"], signals: ["平台", "发布", "私信", "社群", "关键词", "触达", "笔记", "渠道"] },
  { id: "pricing", match: ["价格", "定价", "报价", "售卖", "客单", "付费"], signals: ["价格", "报价", "档位", "试单", "成本", "加价", "优惠", "成交"] },
  { id: "delivery", match: ["交付", "制作", "流程", "内容", "售后", "发送"], signals: ["交付", "流程", "样例", "说明", "验收", "发送", "售后", "时间"] },
  { id: "validation", match: ["最小验证", "验证", "测试", "试卖", "上线", "复盘"], signals: ["测试", "验证", "反馈", "发布", "样本", "数据", "成交", "复盘"] },
  { id: "feedback", match: ["观察", "反馈", "原话", "评论", "困扰", "用户", "痛点"], signals: ["对象", "原话", "反馈", "关键词", "频率", "观察", "评论", "记录"] },
  { id: "interview", match: ["询问", "朋友", "访谈", "聊天", "私信", "咨询"], signals: ["提问", "聊天", "对象", "回答", "追问", "朋友", "访谈", "阻碍"] },
  { id: "search", match: ["搜索", "同类", "竞品", "案例", "方案", "服务"], signals: ["搜索", "竞品", "价格", "样本", "评论", "差异", "标题", "方案"] },
  { id: "priority", match: ["排序", "优先级", "打分", "筛选", "频率", "选择"], signals: ["打分", "排序", "标准", "前3", "低分", "优先", "备选", "选择"] },
];

function detectTopicFamily(center) {
  const topic = String(center || "").trim();
  const lower = topic.toLowerCase();
  const includesAny = (...keywords) =>
    keywords.some((keyword) => topic.includes(keyword) || lower.includes(String(keyword).toLowerCase()));

  const matched = TOPIC_FAMILIES.find((family) => includesAny(...family.match));
  return matched ? matched.id : "generic";
}

function cellsLookOnTopic(cells, center, level) {
  if (level === 1) return true;

  const family = detectTopicFamily(center);
  const expected = TOPIC_FAMILIES.find((item) => item.id === family)?.signals || [];
  if (!expected.length) return true;

  const haystack = cells.flatMap((cell) => [cell.title, cell.detail]).join(" ");
  const hitCount = expected.filter((keyword) => haystack.includes(keyword)).length;
  const threshold = cells.length <= 1 ? 1 : level === 2 ? 2 : 3;
  return hitCount >= threshold;
}

function scoreCell(cell, level, center) {
  const reasons = [];
  const title = String(cell?.title || "").trim();
  const detail = String(cell?.detail || "").trim();

  if (hasBrokenText(title) || hasBrokenText(detail)) {
    reasons.push("有乱码或异常符号");
  }
  if (titleLooksWeak(title)) {
    reasons.push("标题太空泛");
  }
  if (detailLooksWeak(detail, level)) {
    reasons.push(level === 3 ? "不够像马上能做的动作" : "详情太抽象");
  }
  if (!title || title.length > 14) {
    reasons.push("标题长度不合适");
  }
  if (level === 1) {
    const rootMatchCount = LEVEL_ONE_CELLS.filter((item) => title.includes(item.title) || item.title.includes(title)).length;
    if (!rootMatchCount) reasons.push("不像稳定的商业维度");
  }
  if (level === 2) {
    if (!["观察", "搜索", "询问", "整理", "筛选", "拆", "记录", "回填", "统计", "判断"].some((item) => title.includes(item) || detail.includes(item))) {
      reasons.push("不像具体的分析方向");
    }
  }
  if (level === 3) {
    if (!["写", "发", "搜", "记", "问", "列", "选", "改", "看", "整理", "记录", "发布", "联系", "统计"].some((item) => title.includes(item) || detail.includes(item))) {
      reasons.push("缺少明确动作");
    }
    if (!String(detail).match(/[0-9一二三四五六七八九十]/)) {
      reasons.push("缺少数量或范围");
    }
  }
  if (center && !cellsLookOnTopic([cell], center, level) && level === 3) {
    reasons.push("和当前主题关联弱");
  }

  return { ok: reasons.length === 0, reasons };
}

function validateGrid(grid, level, center) {
  const cells = Array.isArray(grid?.cells) ? grid.cells : [];
  const issues = [];
  const badIndexes = [];

  if (cells.length !== 8) {
    issues.push("格子数量不是 8 个");
  }

  if (!cellsAreDistinct(cells)) {
    issues.push("格子之间重复或过于相似");
  }

  if (!cellsLookOnTopic(cells, center, level)) {
    issues.push("整层内容和当前主题贴合度不够");
  }

  cells.forEach((cell, index) => {
    const checked = scoreCell(cell, level, center);
    if (!checked.ok) {
      badIndexes.push(index);
      issues.push(`第${index + 1}格：${checked.reasons.join("、")}`);
    }
  });

  return {
    ok: issues.length === 0,
    issues,
    badIndexes: Array.from(new Set(badIndexes)).sort((a, b) => a - b),
  };
}

function cleanCells(cells, level, center) {
  const source = Array.isArray(cells) ? cells : [];
  const fallback = fallbackCellsByLevel(level, center);
  const normalized = Array.from({ length: 8 }, (_, index) => normalizeCell(source[index], fallback[index]));

  return normalized.map((cell, index) => {
    if (hasBrokenText(cell.title) || hasBrokenText(cell.detail)) {
      return normalizeCell(fallback[index], fallback[index]);
    }
    return cell;
  });
}

function extractJson(text) {
  const raw = String(text || "").trim();
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {}

  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced) {
    try {
      return JSON.parse(fenced[1]);
    } catch {}
  }

  const start = raw.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < raw.length; index += 1) {
    const char = raw[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    if (depth === 0) {
      try {
        return JSON.parse(raw.slice(start, index + 1));
      } catch {
        return null;
      }
    }
  }

  return null;
}

function readOutputText(data) {
  return (
    data.output_text ||
    data.output?.flatMap((item) => item.content || [])?.map((content) => content.text || "")?.join("") ||
    ""
  );
}

function safeErrorMessage(error) {
  const message = String(error?.message || error || "请求失败，请稍后再试。");
  return message
    .replace(/sk-[A-Za-z0-9_-]+/g, "sk-***")
    .replace(/Bearer\s+[^\s]+/gi, "Bearer ***")
    .slice(0, 240);
}

function buildFallbackPayload({ goal, center, level, lastError }) {
  const resolvedCenter = String(center || goal || "fallback").trim();
  return {
    center: resolvedCenter,
    cells: cleanCells([], level, resolvedCenter),
    warning: safeErrorMessage(lastError),
    fallback: true,
  };
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTemporaryOpenAIError(error) {
  const message = safeErrorMessage(error).toLowerCase();
  return [
    "processing your request",
    "try again",
    "temporar",
    "timeout",
    "timed out",
    "overload",
    "server error",
    "internal error",
    "request id",
    "502",
    "503",
    "504",
    "ssl",
    "tls",
    "handshake",
    "network",
    "连接",
    "网络",
    "请求失败",
  ].some((keyword) => message.includes(keyword));
}

function looksLikeProxyFailure(error) {
  const message = safeErrorMessage(error).toLowerCase();
  return [
    "ssl",
    "tls",
    "handshake",
    "proxy",
    "failed to receive handshake",
    "could not connect",
    "connection failed",
    "curl exit",
    "连接",
    "网络",
    "代理",
  ].some((keyword) => message.includes(keyword));
}

function runCurl({ apiKey, proxy, body }) {
  return new Promise((resolve, reject) => {
    const args = ["-sS"];

    if (proxy) {
      args.push("-x", proxy);
    }

    args.push(
      "https://api.openai.com/v1/responses",
      "-H",
      `Authorization: Bearer ${apiKey}`,
      "-H",
      "Content-Type: application/json",
      "--data-binary",
      "@-"
    );

    const child = spawn("curl.exe", args, { windowsHide: true });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString("utf8");
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString("utf8");
    });

    child.on("error", (error) => reject(new Error(`无法启动网络请求：${safeErrorMessage(error)}`)));

    child.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(
            `无法连接 OpenAI API，请确认代理端口和网络。${safeErrorMessage(stderr || `curl exit ${code}`)}`
          )
        );
        return;
      }
      resolve(stdout);
    });

    child.stdin.write(body);
    child.stdin.end();
  });
}

async function callOpenAIDirect({ apiKey, body }) {
  let response;

  try {
    response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body,
    });
  } catch {
    throw new Error("连接 OpenAI API 失败，请检查当前网络是否可用。");
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error?.message || `OpenAI API 请求失败（${response.status}）`);
  }

  return data;
}

async function callOpenAIOnce({ apiKey, model, prompt }) {
  const body = JSON.stringify({
    model,
    input: prompt,
    text: { format: { type: "json_object" } },
  });

  try {
    return await callOpenAIDirect({ apiKey, body });
  } catch (directError) {
    const proxyCandidates = [
      process.env.OPENAI_PROXY_URL,
      process.env.HTTPS_PROXY,
      process.env.HTTP_PROXY,
      process.env.https_proxy,
      process.env.http_proxy,
      "http://127.0.0.1:7897",
      "http://127.0.0.1:7890",
    ].filter(Boolean);

    let lastProxyError = directError;

    for (const proxy of proxyCandidates) {
      try {
        const stdout = await runCurl({ apiKey, proxy, body });
        try {
          return JSON.parse(stdout);
        } catch {
          throw new Error("OpenAI API 返回内容无法解析。请稍后再试一次。");
        }
      } catch (proxyError) {
        lastProxyError = proxyError;
        if (!looksLikeProxyFailure(proxyError) && !isTemporaryOpenAIError(proxyError)) {
          throw proxyError;
        }
      }
    }

    throw lastProxyError;
  }
}

async function callOpenAI(args) {
  let lastError;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await callOpenAIOnce(args);
    } catch (error) {
      lastError = error;
      const canRetry = looksLikeProxyFailure(error) || isTemporaryOpenAIError(error);
      if (!canRetry || attempt === 2) {
        throw error;
      }
      await wait(700 + attempt * 900);
    }
  }

  throw lastError;
}

function buildPrompt({ goal, type, level, center, path }) {
  const parentCenter = Array.isArray(path) && path.length
    ? String(path[path.length - 1] || center || goal).trim()
    : String(center || goal).trim();
  const ancestorPath = Array.isArray(path) ? path.join(" > ") : "";

  return `
你是一个“普通人生意拆解教练”，擅长把模糊的赚钱想法拆成低成本、能验证、当天能开始做的小生意动作。

你的工作原则：
1. 优先普通人能执行，不给团队化、融资化、宏大战略化建议。
2. 优先低成本验证，不鼓励高投入长周期方案。
3. 少讲概念，多给动作；少讲口号，多给对象、数量、步骤。
4. 不要使用空泛词，例如：提升、优化、加强、赋能、布局、打造、深耕、构建、完善、增强。
5. 每个输出都要让用户看完就知道下一步做什么。
6. 严格围绕当前层级和当前中心主题，不要把别的格子答案套过来。
7. 每一格都要像给真人看的工作提示：对象明确、动作明确、判断方式明确。

当前任务要求：
1. 只输出 JSON，不要解释，不要 Markdown。
2. JSON 格式必须是：{"center":"...","cells":[{"title":"...","detail":"..."}]}
3. cells 必须刚好 8 个，每个 cell 都必须有 title 和 detail。
4. title 尽量不超过 12 个中文字符；detail 用 1 到 2 句话写清判断标准、执行方法或验证方式。
5. 第一层必须输出稳定商业维度，优先使用：市场需求、自身技能、可卖产品、客户群体、找客户渠道、定价、交付、最小验证。
6. 第二层必须围绕当前维度拆成 8 个不同的分析方向，不能只是换近义词；要在对象、场景、动作和判断方式上明显不同。
7. 第三层必须围绕当前中心主题拆成 8 个当天能开始、15 分钟内可启动的小动作；每一格都要包含动作、对象、数量或记录方式，不能只写名词。
8. 不要输出这些类型的弱内容：用户分析、市场分析、产品优化、渠道研究、做规划、做分析、提升价值感。
9. 当前是第三层时，detail 里要顺手说明如何把结果回填到上一层详情里。
10. 如果用户目标偏副业、小红书、个人服务，请优先给“先验证、先触达、先收反馈”的路径。
11. 第二层和第三层必须明显服务于“当前中心主题”；如果换到别的格子也能用，就说明太泛，要重写。
12. detail 不要只解释概念，要写成温和但具体的开工提示，例如“先列出10个对象”“发一句问题”“记录3条原话”“用价格/反馈/回复数判断”。

用户核心目标：${goal}
业务类型：${type}
当前层级：第 ${level} 层
当前中心主题：${center || goal}
当前父主题：${parentCenter}
完整路径：${ancestorPath || "无"}
`;
}

function buildRepairPrompt({ goal, type, level, center, path, original, issues, badIndexes }) {
  const indexes = badIndexes.length ? badIndexes.map((item) => item + 1).join("、") : "全部 8 格";

  return `
你刚刚输出的一版拆解不够合格，现在请你重写。

用户核心目标：${goal}
业务类型：${type}
当前层级：第 ${level} 层
当前中心主题：${center || goal}
完整路径：${Array.isArray(path) && path.length ? path.join(" > ") : "无"}

原始输出：
${JSON.stringify(original, null, 2)}

不合格原因：
${issues.map((item) => `- ${item}`).join("\n")}

重写要求：
1. 仍然只输出 JSON，不要解释。
2. 仍然输出完整 8 格，不要只输出坏格子。
3. 重点修复这些格子：${indexes}
4. 如果是第二层，请确保 8 格是真正不同的分析方向。
5. 如果是第三层，请确保每格都是今天就能开始的具体动作，不要再出现空泛词。
6. 每格必须贴住当前中心主题，不能输出所有主题都能套用的“列名单、发问题、记录答案”模板。
7. 每格 detail 都要有对象、数量、工具或判断标准中的至少一项。
6. 不要重复原先不合格的表达。
7. 如果不确定，宁可更具体、更小、更像动作。

输出格式必须是：
{"center":"...","cells":[{"title":"...","detail":"..."}]}
`;
}

async function generateGrid({ apiKey, model, goal, type, level, center, path }) {
  const firstPrompt = buildPrompt({ goal, type, level, center, path });
  const firstData = await callOpenAI({ apiKey, model, prompt: firstPrompt });
  const firstOutput = readOutputText(firstData);
  const firstParsed = extractJson(firstOutput);
  if (!firstParsed) {
    throw new Error("AI 返回内容暂时没整理好，我们再试一次。");
  }

  const firstCenter = String(firstParsed.center || center || goal || "待拆解").trim();
  const firstGrid = {
    center: firstCenter,
    cells: cleanCells(firstParsed.cells, level, firstCenter),
  };

  const firstCheck = validateGrid(firstGrid, level, firstCenter);
  if (firstCheck.ok) {
    return firstGrid;
  }

  const repairPrompt = buildRepairPrompt({
    goal,
    type,
    level,
    center: firstCenter,
    path,
    original: firstGrid,
    issues: firstCheck.issues,
    badIndexes: firstCheck.badIndexes,
  });

  const repairData = await callOpenAI({ apiKey, model, prompt: repairPrompt });
  const repairOutput = readOutputText(repairData);
  const repairParsed = extractJson(repairOutput);
  if (!repairParsed) {
    return firstGrid;
  }

  const repairCenter = String(repairParsed.center || firstCenter || goal || "待拆解").trim();
  const repairedGrid = {
    center: repairCenter,
    cells: cleanCells(repairParsed.cells, level, repairCenter),
  };

  const repairedCheck = validateGrid(repairedGrid, level, repairCenter);
  return repairedCheck.ok ? repairedGrid : firstGrid;
}

export async function POST(request) {
  const payload = await request.json().catch(() => ({}));
  const { goal = "", type = "自定义", level = 1, center = "", path = [] } = payload;
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  if (!apiKey) {
    return NextResponse.json(
      { error: "还没有配置 OPENAI_API_KEY，请先在环境变量里添加。" },
      { status: 400 }
    );
  }

  let lastError = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const grid = await generateGrid({ apiKey, model, goal, type, level, center, path });
      return NextResponse.json(grid);
    } catch (error) {
      lastError = error;
      if (isTemporaryOpenAIError(error) || looksLikeProxyFailure(error)) {
        await wait(600 * (attempt + 1));
        continue;
      }
      return NextResponse.json({ error: safeErrorMessage(error) }, { status: 500 });
    }
  }

  return NextResponse.json(
    buildFallbackPayload({ goal, center, level, lastError }),
    { status: 200 }
  );
}
