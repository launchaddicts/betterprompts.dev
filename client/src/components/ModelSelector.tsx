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
import { Lock } from "lucide-react"; // Import Lock icon

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
  const { apiKeys, openSettings } = useContext(ApiKeyContext);

  // Filter models based on available keys
  // const filteredModels = AVAILABLE_MODELS.filter(
  //   (m) => apiKeys[m.provider]?.trim() !== ""
  // );
  // const hasModels = filteredModels.length > 0;

  // Determine if any API key is present and valid
  const hasAnyValidKey = Object.entries(apiKeys).some(([provider, key]) =>
    isValidApiKey(key, provider as keyof ApiKeys)
  );

  return (
    <div className="w-full">
      <Select value={model} onValueChange={onModelChange}>
        <SelectTrigger id="model-select">
          <SelectValue
            placeholder={
              hasAnyValidKey ? "Select a model" : "Add API Key in Settings"
            }
          />
        </SelectTrigger>
        <SelectContent>
          {AVAILABLE_MODELS.map((m) => {
            const hasValidKey = isValidApiKey(apiKeys[m.provider], m.provider);

            return (
              <SelectItem
                key={m.id}
                value={m.id}
                disabled={!hasValidKey}
                className="transition-all duration-150"
                onClick={(e) => {
                  if (!hasValidKey) {
                    e.preventDefault();
                    e.stopPropagation();
                    openSettings(m.provider);
                  }
                }}
              >
                <div
                  className="flex items-center space-x-2"
                  onClick={(e) => {
                    if (!hasValidKey) {
                      e.preventDefault();
                      e.stopPropagation();
                      openSettings(m.provider);
                    }
                  }}
                >
                  {!hasValidKey && (
                    <Lock
                      size={14}
                      className="text-muted-foreground cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openSettings(m.provider);
                      }}
                    />
                  )}
                  <span>{m.name}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
