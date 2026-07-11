function normalizeCode(code) {
  return String(code || "").trim().toUpperCase();
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const code = normalizeCode(body.code);
  const configuredCodes = String(process.env.REDEEM_CODES || "")
    .split(/[,\n]/)
    .map(normalizeCode)
    .filter(Boolean);
  const localTestCodes = process.env.NODE_ENV === "production" ? [] : ["TEST2026", "ALIISA2026"];
  const allowedCodes = new Set([...configuredCodes, ...localTestCodes]);

  if (!code) {
    return Response.json({ ok: false, message: "\u8bf7\u5148\u8f93\u5165\u5151\u6362\u7801\u3002" }, { status: 400 });
  }

  if (!allowedCodes.size) {
    return Response.json(
      { ok: false, message: "\u8fd8\u6ca1\u6709\u914d\u7f6e\u5151\u6362\u7801\uff0c\u8bf7\u5148\u8bbe\u7f6e REDEEM_CODES\u3002" },
      { status: 500 },
    );
  }

  if (!allowedCodes.has(code)) {
    return Response.json({ ok: false, message: "\u5151\u6362\u7801\u4e0d\u6b63\u786e\uff0c\u8bf7\u68c0\u67e5\u540e\u518d\u8bd5\u3002" }, { status: 401 });
  }

  return Response.json({ ok: true });
}
