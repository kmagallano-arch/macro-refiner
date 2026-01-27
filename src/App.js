import React, { useState } from 'react';

const MACRO_LIBRARY = [
  {
    id: 'return_ask_reason',
    name: 'Ask for Return Reason',
    category: 'Returns',
    template: `Hi {{customer.first_name}},

Thanks for reaching out. We've received your return request.

To help us assist you properly, could you please let us know the reason for the return? Once we have that information, we'll review it and advise you on the next steps.

Best regards,
{{agent.first_name}}`
  },
  {
    id: 'return_not_as_described_photo',
    name: 'Item Not as Described - Request Photo',
    category: 'Returns',
    template: `Hi {{customer.first_name}},

Thanks so much for providing the details. I understand that the item didn't match your expectations. Could you please send a clear photo showing what you're referring to, along with a bit more information on why you feel it's not as described? If the product hasn't been opened, a photo of the packaging works perfectly.

Once we have that, we'll review it right away and get back to you with the next steps.

Best regards,
{{agent.first_name}}
Customer Care Specialist`
  },
  {
    id: 'return_not_as_described_pr15_packaging',
    name: 'Not as Described - PR 15% (Different Packaging)',
    category: 'Returns',
    template: `Hi {{customer.first_name}},

Thanks for reaching out—I understand why the packaging difference could be confusing.

The product itself is the same. What varies is the outer packaging, which can change between production batches or as part of routine packaging updates. This doesn't affect the item, its features, or how it works.

We can offer a 15% partial refund as a courtesy. Just let us know and we'll process it right away.

Best regards,
{{agent.first_name}}`
  },
  {
    id: 'return_not_as_described_pr15_functionality',
    name: 'Not as Described - PR 15% (Functionality Issue)',
    category: 'Returns',
    template: `Hi {{customer.first_name}},

Thanks for reaching out. I understand your concern about the product functionality.

The product works as described, but I understand it may not fully meet your expectations based on how you planned to use it. To help make this right, we can offer a 15% partial refund if you're happy to keep the item.

Let me know if this works for you and I'll process it right away.

Best regards,
{{agent.first_name}}`
  },
  {
    id: 'return_not_as_described_pr15_missing',
    name: 'Not as Described - PR 15% (Missing Features)',
    category: 'Returns',
    template: `Hi {{customer.first_name}},

Thanks for reaching out. I understand your concern.

The product includes its core features and is fully functional for its intended use, making it practical and easy to use. As an option, we can offer a 15% partial refund if you're happy to keep the item.

Let me know if that works for you and I'll take care of it right away.

Best regards,
{{agent.first_name}}`
  },
  {
    id: 'return_not_as_described_pr15_different',
    name: 'Not as Described - PR 15% (Completely Different)',
    category: 'Returns',
    template: `Hi {{customer.first_name}},

Thanks for reaching out. I understand your concern.

While the product may look different from what you expected, it offers the same core features and functionality and can be used as intended. As an option, we can offer a 15% partial refund if you're happy to keep the item.

Let me know if that works for you and I'll take care of it right away.

Best regards,
{{agent.first_name}}`
  },
  {
    id: 'return_not_as_described_troubleshoot',
    name: 'Not as Described - Troubleshooting',
    category: 'Returns',
    template: `Hi {{customer.first_name}},

Thank you for sharing the photo. Let's go through a few quick checks together to see if we can resolve the issue without the hassle of a return:

[INSERT TROUBLESHOOTING STEPS]

If the issue persists, I'll be happy to guide you through your replacement at no additional cost. Looking forward to your update.

Best regards,
{{agent.first_name}}`
  },
  {
    id: 'return_not_as_described_upgrade',
    name: 'Not as Described - Upgraded Version Offer',
    category: 'Returns',
    template: `Hi {{customer.first_name}},

Thank you for your response and for letting us know that the partial refund isn't what you were looking for.

To make this right, I'd like to offer you a free reshipment of the upgraded version of the product, which includes [INSERT IMPORTANT FEATURES OF THE UPGRADED VERSION]. There's no need to return the current item—you can keep it or gift it if you like.

Just let me know if this solution works for you, and I'll personally arrange everything so your upgraded version is sent out promptly.

Looking forward to your response.

All the best,
{{agent.first_name}}`
  },
  {
    id: 'return_replacement_address',
    name: 'Replacement - Address Confirmation',
    category: 'Returns',
    template: `Hi {{customer.first_name}},

Thank you for sending that over.

I've reviewed your case and want to make this right for you.

In order to sort this for you as quickly as possible, could you please confirm your current shipping address below?

Once confirmed, I'll arrange for the replacement to be sent out straight away and share the tracking details with you as soon as it's on the way.

I'm looking forward to your response.

Best regards,
{{agent.first_name}}`
  },
  {
    id: 'return_replacement_processed',
    name: 'Replacement - Already Processed',
    category: 'Returns',
    template: `Hi {{customer.first_name}},

Thank you for confirming! I'm excited to let you know that your replacement has been arranged and will be on its way shortly.

I'll share the tracking details with you as soon as the shipment is processed, so you can keep an eye on it every step of the way.

If you have any questions in the meantime, don't hesitate to reach out.

All the best,
{{agent.first_name}}`
  },
  {
    id: 'return_change_of_mind_photo',
    name: 'Change of Mind - Request Photo',
    category: 'Returns',
    template: `Hi {{customer.first_name}},

Thank you for sharing the reason for your return. Could you please let us know the condition of the item and share a photo of the packaging?

This will help us process your request quickly.

Best regards,
{{agent.first_name}}
Customer Care Specialist`
  },
  {
    id: 'return_change_of_mind_pr15',
    name: 'Change of Mind - PR 15%',
    category: 'Returns',
    template: `Hi {{customer.first_name}},

Thanks for reaching out.

I understand that you no longer need the product or have decided not to proceed. If the item is still unused, one option you may want to consider is keeping it, as it remains fully functional and ready to use whenever needed. Some customers also choose to keep it as a spare or pass it along as a gift.

As an alternative, we can offer a 15% partial refund if you're happy to keep the item. This allows you to receive a refund while still getting value from the product.

Let me know how you'd like to proceed and I'll be happy to assist further.

Best regards,
{{agent.first_name}}`
  },
  {
    id: 'return_damaged_photo',
    name: 'Does Not Work/Damaged - Request Photo',
    category: 'Returns',
    template: `Hi {{customer.first_name}},

Thanks for letting us know. I'm sorry to hear the item isn't working properly or arrived damaged.

To help us assess this and move forward, please send a clear photo or a short video showing the issue.

If the problem isn't something that can be captured on photo or video, just let us know what's happening and when the issue occurs.

Once we have that, we'll review it and get back to you promptly.

Best regards,
{{agent.first_name}}
Customer Care Specialist`
  },
  {
    id: 'return_damaged_replacement',
    name: 'Does Not Work/Damaged - Replacement',
    category: 'Returns',
    template: `Hi {{customer.first_name}},

Thanks for reaching out and letting us know.

I understand the item arrived damaged or isn't working properly. We'll replace it so you receive a unit that works as it should.

Before we proceed, could you please confirm that the shipping address below is correct?

{{customer.address}}

Once confirmed, I'll take care of the next steps and share the replacement details with you.

Best regards,
{{agent.first_name}}`
  },
  {
    id: 'return_damaged_troubleshoot',
    name: 'Does Not Work/Damaged - Troubleshooting',
    category: 'Returns',
    template: `Hi {{customer.first_name}},

Thanks for reaching out and letting us know.

I understand the product isn't working as expected. I'd like to check if we can quickly troubleshoot the issue, as it's often something we can resolve with a few simple steps.

Could you please describe what's happening with the item, or share any details that might help us better understand the issue? Once we have that information, we'll take it from there.

Best regards,
{{agent.first_name}}`
  },
  {
    id: 'return_subscription_did_not_order',
    name: 'Subscription - Did Not Order',
    category: 'Returns',
    template: `Hi {{customer.first_name}},

Thanks for reaching out. I understand why this would be confusing.

I've checked your order and confirmed that it was placed under a subscription plan, and I understand this wasn't something you were aware of at the time of purchase.

For the charge that already went through, we'd like to make this right. As an option, I can offer a 20% partial refund while you keep the order, and I'll also ensure the subscription is handled correctly going forward so there are no unexpected charges.

Let me know if this works for you and I'll take care of it right away.

Best regards,
{{agent.first_name}}
Customer Care Specialist`
  },
  {
    id: 'return_did_not_order_pr15',
    name: 'Did Not Order - PR 15%',
    category: 'Returns',
    template: `Hi {{customer.first_name}},

Thanks for reaching out and letting us know. I understand how unexpected it can be to receive an item you don't recall ordering, and I'm glad you contacted us so we can clear this up.

Our records show that the order was placed online and processed under your billing details. To make this easier for you, we can offer a 15% refund if you're happy to keep the item. There's no need to go through the return process.

If this works for you, just let me know and I'll take care of the refund right away.

Best regards,
{{agent.first_name}}
Customer Care Specialist`
  },
  {
    id: 'return_found_cheaper_pr40',
    name: 'Found Cheaper Item - PR 40%',
    category: 'Returns',
    template: `Hi {{customer.first_name}},

Thank you for letting us know.

While we're unable to adjust or match pricing after an order is placed, we'd still like to help. As an option, we can offer a 40% partial refund if you're happy to keep the item.

If this works for you, just let us know and we'll take care of the update right away.

Best regards,
{{agent.first_name}}
Customer Care Specialist`
  },
  {
    id: 'return_pr1_30',
    name: 'Return - PR 1 (30%)',
    category: 'Returns',
    template: `Hi {{customer.first_name}},

Thanks for letting us know. I understand you'd like to proceed with a return.

Before we move forward, I wanted to share an alternative in case it's more convenient. We can offer a 30% partial refund if you prefer to keep the item, and it would still be covered under our 2-year warranty.

If you'd still like to proceed with the return, just let me know and I'll guide you through the next steps.

Best regards,
{{agent.first_name}}`
  },
  {
    id: 'return_pr2_50',
    name: 'Return - PR 2 (50%)',
    category: 'Returns',
    template: `Hi {{customer.first_name}},

Thank you for your response. I completely understand your decision.

I have attached a return form for your convenience. If you choose to return the item, please print and fill out the form, place it in the package, and arrange for return shipping to the address listed. Once your package has been shipped, kindly reply to this email with the tracking information so we can monitor it and notify you as soon as it arrives.

Alternatively, I can offer you a 50% partial refund if you'd like to keep the item. If you'd like to take advantage of this offer, simply reply to this email and I will process it immediately.

Best regards,
{{agent.first_name}}`
  },
  {
    id: 'return_non_returnable_ask',
    name: 'Non-Returnable - Ask More Info',
    category: 'Returns',
    template: `Hi {{customer.first_name}},

Thanks for reaching out and sharing your concern. I understand how important it is to feel confident about your purchase.

As this item is classified as a hygienic product, we're unable to accept returns once it has been opened, as this helps ensure the safety of all customers. That said, I'd still like to help find the best possible solution for you.

Please let me know a bit more about the issue you're experiencing, and I'll be happy to assist further.

Best regards,
{{agent.first_name}}
Customer Care Specialist`
  },
  {
    id: 'return_non_returnable_defective',
    name: 'Non-Returnable - Defective',
    category: 'Returns',
    template: `Hi {{customer.first_name}},

Thank you for letting us know about the issue you're experiencing and I appreciate you bringing this to our attention.

While hygienic items are non-returnable, we're absolutely happy to help if the product is defective. To move forward, could you please send us a short video clearly showing the issue? This helps us quickly verify the problem and arrange the best solution for you.

Once confirmed, we'll be happy to offer a free replacement, sent straight to you at no additional cost.

I look forward to getting this resolved for you as quickly as possible.

Best regards,
{{agent.first_name}}
Customer Care Specialist`
  },
  {
    id: 'return_non_returnable_dissatisfied',
    name: 'Non-Returnable - Dissatisfied',
    category: 'Returns',
    template: `Hi {{customer.first_name}},

Thank you for sharing your feedback with us. I completely understand that the product may not have met your expectations, and I truly appreciate you taking the time to let us know.

As this is a hygienic item, we're unable to accept returns. However, I don't want to leave you without options. We can offer you a 15% partial refund as a way to help resolve this.

If this works for you, just let me know and I'll take care of it right away.

Best regards,
{{agent.first_name}}
Customer Care Specialist`
  },
  {
    id: 'return_outside_14_days',
    name: 'Outside 14-Day Return Period',
    category: 'Returns',
    template: `Hi {{customer.first_name}},

Thanks for reaching out. I appreciate you getting in touch about your order.

After reviewing the details, I can confirm that the order is outside our 14-day return window, so we're unable to process a standard return at this time. This policy is in place to ensure fair and consistent handling for all customers.

That said, I'm happy to take a closer look and see how we can help. Please let me know a bit more about your request, and I'll review the available options with you.

Best regards,
{{agent.first_name}}
Customer Care Specialist`
  },
  {
    id: 'cancel_pr1_15',
    name: 'Order Cancellation - PR 1 (15%)',
    category: 'Cancellations',
    template: `Hi {{customer.first_name}},

Thank you for your message.

I understand you'd like to cancel your order. At this stage, it's already being prepared for processing, so cancellation may no longer be possible.

To help, we can offer a 15% partial refund should you decide to proceed with the order as is. Let me know if this works for you and I'll take care of it right away.

Best regards,
{{agent.first_name}}`
  },
  {
    id: 'cancel_pr2_30',
    name: 'Order Cancellation - PR 2 (30%)',
    category: 'Cancellations',
    template: `Hi {{customer.first_name}},

Thank you for getting back to us. I understand you'd like to proceed with cancelling your order.

Before I move forward, I wanted to check if there's anything we can do to change your mind. We can offer a 30% partial refund if you're open to keeping the order instead.

If you'd still prefer to cancel, just let me know and I'll take care of it right away.

Best regards,
{{agent.first_name}}`
  },
  {
    id: 'cancel_already_shipped',
    name: 'Order/Upsell Cancellation - Already Shipped',
    category: 'Cancellations',
    template: `Hi {{customer.first_name}},

Thank you for reaching out. I completely understand that you'd like to cancel your order. I've checked, and it has already been shipped, so we're unfortunately unable to cancel it at this stage.

If you need any assistance once the order arrives, please let us know and we'll be happy to help.

Best regards,
{{agent.first_name}}`
  },
  {
    id: 'cancel_safety_hazard',
    name: 'Order Cancellation - Safety Hazard Issue',
    category: 'Cancellations',
    template: `Hi {{customer.first_name}},

Thanks for reaching out.

We had to cancel the order due to a safety-related issue identified during our final checks. To avoid any risk, we weren't able to proceed with shipment.

Any charge made for this order has been voided or refunded accordingly. If you have questions, feel free to let me know.

Best regards,
{{agent.first_name}}`
  },
  {
    id: 'upsell_cancel_pr20',
    name: 'Upsell Cancellation - PR 20%',
    category: 'Cancellations',
    template: `Hi {{customer.first_name}},

Thanks for letting us know. I understand you'd like to cancel the additional item.

If it helps, one option is to keep the upsell item and we can apply a 20% discount to it. This would allow you to receive it at a reduced price without any further changes needed.

If you'd still prefer to cancel the upsell, just let me know and I'll take care of it for you.

Best regards,
{{agent.first_name}}`
  },
  {
    id: 'sub_cancel_keep_last',
    name: 'Subscription Cancellation - Keep Last Order',
    category: 'Subscriptions',
    template: `Hi {{customer.first_name}},

Thanks for reaching out. I understand why this would be confusing.

I've reviewed your order and can confirm that it was placed under a subscription plan, which explains the charge. I understand this wasn't something you were aware of at the time of purchase.

I can take care of the subscription for you going forward so there are no further or unexpected charges. If you have enough stock at the moment, I can pause the subscription or delay the next recurring charge to a later date.

Please let me know how you'd like to proceed, and I'll handle it right away.

Best regards,
{{agent.first_name}}
Customer Care Specialist`
  },
  {
    id: 'sub_cancel_no_new_order',
    name: 'Subscription Cancellation - No New Order',
    category: 'Subscriptions',
    template: `Hi {{customer.first_name}},

Thanks for reaching out.

I understand you're looking to cancel your subscription. Before we proceed, I wanted to let you know that your plan renews automatically, and there are flexible options available if you'd prefer not to cancel entirely. We can pause the subscription or adjust the next billing date to a later time, depending on what works best for you.

Let me know how you'd like to proceed and I'll take care of it.

Best regards,
{{agent.first_name}}`
  },
  {
    id: 'sub_cancel_unfulfilled_20',
    name: 'Subscription Cancellation - Unfulfilled (20%)',
    category: 'Subscriptions',
    template: `Hi {{customer.first_name}},

Thanks for reaching out. I understand your request to cancel the subscription, and I've gone ahead and cancelled it for you, so there will be no future charges.

I can see that your current order is still unfulfilled. If you'd like to keep it, I can offer a 20% partial refund as a courtesy. If you'd prefer not to proceed with this order, just let me know and I'll review the available options with you.

Please tell me how you'd like to move forward, and I'll take care of the rest for you.

Best regards,
{{agent.first_name}}`
  },
  {
    id: 'sub_cancel_already_shipped',
    name: 'Subscription Cancellation - Already Shipped',
    category: 'Subscriptions',
    template: `Hi {{customer.first_name}},

Thanks for reaching out. I understand your request to cancel the subscription, and I've gone ahead and cancelled it for you already, so there will be no future charges.

I've checked your account and can confirm that the current order has already shipped, so it can't be cancelled at this stage. That said, you won't be billed again going forward.

If you have any questions about the order that's on the way or need help with anything else, just let me know—I'm happy to help.

Best regards,
{{agent.first_name}}`
  },
  {
    id: 'sub_cancel_no_new_order_offer',
    name: 'Subscription Cancellation - No New Order (10% Offer)',
    category: 'Subscriptions',
    template: `Hi {{customer.first_name}},

Thank you for reaching out! To give you more flexibility, I'd like to offer you a 10% discount on your next billing cycle so you can continue enjoying the benefits at a reduced cost.

Alternatively, I can pause your subscription for 6 months and resume it whenever you're ready.

Please let me know which option works best for you, and I'll take care of it right away.

All the best,
{{agent.first_name}}
Customer Care Specialist`
  },
  {
    id: 'sub_cancelled_confirm',
    name: 'Subscription Cancelled - Confirmation',
    category: 'Subscriptions',
    template: `Hi {{customer.first_name}},

This is to confirm that your subscription has been successfully cancelled. No future charges will be applied.

If you have any questions or would like to start a subscription again in the future, please don't hesitate to reach out.

All the best,
{{agent.first_name}}
Customer Care Specialist`
  },
  {
    id: 'sub_paused_confirm',
    name: 'Subscription Paused - Confirmation',
    category: 'Subscriptions',
    template: `Hi {{customer.first_name}},

Thank you for your continued support. I've paused your subscription as requested. It is currently set to resume automatically on {{resume_date}}.

As we get closer to that date, you'll receive a reminder email before any billing is processed. You're always welcome to adjust the resume date—just let us know, and we'll update it for you immediately.

All the best,
{{agent.first_name}}
Customer Care Specialist`
  },
  {
    id: 'sub_order_cancel_unfulfilled',
    name: 'Subscription & Order Cancellation - Unfulfilled',
    category: 'Subscriptions',
    template: `Hi {{customer.first_name}},

Thank you for your message. After reviewing your order details, your original purchase was placed under a subscription plan rather than a one-time order.

I've now taken care of your subscription—it has been cancelled, so no future charges will be applied.

To accommodate you, we can offer a 30% refund if you'd like to keep the current order. Please let me know which option works best, and I'll take care of it right away.

All the best,
{{agent.first_name}}
Customer Care Specialist`
  },
  {
    id: 'sub_order_cancel_shipped',
    name: 'Subscription & Order Cancellation - Already Shipped',
    category: 'Subscriptions',
    template: `Hi {{customer.first_name}},

Thank you for your message. After reviewing your order details, your original purchase was placed under a subscription plan rather than a one-time order.

I've now taken care of your subscription—it has been cancelled, so no future charges will be applied.

Regarding your recent order, it has already been shipped, so we are unable to cancel it at this stage. The tracking details were sent to you in a separate email—please let us know if you need us to resend that information.

All the best,
{{agent.first_name}}
Customer Care Specialist`
  },
  {
    id: 'wismo_shipped_on_time',
    name: 'WISMO - Shipped on Time',
    category: 'WISMO',
    template: `Hi {{customer.first_name}},

Thank you for reaching out! I'm happy to let you know that your order was shipped on time and is on its way.

You can track it using the link below:
{{tracking_link}}

It should arrive within the estimated delivery timeframe of [e.g., December 10-18, 2025]. We're doing our best to get it to you as early as possible, so it may arrive sooner than the estimated range.

Let me know if you have any questions in the meantime—I'm happy to help!

Best regards,
{{agent.first_name}}
Customer Care Specialist`
  },
  {
    id: 'wismo_delayed_shipment',
    name: 'WISMO - Delayed Shipment',
    category: 'WISMO',
    template: `Hi {{customer.first_name}},

Thank you so much for your patience! I checked your order, and it's now on its way! The shipment was sent a bit later than usual due to high demand.

You can track it using the link below:
{{tracking_link}}

It should arrive within the estimated delivery timeframe of [e.g., December 10–18, 2025]. We're doing our best to get it to you as early as possible.

Let me know if you have any questions in the meantime—I'm happy to help!

Best regards,
{{agent.first_name}}
Customer Care Specialist`
  },
  {
    id: 'wismo_delay_unfulfilled_upset',
    name: 'WISMO - Delay Unfulfilled (Upset Customer)',
    category: 'WISMO',
    template: `Hi {{customer.first_name}},

Thanks for reaching out. I've checked, and while your shipment has unfortunately been delayed past the normal processing window, it is prepared and is now simply waiting to be scanned and picked up by the courier — once that happens, you'll receive a confirmation email with tracking details.

We appreciate your patience, and to make up for the delay, we can offer a 5% partial refund. We've also followed up with our logistics team to ensure your order moves out within the next few days.

Please let me know if you'd like us to process the partial refund or if you have any other questions.

Best regards,
{{agent.first_name}}
Customer Care Specialist`
  },
  {
    id: 'wismo_delay_unfulfilled_normal',
    name: 'WISMO - Delay Unfulfilled (Normal Inquiry)',
    category: 'WISMO',
    template: `Hi {{customer.first_name}},

Thanks for reaching out. I've checked your order and can see that it's prepared and ready for pickup, but the shipment has been delayed slightly past the usual processing window. Once the courier scans and collects it, you'll receive a confirmation email with the tracking details.

I understand the wait can be frustrating, and we appreciate your patience. We've already followed up with our logistics team to make sure your order moves out within the next few days.

If you have any questions in the meantime, feel free to let us know.

Best regards,
{{agent.first_name}}
Customer Care Specialist`
  },
  {
    id: 'wismo_processing',
    name: 'WISMO - Processing',
    category: 'WISMO',
    template: `Hi {{customer.first_name}},

Thank you for your message.

Your order is currently being processed before shipping. It's really important to us that each item is packaged with care so that it arrives in perfect condition.

As soon as your order has been shipped, you'll receive a confirmation email with your tracking details.

Have a great day.

Best regards,
{{agent.first_name}}
Customer Care Specialist`
  },
  {
    id: 'wismo_delayed_restocked',
    name: 'WISMO - Delayed Processing, Just Restocked',
    category: 'WISMO',
    template: `Hi {{customer.first_name}},

Thank you for your message.

I've checked your order and confirmed there was a brief logistics issue that delayed processing. This has now been resolved, and your order is scheduled to ship within the next few days.

Once it ships, you'll receive an email with the tracking details.

Best regards,
{{agent.first_name}}
Customer Care Specialist`
  },
  {
    id: 'wismo_no_movement',
    name: 'WISMO - No Movement in Tracking (>5 days)',
    category: 'WISMO',
    template: `Hi {{customer.first_name}},

Thank you for your message. I've checked your order, it's already shipped but it appears there hasn't been any movement in tracking for a few days—this sometimes happens when packages are in transit and waiting at a sorting facility.

I've escalated this with the courier to ensure it continues moving. If there's still no update within the next 48 hours, please let us know so we can take the next steps and, if needed, arrange a free reshipment for you.

We appreciate your patience as we work to get your order to you.

Best regards,
{{agent.first_name}}
Customer Care Specialist`
  },
  {
    id: 'wismo_return_to_sender',
    name: 'WISMO - Return to Sender',
    category: 'WISMO',
    template: `Hi {{customer.first_name}},

Thank you for reaching out. I've checked your order and see that it was returned to us—this often happens due to an address issue during shipping.

We'd be happy to reship your order free of charge. Could you please confirm if we should send it to the same address we have on file, or provide an alternative address? Once confirmed, we'll get it out to you right away.

We appreciate your understanding and are here to make sure your order reaches you smoothly.

Best regards,
{{agent.first_name}}
Customer Care Specialist`
  },
  {
    id: 'wismo_partially_fulfilled',
    name: 'WISMO - Partially Fulfilled',
    category: 'WISMO',
    template: `Hi {{customer.first_name}},

Thank you for contacting us. I've checked your order, and due to high demand, some item/s was/were shipped immediately while other/s is/are still being prepared.

The available item/s have already been sent, and you can track them here:
{{tracking_link}}

We'll ship the remaining items as soon as they're ready and will provide tracking details when they're on the way. We appreciate your patience and will ship the remaining items as soon as possible.

Best regards,
{{agent.first_name}}
Customer Care Specialist`
  },
  {
    id: 'wismo_shipped_separately',
    name: 'WISMO - Shipped Separately',
    category: 'WISMO',
    template: `Hi {{customer.first_name}},

Thank you for reaching out! I've checked your order, and I wanted to let you know that your items have been shipped in separate packages to ensure you receive what's available as quickly as possible, due to high demand.

Here are the tracking details for each shipment:
{{tracking_link_1}}
{{tracking_link_2}}

The packages may arrive at slightly different times, but rest assured everything is on its way.

Let me know if you have any questions in the meantime—I'm happy to help!

All the best,
{{agent.first_name}}
Customer Care Specialist`
  },
  {
    id: 'escalation_email',
    name: 'Escalation - Email',
    category: 'Escalation',
    template: `Hi {{customer.first_name}},

Thanks for reaching out. I've reviewed your message and, to ensure this is handled appropriately, I'm reassigning your case to our escalation team for further review. They'll follow up with you as soon as possible.

All the best,
{{agent.first_name}}
Customer Care Specialist`
  },
  {
    id: 'escalation_chat',
    name: 'Escalation - Chat',
    category: 'Escalation',
    template: `Thanks for the details, {{customer.first_name}}. I'm passing this to our escalation team for further review, and they'll take it from here.`
  }
];

const CATEGORIES = ['All', ...new Set(MACRO_LIBRARY.map(m => m.category))];

export default function MacroRefiner() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMacro, setSelectedMacro] = useState(null);
  const [customMacro, setCustomMacro] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketContent, setTicketContent] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [refinedResponse, setRefinedResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [agentName, setAgentName] = useState('');

  const filteredMacros = MACRO_LIBRARY.filter(m => {
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    const matchesSearch = searchQuery === '' || m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.template.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const currentMacro = useCustom ? customMacro : (selectedMacro?.template || '');

  const handleRefine = async () => {
    if (!currentMacro.trim()) return;
    setIsLoading(true);
    setRefinedResponse('');

    const systemPrompt = `You are a customer support response refiner. Your job is to take a macro template and personalize it based on ticket details while maintaining a specific tone.

TONE GUIDELINES:
- Straightforward and clear - get to the point
- Professional but human - not robotic or overly formal
- Warm without being saccharine
- Concise - respect the customer's time
- Empathetic when appropriate, but not performative

RULES:
1. The ticket content provided is a copy-paste from Gorgias which includes all customer information, order details, email history, etc.
2. Extract the customer's name, order number, product details, and any other relevant information from the ticket content
3. Replace all placeholder brackets like {{customer.first_name}}, {{agent.first_name}}, {{tracking_link}}, etc. with appropriate content based on the extracted details
4. Replace bracketed placeholders like [INSERT...] with appropriate content
5. Adjust the message to address the specific situation described in the ticket
6. Keep the core structure and intent of the macro
7. Remove any placeholders that don't have corresponding information - adapt the sentence naturally
8. If the customer's tone suggests frustration, acknowledge it genuinely without over-apologizing
9. Match the length to the complexity of the issue - simple issues get shorter responses
10. Never include placeholder brackets in your output
11. If agent name is provided, use it; otherwise remove the signature line or use a generic sign-off
12. If tracking link is not provided in the ticket, remove that section or mention tracking will be sent separately
13. IMPORTANT: Pay close attention to the AGENT'S ADDITIONAL NOTES - these contain specific instructions, context, or customizations the agent wants included in the response. Incorporate these notes naturally into the refined response.

Output ONLY the refined response, nothing else.`;

    const userPrompt = `MACRO TEMPLATE:
${currentMacro}

AGENT NAME: ${agentName || 'Not provided'}

AGENT'S ADDITIONAL NOTES (incorporate these into the response):
${additionalNotes || 'None provided'}

GORGIAS TICKET CONTENT (contains customer info, order details, email history):
${ticketContent || 'No ticket content provided'}

Please extract the relevant information from the ticket content, incorporate the agent's additional notes, and refine this macro into a personalized, ready-to-send response.`;

    try {
      const response = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: `${systemPrompt}\n\n---\n\n${userPrompt}` }],
        }),
      });
      const data = await response.json();
      if (data.error) {
        setRefinedResponse(`Error: ${data.error.message || data.error}`);
      } else {
        const text = data.content?.map(item => item.text || '').join('\n') || '';
        setRefinedResponse(text);
      }
    } catch (error) {
      setRefinedResponse('Error refining macro. Please try again.');
      console.error('API Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(refinedResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0b', color: '#e4e4e7', fontFamily: "'IBM Plex Sans', -apple-system, sans-serif", padding: '32px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::selection { background: #3b82f6; color: white; }
        input, textarea { font-family: inherit; }
        textarea::-webkit-scrollbar, div::-webkit-scrollbar { width: 6px; }
        textarea::-webkit-scrollbar-track, div::-webkit-scrollbar-track { background: #18181b; }
        textarea::-webkit-scrollbar-thumb, div::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 3px; }
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '10px', height: '10px', backgroundColor: '#22c55e', borderRadius: '50%', boxShadow: '0 0 12px #22c55e' }} />
            <h1 style={{ fontSize: '28px', fontWeight: '600', margin: 0, letterSpacing: '-0.5px' }}>Macro Refiner</h1>
          </div>
          <p style={{ color: '#71717a', margin: 0, fontSize: '14px' }}>Select a macro, paste Gorgias ticket (Ctrl+A), get a personalized response</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 1fr', gap: '24px' }}>
          <div style={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a', overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #27272a' }}>
              <h2 style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#a1a1aa' }}>Macro Library</h2>
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search macros..." style={{ width: '100%', padding: '8px 10px', marginBottom: '12px', backgroundColor: '#0a0a0b', border: '1px solid #3f3f46', borderRadius: '6px', color: '#e4e4e7', fontSize: '13px', outline: 'none' }} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} style={{ padding: '4px 10px', fontSize: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer', backgroundColor: selectedCategory === cat ? '#3b82f6' : '#27272a', color: selectedCategory === cat ? 'white' : '#a1a1aa', transition: 'all 0.15s ease' }}>{cat}</button>
                ))}
              </div>
            </div>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {filteredMacros.map(macro => (
                <div key={macro.id} onClick={() => { setSelectedMacro(macro); setUseCustom(false); }} style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #27272a', backgroundColor: selectedMacro?.id === macro.id && !useCustom ? '#27272a' : 'transparent', transition: 'background 0.15s ease' }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '2px' }}>{macro.name}</div>
                  <div style={{ fontSize: '11px', color: '#71717a' }}>{macro.category}</div>
                </div>
              ))}
              {filteredMacros.length === 0 && <div style={{ padding: '20px 16px', color: '#52525b', fontSize: '13px', textAlign: 'center' }}>No macros found</div>}
            </div>
            <div style={{ padding: '16px', borderTop: '1px solid #27272a' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                <input type="checkbox" checked={useCustom} onChange={e => setUseCustom(e.target.checked)} style={{ accentColor: '#3b82f6' }} />
                Use custom macro
              </label>
              {useCustom && <textarea value={customMacro} onChange={e => setCustomMacro(e.target.value)} placeholder="Paste your custom macro here..." style={{ width: '100%', height: '120px', marginTop: '12px', padding: '10px', backgroundColor: '#0a0a0b', border: '1px solid #3f3f46', borderRadius: '8px', color: '#e4e4e7', fontSize: '12px', fontFamily: "'IBM Plex Mono', monospace", resize: 'vertical', outline: 'none' }} />}
            </div>
            <div style={{ padding: '0 16px 16px' }}>
              <label style={{ fontSize: '12px', color: '#71717a', display: 'block', marginBottom: '6px' }}>Your Name (for sign-off)</label>
              <input type="text" value={agentName} onChange={e => setAgentName(e.target.value)} placeholder="e.g., Sarah" style={{ width: '100%', padding: '8px 10px', backgroundColor: '#0a0a0b', border: '1px solid #3f3f46', borderRadius: '6px', color: '#e4e4e7', fontSize: '13px', outline: 'none' }} />
            </div>
          </div>
          <div style={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a', padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#a1a1aa' }}>Gorgias Ticket</h2>
            <p style={{ color: '#71717a', margin: '0 0 12px 0', fontSize: '13px' }}>Go to Gorgias ticket → Press <strong style={{ color: '#e4e4e7' }}>Ctrl+A</strong> → Paste here</p>
            <textarea 
              value={ticketContent} 
              onChange={e => setTicketContent(e.target.value)} 
              placeholder="Paste the entire Gorgias ticket content here (Ctrl+A to select all, then Ctrl+V to paste)..." 
              style={{ width: '100%', flex: 1, minHeight: '200px', padding: '12px', backgroundColor: '#0a0a0b', border: '1px solid #3f3f46', borderRadius: '8px', color: '#e4e4e7', fontSize: '14px', lineHeight: '1.5', resize: 'none', outline: 'none' }} 
            />
            <div style={{ marginTop: '16px' }}>
              <label style={{ fontSize: '12px', color: '#71717a', display: 'block', marginBottom: '6px' }}>Additional Notes <span style={{ color: '#a1a1aa' }}>(optional)</span></label>
              <textarea 
                value={additionalNotes} 
                onChange={e => setAdditionalNotes(e.target.value)} 
                placeholder="Add any extra info: specific offers, tracking links, special instructions, or context to include in the response..." 
                style={{ width: '100%', height: '100px', padding: '12px', backgroundColor: '#0a0a0b', border: '1px solid #3f3f46', borderRadius: '8px', color: '#e4e4e7', fontSize: '14px', lineHeight: '1.5', resize: 'vertical', outline: 'none' }} 
              />
            </div>
            <button onClick={handleRefine} disabled={isLoading || !currentMacro.trim()} style={{ marginTop: '16px', padding: '14px 24px', backgroundColor: isLoading ? '#1e40af' : '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: isLoading || !currentMacro.trim() ? 'not-allowed' : 'pointer', opacity: !currentMacro.trim() ? 0.5 : 1, transition: 'all 0.15s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {isLoading ? (<><span style={{ animation: 'pulse 1s infinite' }}>●</span>Refining...</>) : ('Refine Macro →')}
            </button>
          </div>
          <div style={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a', padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '13px', fontWeight: '600', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#a1a1aa' }}>Ready to Send</h2>
              {refinedResponse && <button onClick={copyToClipboard} style={{ padding: '6px 12px', backgroundColor: copied ? '#22c55e' : '#27272a', color: copied ? 'white' : '#a1a1aa', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.15s ease' }}>{copied ? '✓ Copied!' : 'Copy'}</button>}
            </div>
            <div style={{ flex: 1, backgroundColor: '#0a0a0b', borderRadius: '8px', border: '1px solid #27272a', padding: '16px', minHeight: '300px', overflow: 'auto' }}>
              {isLoading ? (<div style={{ color: '#71717a', fontSize: '14px' }}><span style={{ animation: 'pulse 1s infinite' }}>Generating personalized response...</span></div>) : refinedResponse ? (<div style={{ fontSize: '14px', lineHeight: '1.7', whiteSpace: 'pre-wrap', animation: 'slideIn 0.3s ease' }}>{refinedResponse}</div>) : (<div style={{ color: '#52525b', fontSize: '14px', fontStyle: 'italic' }}>Select a macro and paste Gorgias ticket content, then click "Refine Macro" to generate a personalized response.</div>)}
            </div>
            {currentMacro && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '11px', color: '#52525b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Template</div>
                <div style={{ backgroundColor: '#0a0a0b', borderRadius: '6px', border: '1px solid #27272a', padding: '12px', fontSize: '11px', fontFamily: "'IBM Plex Mono', monospace", color: '#71717a', maxHeight: '100px', overflow: 'auto', whiteSpace: 'pre-wrap' }}>{currentMacro}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
