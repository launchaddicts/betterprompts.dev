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
  },
  'gpt-3.5': {
    prefix: "For GPT-3.5, break down complex requests.",
    contextLevel: "medium",
  },
  'claude': {
    prefix: "When working with Claude, provide structured input.",
    contextLevel: "high",
  },
  'llama': {
    prefix: "For Llama models, use simple and clear language.",
    contextLevel: "low",
  },
};

export async function enhancePrompt(
  prompt: string,
  model: string
): Promise<EnhancementResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const rules = modelRules[model as keyof typeof modelRules];
  const enhanced = `${rules.prefix}\n\n${enhanceWithRules(prompt, rules)}`;

  return {
    enhanced,
    metrics: calculateMetrics(prompt, enhanced),
  };
}

function enhanceWithRules(prompt: string, rules: typeof modelRules[keyof typeof modelRules]): string {
  let enhanced = prompt;

  // Add structure
  enhanced = enhanced.trim();
  if (!enhanced.endsWith('.')) {
    enhanced += '.';
  }

  // Add context based on model
  if (rules.contextLevel === 'high') {
    enhanced = `Context: This is a prompt for an AI model.\nObjective: Generate high-quality output.\n\nPrompt: ${enhanced}`;
  }

  return enhanced;
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
