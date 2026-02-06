const Anthropic = require("@anthropic-ai/sdk").default;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const ticketId = req.query.ticket_id;
  const forceRefresh = req.query.refresh === "true";

  if (!ticketId) {
    return res.status(400).json({ error: "Missing ticket_id" });
  }

  // Check cache first (unless force refresh)
  if (!forceRefresh) {
    const cached = cache.get(ticketId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return res.status(200).json(cached.data);
    }
  }

  try {
    // Fetch ticket from Gorgias
    const domain = process.env.GORGIAS_DOMAIN;
    const email = process.env.GORGIAS_EMAIL;
    const apiKey = process.env.GORGIAS_API_KEY;

    const authHeader = Buffer.from(`${email}:${apiKey}`).toString("base64");

    const ticketResponse = await fetch(
      `https://${domain}/api/tickets/${ticketId}`,
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!ticketResponse.ok) {
      if (ticketResponse.status === 429) {
        return res.status(200).json({
          status: "Rate limited - wait a moment",
          category: "-",
          customer: "-",
          order_number: "-",
          refined_reply: "API rate limited. Please wait a minute and refresh.",
          option1_reply: "-",
          option2_reply: "-",
          option3_reply: "-",
        });
      }
      throw new Error(`Gorgias API error: ${ticketResponse.status}`);
    }

    const ticket = await ticketResponse.json();

    // Get customer name
    const customerName = ticket.customer?.firstname || ticket.customer?.name || "Customer";

    // Get message content
    const messagesResponse = await fetch(
      `https://${domain}/api/tickets/${ticketId}/messages`,
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/json",
        },
      }
    );

    let messageText = "";
    let subject = ticket.subject || "";

    if (messagesResponse.ok) {
      const messagesData = await messagesResponse.json();
      const customerMessages = messagesData.data?.filter((m) => !m.from_agent) || [];
      if (customerMessages.length > 0) {
        const latestMessage = customerMessages[customerMessages.length - 1];
        messageText = latestMessage.body_text || latestMessage.body_html?.replace(/<[^>]*>/g, " ") || "";
      }
    }

    // Detect category
    const content = (subject + " " + messageText).toLowerCase();
    let category = "General";
    if (content.includes("track") || content.includes("shipping") || content.includes("where") || content.includes("delivery") || content.includes("status")) {
      category = "WISMO";
    } else if (content.includes("return") || content.includes("refund")) {
      category = "Return";
    } else if (content.includes("cancel")) {
      category = "Cancellation";
    } else if (content.includes("subscription")) {
      category = "Subscription";
    } else if (content.includes("broken") || content.includes("damaged") || content.includes("not working") || content.includes("defective") || content.includes("issue") || content.includes("problem")) {
      category = "Product Issue";
    }

    // Extract Shopify order data from customer.integrations
    let orderContext = "";
    let orderNumber = "-";
    let allOrders = [];
    
    // Method 1: Check customer.integrations (main location)
    const integrations = ticket.customer?.integrations || {};
    for (const [integrationId, integrationData] of Object.entries(integrations)) {
      if (integrationData && integrationData.__integration_type__ === "shopify" && Array.isArray(integrationData.orders)) {
        allOrders = allOrders.concat(integrationData.orders);
      }
    }
    
    // Method 2: Check ticket.integrations as fallback
    const ticketIntegrations = ticket.integrations || {};
    for (const [integrationId, integrationData] of Object.entries(ticketIntegrations)) {
      if (integrationData && integrationData.__integration_type__ === "shopify" && Array.isArray(integrationData.orders)) {
        allOrders = allOrders.concat(integrationData.orders);
      }
    }
    
    // Method 3: Check meta.data.orders as another fallback
    if (ticket.meta?.data?.orders && Array.isArray(ticket.meta.data.orders)) {
      allOrders = allOrders.concat(ticket.meta.data.orders);
    }
    
    // Deduplicate orders by ID
    const uniqueOrders = [];
    const seenIds = new Set();
    for (const order of allOrders) {
      const orderId = order.id || order.order_number || order.name;
      if (!seenIds.has(orderId)) {
        seenIds.add(orderId);
        uniqueOrders.push(order);
      }
    }
    allOrders = uniqueOrders;
    
    if (allOrders.length > 0) {
      // Sort by created_at descending to get most recent first
      allOrders.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      
      // Build order context for all orders (max 5)
      const ordersToShow = allOrders.slice(0, 5);
      
      orderContext = "\n\n=== CUSTOMER'S SHOPIFY ORDERS (YOU HAVE THIS INFO - DO NOT ASK FOR IT) ===\n";
      
      ordersToShow.forEach((order, index) => {
        const orderName = order.name || `#${order.order_number}`;
        const fulfillmentStatus = order.fulfillment_status || "unfulfilled";
        const financialStatus = order.financial_status || "unknown";
        
        // Get tracking info
        let trackingInfo = "No tracking yet";
        if (order.fulfillments && order.fulfillments.length > 0) {
          const fulfillment = order.fulfillments[0];
          if (fulfillment.tracking_number) {
            trackingInfo = `Tracking: ${fulfillment.tracking_number}`;
            if (fulfillment.tracking_url) {
              trackingInfo += ` | URL: ${fulfillment.tracking_url}`;
            }
          }
        }
        
        // Get shipping address
        let shippingAddress = "No address";
        if (order.shipping_address) {
          const addr = order.shipping_address;
          shippingAddress = [addr.city, addr.province, addr.country].filter(Boolean).join(", ");
        }
        
        // Get line items
        let items = "Unknown items";
        if (order.line_items && order.line_items.length > 0) {
          items = order.line_items.map(item => `${item.quantity}x ${item.name || item.title}`).join(", ");
        }
        
        orderContext += `
ORDER ${index + 1}: ${orderName}
- Fulfillment: ${fulfillmentStatus}
- Payment: ${financialStatus}
- ${trackingInfo}
- Ship to: ${shippingAddress}
- Items: ${items}
- Date: ${order.created_at || "unknown"}
`;
        
        // Set order number for display (use most recent)
        if (index === 0) {
          orderNumber = orderName;
        }
      });
      
      orderContext += `
=== END OF ORDER INFO ===

CRITICAL INSTRUCTION: You already have the customer's order information above. 
DO NOT ask the customer for their order number, email, or any order details.
USE the order information to give a specific, helpful response.
If they ask about tracking, give them the tracking info from above.
If they ask about delivery, tell them the fulfillment status from above.
`;
    }

    // Generate reply with Claude
    const prompt = `You are a customer support agent for OSMO, a consumer electronics company. Generate a helpful reply to this customer inquiry.

CUSTOMER: ${customerName}
SUBJECT: ${subject}
MESSAGE: ${messageText}
CATEGORY: ${category}${orderContext}

STYLE GUIDELINES:
- Be direct and get to the point quickly
- Focus on solutions, not apologies
- Sound natural and human, not robotic
- Only apologize once if truly necessary, then move to the solution
- Keep response under 80 words
- NEVER ask for order number or email if you have order info above
- If tracking exists, provide it directly
- If order is unfulfilled, explain it's being prepared for shipping

BAD EXAMPLE (asking for info you already have):
"I'd be happy to help! Could you please provide your order number so I can look into this for you?"

GOOD EXAMPLE (using the order info):
"Hi Peter! Your order OSNL50482 is currently being prepared and will ship soon. I'll send you the tracking number as soon as it's dispatched. Is there anything specific about your order I can help with?"

PRODUCT KNOWLEDGE:
- Dashcam Pro: 4K recording, uses Verdure app for playback
- Robot Window Cleaner: Safety rope must be attached before use
- WildPro Trail Camera: SD card not included with single orders
- Robot Vacuum: Not suitable for thick carpets (>12mm pile)
- 4G Pet GPS Tracker: Uses 365GPS app
- VideoBell Pro: Uses iCam365 app

Generate ONE concise, helpful reply:`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const reply = response.content[0].text.trim();

    const result = {
      status: allOrders.length > 0 ? `Ready (${allOrders.length} order${allOrders.length > 1 ? 's' : ''} found)` : "Ready",
      category: category,
      customer: customerName,
      order_number: orderNumber,
      refined_reply: reply,
      option1_reply: "-",
      option2_reply: "-",
      option3_reply: "-",
    };

    // Cache the result
    cache.set(ticketId, { data: result, timestamp: Date.now() });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error:", error);
    return res.status(200).json({
      status: "Error",
      category: "-",
      customer: "-",
      order_number: "-",
      refined_reply: `Error: ${error.message}`,
      option1_reply: "-",
      option2_reply: "-",
      option3_reply: "-",
    });
  }
};
