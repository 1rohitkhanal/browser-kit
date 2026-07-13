// api/instagram.js — Vercel Serverless Function
// FREE version — no API key, no RapidAPI account, no bank card required.
// Reads Instagram's own public profile page and grabs the og:image meta tag,
// which is the profile picture Instagram already serves to anyone (even logged out).
//
// Trade-off vs a paid scraper API:
//  - You get: profile picture, display name
//  - You do NOT get: follower/following/post counts, bio, verified badge
//    (those require a logged-in session or a paid API — Instagram doesn't
//    expose them publicly anymore)

export default async function handler(req, res) {
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

  // ── Fetch the public profile page ─────────────────────────────────────
  try {
    const pageRes = await fetch(`https://www.instagram.com/${encodeURIComponent(username)}/`, {
      headers: {
        // A normal browser UA — Instagram serves a stripped logged-out HTML
        // page to bots/no-UA requests, so this needs to look like a browser.
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!pageRes.ok) {
      return res.status(404).json({ error: 'Profile not found or account is private' });
    }

    const html = await pageRes.text();

    // og:image → the profile picture Instagram exposes publicly
    const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
    // og:title → usually "Full Name (@username) • Instagram photos and videos"
    const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);

    if (!imageMatch) {
      return res.status(404).json({ error: 'Profile not found, private, or Instagram blocked this request' });
    }

    // Decode HTML entities Instagram sometimes includes (&amp; etc.)
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
      // Strip the " (@username) • Instagram..." suffix, keep just the name
      fullName = decode(titleMatch[1]).split(' (@')[0].trim() || username;
    }

    // ── Proxy-fetch the image so the frontend can download it directly ────
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
      // If proxying fails, frontend falls back to the direct URL
    }

    return res.status(200).json({
      success: true,
      username,
      full_name: fullName,
      biography: '',
      external_url: '',
      is_verified: false,
      is_private: false,
      profile_pic_url: dpUrl,
      profile_pic_base64: dpBase64,
      profile_pic_mime: dpMime,
      media_count: null,
      follower_count: null,
      following_count: null,
    });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
