import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { TemplateConfig } from "../lib/templates";

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

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[300px] pr-4 mb-4">
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

      {isCustom && (
        <Textarea
          placeholder="Enter your custom system prompt for improvement..."
          value={customPrompt}
          onChange={(e) => onCustomPromptChange(e.target.value)}
          className="min-h-[200px] font-mono text-sm"
        />
      )}
    </div>
  );
}