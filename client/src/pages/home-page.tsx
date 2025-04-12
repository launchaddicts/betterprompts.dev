import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Settings2, Share2, Edit, Copy, Check } from "lucide-react";
import { PromptEditor } from "../components/PromptEditor";
import { ModelSelector } from "../components/ModelSelector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useState, useEffect, useContext } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { improvementTemplates } from "../lib/templates";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLocation } from "wouter";
import { ApiKeyContext } from "../context/ApiKeyContext";
import { AVAILABLE_MODELS, getProviderName } from "../lib/models";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { enhancePrompt } from "../lib/enhance";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function HomePage() {
  const [prompt, setPrompt] = useState("");
  const {
    apiKeys,
    openSettings,
    openSettingsForOpenAI,
    openSettingsForAnthropic,
    openSettingsForGroq,
  } = useContext(ApiKeyContext);
  const [selectedModel, setSelectedModel] = useState(() => {
    const initialModel = "gpt-4o";
    const initialModelObj = AVAILABLE_MODELS.find((m) => m.id === initialModel);
    const provider = initialModelObj?.provider;
    if (provider && apiKeys[provider] && apiKeys[provider].trim() !== "") {
      return initialModel;
    }
    const firstAvailable = AVAILABLE_MODELS.find(
      (m) => apiKeys[m.provider] && apiKeys[m.provider].trim() !== ""
    );
    if (firstAvailable) {
      return firstAvailable.id;
    }
    return initialModel;
  });
  const [selectedTemplateId, setSelectedTemplateId] = useState("general");
  const [editedTemplates, setEditedTemplates] = useState<
    Record<string, string>
  >({});
  const [enhancedOutput, setEnhancedOutput] = useState("");
  const [metrics, setMetrics] = useState({
    clarity: 0,
    specificity: 0,
    context: 0,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleModelChange = (model: string) => {
    if (!model || model.trim() === "") return;
    const modelObj = AVAILABLE_MODELS.find((m) => m.id === model);
    if (!modelObj) return;
    setSelectedModel(model);
    localStorage.setItem("selected_model", model);
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    localStorage.setItem("selected_template_id", templateId);
  };

  const handleTemplateEdit = (templateId: string, newPrompt: string) => {
    setEditedTemplates((prev) => {
      const updated = { ...prev, [templateId]: newPrompt };
      localStorage.setItem("edited_templates", JSON.stringify(updated));
      return updated;
    });
  };

  const getSystemPrompt = () => {
    return (
      editedTemplates[selectedTemplateId] ||
      improvementTemplates.find((t) => t.id === selectedTemplateId)
        ?.systemPrompt ||
      improvementTemplates[0].systemPrompt
    );
  };

  const handleImprove = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Please enter a prompt first",
        variant: "destructive",
        duration: 1500,
      });
      return;
    }

    if (process.env.NODE_ENV === "development") {
      console.log("[DEV MODE] Simulating API call...");
      setIsProcessing(true);
      setEnhancedOutput("");

      await new Promise((resolve) => setTimeout(resolve, 2000));

      setEnhancedOutput(
        `[DEV MOCK] This is the enhanced version of your prompt: "${prompt}". It has been improved for clarity and specificity using the ${selectedModel} model.`
      );
      setMetrics({ clarity: 85, specificity: 75, context: 90 });
      setIsProcessing(false);
      toast({ title: "Prompt Enhanced! (Mock)", duration: 1500 });
      return;
    }

    const modelObj = AVAILABLE_MODELS.find((m) => m.id === selectedModel);
    const provider = modelObj?.provider;
    const currentApiKey = provider ? apiKeys[provider] : null;

    if (!provider || !currentApiKey) {
      toast({
        title: `API Key Missing`,
        description: `Please add an API key for ${getProviderName(
          provider || "openai"
        )} in Settings (⚙️).`,
        variant: "destructive",
        duration: 2000,
      });
      switch (provider) {
        case "openai":
          openSettingsForOpenAI();
          break;
        case "anthropic":
          openSettingsForAnthropic();
          break;
        case "groq":
          openSettingsForGroq();
          break;
        default:
          openSettings();
          break;
      }
      return;
    }

    setIsProcessing(true);
    setEnhancedOutput("");

    try {
      const result = await enhancePrompt(
        prompt,
        selectedModel,
        currentApiKey,
        getSystemPrompt()
      );
      setEnhancedOutput(result.enhanced);
      setMetrics(result.metrics);
      toast({
        title: "Prompt Enhanced!",
        duration: 1500,
      });
    } catch (error) {
      console.error("Enhancement failed:", error);
      toast({
        title: "Enhancement Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
        duration: 2000,
      });
      setEnhancedOutput("");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (enhancedOutput) {
      navigator.clipboard.writeText(enhancedOutput);
      setCopied(true);
      toast({ title: "Copied to clipboard", duration: 1500 });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    if (enhancedOutput) {
      if (navigator.share) {
        navigator
          .share({
            title: "Enhanced Prompt from BetterPrompts.dev",
            text: enhancedOutput,
          })
          .catch((error) => {
            console.error("Error sharing:", error);
            toast({
              title: "Couldn't share directly",
              description: "Copied to clipboard instead.",
              duration: 2000,
            });
            navigator.clipboard.writeText(enhancedOutput);
          });
      } else {
        navigator.clipboard.writeText(enhancedOutput);
        toast({
          title: "Copied to clipboard",
          description: "Web Share API not supported.",
          duration: 2000,
        });
      }
    }
  };

  const handleSocialShare = (platform: "twitter" | "reddit" | "email") => {
    if (!enhancedOutput) {
      toast({ title: "Nothing to share", duration: 1500 });
      return;
    }

    const textToShare = `Check out this enhanced prompt I created with betterprompts.dev:

${enhancedOutput}

#AI #PromptEngineering`;
    const encodedText = encodeURIComponent(textToShare);
    const siteUrl = encodeURIComponent(window.location.href); // Or your app's canonical URL

    let shareUrl = "";

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
        break;
      case "reddit":
        // Reddit needs a title and the body (text)
        const title = encodeURIComponent(
          "Enhanced AI Prompt from betterprompts.dev"
        );
        shareUrl = `https://www.reddit.com/submit?url=${siteUrl}&title=${title}&text=${encodedText}`;
        break;
      case "email":
        const subject = encodeURIComponent("Check out this Enhanced AI Prompt");
        shareUrl = `mailto:?subject=${subject}&body=${encodedText}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    } else {
      // Fallback or error handling if platform unknown (shouldn't happen with TS)
      handleShare(); // Use generic share as fallback
    }
  };

  const handleStartNew = () => {
    setEnhancedOutput("");
    setPrompt("");
    setMetrics({ clarity: 0, specificity: 0, context: 0 });
    setIsProcessing(false);
  };

  return (
    <div className="flex flex-col space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between pt-4">
        <h2 className="text-3xl font-bold text-foreground">
          What do you want to build today?
        </h2>
      </div>

      <Card className="p-6 bg-card border-border shadow-lg min-h-[400px] flex flex-col">
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-grow rounded-md border animate-shimmer"
            />
          ) : enhancedOutput ? (
            <motion.div
              key="output"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-grow flex flex-col space-y-4"
            >
              <h3 className="text-lg font-semibold mb-2">Enhanced Prompt:</h3>
              <ScrollArea className="flex-grow rounded-md border p-4 bg-muted">
                <pre className="font-mono text-sm whitespace-pre-wrap">
                  {enhancedOutput}
                </pre>
              </ScrollArea>
              <div className="flex justify-between items-center pt-2">
                <Button variant="outline" size="sm" onClick={handleStartNew}>
                  Start New Prompt
                </Button>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span className="ml-2">Copy</span>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4" />
                        <span className="ml-2">Share</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleSocialShare("twitter")}
                      >
                        Share on X (Twitter)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleSocialShare("reddit")}
                      >
                        Share on Reddit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleSocialShare("email")}
                      >
                        Share via Email
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleShare}>
                        Other (Use System Share)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-grow flex flex-col space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5 md:col-span-1">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Model
                  </Label>
                  <div
                    onClick={() => {
                      const model = AVAILABLE_MODELS.find(
                        (m) => m.id === selectedModel
                      );
                      if (model) {
                        switch (model.provider) {
                          case "openai":
                            openSettingsForOpenAI();
                            break;
                          case "anthropic":
                            openSettingsForAnthropic();
                            break;
                          case "groq":
                            openSettingsForGroq();
                            break;
                          default:
                            openSettings();
                        }
                      } else {
                        openSettings();
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <ModelSelector
                      model={selectedModel}
                      onModelChange={handleModelChange}
                    />
                  </div>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Improvement Style
                  </Label>
                  <div className="flex gap-2">
                    <Select
                      value={selectedTemplateId}
                      onValueChange={handleTemplateChange}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select an improvement style..." />
                      </SelectTrigger>
                      <SelectContent>
                        {improvementTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => setTemplateDialogOpen(true)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit Template</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View & Edit Template</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>

              <PromptEditor value={prompt} onChange={setPrompt} />

              <div className="flex justify-end">
                <Button
                  onClick={handleImprove}
                  disabled={isProcessing}
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Wand2 className="h-4 w-4" />
                  Improve prompt
                </Button>
              </div>

              <Dialog
                open={templateDialogOpen}
                onOpenChange={setTemplateDialogOpen}
              >
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>
                      {improvementTemplates.find(
                        (t) => t.id === selectedTemplateId
                      )?.name || "Template"}{" "}
                      Details
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <p
                        className="text-sm text-muted-foreground"
                        id="description"
                      >
                        {
                          improvementTemplates.find(
                            (t) => t.id === selectedTemplateId
                          )?.description
                        }
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="template-content">System Prompt</Label>
                      <Textarea
                        id="template-content"
                        className="font-mono text-sm min-h-[200px]"
                        value={
                          editedTemplates[selectedTemplateId] ||
                          improvementTemplates.find(
                            (t) => t.id === selectedTemplateId
                          )?.systemPrompt ||
                          ""
                        }
                        onChange={(e) =>
                          handleTemplateEdit(selectedTemplateId, e.target.value)
                        }
                        placeholder="Enter your custom system prompt..."
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        This prompt guides the AI in improving your input.
                      </p>
                    </div>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        /* Reset logic */
                      }}
                    >
                      Reset
                    </Button>
                    <Button
                      onClick={() => {
                        setTemplateDialogOpen(false); /* Save confirmation */
                      }}
                    >
                      Save & Close
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
