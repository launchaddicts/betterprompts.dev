import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Loader2, ThumbsUp, ThumbsDown, MessageSquare, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useAuth } from "../hooks/use-auth";

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
  user: {
    id: number;
    username: string;
  };
}

export default function CommunityPage() {
  const [prompts, setPrompts] = useState<SharedPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    async function fetchPrompts() {
      try {
        const response = await fetch("/api/shared-prompts", {
          credentials: "include",
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch prompts");
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
    
    fetchPrompts();
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
          <h1 className="text-3xl font-bold">Community Prompts</h1>
          <p className="text-muted-foreground">
            Browse, vote, and use prompts shared by the community
          </p>
        </div>
        
        {user && (
          <Link href="/">
            <Button className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Share Your Prompt
            </Button>
          </Link>
        )}
      </div>

      {prompts.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">No prompts shared yet</h3>
            <p className="text-muted-foreground">
              Be the first to share a prompt with the community!
            </p>
            {user ? (
              <Link href="/">
                <Button>Share a Prompt</Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button>Log in to Share</Button>
              </Link>
            )}
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
                    by {prompt.user.username}
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