import React, { useState } from 'react';

// Predefined macros library - customize these for your team
const MACRO_LIBRARY = [
  {
    id: 'order_delay',
    name: 'Order Delay Apology',
    category: 'Shipping',
    template: `Hi [CUSTOMER_NAME],

Thank you for reaching out about your order. I sincerely apologize for the delay you're experiencing.

I've looked into this and [DETAILS]. We expect your order to arrive by [DATE].

As a token of our apology, [COMPENSATION].

Please let me know if there's anything else I can help with.

Best,
[AGENT_NAME]`
  },
  {
    id: 'refund_approved',
    name: 'Refund Approved',
    category: 'Refunds',
    template: `Hi [CUSTOMER_NAME],

Thanks for contacting us. I've processed your refund request.

A refund of [AMOUNT] has been initiated and will appear in your account within 5-7 business days.

If you don't see it by then, please reach out and we'll investigate further.

Best,
[AGENT_NAME]`
  },
  {
    id: 'product_issue',
    name: 'Product Issue Resolution',
    category: 'Product Support',
    template: `Hi [CUSTOMER_NAME],

I'm sorry to hear you're having trouble with [PRODUCT]. That's definitely not the experience we want for you.

Here's what I recommend: [SOLUTION]

If that doesn't resolve things, we're happy to [ALTERNATIVE].

Let me know how it goes!

Best,
[AGENT_NAME]`
  },
  {
    id: 'general_inquiry',
    name: 'General Inquiry Response',
    category: 'General',
    template: `Hi [CUSTOMER_NAME],

Thanks for reaching out!

[ANSWER]

Is there anything else I can help you with?

Best,
[AGENT_NAME]`
  },
  {
    id: 'subscription_cancel',
    name: 'Subscription Cancellation',
    category: 'Subscriptions',
    template: `Hi [CUSTOMER_NAME],

I've processed your cancellation request. Your subscription will remain active until [END_DATE], and you won't be charged again.

If you change your mind, you can reactivate anytime from your account settings.

We'd love to have you back. Is there anything we could have done differently?

Best,
[AGENT_NAME]`
  }
];

const CATEGORIES = ['All', ...new Set(MACRO_LIBRARY.map(m => m.category))];

export default function MacroRefiner() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMacro, setSelectedMacro] = useState(null);
  const [customMacro, setCustomMacro] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  
  const [ticketDetails, setTicketDetails] = useState({
    customerName: '',
    customerEmail: '',
    emailBody: '',
    orderNumber: '',
    productName: '',
    additionalContext: ''
  });
  
  const [refinedResponse, setRefinedResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [agentName, setAgentName] = useState('');

  const filteredMacros = selectedCategory === 'All' 
    ? MACRO_LIBRARY 
    : MACRO_LIBRARY.filter(m => m.category === selectedCategory);

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
1. Replace all placeholder brackets [LIKE_THIS] with appropriate content based on the ticket details
2. Adjust the message to address the specific situation described in the email body
3. Keep the core structure and intent of the macro
4. Remove any placeholders that don't have corresponding information - adapt the sentence naturally
5. If the customer's tone suggests frustration, acknowledge it genuinely without over-apologizing
6. Match the length to the complexity of the issue - simple issues get shorter responses
7. Never include placeholder brackets in your output
8. If agent name is provided, use it; otherwise use a generic sign-off

Output ONLY the refined response, nothing else.`;

    const userPrompt = `MACRO TEMPLATE:
${currentMacro}

TICKET DETAILS:
Customer Name: ${ticketDetails.customerName || 'Not provided'}
Customer Email: ${ticketDetails.customerEmail || 'Not provided'}
Order Number: ${ticketDetails.orderNumber || 'Not provided'}
Product: ${ticketDetails.productName || 'Not provided'}
Agent Name: ${agentName || 'Not provided'}

CUSTOMER'S EMAIL:
${ticketDetails.emailBody || 'No email body provided'}

ADDITIONAL CONTEXT:
${ticketDetails.additionalContext || 'None'}

Please refine this macro into a personalized, ready-to-send response.`;

    try {
      const response = await fetch('/api/refine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [
            { 
              role: 'user', 
              content: `${systemPrompt}\n\n---\n\n${userPrompt}` 
            }
          ],
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
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0b',
      color: '#e4e4e7',
      fontFamily: "'IBM Plex Sans', -apple-system, sans-serif",
      padding: '32px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        
        * { box-sizing: border-box; }
        
        ::selection {
          background: #3b82f6;
          color: white;
        }
        
        input, textarea {
          font-family: inherit;
        }
        
        textarea::-webkit-scrollbar,
        div::-webkit-scrollbar {
          width: 6px;
        }
        
        textarea::-webkit-scrollbar-track,
        div::-webkit-scrollbar-track {
          background: #18181b;
        }
        
        textarea::-webkit-scrollbar-thumb,
        div::-webkit-scrollbar-thumb {
          background: #3f3f46;
          border-radius: 3px;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '10px',
              height: '10px',
              backgroundColor: '#22c55e',
              borderRadius: '50%',
              boxShadow: '0 0 12px #22c55e',
            }} />
            <h1 style={{
              fontSize: '28px',
              fontWeight: '600',
              margin: 0,
              letterSpacing: '-0.5px',
            }}>
              Macro Refiner
            </h1>
          </div>
          <p style={{ color: '#71717a', margin: 0, fontSize: '14px' }}>
            Select a macro, paste ticket details, get a personalized response
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 1fr', gap: '24px' }}>
          {/* Left Column - Macro Library */}
          <div style={{
            backgroundColor: '#18181b',
            borderRadius: '12px',
            border: '1px solid #27272a',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #27272a' }}>
              <h2 style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#a1a1aa' }}>
                Macro Library
              </h2>
              
              {/* Category Filter */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '12px',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      backgroundColor: selectedCategory === cat ? '#3b82f6' : '#27272a',
                      color: selectedCategory === cat ? 'white' : '#a1a1aa',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Macro List */}
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {filteredMacros.map(macro => (
                <div
                  key={macro.id}
                  onClick={() => { setSelectedMacro(macro); setUseCustom(false); }}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #27272a',
                    backgroundColor: selectedMacro?.id === macro.id && !useCustom ? '#27272a' : 'transparent',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => { if (selectedMacro?.id !== macro.id || useCustom) e.currentTarget.style.backgroundColor = '#1f1f23'; }}
                  onMouseLeave={e => { if (selectedMacro?.id !== macro.id || useCustom) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '2px' }}>{macro.name}</div>
                  <div style={{ fontSize: '11px', color: '#71717a' }}>{macro.category}</div>
                </div>
              ))}
            </div>

            {/* Custom Macro Toggle */}
            <div style={{ padding: '16px', borderTop: '1px solid #27272a' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                <input
                  type="checkbox"
                  checked={useCustom}
                  onChange={e => setUseCustom(e.target.checked)}
                  style={{ accentColor: '#3b82f6' }}
                />
                Use custom macro
              </label>
              
              {useCustom && (
                <textarea
                  value={customMacro}
                  onChange={e => setCustomMacro(e.target.value)}
                  placeholder="Paste your custom macro here..."
                  style={{
                    width: '100%',
                    height: '120px',
                    marginTop: '12px',
                    padding: '10px',
                    backgroundColor: '#0a0a0b',
                    border: '1px solid #3f3f46',
                    borderRadius: '8px',
                    color: '#e4e4e7',
                    fontSize: '12px',
                    fontFamily: "'IBM Plex Mono', monospace",
                    resize: 'vertical',
                    outline: 'none',
                  }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#3f3f46'}
                />
              )}
            </div>

            {/* Agent Name */}
            <div style={{ padding: '0 16px 16px' }}>
              <label style={{ fontSize: '12px', color: '#71717a', display: 'block', marginBottom: '6px' }}>
                Your Name (for sign-off)
              </label>
              <input
                type="text"
                value={agentName}
                onChange={e => setAgentName(e.target.value)}
                placeholder="e.g., Sarah"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  backgroundColor: '#0a0a0b',
                  border: '1px solid #3f3f46',
                  borderRadius: '6px',
                  color: '#e4e4e7',
                  fontSize: '13px',
                  outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#3f3f46'}
              />
            </div>
          </div>

          {/* Middle Column - Ticket Details */}
          <div style={{
            backgroundColor: '#18181b',
            borderRadius: '12px',
            border: '1px solid #27272a',
            padding: '20px',
          }}>
            <h2 style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 20px 0', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#a1a1aa' }}>
              Gorgias Ticket Details
            </h2>

            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#71717a', display: 'block', marginBottom: '6px' }}>
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={ticketDetails.customerName}
                    onChange={e => setTicketDetails({...ticketDetails, customerName: e.target.value})}
                    placeholder="John Smith"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: '#0a0a0b',
                      border: '1px solid #3f3f46',
                      borderRadius: '8px',
                      color: '#e4e4e7',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = '#3f3f46'}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#71717a', display: 'block', marginBottom: '6px' }}>
                    Customer Email
                  </label>
                  <input
                    type="email"
                    value={ticketDetails.customerEmail}
                    onChange={e => setTicketDetails({...ticketDetails, customerEmail: e.target.value})}
                    placeholder="john@example.com"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: '#0a0a0b',
                      border: '1px solid #3f3f46',
                      borderRadius: '8px',
                      color: '#e4e4e7',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = '#3f3f46'}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#71717a', display: 'block', marginBottom: '6px' }}>
                    Order Number
                  </label>
                  <input
                    type="text"
                    value={ticketDetails.orderNumber}
                    onChange={e => setTicketDetails({...ticketDetails, orderNumber: e.target.value})}
                    placeholder="#12345"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: '#0a0a0b',
                      border: '1px solid #3f3f46',
                      borderRadius: '8px',
                      color: '#e4e4e7',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = '#3f3f46'}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#71717a', display: 'block', marginBottom: '6px' }}>
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={ticketDetails.productName}
                    onChange={e => setTicketDetails({...ticketDetails, productName: e.target.value})}
                    placeholder="Widget Pro X"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: '#0a0a0b',
                      border: '1px solid #3f3f46',
                      borderRadius: '8px',
                      color: '#e4e4e7',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = '#3f3f46'}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#71717a', display: 'block', marginBottom: '6px' }}>
                  Customer's Email Body <span style={{ color: '#3b82f6' }}>*</span>
                </label>
                <textarea
                  value={ticketDetails.emailBody}
                  onChange={e => setTicketDetails({...ticketDetails, emailBody: e.target.value})}
                  placeholder="Paste the customer's email here..."
                  style={{
                    width: '100%',
                    height: '180px',
                    padding: '12px',
                    backgroundColor: '#0a0a0b',
                    border: '1px solid #3f3f46',
                    borderRadius: '8px',
                    color: '#e4e4e7',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    resize: 'vertical',
                    outline: 'none',
                  }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#3f3f46'}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#71717a', display: 'block', marginBottom: '6px' }}>
                  Additional Context (optional)
                </label>
                <textarea
                  value={ticketDetails.additionalContext}
                  onChange={e => setTicketDetails({...ticketDetails, additionalContext: e.target.value})}
                  placeholder="Any extra details: previous interactions, special circumstances, internal notes..."
                  style={{
                    width: '100%',
                    height: '80px',
                    padding: '12px',
                    backgroundColor: '#0a0a0b',
                    border: '1px solid #3f3f46',
                    borderRadius: '8px',
                    color: '#e4e4e7',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    resize: 'vertical',
                    outline: 'none',
                  }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#3f3f46'}
                />
              </div>

              <button
                onClick={handleRefine}
                disabled={isLoading || !currentMacro.trim()}
                style={{
                  padding: '14px 24px',
                  backgroundColor: isLoading ? '#1e40af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isLoading || !currentMacro.trim() ? 'not-allowed' : 'pointer',
                  opacity: !currentMacro.trim() ? 0.5 : 1,
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {isLoading ? (
                  <>
                    <span style={{ animation: 'pulse 1s infinite' }}>●</span>
                    Refining...
                  </>
                ) : (
                  'Refine Macro →'
                )}
              </button>
            </div>
          </div>

          {/* Right Column - Output */}
          <div style={{
            backgroundColor: '#18181b',
            borderRadius: '12px',
            border: '1px solid #27272a',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '13px', fontWeight: '600', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#a1a1aa' }}>
                Ready to Send
              </h2>
              {refinedResponse && (
                <button
                  onClick={copyToClipboard}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: copied ? '#22c55e' : '#27272a',
                    color: copied ? 'white' : '#a1a1aa',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              )}
            </div>

            <div style={{
              flex: 1,
              backgroundColor: '#0a0a0b',
              borderRadius: '8px',
              border: '1px solid #27272a',
              padding: '16px',
              minHeight: '400px',
              overflow: 'auto',
            }}>
              {isLoading ? (
                <div style={{ color: '#71717a', fontSize: '14px' }}>
                  <span style={{ animation: 'pulse 1s infinite' }}>Generating personalized response...</span>
                </div>
              ) : refinedResponse ? (
                <div style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  whiteSpace: 'pre-wrap',
                  animation: 'slideIn 0.3s ease',
                }}>
                  {refinedResponse}
                </div>
              ) : (
                <div style={{ color: '#52525b', fontSize: '14px', fontStyle: 'italic' }}>
                  Select a macro and add ticket details, then click "Refine Macro" to generate a personalized response.
                </div>
              )}
            </div>

            {/* Selected Macro Preview */}
            {currentMacro && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '11px', color: '#52525b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Current Template
                </div>
                <div style={{
                  backgroundColor: '#0a0a0b',
                  borderRadius: '6px',
                  border: '1px solid #27272a',
                  padding: '12px',
                  fontSize: '11px',
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: '#71717a',
                  maxHeight: '120px',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                }}>
                  {currentMacro}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
