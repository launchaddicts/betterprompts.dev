import { useEffect, useState } from "react";
import { enhancePrompt } from "../lib/enhance";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

interface EnhancedOutputProps {
  originalPrompt: string;
  model: string;
}

export function EnhancedOutput({ originalPrompt, model }: EnhancedOutputProps) {
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState({ clarity: 0, specificity: 0, context: 0 });

  useEffect(() => {
    async function enhance() {
      if (!originalPrompt.trim()) {
        setEnhancedPrompt("");
        return;
      }

      setLoading(true);
      try {
        const result = await enhancePrompt(originalPrompt, model);
        setEnhancedPrompt(result.enhanced);
        setMetrics(result.metrics);
      } catch (error) {
        console.error("Enhancement failed:", error);
      } finally {
        setLoading(false);
      }
    }

    const timeout = setTimeout(enhance, 500);
    return () => clearTimeout(timeout);
  }, [originalPrompt, model]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-sm font-medium">Enhanced Output</h3>
        <div className="flex gap-2">
          {Object.entries(metrics).map(([key, value]) => (
            <Badge key={key} variant="secondary" className="capitalize">
              {key}: {value}%
            </Badge>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[95%]" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <Card className="bg-muted p-4">
                <pre className="font-mono text-sm whitespace-pre-wrap">
                  {enhancedPrompt || "Enhanced prompt will appear here..."}
                </pre>
              </Card>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
