import { useEffect, useState } from "react";
import { enhancePrompt } from "../lib/enhance";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { EnhancementMetrics } from "./EnhancementMetrics";

interface EnhancedOutputProps {
  originalPrompt: string;
  model: string;
  apiKey: string;
  systemPrompt: string;
}

export function EnhancedOutput({ 
  originalPrompt, 
  model, 
  apiKey, 
  systemPrompt 
}: EnhancedOutputProps) {
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [metrics, setMetrics] = useState({ clarity: 0, specificity: 0, context: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function enhance() {
      if (!originalPrompt.trim()) {
        setEnhancedPrompt("");
        setMetrics({ clarity: 0, specificity: 0, context: 0 });
        return;
      }

      setLoading(true);
      try {
        const result = await enhancePrompt(originalPrompt, model, apiKey, systemPrompt);
        setEnhancedPrompt(result.enhanced);
        setMetrics(result.metrics);
      } catch (error) {
        console.error("Enhancement failed:", error);
      } finally {
        setLoading(false);
      }
    }

    enhance();
  }, [originalPrompt, model, apiKey, systemPrompt]);

  return (
    <AnimatePresence>
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[95%]" />
        </div>
      ) : enhancedPrompt ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-4"
        >
          <ScrollArea className="h-[200px] rounded-md border p-4">
            <Card className="bg-muted p-4">
              <pre className="font-mono text-sm whitespace-pre-wrap">
                {enhancedPrompt}
              </pre>
            </Card>
          </ScrollArea>
          <EnhancementMetrics metrics={metrics} />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center text-muted-foreground p-4"
        >
          Enhanced prompt will appear here...
        </motion.div>
      )}
    </AnimatePresence>
  );
}