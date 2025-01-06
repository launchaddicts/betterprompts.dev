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
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <Textarea
      ref={textareaRef}
      placeholder="Can you make this prompt better"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-[100px] font-mono text-sm resize-none bg-card"
    />
  );
}