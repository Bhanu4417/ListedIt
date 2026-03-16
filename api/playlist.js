import { proxyWithFallback, setCorsHeaders } from './_utils.js';

export default async function handler(req, res) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const data = await proxyWithFallback('/playlist/', req.query);
    res.status(200).json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
}
