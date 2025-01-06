import { Progress } from "@/components/ui/progress";

interface MetricsProps {
  metrics: {
    clarity: number;
    specificity: number;
    context: number;
  };
}

export function EnhancementMetrics({ metrics }: MetricsProps) {
  return (
    <div className="space-y-4 mt-4 p-4 bg-card rounded-lg">
      <h3 className="text-sm font-medium mb-2">Enhancement Metrics</h3>
      
      <div className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs">Clarity</label>
            <span className="text-xs font-mono">{metrics.clarity}%</span>
          </div>
          <Progress value={metrics.clarity} className="h-2" />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs">Specificity</label>
            <span className="text-xs font-mono">{metrics.specificity}%</span>
          </div>
          <Progress value={metrics.specificity} className="h-2" />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs">Context</label>
            <span className="text-xs font-mono">{metrics.context}%</span>
          </div>
          <Progress value={metrics.context} className="h-2" />
        </div>
      </div>
    </div>
  );
}
