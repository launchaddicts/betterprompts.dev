import type { ApiKeys } from "../context/ApiKeyContext";

// Log our provider keys to ensure they're correctly defined
console.log('Available provider keys:', Object.keys({openai: '', anthropic: '', groq: ''}));

// Define models and their required keys
export const AVAILABLE_MODELS: { id: string; name: string; provider: keyof ApiKeys }[] = [
    { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'anthropic' },
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', provider: 'anthropic' },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', provider: 'anthropic' },
    { id: 'llama3-70b-8192', name: 'Llama 3 (70b)', provider: 'groq' },
    { id: 'llama3-8b-8192', name: 'Llama 3 (8b)', provider: 'groq' },
    { id: 'mixtral-8x7b-32768', name: 'Mixtral (8x7b)', provider: 'groq' },
];

// Log each model with its provider for debugging
AVAILABLE_MODELS.forEach(model => {
    console.log(`Model: ${model.name}, Provider: ${model.provider}, Provider type: ${typeof model.provider}`);
});

// Helper to map model ID to provider key
export const getProviderForModel = (modelId: string): keyof ApiKeys | null => {
    console.log(`[models] getProviderForModel called with modelId: "${modelId}", type: ${typeof modelId}`);
    
    if (!modelId || typeof modelId !== 'string' || modelId.trim() === '') {
        console.log('[models] Empty or invalid modelId provided');
        return null;
    }
    
    const model = AVAILABLE_MODELS.find(m => m.id === modelId);
    
    if (model) {
        const providerKey = model.provider;
        console.log(`[models] Found provider for model ${modelId}: ${providerKey} (${typeof providerKey})`);
        return providerKey;
    } else {
        console.log(`[models] No provider found for model ${modelId}`);
        return null;
    }
};

// Helper to get a user-friendly name for a provider key
export const getProviderName = (providerKey: keyof ApiKeys): string => {
    switch (providerKey) {
        case 'openai': return 'OpenAI';
        case 'anthropic': return 'Anthropic';
        case 'groq': return 'Groq (Llama/Mixtral)';
        default: return 'Unknown Provider';
    }
}; 