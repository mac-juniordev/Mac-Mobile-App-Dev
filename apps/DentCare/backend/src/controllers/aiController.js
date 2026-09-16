import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';

// Cleaned list: Starts with the newest models and avoids duplicate strings
const FALLBACK_MODELS = [
  'gemini-3.8-flash',      // Google's newest and most optimized Flash model
  'gemini-3.7-flash',      // Excellent secondary fallback option
  'gemini-3.6-flash',      // Reliable mainstream workhorse model
  'gemini-3.5-flash',      // Mature tier, high availability
  'gemini-3.5-flash-lite'  // Ultra-fast, cost-effective safety net
];

const buildSystemPrompt = (userName, upcomingAppointment) => {
  const appointmentContext = upcomingAppointment
    ? `\n\nUser has an upcoming appointment on ${upcomingAppointment.date} at ${upcomingAppointment.time} for ${upcomingAppointment.service} with ${upcomingAppointment.dentistName}.`
    : '';

  return `You are DentBot, a friendly and knowledgeable AI dental health assistant for DentCare.

RULES:
1. NEVER diagnose a condition. Describe what might be happening and recommend seeing a dentist.
2. NEVER prescribe medication.
3. NEVER claim to replace a dentist's opinion.
4. If the user describes a dental emergency (severe pain, swelling, bleeding, trauma, knocked-out tooth), URGENTLY tell them to contact a dentist or emergency services immediately.
5. Keep responses warm, focused, and 2-4 short paragraphs.
6. Use plain everyday language.

USER CONTEXT:
The user's name is ${userName}.${appointmentContext}

TONE:
Friendly, professional, reassuring.`;
};

const getUserContext = async (userId) => {
  try {
    const user = await User.findById(userId);
    const firstName = user?.fullName?.split(' ')[0] || 'there';

    const upcomingAppointment = await Appointment.findOne({
      user: userId,
      date: { $gte: new Date() },
      status: { $in: ['pending', 'confirmed'] },
    })
      .sort({ date: 1 })
      .populate('dentist', 'fullName');

    let appointmentData = null;
    if (upcomingAppointment) {
      appointmentData = {
        date: new Date(upcomingAppointment.date).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
        }),
        time: upcomingAppointment.time,
        service: upcomingAppointment.service,
        dentistName: upcomingAppointment.dentist?.fullName || 'your dentist',
      };
    }

    return { firstName, upcomingAppointment: appointmentData };
  } catch (error) {
    console.error('getUserContext error:', error);
    return { firstName: 'there', upcomingAppointment: null };
  }
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const callGemini = async (modelName, body) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    return { ok: res.ok, status: res.status, data: json };
  } catch (err) {
    // Catch fetch/network dropouts completely
    return { ok: false, status: 500, data: { error: err.message } };
  }
};

export const chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    console.log('📨 AI request from user', req.user.id);

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'DentBot is not configured. Please contact support.',
      });
    }

    let conversation = await Conversation.findOne({ user: req.user.id });
    if (!conversation) {
      conversation = await Conversation.create({
        user: req.user.id,
        messages: [],
      });
    }

    const { firstName, upcomingAppointment } = await getUserContext(req.user.id);
    const systemPrompt = buildSystemPrompt(firstName, upcomingAppointment);

    const history = conversation.messages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const fullContents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt + '\n\nAcknowledge briefly and wait for my first question.' }],
      },
      {
        role: 'model',
        parts: [{ text: "Got it — I'm DentBot, ready to help with your dental questions." }],
      },
      ...history,
      { role: 'user', parts: [{ text: message }] },
    ];

    const requestBody = {
      contents: fullContents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
        topP: 0.95,
      },
    };

    let finalResult = null;

    // Fixed loop flow
    for (let attempt = 0; attempt < FALLBACK_MODELS.length; attempt++) {
      const modelToTry = FALLBACK_MODELS[attempt];
      console.log(`🌐 Attempt ${attempt + 1} with ${modelToTry}...`);

      const result = await callGemini(modelToTry, requestBody);
      finalResult = result;

      if (result.ok) {
        console.log(`✅ Success with ${modelToTry}`);
        break;
      }

      console.warn(`⚠️ ${modelToTry} failed with status ${result.status}`);

      // If rate limited or service is busy, give the API breathing room before the next model
      if (result.status === 503 || result.status === 429) {
        await sleep(1000);
      }
      
      // Let the loop naturally continue to the next model for ANY error
    }

    if (!finalResult || !finalResult.ok) {
      const status = finalResult?.status || 500;
      console.error('❌ All fallback attempts failed:', JSON.stringify(finalResult?.data, null, 2));

      return res.status(status === 429 ? 429 : 500).json({
        success: false,
        message: status === 503 || status === 429
            ? "DentBot is currently handling high volume. Please wait a brief moment and try again."
            : 'DentBot could not respond at this time. Please try again.',
        debug: process.env.NODE_ENV !== 'production' ? finalResult?.data : undefined,
      });
    }

    const responseText =
      finalResult.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm sorry, I couldn't generate a response. Please try again.";

    console.log('✅ DentBot replied successfully');

    conversation.messages.push(
      { role: 'user', content: message },
      { role: 'model', content: responseText }
    );
    conversation.messageCount = conversation.messages.length;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    res.json({
      success: true,
      response: responseText,
      conversationId: conversation._id,
    });
  } catch (error) {
    console.error('💥 Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'DentBot could not respond. Please try again.',
    });
  }
};

export const getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ user: req.user.id });
    res.json({
      success: true,
      conversation: conversation
        ? {
            _id: conversation._id,
            messages: conversation.messages,
            lastMessageAt: conversation.lastMessageAt,
          }
        : { _id: null, messages: [], lastMessageAt: null },
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ success: false, message: 'Could not load conversation' });
  }
};

export const clearConversation = async (req, res) => {
  try {
    await Conversation.findOneAndDelete({ user: req.user.id });
    res.json({ success: true, message: 'Conversation cleared' });
  } catch (error) {
    console.error('Clear conversation error:', error);
    res.status(500).json({ success: false, message: 'Could not clear conversation' });
  }
};
