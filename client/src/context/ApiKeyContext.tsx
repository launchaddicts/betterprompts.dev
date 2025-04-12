import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
  useCallback,
} from "react";

// Development mode flag - set to true to accept any non-empty string as valid key
const DEV_MODE = true;

// Define the shape of the API keys object
export interface ApiKeys {
  openai: string;
  anthropic: string;
  groq: string;
}

// Define the shape of the context data
interface ApiKeyContextProps {
  apiKeys: ApiKeys;
  setApiKeys: Dispatch<SetStateAction<ApiKeys>>;
  // Helper to check if at least one key exists
  hasAnyKey: boolean;
  isSettingsOpen: boolean;
  setIsSettingsOpen: Dispatch<SetStateAction<boolean>>;
  providerToHighlight: keyof ApiKeys | null;
  openSettings: (provider?: keyof ApiKeys) => void;
  closeSettings: () => void;
  // Direct provider-specific methods to avoid type issues
  openSettingsForOpenAI: () => void;
  openSettingsForAnthropic: () => void;
  openSettingsForGroq: () => void;
}

// Create the context with a default value
export const ApiKeyContext = createContext<ApiKeyContextProps>({
  apiKeys: { openai: "", anthropic: "", groq: "" },
  setApiKeys: () => {},
  hasAnyKey: false,
  isSettingsOpen: false,
  setIsSettingsOpen: () => {},
  providerToHighlight: null,
  openSettings: () => {},
  closeSettings: () => {},
  openSettingsForOpenAI: () => {},
  openSettingsForAnthropic: () => {},
  openSettingsForGroq: () => {},
});

// Define the props for the provider component
interface ApiKeyProviderProps {
  children: ReactNode;
}

// Local storage keys
const STORAGE_KEYS: { [K in keyof ApiKeys]: string } = {
  openai: "promptImproverApiKey_openai",
  anthropic: "promptImproverApiKey_anthropic",
  groq: "promptImproverApiKey_groq",
};

// Function to validate API key format
const isValidApiKey = (key: string, provider: keyof ApiKeys): boolean => {
  if (DEV_MODE) {
    return key.trim().length > 0; // In dev mode, accept any non-empty string
  }

  // Production validation
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

// Create the provider component
export const ApiKeyProvider: React.FC<ApiKeyProviderProps> = ({ children }) => {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openai: "",
    anthropic: "",
    groq: "",
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [providerToHighlight, setProviderToHighlight] = useState<
    keyof ApiKeys | null
  >(null);

  // Load API key from local storage on initial render
  useEffect(() => {
    const loadedKeys: ApiKeys = {
      openai: localStorage.getItem(STORAGE_KEYS.openai) || "",
      anthropic: localStorage.getItem(STORAGE_KEYS.anthropic) || "",
      groq: localStorage.getItem(STORAGE_KEYS.groq) || "",
    };
    setApiKeys(loadedKeys);
  }, []);

  // Update local storage whenever API key changes
  const handleSetApiKeys: Dispatch<SetStateAction<ApiKeys>> = (valueOrFn) => {
    setApiKeys((prevKeys) => {
      const newKeys =
        typeof valueOrFn === "function" ? valueOrFn(prevKeys) : valueOrFn;
      // Save each key to local storage
      (Object.keys(newKeys) as Array<keyof ApiKeys>).forEach((key) => {
        if (newKeys[key] !== prevKeys[key]) {
          // Only save if changed
          localStorage.setItem(STORAGE_KEYS[key], newKeys[key]);
        }
      });
      return newKeys;
    });
  };

  // Function to open settings, optionally setting a provider to highlight
  const openSettings = useCallback((provider?: keyof ApiKeys) => {
    console.log(
      "[ApiKeyContext] openSettings called with provider:",
      provider,
      typeof provider
    );

    // Provider highlighting with strong type checking
    if (provider && typeof provider === "string") {
      // Force string value for clarity in logs
      const providerString = String(provider);
      console.log(
        `[ApiKeyContext] Setting highlight to string value: "${providerString}"`
      );

      // Type guard to ensure it's a valid provider key
      if (
        providerString === "anthropic" ||
        providerString === "openai" ||
        providerString === "groq"
      ) {
        setProviderToHighlight(providerString as keyof ApiKeys);
        console.log(
          `[ApiKeyContext] Provider highlight set to: ${providerString}`
        );
      } else {
        console.log(
          `[ApiKeyContext] Invalid provider value: ${providerString}`
        );
        setProviderToHighlight(null);
      }
    } else {
      console.log("[ApiKeyContext] No provider specified, clearing highlight");
      setProviderToHighlight(null);
    }

    // Open settings panel
    setIsSettingsOpen(true);
  }, []);

  // Function to close settings but don't clear the highlight
  const closeSettings = useCallback(() => {
    console.log(
      "[ApiKeyContext] closeSettings called, current highlight:",
      providerToHighlight
    );

    // Just close the panel, but preserve the highlight for next time
    setIsSettingsOpen(false);

    // We explicitly DO NOT clear the highlight here:
    // setProviderToHighlight(null);

    // This allows the highlight to persist between openings of the settings panel
    // so when a user selects a model, the appropriate provider will remain highlighted
  }, [providerToHighlight]);

  // Check if any key is valid using the validation function
  const hasAnyKey = Object.entries(apiKeys).some(([provider, key]) =>
    isValidApiKey(key, provider as keyof ApiKeys)
  );

  // Direct setter methods for each provider
  const openSettingsForOpenAI = useCallback(() => {
    console.log("[ApiKeyContext] Direct call to openSettingsForOpenAI");
    setProviderToHighlight("openai");
    setIsSettingsOpen(true);
  }, []);

  const openSettingsForAnthropic = useCallback(() => {
    console.log("[ApiKeyContext] Direct call to openSettingsForAnthropic");
    setProviderToHighlight("anthropic");
    setIsSettingsOpen(true);
  }, []);

  const openSettingsForGroq = useCallback(() => {
    console.log("[ApiKeyContext] Direct call to openSettingsForGroq");
    setProviderToHighlight("groq");
    setIsSettingsOpen(true);
  }, []);

  return (
    <ApiKeyContext.Provider
      value={{
        apiKeys,
        setApiKeys: handleSetApiKeys,
        hasAnyKey,
        isSettingsOpen,
        setIsSettingsOpen,
        providerToHighlight,
        openSettings,
        closeSettings,
        openSettingsForOpenAI,
        openSettingsForAnthropic,
        openSettingsForGroq,
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
};
