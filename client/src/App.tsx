import { Button } from "@/components/ui/button";
import { Wand2, Settings2 } from "lucide-react";
import React, { useState, useEffect, useContext } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Link, Route, Switch, useLocation } from "wouter";
import HomePage from "./pages/home-page";
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
  const {
    apiKeys,
    setApiKeys,
    hasAnyKey,
    isSettingsOpen,
    providerToHighlight,
    openSettings,
    closeSettings,
    setIsSettingsOpen,
  } = useContext(ApiKeyContext);

  const popoverContentRef = React.useRef<HTMLDivElement>(null);

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
                  setIsSettingsOpen(true);
                  console.log(
                    "Settings popover opened, current highlight:",
                    providerToHighlight
                  );
                } else {
                  closeSettings();
                  console.log(
                    "Settings popover closed, keeping highlight:",
                    providerToHighlight
                  );
                }
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 absolute top-4 right-4 md:relative md:top-0 md:right-0"
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
                    {(
                      ["openai", "anthropic", "groq"] as Array<keyof ApiKeys>
                    ).map((provider) => {
                      const providerIsHighlighted =
                        String(provider) === String(providerToHighlight);
                      return (
                        <div
                          key={provider}
                          className={cn(
                            "space-y-1 p-3 rounded-md transition-all",
                            providerIsHighlighted
                              ? "bg-accent/20 dark:bg-accent/30 border-2 border-accent shadow-lg"
                              : ""
                          )}
                        >
                          <Label
                            htmlFor={provider}
                            className={cn(
                              providerIsHighlighted
                                ? "font-bold text-foreground dark:text-foreground"
                                : ""
                            )}
                          >
                            {getProviderName(provider)}
                            {providerIsHighlighted && (
                              <span className="ml-2 text-xs bg-purple-600 text-white font-bold px-2 py-1 rounded-md">
                                Required for selected model
                              </span>
                            )}
                          </Label>
                          <Input
                            id={provider}
                            value={apiKeys[provider]}
                            onChange={(e) =>
                              setApiKeys((prev) => ({
                                ...prev,
                                [provider]: e.target.value,
                              }))
                            }
                            className={cn(
                              "border-2 transition-colors",
                              providerIsHighlighted
                                ? "border-accent focus:ring-accent/50"
                                : "border-transparent"
                            )}
                            placeholder={`Enter ${getProviderName(
                              provider
                            )} API key`}
                          />
                        </div>
                      );
                    })}
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
          <HomePage />
        </main>

        {!hasAnyKey && <FloatingApiKeyInput />}
      </div>
    </div>
  );
}

export default App;
