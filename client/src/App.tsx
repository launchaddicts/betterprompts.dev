import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Wand2 } from "lucide-react";
import { PromptEditor } from "./components/PromptEditor";
import { EnhancedOutput } from "./components/EnhancedOutput";
import { useState } from "react";

function App() {
  const [prompt, setPrompt] = useState("");
  const [isEnhanced, setIsEnhanced] = useState(false);
  const { toast } = useToast();

  const handleImprove = () => {
    if (!prompt.trim()) {
      toast({
        title: "Please enter a prompt first",
        variant: "destructive",
        duration: 1500,
      });
      return;
    }
    setIsEnhanced(true);
  };

  return (
    <div className="min-h-screen bg-background dark">
      <div className="container mx-auto p-4 max-w-3xl">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center gap-2">
            <img src="/replit.svg" alt="Replit" className="h-8 w-8" />
            <h1 className="text-xl font-semibold text-foreground">Create with Replit Agent</h1>
          </div>

          <h2 className="text-2xl font-bold text-foreground">What do you want to build today?</h2>

          <Card className="p-4">
            <div className="space-y-4">
              <PromptEditor value={prompt} onChange={(val) => { setPrompt(val); setIsEnhanced(false); }} />

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEnhanced(false)}>
                  Reset
                </Button>
                <Button onClick={handleImprove} className="gap-2">
                  <Wand2 className="h-4 w-4" />
                  Improve prompt
                </Button>
              </div>
            </div>
          </Card>

          {isEnhanced && prompt && (
            <Card className="p-4">
              <EnhancedOutput originalPrompt={prompt} />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;