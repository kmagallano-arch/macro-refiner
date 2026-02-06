module.exports = async function handler(req, res) {
  const ticketId = req.query.ticket_id || '';

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (!ticketId) {
    return res.status(200).json({
      status: "Waiting for ticket",
      category: "-",
      customer: "-",
      option1_reply: "Open a ticket to see suggestions.",
      option2_reply: "-",
      option3_reply: "-"
    });
  }

  const domain = process.env.GORGIAS_DOMAIN || 'osmozone.gorgias.com';
  const gorgiasEmail = process.env.GORGIAS_EMAIL;
  const gorgiasKey = process.env.GORGIAS_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!gorgiasEmail || !gorgiasKey || !anthropicKey) {
    return res.status(200).json({
      status: "Missing config",
      category: "-",
      customer: "-",
      option1_reply: "Environment variables not set.",
      option2_reply: "-",
      option3_reply: "-"
    });
  }

  const gorgiasAuth = Buffer.from(gorgiasEmail + ':' + gorgiasKey).toString('base64');

  try {
    var ticketRes = await fetch('https://' + domain + '/api/tickets/' + ticketId, {
      headers: { 'Authorization': 'Basic ' + gorgiasAuth }
    });

    if (!ticketRes.ok) {
      return res.status(200).json({
        status: "Could not load ticket",
        category: "-",
        customer: "-",
        option1_reply: "Unable to fetch ticket data.",
        option2_reply: "-",
        option3_reply: "-"
      });
    }

    var ticket = await ticketRes.json();
    var customerName = ticket.customer?.firstname || ticket.customer?.name?.split(' ')[0] || 'there';

    var messagesRes = await fetch('https://' + domain + '/api/tickets/' + ticketId + '/messages?limit=5', {
      headers: { 'Authorization': 'Basic ' + gorgiasAuth }
    });

    var messages = [];
    if (messagesRes.ok) {
      var msgData = await messagesRes.json();
      messages = (msgData.data || []).filter(function(m) {
        return m.source && m.source.from && m.source.from.is_customer;
      }).map(function(m) {
        return m.body_text || m.stripped_text || '';
      }).slice(0, 3);
    }

    var ticketContent = messages.join('\n');
    var subject = ticket.subject || '';

    var category = 'General';
    var lowerContent = (subject + ' ' + ticketContent).toLowerCase();
    if (lowerContent.indexOf('track') >= 0 || lowerContent.indexOf('shipping') >= 0 || lowerContent.indexOf('where') >= 0) {
      category = 'WISMO';
    } else if (lowerContent.indexOf('return') >= 0 || lowerContent.indexOf('refund') >= 0) {
      category = 'Return';
    } else if (lowerContent.indexOf('cancel') >= 0) {
      category = 'Cancellation';
    } else if (lowerContent.indexOf('subscription') >= 0) {
      category = 'Subscription';
    } else if (lowerContent.indexOf('broken') >= 0 || lowerContent.indexOf('damaged') >= 0 || lowerContent.indexOf('not working') >= 0) {
      category = 'Product Issue';
    }

    var prompt = 'You are a customer support agent. Generate 3 short reply options for this ticket.\n\nCustomer: ' + customerName + '\nSubject: ' + subject + '\nMessage: ' + ticketContent + '\n\nGenerate exactly 3 replies:\n1. EMPATHETIC - warm and understanding\n2. SOLUTION - direct and action-focused\n3. QUESTION - ask for more info\n\nFormat:\n===1===\n[reply]\n===2===\n[reply]\n===3===\n[reply]\n\nKeep each under 80 words. End with Best regards.';

    var claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (claudeRes.ok) {
      var claudeData = await claudeRes.json();
      var text = claudeData.content?.[0]?.text || '';

      var match1 = text.match(/===1===([\s\S]*?)(?====2===|$)/);
      var match2 = text.match(/===2===([\s\S]*?)(?====3===|$)/);
      var match3 = text.match(/===3===([\s\S]*?)$/);

      return res.status(200).json({
        status: "3 Replies Ready",
        category: category,
        customer: customerName,
        option1_reply: match1 ? match1[1].trim() : 'Could not generate.',
        option2_reply: match2 ? match2[1].trim() : 'Could not generate.',
        option3_reply: match3 ? match3[1].trim() : 'Could not generate.'
      });
    }

    return res.status(200).json({
      status: "AI unavailable",
      category: category,
      customer: customerName,
      option1_reply: 'Hi ' + customerName + ', thank you for reaching out. I would be happy to help you with this.',
      option2_reply: '-',
      option3_reply: '-'
    });

  } catch (err) {
    return res.status(200).json({
      status: "Error",
      category: "-",
      customer: "-",
      option1_reply: "Something went wrong: " + err.message,
      option2_reply: "-",
      option3_reply: "-"
    });
  }
};
