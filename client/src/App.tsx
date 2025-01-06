import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Settings2 } from "lucide-react";
import { PromptEditor } from "./components/PromptEditor";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function App() {
  const [prompt, setPrompt] = useState("");
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const savedKey = localStorage.getItem("openai_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
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
        title: "Please enter your OpenAI API key",
        variant: "destructive",
        duration: 1500,
      });
      return;
    }

    // Store API key in localStorage
    localStorage.setItem("openai_api_key", apiKey);

    // Here you would make the API call directly to OpenAI
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
            <div className="flex items-center gap-2">
              <img src="/replit.svg" alt="Replit" className="h-8 w-8" />
              <h1 className="text-xl font-semibold text-foreground">Create with Replit Agent</h1>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings2 className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <Label htmlFor="api-key">OpenAI API Key</Label>
                  <Input 
                    id="api-key"
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