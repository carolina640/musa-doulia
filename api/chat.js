/* ── PREGNANCY WEEK CALCULATOR ── */
function calcPregnancyWeek(refDate) {
  if (!refDate) return { week: 0, day: 0 };
  const start = new Date(refDate + 'T00:00:00Z');
  const now = new Date();
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const startDay = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  const diffDays = Math.floor((today - startDay) / (1000 * 60 * 60 * 24));
  return { week: Math.max(0, Math.floor(diffDays / 7)), day: Math.max(0, diffDays % 7) };
}

/* ── USER DATA (server-side only — never sent to the client) ── */
const USERS = {
  USR_01: {
    name:"Valentina", age:29, week:8,
    first_pregnancy:"Yes", previous_losses:"No", has_partner:"Yes",
    conditions:"Generalized anxiety disorder",
    sleep_last_night:"5h, poor (woke up 3x with nausea)", sleep_avg:"5.5h",
    hr:"82 bpm", steps:"3,200", activity:"Low (too nauseous to move much)",
    symptoms_7d:"Persistent nausea (morning and night), Vomiting 2x/day, Food aversions (meat, coffee), Extreme fatigue, Breast tenderness",
    mood_7d:"Anxious 6/7, Frustrated 3/7",
    queries:"Asked about nausea severity and when to worry, Food aversions and nutrition concerns"
  },
  USR_02: {
    name:"Camila", age:33, week:14,
    first_pregnancy:"Yes", previous_losses:"No", has_partner:"Yes",
    conditions:"None",
    sleep_last_night:"7h, fair (vivid dreams)", sleep_avg:"7.2h",
    hr:"74 bpm", steps:"5,800", activity:"Moderate (walking 3x/week)",
    symptoms_7d:"Round ligament pain (sharp, left side), Mild headaches, Increased appetite, Skin changes (darker patches on cheeks)",
    mood_7d:"Hopeful 4/7, Worried 2/7, Energetic 3/7",
    queries:"Asked about round ligament pain vs. concerning pain, Skin darkening on face"
  },
  USR_03: {
    name:"Sofía", age:30, week:26,
    first_pregnancy:"Yes", previous_losses:"No", has_partner:"Yes",
    conditions:"None",
    sleep_last_night:"6h, restless (baby very active at night)", sleep_avg:"6.3h",
    hr:"80 bpm", steps:"6,100", activity:"Moderate (prenatal pilates 2x)",
    symptoms_7d:"Braxton Hicks contractions (2-3x/day), Lower back pain, Swollen feet by evening, Heartburn after meals, Frequent urination",
    mood_7d:"Happy 4/7, Tired 3/7, Anxious 1/7",
    queries:"Asked about Braxton Hicks vs real contractions, Swelling in feet and when it's concerning"
  },
  USR_04: {
    name:"Jimena", age:26, week:34,
    first_pregnancy:"Yes", previous_losses:"No", has_partner:"No",
    conditions:"Depression (stopped medication without consulting doctor)",
    sleep_last_night:"4.5h, very poor (insomnia + anxiety)", sleep_avg:"5h",
    hr:"88 bpm", steps:"2,100", activity:"Very low",
    symptoms_7d:"Insomnia, Crying spells, Loss of appetite, Pelvic pressure, Shortness of breath when climbing stairs",
    mood_7d:"Sad 5/7, Overwhelmed 6/7, Lonely 4/7",
    queries:"Asked about feeling emotionally numb, Whether it's safe to restart antidepressants"
  },
  USR_05: {
    name:"Pamela", age:32,
    weekRefDate: "2025-09-02",
    first_pregnancy:"Yes", previous_losses:"No", has_partner:"Yes",
    conditions:"Generalized anxiety disorder",
    sleep_last_night:"6.5h, OK (1 bathroom break)", sleep_avg:"6.8h",
    hr:"78 bpm", steps:"7,400", activity:"Moderate (yoga 2x, walks)",
    symptoms_7d:"Lower pelvic pressure, Nighttime shortness of breath, Nasal congestion without a cold, Abdominal bloating",
    mood_7d:"Anxious 5/7, Overwhelmed 2/7",
    queries:"Asked about Fatigue in the past week and increased emotional sensitivity, Nighttime shortness of breath, Nasal congestion without a cold yesterday"
  }
};

/* ── SYSTEM PROMPT BUILDER ── */
function buildSP(u) {
  const week = u.weekRefDate ? calcPregnancyWeek(u.weekRefDate).week : u.week;
  return `You are Doulia — Musa's Pregnancy Symptom Companion.
Help pregnant women answer: "Is this normal?"
You are NOT a doctor. Be like a knowledgeable big sister — warm, direct, caring, honest.
Your job: Help her stop worrying and move on with her day.

VOICE: Caring friend over coffee. Real validation first. Get to the point. Empower her.
NEVER: sound clinical, say "don't worry" or "it's just hormones", diagnose, or prescribe.
ALWAYS respond in ENGLISH.

USER CONTEXT (pre-loaded — never ask for these):
Name: ${u.name} | Age: ${u.age} | Week: ${week} ← anchor EVERY response here
First pregnancy: ${u.first_pregnancy} | Previous losses: ${u.previous_losses}
Partner: ${u.has_partner} | Conditions: ${u.conditions}
Sleep last night: ${u.sleep_last_night} | Sleep avg 7d: ${u.sleep_avg}
HR: ${u.hr} | Steps today: ${u.steps} | Activity: ${u.activity}
Symptoms last 7d: ${u.symptoms_7d}
Mood last 7d: ${u.mood_7d}
Previous queries: ${u.queries}

RESPONSE FORMAT:
- Max 650 characters total
- Use short paragraphs (2-3 lines max)
- Use **bold** for key terms or action words
- Use bullet points only for escalation criteria (3+ items)
- Use ⚠️ only for urgent situations
- 1-2 emojis max, only when natural
- No sources unless asked

STRUCTURE:
1) Calibrated validation (fuller first time, lighter in follow-ups)
2) What's happening + WHY in her specific week
3) 1-2 concrete tips for today
4) One-line "when to actually worry"

ESCALATION:
EMERGENCY → "⚠️ This needs medical attention now." + clear bullet criteria
CONSULT → not urgent, worth a call
REASSURE → common for her week, validate + explain + tips

CRISIS (suicidal ideation):
Never minimize. Never say "I'm glad you told me."
Validate pain directly → resources immediately:
"What you're feeling is heavy, and you don't have to carry it alone.
🆘 Emergency: your local emergency services
📞 Postpartum Support International: 1-800-944-4773
📞 Crisis Text Line: Text HOME to 741741
You deserve to feel better than this."

MEDICATION → redirect only, her doctor decides.
OUT OF SCOPE → warm redirect to pregnancy symptoms.`;
}

/* ── RATE LIMITER (simple in-memory, per-IP, sliding window) ── */
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 20; // max requests per window

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || [];
  // Remove expired timestamps
  const recent = entry.filter(t => now - t < RATE_LIMIT_WINDOW);
  if (recent.length >= RATE_LIMIT_MAX) return true;
  recent.push(now);
  rateLimitMap.set(ip, recent);
  return false;
}

/* ── ALLOWED ORIGINS ── */
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

function isOriginAllowed(req) {
  // In development or if no origins configured, allow all
  if (ALLOWED_ORIGINS.length === 0) return true;
  const origin = req.headers.origin || '';
  return ALLOWED_ORIGINS.some(o => origin.startsWith(o));
}

/* ── MAX MESSAGES AND BODY SIZE ── */
const MAX_MESSAGES = 50;
const MAX_BODY_SIZE = 100_000; // 100KB

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Origin check
  if (!isOriginAllowed(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Rate limiting
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
  }

  // Body size check
  const bodySize = JSON.stringify(req.body || {}).length;
  if (bodySize > MAX_BODY_SIZE) {
    return res.status(413).json({ error: 'Request too large' });
  }

  const { userId, messages } = req.body;

  // Validate userId
  if (!userId || !USERS[userId]) {
    return res.status(400).json({ error: 'Invalid user' });
  }

  // Validate messages
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages required' });
  }

  // Cap messages to prevent token abuse
  const trimmedMessages = messages.slice(-MAX_MESSAGES);

  // Build system prompt server-side
  const system = buildSP(USERS[userId]);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system,
        messages: trimmedMessages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic error:', data.error?.message || 'Unknown error');
      return res.status(500).json({ error: 'API error. Please try again.' });
    }

    const reply = data.content?.[0]?.text || 'Something went wrong.';
    return res.status(200).json({ reply });

  } catch (err) {
    console.error('Server error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}
