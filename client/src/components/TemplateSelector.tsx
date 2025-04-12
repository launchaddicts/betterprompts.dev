import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import type { TemplateConfig } from "../lib/templates";
import { cn } from "@/lib/utils";

interface TemplateSelectorProps {
  templates: TemplateConfig[];
  selectedTemplateId: string;
  onSelect: (templateId: string) => void;
}

const getCurrentPrompt = (
  templateId: string,
  editedTemplates: Record<string, string>,
  templates: TemplateConfig[]
) => {
  const selectedTemplate = templates.find((t) => t.id === templateId);
  return editedTemplates[templateId] || selectedTemplate?.systemPrompt || "";
};

export function TemplateSelector({
  templates,
  selectedTemplateId,
  onSelect,
}: TemplateSelectorProps) {
  return (
    <div className="space-y-3">
      {templates.map((template) => (
        <Card
          key={template.id}
          className={cn(
            "p-4 cursor-pointer transition-all",
            "border border-input bg-input/50",
            "hover:border-primary/50 hover:bg-input",
            selectedTemplateId === template.id &&
              "border-primary ring-1 ring-primary bg-input"
          )}
          onClick={() => onSelect(template.id)}
        >
          <h3 className="font-semibold mb-1 text-foreground">
            {template.name}
          </h3>
          <p className="text-sm text-muted-foreground/90">
            {template.description}
          </p>
        </Card>
      ))}
    </div>
  );
}
