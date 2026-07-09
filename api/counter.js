const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const count = (await redis.get('visitor_count')) || 0;
      return res.status(200).json({ count: Number(count) });
    }
    if (req.method === 'POST') {
      const count = await redis.incr('visitor_count');
      return res.status(200).json({ count });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Visitor counter error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
