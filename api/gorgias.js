// api/gorgias.js - Gorgias Widget API Endpoint

export default function handler(req, res) {
  const ticketId = req.query.ticket_id || '';

  // Return JSON data that Gorgias widget expects
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Return widget data
  res.status(200).json({
    status: "✨ Ready",
    instructions: "Click below to open Macro Refiner",
    iframe_url: `https://macro-refiner.vercel.app/gorgias-sidebar?ticket_id=${ticketId}`,
    ticket_id: ticketId
  });
}
