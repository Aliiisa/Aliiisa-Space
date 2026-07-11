"use client";

import { useEffect, useMemo, useState } from "react";

const BUSINESS_TYPES = ["副业赚钱", "内容账号", "本地服务", "电商选品", "个人技能变现", "自定义"];
const LEVEL_NAMES = ["第一层", "第二层", "第三层"];
const STORAGE_KEY = "business-grid-plans-v4";
const ACCESS_KEY = "business-grid-access-v1";
const BOARD_POSITIONS = [0, 1, 2, 3, "center", 4, 5, 6, 7];

const ROOT_DEFAULTS = [
  { title: "市场需求", detail: "先确认这件事有没有真实的人在找、在问、在愿意花钱解决。" },
  { title: "自身技能", detail: "盘点你眼下就能拿出来交付的能力、经验、工具和资源。" },
  { title: "可卖产品", detail: "把能力包装成清晰具体的服务、模板、陪跑或虚拟商品。" },
  { title: "客户群体", detail: "先锁定第一批最容易触达、最可能付费的人。" },
  { title: "找客户渠道", detail: "优先使用今天就能开始触达客户的平台、社群或熟人链路。" },
  { title: "定价", detail: "先用容易成交的试单价验证，再慢慢优化正式报价。" },
  { title: "交付", detail: "明确客户付款后，你要交什么、多久交、用什么形式交。" },
  { title: "最小验证", detail: "用最低成本测试：有没有人愿意问、愿意约、愿意付钱。" },
];

const SECOND_LAYER_DEFAULTS = [
  { title: "观察用户反馈", detail: "先把真实吐槽、评论、求助和困扰收集出来，不急着下判断。" },
  { title: "搜索同类方案", detail: "看看别人已经怎么做，优先找正在卖、正在被问、正在被比较的方案。" },
  { title: "询问身边朋友", detail: "找不同背景的人聊一轮，确认问题是不是高频、明确、愿意解决。" },
  { title: "整理痛点频率", detail: "把收集到的问题按重复次数和紧急程度排一排，先看高频项。" },
  { title: "筛选付费意愿", detail: "判断这些问题里，哪些更像是用户愿意花钱省时间的。" },
  { title: "拆成最小方案", detail: "把想法拆成今天就能拿出来的最小服务或最小产品。" },
  { title: "记录竞品空白", detail: "顺手记下同类方案没讲清楚、没服务到、没做好在哪里。" },
  { title: "回填判断结论", detail: "把这一轮观察形成的结论回填到详情里，方便后面继续判断。" },
];

const THIRD_LAYER_TEMPLATES = [
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

function looksBrokenText(value) {
  const text = String(value || "").trim();
  if (!text) return true;
  if (text.includes("�")) return true;
  const questionMatches = text.match(/[?？]/g) || [];
  const chineseMatches = text.match(/[一-鿿]/g) || [];
  if (questionMatches.length >= 4) return true;
  return questionMatches.length >= 2 && chineseMatches.length <= questionMatches.length + 1;
}

function fallbackCellsByLevel(level, center) {
  const topic = String(center || "待拆解").trim() || "待拆解";
  const lower = topic.toLowerCase();
  const includesAny = (...keywords) =>
    keywords.some((keyword) => topic.includes(keyword) || lower.includes(String(keyword).toLowerCase()));

  if (level === 1) return ROOT_DEFAULTS;
  if (level === 2) return SECOND_LAYER_DEFAULTS;

  const matched = THIRD_LAYER_TEMPLATES.find((item) => includesAny(...item.match));
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
  const fallbackTitle = fallback?.title || "待拆解";
  const fallbackDetail = fallback?.detail || "补充这个格子的判断依据、执行步骤和验证方式。";

  if (typeof cell === "string") {
    const title = looksBrokenText(cell) ? fallbackTitle : cell.trim();
    return { title: title || fallbackTitle, detail: fallbackDetail };
  }

  const title = String(cell?.title || "").trim();
  const detail = String(cell?.detail || "").trim();
  return {
    title: looksBrokenText(title) ? fallbackTitle : title || fallbackTitle,
    detail: looksBrokenText(detail) ? fallbackDetail : detail || fallbackDetail,
  };
}

function normalizeGrid(grid, level, center) {
  const fallbacks = fallbackCellsByLevel(level, center);
  const cells = Array.from({ length: 8 }, (_, index) => normalizeCell(grid?.cells?.[index], fallbacks[index]));
  const fallbackCenter = String(center || grid?.center || "待拆解").trim() || "待拆解";
  const normalizedCenter = looksBrokenText(grid?.center) ? fallbackCenter : String(grid?.center || fallbackCenter).trim();
  return { center: normalizedCenter, cells };
}

function pathKey(path) {
  return (Array.isArray(path) ? path : []).join("|||");
}

function getBranch(branches, path) {
  return branches[pathKey(path)] || null;
}

function renameBranchTree(branches, oldPath, newPath) {
  const next = {};
  Object.entries(branches).forEach(([key, value]) => {
    const parts = key.split("|||").filter(Boolean);
    const matched = oldPath.every((item, index) => parts[index] === item);
    if (matched) {
      const replaced = [...newPath, ...parts.slice(oldPath.length)];
      next[pathKey(replaced)] = value;
    } else {
      next[key] = value;
    }
  });
  return next;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function compactText(value, limit = 40) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
}

function loadSnapshots() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeBranchesMap(source) {
  return Object.fromEntries(
    Object.entries(source || {}).map(([key, grid]) => {
      const parts = key.split("|||").filter(Boolean);
      const level = parts.length === 1 ? 2 : 3;
      const center = parts[parts.length - 1] || "待拆解";
      return [key, normalizeGrid(grid, level, center)];
    })
  );
}

function collectLeafTasks(branches) {
  return Object.entries(branches)
    .filter(([key]) => key.split("|||").length === 2)
    .flatMap(([key, grid]) => {
      const path = key.split("|||");
      return (grid?.cells || []).map((cell, index) => ({
        id: `${key}-${index}`,
        root: path[0],
        parent: path[1],
        title: cell.title,
        detail: cell.detail,
      }));
    });
}

function createCanvas(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return { canvas, ctx: canvas.getContext("2d") };
}
function wrapText(ctx, text, maxWidth) {
  const chars = String(text || "").split("");
  const lines = [];
  let current = "";
  chars.forEach((char) => {
    const next = current + char;
    if (ctx.measureText(next).width > maxWidth && current) {
      lines.push(current);
      current = char;
    } else {
      current = next;
    }
  });
  if (current) lines.push(current);
  return lines;
}

function setCanvasFont(ctx, size, weight = 700) {
  ctx.font = `${weight} ${size}px "Microsoft YaHei", "PingFang SC", Arial, sans-serif`;
}

function roundRect(ctx, x, y, width, height, radius = 18) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function downloadCanvas(canvas, filename) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function safeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");
}

export default function Page() {
  const [goal, setGoal] = useState("");
  const [businessType, setBusinessType] = useState(BUSINESS_TYPES[0]);
  const [rootGrid, setRootGrid] = useState(() => normalizeGrid({ center: "你的商业目标", cells: ROOT_DEFAULTS }, 1, "你的商业目标"));
  const [branches, setBranches] = useState({});
  const [currentLevel, setCurrentLevel] = useState(1);
  const [path, setPath] = useState([]);
  const [viewMode, setViewMode] = useState("current");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [bulkProgress, setBulkProgress] = useState("");
  const [editing, setEditing] = useState(null);
  const [plans, setPlans] = useState([]);
  const [activePlanId, setActivePlanId] = useState(null);
  const [expandedAction, setExpandedAction] = useState(null);
  const [splashDone, setSplashDone] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [accessLoading, setAccessLoading] = useState(false);
  const [accessError, setAccessError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setSplashDone(true), 1100);
    const storedAccess = window.localStorage.getItem(ACCESS_KEY);
    if (storedAccess) setAccessGranted(true);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const snapshots = loadSnapshots();
    setPlans(snapshots);
    if (!snapshots.length) return;
    const latest = snapshots[0];
    restorePlan(latest);
  }, []);

  const currentGrid = useMemo(() => {
    if (currentLevel === 1) return rootGrid;
    return getBranch(branches, path) || normalizeGrid({ center: path[path.length - 1], cells: fallbackCellsByLevel(currentLevel, path[path.length - 1]) }, currentLevel, path[path.length - 1]);
  }, [branches, currentLevel, path, rootGrid]);

  const levelDoneCount = useMemo(() => {
    if (currentLevel === 3) return 8;
    return currentGrid.cells.filter((cell) => !!getBranch(branches, [...path, cell.title])).length;
  }, [branches, currentGrid, currentLevel, path]);

  const allLeafTasks = useMemo(() => collectLeafTasks(branches), [branches]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const snapshot = makeSnapshot();
    if (!snapshot) return;
    const previous = loadSnapshots().filter((item) => item.id !== snapshot.id);
    const merged = [snapshot, ...previous].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    setPlans(merged);
  }, [goal, businessType, rootGrid, branches, currentLevel, path, viewMode, activePlanId]);

  async function handleAccessSubmit(event) {
    event.preventDefault();
    const code = accessCode.trim();
    if (!code) {
      setAccessError("请先输入兑换码。");
      return;
    }

    setAccessLoading(true);
    setAccessError("");

    try {
      const response = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "兑换码无效或已过期。");
      }
      window.localStorage.setItem(ACCESS_KEY, JSON.stringify({ unlockedAt: Date.now(), code: code.slice(-4) }));
      setAccessGranted(true);
      setAccessCode("");
    } catch (accessProblem) {
      setAccessError(accessProblem.message || "验证失败，请稍后再试。");
    } finally {
      setAccessLoading(false);
    }
  }

  function clearAccess() {
    window.localStorage.removeItem(ACCESS_KEY);
    setAccessGranted(false);
    setAccessCode("");
    setAccessError("");
  }

  function makeSnapshot() {
    const hasContent = goal.trim() || Object.keys(branches).length || rootGrid.cells.some((cell) => cell.title !== "待拆解");
    if (!hasContent) return null;
    return {
      id: activePlanId || `plan-${Date.now()}`,
      name: goal.trim() || rootGrid.center || "未命名计划",
      goal,
      businessType,
      rootGrid,
      branches: normalizeBranchesMap(branches),
      currentLevel,
      path,
      viewMode,
      updatedAt: Date.now(),
    };
  }

  function restorePlan(plan) {
    setGoal(plan.goal || "");
    setBusinessType(plan.businessType || BUSINESS_TYPES[0]);
    setRootGrid(normalizeGrid(plan.rootGrid, 1, plan.goal || "你的商业目标"));
    setBranches(normalizeBranchesMap(plan.branches || {}));
    setCurrentLevel(plan.currentLevel || 1);
    setPath(Array.isArray(plan.path) ? plan.path : []);
    setViewMode(plan.viewMode || "current");
    setActivePlanId(plan.id || null);
    setError("");
    setBulkProgress("");
  }

  async function requestGrid({ level, center, pathValue }) {
    const response = await fetch("/api/decompose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal, type: businessType, level, center, path: pathValue }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "这次拆解没有成功，我们稍后再试一次。")
    }

    if (data.warning) {
      setBulkProgress("OpenAI 这次有点慢，我先用保底内容帮你续上了。等网络稳一点，再点一次，会更像 AI 精修版。");
    }

    return normalizeGrid(data, level, center);
  }

  async function handleStart() {
    if (!goal.trim()) {
      setError("先写一句你现在最想拆清楚的商业目标，我们再开始。");
      return;
    }

    setLoading(true);
    setError("");
    setBulkProgress("");

    try {
      const grid = await requestGrid({ level: 1, center: goal.trim(), pathValue: [] });
      setRootGrid({ ...grid, center: goal.trim() });
      setCurrentLevel(1);
      setPath([]);
      setViewMode("current");
      setActivePlanId((value) => value || `plan-${Date.now()}`);
    } catch (requestError) {
      setError(String(requestError.message || requestError));
    } finally {
      setLoading(false);
    }
  }

  async function openNextLevel(index) {
    if (currentLevel >= 3) return;
    const cell = currentGrid.cells[index];
    const nextLevel = currentLevel + 1;
    const nextPath = [...path, cell.title];
    const existing = getBranch(branches, nextPath);

    setError("");
    if (!existing) {
      setLoading(true);
      try {
        const grid = await requestGrid({ level: nextLevel, center: cell.title, pathValue: nextPath });
        setBranches((prev) => ({ ...normalizeBranchesMap(prev), [pathKey(nextPath)]: grid }));
      } catch (requestError) {
        setError(String(requestError.message || requestError));
        setLoading(false);
        return;
      }
      setLoading(false);
    }

    setCurrentLevel(nextLevel);
    setPath(nextPath);
    setViewMode("current");
  }

  function goBackOneLevel() {
    setError("");
    if (currentLevel === 1) return;
    if (currentLevel === 2) {
      setCurrentLevel(1);
      setPath([]);
      return;
    }
    setCurrentLevel(2);
    setPath((prev) => prev.slice(0, 1));
  }

  function goToLevel(targetLevel) {
    if (targetLevel === currentLevel) return;
    if (targetLevel === 1) {
      setCurrentLevel(1);
      setPath([]);
      return;
    }
    if (targetLevel === 2 && path.length >= 1) {
      setCurrentLevel(2);
      setPath((prev) => prev.slice(0, 1));
    }
    if (targetLevel === 3 && path.length >= 2) {
      setCurrentLevel(3);
      setPath((prev) => prev.slice(0, 2));
    }
  }

  function updateCell(index, patch) {
    if (currentLevel === 1) {
      setRootGrid((prev) => {
        const oldTitle = prev.cells[index].title;
        const merged = { ...prev.cells[index], ...patch };
        const next = { ...prev, cells: prev.cells.map((cell, cellIndex) => (cellIndex === index ? merged : cell)) };
        if (patch.title && patch.title !== oldTitle) {
          setBranches((branchState) => renameBranchTree(branchState, [oldTitle], [patch.title.trim() || oldTitle]));
          if (path[0] === oldTitle) {
            setPath((prevPath) => [patch.title.trim() || oldTitle, ...prevPath.slice(1)]);
          }
        }
        return next;
      });
      return;
    }

    const currentPath = [...path];
    setBranches((prev) => {
      const source = getBranch(prev, currentPath) || currentGrid;
      const oldTitle = source.cells[index].title;
      const merged = { ...source.cells[index], ...patch };
      const updatedGrid = { ...source, cells: source.cells.map((cell, cellIndex) => (cellIndex === index ? merged : cell)) };
      let next = { ...prev, [pathKey(currentPath)]: updatedGrid };
      if (patch.title && patch.title !== oldTitle) {
        next = renameBranchTree(next, [...currentPath, oldTitle], [...currentPath, patch.title.trim() || oldTitle]);
        if (path[1] === oldTitle && currentLevel === 3) {
          setPath((prevPath) => [prevPath[0], patch.title.trim() || oldTitle]);
        }
      }
      return next;
    });
  }
  async function redecomposeCurrentLayer() {
    if (currentLevel === 3) return;
    setLoading(true);
    setError("");

    try {
      for (let index = 0; index < currentGrid.cells.length; index += 1) {
        const cell = currentGrid.cells[index];
        const nextLevel = currentLevel + 1;
        const nextPath = [...path, cell.title];
        setBulkProgress(`正在整理：${cell.title} ${index + 1}/8`);
        const grid = await requestGrid({ level: nextLevel, center: cell.title, pathValue: nextPath });
        setBranches((prev) => ({ ...normalizeBranchesMap(prev), [pathKey(nextPath)]: grid }));
        await wait(900);
      }
      setBulkProgress("这一层的 8 个格子已经重新拆好了。去看看会更清楚。");
    } catch (requestError) {
      setError(String(requestError.message || requestError));
    } finally {
      setLoading(false);
    }
  }

  function createNewPlan() {
    setGoal("");
    setBusinessType(BUSINESS_TYPES[0]);
    setRootGrid(normalizeGrid({ center: "你的商业目标", cells: ROOT_DEFAULTS }, 1, "你的商业目标"));
    setBranches({});
    setCurrentLevel(1);
    setPath([]);
    setViewMode("current");
    setError("");
    setBulkProgress("");
    setActivePlanId(`plan-${Date.now()}`);
  }

  function deletePlan(id) {
    if (typeof window === "undefined") return;
    const next = loadSnapshots().filter((item) => item.id !== id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setPlans(next);
    if (activePlanId === id) createNewPlan();
  }

  async function copyResult() {
    const payload = {
      goal,
      businessType,
      rootGrid,
      branches: normalizeBranchesMap(branches),
    };
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function currentBoardData() {
    return BOARD_POSITIONS.map((slot) => {
      if (slot === "center") {
        return { kind: "center", title: currentGrid.center, detail: currentLevel === 1 ? goal || "先写目标，再一点点拆开。" : `当前正在处理：${currentGrid.center}` };
      }
      const cell = currentGrid.cells[slot];
      const child = currentLevel < 3 ? getBranch(branches, [...path, cell.title]) : null;
      return {
        kind: "cell",
        index: slot,
        title: cell.title,
        detail: cell.detail,
        done: !!child,
        badge: currentLevel === 3 ? "今天能做" : child ? `已拆到${LEVEL_NAMES[currentLevel]}` : "待拆解",
      };
    });
  }

  function exportCurrentPng() {
    const board = currentBoardData();
    const { canvas, ctx } = createCanvas(1280, 1600);
    ctx.fillStyle = "#f7f3eb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setCanvasFont(ctx, 42, 800);
    ctx.fillStyle = "#1f2a28";
    ctx.fillText(goal || currentGrid.center, 80, 110);
    setCanvasFont(ctx, 24, 500);
    ctx.fillStyle = "#6b776e";
    ctx.fillText(`${LEVEL_NAMES[currentLevel - 1]} · ${currentGrid.center}`, 80, 156);

    const cellWidth = 360;
    const cellHeight = 240;
    const startX = 80;
    const startY = 220;
    const gap = 28;

    board.forEach((item, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      const x = startX + col * (cellWidth + gap);
      const y = startY + row * (cellHeight + gap);
      const isCenter = item.kind === "center";
      ctx.fillStyle = isCenter ? "#215a52" : item.done ? "#e5f3ee" : "#fffdf8";
      ctx.strokeStyle = isCenter ? "#215a52" : item.done ? "#9ac6b6" : "#d9e2dc";
      ctx.lineWidth = 2;
      roundRect(ctx, x, y, cellWidth, cellHeight, 24);
      ctx.fill();
      ctx.stroke();

      setCanvasFont(ctx, isCenter ? 30 : 24, 800);
      ctx.fillStyle = isCenter ? "#ffffff" : "#1f2a28";
      wrapText(ctx, item.title, cellWidth - 44).slice(0, 2).forEach((line, lineIndex) => {
        ctx.fillText(line, x + 22, y + 52 + lineIndex * 34);
      });

      setCanvasFont(ctx, 18, 500);
      ctx.fillStyle = isCenter ? "#dce9e4" : "#5f6d65";
      wrapText(ctx, item.detail, cellWidth - 44).slice(0, 5).forEach((line, lineIndex) => {
        ctx.fillText(line, x + 22, y + 118 + lineIndex * 26);
      });

      if (!isCenter) {
        ctx.fillStyle = item.done ? "#215a52" : "#c08b2c";
        roundRect(ctx, x + cellWidth - 118, y + 18, 96, 34, 16);
        ctx.fill();
        setCanvasFont(ctx, 14, 700);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(item.done ? "已拆解" : "待拆解", x + cellWidth - 96, y + 41);
      }
    });

    downloadCanvas(canvas, `当前九宫格-${Date.now()}.png`);
  }

  function exportGlobalPng() {
    const roots = rootGrid.cells;
    const height = 260 + roots.length * 180;
    const { canvas, ctx } = createCanvas(1200, height);
    ctx.fillStyle = "#f7f3eb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setCanvasFont(ctx, 42, 800);
    ctx.fillStyle = "#1f2a28";
    ctx.fillText(goal || "普通人生意行动全局图", 70, 100);
    setCanvasFont(ctx, 24, 500);
    ctx.fillStyle = "#6b776e";
    ctx.fillText("按第一层主线展开，随时能看全局，也能回到局部继续改。", 70, 145);

    roots.forEach((cell, index) => {
      const y = 200 + index * 160;
      const child = getBranch(branches, [cell.title]);
      ctx.fillStyle = child ? "#e5f3ee" : "#fffdf8";
      ctx.strokeStyle = child ? "#9ac6b6" : "#d9e2dc";
      ctx.lineWidth = 2;
      roundRect(ctx, 60, y, 1080, 130, 24);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#215a52";
      setCanvasFont(ctx, 26, 800);
      ctx.fillText(`${index + 1}. ${cell.title}`, 90, y + 46);
      ctx.fillStyle = "#55645d";
      setCanvasFont(ctx, 20, 500);
      wrapText(ctx, cell.detail, 700).slice(0, 2).forEach((line, lineIndex) => {
        ctx.fillText(line, 90, y + 82 + lineIndex * 28);
      });
      setCanvasFont(ctx, 18, 700);
      ctx.fillStyle = child ? "#215a52" : "#c08b2c";
      ctx.fillText(child ? "第二层已拆开" : "还没继续往下拆", 900, y + 46);
      if (child) {
        ctx.fillStyle = "#55645d";
        wrapText(ctx, child.cells.map((item) => item.title).join("、"), 210).slice(0, 2).forEach((line, lineIndex) => {
          ctx.fillText(line, 900, y + 80 + lineIndex * 26);
        });
      }
    });

    downloadCanvas(canvas, `全局地图-${Date.now()}.png`);
  }

  function exportGuidePdf() {
    const allTasks = collectLeafTasks(branches);
    const secondGrids = rootGrid.cells.map((cell) => ({ root: cell, grid: getBranch(branches, [cell.title]) }));
    const secondCount = secondGrids.filter((item) => item.grid).length;
    const thirdCount = Object.keys(branches).filter((key) => key.split("|||").length === 2).length;
    const starterTasks = allTasks.slice(0, 3);
    const win = window.open("", "_blank", "width=980,height=1280");
    if (!win) return;

    const starterHtml = starterTasks.length
      ? starterTasks.map((task, index) => `<article class="starter"><span>${index + 1}</span><div><h3>${safeHtml(task.title)}</h3><p>${safeHtml(task.detail)}</p><small>${safeHtml(task.root)} / ${safeHtml(task.parent)}</small></div></article>`).join("")
      : rootGrid.cells.slice(0, 3).map((cell, index) => `<article class="starter"><span>${index + 1}</span><div><h3>${safeHtml(cell.title)}</h3><p>${safeHtml(cell.detail || "先从这条主线里挑一个最容易验证的小动作。")}</p><small>先拆这一格，就能得到今天可执行的动作。</small></div></article>`).join("");

    const strategyHtml = rootGrid.cells.map((cell, index) => {
      const grid = getBranch(branches, [cell.title]);
      const directions = grid ? grid.cells.slice(0, 4).map((item) => `<li>${safeHtml(item.title)}</li>`).join("") : "<li>还没有继续拆，建议先选最有把握的一格。</li>";
      return `<article class="strategy-card"><div class="number">${index + 1}</div><div><h3>${safeHtml(cell.title)}</h3><p>${safeHtml(cell.detail || "这一格用于帮助你判断商业目标是否走得通。")}</p><ul>${directions}</ul>${grid ? `<small>已拆出 8 个行动方向</small>` : `<small>待继续拆解</small>`}</div></article>`;
    }).join("");

    const directionHtml = secondGrids.filter((item) => item.grid).map(({ root, grid }) => {
      const items = grid.cells.map((cell) => `<span>${safeHtml(cell.title)}</span>`).join("");
      return `<section class="direction-block"><h3>${safeHtml(root.title)}</h3><p>${safeHtml(root.detail || "这一组用于把大方向落到更具体的判断动作。")}</p><div class="pill-grid">${items}</div></section>`;
    }).join("") || `<p class="empty">还没有第二层内容。先回到页面里点“继续拆解”，就能生成行动方向。</p>`;

    const groupedTasks = allTasks.reduce((acc, task) => {
      const key = `${task.root}|||${task.parent}`;
      if (!acc[key]) acc[key] = { root: task.root, parent: task.parent, tasks: [] };
      acc[key].tasks.push(task);
      return acc;
    }, {});

    const executionHtml = Object.values(groupedTasks).length
      ? Object.values(groupedTasks).map((group) => `<section class="execution-group"><h3>${safeHtml(group.root)} / ${safeHtml(group.parent)}</h3><div class="task-grid">${group.tasks.map((task, index) => `<article><strong>${index + 1}. ${safeHtml(task.title)}</strong><p>${safeHtml(task.detail)}</p></article>`).join("")}</div></section>`).join("")
      : `<p class="empty">还没有拆到执行层。继续拆到第三层后，这里会自动整理成完整行动清单。</p>`;

    win.document.write(`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8" /><title>普通人生意行动指南</title><style>
      @page{size:A4;margin:14mm}*{box-sizing:border-box}body{margin:0;background:#f7f1e7;color:#17202a;font-family:'Microsoft YaHei','PingFang SC',Arial,sans-serif}.page{max-width:920px;margin:0 auto;background:#fffdf8;border:1px solid #e0e7df;border-radius:26px;padding:34px;box-shadow:0 18px 60px rgba(31,42,40,.08)}.cover{border-radius:24px;background:linear-gradient(135deg,#215a52,#3e766b);color:white;padding:34px;margin-bottom:22px}.tag{display:inline-block;padding:6px 12px;border-radius:999px;background:rgba(255,255,255,.18);font-size:12px;font-weight:800}.cover h1{font-size:34px;line-height:1.25;margin:18px 0 10px}.cover p{max-width:720px;font-size:16px;line-height:1.8;margin:0;color:#eef7f3}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:18px 0}.stats div{background:#fff;border:1px solid #d9e2dc;border-radius:18px;padding:16px}.stats strong{display:block;color:#215a52;font-size:24px}.stats span{color:#65746d;font-size:13px}.section{break-inside:avoid;margin-top:26px}.section h2{font-size:24px;margin:0 0 12px}.section-lead{color:#5e6b64;line-height:1.7;margin:0 0 14px}.starter{display:grid;grid-template-columns:44px 1fr;gap:14px;background:#fff;border:1px solid #d9e2dc;border-radius:20px;padding:16px;margin:10px 0;break-inside:avoid}.starter span,.number{width:38px;height:38px;border-radius:50%;background:#f1d889;color:#6d4d0d;font-weight:900;display:flex;align-items:center;justify-content:center}.starter h3,.strategy-card h3,.direction-block h3,.execution-group h3{margin:0 0 8px}.starter p,.strategy-card p,.direction-block p,.task-grid p{margin:0;color:#4f5f58;line-height:1.7}.starter small,.strategy-card small{display:block;margin-top:8px;color:#6e7a73}.strategy-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.strategy-card{display:grid;grid-template-columns:42px 1fr;gap:12px;background:#fff;border:1px solid #d9e2dc;border-radius:20px;padding:16px;break-inside:avoid}.strategy-card ul{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:12px 0 0;padding:0;list-style:none}.strategy-card li,.pill-grid span{border-radius:12px;background:#fbf3de;padding:8px 10px;color:#2f3a35;font-size:13px}.direction-block{background:#fff;border:1px solid #d9e2dc;border-radius:20px;padding:18px;margin:12px 0;break-inside:avoid}.pill-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px}.execution-group{background:#fff;border:1px solid #d9e2dc;border-radius:20px;padding:18px;margin:14px 0;break-inside:avoid}.task-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.task-grid article{border-radius:14px;background:#f8f5ed;padding:12px;break-inside:avoid}.task-grid strong{display:block;margin-bottom:6px}.empty{padding:16px;border-radius:16px;background:#f3f5f1;color:#5e6b64;line-height:1.7}.footer{margin-top:24px;text-align:center;color:#6b776e;font-size:13px}.page-break{break-before:page}@media print{body{background:white}.page{box-shadow:none;border:0;border-radius:0;padding:0}.cover{print-color-adjust:exact;-webkit-print-color-adjust:exact}.stats div,.starter,.strategy-card,.direction-block,.execution-group,.task-grid article{break-inside:avoid}.page-break{break-before:page}}@media(max-width:760px){body{background:#fffdf8}.page{border:0;border-radius:0;padding:20px}.stats,.strategy-grid,.task-grid{grid-template-columns:1fr}.pill-grid{grid-template-columns:1fr 1fr}.cover h1{font-size:26px}}
    </style></head><body><main class="page"><section class="cover"><span class="tag">普通人生意九宫格拆解器</span><h1>${safeHtml(goal || "你的商业目标")}</h1><p>这不是一份让你压力很大的计划书，而是一张陪你开工的路线图。今天先做最小的一步，先拿到真实反馈，再慢慢把方向调准。</p></section><section class="stats"><div><strong>${rootGrid.cells.length}</strong><span>战略维度</span></div><div><strong>${secondCount}</strong><span>已展开方向</span></div><div><strong>${allTasks.length}</strong><span>执行动作</span></div></section><section class="section"><h2>今天先做这 3 步</h2><p class="section-lead">不用一次做完全部内容。先完成下面三步，你就已经从“想一想”进入“开始验证”。</p>${starterHtml}</section><section class="section page-break"><h2>战略层规划</h2><p class="section-lead">先看全局，知道这门小生意由哪些关键部分组成。</p><div class="strategy-grid">${strategyHtml}</div></section><section class="section page-break"><h2>行动方向</h2><p class="section-lead">这些是从战略维度拆出来的方向，用来帮你判断先做哪条路最顺。</p>${directionHtml}</section><section class="section page-break"><h2>执行细节</h2><p class="section-lead">下面是完整执行层内容。看到哪一步最轻，就从那里开始；不需要完美，先动起来。</p>${executionHtml}</section><p class="footer">普通人生意九宫格拆解器 · 先验证，再放大</p></main><script>setTimeout(()=>window.print(),300)</script></body></html>`);
    win.document.close();
  }
  const boardItems = currentBoardData();

  if (!splashDone) {
    return (
      <main className="splashScreen">
        <div className="splashCard">
          <span className="splashBadge">AI 生意启动器</span>
          <h1>普通人生意九宫格拆解器</h1>
          <p>把模糊的赚钱想法，慢慢拆成今天能开始的第一步。</p>
          <div className="splashDots" aria-hidden="true"><span></span><span></span><span></span></div>
          <button onClick={() => setSplashDone(true)}>立刻进入</button>
        </div>
      </main>
    );
  }

  if (!accessGranted) {
    return (
      <main className="accessShell">
        <section className="accessCard">
          <p className="eyebrow">兑换码登录</p>
          <h1>解锁你的生意拆解工具</h1>
          <p className="accessLead">输入兑换码后，就可以生成三层九宫格、保存个人方案、导出行动 PDF。</p>
          <form className="accessForm" onSubmit={handleAccessSubmit}>
            <label>
              兑换码
              <input value={accessCode} onChange={(event) => setAccessCode(event.target.value)} placeholder="输入你的兑换码" autoComplete="one-time-code" />
            </label>
            <button className="primary" disabled={accessLoading}>{accessLoading ? "正在验证" : "解锁工具"}</button>
          </form>
          {accessError ? <p className="accessError">{accessError}</p> : null}
          <div className="accessPromise">
            <span>一次解锁</span>
            <span>本机保存</span>
            <span>不显示 API Key</span>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <section className="intro">
        <div>
          <p className="eyebrow">AI 交互小工具</p>
          <h1>普通人生意九宫格拆解器</h1>
          <p className="subhead">把一个模糊的赚钱想法，拆成一张能查看、能编辑、能导出的行动路线图。先验证，再放大，今天就能往前走一步。</p>
          <div className="introTopline">
            <div className="introMetrics" aria-label="工具能生成的内容">
              <span><strong>8</strong> 个商业维度</span>
              <span><strong>64</strong> 个行动方向</span>
              <span><strong>PDF</strong> 开工指南</span>
            </div>
            <button className="unlockStatus" onClick={clearAccess}>已解锁 · 退出</button>
          </div>
        </div>
      </section>

      <section className="workspace">
        <aside className="panel controls">
          <label>
            你的商业目标
            <textarea value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="例如：24小时内利用业余时间找到能赚到200元的副业" />
          </label>

          <label>
            业务类型
            <select value={businessType} onChange={(event) => setBusinessType(event.target.value)}>
              {BUSINESS_TYPES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <button className="primary" onClick={handleStart} disabled={loading}>{loading ? "AI 正在拆解中" : "生成行动路线"}</button>

          <div className="viewTabs compactTabs">
            <button className={viewMode === "current" ? "active" : ""} onClick={() => setViewMode("current")}>当前九宫格</button>
            <button className={viewMode === "map" ? "active" : ""} onClick={() => setViewMode("map")}>全局地图</button>
            <button className={viewMode === "guide" ? "active" : ""} onClick={() => setViewMode("guide")}>行动指南</button>
          </div>

          <div className="levelTabs">
            {[1, 2, 3].map((level) => (
              <button key={level} className={currentLevel === level ? "active" : ""} onClick={() => goToLevel(level)} disabled={(level === 2 && path.length < 1) || (level === 3 && path.length < 2)}>{LEVEL_NAMES[level - 1]}</button>
            ))}
          </div>

          <button className="backLevel" onClick={goBackOneLevel} disabled={currentLevel === 1}>返回上一层</button>
          <button className="backLevel" onClick={redecomposeCurrentLayer} disabled={loading || currentLevel === 3}>{currentLevel === 1 ? "一键重新拆解本层 8 格" : "一键拆开本层 8 格"}</button>

          <p className="helperText">后一轮 AI 拆解会覆盖前一轮结果。手动编辑标题和详情会自动保存，不会丢。</p>
          {bulkProgress ? <p className="helperText strong">{bulkProgress}</p> : null}

          <div className="actions">
            <button onClick={copyResult}>{copied ? "已复制" : "复制结果"}</button>
            <button onClick={() => setShowExportPanel((value) => !value)}>导出图片</button>
          </div>

          {showExportPanel ? (
            <div className="exportPanel">
              <button onClick={exportCurrentPng}>导出当前 PNG</button>
              <button onClick={exportGlobalPng}>导出全局 PNG</button>
              <button onClick={exportGuidePdf}>导出行动 PDF</button>
            </div>
          ) : null}

          {error ? <div className="error">{error}</div> : null}

          <div className="libraryPanel">
            <div className="libraryHeader">
              <span>个人库</span>
              <button onClick={createNewPlan}>新建</button>
            </div>
            <p>自动保存，最多保留 3 套。</p>
            <div className="planList">
              {plans.length ? plans.map((plan) => (
                <div className={`planItem ${activePlanId === plan.id ? "active" : ""}`} key={plan.id}>
                  <button className="planLoad" onClick={() => restorePlan(plan)}>
                    <strong>{compactText(plan.name, 20)}</strong>
                    <span>{new Date(plan.updatedAt).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                  </button>
                  <button className="planDelete" onClick={() => deletePlan(plan.id)}>删</button>
                </div>
              )) : <div className="emptyLibrary">现在还没有保存过计划。我们先拆第一版，系统会自动替你记住。</div>}
            </div>
          </div>
        </aside>

        <section className="mainArea">
          <div className="crumbs">{[goal || "你的商业目标", ...path].filter(Boolean).join(" > ")}</div>

          {viewMode === "current" ? (
            <>
              <div className="layerHeader panel slimPanel">
                <div>
                  <strong>{LEVEL_NAMES[currentLevel - 1]}</strong>
                  <p>{currentLevel === 1 ? "先看这一层的商业主线。拆开的格子会自动标绿。" : currentLevel === 2 ? "这一层重点是把方向拆成更具体的判断动作。" : "这一层已经是今天就能做的执行动作了。"}</p>
                </div>
                <span>{currentLevel === 3 ? "执行层已展开" : `这一层完成 ${levelDoneCount}/8 格`}</span>
              </div>

              <div className="grid boardGrid">
                {boardItems.map((item, index) => item.kind === "center" ? (
                  <article key={`center-${index}`} className="cell centerCard boardCard">
                    <div className="centerTitle">{item.title}</div>
                    <p>{item.detail}</p>
                  </article>
                ) : (
                  <article key={item.title + index} className={`cell boardCard ${item.done ? "isDone" : "isWaiting"}`}>
                    <div className="cellHead"><h3>{item.title}</h3><span className={`statusPill ${item.done ? "done" : "waiting"}`}>{item.badge}</span></div>
                    <p className="cellText">{item.detail}</p>
                    <div className="cardActions">
                      <button className="ghostButton" onClick={() => setEditing({ index: item.index, cell: currentGrid.cells[item.index] })}>编辑详情</button>
                      {currentLevel < 3 ? <button className="ghostButton strongButton" onClick={() => openNextLevel(item.index)}>{item.done ? (currentLevel === 1 ? "查看第二层" : "查看执行层") : (currentLevel === 1 ? "继续拆解" : "拆到执行")}</button> : <button className="ghostButton strongButton" onClick={() => setExpandedAction(item.title === expandedAction ? null : item.title)}>查看执行</button>}
                    </div>
                    {currentLevel === 3 && expandedAction === item.title ? <div className="actionDetail">{item.detail}</div> : null}
                  </article>
                ))}
              </div>
            </>
          ) : null}

          {viewMode === "map" ? (
            <div className="mapStack">
              {rootGrid.cells.map((cell, rootIndex) => {
                const secondGrid = getBranch(branches, [cell.title]);
                const secondDone = secondGrid ? secondGrid.cells.filter((item) => !!getBranch(branches, [cell.title, item.title])).length : 0;
                return (
                  <section className="panel mapSection" key={cell.title}>
                    <div className="mapSectionHead"><div><span className="mapIndex">{rootIndex + 1}</span><h3>{cell.title}</h3></div><button className="ghostButton strongButton" onClick={() => { setCurrentLevel(1); setPath([]); setViewMode("current"); }}>{secondGrid ? "回到这一格" : "先从这里开始"}</button></div>
                    <p className="mapSummary">{cell.detail}</p>
                    {secondGrid ? (
                      <div className="mapMiniGrid">{secondGrid.cells.map((secondCell) => {
                        const thirdGrid = getBranch(branches, [cell.title, secondCell.title]);
                        return <article className={`miniCard ${thirdGrid ? "done" : "waiting"}`} key={secondCell.title}><strong>{secondCell.title}</strong><span>{thirdGrid ? "已拆到执行层" : "还没继续往下拆"}</span></article>;
                      })}</div>
                    ) : <div className="emptyLibrary">这一条还没继续往下拆。你可以回到当前九宫格，从最想推进的一格开始。</div>}
                    <div className="mapFooter">第二层已拆：{secondGrid ? "8/8" : "0/8"}　|　执行层已拆：{secondDone}/8</div>
                  </section>
                );
              })}
            </div>
          ) : null}

          {viewMode === "guide" ? (
            <div className="guideStack">
              <section className="panel guideHero">
                <span className="guideTag">行动指南</span>
                <h2>{goal || "先写一个你现在最想落地的商业目标"}</h2>
                <p>别急着把所有事一次做完。先选一条最顺手的主线，再从里面挑最轻的一步做掉，今天就会比昨天更清楚。</p>
              </section>
              <section className="panel guideSection"><h3>战略层规划</h3>{rootGrid.cells.map((cell) => <article key={cell.title} className="guideBlock"><strong>{cell.title}</strong><p>{cell.detail}</p></article>)}</section>
              <section className="panel guideSection"><h3>执行清单</h3>{allLeafTasks.length ? allLeafTasks.map((task) => <article key={task.id} className="taskRow"><div><strong>{task.title}</strong><p>{task.detail}</p><span>{task.root} · {task.parent}</span></div></article>) : <div className="emptyLibrary">还没有拆到执行层。把第二层继续往下拆，行动清单就会在这里自动长出来。</div>}</section>
            </div>
          ) : null}
        </section>
      </section>

      {editing ? (
        <div className="modalMask" onClick={() => setEditing(null)}>
          <div className="modalCard" onClick={(event) => event.stopPropagation()}>
            <h3>编辑这个格子</h3>
            <label>标题<input value={editing.cell.title} onChange={(event) => setEditing((prev) => ({ ...prev, cell: { ...prev.cell, title: event.target.value } }))} /></label>
            <label>详情<textarea value={editing.cell.detail} onChange={(event) => setEditing((prev) => ({ ...prev, cell: { ...prev.cell, detail: event.target.value } }))} /></label>
            <div className="cardActions"><button className="ghostButton" onClick={() => setEditing(null)}>先不改</button><button className="ghostButton strongButton" onClick={() => { updateCell(editing.index, editing.cell); setEditing(null); }}>保存</button></div>
          </div>
        </div>
      ) : null}
    </main>
  );
}




