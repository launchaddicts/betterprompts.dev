import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Settings2, AlertCircle } from "lucide-react";
import { PromptEditor } from "./components/PromptEditor";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function App() {
  const [prompt, setPrompt] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [improverPrompt, setImproverPrompt] = useState(
    "Improve the following prompt by making it more specific, clear, and structured:"
  );
  const { toast } = useToast();

  useEffect(() => {
    const savedKey = localStorage.getItem("openai_api_key");
    const savedImproverPrompt = localStorage.getItem("improver_prompt");
    if (savedKey) setApiKey(savedKey);
    if (savedImproverPrompt) setImproverPrompt(savedImproverPrompt);
  }, []);

  const handleImprove = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Please enter a prompt first",
        variant: "destructive",
        duration: 1500,
      });
      return;
    }

    if (!apiKey) {
      toast({
        title: "Please enter your OpenAI API key in settings",
        variant: "destructive",
        duration: 1500,
      });
      return;
    }

    localStorage.setItem("openai_api_key", apiKey);
    localStorage.setItem("improver_prompt", improverPrompt);

    toast({
      title: "Ready to improve prompts!",
      duration: 1500,
    });
  };

  return (
    <div className="min-h-screen bg-background dark">
      <div className="container mx-auto p-4 max-w-3xl">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-foreground">Prompt Improver</h1>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Settings2 className="h-4 w-4" />
                  {!apiKey && (
                    <span className="absolute -top-1 -right-1 h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96">
                <Tabs defaultValue="apis" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="apis">API Keys</TabsTrigger>
                    <TabsTrigger value="config">Configuration</TabsTrigger>
                  </TabsList>
                  <TabsContent value="apis" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="openai-key">OpenAI API Key</Label>
                      <Input 
                        id="openai-key"
                        type="password"
                        placeholder="sk-..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        Your API key is stored locally and never sent to our servers
                      </p>
                    </div>
                    {/* Placeholder for future API providers */}
                    <div className="space-y-2 opacity-50">
                      <Label htmlFor="anthropic-key">Anthropic API Key (Coming soon)</Label>
                      <Input 
                        id="anthropic-key"
                        type="password"
                        placeholder="sk-ant-..."
                        disabled
                        className="font-mono"
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="config" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="improver-prompt">Improvement Prompt</Label>
                      <Textarea
                        id="improver-prompt"
                        placeholder="Enter the prompt used to improve user input..."
                        value={improverPrompt}
                        onChange={(e) => setImproverPrompt(e.target.value)}
                        className="min-h-[100px] font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Customize how the AI improves your prompts
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
                  Start building
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default App;