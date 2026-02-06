// Simple in-memory cache
var cache = {};
var CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

module.exports = async function handler(req, res) {
  const ticketId = req.query.ticket_id || '';

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
  var cached = cache[ticketId];
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
    // Fetch ticket data
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
    var customerEmail = ticket.customer?.email || '';

    // Fetch messages
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

    // Check for Shopify order data
    var hasOrder = false;
    var orderInfo = '';
    var orderNumber = '';
    var orderStatus = '';
    var trackingNumber = '';
    var trackingUrl = '';
    var shippingAddress = '';
    var orderItems = [];

    // Check ticket meta for Shopify data
    if (ticket.meta && ticket.meta.data) {
      var meta = ticket.meta.data;
      
      // Check for orders in meta
      if (meta.orders && meta.orders.length > 0) {
        hasOrder = true;
        var order = meta.orders[0];
        orderNumber = order.name || order.order_number || '';
        orderStatus = order.fulfillment_status || order.financial_status || '';
        
        if (order.fulfillments && order.fulfillments.length > 0) {
          var fulfillment = order.fulfillments[0];
          trackingNumber = fulfillment.tracking_number || '';
          trackingUrl = fulfillment.tracking_url || '';
        }
        
        if (order.shipping_address) {
          var addr = order.shipping_address;
          shippingAddress = [addr.city, addr.province, addr.country].filter(Boolean).join(', ');
        }
        
        if (order.line_items) {
          orderItems = order.line_items.map(function(item) {
            return item.quantity + 'x ' + item.name;
          });
        }
        
        orderInfo = 'Order ' + orderNumber + ' - Status: ' + orderStatus;
        if (trackingNumber) orderInfo += ' - Tracking: ' + trackingNumber;
        if (orderItems.length > 0) orderInfo += ' - Items: ' + orderItems.join(', ');
      }
    }

    // Also check customer data for orders
    if (!hasOrder && ticket.customer?.meta?.data?.orders) {
      var custOrders = ticket.customer.meta.data.orders;
      if (custOrders.length > 0) {
        hasOrder = true;
        var order = custOrders[0];
        orderNumber = order.name || order.order_number || '';
        orderStatus = order.fulfillment_status || '';
        orderInfo = 'Order ' + orderNumber + ' - Status: ' + orderStatus;
      }
    }

    // Determine category
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

    // Build prompt with order context
    var orderContext = '';
    if (hasOrder) {
      orderContext = `
ORDER INFORMATION (already available - DO NOT ask for order details):
- Order Number: ${orderNumber}
- Status: ${orderStatus}
${trackingNumber ? '- Tracking: ' + trackingNumber : ''}
${trackingUrl ? '- Tracking URL: ' + trackingUrl : ''}
${shippingAddress ? '- Shipping to: ' + shippingAddress : ''}
${orderItems.length > 0 ? '- Items: ' + orderItems.join(', ') : ''}

IMPORTANT: Since we already have the order information, reference it directly in your reply. Do NOT ask the customer for their order number.`;
    } else {
      orderContext = `
NO ORDER FOUND: There is no order associated with this ticket yet. If relevant, you may ask for the order number.`;
    }

    var prompt = `You are a customer support agent for OSMO (consumer electronics: dashcams, robot vacuums, air fryers, etc).

Write ONE helpful reply for this ticket.

CUSTOMER: ${customerName}
SUBJECT: ${subject}
MESSAGE: ${ticketContent}
${orderContext}

STYLE GUIDELINES:
- Be direct and get to the point quickly
- Focus on solutions, not apologies
- Sound natural and human, not robotic
- Keep it concise (under 100 words)
- Use simple, clear language
- Only apologize once if truly necessary, then move to the solution
- End with "Best regards" (no agent name)
- If order info is available, use it. Don't ask for info you already have.

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
      status: hasOrder ? "Ready (Order found)" : "Ready",
      category: category,
      customer: customerName,
      refined_reply: refinedReply,
      order_number: orderNumber || "-",
      option1_reply: "-",
      option2_reply: "-", 
      option3_reply: "-"
    };

    // Cache the result
    cache[ticketId] = {
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
