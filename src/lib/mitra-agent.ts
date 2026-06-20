export const MITRA_SYSTEM_PROMPT = `You are Mitra, a deeply empathetic, supportive digital companion for Indian students preparing for high-stakes exams (JEE, NEET, UPSC, etc.). 
- Never judge, lecture, or give generic 'study harder' advice.
- Validate their emotional exhaustion first (e.g., 'It makes total sense that rotation mechanics feels overwhelming right now...').
- Keep responses concise (2-3 sentences max) to minimize cognitive load for a stressed student.
- Seamlessly adapt your tone based on their current stress level context.`;

export type StressLevel = 'calm' | 'tired' | 'stressed' | 'overwhelmed';

/**
 * Analyzes the user's message to detect their stress level based on key emotional markers and terms.
 */
export function detectStressLevel(message: string, currentLevel: StressLevel): StressLevel {
  const text = message.toLowerCase();
  
  // Overwhelmed triggers (highest stress)
  if (
    text.includes('give up') || 
    text.includes('giving up') || 
    text.includes('can\'t do this') || 
    text.includes('quit') || 
    text.includes('cry') || 
    text.includes('panicking') || 
    text.includes('panic') || 
    text.includes('hopeless') ||
    text.includes('depressed') ||
    text.includes('no hope') ||
    text.includes('ending this') ||
    text.includes('suicide') || // Safety trigger, though we should also validate safely
    text.includes('failure') ||
    text.includes('failed')
  ) {
    return 'overwhelmed';
  }
  
  // Stressed triggers
  if (
    text.includes('stress') || 
    text.includes('anxious') || 
    text.includes('scared') || 
    text.includes('worry') || 
    text.includes('pressure') || 
    text.includes('backlog') || 
    text.includes('exam tomorrow') || 
    text.includes('mock test') || 
    text.includes('syllabus') ||
    text.includes('percentile') ||
    text.includes('rank') ||
    text.includes('marks') ||
    text.includes('physics') ||
    text.includes('chemistry') ||
    text.includes('math')
  ) {
    return 'stressed';
  }
  
  // Tired triggers
  if (
    text.includes('tired') || 
    text.includes('exhausted') || 
    text.includes('sleepy') || 
    text.includes('no sleep') || 
    text.includes('insomnia') || 
    text.includes('burnout') || 
    text.includes('fatigue') || 
    text.includes('heavy head') ||
    text.includes('drained')
  ) {
    return 'tired';
  }

  // If already at a high stress level, only downgrade slowly unless explicit calm indicators are found
  if (text.includes('okay') || text.includes('thanks') || text.includes('thank you') || text.includes('better') || text.includes('calmed') || text.includes('hello') || text.includes('hi')) {
    return 'calm';
  }
  
  return currentLevel;
}

interface FallbackRule {
  keywords: string[];
  responses: Record<StressLevel, string[]>;
}

const FALLBACK_RULES: FallbackRule[] = [
  {
    keywords: ['rotation', 'physics', 'mechanics', 'hcv', 'irodov'],
    responses: {
      calm: [
        "It makes total sense that rotation mechanics feels tricky, but you're approaching it with a clear mind. Let's take it one step, one free-body diagram at a time. What part of torque or angular momentum feels the bulkiest?",
        "Physics can feel like a puzzle, but you're doing great just showing up for it today. We can break down these rotation concepts together. How does the current topic look to you?"
      ],
      tired: [
        "It makes total sense that rotation mechanics feels completely overwhelming when your mind is this drained. Trying to visualize moments of inertia when you are tired is exhausting. Close the book for a bit, rest your eyes, and we'll look at it fresh tomorrow.",
        "Your brain is asking for a break, and rotation mechanics is the last thing you need to force right now. Let's pause the HCV problems for tonight. Sleep is just as important as study hours."
      ],
      stressed: [
        "It makes total sense that rotation mechanics feels overwhelming right now with the exam pressure mounting. You don't have to master the entire chapter tonight. Just focus on understanding one core equation, and let the rest go for now.",
        "I hear how anxious you are, and rotation mechanics is notoriously tough for everyone preparing for JEE. Take a deep breath—one sum does not define your prep. Let's look at the basic definition first."
      ],
      overwhelmed: [
        "It makes total sense that rotation mechanics feels completely overwhelming and makes you want to throw your hands up right now. Please know that it's okay to feel completely lost in this chapter; almost every aspirant goes through this exact block. Let's put the physics books away for today and just focus on you feeling a bit safer.",
        "I'm right here with you, and it's completely okay that rotation or mechanics feels like a mountain you can't climb today. You are carrying so much pressure, and it's natural to feel like breaking. Let's step away from the study desk together for a few minutes."
      ]
    }
  },
  {
    keywords: ['backlog', 'syllabus', 'behind', 'left', 'cover'],
    responses: {
      calm: [
        "It makes total sense to feel a bit concerned about backlogs, but you have the clarity to plan through this. We can list out the highest-weightage topics first. What's the main chapter you want to sort out today?",
        "Backlogs are just tasks waiting for the right moment, and you're in a great space to tackle them. Let's build a mini-plan to cover one small topic daily. Which subject is it?"
      ],
      tired: [
        "It makes total sense that looking at your backlog feels exhausting when you're already running on empty. Forcing yourself to catch up tonight will only lead to more fatigue. Let's shut the planner for now and let your mind recharge.",
        "Your exhaustion is real, and backlog tracking can wait until your energy is back. You cannot study efficiently when you're this drained anyway. Go rest, Mitra has your back."
      ],
      stressed: [
        "It makes total sense that the backlog feels like a ticking clock, but please remember that almost every single topper goes in with uncovered topics. You don't need to finish 100% of the syllabus to do incredibly well. Let's isolate just one key topic to look at tomorrow.",
        "I know the guilt of backlogs is heavy, but beating yourself up won't clear them. Take a deep breath—we can strip away the non-essentials. Let's just focus on what's right in front of us."
      ],
      overwhelmed: [
        "It makes total sense that the sheer size of the backlog feels like it's drowning you right now. It is completely valid to feel paralyzed when there's so much to cover. Let's take the pressure off clearing anything today—your peace of mind is the only priority right now.",
        "I hear how heavy this backlog weight is, and it's completely natural to feel like giving up under it. You are not a failure for falling behind in this brutal race. Let's take a break from the syllabus entirely for tonight."
      ]
    }
  },
  {
    keywords: ['mock test', 'test', 'score', 'marks', 'percentile', 'rank'],
    responses: {
      calm: [
        "It makes total sense to analyze your mock scores, and you're in a great state of mind to see them as data rather than a verdict. Every mistake in a mock is one less mistake in the final exam. Let's look at the error analysis calmly.",
        "Mock tests are just practice ground, and your cool head today will help you bridge the gaps. What specific section didn't go as planned?"
      ],
      tired: [
        "It makes total sense that a mock score drop feels like a blow, especially when you have no energy left to fight it. Analyzing test results when you're exhausted will only make you feel worse. Please go sleep, and we will look at the errors when your brain is rested.",
        "A low score when you are already physically drained is so frustrating. Let's not analyze the test paper tonight. You've pushed hard, and your body needs deep rest."
      ],
      stressed: [
        "It makes total sense that this score dip is sparking panic, but mock tests are designed to expose weaknesses, not predict your actual rank. A dip today is just a pointer, not your final outcome. Take a deep breath; you are still on track.",
        "I know how much that number hurts, especially with everyone's expectations on you. But please remember, mocks are just tools, not a measure of your worth or intelligence. Let's step back from the score card for a bit."
      ],
      overwhelmed: [
        "It makes total sense that this mock test result feels like the absolute end of the road and makes you want to quit. You have put so much sweat into this, and seeing a low number is incredibly painful and exhausting. Let's forget about ranks and scores for a moment—you are worth so much more than a three-digit number.",
        "I see how crushed you are by these marks, and it's completely valid to want to cry or scream. Please don't let this single test make you believe you aren't capable. Let's close the score portal and take a gentle breather."
      ]
    }
  },
  {
    keywords: ['organic', 'chemistry', 'reactions', 'mechanism'],
    responses: {
      calm: [
        "It makes total sense that organic mechanisms feel complex, but you have the patience to decode them today. We can map out the reagents step-by-step. Which reaction is on your mind?",
        "Organic chemistry is like learning a new language, and you're doing great. Let's write down the conversions together. What reaction are you working on?"
      ],
      tired: [
        "It makes total sense that these reagents look like a blur when your brain is running on empty. Organic chemistry requires high focus, which you can't force when you're this tired. Let's call it a night and rest.",
        "Trying to memorize named reactions when you're sleepy is a recipe for frustration. Put the notebook away. A good night's sleep will help the pathways settle in your mind."
      ],
      stressed: [
        "It makes total sense that the sheer number of chemical reactions is stressing you out. You don't need to memorize the entire handbook today. Let's just focus on one mechanism pattern—like nucleophilic substitution—and master that first.",
        "I know organic chemistry feels like a chaotic mess right now, but it will click. Take a deep breath; we don't have to rush. Let's write out just one pathway together."
      ],
      overwhelmed: [
        "It makes total sense that the endless lists of reactions feel completely overwhelming and impossible to remember. Preparing for chemistry under this intense exam pressure is a huge mental burden. Let's stop trying to force the conversions tonight and let your mind rest.",
        "I hear how frustrating and overwhelming this chemistry backlog is, and it's completely okay to feel like you can't keep up. You are carrying a lot of weight, and it's okay to take a break from the formulas. Let's take a breather."
      ]
    }
  },
  {
    keywords: ['sleep', 'insomnia', 'night', 'wake', 'sleepless'],
    responses: {
      calm: [
        "It makes total sense to prioritize your sleep schedule, and having a calm routine will help. Let's wind down slowly without screens or books. How is your sleep schedule looking lately?",
        "Getting good sleep is the ultimate hack for exam preparation. You're in a good position to plan a rest schedule. What time do you want to wind down tonight?"
      ],
      tired: [
        "It makes total sense that you're feeling exhausted if sleep has been hard to find. When your body is this tired, even laying down quietly without thinking of the syllabus is a victory. Let's put away all books, dim the lights, and just let your body rest.",
        "I know the anxiety of the exam keeps you awake, making you even more tired. You don't have to study anymore tonight. Let's just try to rest your mind."
      ],
      stressed: [
        "It makes total sense that exam anxiety is keeping you awake, but staring at the clock will only increase the pressure. Even if you can't sleep, just lying down and resting your body without studying is helpful. Let's try to focus on slow, gentle breathing.",
        "I know you're worried about tomorrow's schedule, but your health comes first. You've studied enough for today. Let's let go of the syllabus and focus on getting you comfortable."
      ],
      overwhelmed: [
        "It makes total sense that you can't sleep when your mind is screaming with mock tests and syllabus fear. It is exhausting to lie awake feeling the weight of the world on your chest. Let's take all pressure off sleeping or studying tonight—just know you are safe and doing your best.",
        "I hear how anxious and restless you are, and it's completely okay that sleep won't come easily tonight. You are under immense pressure, and your brain is in overdrive. Let's just sit together quietly for a bit."
      ]
    }
  }
];

const GENERAL_RESPONSES: Record<StressLevel, string[]> = {
  calm: [
    "It makes total sense that you are focusing on your prep today, and I'm really glad to see you working through it with such a clear mindset. Let's keep this steady pace going. What are we looking at next?",
    "You are doing a wonderful job staying grounded during this intense exam phase. How can I help you make your study session smoother today?"
  ],
  tired: [
    "It makes total sense that you are feeling completely drained; these exam cycles demand so much from you. Trying to push through this fatigue will only make you feel more exhausted. Please give yourself permission to step away and rest.",
    "Your energy is valuable, and right now your body is asking you to pause and recover. The books will still be there tomorrow, but you need to rest tonight. Let's call it a day."
  ],
  stressed: [
    "It makes total sense to feel stressed with so much riding on these exams, but remember you don't have to carry the whole load at once. Let's break things down into tiny, manageable steps. What is one small thing we can tackle together?",
    "I hear the tension in your voice, and it is completely normal to feel this way when preparing for such competitive exams. Take a slow breath. You are doing the best you can, and that is more than enough."
  ],
  overwhelmed: [
    "It makes total sense that you are feeling completely overwhelmed and like you want to give up right now. The pressure on Indian students is incredibly intense, and it's natural to feel like it's too much to bear. Please take a step back from the books, breathe, and remember that your well-being is worth infinitely more than any exam.",
    "I'm so sorry things feel this heavy and exhausting today. It's completely okay to feel crushed and to want to stop; you are carrying a mountain of expectations. Let's put the syllabus aside for a bit and focus on helping you feel okay."
  ]
};

/**
 * Generates a deeply empathetic response matching the detected stress level and message keywords.
 * Keeps responses strictly to 2-3 sentences to minimize cognitive load.
 */
export function generateFallbackResponse(message: string, level: StressLevel): string {
  const text = message.toLowerCase();
  
  // Try to find a matching rule based on keywords
  for (const rule of FALLBACK_RULES) {
    if (rule.keywords.some(keyword => text.includes(keyword))) {
      const list = rule.responses[level];
      const randomIndex = Math.floor(Math.random() * list.length);
      return list[randomIndex];
    }
  }
  
  // Default to general responses based on stress level
  const list = GENERAL_RESPONSES[level];
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
}
