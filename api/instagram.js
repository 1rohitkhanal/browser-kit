// api/instagram.js — Vercel Serverless Function
// 100% FREE — no API key, no third-party account, no bank card.
// This runs on Vercel's own servers, so it fetches Instagram directly —
// no CORS proxy needed, since CORS only applies to browser-to-server
// requests, not server-to-server ones.

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  // ── Extract username ──────────────────────────────────────────────────
  let username = '';
  try {
    let raw = url.trim();
    if (raw.includes('instagram.com')) {
      if (!raw.startsWith('http')) raw = 'https://' + raw;
      const parsed = new URL(raw);
      const parts = parsed.pathname.split('/').filter(Boolean);
      username = parts[0] || '';
    } else {
      username = raw.replace(/^@/, '');
    }
    username = username.toLowerCase().replace(/[^a-z0-9._]/g, '');
  } catch {
    return res.status(400).json({ error: 'Invalid Instagram URL or username' });
  }

  if (!username) {
    return res.status(400).json({ error: 'Could not extract username from URL' });
  }

  // ── Fetch the public profile page directly (server-side, no CORS) ──────
  try {
  const pageRes = await fetch(`https://www.instagram.com/${username}/`, {
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.instagram.com/",
    "Cache-Control": "no-cache"
  }
});
      return res.status(404).json({ error: 'Profile not found or account is private' });
    }

    const html = await pageRes.text();
    console.log(html.substring(0,1000));
    const imageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
    const titleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i);

    if (!imageMatch) {
      return res.status(404).json({ error: 'Profile not found, private, or Instagram blocked this request' });
    }

    const decode = (s) =>
      s
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');

    const dpUrl = decode(imageMatch[1]);
    let fullName = username;
    if (titleMatch) {
      fullName = decode(titleMatch[1]).split(' (@')[0].trim() || username;
    }

    // ── Proxy-fetch the image bytes so the frontend can display + download ─
    let dpBase64 = null;
    let dpMime = 'image/jpeg';
    try {
      const imgRes = await fetch(dpUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; bot/1.0)' },
      });
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        dpBase64 = Buffer.from(buffer).toString('base64');
        dpMime = imgRes.headers.get('content-type') || 'image/jpeg';
      }
    } catch {
      // Falls back to direct URL on the frontend if this fails
    }

    return res.status(200).json({
      success: true,
      username,
      full_name: fullName,
      profile_pic_url: dpUrl,
      profile_pic_base64: dpBase64,
      profile_pic_mime: dpMime,
    });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
