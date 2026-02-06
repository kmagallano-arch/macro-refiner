const Anthropic = require("@anthropic-ai/sdk").default;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const ticketId = req.query.ticket_id;
  
  if (!ticketId) {
    return res.status(400).json({ error: "Missing ticket_id" });
  }

  try {
    const domain = process.env.GORGIAS_DOMAIN;
    const email = process.env.GORGIAS_EMAIL;
    const apiKey = process.env.GORGIAS_API_KEY;
    const authHeader = Buffer.from(email + ":" + apiKey).toString("base64");

    // Fetch ticket
    const ticketRes = await fetch("https://" + domain + "/api/tickets/" + ticketId, {
      headers: { "Authorization": "Basic " + authHeader }
    });
    
    if (!ticketRes.ok) {
      throw new Error("Gorgias error: " + ticketRes.status);
    }
    
    const ticket = await ticketRes.json();
    const customerName = ticket.customer?.firstname || ticket.customer?.name || "Customer";

    // Fetch messages
    const msgRes = await fetch("https://" + domain + "/api/tickets/" + ticketId + "/messages", {
      headers: { "Authorization": "Basic " + authHeader }
    });
    
    let messageText = "";
    let subject = ticket.subject || "";
    
    if (msgRes.ok) {
      const msgData = await msgRes.json();
      const custMsgs = (msgData.data || []).filter(function(m) { return !m.from_agent; });
      if (custMsgs.length > 0) {
        const latest = custMsgs[custMsgs.length - 1];
        messageText = latest.body_text || (latest.body_html || "").replace(/<[^>]*>/g, " ");
      }
    }

    // Detect category and check for escalation triggers
    const content = (subject + " " + messageText).toLowerCase();
    let category = "General";
    let needsEscalation = false;
    
    // Check escalation triggers first
    const escalationTriggers = ["chargeback", "legal action", "lawyer", "lawsuit", "fraud", "police", "regulators", "consumer affairs", "fire", "smoke", "overheating", "injury", "damage", "review", "social media", "going public", "unauthorized charge", "manager", "supervisor"];
    for (var i = 0; i < escalationTriggers.length; i++) {
      if (content.includes(escalationTriggers[i])) {
        needsEscalation = true;
        category = "ESCALATION";
        break;
      }
    }
    
    if (!needsEscalation) {
      if (content.includes("track") || content.includes("shipping") || content.includes("where") || content.includes("delivery") || content.includes("status")) {
        category = "WISMO";
      } else if (content.includes("return") || content.includes("refund")) {
        category = "Return";
      } else if (content.includes("cancel")) {
        category = "Cancellation";
      } else if (content.includes("subscription")) {
        category = "Subscription";
      } else if (content.includes("not as described") || content.includes("different") || content.includes("wrong item")) {
        category = "Item Not As Described";
      } else if (content.includes("broken") || content.includes("damaged") || content.includes("not working") || content.includes("defective")) {
        category = "Damaged/Defective";
      } else if (content.includes("missing") || content.includes("incomplete")) {
        category = "Missing Items";
      }
    }

    // Find Shopify orders
    let orders = [];
    let orderNumber = "-";
    let orderContext = "";
    let fulfillmentStatus = "unknown";
    let productName = "";
    
    const integrations = ticket.customer?.integrations || {};
    for (const key in integrations) {
      const integ = integrations[key];
      if (integ && integ.__integration_type__ === "shopify" && integ.orders && integ.orders.length > 0) {
        orders = orders.concat(integ.orders);
      }
    }
    
    if (orders.length > 0) {
      orders.sort(function(a, b) { 
        return new Date(b.created_at || 0) - new Date(a.created_at || 0); 
      });
      
      const order = orders[0];
      orderNumber = order.name || "#" + order.order_number;
      fulfillmentStatus = order.fulfillment_status || "unfulfilled";
      
      let tracking = "No tracking yet";
      if (order.fulfillments && order.fulfillments.length > 0 && order.fulfillments[0].tracking_number) {
        tracking = "Tracking: " + order.fulfillments[0].tracking_number;
        if (order.fulfillments[0].tracking_url) {
          tracking += " | URL: " + order.fulfillments[0].tracking_url;
        }
      }
      
      let items = "";
      if (order.line_items && order.line_items.length > 0) {
        items = order.line_items.map(function(i) { return i.quantity + "x " + (i.name || i.title); }).join(", ");
        productName = order.line_items[0].name || order.line_items[0].title || "";
      }
      
      orderContext = "\n\nORDER INFO:\n";
      orderContext += "Order: " + orderNumber + "\n";
      orderContext += "Status: " + fulfillmentStatus + "\n";
      orderContext += tracking + "\n";
      orderContext += "Items: " + items + "\n";
    }

    // Build the prompt with macro knowledge
    const prompt = `You are a customer support agent for OSMO (consumer electronics). Generate a reply based on our standard macros and processes.

CUSTOMER: ${customerName}
SUBJECT: ${subject}
MESSAGE: ${messageText}
CATEGORY: ${category}${orderContext}

STYLE RULES:
- Be direct, solution-focused, not overly apologetic
- Keep under 100 words
- Use order info if available - DO NOT ask for order details you already have
- Start with "Hi {{ticket.customer.firstname}}," (this is a Gorgias placeholder that will auto-fill)
- Always end with "Best regards,\n{{ticket.assignee_user.firstname}}" (this is a Gorgias placeholder for agent name)
- DO NOT use the actual customer name "${customerName}" - use the placeholder {{ticket.customer.firstname}} instead

ESCALATION TRIGGERS (if detected, use escalation macro):
Chargeback, legal action, lawyer, lawsuit, fraud, police, safety hazard, fire, smoke, overheating, injury, property damage, threats of reviews/social media, unauthorized charges, asking for manager

MACRO GUIDELINES BY CATEGORY:

ESCALATION:
"Thanks for reaching out. I've reviewed your message and, to ensure this is handled appropriately, I'm reassigning your case to our escalation team for further review. They'll follow up with you as soon as possible."

WISMO (Where Is My Order):
- Unfulfilled <5 days: "Your order is currently being processed before shipping. As soon as it ships, you'll receive a confirmation email with tracking details."
- Unfulfilled >5 days (upset): Offer 5% partial refund, apologize for delay
- Shipped on time: Provide tracking link, give delivery estimate
- Shipped but delayed: Acknowledge delay, provide tracking, reassure
- No tracking movement >5 days: Escalate with courier, offer reshipment if no update in 48hrs
- Return to sender: Offer free reshipment, ask to confirm address

RETURNS:
- First ask for return reason
- Item not as described: Ask for photo, then offer 15% partial refund to keep item
- Change of mind: Offer 15% partial refund to keep item
- Damaged/defective: Ask for photo/video, offer replacement
- Outside 14-day window: Explain policy, but offer to review case

PARTIAL REFUND ESCALATION:
- PR1: Offer 30% to keep item
- PR2: If declined, offer 50% to keep item
- If still declined: Provide return instructions

CANCELLATIONS:
- Order not shipped: Offer 15% PR to keep, then 30% if declined
- Already shipped: Cannot cancel, offer help when it arrives
- Subscription: Offer 10% discount on next cycle or pause for 6 months

SUBSCRIPTION:
- Unwanted renewal: Offer 20% PR on latest order, cancel future charges
- Cancel request: Offer pause or delay options first
- Already shipped: Cancel subscription, explain current order can't be stopped

PRODUCT-SPECIFIC RESPONSES:
- Vacuum missing attachments: Clarify that main head unit is not an attachment
- Window cleaner no water tank: Earlier model, offer 20% PR or replacement with newer model
- Trail camera 1 unit: SD cards only included with 2+ units, offer 15% PR
- Robot vacuum on carpet: Works on hard floors/low-pile only, offer 30% PR
- Dashcam branding (Osmo vs Mivo): Explain rebrand, same product, offer 20% PR

NON-RETURNABLE (hygienic items):
- Ask more about the issue first
- If defective: Request video, offer free replacement
- If just dissatisfied: Offer 15% PR

Generate ONE concise reply following the appropriate macro pattern:`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    });

    const reply = response.content[0].text.trim();

    return res.status(200).json({
      status: orders.length > 0 ? "Ready (" + orders.length + " orders)" : "Ready",
      category: category,
      customer: customerName,
      order_number: orderNumber,
      refined_reply: reply,
      option1_reply: "-",
      option2_reply: "-",
      option3_reply: "-"
    });

  } catch (error) {
    return res.status(200).json({
      status: "Error",
      category: "-",
      customer: "-",
      order_number: "-",
      refined_reply: "Error: " + error.message,
      option1_reply: "-",
      option2_reply: "-",
      option3_reply: "-"
    });
  }
};
