✨ // api/gorgias.js - Shows multiple AI-suggested replies in Gorgias sidebar

const PRODUCT_KNOWLEDGE = `
OSMO PRODUCTS: Dashcam Pro (4K, Verdure app), Robot Window Cleaner (safety rope required), WildPro Trail Camera (SD card not included with single orders), Air Fryer, Cordless Vacuum, FlixPro Projector, 4G Pet GPS Tracker (365GPS app), Epilator, Robot Vacuum (not for thick carpets >12mm), Soundbar S20, VideoBell Pro (iCam365 app), Electric Leaf Blower.
`;

async function fetchTicketData(ticketId, gorgiasAuth, domain) {
  try {
    const ticketRes = await fetch(`https://${domain}/api/tickets/${ticketId}`, {
      headers: { 'Authorization': `Basic ${gorgiasAuth}`, 'Content-Type': 'application/json' }
    });
    
    if (!ticketRes.ok) return null;
    
    const ticket = await ticketRes.json();
    
    const messagesRes = await fetch(`https://${domain}/api/tickets/${ticketId}/messages?limit=10`, {
      headers: { 'Authorization': `Basic ${gorgiasAuth}`, 'Content-Type': 'application/json' }
    });
    
    let messages = [];
    if (messagesRes.ok) {
      const msgData = await messagesRes.json();
      messages = (msgData.data || [])
        .filter(m => m.source?.from?.is_customer)
        .map(m => m.body_text || m.stripped_text || '')
        .slice(0, 3);
    }
    
    return {
      customer_name: ticket.customer?.firstname || ticket.customer?.name?.split(' ')[0] || 'there',
      subject: ticket.subject || '',
      messages: messages.join('\n\n')
    };
  } catch (e) {
    console.error('Fetch error:', e);
    return null;
  }
}

async function generateSuggestions(ticketData) {
  const prompt = `You are a customer support agent for OSMO products. Based on this ticket, generate 3 different reply options.

${PRODUCT_KNOWLEDGE}

CUSTOMER: ${ticketData.customer_name}
SUBJECT: ${ticketData.subject}
MESSAGES:
${ticketData.messages}

Generate exactly 3 reply options with different approaches:
1. EMPATHETIC - Focus on understanding and apologizing
2. SOLUTION-FOCUSED - Get straight to solving the problem  
3. INFORMATION-GATHERING - Ask clarifying questions

Format your response EXACTLY like this (use these exact labels):
===OPTION1===
[Your first reply here]
===OPTION2===
[Your second reply here]
===OPTION3===
[Your third reply here]

Each reply should:
- Address the customer by name (${ticketData.customer_name})
- Be warm and professional
- Be concise (max 100 words)
- End with "Best regards" (no agent name)`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (response.ok) {
      const data = await response.json();
      const text = data.content?.[0]?.text || '';
      
      // Parse the 3 options
      const option1Match = text.match(/===OPTION1===([\s\S]*?)(?====OPTION2===|$)/);
      const option2Match = text.match(/===OPTION2===([\s\S]*?)(?====OPTION3===|$)/);
      const option3Match = text.match(/===OPTION3===([\s\S]*?)$/);
      
      return {
        option1: option1Match ? option1Match[1].trim() : '',
        option2: option2Match ? option2Match[1].trim() : '',
        option3: option3Match ? option3Match[1].trim() : ''
      };
    }
  } catch (e) {
    console.error('Claude error:', e);
  }
  
  return null;
}

function detectCategory(ticketData) {
  const content = `${ticketData.subject} ${ticketData.messages}`.toLowerCase();
  
  if (content.includes('track') || content.includes('shipping') || content.includes('where is') || content.includes('delivery')) {
    return '📦 WISMO';
  } else if (content.includes('return') || content.includes('refund') || content.includes('money back')) {
    return '↩️ Return';
  } else if (content.includes('cancel')) {
    return '❌ Cancellation';
  } else if (content.includes('subscription') || content.includes('recurring') || content.includes('charged again')) {
    return '🔄 Subscription';
  } else if (content.includes('broken') || content.includes('damaged') || content.includes('not working') || content.includes('defective')) {
    return '🔧 Product Issue';
  } else {
    return '💬 General';
  }
}

export default async function handler(req, res) {
  const ticketId = req.query.ticket_id || '';

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!ticketId) {
    return res.status(200).json({
      status: "⏳ Open a ticket",
      category: "-",
      customer: "-",
      option1_label: "-",
      option1_reply: "Waiting for ticket data...",
      option2_label: "-", 
      option2_reply: "-",
      option3_label: "-",
      option3_reply: "-"
    });
  }

  const domain = process.env.GORGIAS_DOMAIN || 'osmozone.gorgias.com';
  const gorgiasAuth = Buffer.from(`${process.env.GORGIAS_EMAIL}:${process.env.GORGIAS_API_KEY}`).toString('base64');

  // Fetch ticket data
  const ticketData = await fetchTicketData(ticketId, gorgiasAuth, domain);
  
  if (!ticketData) {
    return res.status(200).json({
      status: "⚠️ Could not load ticket",
      category: "-",
      customer: "-",
      option1_label: "-",
      option1_reply: "Unable to fetch ticket data. Please try refreshing.",
      option2_label: "-",
      option2_reply: "-",
      option3_label: "-",
      option3_reply: "-"
    });
  }

  const category = detectCategory(ticketData);
  
  // Generate suggestions
  const suggestions = await generateSuggestions(ticketData);
  
  if (suggestions) {
    return res.status(200).json({
      status: "✨ 3 Replies Ready",
      category: category,
      customer: ticketData.customer_name,
      option1_label: "😊 Empathetic",
      option1_reply: suggestions.option1,
      option2_label: "🎯 Solution-Focused",
      option2_reply: suggestions.option2,
      option3_label: "❓ Info-Gathering",
      option3_reply: suggestions.option3
    });
  }

  // Fallback
  return res.status(200).json({
    status: "📝 Basic Reply",
    category: category,
    customer: ticketData.customer_name,
    option1_label: "Default",
    option1_reply: `Hi ${ticketData.customer_name},\n\nThank you for reaching out! I'd be happy to help you with this.\n\nCould you please provide a bit more detail so I can assist you better?\n\nBest regards`,
    option2_label: "-",
    option2_reply: "-",
    option3_label: "-",
    option3_reply: "-"
  });
}
