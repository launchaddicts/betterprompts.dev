import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Settings2 } from "lucide-react";
import { PromptEditor } from "./components/PromptEditor";
import { ModelSelector } from "./components/ModelSelector";
import { TemplateSelector } from "./components/TemplateSelector";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedOutput } from "./components/EnhancedOutput";
import { improvementTemplates } from "./lib/templates";

function App() {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4");
  const [selectedTemplateId, setSelectedTemplateId] = useState("general");
  const [apiKeys, setApiKeys] = useState({
    openai: "",
    anthropic: "",
    groq: ""
  });
  const [customPrompt, setCustomPrompt] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const savedKeys = {
      openai: localStorage.getItem("openai_api_key") || "",
      anthropic: localStorage.getItem("anthropic_api_key") || "",
      groq: localStorage.getItem("groq_api_key") || ""
    };
    const savedTemplateId = localStorage.getItem("selected_template_id");
    const savedModel = localStorage.getItem("selected_model");
    const savedCustomPrompt = localStorage.getItem("custom_prompt");

    setApiKeys(savedKeys);
    if (savedTemplateId) setSelectedTemplateId(savedTemplateId);
    if (savedModel) setSelectedModel(savedModel);
    if (savedCustomPrompt) setCustomPrompt(savedCustomPrompt);
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

  const getProviderForModel = (model: string) => {
    if (model.startsWith('gpt')) return 'openai';
    if (model === 'claude') return 'anthropic';
    return 'groq';
  };

  const getSystemPrompt = () => {
    if (customPrompt.trim()) return customPrompt;
    const template = improvementTemplates.find(t => t.id === selectedTemplateId);
    return template?.systemPrompt || improvementTemplates[0].systemPrompt;
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

    if (customPrompt) {
      localStorage.setItem("custom_prompt", customPrompt);
    }

    toast({
      title: "Ready to improve prompts!",
      duration: 1500,
    });
  };

  const hasNoKeys = !Object.values(apiKeys).some(key => key);
  const currentProvider = getProviderForModel(selectedModel);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-3xl">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-foreground">Prompt Improver</h1>

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
                      <p className="text-xs text-muted-foreground">
                        Select which AI model to use for improving your prompts
                      </p>
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
                        customPrompt={customPrompt}
                        onCustomPromptChange={(value) => setCustomPrompt(value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Choose a template or create your own custom improvement style
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </PopoverContent>
            </Popover>
          </div>

          <h2 className="text-2xl font-bold text-foreground">What do you want to build today?</h2>

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
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default App;