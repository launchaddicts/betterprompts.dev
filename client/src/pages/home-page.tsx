import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Settings2, Share2, Star, Edit } from "lucide-react";
import { PromptEditor } from "../components/PromptEditor";
import { ModelSelector } from "../components/ModelSelector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useContext } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedOutput } from "../components/EnhancedOutput";
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
import { ApiKeyContext, ApiKeys } from "../context/ApiKeyContext";
import {
  AVAILABLE_MODELS,
  getProviderForModel,
  getProviderName,
} from "../lib/models";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function HomePage() {
  const [prompt, setPrompt] = useState("");
  const { apiKeys, openSettings } = useContext(ApiKeyContext);
  const [selectedModel, setSelectedModel] = useState(() => {
    const initialModel = "gpt-4o";
    const provider = getProviderForModel(initialModel);
    if (provider && apiKeys[provider]) {
      return initialModel;
    }
    const firstAvailable = AVAILABLE_MODELS.find((m) => apiKeys[m.provider]);
    return firstAvailable ? firstAvailable.id : "";
  });
  const [selectedTemplateId, setSelectedTemplateId] = useState("general");
  const [editedTemplates, setEditedTemplates] = useState<
    Record<string, string>
  >({});
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareTitle, setShareTitle] = useState("");
  const [enhancedOutput, setEnhancedOutput] = useState("");
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  useEffect(() => {
    const savedTemplateId = localStorage.getItem("selected_template_id");
    const savedModel = localStorage.getItem("selected_model");
    const savedTemplates = localStorage.getItem("edited_templates");

    // Check for temp data from shared prompt
    const tempPrompt = localStorage.getItem("temp_prompt");
    const tempSystemPrompt = localStorage.getItem("temp_system_prompt");
    const tempModel = localStorage.getItem("temp_model");

    if (savedTemplateId) setSelectedTemplateId(savedTemplateId);
    if (savedModel) setSelectedModel(savedModel);
    if (savedTemplates) setEditedTemplates(JSON.parse(savedTemplates));

    // Load from shared prompt if available
    if (tempPrompt) {
      setPrompt(tempPrompt);
      localStorage.removeItem("temp_prompt");
    }

    if (tempSystemPrompt) {
      // Store in edited templates under custom
      setEditedTemplates((prev) => {
        const updated = { ...prev, custom: tempSystemPrompt };
        localStorage.setItem("edited_templates", JSON.stringify(updated));
        return updated;
      });
      setSelectedTemplateId("custom");
      localStorage.setItem("selected_template_id", "custom");
      localStorage.removeItem("temp_system_prompt");
    }

    if (tempModel) {
      setSelectedModel(tempModel);
      localStorage.setItem("selected_model", tempModel);
      localStorage.removeItem("temp_model");
    }
  }, []);

  const handleModelChange = (model: string) => {
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

    const provider = getProviderForModel(selectedModel);
    const currentApiKey = provider ? apiKeys[provider] : null;

    if (!provider || !currentApiKey) {
      toast({
        title: `API Key Missing`,
        description: `Please add an API key for ${
          provider || "the selected model"
        } in Settings (⚙️).`,
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    toast({
      title: "Improving your prompt...",
      duration: 1500,
    });
  };

  // Placeholder function for saving/starring
  const handleSaveToCommunity = () => {
    if (!enhancedOutput.trim()) {
      toast({
        title: "Nothing to save yet",
        description: "Improve a prompt first before saving.",
        variant: "default",
        duration: 1500,
      });
      return;
    }
    // In a real app, you'd send data to your backend here
    toast({
      title: "Saved to Community (Coming Soon!)",
      description: "This prompt improvement has been noted.",
      duration: 2000,
    });
  };

  return (
    <div className="flex flex-col space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between pt-4">
        <h2 className="text-3xl font-bold text-foreground">
          What do you want to build today?
        </h2>
      </div>

      <Card className="p-6 bg-card border-border shadow-lg">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-1.5 md:col-span-1">
              <Label className="text-xs font-medium text-muted-foreground">
                Model
              </Label>
              <div onClick={() => openSettings()} className="cursor-pointer">
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
                  className="flex-1"
                >
                  <SelectTrigger className="w-full">
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
                            handleTemplateEdit(
                              selectedTemplateId,
                              e.target.value
                            )
                          }
                          placeholder="Enter your custom system prompt..."
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          This prompt will be used to guide the AI in improving
                          your input prompt.
                        </p>
                      </div>
                    </div>
                    <DialogFooter className="gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          // Reset to original template
                          const updatedTemplates = { ...editedTemplates };
                          delete updatedTemplates[selectedTemplateId];
                          setEditedTemplates(updatedTemplates);
                          localStorage.setItem(
                            "edited_templates",
                            JSON.stringify(updatedTemplates)
                          );
                          toast({
                            title: "Template Reset",
                            description:
                              "The template has been reset to its default value.",
                            duration: 1500,
                          });
                        }}
                      >
                        Reset to Default
                      </Button>
                      <Button
                        onClick={() => {
                          setTemplateDialogOpen(false);
                          toast({
                            title: "Template Saved",
                            description:
                              "Your customized template has been saved.",
                            duration: 1500,
                          });
                        }}
                      >
                        Save & Close
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Render PromptEditor directly */}
          <PromptEditor value={prompt} onChange={setPrompt} />

          <div className="flex justify-end gap-2">
            {/* Simple Save/Star Button */}
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleSaveToCommunity}
            >
              <Star className="h-4 w-4" />
              Save
            </Button>

            <Button
              onClick={handleImprove}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Wand2 className="h-4 w-4" />
              Improve prompt
            </Button>
          </div>

          <EnhancedOutput
            originalPrompt={prompt}
            model={selectedModel}
            apiKey={
              getProviderForModel(selectedModel)
                ? apiKeys[getProviderForModel(selectedModel)!]
                : ""
            }
            systemPrompt={getSystemPrompt()}
            onEnhancedTextChange={setEnhancedOutput}
          />
        </div>
      </Card>
    </div>
  );
}
