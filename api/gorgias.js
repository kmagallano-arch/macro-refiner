// api/gorgias.js - Gorgias Widget API Endpoint

export default function handler(req, res) {
  const ticketId = req.query.ticket_id || '';

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Return the iframe_url that Gorgias frame widget expects
  res.status(200).json({
    iframe_url: `https://macro-refiner.vercel.app/gorgias-sidebar?ticket_id=${ticketId}`
  });
}
