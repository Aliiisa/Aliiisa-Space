import { spawn } from "child_process";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const fallbackByLevel = {
  1: [
    { title: "市场需求", detail: "确认是否有人正在为这个问题付费，优先找高频、明确、愿意付费的需求。" },
    { title: "自身技能", detail: "盘点你能在24小时内拿来交付的技能、经验、人脉和工具。" },
    { title: "可卖产品", detail: "把能力包装成一个具体服务或虚拟产品，避免只停留在想法。" },
    { title: "客户群体", detail: "定义第一批最容易触达、最可能付费的人群。" },
    { title: "获客渠道", detail: "选择能当天触达潜在客户的渠道，例如熟人、社群、小红书、闲鱼。" },
    { title: "定价", detail: "设计一个低门槛但能验证付费意愿的价格。" },
    { title: "交付", detail: "明确客户付款后，你具体交付什么、多久交付、用什么形式交付。" },
    { title: "最小验证", detail: "用最低成本验证是否有人愿意问、愿意约、愿意付费。" },
  ],
  2: [
    { title: "找10个对象", detail: "列出10个可以观察、询问或触达的人。" },
    { title: "搜求助帖", detail: "去社交平台搜索求助、避坑、代做、陪跑、咨询等关键词。" },
    { title: "查付费服务", detail: "去闲鱼、小红书、淘宝等平台看什么服务已经有人在卖。" },
    { title: "列自付问题", detail: "写出你半年内愿意花钱解决的3个真实问题。" },
    { title: "问行业朋友", detail: "找3个不同行业朋友，问他们最想外包什么事情。" },
    { title: "看副业小组", detail: "观察兼职、副业、接单小组里反复出现的需求。" },
    { title: "频率排序", detail: "把收集到的痛点按出现次数、紧急程度、付费意愿排序。" },
    { title: "选3个备选", detail: "挑出现次数最多且你能交付的3个痛点。" },
  ],
  3: [
    { title: "列出名单", detail: "用15分钟写下要观察或询问的10个人。" },
    { title: "发出询问", detail: "给每个人发一句简单问题：最近有什么事很烦、想花钱解决？" },
    { title: "记录原话", detail: "把对方回答复制到备忘录，不急着加工判断。" },
    { title: "提炼关键词", detail: "从回答里提炼名词和动词，例如不会做图、没时间整理、不会写文案。" },
    { title: "打分排序", detail: "按出现次数、解决难度、付费可能性各打1-5分。" },
    { title: "搜同类方案", detail: "去平台搜索这个问题是否已经有人提供解决方案。" },
    { title: "记录价格销量", detail: "如果有人在卖，记录价格、销量、评价和承诺交付物。" },
    { title: "填回详情", detail: "把发现填回上一层对应格子，形成可继续拆解的依据。" },
  ],
};

function normalizeCell(cell, fallback) {
  if (typeof cell === "string") {
    return { title: cell.trim(), detail: fallback?.detail || `${cell.trim()}的判断标准、执行方法和下一步动作。` };
  }
  return {
    title: String(cell?.title || fallback?.title || "待拆解").trim(),
    detail: String(cell?.detail || fallback?.detail || "补充这个格子的判断依据、执行步骤和验证方式。").trim(),
  };
}

function cleanCells(cells, level) {
  const base = Array.isArray(cells) ? cells : [];
  const fallback = fallbackByLevel[level] || fallbackByLevel[1];
  return Array.from({ length: 8 }, (_, index) => normalizeCell(base[index], fallback[index]));
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
  return data.output_text || data.output?.flatMap((item) => item.content || [])?.map((content) => content.text || "")?.join("") || "";
}

function safeErrorMessage(error) {
  const message = String(error?.message || error || "请求失败，请稍后再试。");
  return message
    .replace(/sk-[A-Za-z0-9_-]+/g, "sk-***")
    .replace(/Bearer\s+[^\s]+/gi, "Bearer ***")
    .slice(0, 240);
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
  ].some((keyword) => message.includes(keyword));
}

function runCurl({ apiKey, proxy, body }) {
  return new Promise((resolve, reject) => {
    const args = [
      "-sS",
      "-x",
      proxy,
      "https://api.openai.com/v1/responses",
      "-H",
      "Authorization: Bearer @-",
      "-H",
      "Content-Type: application/json",
      "--data-binary",
      "@-",
    ];

    // Use two curl calls worth of stdin material is not possible with a single @-,
    // so pass auth as a normal argument only after all outward errors are sanitized.
    args[5] = `Authorization: Bearer ${apiKey}`;

    const child = spawn("curl.exe", args, { windowsHide: true });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => { stdout += chunk.toString("utf8"); });
    child.stderr.on("data", (chunk) => { stderr += chunk.toString("utf8"); });
    child.on("error", (error) => reject(new Error(`无法启动 curl：${safeErrorMessage(error)}`)));
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`无法连接 OpenAI API，请确认代理端口和网络。${safeErrorMessage(stderr || `curl exit ${code}`)}`));
        return;
      }
      resolve(stdout);
    });

    child.stdin.write(body);
    child.stdin.end();
  });
}

async function callOpenAI({ apiKey, model, prompt }) {
  const body = JSON.stringify({
    model,
    input: prompt,
    text: { format: { type: "json_object" } },
  });
  const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.https_proxy || process.env.http_proxy;

  if (proxy) {
    const stdout = await runCurl({ apiKey, proxy, body });
    try {
      return JSON.parse(stdout);
    } catch {
      throw new Error("OpenAI API 返回内容不是有效 JSON，请稍后再试。");
    }
  }

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
    throw new Error("无法连接 OpenAI API。请确认网络或代理设置后重试。");
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "AI 接口请求失败。");
  }
  return data;
}

function buildPrompt({ goal, type, level, center, path }) {
  return `
你是一个擅长普通人副业验证的商业拆解助手。你的任务是把目标拆成三层嵌套九宫格，并且让每个格子都有可解释、可执行的详情。

输出要求：
1. 只输出 JSON，不要解释，不要 Markdown。
2. JSON 格式必须是：{"center":"...","cells":[{"title":"...","detail":"..."}]}
3. cells 必须刚好 8 个，每个 cell 都必须有 title 和 detail。
4. title 不超过 12 个中文字符；detail 用 1-2 句说明判断标准、执行方法或验证方式。
5. 第一层必须是商业逻辑维度，优先使用：市场需求、自身技能、可卖产品、客户群体、找客户渠道、定价、交付、最小验证。
6. 第二层必须把当前维度拆成具体研究/判断/收集动作，颗粒度要像：观察10个人困扰、搜求助帖、查付费服务、询问朋友、按频率排序。
7. 第三层是执行层，每个格子必须是15分钟内能完成的动作，要有数量、对象、记录方式或判断标准。
8. 如果当前层级是第三层，detail 里要说明如何把结果回填到上一层对应格子的详情里。
9. 不要输出空泛词，比如“提升质量”“加强运营”“优化方案”。必须具体到人、平台、数量、动作、记录物。

参考范式：
第一层目标：24小时内通过业余时间找到能赚到200元的副业。
第一层8格：市场需求、自身技能、可卖产品、客户群体、找客户渠道、定价、交付、最小成本验证。
第二层以“市场需求”为例：观察身边10个人的困扰、社交平台搜避坑求助帖、闲鱼搜代做陪跑咨询、列出自己半年内愿意付费的3个问题、问3个行业朋友想外包什么、看副业小组需求、按频率排序、挑出前三个痛点。
第三层以“观察”为例：列出10个人、发微信询问烦事、备忘录记录原话、提炼关键词、按频率和难度打分、搜同类解决方案、记录销量价格、把结果回填到上一层详情。

用户核心目标：${goal}
业务类型：${type}
当前层级：第 ${level} 层
当前中心主题：${center || goal}
当前路径：${Array.isArray(path) ? path.join(" > ") : ""}
`;
}

export async function POST(request) {
  const { goal, type, level, center, path } = await request.json();
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  if (!apiKey) {
    return NextResponse.json({ error: "还没有配置 OPENAI_API_KEY。请先创建 .env.local 文件。" }, { status: 400 });
  }

  try {
    const prompt = buildPrompt({ goal, type, level, center, path });
    let lastError = null;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const data = await callOpenAI({ apiKey, model, prompt });

        if (data?.error) {
          const error = new Error(data.error.message || "AI request failed");
          if (!isTemporaryOpenAIError(error)) {
            return NextResponse.json({ error: safeErrorMessage(error) }, { status: 400 });
          }
          lastError = error;
        } else {
          const text = readOutputText(data);
          const parsed = extractJson(text);

          if (parsed) {
            return NextResponse.json({
              center: String(parsed.center || center || goal).trim(),
              cells: cleanCells(parsed.cells, level),
            });
          }

          lastError = new Error("AI returned content that could not be parsed.");
        }
      } catch (error) {
        if (!isTemporaryOpenAIError(error)) throw error;
        lastError = error;
      }

      await wait(700 * (attempt + 1));
    }

    return NextResponse.json({
      center: String(center || goal || "\u5f85\u62c6\u89e3").trim(),
      cells: cleanCells([], level),
      warning: safeErrorMessage(lastError),
    });
  } catch (error) {
    return NextResponse.json({ error: safeErrorMessage(error) }, { status: 500 });
  }

}