import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useContext } from "react";
import { ApiKeyContext, ApiKeys } from "../context/ApiKeyContext";
import { AVAILABLE_MODELS } from "../lib/models"; // Import from shared file
import { Lock } from "lucide-react"; // Import Lock icon
import { Button } from "@/components/ui/button";

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

  // Determine if any API key is present and valid
  const hasAnyValidKey = Object.entries(apiKeys).some(([provider, key]) =>
    isValidApiKey(key, provider as keyof ApiKeys)
  );

  const handleModelSelection = (selectedModelId: string) => {
    console.log(`Model selected: ${selectedModelId}`);
    onModelChange(selectedModelId);
  };

  // Group models by provider
  const modelsByProvider: Record<keyof ApiKeys, typeof AVAILABLE_MODELS> = {
    openai: [],
    anthropic: [],
    groq: [],
  };

  AVAILABLE_MODELS.forEach((model) => {
    modelsByProvider[model.provider].push(model);
  });

  return (
    <div className="w-full">
      <Select value={model} onValueChange={handleModelSelection}>
        <SelectTrigger id="model-select">
          <SelectValue
            placeholder={
              hasAnyValidKey ? "Select a model" : "Add API Key in Settings"
            }
          />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(modelsByProvider) as Array<keyof ApiKeys>).map(
            (provider) => {
              if (modelsByProvider[provider].length === 0) return null;

              const hasValidKey = isValidApiKey(apiKeys[provider], provider);

              return (
                <SelectGroup key={provider}>
                  <SelectLabel className="flex items-center justify-between px-2 py-1">
                    <span>
                      {provider.charAt(0).toUpperCase() + provider.slice(1)}
                    </span>
                    {!hasValidKey && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 rounded-full text-xs py-0 px-2 hover:bg-accent hover:text-white transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (provider === "openai") {
                            openSettingsForOpenAI();
                          } else if (provider === "anthropic") {
                            openSettingsForAnthropic();
                          } else if (provider === "groq") {
                            openSettingsForGroq();
                          }
                        }}
                      >
                        <Lock className="h-3 w-3 mr-1" />
                        Add API Key
                      </Button>
                    )}
                  </SelectLabel>

                  {modelsByProvider[provider].map((m) => (
                    <SelectItem
                      key={m.id}
                      value={m.id}
                      className="pl-6"
                      disabled={!hasValidKey}
                      onClick={(e) => {
                        if (!hasValidKey) {
                          e.preventDefault();
                          e.stopPropagation();

                          // Open the settings for this specific provider
                          if (m.provider === "openai") {
                            openSettingsForOpenAI();
                          } else if (m.provider === "anthropic") {
                            openSettingsForAnthropic();
                          } else if (m.provider === "groq") {
                            openSettingsForGroq();
                          }
                        }
                      }}
                    >
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              );
            }
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
