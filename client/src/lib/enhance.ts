interface EnhancementResult {
  enhanced: string;
  metrics: {
    clarity: number;
    specificity: number;
    context: number;
  };
}

const modelRules = {
  'gpt-4': {
    prefix: "You are interacting with GPT-4. Be direct and precise.",
    contextLevel: "high",
    provider: "openai",
  },
  'gpt-3.5': {
    prefix: "For GPT-3.5, break down complex requests.",
    contextLevel: "medium",
    provider: "openai",
  },
  'claude': {
    prefix: "When working with Claude, provide structured input.",
    contextLevel: "high",
    provider: "anthropic",
  },
  'llama3': {
    prefix: "For Llama 3 models via Groq, use simple and clear language.",
    contextLevel: "high",
    provider: "groq",
  },
};

async function callOpenAI(prompt: string, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error('OpenAI API call failed');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callAnthropic(prompt: string, apiKey: string) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: "claude-3-opus-20240229",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error('Anthropic API call failed');
  }

  const data = await response.json();
  return data.content[0].text;
}

async function callGroq(prompt: string, apiKey: string) {
  const response = await fetch('https://api.groq.com/v1/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama3-70b-4096",  
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error('Groq API call failed');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function enhancePrompt(
  prompt: string,
  model: string,
  apiKey: string,
  systemPrompt: string
): Promise<EnhancementResult> {
  const rules = modelRules[model as keyof typeof modelRules];
  const fullPrompt = `${systemPrompt}\n\n${rules.prefix}\n\nOriginal prompt: ${prompt}`;

  let enhanced: string;

  try {
    switch (rules.provider) {
      case 'openai':
        enhanced = await callOpenAI(fullPrompt, apiKey);
        break;
      case 'anthropic':
        enhanced = await callAnthropic(fullPrompt, apiKey);
        break;
      case 'groq':
        enhanced = await callGroq(fullPrompt, apiKey);
        break;
      default:
        throw new Error('Unknown provider');
    }
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }

  return {
    enhanced,
    metrics: calculateMetrics(prompt, enhanced),
  };
}

function calculateMetrics(original: string, enhanced: string): { clarity: number; specificity: number; context: number } {
  // Simple metric calculation
  const clarity = Math.min(100, (enhanced.length / original.length) * 80);
  const specificity = Math.min(100, (enhanced.split(' ').length / original.split(' ').length) * 90);
  const context = enhanced.includes('Context:') ? 100 : 60;

  return {
    clarity: Math.round(clarity),
    specificity: Math.round(specificity),
    context: Math.round(context),
  };
}