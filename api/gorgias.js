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

  if (!ticketId) {
    return res.status(400).json({ error: "Missing ticket_id" });
  }

  // Check cache first
  const cached = cache.get(ticketId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return res.status(200).json(cached.data);
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
        // Don't cache rate limit errors
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
    
    const integrations = ticket.customer?.integrations || {};
    let allOrders = [];
    
    // Loop through all integrations to find Shopify orders
    for (const [integrationId, integrationData] of Object.entries(integrations)) {
      if (integrationData.__integration_type__ === "shopify" && integrationData.orders) {
        allOrders = allOrders.concat(integrationData.orders);
      }
    }
    
    if (allOrders.length > 0) {
      // Sort by created_at descending to get most recent first
      allOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      // Build order context for all orders (max 5)
      const ordersToShow = allOrders.slice(0, 5);
      
      orderContext = "\n\nCUSTOMER'S SHOPIFY ORDERS:\n";
      
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
              trackingInfo += ` (${fulfillment.tracking_url})`;
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
        
        orderContext += `\nOrder ${index + 1}: ${orderName}
- Status: ${fulfillmentStatus} (Payment: ${financialStatus})
- ${trackingInfo}
- Ship to: ${shippingAddress}
- Items: ${items}
- Order date: ${order.created_at}
`;
        
        // Set order number for display (use most recent)
        if (index === 0) {
          orderNumber = orderName;
        }
      });
      
      orderContext += "\nIMPORTANT: You have access to the customer's order information above. DO NOT ask them for order details you already have. Use this information to provide a helpful, specific response.";
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
- If you have order info above, USE IT - don't ask for details you already have
- If tracking exists and customer asks about delivery, give them the tracking info

BAD EXAMPLE (too apologetic):
"I'm so sorry to hear you're experiencing this issue. I sincerely apologize for any inconvenience this has caused. I completely understand how frustrating this must be for you. I'm truly sorry..."

GOOD EXAMPLE (direct and helpful):
"Thanks for reaching out! Your order OSNL50482 shipped yesterday and is on its way. Here's your tracking link: [link]. It should arrive within 3-5 business days. Let me know if you need anything else!"

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
      status: allOrders.length > 0 ? "Ready (Order found)" : "Ready",
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
    // Don't cache errors
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
