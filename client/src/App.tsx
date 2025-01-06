import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sun, Moon } from "lucide-react";
import { PromptEditor } from "./components/PromptEditor";
import { ModelSelector } from "./components/ModelSelector";
import { EnhancedOutput } from "./components/EnhancedOutput";
import { useState } from "react";

function App() {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("gpt-4");
  const { toast } = useToast();
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
    toast({
      title: `Switched to ${isDark ? "light" : "dark"} mode`,
      duration: 1500,
    });
  };

  return (
    <div className={`min-h-screen bg-background ${isDark ? "dark" : ""}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Prompt Enhancement Tool</h1>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-4">
            <ModelSelector model={model} onModelChange={setModel} />
            <PromptEditor value={prompt} onChange={setPrompt} />
          </Card>

          <Card className="p-4">
            <EnhancedOutput originalPrompt={prompt} model={model} />
          </Card>
        </div>
      </div>
    </div>
  );
}

export default App;
