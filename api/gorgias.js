module.exports = function handler(req, res) {
  const ticketId = req.query.ticket_id || '';
  res.status(200).json({
    status: "Ready",
    category: "Test",
    customer: "Test Customer",
    option1_reply: "Hi! This is option 1.",
    option2_reply: "Hi! This is option 2.",
    option3_reply: "Hi! This is option 3."
  });
};

