import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { TemplateConfig } from "../lib/templates";
import { Lock, Unlock } from "lucide-react";

interface TemplateSelectorProps {
  templates: TemplateConfig[];
  selectedTemplateId: string;
  onSelect: (templateId: string) => void;
  customPrompt: string;
  onCustomPromptChange: (prompt: string) => void;
}

export function TemplateSelector({
  templates,
  selectedTemplateId,
  onSelect,
  customPrompt,
  onCustomPromptChange,
}: TemplateSelectorProps) {
  const isCustom = selectedTemplateId === "custom";
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
  const promptText = isCustom ? customPrompt : selectedTemplate?.systemPrompt || "";

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[200px] pr-4">
        <div className="space-y-2">
          {templates.map((template) => (
            <Card
              key={template.id}
              className={`p-4 cursor-pointer transition-colors hover:bg-muted ${
                selectedTemplateId === template.id ? "bg-muted" : ""
              }`}
              onClick={() => onSelect(template.id)}
            >
              <h3 className="font-medium mb-1">{template.name}</h3>
              <p className="text-sm text-muted-foreground">
                {template.description}
              </p>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <div className="relative">
        <div className="absolute right-2 top-2 text-muted-foreground">
          {isCustom ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
        </div>
        <Textarea
          placeholder={isCustom ? "Enter your custom system prompt for improvement..." : "Select 'Custom Template' to edit..."}
          value={promptText}
          onChange={(e) => isCustom && onCustomPromptChange(e.target.value)}
          readOnly={!isCustom}
          className={`min-h-[200px] font-mono text-sm pr-8 ${
            isCustom ? "bg-card" : "bg-muted cursor-not-allowed"
          }`}
        />
      </div>
    </div>
  );
}