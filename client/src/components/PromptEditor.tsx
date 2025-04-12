import { useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";

interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function PromptEditor({ value, onChange }: PromptEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <Textarea
      ref={textareaRef}
      placeholder="Can you make this prompt better"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm 
                 shadow-sm placeholder:text-muted-foreground/50 
                 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring 
                 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
    />
  );
}
