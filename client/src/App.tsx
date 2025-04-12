import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Settings2, User, Share2 } from "lucide-react";
import { PromptEditor } from "./components/PromptEditor";
import { ModelSelector } from "./components/ModelSelector";
import { TemplateSelector } from "./components/TemplateSelector";
import React, { useState, useEffect, useContext } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedOutput } from "./components/EnhancedOutput";
import { improvementTemplates } from "./lib/templates";
import { Link, Route, Switch, useLocation } from "wouter";
import HomePage from "./pages/home-page";
import AuthPage from "./pages/auth-page";
import CommunityPage from "./pages/community-page";
import SharedPromptPage from "./pages/shared-prompt-page";
import MyPromptsPage from "./pages/my-prompts-page";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import {
  ApiKeyProvider,
  ApiKeyContext,
  ApiKeys,
} from "./context/ApiKeyContext";
import { FloatingApiKeyInput } from "./components/FloatingApiKeyInput";
import { cn } from "./lib/utils";
import { getProviderName } from "./lib/models";

function App() {
  return (
    <ApiKeyProvider>
      <AppContent />
    </ApiKeyProvider>
  );
}

function AppContent() {
  const [location] = useLocation();
  const {
    apiKeys,
    setApiKeys,
    hasAnyKey,
    isSettingsOpen,
    providerToHighlight,
    openSettings,
    closeSettings,
  } = useContext(ApiKeyContext);

  // Log the providerToHighlight whenever it changes
  useEffect(() => {
    console.log("Provider to highlight:", providerToHighlight);
  }, [providerToHighlight]);

  const popoverContentRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    if (providerToHighlight) {
      timeoutId = setTimeout(() => {
        // Optional: Could re-trigger closeSettings here if we want it to auto-close
        // closeSettings(); // Currently commented out, so highlight should persist
      }, 1500); // Remove highlight after 1.5 seconds (if uncommented)
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [providerToHighlight, closeSettings]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4">
        <nav className="flex items-center justify-between mb-8 border-b border-border pb-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold hover:opacity-90 transition-opacity"
          >
            <div className="relative">
              <div className="text-2xl font-extrabold tracking-tighter">
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  better
                </span>
                <span className="text-foreground">prompts</span>
                <span className="absolute -top-1 -right-3 text-xs text-purple-300/80 font-medium">
                  .dev
                </span>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Popover
              open={isSettingsOpen}
              onOpenChange={(open) => {
                if (open) {
                  openSettings();
                } else {
                  closeSettings();
                }
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 absolute top-2 right-2"
                >
                  <Settings2 className="h-4 w-4" />
                  <span className="sr-only">Settings</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" ref={popoverContentRef}>
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">API Keys</h4>
                    <p className="text-sm text-muted-foreground">
                      Enter keys for the providers you want to use.
                    </p>
                  </div>
                  <div className="grid gap-4">
                    {["openai", "anthropic", "groq"].map((provider) => (
                      <div key={provider} className="space-y-1">
                        <Label htmlFor={provider}>
                          {getProviderName(provider as keyof ApiKeys)}
                        </Label>
                        <Input
                          id={provider}
                          value={apiKeys[provider as keyof ApiKeys]}
                          onChange={(e) =>
                            setApiKeys((prev) => ({
                              ...prev,
                              [provider]: e.target.value,
                            }))
                          }
                          className={cn(
                            "border-2 transition-colors",
                            providerToHighlight === provider
                              ? "border-yellow-500"
                              : "border-transparent"
                          )}
                          placeholder={`Enter ${getProviderName(
                            provider as keyof ApiKeys
                          )} API key`}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    🔒 Your API keys are stored securely in your browser's local
                    storage.
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </nav>

        <main>
          <Switch>
            <Route path="/" component={HomePage} />
            {/* Remove other routes - maybe add later if needed */}
            {/* Example: Fallback for unknown routes */}
            {/* <Route>
                 <p>Page not found</p>
               </Route> */}
          </Switch>
        </main>

        {!hasAnyKey && <FloatingApiKeyInput />}
      </div>
    </div>
  );
}

export default App;
