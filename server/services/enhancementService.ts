import { z } from 'zod';

// Define expected environment variables for API keys
const ApiKeysSchema = z.object({
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
});

// Define the structure for the enhancement result
interface EnhancementResult {
  enhanced: string;
  // Add metrics if you want to calculate them server-side
  // metrics: { clarity: number; specificity: number; context: number };
}

// Mapping from client-side model names to provider and API key env var name
const modelProviderMap: Record<string, { provider: 'openai' | 'anthropic' | 'groq', apiKeyEnv: keyof z.infer<typeof ApiKeysSchema>, modelName: string }> = {
  'gpt-4': { provider: 'openai', apiKeyEnv: 'OPENAI_API_KEY', modelName: 'gpt-4' }, // Adjust model name if needed
  'gpt-3.5': { provider: 'openai', apiKeyEnv: 'OPENAI_API_KEY', modelName: 'gpt-3.5-turbo' }, // Adjust model name if needed
  'claude': { provider: 'anthropic', apiKeyEnv: 'ANTHROPIC_API_KEY', modelName: 'claude-3-opus-20240229' }, // Adjust model name if needed
  'llama3': { provider: 'groq', apiKeyEnv: 'GROQ_API_KEY', modelName: 'llama3-70b-4096' }, // Adjust model name if needed
};

// --- Helper Functions for API Calls ---

async function callOpenAI(prompt: string, apiKey: string, modelName: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelName, // Use the specific model name
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("OpenAI Error:", response.status, errorBody);
    throw new Error(`OpenAI API call failed: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response structure from OpenAI API');
  }
  return data.choices[0].message.content;
}

async function callAnthropic(prompt: string, apiKey: string, modelName: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: modelName, // Use the specific model name
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024, // Anthropic requires max_tokens
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Anthropic Error:", response.status, errorBody);
    throw new Error(`Anthropic API call failed: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.content || !data.content[0] || !data.content[0].text) {
    throw new Error('Invalid response structure from Anthropic API');
  }
  return data.content[0].text;
}

// Note: Groq uses OpenAI's Chat Completions API format
async function callGroq(prompt: string, apiKey: string, modelName: string): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', { // Use the correct endpoint
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelName, // Use the specific model name
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Groq Error:", response.status, errorBody);
    throw new Error(`Groq API call failed: ${response.statusText}`);
  }

  const data = await response.json();
   if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response structure from Groq API');
  }
  return data.choices[0].message.content;
}

// --- Main Enhancement Service Function ---

export async function enhancePromptService(
  originalPrompt: string,
  model: string, // e.g., 'gpt-4', 'claude'
  systemPrompt: string
): Promise<EnhancementResult> {

  // Load and validate API keys from environment variables
  // In Cloudflare, these would be configured as secrets
  const envKeys = ApiKeysSchema.parse(process.env);

  const modelInfo = modelProviderMap[model];
  if (!modelInfo) {
    throw new Error(`Unsupported model specified: ${model}`);
  }

  const { provider, apiKeyEnv, modelName } = modelInfo;
  const apiKey = envKeys[apiKeyEnv];

  if (!apiKey) {
    throw new Error(`API key for ${provider} (${apiKeyEnv}) is not configured in environment variables.`);
  }

  // Construct the full prompt for the LLM
  // TODO: Implement meta-prompting here later if desired
  const fullPrompt = `${systemPrompt}\n\nOriginal prompt: ${originalPrompt}`;

  let enhanced: string;

  try {
    switch (provider) {
      case 'openai':
        enhanced = await callOpenAI(fullPrompt, apiKey, modelName);
        break;
      case 'anthropic':
        enhanced = await callAnthropic(fullPrompt, apiKey, modelName);
        break;
      case 'groq':
        enhanced = await callGroq(fullPrompt, apiKey, modelName);
        break;
      default:
        // Should be caught by modelProviderMap check earlier
        throw new Error('Unknown provider configured'); 
    }
  } catch (error) {
    console.error(`Error calling ${provider} API:`, error);
    // Re-throw or handle specific API errors more gracefully
    throw error; 
  }

  // TODO: Calculate metrics server-side if needed
  // const metrics = calculateServerSideMetrics(originalPrompt, enhanced);

  return {
    enhanced,
    // metrics,
  };
}

// Optional: Server-side metrics calculation
// function calculateServerSideMetrics(original: string, enhanced: string): { clarity: number; specificity: number; context: number } {
//   // Implement more robust metric calculation here
//   return { clarity: 0, specificity: 0, context: 0 };
// } 