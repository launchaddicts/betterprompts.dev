import { useEffect, useState } from "react";
import { enhancePrompt } from "../lib/enhance";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

interface EnhancedOutputProps {
  originalPrompt: string;
}

export function EnhancedOutput({ originalPrompt }: EnhancedOutputProps) {
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function enhance() {
      if (!originalPrompt.trim()) {
        setEnhancedPrompt("");
        return;
      }

      setLoading(true);
      try {
        const result = await enhancePrompt(originalPrompt);
        setEnhancedPrompt(result.enhanced);
      } catch (error) {
        console.error("Enhancement failed:", error);
      } finally {
        setLoading(false);
      }
    }

    enhance();
  }, [originalPrompt]);

  return (
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
          <ScrollArea className="h-[200px] rounded-md border p-4">
            <Card className="bg-muted p-4">
              <pre className="font-mono text-sm whitespace-pre-wrap">
                {enhancedPrompt || "Enhanced prompt will appear here..."}
              </pre>
            </Card>
          </ScrollArea>
        </motion.div>
      )}
    </AnimatePresence>
  );
}