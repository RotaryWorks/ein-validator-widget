/**
 * Vercel serverless function: /api/ein?ein=XXXXXXXXX
 * Proxies ProPublica Nonprofit Explorer so the browser avoids CORS issues.
 */
export default async function handler(req, res) {
  // Only allow GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ein = String(req.query.ein || "").replace(/\D/g, "");
  if (ein.length !== 9) {
    return res.status(400).json({ error: "EIN must be exactly 9 digits" });
  }

  const upstream = `https://projects.propublica.org/nonprofits/api/v2/organizations/${ein}.json`;

  try {
    const upstream_res = await fetch(upstream, {
      headers: { Accept: "application/json" },
    });

    // Pass the status straight through (404 = not found, etc.)
    const body = await upstream_res.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, s-maxage=86400"); // cache 24 h on Vercel edge
    return res.status(upstream_res.status).json(body);

  } catch (err) {
    return res.status(502).json({ error: "Upstream request failed", detail: err.message });
  }
}
