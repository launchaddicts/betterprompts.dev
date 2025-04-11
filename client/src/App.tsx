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
                if (!open) {
                  closeSettings();
                }
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:text-primary focus-visible:ring-1 focus-visible:ring-ring"
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
                    <div className="grid gap-2">
                      <Label htmlFor="openai-key" className="text-xs">
                        OpenAI
                      </Label>
                      <Input
                        id="openai-key"
                        type="password"
                        placeholder="sk-..."
                        value={apiKeys.openai}
                        onChange={(e) =>
                          setApiKeys((prev) => ({
                            ...prev,
                            openai: e.target.value,
                          }))
                        }
                        className={cn(
                          "font-mono transition-all duration-300 ease-in-out",
                          providerToHighlight === "openai" &&
                            "outline outline-2 outline-offset-2 outline-primary ring-2 ring-primary/50 animate-pulse"
                        )}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="anthropic-key" className="text-xs">
                        Anthropic
                      </Label>
                      <Input
                        id="anthropic-key"
                        type="password"
                        placeholder="sk-ant-..."
                        value={apiKeys.anthropic}
                        onChange={(e) =>
                          setApiKeys((prev) => ({
                            ...prev,
                            anthropic: e.target.value,
                          }))
                        }
                        className={cn(
                          "font-mono transition-all duration-300 ease-in-out",
                          providerToHighlight === "anthropic" &&
                            "outline outline-2 outline-offset-2 outline-primary ring-2 ring-primary/50 animate-pulse"
                        )}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="groq-key" className="text-xs">
                        Groq (Llama)
                      </Label>
                      <Input
                        id="groq-key"
                        type="password"
                        placeholder="gsk_..."
                        value={apiKeys.groq}
                        onChange={(e) =>
                          setApiKeys((prev) => ({
                            ...prev,
                            groq: e.target.value,
                          }))
                        }
                        className={cn(
                          "font-mono transition-all duration-300 ease-in-out",
                          providerToHighlight === "groq" &&
                            "outline outline-2 outline-offset-2 outline-primary ring-2 ring-primary/50 animate-pulse"
                        )}
                      />
                    </div>
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
