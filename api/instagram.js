// api/instagram.js — Vercel Serverless Function
// This file must live at /api/instagram.js in your repo root.
// Vercel automatically turns it into a live endpoint at /api/instagram

export default async function handler(req, res) {
  // CORS headers — allow your domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  // Extract username from Instagram profile URL
  // Supports: https://instagram.com/username, https://www.instagram.com/username/,
  //           instagram.com/username, @username, or plain username
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

  // ── RapidAPI call ───────────────────────────────────────────────────────
  // Set your key in Vercel Environment Variables as RAPIDAPI_KEY
  // Dashboard → Your Project → Settings → Environment Variables
  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

  if (!RAPIDAPI_KEY) {
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  try {
    const apiRes = await fetch(
      `https://instagram-scraper-api2.p.rapidapi.com/v1/info?username_or_id_or_url=${encodeURIComponent(username)}`,
      {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'instagram-scraper-api2.p.rapidapi.com',
        },
      }
    );

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error('RapidAPI error:', apiRes.status, errText);
      return res.status(apiRes.status).json({ error: 'Instagram API error', status: apiRes.status });
    }

    const json = await apiRes.json();
    const d = json.data || json;

    if (!d || !d.username) {
      return res.status(404).json({ error: 'Profile not found or account is private' });
    }

    // ── Proxy-fetch the DP image to avoid CORS on the frontend ────────────
    const dpUrl = d.profile_pic_url_hd || d.profile_pic_url || '';
    let dpBase64 = null;
    let dpMime = 'image/jpeg';

    if (dpUrl) {
      try {
        const imgRes = await fetch(dpUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; bot/1.0)',
            'Referer': 'https://www.instagram.com/',
          },
        });
        if (imgRes.ok) {
          const buffer = await imgRes.arrayBuffer();
          dpBase64 = Buffer.from(buffer).toString('base64');
          dpMime = imgRes.headers.get('content-type') || 'image/jpeg';
        }
      } catch {
        // Image proxy failed — frontend will fall back to direct URL
      }
    }

    // ── Return clean response ──────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      username: d.username,
      full_name: d.full_name || d.username,
      biography: d.biography || '',
      external_url: d.external_url || '',
      is_verified: d.is_verified || false,
      is_private: d.is_private || false,
      profile_pic_url: dpUrl,
      profile_pic_base64: dpBase64,
      profile_pic_mime: dpMime,
      media_count: d.media_count ?? d.edge_owner_to_timeline_media?.count ?? null,
      follower_count: d.follower_count ?? d.edge_followed_by?.count ?? null,
      following_count: d.following_count ?? d.edge_follow?.count ?? null,
    });

  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
