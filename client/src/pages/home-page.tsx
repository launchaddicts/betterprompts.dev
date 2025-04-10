import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Settings2, Share2 } from "lucide-react";
import { PromptEditor } from "../components/PromptEditor";
import { ModelSelector } from "../components/ModelSelector";
import { TemplateSelector } from "../components/TemplateSelector";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedOutput } from "../components/EnhancedOutput";
import { improvementTemplates } from "../lib/templates";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "../hooks/use-auth";
import { useLocation } from "wouter";

export default function HomePage() {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4");
  const [selectedTemplateId, setSelectedTemplateId] = useState("general");
  const [apiKeys, setApiKeys] = useState({
    openai: "",
    anthropic: "",
    groq: ""
  });
  const [editedTemplates, setEditedTemplates] = useState<Record<string, string>>({});
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareTitle, setShareTitle] = useState("");
  const [enhancedOutput, setEnhancedOutput] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    const savedKeys = {
      openai: localStorage.getItem("openai_api_key") || "",
      anthropic: localStorage.getItem("anthropic_api_key") || "",
      groq: localStorage.getItem("groq_api_key") || ""
    };
    const savedTemplateId = localStorage.getItem("selected_template_id");
    const savedModel = localStorage.getItem("selected_model");
    const savedTemplates = localStorage.getItem("edited_templates");

    // Check for temp data from shared prompt
    const tempPrompt = localStorage.getItem("temp_prompt");
    const tempSystemPrompt = localStorage.getItem("temp_system_prompt");
    const tempModel = localStorage.getItem("temp_model");

    setApiKeys(savedKeys);
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
      setEditedTemplates(prev => {
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

  const handleApiKeyChange = (provider: keyof typeof apiKeys, value: string) => {
    setApiKeys(prev => ({ ...prev, [provider]: value }));
    localStorage.setItem(`${provider}_api_key`, value);
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    localStorage.setItem("selected_model", model);
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    localStorage.setItem("selected_template_id", templateId);
  };

  const handleTemplateEdit = (templateId: string, newPrompt: string) => {
    setEditedTemplates(prev => {
      const updated = { ...prev, [templateId]: newPrompt };
      localStorage.setItem("edited_templates", JSON.stringify(updated));
      return updated;
    });
  };

  const getProviderForModel = (model: string) => {
    if (model.startsWith('gpt')) return 'openai';
    if (model === 'claude') return 'anthropic';
    return 'groq';
  };

  const getSystemPrompt = () => {
    return editedTemplates[selectedTemplateId] || 
           improvementTemplates.find(t => t.id === selectedTemplateId)?.systemPrompt || 
           improvementTemplates[0].systemPrompt;
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
    if (!apiKeys[provider]) {
      toast({
        title: `Please enter your ${provider.charAt(0).toUpperCase() + provider.slice(1)} API key in settings`,
        variant: "destructive",
        duration: 1500,
      });
      return;
    }

    toast({
      title: "Improving your prompt...",
      duration: 1500,
    });
  };

  const handleSharePrompt = async () => {
    if (!user) {
      toast({
        title: "You need to log in to share prompts",
        description: "Please log in or create an account",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!shareTitle.trim() || !prompt.trim() || !enhancedOutput.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a title and ensure you have a prompt and enhanced output",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/shared-prompts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: shareTitle,
          content: prompt,
          model: selectedModel,
          systemPrompt: getSystemPrompt(),
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to share prompt");
      }

      const result = await response.json();

      toast({
        title: "Prompt shared successfully!",
        description: "Your prompt is now available in the community",
      });

      setShareDialogOpen(false);
      navigate(`/shared-prompts/${result.id}`);
    } catch (error) {
      toast({
        title: "Error sharing prompt",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const hasNoKeys = !Object.values(apiKeys).some(key => key);
  const currentProvider = getProviderForModel(selectedModel);

  return (
    <div className="flex flex-col space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">What do you want to build today?</h2>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Settings2 className="h-4 w-4" />
                {hasNoKeys && (
                  <span className="absolute -top-1 -right-1 h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96">
              <Tabs defaultValue="model" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="model">Model & API</TabsTrigger>
                  <TabsTrigger value="improvement">Improvement Style</TabsTrigger>
                </TabsList>
                <TabsContent value="model" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="model-select">Model Selection</Label>
                    <ModelSelector model={selectedModel} onModelChange={handleModelChange} />
                  </div>

                  {currentProvider === 'openai' && (
                    <div className="space-y-2">
                      <Label htmlFor="openai-key">OpenAI API Key</Label>
                      <Input
                        id="openai-key"
                        type="password"
                        placeholder="sk-..."
                        value={apiKeys.openai}
                        onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                        className="font-mono"
                      />
                    </div>
                  )}
                  {currentProvider === 'anthropic' && (
                    <div className="space-y-2">
                      <Label htmlFor="anthropic-key">Anthropic API Key</Label>
                      <Input
                        id="anthropic-key"
                        type="password"
                        placeholder="sk-ant-..."
                        value={apiKeys.anthropic}
                        onChange={(e) => handleApiKeyChange('anthropic', e.target.value)}
                        className="font-mono"
                      />
                    </div>
                  )}
                  {currentProvider === 'groq' && (
                    <div className="space-y-2">
                      <Label htmlFor="groq-key">Groq API Key (Llama)</Label>
                      <Input
                        id="groq-key"
                        type="password"
                        placeholder="gsk_..."
                        value={apiKeys.groq}
                        onChange={(e) => handleApiKeyChange('groq', e.target.value)}
                        className="font-mono"
                      />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    🔒 Your API keys are stored securely in your browser's local storage and are never transmitted to any server.
                    They are only used to make direct API calls from your browser to the respective AI providers.
                  </p>
                </TabsContent>
                <TabsContent value="improvement" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Improvement Style</Label>
                    <TemplateSelector
                      templates={improvementTemplates}
                      selectedTemplateId={selectedTemplateId}
                      onSelect={handleTemplateChange}
                      editedTemplates={editedTemplates}
                      onTemplateEdit={handleTemplateEdit}
                    />
                    <p className="text-xs text-muted-foreground">
                      Choose and customize improvement templates to your needs
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </PopoverContent>
          </Popover>
          
          <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Prompt</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt-title">Title</Label>
                  <Input
                    id="prompt-title"
                    placeholder="Give your prompt a descriptive title"
                    value={shareTitle}
                    onChange={(e) => setShareTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Model</Label>
                  <div className="text-sm bg-muted p-2 rounded">{selectedModel}</div>
                </div>
                <div className="space-y-2">
                  <Label>Template</Label>
                  <div className="text-sm bg-muted p-2 rounded">
                    {improvementTemplates.find(t => t.id === selectedTemplateId)?.name || "Custom Template"}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShareDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSharePrompt}>Share with Community</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="p-4">
        <div className="space-y-4">
          <PromptEditor value={prompt} onChange={setPrompt} />

          <div className="flex justify-end">
            <Button onClick={handleImprove} className="gap-2">
              <Wand2 className="h-4 w-4" />
              Improve prompt
            </Button>
          </div>

          <EnhancedOutput
            originalPrompt={prompt}
            model={selectedModel}
            apiKey={apiKeys[currentProvider]}
            systemPrompt={getSystemPrompt()}
            onEnhancedTextChange={setEnhancedOutput}
          />
        </div>
      </Card>
    </div>
  );
}