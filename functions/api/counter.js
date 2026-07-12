async function ensureCounterTable(db) {
  await db.prepare(
    "CREATE TABLE IF NOT EXISTS visitor_counter (id INTEGER PRIMARY KEY CHECK (id = 1), count INTEGER NOT NULL DEFAULT 0)"
  ).run();
  await db.prepare(
    "INSERT OR IGNORE INTO visitor_counter (id, count) VALUES (1, 0)"
  ).run();
  await db.prepare(
    "CREATE TABLE IF NOT EXISTS visitor_ip_log (ip TEXT PRIMARY KEY, last_counted_at INTEGER NOT NULL)"
  ).run();
}

function getClientIp(request) {
  const headers = request.headers;
  const candidates = [
    headers.get("CF-Connecting-IP"),
    headers.get("True-Client-IP"),
    headers.get("X-Forwarded-For"),
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const ip = candidate.split(",")[0].trim();
    if (ip) return ip;
  }

  return null;
}

function json(payload, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  return new Response(JSON.stringify(payload), {
    ...init,
    headers,
  });
}

export async function onRequest({ request, env }) {
  const windowMs = 12 * 60 * 60 * 1000;

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  const db = env?.VISITOR_COUNTER_DB || env?.VISITOR_COUNT_DB || env?.DB;
  if (!db) {
    return json({ error: "Missing Cloudflare D1 binding" }, { status: 500 });
  }

  try {
    await ensureCounterTable(db);

    if (request.method === "GET") {
      const row = await db.prepare("SELECT count FROM visitor_counter WHERE id = 1").first();
      return json({ count: Number(row?.count || 0) });
    }

    if (request.method === "POST") {
      const ip = getClientIp(request);
      const now = Date.now();
      let counted = true;

      if (ip) {
        await db.exec("BEGIN IMMEDIATE");
        try {
          const row = await db.prepare(
            "SELECT last_counted_at FROM visitor_ip_log WHERE ip = ?"
          ).bind(ip).first();
          const lastCountedAt = Number(row?.last_counted_at || 0);
          const hasWindowExpired = !Number.isFinite(lastCountedAt) || now - lastCountedAt >= windowMs;

          if (hasWindowExpired) {
            await db.prepare("UPDATE visitor_counter SET count = count + 1 WHERE id = 1").run();
            await db.prepare(
              "INSERT INTO visitor_ip_log (ip, last_counted_at) VALUES (?, ?) ON CONFLICT(ip) DO UPDATE SET last_counted_at = excluded.last_counted_at"
            ).bind(ip, now).run();
          } else {
            counted = false;
          }

          await db.exec("COMMIT");
        } catch (error) {
          await db.exec("ROLLBACK");
          throw error;
        }
      } else {
        await db.prepare("UPDATE visitor_counter SET count = count + 1 WHERE id = 1").run();
      }

      const row = await db.prepare("SELECT count FROM visitor_counter WHERE id = 1").first();
      return json({ count: Number(row?.count || 0), counted });
    }

    return json({ error: "Method not allowed" }, { status: 405 });
  } catch (error) {
    return json(
      { error: "Internal server error", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
