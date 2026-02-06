import React, { useState, useEffect } from 'react';
import Head from 'next/head';

const PRODUCT_KNOWLEDGE = `
=== OSMO PRODUCT KNOWLEDGE BASE (12 Products) ===

## 1. OSMO DASHCAM PRO (DCM003)
Specs: 4K front + 1080P rear, 3.2" IPS screen, Loop recording, Collision sensor, Wi-Fi (Verdure app), Parking monitor
App: Verdure, Wi-Fi: "OSMO-XXXX", Password: "12345678"
Troubleshooting: Turns off when unplugged = NORMAL (small battery by design); Red dot blinking = recording active; Can't find Wi-Fi = toggle dashcam Wi-Fi, refresh phone

## 2. OSMO ROBOT WINDOW CLEANER
Features: AI auto clean, 3 modes, UPS battery (~20 min backup), Microfiber pads, Water spray
LED: Blue=Normal, Green=Charged, Orange=Charging, Red=Error
Important: Must connect to power during use. Always use safety rope.
Troubleshooting: Alarm at startup = dirty pad/stickers/slippery glass; Slips = press STOP, use LEFT/RIGHT; Red LED + warning = pull back with rope, check power

## 3. OSMO WILDPRO TRAIL CAMERA
Features: 2.0" LCD, PIR motion, Photo 2M-60M, Video up to 8K, Night vision, App: TrailCam Go
Power: 8 x AA batteries OR DC 6V cable
SD Card: NOT included with single orders (only 2+ units)
Troubleshooting: Can't connect home Wi-Fi = NOT a Wi-Fi camera (phone app only); Not found on app = within 45ft, camera ON, Bluetooth+Wi-Fi enabled

## 4. OSMO AIR FRYER
Controls: Touch panel, Presets, Manual mode, Keep warm
Usage: NO oil in basket, don't overfill, shake food during cooking
Troubleshooting: White smoke = normal for greasy food; Black smoke = unplug immediately

## 5. OSMO VACUUM CLEANER (Cordless)
Controls: Long press 3s=ON/OFF, Short=Switch modes
Charging: Can't work while charging, 5-40°C
Troubleshooting: Weak suction = empty dust cup, clean filter; Green light dim = wipe lamp

## 6. OSMO FLIXPRO PROJECTOR
Setup: Power → Press button → Focus wheel → Select input
Miracast: Same Wi-Fi → Phone Cast → Select "Osmo FlixPro"
AirPlay: Same Wi-Fi → Screen Mirroring → Select "Osmo FlixPro"

## 7. OSMO 4G PET GPS TRACKER (C09A)
App: 365GPS, Login: IMEI, Password: Last 6 digits
SIM: 4G Nano SIM, disable PIN first
LED: Yellow slow=online, Yellow fast=offline (set APN), Yellow solid=invalid SIM

## 8. OSMO EPILATOR
Technique: 90° angle, skin taut, against hair growth, move slowly
Charging: Off → USB → Red LED → Full when done

## 9. OSMO ROBOT VACUUM
Surfaces: Hardwood, Tiles OK | Carpet >12mm NOT OK
Controls: Hold AUTO 3s=On, AUTO=Clean, FIXED=Spot, HOME=Charge
Troubleshooting: Not charging = clean contacts; Won't climb carpet = max 12mm

## 10. OSMO SOUNDBAR S20
Bluetooth: Power on → Blue flashing → Select "SOUNDBAR-S20" → Solid blue
HDMI ARC: Connect ARC port → HDMI mode → TV audio to ARC

## 11. OSMO VIDEOBELL PRO
App: iCam365 → Register → "+" → Scan QR → Wi-Fi
Charging: 5V 1-2A, ~12 hours, no >10W chargers
Reset: Remove cover → Hold reset 8s → Re-add in app

## 12. OSMO ELECTRIC LEAF BLOWER
Safety: Gloves, eye protection, no wet conditions
Storage: Off, unplugged, dry place
`;

const MACRO_LIBRARY = [
  // === PRODUCT ISSUES (8 macros) ===
  { id: 'product_vacuum_missing_attachments', name: 'Vacuum - Missing Attachments', category: 'Product Issues', template: "Hi {{customer.first_name}},\n\nI completely understand how this could be confusing.\n\nI'd like to clarify that while the photo shows three components, only two of them are vacuum attachments. The third item is the main head unit, which the attachments connect to and is not considered a separate attachment on its own.\n\nThis means your order should include two vacuum attachments plus the main head unit, which matches what's shown in the listing. Nothing is missing from your order.\n\nI hope this clears things up! Please don't hesitate to reach out if you have any further questions.\n\nBest regards,\n{{agent.first_name}}\nCustomer Care Specialist" },
  { id: 'product_window_cleaner_water_tank', name: 'Window Cleaner - Water Tank', category: 'Product Issues', template: "Hi {{customer.first_name}},\n\nThank you for reaching out. I completely understand why this might be confusing, and I'm happy to clarify.\n\nThe window cleaner you received is one of our earlier models and does not include a built-in water tank. With this version, the cleaning solution is applied directly to the cleaning pads before use, which still allows the robot to move smoothly and clean effectively.\n\nIf you're happy to keep this model, we can offer a 20% partial refund so you can keep the window cleaner at a reduced cost.\n\nAlternatively, we do have a newer model with a built-in water tank, which may be a better fit for your needs, and I'd be more than happy to process a replacement for you right away.\n\nJust let me know which option works best for you.\n\nBest regards,\n{{agent.first_name}}\nCustomer Care Specialist" },
  { id: 'product_trail_camera_1_camera', name: 'Trail Camera - SD Card', category: 'Product Issues', template: "Hi {{customer.first_name}},\n\nI've checked your order and can confirm that it includes 1 WILDPRO trail camera. Please note that SD cards are only included with orders of 2 or more WILDPRO units, so an SD card is not included with this purchase.\n\nThat said, we're happy to offer you a 15% partial refund so you can purchase an SD card locally at your convenience.\n\nPlease let us know if this works for you and we will process it right away.\n\nBest regards,\n{{agent.first_name}}\nCustomer Care Specialist" },
  { id: 'product_dashcam_suction_cup', name: 'Dashcam - Suction Cup', category: 'Product Issues', template: "Hi {{customer.first_name}},\n\nThanks for reaching out!\n\nOur team is also updating the listing to make this clearer for everyone.\n\nIf you have any questions or need a hand with setup, feel free to let us know and we're happy to help!\n\nBest regards,\n{{agent.first_name}}\nCustomer Care Specialist" },
  { id: 'product_mivo_brand_inquiry', name: 'MIVO Brand Inquiry', category: 'Product Issues', template: "Hi {{customer.first_name}},\n\nThank you for your message. I completely understand your frustration and can see why receiving a dashcam with the Osmo branding instead of the Mivo Dashcam Pro would be surprising.\n\nWe recently rebranded from Osmo to Mivo, and while the packaging shows the old brand, the dashcam inside is the latest model with all the features of the Mivo Dashcam Pro, including 4K recording, collision detection, Night Vision, and a dedicated app.\n\nTo make this right, we'd like to offer you 20% off your purchase. We hope this helps restore your confidence in our product and brand.\n\nPlease let us know how you would like to proceed.\n\nBest regards,\n{{agent.first_name}}\nCustomer Care Specialist" },
  { id: 'product_robot_vacuum_carpets', name: "Robot Vacuum - Carpets", category: 'Product Issues', template: "Hi {{customer.first_name}},\n\nThank you for explaining the issue.\n\nOur robot vacuum is designed to work best on hard floors such as tiles, wood, and laminate. It can operate on low-pile carpets, but it may struggle on thick or high-pile carpets (over 12mm), as the longer fibers can create resistance and affect movement and suction. This is a known limitation rather than a defect.\n\nIf your carpet is low-pile, you may want to try setting the vacuum to its highest suction mode and checking that the brush and wheels are clear of debris.\n\nIf you're open to keeping it for use on hard floors, we can offer a 30% refund to help resolve this.\n\nPlease let me know how you'd like to proceed.\n\nBest regards,\n{{agent.first_name}}\nCustomer Care Specialist" },
  { id: 'product_dashcam_not_as_described', name: 'Dashcam - Not as Described', category: 'Product Issues', template: "Hi {{customer.first_name}},\n\nThank you for your message and the photos. We understand how upsetting it can be to receive a product that looks different than expected.\n\nWe have reviewed your order and can confirm that the device you received is the Osmo Dashcam Pro. This model is a 4K ultra-high-resolution dashcam with collision detection (automatically locks footage if impact detected) and app support for viewing live footage on your phone.\n\nMany customers found that once they used the dashcam, the video quality exceeded their expectations, especially for night driving.\n\nWe're happy to offer a 15% partial refund if you choose to keep it.\n\nPlease let me know if you'd like to proceed.\n\nBest regards,\n{{agent.first_name}}\nCustomer Care Specialist" },
  { id: 'product_window_robot_missing_pads', name: 'Window Robot - Missing Pads', category: 'Product Issues', template: "Hi {{customer.first_name}},\n\nThank you for the photo. I can see that your RoboClean actually comes with cleaning pads already included - those are the standard pads that work with the device, so nothing is missing there.\n\nRegarding the cleaning liquid, I apologize but that item is currently out of stock. To make this right, I'd like to offer you a 20% partial refund so you can purchase a suitable cleaning agent locally.\n\nWould this work for you? I can process the refund right away once you confirm.\n\nBest regards,\n{{agent.first_name}}\nCustomer Care Specialist" },

  // === RETURNS (24 macros) ===
  { id: 'return_ask_reason', name: 'Ask for Return Reason', category: 'Returns', template: "Hi {{customer.first_name}},\n\nThanks for reaching out. We've received your return request.\n\nTo help us assist you properly, could you please let us know the reason for the return? Once we have that information, we'll review it and advise you on the next steps.\n\nBest regards,\n{{agent.first_name}}" },
  { id: 'return_not_as_described_photo', name: 'Not as Described - Request Photo', category: 'Returns', template: "Hi {{customer.first_name}},\n\nThanks so much for providing the details. I understand that the item didn't match your expectations. Could you please send a clear photo showing what you're referring to, along with a bit more information on why you feel it's not as described? If the product hasn't been opened, a photo of the packaging works perfectly.\n\nOnce we have that, we'll review it right away and get back to you with the next steps.\n\nBest regards,\n{{agent.first_name}}\nCustomer Care Specialist" },
  { id: 'return_not_as_described_pr15_packaging', name: 'Not as Described - PR 15% (Packaging)', category: 'Returns', template: "Hi {{customer.first_name}},\n\nThanks for reaching out—I understand why the packaging difference could be confusing.\n\nThe product itself is the same. What varies is the outer packaging, which can change between production batches or as part of routine packaging updates. This doesn't affect the item, its features, or how it works.\n\nWe can offer a 15% partial refund as a courtesy. Just let us know and we'll process it right away.\n\nBest regards,\n{{agent.first_name}}" },
  { id: 'return_not_as_described_pr15_functionality', name: 'Not as Described - PR 15% (Functionality)', category: 'Returns', template: "Hi {{customer.first_name}},\n\nThanks for reaching out. I understand your concern about the product functionality.\n\nThe product works as described, but I understand it may not fully meet your expectations based on how you planned to use it. To help make this right, we can offer a 15% partial refund if you're happy to keep the item.\n\nLet me know if this works for you and I'll process it right away.\n\nBest regards,\n{{agent.first_name}}" },
  { id: 'return_not_as_described_pr15_missing', name: 'Not as Described - PR 15% (Missing)', category: 'Returns', template: "Hi {{customer.first_name}},\n\nThanks for reaching out. I understand your concern.\n\nThe product includes its core features and is fully functional for its intended use, making it practical and easy to use. As an option, we can offer a 15% partial refund if you're happy to keep the item.\n\nLet me know if that works for you and I'll take care of it right away.\n\nBest regards,\n{{agent.first_name}}" },
  { id: 'return_not_as_described_pr15_different', name: 'Not as Described - PR 15% (Different)', category: 'Returns', template: "Hi {{customer.first_name}},\n\nThanks for reaching out. I understand your concern.\n\nWhile the product may look different from what you expected, it offers the same core features and functionality and can be used as intended. As an option, we can offer a 15% partial refund if you're happy to keep the item.\n\nLet me know if that works for you and I'll take care of it right away.\n\nBest regards,\n{{agent.first_name}}" },
  { id: 'return_not_as_described_troubleshoot', name: 'Not as Described - Troubleshooting', category: 'Returns', template: "Hi {{customer.first_name}},\n\nThank you for sharing the photo. Let's go through a few quick checks together to see if we can resolve the issue without the hassle of a return:\n\n[INSERT TROUBLESHOOTING STEPS]\n\nIf the issue persists, I'll be happy to guide you through your replacement at no additional cost. Looking forward to your update.\n\nBest regards,\n{{agent.first_name}}" },
  { id: 'return_not_as_described_upgrade', name: 'Not as Described - Upgrade Offer', category: 'Returns', template: "Hi {{customer.first_name}},\n\nThank you for your response and for letting us know that the partial refund isn't what you were looking for.\n\nTo make this right, I'd like to offer you a free reshipment of the upgraded version of the product, which includes [INSERT IMPORTANT FEATURES OF THE UPGRADED VERSION]. There's no need to return the current item—you can keep it or gift it if you like.\n\nJust let me know if this solution works for you, and I'll personally arrange everything so your upgraded version is sent out promptly.\n\nLooking forward to your response.\n\nAll the best,\n{{agent.first_name}}" },
  { id: 'return_replacement_address', name: 'Replacement - Confirm Address', category: 'Returns', template: "Hi {{customer.first_name}},\n\nThank you for sending that over.\n\nI've reviewed your case and want to make this right for you.\n\nIn order to sort this for you as quickly as possible, could you please confirm your current shipping address below?\n\nOnce confirmed, I'll arrange for the replacement to be sent out straight away and share the tracking details with you as soon as it's on the way.\n\nI'm looking forward to your response.\n\nBest regards,\n{{agent.first_name}}" },
  { id: 'return_replacement_processed', name: 'Replacement - Processed', category: 'Returns', template: "Hi {{customer.first_name}},\n\nThank you for confirming! I'm excited to let you know that your replacement has been arranged and will be on its way shortly.\n\nI'll share the tracking details with you as soon as the shipment is processed, so you can keep an eye on it every step of the way.\n\nIf you have any questions in the meantime, don't hesitate to reach out.\n\nAll the best,\n{{agent.first_name}}" },
  { id: 'return_change_of_mind_photo', name: 'Change of Mind - Request Photo', category: 'Returns', template: "Hi {{customer.first_name}},\n\nThank you for sharing the reason for your return. Could you please let us know the condition of the item and share a photo of the packaging?\n\nThis will help us process your request quickly.\n\nBest regards,\n{{agent.first_name}}\nCustomer Care Specialist" },
  { id: 'return_change_of_mind_pr15', name: 'Change of Mind - PR 15%', category: 'Returns', template: "Hi {{customer.first_name}},\n\nThanks for reaching out.\n\nI understand that you no longer need the product or have decided not to proceed. If the item is still unused, one option you may want to consider is keeping it, as it remains fully functional and ready to use whenever needed. Some customers also choose to keep it as a spare or pass it along as a gift.\n\nAs an alternative, we can offer a 15% partial refund if you're happy to keep the item. This allows you to receive a refund while still getting value from the product.\n\nLet me know how you'd like to proceed and I'll be happy to assist further.\n\nBest regards,\n{{agent.first_name}}" },
  { id: 'return_damaged_photo', name: 'Damaged - Request Photo', category: 'Returns', template: "Hi {{customer.first_name}},\n\nThanks for letting us know. I'm sorry to hear the item isn't working properly or arrived damaged.\n\nTo help us assess this and move forward, please send a clear photo or a short video showing the issue.\n\nIf the problem isn't something that can be captured on photo or video, just let us know what's happening and when the issue occurs.\n\nOnce we have that, we'll review it and get back to you promptly.\n\nBest regards,\n{{agent.first_name}}\nCustomer Care Specialist" },
  { id: 'return_damaged_replacement', name: 'Damaged - Replacement', category: 'Returns', template: "Hi {{customer.first_name}},\n\nThanks for reaching out and letting us know.\n\nI understand the item arrived damaged or isn't working properly. We'll replace it so you receive a unit that works as it should.\n\nBefore we proceed, could you please confirm that the shipping address below is correct?\n\n{{customer.address}}\n\nOnce confirmed, I'll take care of the next steps and share the replacement details with you.\n\nBest regards,\n{{agent.first_name}}" },
  { id: 'return_damaged_troubleshoot', name: 'Damaged - Troubleshooting', category: 'Returns', template: "Hi {{customer.first_name}},\n\nThanks for reaching out and letting us know.\n\nI understand the product isn't working as expected. I'd like to check if we can quickly troubleshoot the issue, as it's often something we can resolve with a few simple steps.\n\nCould you please describe what's happening with the item, or share any details that might help us better understand the issue? Once we have that information, we'll take it from there.\n\nBest regards,\n{{agent.first_name}}" },
  { id: 'return_subscription_did_not_order', name: 'Subscription - Did Not Order', category: 'Returns', template: "Hi {{customer.first_name}},\n\nThanks for reaching out. I understand why this would be confusing.\n\nI've checked your order and confirmed that it was placed under a subscription plan, and I understand this wasn't something you were aware of at the time of purchase.\n\nFor the charge that already went through, we'd like to make this right. As an option, I can offer a 20% partial refund while you keep the order, and I'll also ensure the subscription is handled correctly going forward so there are no unexpected charges.\n\nLet me know if this works for you and I'll take care of it right away.\n\nBest regards,\n{{agent.first_name}}\nCustomer Care Specialist" },
  { id: 'return_did_not_order_pr15', name: 'Did Not Order - PR 15%', category: 'Returns', template: "Hi {{customer.first_name}},\n\nThanks for reaching out and letting us know. I understand how unexpected it can be to receive an item you don't recall ordering, and I'm glad you contacted us so we can clear this up.\n\nOur records show that the order was placed online and processed under your billing details. To make this easier for you, we can offer a 15% refund if you're happy to keep the item. There's no need to go through the return process.\n\nIf this works for you, just let me know and I'll take care of the refund right away.\n\nBest regards,\n{{agent.first_name}}\nCustomer Care Specialist" },
  { id: 'return_found_cheaper_pr40', name: 'Found Cheaper - PR 40%', category: 'Returns', template: "Hi {{customer.first_name}},\n\nThank you for letting us know.\n\nWhile we're unable to adjust or match pricing after an order is placed, we'd still like to help. As an option, we can offer a 40% partial refund if you're happy to keep the item.\n\nIf this works for you, just let us know and we'll take care of the update right away.\n\nBest regards,\n{{agent.first_name}}\nCustomer Care Specialist" },
  { id: 'return_pr1_30', name: 'Return - PR 1 (30%)', category: 'Returns', template: "Hi {{customer.first_name}},\n\nThanks for letting us know. I understand you'd like to proceed with a return.\n\nBefore we move forward, I wanted to share an alternative in case it's more convenient. We can offer a 30% partial refund if you prefer to keep the item, and it would still be covered under our 2-year warranty.\n\nIf you'd still like to proceed with the return, just let me know and I'll guide you through the next steps.\n\nBest regards,\n{{agent.first_name}}" },
  { id: 'return_pr2_50', name: 'Return - PR 2 (50%)', category: 'Returns', template: "Hi {{customer.first_name}},\n\nThank you for your response. I completely understand your decision.\n\nI have attached a return form for your convenience. If you choose to return the item, please print and fill out the form, place it in the package, and arrange for return shipping to the address listed. Once your package has been shipped, kindly reply to this email with the tracking information so we can monitor it and notify you as soon as it arrives.\n\nAlternatively, I can offer you a 50% partial refund if you'd like to keep the item. If you'd like to take advantage of this offer, simply reply to this email and I will process it immediately.\n\nBest regards,\n{{agent.first_name}}" },
  { id: 'return_non_returnable_ask', name: 'Non-Returnable - Ask Info', category: 'Returns', template: "Hi {{customer.first_name}},\n\nThanks for reaching out and sharing your concern. I understand how important it is to feel confident about your purchase.\n\nAs this item is classified as a hygienic product, we're unable to accept returns once it has been opened, as this helps ensure the safety of all customers. That said, I'd still like to help find the best possible solution for you.\n\nPlease let me know a bit more about the issue you're experiencing, and I'll be happy to assist further.\n\nBest regards,\n{{agent.first_name}}\nCustomer Care Specialist" },
  { id: 'return_non_returnable_defective', name: 'Non-Returnable - Defective', category: 'Returns', template: "Hi {{customer.first_name}},\n\nThank you for letting us know about the issue you're experiencing and I appreciate you bringing this to our attention.\n\nWhile hygienic items are non-returnable, we're absolutely happy to help if the product is defective. To move forward, could you please send us a short video clearly showing the issue? This helps us quickly verify the problem and arrange the best solution for you.\n\nOnce confirmed, we'll be happy to offer a free replacement, sent straight to you at no additional cost.\n\nI look forward to getting this resolved for you as quickly as possible.\n\nBest regards,\n{{agent.first_name}}\nCustomer Care Specialist" },
  { id: 'return_non_returnable_dissatisfied', name: 'Non-Returnable - Dissatisfied', category: 'Returns', template: "Hi {{customer.first_name}},\n\nThank you for sharing your feedback with us. I completely understand that the product may not have met your expectations, and I truly appreciate you taking the time to let us know.\n\nAs this is a hygienic item, we're unable to accept returns. However, I don't want to leave you without options. We can offer you a 15% partial refund as a way to help resolve this.\n\nIf this works for you, just let me know and I'll take care of it right away.\n\nBest regards,\n{{agent.first_name}}\nCustomer Care Specialist" },
  { id: 'return_outside_14_days', name: 'Outside 14-Day Window', category: 'Returns', template: "Hi {{customer.first_name}},\n\nThanks for reaching out. I appreciate you getting in touch about your order.\n\nAfter reviewing the details, I can confirm that the order is outside our 14-day return window, so we're unable to process a standard return at this time. This policy is in place to ensure fair and consistent handling for all customers.\n\nThat said, I'm happy to take a closer look and see how we can help. Please let me know a bit more about your request, and I'll review the available options with you.\n\nBest regards,\n{{agent.first_name}}\nCustomer Care Specialist" },

  // === CANCELLATIONS (5 macros) ===
  { id: 'cancel_pr1_15', name: 'Cancel - PR 1 (15%)', category: 'Cancellations', template: "Hi {{customer.first_name}},\n\nThank you for your message.\n\nI understand you'd like to cancel your order. At this stage, it's already being prepared for processing, so cancellation may no longer be possible.\n\nTo help, we can offer a 15% partial refund should you decide to proceed with the order as is. Let me know if this works for you and I'll take care of it right away.\n\nBest regards,\n{{agent.first_name}}" },
  { id: 'cancel_pr2_30', name: 'Cancel - PR 2 (30%)', category: 'Cancellations', template: "Hi {{customer.first_name}},\n\nThank you for getting back to us. I understand you'd like to proceed with cancelling your order.\n\nBefore I move forward, I wanted to check if there's anything we can do to change your mind. We can offer a 30% partial refund if you're open to keeping the order instead.\n\nIf you'd still prefer to cancel, just let me know and I'll take care of it right away.\n\nBest regards,\n{{agent.first_name}}" },
  { id: 'cancel_already_shipped', name: 'Cancel - Already Shipped', category: 'Cancellations', template: "Hi {{customer.first_name}},\n\nThank you for reaching out. I completely understand that you'd like to cancel your order. I've checked, and it has already been shipped, so we're unfortunately unable to cancel it at this stage.\n\nIf you need any assistance once the order arrives, please let us know and we'll be happy to help.\n\nBest regards,\n{{agent.first_name}}" },
  { id: 'cancel_safety_hazard', name: 'Cancel - Safety Hazard', category: 'Cancellations', template: "Hi {{customer.first_name}},\n\nThanks for reaching out.\n\nWe had to cancel the order due to a safety-related issue identified during our final checks. To avoid any risk, we weren't able to proceed with shipment.\n\nAny charge made for this order has been voided or refunded accordingly. If you have questions, feel free to let me know.\n\nBest regards,\n{{agent.first_name}}" },
  { id: 'upsell_cancel_pr20', name: 'Upsell Cancel - PR 20%', category: 'Cancellations', template: "Hi {{customer.first_name}},\n\nThanks for letting us know. I understand you'd like to cancel the additional item.\n\nIf it helps, one option is to keep the upsell item and we can apply a 20% discount to it. This would allow you to receive it at a reduced price without any further changes needed.\n\nIf you'd still prefer to cancel the upsell, just let me know and I'll take care of it for you.\n\nBest regards,\n{{agent.first_name}}" },

  // === SUBSCRIPTIONS (9 macros) ===
  { id: 'sub_cancel_keep_last', name: 'Sub Cancel - Keep Last', category: 'Subscriptions', template: "Hi {{customer.first_name}},\n\nThanks for reaching out. I understand why this would be confusing.\n\nI've reviewed your order and can confirm that it was placed under a subscription plan, which explains the charge. I understand this wasn't something you were aware of at the time of purchase.\n\nI can take care of the subscription for you going forward so there are no further or unexpected charges. If you have enough stock at the moment, I can pause the subscription or delay the next recurring charge to a later date.\n\nPlease let me know how you'd like to proceed, and I'll handle it right away.\n\nBest regards,\n{{agent.first_name}}\nCustomer Care Specialist" },
  { id: 'sub_cancel_no_new_order', name: 'Sub Cancel - No New Order', category: 'Subscriptions', template: "Hi {{customer.first_name}},\n\nThanks for reaching out.\n\nI understand you're looking to cancel your subscription. Before we proceed, I wanted to let you know that your plan renews automatically, and there are flexible options available if you'd prefer not to cancel entirely. We can pause the subscription or adjust the next billing date to a later time, depending on what works best for you.\n\nLet me know how you'd like to proceed and I'll take care of it.\n\nBest regards,\n{{agent.first_name}}" },
  { id: 'sub_cancel_unfulfilled_20', name: 'Sub Cancel - Unfulfilled (20%)', category: 'Subscriptions', template: "Hi {{customer.first_name}},\n\nThanks for reaching out. I understand your request to cancel the subscription, and I've gone ahead and cancelled it for you, so there will be no future charges.\n\nI can see that your current order is still unfulfilled. If you'd like to keep it, I can offer a 20% partial refund as a courtesy. If you'd prefer not to proceed with this order, just let me know and I'll review the available options with you.\n\nPlease tell me how you'd like to move forward, and I'll take care of the rest for you.\n\nBest regards,\n{{agent.first_name}}" },
  { id: 'sub_cancel_already_shipped', name: 'Sub Cancel - Already Shipped', category: 'Subscriptions', template: "Hi {{customer.first_name}},\n\nThanks for reaching out. I understand your request to cancel the subscription, and I've gone ahead and cancelled it for you already, so there will be no future charges.\n\nI've checked your account and can confirm that the current order has already shipped, so it can't be cancelled at this stage. That said, you won't be billed again going forward.\n\nIf you have any questions about the order that's on the way or need help with anything else, just let me know—I'm happy to help.\n\nBest regards,\n{{agent.first_name}}" },
  { id: 'sub_cancel_no_new_order_offer', name: 'Sub Cancel - 10% Offer', category: 'Subscriptions', template: "Hi {{customer.first_name}},\n\nThank you for reaching out! To give you more flexibility, I'd like to offer you a 10% discount on your next billing cycle so you can continue enjoying the benefits at a reduced cost.\n\nAlternatively, I can pause your subscription for 6 months and resume it whenever you're ready.\n\nPlease let me know which option works best for you, and I'll take care of it right away.\n\nAll the best,\n{{agent.first_name}}\nCustomer Care Specialist" },
  { id: 'sub_cancelled_confirm', name: 'Sub Cancelled - Confirm', category: 'Subscriptions', template: "Hi {{customer.first_name}},\n\nThis is to confirm that your subscription has been successfully cancelled. No future charges will be applied.\n\nIf you have any questions or would like to start a subscription again in the future, please don't hesitate to reach out.\n\nAll the best,\n{{agent.first_name}}\nCustomer Care Specialist" },
  { id: 'sub_paused_confirm', name: 'Sub Paused - Confirm', category: 'Subscriptions', template: "Hi {{customer.first_name}},\n\nThank you for your continued support. I've paused your subscription as requested. It is currently set to resume automatically on {{resume_date}}.\n\nAs we get closer to that date, you'll receive a reminder email before any billing is processed. You're always welcome to adjust the resume date—just let us know, and we'll update it for you immediately.\n\nAll the best,\n{{agent.first_name}}\nCustomer Care Specialist" },
  { id: 'sub_order_cancel_unfulfilled', name: 'Sub & Order Cancel - Unfulfilled', category: 'Subscriptions', template: "Hi {{customer.first_name}},\n\nThank you for your message. After reviewing your order details, your original purchase was placed under a subscription plan rather than a one-time order.\n\nI've now taken care of your subscription—it has been cancelled, so no future charges will be applied.\n\nTo accommodate you, we can offer a 30% refund if you'd like to keep the current order. Please let me know which option works best, and I'll take care of it right away.\n\nAll the best,\n{{agent.first_name}}\nCustomer Care Specialist" },
  { id: 'sub_order_cancel_shipped', name: 'Sub & Order Cancel - Shipped', category: 'Subscriptions', template: "Hi {{customer.first_name}},\n\nThank you for your message. After reviewing your order details, your original purchase was placed under a subscription plan rather than a one-time order.\n\nI've now taken care of your subscription—it has been cancelled, so no future charges will be applied.\n\nRegarding your recent order, it has already been shipped, so we are unable to cancel it at this stage. The tracking details were sent to you in a separate email—please let us know if you need us to resend that information.\n\nAll the best,\n{{agent.first_name}}\nCustomer Care Specialist" },

  // === WISMO (10 macros) ===
  { id: 'wismo_shipped_on_time', name: 'WISMO - Shipped on Time', category: 'WISMO', template: "Hi {{customer.first_name}},\n\nThank you for reaching out! I'm happy to let you know that your order was shipped on time and is on its way.\n\nYou can track it using the link below:\n{{tracking_link}}\n\nIt should arrive within the estimated delivery timeframe. We're doing our best to get it to you as early as possible.\n\nLet me know if you have any questions—I'm happy to help!\n\nBest regards,\n{{agent.first_name}}\nCustomer Care Specialist" },
  { id: 'wismo_delayed_shipment', name: 'WISMO - Delayed Shipment', category: 'WISMO', template: "Hi {{customer.first_name}},\n\nThank you so much for your patience! I checked your order, and it's now on its way! The shipment was sent a bit later than usual due to high demand.\n\nYou can track it using the link below:\n{{tracking_link}}\n\nWe're doing our best to get it to you as early as possible.\n\nLet me know if you have any questions—I'm happy to help!\n\nBest regards,\n{{agent.first_name}}\nCustomer Care Specialist" },
  { id: 'wismo_delay_unfulfilled_upset', name: 'WISMO - Delay (Upset)', category: 'WISMO', template: "Hi {{customer.first_name}},\n\nThanks for reaching out. I've checked, and while your shipment has unfortunately been delayed past the normal processing window, it is prepared and is now simply waiting to be scanned and picked up by the courier — once that happens, you'll receive a confirmation email with tracking details.\n\nWe appreciate your patience, and to make up for the delay, we can offer a 5% partial refund. We've also followed up with our logistics team to ensure your order moves out within the next few days.\n\nPlease let me know if you'd like us to process the partial refund or if you have any other questions.\n\nBest regards,\n{{agent.first_name}}\nCustomer Care Specialist" },
  { id: 'wismo_delay_unfulfilled_normal', name: 'WISMO - Delay (Normal)', category: 'WISMO', template: "Hi {{customer.first_name}},\n\nThanks for reaching out. I've checked your order and can see that it's prepared and ready for pickup, but the shipment has been delayed slightly past the usual processing window. Once the courier scans and collects it, you'll receive a confirmation email with the tracking details.\n\nI understand the wait can be frustrating, and we appreciate your patience. We've already followed up with our logistics team to make sure your order moves out within the next few days.\n\nIf you have any questions in the meantime, feel free to let us know.\n\nBest regards,\n{{agent.first_name}}\nCustomer Care Specialist" },
  { id: 'wismo_processing', name: 'WISMO - Processing', category: 'WISMO', template: "Hi {{customer.first_name}},\n\nThank you for your message.\n\nYour order is currently being processed before shipping. It's really important to us that each item is packaged with care so that it arrives in perfect condition.\n\nAs soon as your order has been shipped, you'll receive a confirmation email with your tracking details.\n\nHave a great day.\n\nBest regards,\n{{agent.first_name}}\nCustomer Care Specialist" },
  { id: 'wismo_delayed_restocked', name: 'WISMO - Just Restocked', category: 'WISMO', template: "Hi {{customer.first_name}},\n\nThank you for your message.\n\nI've checked your order and confirmed there was a brief logistics issue that delayed processing. This has now been resolved, and your order is scheduled to ship within the next few days.\n\nOnce it ships, you'll receive an email with the tracking details.\n\nBest regards,\n{{agent.first_name}}\nCustomer Care Specialist" },
  { id: 'wismo_no_movement', name: 'WISMO - No Movement', category: 'WISMO', template: "Hi {{customer.first_name}},\n\nThank you for your message. I've checked your order, it's already shipped but it appears there hasn't been any movement in tracking for a few days—this sometimes happens when packages are in transit and waiting at a sorting facility.\n\nI've escalated this with the courier to ensure it continues moving. If there's still no update within the next 48 hours, please let us know so we can take the next steps and, if needed, arrange a free reshipment for you.\n\nWe appreciate your patience as we work to get your order to you.\n\nBest regards,\n{{agent.first_name}}\nCustomer Care Specialist" },
  { id: 'wismo_return_to_sender', name: 'WISMO - Return to Sender', category: 'WISMO', template: "Hi {{customer.first_name}},\n\nThank you for reaching out. I've checked your order and see that it was returned to us—this often happens due to an address issue during shipping.\n\nWe'd be happy to reship your order free of charge. Could you please confirm if we should send it to the same address we have on file, or provide an alternative address? Once confirmed, we'll get it out to you right away.\n\nWe appreciate your understanding and are here to make sure your order reaches you smoothly.\n\nBest regards,\n{{agent.first_name}}\nCustomer Care Specialist" },
  { id: 'wismo_partially_fulfilled', name: 'WISMO - Partial Fulfillment', category: 'WISMO', template: "Hi {{customer.first_name}},\n\nThank you for contacting us. I've checked your order, and due to high demand, some item/s was/were shipped immediately while other/s is/are still being prepared.\n\nThe available item/s have already been sent, and you can track them here:\n{{tracking_link}}\n\nWe'll ship the remaining items as soon as they're ready and will provide tracking details when they're on the way. We appreciate your patience.\n\nBest regards,\n{{agent.first_name}}\nCustomer Care Specialist" },
  { id: 'wismo_shipped_separately', name: 'WISMO - Shipped Separately', category: 'WISMO', template: "Hi {{customer.first_name}},\n\nThank you for reaching out! I've checked your order, and I wanted to let you know that your items have been shipped in separate packages to ensure you receive what's available as quickly as possible.\n\nHere are the tracking details for each shipment:\n{{tracking_link_1}}\n{{tracking_link_2}}\n\nThe packages may arrive at slightly different times, but rest assured everything is on its way.\n\nLet me know if you have any questions—I'm happy to help!\n\nAll the best,\n{{agent.first_name}}\nCustomer Care Specialist" },

  // === ESCALATION (2 macros) ===
  { id: 'escalation_email', name: 'Escalation - Email', category: 'Escalation', template: "Hi {{customer.first_name}},\n\nThanks for reaching out. I've reviewed your message and, to ensure this is handled appropriately, I'm reassigning your case to our escalation team for further review. They'll follow up with you as soon as possible.\n\nAll the best,\n{{agent.first_name}}\nCustomer Care Specialist" },
  { id: 'escalation_chat', name: 'Escalation - Chat', category: 'Escalation', template: "Thanks for the details, {{customer.first_name}}. I'm passing this to our escalation team for further review, and they'll take it from here." }
];

const CATEGORIES = ['All', 'Product Issues', 'Returns', 'Cancellations', 'Subscriptions', 'WISMO', 'Escalation'];

export default function GorgiasSidebar() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMacro, setSelectedMacro] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketData, setTicketData] = useState(null);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [refinedResponse, setRefinedResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [activeTab, setActiveTab] = useState('macros'); // 'macros' or 'result'

  // Listen for messages from Gorgias
  useEffect(() => {
    const handleMessage = (event) => {
      // Handle Gorgias widget messages
      if (event.data && event.data.type === 'gorgias-ticket-data') {
        setTicketData(event.data.ticket);
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Request ticket data from Gorgias
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'gorgias-widget-ready' }, '*');
    }

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const filteredMacros = MACRO_LIBRARY.filter(m => {
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    const matchesSearch = searchQuery === '' || m.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleRefine = async () => {
    if (!selectedMacro) return;
    setIsLoading(true);
    setRefinedResponse('');
    setActiveTab('result');

    const ticketContent = ticketData ? JSON.stringify(ticketData, null, 2) : '';

    const systemPrompt = `You are a customer support response refiner for OSMO products. Your job is to take a macro template and personalize it based on ticket details.

${PRODUCT_KNOWLEDGE}

TONE: Straightforward, professional but human, warm, concise, empathetic when appropriate.

RULES:
1. Extract customer name, order number, product details from ticket content
2. Replace all {{placeholders}} and [INSERT...] with appropriate content
3. Keep the core structure and intent of the macro
4. If agent name is provided, use it; otherwise use generic sign-off
5. When the ticket involves a PRODUCT ISSUE, use the PRODUCT KNOWLEDGE BASE to provide accurate troubleshooting
6. Pay attention to AGENT'S ADDITIONAL NOTES and incorporate them naturally
7. Output ONLY the refined response, nothing else.`;

    const userPrompt = `MACRO TEMPLATE:\n${selectedMacro.template}\n\nAGENT NAME: ${agentName || 'Not provided'}\n\nAGENT'S ADDITIONAL NOTES:\n${additionalNotes || 'None'}\n\nGORGIAS TICKET CONTENT:\n${ticketContent || 'No ticket content provided'}`;

    try {
      const response = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
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
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(refinedResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const insertIntoGorgias = () => {
    // Send message to Gorgias to insert the response
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'gorgias-insert-reply',
        content: refinedResponse
      }, '*');
    }
    // Also copy to clipboard as fallback
    copyToClipboard();
  };

  return (
    <>
      <Head>
        <title>Macro Refiner - Gorgias Widget</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#0a0a0b', 
        color: '#e4e4e7', 
        fontFamily: "'IBM Plex Sans', -apple-system, sans-serif",
        fontSize: '13px'
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-track { background: #18181b; }
          ::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 2px; }
          @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        `}</style>

        {/* Header */}
        <div style={{ 
          padding: '12px', 
          borderBottom: '1px solid #27272a',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#22c55e', borderRadius: '50%', boxShadow: '0 0 8px #22c55e' }} />
            <span style={{ fontWeight: '600', fontSize: '14px' }}>Macro Refiner</span>
          </div>
          <div style={{ fontSize: '11px', color: '#93c5fd', marginTop: '2px' }}>Macros that feel human</div>
        </div>

        {/* Agent Name */}
        <div style={{ padding: '8px 12px', borderBottom: '1px solid #27272a' }}>
          <input 
            type="text" 
            value={agentName} 
            onChange={e => setAgentName(e.target.value)} 
            placeholder="Your name (for sign-off)" 
            style={{ 
              width: '100%', 
              padding: '6px 8px', 
              backgroundColor: '#18181b', 
              border: '1px solid #3f3f46', 
              borderRadius: '4px', 
              color: '#e4e4e7', 
              fontSize: '12px', 
              outline: 'none' 
            }} 
          />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #27272a' }}>
          <button 
            onClick={() => setActiveTab('macros')}
            style={{ 
              flex: 1, 
              padding: '10px', 
              background: activeTab === 'macros' ? '#18181b' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'macros' ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === 'macros' ? '#e4e4e7' : '#71717a',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            📋 Macros
          </button>
          <button 
            onClick={() => setActiveTab('result')}
            style={{ 
              flex: 1, 
              padding: '10px', 
              background: activeTab === 'result' ? '#18181b' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'result' ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === 'result' ? '#e4e4e7' : '#71717a',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            ✨ Result
          </button>
        </div>

        {/* Macros Tab */}
        {activeTab === 'macros' && (
          <div>
            {/* Search */}
            <div style={{ padding: '8px 12px' }}>
              <input 
                type="text" 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                placeholder="Search macros..." 
                style={{ 
                  width: '100%', 
                  padding: '6px 8px', 
                  backgroundColor: '#18181b', 
                  border: '1px solid #3f3f46', 
                  borderRadius: '4px', 
                  color: '#e4e4e7', 
                  fontSize: '12px', 
                  outline: 'none' 
                }} 
              />
            </div>

            {/* Category Pills */}
            <div style={{ padding: '0 12px 8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {CATEGORIES.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setSelectedCategory(cat)} 
                  style={{ 
                    padding: '3px 8px', 
                    fontSize: '10px', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer', 
                    backgroundColor: selectedCategory === cat ? '#3b82f6' : '#27272a', 
                    color: selectedCategory === cat ? 'white' : '#a1a1aa',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Macro List */}
            <div style={{ maxHeight: '200px', overflowY: 'auto', borderTop: '1px solid #27272a' }}>
              {filteredMacros.map(macro => (
                <div 
                  key={macro.id} 
                  onClick={() => setSelectedMacro(macro)} 
                  style={{ 
                    padding: '10px 12px', 
                    cursor: 'pointer', 
                    borderBottom: '1px solid #27272a', 
                    backgroundColor: selectedMacro?.id === macro.id ? '#1e3a8a' : 'transparent',
                    transition: 'background 0.15s ease'
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: '500', marginBottom: '2px' }}>{macro.name}</div>
                  <div style={{ fontSize: '10px', color: '#71717a' }}>{macro.category}</div>
                </div>
              ))}
              {filteredMacros.length === 0 && (
                <div style={{ padding: '20px 12px', color: '#52525b', fontSize: '12px', textAlign: 'center' }}>
                  No macros found
                </div>
              )}
            </div>

            {/* Additional Notes */}
            <div style={{ padding: '12px', borderTop: '1px solid #27272a' }}>
              <label style={{ fontSize: '11px', color: '#71717a', display: 'block', marginBottom: '4px' }}>
                Additional Notes (optional)
              </label>
              <textarea 
                value={additionalNotes} 
                onChange={e => setAdditionalNotes(e.target.value)} 
                placeholder="Tracking link, special offers, extra context..." 
                style={{ 
                  width: '100%', 
                  height: '60px', 
                  padding: '8px', 
                  backgroundColor: '#18181b', 
                  border: '1px solid #3f3f46', 
                  borderRadius: '4px', 
                  color: '#e4e4e7', 
                  fontSize: '12px', 
                  resize: 'none', 
                  outline: 'none' 
                }} 
              />
            </div>

            {/* Refine Button */}
            <div style={{ padding: '0 12px 12px' }}>
              <button 
                onClick={handleRefine} 
                disabled={isLoading || !selectedMacro} 
                style={{ 
                  width: '100%',
                  padding: '10px', 
                  backgroundColor: isLoading ? '#1e40af' : '#3b82f6', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  cursor: isLoading || !selectedMacro ? 'not-allowed' : 'pointer', 
                  opacity: !selectedMacro ? 0.5 : 1,
                  transition: 'all 0.15s ease'
                }}
              >
                {isLoading ? '⏳ Refining...' : '✨ Refine Macro'}
              </button>
            </div>

            {/* Selected Macro Preview */}
            {selectedMacro && (
              <div style={{ padding: '0 12px 12px' }}>
                <div style={{ fontSize: '10px', color: '#52525b', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Selected: {selectedMacro.name}
                </div>
                <div style={{ 
                  backgroundColor: '#18181b', 
                  borderRadius: '4px', 
                  border: '1px solid #27272a', 
                  padding: '8px', 
                  fontSize: '10px', 
                  color: '#71717a', 
                  maxHeight: '80px', 
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap'
                }}>
                  {selectedMacro.template.substring(0, 200)}...
                </div>
              </div>
            )}
          </div>
        )}

        {/* Result Tab */}
        {activeTab === 'result' && (
          <div style={{ padding: '12px' }}>
            {isLoading ? (
              <div style={{ 
                padding: '40px 20px', 
                textAlign: 'center', 
                color: '#71717a' 
              }}>
                <div style={{ animation: 'pulse 1s infinite', fontSize: '24px', marginBottom: '8px' }}>✨</div>
                <div>Generating personalized response...</div>
              </div>
            ) : refinedResponse ? (
              <>
                <div style={{ 
                  backgroundColor: '#18181b', 
                  borderRadius: '6px', 
                  border: '1px solid #27272a', 
                  padding: '12px', 
                  fontSize: '12px', 
                  lineHeight: '1.6',
                  maxHeight: '300px',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  marginBottom: '12px'
                }}>
                  {refinedResponse}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={insertIntoGorgias}
                    style={{ 
                      flex: 1,
                      padding: '10px', 
                      backgroundColor: '#22c55e', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '6px', 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      cursor: 'pointer'
                    }}
                  >
                    📥 Insert Reply
                  </button>
                  <button 
                    onClick={copyToClipboard}
                    style={{ 
                      flex: 1,
                      padding: '10px', 
                      backgroundColor: copied ? '#22c55e' : '#27272a', 
                      color: copied ? 'white' : '#a1a1aa', 
                      border: 'none', 
                      borderRadius: '6px', 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      cursor: 'pointer'
                    }}
                  >
                    {copied ? '✓ Copied!' : '📋 Copy'}
                  </button>
                </div>
                <button 
                  onClick={() => setActiveTab('macros')}
                  style={{ 
                    width: '100%',
                    marginTop: '8px',
                    padding: '8px', 
                    backgroundColor: 'transparent', 
                    color: '#71717a', 
                    border: '1px solid #27272a', 
                    borderRadius: '6px', 
                    fontSize: '12px', 
                    cursor: 'pointer'
                  }}
                >
                  ← Back to Macros
                </button>
              </>
            ) : (
              <div style={{ 
                padding: '40px 20px', 
                textAlign: 'center', 
                color: '#52525b' 
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📝</div>
                <div>Select a macro and click "Refine" to generate a personalized response.</div>
              </div>
            )}
          </div>
        )}

        {/* Ticket Status */}
        <div style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          padding: '8px 12px', 
          backgroundColor: '#18181b', 
          borderTop: '1px solid #27272a',
          fontSize: '10px',
          color: '#52525b'
        }}>
          {ticketData ? (
            <span>🎫 Ticket loaded: {ticketData.customer?.name || 'Customer'}</span>
          ) : (
            <span>💡 Ticket data will auto-load from Gorgias</span>
          )}
        </div>
      </div>
    </>
  );
}
