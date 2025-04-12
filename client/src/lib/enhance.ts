import { AVAILABLE_MODELS } from "./models";

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

async function callOpenAI(prompt: string, apiKey: string, modelId: string = "gpt-4o") {
  console.log(`Calling OpenAI with model: ${modelId}`);
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI error:', error);
    throw new Error('OpenAI API call failed');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callAnthropic(prompt: string, apiKey: string, modelId: string = "claude-3-opus-20240229") {
  console.log(`Calling Anthropic with model: ${modelId}`);
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Anthropic error:', error);
    throw new Error('Anthropic API call failed');
  }

  const data = await response.json();
  return data.content[0].text;
}

async function callGroq(prompt: string, apiKey: string, modelId: string = "llama3-70b-8192") {
  console.log(`Calling Groq with model: ${modelId}`);
  const response = await fetch('https://api.groq.com/v1/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Groq error:', error);
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
  console.log(`Enhancing prompt using model: ${model}`);
  
  // Find the provider directly from AVAILABLE_MODELS
  const modelObj = AVAILABLE_MODELS.find(m => m.id === model);
  
  // Default provider and prefix if model not found
  let provider: string = 'openai'; // Default
  let prefix: string = "Be direct and precise with your instructions."; // Default prefix
  
  if (modelObj) {
    provider = modelObj.provider;
    
    // Set the prefix based on provider
    switch (provider) {
      case 'openai':
        prefix = "You are interacting with GPT. Be direct and precise.";
        break;
      case 'anthropic':
        prefix = "When working with Claude, provide structured input.";
        break;
      case 'groq':
        prefix = "For Llama/Mixtral models via Groq, use simple and clear language.";
        break;
    }
    
    console.log(`Using provider from model object: ${provider} for model: ${model}`);
  } else {
    console.log(`Model not found: ${model}, defaulting to OpenAI`);
  }
  
  const fullPrompt = `${systemPrompt}\n\n${prefix}\n\nOriginal prompt: ${prompt}`;
  console.log(`Using provider: ${provider} for model: ${model}`);

  let enhanced: string;

  try {
    switch (provider) {
      case 'openai':
        enhanced = await callOpenAI(fullPrompt, apiKey, model);
        break;
      case 'anthropic':
        enhanced = await callAnthropic(fullPrompt, apiKey, model);
        break;
      case 'groq':
        enhanced = await callGroq(fullPrompt, apiKey, model);
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