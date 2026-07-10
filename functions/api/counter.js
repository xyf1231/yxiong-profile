async function ensureCounterTable(db) {
  await db.prepare(
    "CREATE TABLE IF NOT EXISTS visitor_counter (id INTEGER PRIMARY KEY CHECK (id = 1), count INTEGER NOT NULL DEFAULT 0)"
  ).run();
  await db.prepare(
    "INSERT OR IGNORE INTO visitor_counter (id, count) VALUES (1, 0)"
  ).run();
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
      await db.prepare("UPDATE visitor_counter SET count = count + 1 WHERE id = 1").run();
      const row = await db.prepare("SELECT count FROM visitor_counter WHERE id = 1").first();
      return json({ count: Number(row?.count || 0) });
    }

    return json({ error: "Method not allowed" }, { status: 405 });
  } catch (error) {
    return json(
      { error: "Internal server error", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
