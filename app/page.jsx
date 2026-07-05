"use client";

import { useEffect, useMemo, useState } from "react";

const types = ["副业赚钱", "内容账号", "本地服务", "电商选品", "个人技能变现", "自定义"];
const levelNames = ["第一层", "第二层", "第三层"];
const positions = [0, 1, 2, 3, "center", 4, 5, 6, 7];
const STORAGE_KEY = "business-grid-plans-v1";

const starterCells = [
  { title: "市场需求", detail: "确认是否有人正在为这个问题付费，优先找高频、明确、愿意付费的需求。" },
  { title: "自身技能", detail: "盘点你能在24小时内拿来交付的技能、经验、人脉和工具。" },
  { title: "可卖产品", detail: "把能力包装成一个具体服务或虚拟产品，避免只停留在想法。" },
  { title: "客户群体", detail: "定义第一批最容易触达、最可能付费的人群。" },
  { title: "获客渠道", detail: "选择能当天触达潜在客户的渠道，例如熟人、社群、小红书、闲鱼。" },
  { title: "定价方式", detail: "设计一个低门槛但能验证付费意愿的价格。" },
  { title: "交付流程", detail: "明确客户付款后，你具体交付什么、多久交付、用什么形式交付。" },
  { title: "最小验证", detail: "用最低成本验证是否有人愿意问、愿意约、愿意付费。" },
];

const emptyGrid = { center: "你的商业目标", cells: starterCells };

function asCell(cell) {
  if (typeof cell === "string") return { title: cell, detail: `${cell}的判断依据、执行方法和验证标准。` };
  return { title: cell?.title || "待拆解", detail: cell?.detail || "补充这个格子的判断依据、执行方法和验证标准。" };
}

function normalizeGrid(grid) {
  if (!grid) return null;
  return { center: grid.center || "待拆解", cells: (grid.cells || []).map(asCell).slice(0, 8) };
}

function cellTitle(cell) {
  return asCell(cell).title;
}

function cellDetail(cell) {
  return asCell(cell).detail;
}

function escapeSvg(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapText(value, max = 9, lines = 4) {
  const text = String(value || "").trim();
  return (text.match(new RegExp(`.{1,${max}}`, "g")) || [text]).slice(0, lines);
}

function svgText({ x, y, text, size = 28, color = "#17202a", weight = 700, max = 9, lines = 4, anchor = "middle" }) {
  const parts = wrapText(text, max, lines);
  const startY = y - ((parts.length - 1) * size * 0.62) / 2;
  return `<text x="${x}" y="${startY}" text-anchor="${anchor}" dominant-baseline="middle" font-size="${size}" font-weight="${weight}" fill="${color}" font-family="Arial, Microsoft YaHei, sans-serif">${parts
    .map((part, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : size * 1.22}">${escapeSvg(part)}</tspan>`)
    .join("")}</text>`;
}

function downloadSvg(svg, filename) {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function gridSvg({ grid, title, subtitle }) {
  const width = 1080;
  const height = 1920;
  const margin = 72;
  const gap = 18;
  const cell = (width - margin * 2 - gap * 2) / 3;
  const top = 410;
  const cells = positions.map((position, i) => {
    const row = Math.floor(i / 3);
    const col = i % 3;
    const x = margin + col * (cell + gap);
    const y = top + row * (cell + gap);
    const isCenter = position === "center";
    const text = isCenter ? grid.center : cellTitle(grid.cells[position]);
    return `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="18" fill="${isCenter ? "#215a52" : "#ffffff"}" stroke="${isCenter ? "#215a52" : "#d9e2dc"}" stroke-width="3"/>${svgText({ x: x + cell / 2, y: y + cell / 2, text, size: isCenter ? 31 : 29, color: isCenter ? "#ffffff" : "#17202a", weight: 800, max: 8, lines: 5 })}`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="#f4f1ea"/>
    <text x="${margin}" y="118" font-size="32" font-weight="800" fill="#c7634b" font-family="Arial, Microsoft YaHei, sans-serif">普通人生意九宫格拆解器</text>
    ${svgText({ x: margin, y: 214, text: title, size: 54, weight: 900, max: 12, lines: 3, anchor: "start" })}
    ${svgText({ x: margin, y: 342, text: subtitle, size: 25, color: "#65746d", weight: 600, max: 25, lines: 2, anchor: "start" })}
    ${cells}
    <text x="540" y="1800" text-anchor="middle" font-size="24" font-weight="700" fill="#63736c" font-family="Arial, Microsoft YaHei, sans-serif">从商业目标到今日行动</text>
  </svg>`;
}

function relationSvg({ levels, path, goal }) {
  const width = 1080;
  const height = 1920;
  const margin = 72;
  const blocks = levels.map((grid, index) => ({ grid, index })).filter((item) => item.grid);
  const blockHeight = blocks.length >= 3 ? 395 : 470;
  const startY = 360;
  const blockSvg = blocks.map(({ grid, index }, blockIndex) => {
    const y = startY + blockIndex * (blockHeight + 92);
    const pathLabel = path[index] || grid.center;
    const cells = grid.cells.slice(0, 8).map((cell, cellIndex) => {
      const col = cellIndex % 2;
      const row = Math.floor(cellIndex / 2);
      const x = margin + col * 468;
      const cy = y + 135 + row * 55;
      return `<rect x="${x}" y="${cy}" width="440" height="42" rx="10" fill="#ffffff" stroke="#d9e2dc"/>${svgText({ x: x + 220, y: cy + 21, text: cellTitle(cell), size: 21, weight: 700, max: 14, lines: 1 })}`;
    }).join("");
    const arrow = blockIndex < blocks.length - 1 ? `<text x="540" y="${y + blockHeight + 52}" text-anchor="middle" font-size="42" fill="#d8a637" font-family="Arial, Microsoft YaHei, sans-serif">↓</text>` : "";
    return `<rect x="${margin}" y="${y}" width="936" height="${blockHeight}" rx="24" fill="rgba(255,255,255,0.84)" stroke="#d9e2dc" stroke-width="3"/>
      <rect x="${margin + 28}" y="${y + 28}" width="142" height="46" rx="23" fill="#215a52"/>
      <text x="${margin + 99}" y="${y + 58}" text-anchor="middle" font-size="22" font-weight="800" fill="#ffffff" font-family="Arial, Microsoft YaHei, sans-serif">${levelNames[index]}</text>
      ${svgText({ x: margin + 200, y: y + 53, text: pathLabel, size: 30, weight: 900, max: 17, lines: 2, anchor: "start" })}
      ${svgText({ x: 540, y: y + 108, text: `中心：${grid.center}`, size: 22, color: "#65746d", weight: 700, max: 30, lines: 1 })}
      ${cells}${arrow}`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="#f4f1ea"/>
    <text x="${margin}" y="108" font-size="32" font-weight="800" fill="#c7634b" font-family="Arial, Microsoft YaHei, sans-serif">逐层逻辑关系图</text>
    ${svgText({ x: margin, y: 205, text: goal || "商业目标拆解", size: 50, weight: 900, max: 13, lines: 3, anchor: "start" })}
    ${svgText({ x: margin, y: 306, text: path.length ? path.join(" → ") : "先生成九宫格，再导出逻辑关系", size: 24, color: "#65746d", weight: 700, max: 30, lines: 2, anchor: "start" })}
    ${blockSvg}
    <text x="540" y="1810" text-anchor="middle" font-size="24" font-weight="700" fill="#63736c" font-family="Arial, Microsoft YaHei, sans-serif">普通人生意九宫格拆解器</text>
  </svg>`;
}

function makePlanSnapshot({ id, goal, type, levels, currentLevel, path }) {
  const now = Date.now();
  return {
    id: id || `plan-${now}`,
    name: goal.trim() || "未命名商业计划",
    updatedAt: now,
    goal,
    type,
    levels,
    currentLevel,
    path,
  };
}

export default function Home() {
  const [goal, setGoal] = useState("");
  const [type, setType] = useState(types[0]);
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [path, setPath] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showExportChoices, setShowExportChoices] = useState(false);
  const [expandedAction, setExpandedAction] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [plans, setPlans] = useState([]);
  const [activePlanId, setActivePlanId] = useState(null);
  const [loadedLibrary, setLoadedLibrary] = useState(false);

  const activeGrid = levels[currentLevel] || emptyGrid;
  const actionItems = useMemo(() => currentLevel === 2 ? activeGrid.cells.slice(0, 3).map(asCell) : [], [activeGrid, currentLevel]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const normalized = Array.isArray(saved) ? saved.slice(0, 3).map((plan) => ({
        ...plan,
        levels: (plan.levels || []).map(normalizeGrid).filter(Boolean),
      })) : [];
      setPlans(normalized);
    } catch {
      setPlans([]);
    } finally {
      setLoadedLibrary(true);
    }
  }, []);

  useEffect(() => {
    if (!loadedLibrary) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans.slice(0, 3)));
  }, [plans, loadedLibrary]);

  useEffect(() => {
    if (!loadedLibrary) return;
    const hasContent = goal.trim() || levels.length;
    if (!hasContent) return;

    setPlans((prevPlans) => {
      const id = activePlanId || `plan-${Date.now()}`;
      const snapshot = makePlanSnapshot({ id, goal, type, levels, currentLevel, path });
      const rest = prevPlans.filter((plan) => plan.id !== id);
      const nextPlans = [snapshot, ...rest].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3);
      if (!activePlanId) setActivePlanId(id);
      return nextPlans;
    });
  }, [goal, type, levels, currentLevel, path, loadedLibrary, activePlanId]);

  async function requestGrid(nextLevel, center, nextPath) {
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/decompose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, type, level: nextLevel + 1, center, path: nextPath }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "生成失败，请再试一次。");
      const normalized = { center: data.center, cells: data.cells.map(asCell) };
      setLevels((prevLevels) => {
        const nextLevels = prevLevels.slice(0, nextLevel);
        nextLevels[nextLevel] = normalized;
        return nextLevels;
      });
      setCurrentLevel(nextLevel);
      setPath(nextPath);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function startDecompose() {
    if (!goal.trim()) {
      setError("请先输入一个商业目标。");
      return;
    }
    setShowExportChoices(false);
    requestGrid(0, goal.trim(), [goal.trim()]);
  }

  function createNewPlan() {
    setActivePlanId(null);
    setGoal("");
    setType(types[0]);
    setLevels([]);
    setCurrentLevel(0);
    setPath([]);
    setError("");
    setShowExportChoices(false);
  }

  function loadPlan(plan) {
    setActivePlanId(plan.id);
    setGoal(plan.goal || "");
    setType(plan.type || types[0]);
    setLevels((plan.levels || []).map(normalizeGrid).filter(Boolean));
    setCurrentLevel(Math.min(plan.currentLevel || 0, Math.max((plan.levels || []).length - 1, 0)));
    setPath(plan.path || []);
    setError("");
    setShowExportChoices(false);
  }

  function deletePlan(id) {
    setPlans((prevPlans) => prevPlans.filter((plan) => plan.id !== id));
    if (activePlanId === id) createNewPlan();
  }

  function openCell(index) {
    if (currentLevel >= 2 || loading) return;
    const center = cellTitle(activeGrid.cells[index]);
    requestGrid(currentLevel + 1, center, [...path, center]);
  }

  function updateCellAtLevel(levelIndex, index, patch) {
    setLevels((prevLevels) => {
      if (!prevLevels[levelIndex]) return prevLevels;
      const nextLevels = [...prevLevels];
      const nextGrid = { ...nextLevels[levelIndex], cells: nextLevels[levelIndex].cells.map(asCell) };
      nextGrid.cells[index] = { ...nextGrid.cells[index], ...patch };
      nextLevels[levelIndex] = nextGrid;
      return nextLevels;
    });
  }

  function updateCell(index, value) {
    updateCellAtLevel(currentLevel, index, { title: value });
  }

  function updateCellDetail(index, value) {
    updateCellAtLevel(currentLevel, index, { detail: value });
  }

  function updateCenter(value) {
    if (!levels[currentLevel]) return;
    const nextLevels = [...levels];
    nextLevels[currentLevel] = { ...nextLevels[currentLevel], center: value };
    setLevels(nextLevels);
  }

  function canVisitLevel(index) {
    return Boolean(levels[index]);
  }

  function goToLevel(index) {
    if (!canVisitLevel(index)) return;
    setCurrentLevel(index);
    setPath((prevPath) => prevPath.slice(0, index + 1));
  }

  function goBackOneLevel() {
    if (currentLevel <= 0) return;
    goToLevel(currentLevel - 1);
  }

  async function copyResult() {
    const text = [
      `核心目标：${goal}`,
      `业务类型：${type}`,
      `当前路径：${path.join(" > ")}`,
      "",
      `中心：${activeGrid.center}`,
      ...activeGrid.cells.map((cell, index) => `${index + 1}. ${cellTitle(cell)}：${cellDetail(cell)}`),
      actionItems.length ? "\n今日3件事：" : "",
      ...actionItems.map((item, index) => `${index + 1}. ${cellTitle(item)}：${cellDetail(item)}`),
    ].filter(Boolean).join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function exportLayerImage() {
    const svg = gridSvg({ grid: activeGrid, title: `${levelNames[currentLevel]}：${activeGrid.center}`, subtitle: path.length ? path.join(" > ") : "当前分层九宫格" });
    downloadSvg(svg, `business-grid-${currentLevel + 1}.svg`);
    setShowExportChoices(false);
  }

  function exportRelationImage() {
    const svg = relationSvg({ levels, path, goal });
    downloadSvg(svg, "business-grid-relation.svg");
    setShowExportChoices(false);
  }

  return (
    <main className="shell">
      <section className="intro">
        <div>
          <p className="eyebrow">AI 交互小工具</p>
          <h1>普通人生意九宫格拆解器</h1>
          <p className="subhead">把一个模糊的赚钱想法，拆成三层九宫格，最后落到今天能做的 3 件事。</p>
        </div>
      </section>

      <section className="workspace">
        <aside className="panel controls">
          <label>
            <span>你的商业目标</span>
            <textarea value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="例如：24小时内通过业余时间找到能赚到200元的副业" />
          </label>

          <label>
            <span>业务类型</span>
            <select value={type} onChange={(event) => setType(event.target.value)}>
              {types.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>

          <button className="primary" onClick={startDecompose} disabled={loading}>{loading ? "AI 正在拆解..." : "AI 拆解"}</button>

          <div className="levelTabs">
            {levelNames.map((item, index) => (
              <button key={item} onClick={() => goToLevel(index)} className={currentLevel === index ? "active" : ""} disabled={!canVisitLevel(index)}>{item}</button>
            ))}
          </div>

          <button className="backLevel" onClick={goBackOneLevel} disabled={currentLevel === 0 || loading}>返回上一层</button>

          <div className="actions">
            <button onClick={copyResult} disabled={!levels.length}>{copied ? "已复制" : "复制结果"}</button>
            <button onClick={() => setShowExportChoices((value) => !value)} disabled={!levels.length}>导出图片</button>
          </div>

          {showExportChoices && (
            <div className="exportPanel">
              <button onClick={exportLayerImage}>导出当前分层图</button>
              <button onClick={exportRelationImage}>导出逐层关系图</button>
            </div>
          )}

          <section className="libraryPanel">
            <div className="libraryHeader">
              <span>个人库</span>
              <button onClick={createNewPlan}>新建</button>
            </div>
            <p>自动保存，最多保留 3 套。</p>
            <div className="planList">
              {plans.length ? plans.map((plan) => (
                <div className={`planItem ${plan.id === activePlanId ? "active" : ""}`} key={plan.id}>
                  <button className="planLoad" onClick={() => loadPlan(plan)}>
                    <strong>{plan.name}</strong>
                    <span>{new Date(plan.updatedAt).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                  </button>
                  <button className="planDelete" onClick={() => deletePlan(plan.id)}>删</button>
                </div>
              )) : <div className="emptyLibrary">生成或编辑后会自动保存到这里。</div>}
            </div>
          </section>

          {error && <p className="error">{error}</p>}
        </aside>

        <section className="mainArea">
          <div className="crumbs">{path.length ? path.join(" > ") : "输入目标后开始拆解"}</div>

          <div className="grid">
            {positions.map((position, index) => {
              const isCenter = position === "center";
              const currentCell = isCenter ? null : asCell(activeGrid.cells[position]);
              return (
                <div key={`${position}-${index}`} className={`cell ${isCenter ? "center" : ""} ${!isCenter && currentLevel < 2 ? "clickable" : ""}`}>
                  {isCenter ? (
                    <textarea value={activeGrid.center} onChange={(event) => updateCenter(event.target.value)} />
                  ) : (
                    <>
                      <textarea value={currentCell.title} onChange={(event) => updateCell(position, event.target.value)} />
                      <div className="cellFooter">
                        <button className="detailAction" type="button" onClick={() => setEditingCell({ level: currentLevel, index: position })}>
                          编辑详情
                        </button>
                        {currentLevel < 2 && (
                          <button className="cellAction" type="button" onClick={() => openCell(position)} disabled={loading}>继续拆解</button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {editingCell && levels[editingCell.level]?.cells?.[editingCell.index] && (
            <div className="detailOverlay" role="dialog" aria-modal="true">
              <div className="detailEditor">
                <div className="detailEditorHead">
                  <strong>编辑格子详情</strong>
                  <button type="button" onClick={() => setEditingCell(null)}>关闭</button>
                </div>
                <label>
                  <span>标题</span>
                  <input
                    value={cellTitle(levels[editingCell.level].cells[editingCell.index])}
                    onChange={(event) => updateCellAtLevel(editingCell.level, editingCell.index, { title: event.target.value })}
                  />
                </label>
                <label>
                  <span>详情</span>
                  <textarea
                    value={cellDetail(levels[editingCell.level].cells[editingCell.index])}
                    onChange={(event) => updateCellAtLevel(editingCell.level, editingCell.index, { detail: event.target.value })}
                  />
                </label>
              </div>
            </div>
          )}

          <div className="panel checklist">
            <div>
              <p className="eyebrow">今日行动</p>
              <h2>今天先做这 3 件事</h2>
            </div>
            {actionItems.length ? (
              <ol className="actionList">
                {actionItems.map((item, index) => (
                  <li key={`${cellTitle(item)}-${index}`} className={expandedAction === index ? "open" : ""}>
                    <button type="button" onClick={() => setExpandedAction(expandedAction === index ? null : index)}>
                      <span>{index + 1}</span>
                      {cellTitle(item)}
                    </button>
                    {expandedAction === index && <p>{cellDetail(item)}</p>}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="muted">进入第三层后，这里会自动生成今日行动清单。</p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}