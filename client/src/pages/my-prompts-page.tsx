import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../hooks/use-auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Loader2, ThumbsUp, ThumbsDown, Calendar, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface SharedPrompt {
  id: number;
  title: string;
  content: string;
  systemPrompt: string;
  model: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  score: number;
}

export default function MyPromptsPage() {
  const [prompts, setPrompts] = useState<SharedPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    async function fetchMyPrompts() {
      try {
        const response = await fetch("/api/my-prompts", {
          credentials: "include",
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch your prompts");
        }
        
        const data = await response.json();
        setPrompts(data);
      } catch (error) {
        toast({
          title: "Error fetching prompts",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchMyPrompts();
  }, [toast]);

  const getModelLabel = (model: string) => {
    if (model.startsWith("gpt")) return "OpenAI";
    if (model === "claude") return "Anthropic";
    return "Groq";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Shared Prompts</h1>
          <p className="text-muted-foreground">
            Manage and monitor the prompts you've shared with the community
          </p>
        </div>
        
        <Link href="/">
          <Button className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Share New Prompt
          </Button>
        </Link>
      </div>

      {prompts.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">No prompts shared yet</h3>
            <p className="text-muted-foreground">
              You haven't shared any prompts with the community yet.
            </p>
            <Link href="/">
              <Button>Share Your First Prompt</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {prompts.map((prompt) => (
            <Link key={prompt.id} href={`/shared-prompts/${prompt.id}`}>
              <Card className="h-full cursor-pointer hover:border-primary transition-colors overflow-hidden flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="mb-2">
                      {getModelLabel(prompt.model)}
                    </Badge>
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(prompt.createdAt), "MMM d, yyyy")}
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2">{prompt.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    by you
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4 flex-grow">
                  <p className="text-sm line-clamp-3">{prompt.content}</p>
                </CardContent>
                <CardFooter className="pt-3 border-t flex justify-between text-muted-foreground text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      <span>{prompt.upvotes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsDown className="h-3 w-3" />
                      <span>{prompt.downvotes}</span>
                    </div>
                  </div>
                  <div>
                    Score: {prompt.score}
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}