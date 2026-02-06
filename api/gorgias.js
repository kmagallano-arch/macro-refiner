// Save this as: src/api/gorgias.js (or pages/api/gorgias.js if using Next.js pages)

export default async function handler(req, res) {
  // Allow iframe embedding from Gorgias
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('X-Frame-Options', 'ALLOW-FROM https://osmozone.gorgias.com');
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://*.gorgias.com");

  const ticketId = req.query.ticket_id || '';

  // Return HTML that loads the sidebar widget
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Macro Refiner</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    iframe { width: 100%; height: 100vh; border: none; }
  </style>
</head>
<body>
  <iframe src="https://macro-refiner.vercel.app/gorgias-sidebar?ticket_id=${ticketId}"></iframe>
</body>
</html>
  `;

  res.status(200).send(html);
}
