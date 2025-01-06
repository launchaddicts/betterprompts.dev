import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ModelSelectorProps {
  model: string;
  onModelChange: (model: string) => void;
}

export function ModelSelector({ model, onModelChange }: ModelSelectorProps) {
  return (
    <div className="mb-6">
      <Label htmlFor="model-select" className="text-sm font-medium mb-2 block">
        Language Model
      </Label>
      <Select value={model} onValueChange={onModelChange}>
        <SelectTrigger id="model-select">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="gpt-4">GPT-4</SelectItem>
          <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
          <SelectItem value="claude">Claude</SelectItem>
          <SelectItem value="llama3">Llama 3</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}