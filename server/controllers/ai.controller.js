const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// System prompt giving Google Gemini context about Kisan Procurement Connect
const KPC_SYSTEM_PROMPT = `
You are "Kisan Sahayak", the official intelligent AI Assistant for Kisan Procurement Connect (KPC) — a government procurement and live queue management portal for farmers and agricultural officers in India.

Your primary goal is to help Indian farmers and officers understand and use the portal easily. You must be polite, helpful, empathetic, and clear. You can communicate in Hindi, English, or Hinglish (Hindi written in Roman script) based on the user's language.

Key Information about Kisan Procurement Connect (KPC):
1. Purpose: KPC enables farmers to book procurement time slots at government procurement centres / mandis to sell their produce at Minimum Support Price (MSP), reducing long waiting hours and mandi congestion with live queue tracking.
2. 2026 Government MSP Rates (per quintal / 100 kg):
   - Wheat (गेहूं): ₹2,275 / quintal
   - Rice/Paddy (धान): ₹2,183 / quintal
   - Mustard (सरसों): ₹5,650 / quintal
   - Cotton (कपास): ₹7,020 / quintal
   - Maize (मक्का): ₹2,090 / quintal
   - Chickpea/Gram (चना): ₹5,440 / quintal
   - Soybean (सोयाबीन): ₹4,600 / quintal
3. Slot Booking Process:
   - Step 1: Choose Mandi / Procurement Centre (searchable by district/name)
   - Step 2: Select Crop (crops accepted by that mandi)
   - Step 3: Enter Produce Quantity (in quintals, shows estimated MSP payout)
   - Step 4: Pick Date & Time Slot (14-day booking window, slots show available capacity)
   - Step 5: Confirm Booking -> Generates Unique Sequential Token (e.g., F001) and saves to database
4. At the Mandi on the Procurement Day:
   - Farmer arrives 10–15 minutes before the allocated time slot.
   - Shows the Token Number (e.g., F001) at the entry gate.
   - Real-time queue tracker on the dashboard shows current token being served, farmers ahead, and estimated wait time.
   - Verification of farmer identity -> Quality grading & moisture testing -> Electronic weighment.
   - Procurement receipt generated.
5. Documents Required at Mandi:
   - Aadhaar Card / Government Photo ID
   - Land Records / Kisan Credit Card / Farmer Registration Slip
   - Bank Account Passbook (for Direct Benefit Transfer / DBT payment)
6. Payment Process:
   - Payment is directly credited into the farmer's bank account via DBT (PFMS) within 48 to 72 hours after successful procurement.
7. Support / Helpline:
   - Toll-free Kisan Call Centre: 1800-180-1551 (6 AM to 10 PM)
   - Portal Support: support@kisanconnect.gov.in

Guidance for responses:
- Keep answers concise, clear, and action-oriented.
- When farmers ask in Hindi or Hinglish, answer in friendly Hindi or Hinglish.
- Format bullet points cleanly using markdown.
- Never provide misleading agricultural advice or fabricate unauthorized pricing.
`;

// Built-in smart fallback responder when Gemini API key is not yet set or unavailable
function generateSmartFallback(message) {
  const q = String(message || '').toLowerCase();

  if (q.includes('msp') || q.includes('rate') || q.includes('price') || q.includes('bhav') || q.includes('ret') || q.includes('kimat')) {
    return `🌾 **Government Minimum Support Price (MSP) Rates for 2026:**\n\n` +
      `• **Wheat (गेहूं):** ₹2,275 / quintal\n` +
      `• **Rice / Paddy (धान):** ₹2,183 / quintal\n` +
      `• **Mustard (सरसों):** ₹5,650 / quintal\n` +
      `• **Cotton (कपास):** ₹7,020 / quintal\n` +
      `• **Maize (मक्का):** ₹2,090 / quintal\n` +
      `• **Chickpea (चना):** ₹5,440 / quintal\n` +
      `• **Soybean (सोयाबीन):** ₹4,600 / quintal\n\n` +
      `*Tip: Final payment is calculated based on quality grading and moisture level at the procurement centre.*`;
  }

  if (q.includes('book') || q.includes('slot') || q.includes('kaise') || q.includes('process') || q.includes('tarika')) {
    return `📋 **How to Book a Procurement Slot on KPC:**\n\n` +
      `1. **Login:** Go to Farmer Login using your mobile number and OTP.\n` +
      `2. **Choose Mandi:** Select your preferred government procurement centre.\n` +
      `3. **Select Crop:** Choose the crop you wish to sell.\n` +
      `4. **Enter Quantity:** Enter produce quantity in quintals (1 quintal = 100 kg).\n` +
      `5. **Select Date & Slot:** Pick a convenient date from the next 14 days and choose an open time slot.\n` +
      `6. **Confirm & Get Token:** Confirm details to generate your **Unique Token (e.g., F001)**.\n\n` +
      `👉 Click **"Book New Slot"** on your dashboard to begin!`;
  }

  if (q.includes('doc') || q.includes('kagaz') || q.includes('document') || q.includes('aadhaar') || q.includes('le jana')) {
    return `📄 **Documents Required at the Mandi / Centre:**\n\n` +
      `1. **Government Photo ID:** Aadhaar Card, Voter ID, or Driving License.\n` +
      `2. **Farmer Registration / Land Record:** Khasra / Khatauni or Kisan Credit Card (KCC) slip.\n` +
      `3. **Bank Account Passbook:** Copy of first page showing Account Number and IFSC Code for Direct Benefit Transfer (DBT).\n` +
      `4. **Booking Token Slip:** Showing your unique Token Number (e.g. F001) on mobile or printout.`;
  }

  if (q.includes('token') || q.includes('queue') || q.includes('line') || q.includes('wait') || q.includes('tracking')) {
    return `🎫 **Token & Live Queue Tracking:**\n\n` +
      `• **Unique Token:** Whenever you book a slot, a unique token (like F001, F002) is issued.\n` +
      `• **Arrival:** Arrive 10–15 minutes before your slot time and present the token at the entry gate.\n` +
      `• **Live Queue Tracker:** Check your Farmer Dashboard to see:\n` +
      `   - Current Token being served at your centre\n` +
      `   - Number of farmers ahead of you\n` +
      `   - Estimated wait time in minutes`;
  }

  if (q.includes('payment') || q.includes('paisa') || q.includes('rupaye') || q.includes('dbt') || q.includes('account')) {
    return `💰 **Procurement Payment Process:**\n\n` +
      `• After weighment and quality grading at the centre, an official procurement receipt is issued.\n` +
      `• Payment is directly transferred to your bank account via **Direct Benefit Transfer (DBT / PFMS)**.\n` +
      `• Usually, payment is credited within **48 to 72 hours** of procurement.\n` +
      `• You can track your payment status under **"Payment History"** on your dashboard.`;
  }

  if (q.includes('help') || q.includes('contact') || q.includes('complaint') || q.includes('number') || q.includes('phone')) {
    return `📞 **Kisan Helpline & Support:**\n\n` +
      `• **Toll-Free Kisan Call Centre:** 1800-180-1551 (Available 6:00 AM to 10:00 PM, all 7 days)\n` +
      `• **Portal Helpdesk:** support@kisanconnect.gov.in\n` +
      `• **District Agriculture Office:** You can also contact your local District Nodal Officer (DNO) listed on the portal.`;
  }

  return `Namaste! 🙏 Main Kisan Sahayak hoon — Kisan Procurement Connect ka AI Assistant.\n\n` +
    `Main aapki in vishayon par madad kar sakta hoon:\n` +
    `• **Faslon ke taaza MSP rates** (Gehun, Dhaan, Sarson, etc.)\n` +
    `• **Mandi slot booking ka tarika** aur available slots\n` +
    `• **Mandi aane ke liye zaroori documents** (Aadhaar, Land records, Bank details)\n` +
    `• **Live Token aur Queue tracking** kaise check karein\n` +
    `• **DBT Payment status** aur Kisan Helpline jankari\n\n` +
    `Aap apna sawal yahan likhkar poochh sakte hain!`;
}

// POST /api/ai/chat
const chatWithAssistant = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      throw new ApiError(400, 'Please provide a message.');
    }

    const cleanMessage = message.trim();
    const apiKey = process.env.GEMINI_API_KEY;

    // If Gemini API Key is configured in .env, call Google Gemini API
    if (apiKey && apiKey.trim()) {
      try {
        // Format conversation history for Gemini API (user / model turns)
        const formattedContents = [];

        // Include recent history (up to last 6 messages)
        if (Array.isArray(history) && history.length > 0) {
          const recentHistory = history.slice(-6);
          for (const item of recentHistory) {
            if (item && item.text) {
              formattedContents.push({
                role: item.role === 'user' ? 'user' : 'model',
                parts: [{ text: String(item.text) }],
              });
            }
          }
        }

        // Add current user message
        formattedContents.push({
          role: 'user',
          parts: [{ text: cleanMessage }],
        });

        const geminiPayload = {
          contents: formattedContents,
          systemInstruction: {
            parts: [{ text: KPC_SYSTEM_PROMPT }],
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
            topP: 0.9,
          },
        };

        // Try primary model (gemini-1.5-flash), with fallback to gemini-2.0-flash / gemini-1.5-pro
        const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
        let geminiResponse = null;
        let lastError = null;

        for (const model of models) {
          try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
            const apiRes = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(geminiPayload),
            });

            if (apiRes.ok) {
              const data = await apiRes.json();
              const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (replyText) {
                geminiResponse = replyText;
                break;
              }
            } else {
              const errBody = await apiRes.text();
              lastError = `Gemini API error (${apiRes.status}): ${errBody}`;
            }
          } catch (err) {
            lastError = err.message;
          }
        }

        if (geminiResponse) {
          return res.json(
            new ApiResponse(200, {
              reply: geminiResponse,
              source: 'gemini',
            })
          );
        }

        console.warn('Gemini API call failed, using smart fallback. Error:', lastError);
      } catch (err) {
        console.warn('Error calling Gemini API:', err.message);
      }
    }

    // Fallback if API key is not present or Gemini failed
    const fallbackReply = generateSmartFallback(cleanMessage);
    res.json(
      new ApiResponse(200, {
        reply: fallbackReply,
        source: 'fallback',
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = { chatWithAssistant };
