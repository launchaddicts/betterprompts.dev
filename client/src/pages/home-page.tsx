import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Settings2, Edit, Copy, Check, Share2 } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

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
    const initialModel = localStorage.getItem("selected_model") || "gpt-4o";
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
  const [selectedTemplateId, setSelectedTemplateId] = useState(() => {
    return localStorage.getItem("selected_template_id") || "general";
  });
  const [editedTemplates, setEditedTemplates] = useState<
    Record<string, string>
  >(() => {
    const saved = localStorage.getItem("edited_templates");
    return saved ? JSON.parse(saved) : {};
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [enhancedOutput, setEnhancedOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  useEffect(() => {
    const tempPrompt = localStorage.getItem("temp_prompt");
    if (tempPrompt) {
      setPrompt(tempPrompt);
      localStorage.removeItem("temp_prompt");
      localStorage.removeItem("temp_system_prompt");
      localStorage.removeItem("temp_model");
      toast({ title: "Shared prompt loaded into editor", duration: 2000 });
    }
  }, [toast]);

  const handleModelChange = (model: string) => {
    if (!model || model.trim() === "") return;
    const modelObj = AVAILABLE_MODELS.find((m) => m.id === model);
    if (!modelObj) return;

    setSelectedModel(model);
    localStorage.setItem("selected_model", model);

    const provider = modelObj.provider;
    console.log(
      `[HomePage] Model changed to ${model}, setting provider highlight to: ${provider}`
    );

    if (provider === "openai") {
      openSettingsForOpenAI();
    } else if (provider === "anthropic") {
      openSettingsForAnthropic();
    } else if (provider === "groq") {
      openSettingsForGroq();
    }
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
        )} in Settings (top-right icon).`,
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
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartNew = () => {
    setPrompt("");
    setEnhancedOutput("");
    setIsProcessing(false);
    localStorage.removeItem("temp_prompt");
    localStorage.removeItem("temp_system_prompt");
    localStorage.removeItem("temp_model");
  };

  const handleCopy = () => {
    if (enhancedOutput) {
      navigator.clipboard.writeText(enhancedOutput);
      setCopied(true);
      toast({ title: "Copied to clipboard", duration: 1500 });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col space-y-6 max-w-3xl mx-auto py-8">
      <Card className="bg-card border-border shadow-lg">
        <div className="p-6 space-y-6">
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

          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-h-[200px] flex items-center justify-center"
              >
                <div className="w-full h-48 rounded-md animate-shimmer bg-muted" />
              </motion.div>
            ) : enhancedOutput ? (
              <motion.div
                key="output"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold">Enhanced Prompt:</h3>
                <ScrollArea className="h-60 rounded-md border p-4 bg-muted">
                  <pre className="font-mono text-sm whitespace-pre-wrap">
                    {enhancedOutput}
                  </pre>
                </ScrollArea>
                <div className="flex justify-between items-center pt-4 border-t">
                  <Button variant="outline" size="sm" onClick={handleStartNew}>
                    Start New Prompt
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span className="ml-2">Copy</span>
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="editor"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Edit Improvement Template</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={getSystemPrompt()}
              onChange={(e) =>
                handleTemplateEdit(selectedTemplateId, e.target.value)
              }
              className="h-64"
              placeholder="Enter the system prompt instructions..."
            />
          </div>
          <DialogFooter>
            <Button onClick={() => setTemplateDialogOpen(false)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
