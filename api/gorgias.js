// Simple in-memory cache
var cache = {};
var CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

module.exports = async function handler(req, res) {
  const ticketId = req.query.ticket_id || '';
  const action = req.query.action || 'suggestions'; // 'suggestions' or 'refine'
  const macroId = req.query.macro_id || '';

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (!ticketId) {
    return res.status(200).json({
      status: "Open a ticket",
      category: "-",
      customer: "-",
      refined_reply: "Waiting for ticket data...",
      option1_reply: "-",
      option2_reply: "-",
      option3_reply: "-"
    });
  }

  // Check cache first
  var cacheKey = ticketId + '_' + action + '_' + macroId;
  var cached = cache[cacheKey];
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return res.status(200).json(cached.data);
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
      refined_reply: "Environment variables not set.",
      option1_reply: "-",
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
      if (ticketRes.status === 429) {
        return res.status(200).json({
          status: "Rate limited - wait a moment",
          category: "-",
          customer: "-",
          refined_reply: "Too many requests. Please wait.",
          option1_reply: "-",
          option2_reply: "-",
          option3_reply: "-"
        });
      }
      return res.status(200).json({
        status: "Could not load ticket",
        category: "-",
        customer: "-",
        refined_reply: "Unable to fetch ticket.",
        option1_reply: "-",
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
    if (lowerContent.indexOf('track') >= 0 || lowerContent.indexOf('shipping') >= 0 || lowerContent.indexOf('where') >= 0 || lowerContent.indexOf('delivery') >= 0) {
      category = 'WISMO';
    } else if (lowerContent.indexOf('return') >= 0 || lowerContent.indexOf('refund') >= 0) {
      category = 'Return';
    } else if (lowerContent.indexOf('cancel') >= 0) {
      category = 'Cancellation';
    } else if (lowerContent.indexOf('subscription') >= 0) {
      category = 'Subscription';
    } else if (lowerContent.indexOf('broken') >= 0 || lowerContent.indexOf('damaged') >= 0 || lowerContent.indexOf('not working') >= 0 || lowerContent.indexOf('defective') >= 0) {
      category = 'Product Issue';
    }

    // Generate refined reply based on ticket
    var prompt = `You are a customer support agent for OSMO (consumer electronics: dashcams, robot vacuums, air fryers, etc).

Write ONE helpful reply for this ticket.

CUSTOMER: ${customerName}
SUBJECT: ${subject}
MESSAGE: ${ticketContent}

STYLE GUIDELINES:
- Be direct and get to the point quickly
- Focus on solutions, not apologies
- Sound natural and human, not robotic
- Keep it concise (under 100 words)
- Use simple, clear language
- Only apologize once if truly necessary, then move to the solution
- End with "Best regards" (no agent name)

BAD EXAMPLE (too apologetic/robotic):
"I sincerely apologize for any inconvenience this may have caused. I completely understand your frustration and I want to assure you that we take this matter very seriously..."

GOOD EXAMPLE (direct/helpful):
"Hi John, I checked your order and it shipped yesterday - here's your tracking link: [link]. It should arrive by Friday. Let me know if you need anything else!"

Write the reply now:`;

    var claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    var refinedReply = 'Hi ' + customerName + ', thanks for reaching out. Let me help you with this.';
    
    if (claudeRes.ok) {
      var claudeData = await claudeRes.json();
      refinedReply = claudeData.content?.[0]?.text || refinedReply;
    }

    var result = {
      status: "Ready",
      category: category,
      customer: customerName,
      refined_reply: refinedReply,
      option1_reply: "-",
      option2_reply: "-", 
      option3_reply: "-"
    };

    // Cache the result
    cache[cacheKey] = {
      timestamp: Date.now(),
      data: result
    };

    return res.status(200).json(result);

  } catch (err) {
    return res.status(200).json({
      status: "Error",
      category: "-",
      customer: "-",
      refined_reply: "Something went wrong: " + err.message,
      option1_reply: "-",
      option2_reply: "-",
      option3_reply: "-"
    });
  }
};
