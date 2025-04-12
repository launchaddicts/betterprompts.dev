import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useContext } from "react";
import { ApiKeyContext, ApiKeys } from "../context/ApiKeyContext";
import { AVAILABLE_MODELS } from "../lib/models"; // Import from shared file
import { Lock, Check } from "lucide-react"; // Import Lock and Check icons

// Development mode flag - must match the one in ApiKeyContext
const DEV_MODE = true;

// Function to validate API key format - duplicated from ApiKeyContext
const isValidApiKey = (key: string, provider: keyof ApiKeys): boolean => {
  if (DEV_MODE) {
    return key.trim().length > 0;
  }

  switch (provider) {
    case "openai":
      return key.startsWith("sk-");
    case "anthropic":
      return key.startsWith("sk-ant-");
    case "groq":
      return key.startsWith("gsk_");
    default:
      return false;
  }
};

// Define models and their required keys
// const AVAILABLE_MODELS: { id: string; name: string; provider: keyof ApiKeys }[] = [
//   { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
//   { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
//   { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai' },
//   { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'anthropic' },
//   { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', provider: 'anthropic' },
//   { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', provider: 'anthropic' },
//   { id: 'llama3-70b-8192', name: 'Llama 3 (70b)', provider: 'groq' },
//   { id: 'llama3-8b-8192', name: 'Llama 3 (8b)', provider: 'groq' },
//   { id: 'mixtral-8x7b-32768', name: 'Mixtral (8x7b)', provider: 'groq' },
// ];

interface ModelSelectorProps {
  model: string;
  onModelChange: (model: string) => void;
}

export function ModelSelector({ model, onModelChange }: ModelSelectorProps) {
  const {
    apiKeys,
    openSettingsForOpenAI,
    openSettingsForAnthropic,
    openSettingsForGroq,
  } = useContext(ApiKeyContext);

  // Count how many models are available per provider
  const modelsByProvider = AVAILABLE_MODELS.reduce((acc, model) => {
    acc[model.provider] = (acc[model.provider] || 0) + 1;
    return acc;
  }, {} as Record<keyof ApiKeys, number>);

  // Count how many valid API keys we have
  const validProviders = Object.entries(apiKeys).reduce((acc, [provider, key]) => {
    if (isValidApiKey(key, provider as keyof ApiKeys)) {
      acc.push(provider as keyof ApiKeys);
    }
    return acc;
  }, [] as (keyof ApiKeys)[]);

  // Get the currently selected model's provider
  const selectedModelProvider = AVAILABLE_MODELS.find(m => m.id === model)?.provider;

  // Function to open settings for a specific provider
  const openSettingsForProvider = (provider: keyof ApiKeys) => {
    console.log(`Opening settings for ${provider}`);
    if (provider === "openai") {
      openSettingsForOpenAI();
    } else if (provider === "anthropic") {
      openSettingsForAnthropic();
    } else if (provider === "groq") {
      openSettingsForGroq();
    }
  };

  return (
    <div className="w-full">
      <Select value={model} onValueChange={onModelChange}>
        <SelectTrigger id="model-select">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          {/* Group models by provider */}
          {(["openai", "anthropic", "groq"] as const).map(provider => {
            const hasValidKey = isValidApiKey(apiKeys[provider], provider);
            const modelsForProvider = AVAILABLE_MODELS.filter(m => m.provider === provider);
            
            // Skip providers with no models
            if (modelsForProvider.length === 0) return null;
            
            return (
              <div key={provider} className="py-2">
                {/* Provider header with status indicator */}
                <div className="px-2 py-1.5 text-sm font-semibold flex items-center justify-between">
                  <span>{provider.charAt(0).toUpperCase() + provider.slice(1)}</span>
                  
                  {/* API key status and settings button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openSettingsForProvider(provider);
                    }}
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      hasValidKey 
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-red-100 text-red-800 hover:bg-red-200"
                    }`}
                  >
                    {hasValidKey ? (
                      <span className="flex items-center">
                        <Check className="h-3 w-3 mr-1" /> 
                        API Key
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Lock className="h-3 w-3 mr-1" /> 
                        Add API Key
                      </span>
                    )}
                  </button>
                </div>
                
                {/* Models for this provider */}
                {modelsForProvider.map(m => (
                  <SelectItem
                    key={m.id}
                    value={m.id}
                    disabled={!hasValidKey}
                    className={`pl-4 ${!hasValidKey ? "opacity-50" : ""}`}
                  >
                    {m.name}
                  </SelectItem>
                ))}
              </div>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
