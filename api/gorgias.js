// api/gorgias.js

export default function handler(req, res) {
  const ticketId = req.query.ticket_id || '';

  res.status(200).json({
    status: "Ready",
    category: "Test",
    customer: "Test Customer",
    option1_reply: "Hi! This is option 1 - the empathetic response.",
    option2_reply: "Hi! This is option 2 - the solution-focused response.",
    option3_reply: "Hi! This is option 3 - the info-gathering response."
  });
}

