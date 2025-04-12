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
  providerToHighlight: keyof ApiKeys | null;
  openSettings: (provider?: keyof ApiKeys) => void;
  closeSettings: () => void;
}

// Create the context with a default value
export const ApiKeyContext = createContext<ApiKeyContextProps>({
  apiKeys: { openai: "", anthropic: "", groq: "" },
  setApiKeys: () => {},
  hasAnyKey: false,
  isSettingsOpen: false,
  providerToHighlight: null,
  openSettings: () => {},
  closeSettings: () => {},
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
    console.log("[ApiKeyContext] openSettings called with provider:", provider);
    setProviderToHighlight(provider || null);
    setIsSettingsOpen(true);
    console.log(
      "[ApiKeyContext] State updated: isSettingsOpen=true, providerToHighlight=",
      provider || null
    );
  }, []);

  // Function to close settings and clear highlight
  const closeSettings = useCallback(() => {
    console.log("[ApiKeyContext] closeSettings called");
    setIsSettingsOpen(false);
    setProviderToHighlight(null);
    console.log(
      "[ApiKeyContext] State updated: isSettingsOpen=false, providerToHighlight=null"
    );
  }, []);

  // Check if any key is valid using the validation function
  const hasAnyKey = Object.entries(apiKeys).some(([provider, key]) =>
    isValidApiKey(key, provider as keyof ApiKeys)
  );

  return (
    <ApiKeyContext.Provider
      value={{
        apiKeys,
        setApiKeys: handleSetApiKeys,
        hasAnyKey,
        isSettingsOpen,
        providerToHighlight,
        openSettings,
        closeSettings,
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
};
