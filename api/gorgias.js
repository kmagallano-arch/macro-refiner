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

    // Detect category
    const content = (subject + " " + messageText).toLowerCase();
    let category = "General";
    if (content.includes("track") || content.includes("shipping") || content.includes("where") || content.includes("delivery")) {
      category = "WISMO";
    } else if (content.includes("return") || content.includes("refund")) {
      category = "Return";
    } else if (content.includes("cancel")) {
      category = "Cancellation";
    } else if (content.includes("subscription")) {
      category = "Subscription";
    }

    // Find Shopify orders
    let orders = [];
    let orderNumber = "-";
    let orderContext = "";
    
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
      const status = order.fulfillment_status || "unfulfilled";
      
      let tracking = "No tracking yet";
      if (order.fulfillments && order.fulfillments.length > 0 && order.fulfillments[0].tracking_number) {
        tracking = "Tracking: " + order.fulfillments[0].tracking_number;
      }
      
      let items = "";
      if (order.line_items && order.line_items.length > 0) {
        items = order.line_items.map(function(i) { return i.quantity + "x " + (i.name || i.title); }).join(", ");
      }
      
      orderContext = "\n\nORDER INFO (use this - DO NOT ask customer for order details):\n";
      orderContext += "Order: " + orderNumber + "\n";
      orderContext += "Status: " + status + "\n";
      orderContext += tracking + "\n";
      orderContext += "Items: " + items + "\n";
    }

    // Generate reply
    const prompt = "You are a support agent for OSMO. Write a short helpful reply (under 80 words). Be direct, not overly apologetic.\n\nCustomer: " + customerName + "\nSubject: " + subject + "\nMessage: " + messageText + orderContext + "\n\nIf you have order info above, USE IT. Do not ask for order number.\n\nReply:";

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
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
