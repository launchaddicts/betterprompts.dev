import React, { useState, Dispatch, SetStateAction } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KeyRound, X } from "lucide-react";
import type { ApiKeys } from "../context/ApiKeyContext"; // Import ApiKeys type

export function FloatingApiKeyInput() {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null; // Don't render if dismissed
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-lg bg-popover border-border relative">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-foreground"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>

        <CardHeader className="pr-10">
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            API Key Required
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Please add an API key in Settings (top-right icon) to get better
            prompts.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
