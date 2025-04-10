import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ThumbsUp, 
  ThumbsDown, 
  User, 
  Calendar, 
  ArrowLeft, 
  Copy,
  Laptop,
  Wand2
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "../hooks/use-auth";
import { Loader2 } from "lucide-react";

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
  userVote: number | null;
  user: {
    id: number;
    username: string;
  };
}

export default function SharedPromptPage() {
  const { id } = useParams<{ id: string }>();
  const [prompt, setPrompt] = useState<SharedPrompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [votingInProgress, setVotingInProgress] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    async function fetchPrompt() {
      try {
        const response = await fetch(`/api/shared-prompts/${id}`, {
          credentials: "include",
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Prompt not found");
          }
          throw new Error("Failed to fetch prompt");
        }
        
        const data = await response.json();
        setPrompt(data);
      } catch (error) {
        toast({
          title: "Error fetching prompt",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive",
        });
        navigate("/community");
      } finally {
        setLoading(false);
      }
    }
    
    fetchPrompt();
  }, [id, toast, navigate]);

  const handleVote = async (value: 1 | -1) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "You need to log in to vote on prompts",
        variant: "destructive",
      });
      return;
    }

    if (!prompt) return;

    try {
      setVotingInProgress(true);
      const response = await fetch(`/api/shared-prompts/${id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value }),
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to submit vote");
      }
      
      const result = await response.json();
      
      setPrompt((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          upvotes: result.upvotes,
          downvotes: result.downvotes,
          score: result.score,
          userVote: value,
        };
      });
      
      toast({
        title: "Vote submitted",
        description: value === 1 ? "Upvote recorded" : "Downvote recorded",
      });
    } catch (error) {
      toast({
        title: "Error submitting vote",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setVotingInProgress(false);
    }
  };

  const copyToClipboard = (text: string, type: "prompt" | "system") => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: type === "prompt" ? "Prompt copied" : "System prompt copied",
    });
  };

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

  if (!prompt) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Prompt not found</h2>
        <p className="text-muted-foreground mt-2">
          The prompt you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate("/community")} className="mt-6">
          Back to Community
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        className="flex items-center gap-2 mb-6"
        onClick={() => navigate("/community")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Community
      </Button>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="outline">
                    {getModelLabel(prompt.model)} · {prompt.model}
                  </Badge>
                </div>
                <CardTitle className="text-2xl">{prompt.title}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{prompt.user.username}</span>
                  <span className="text-muted-foreground">•</span>
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(prompt.createdAt), "MMM d, yyyy")}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Laptop className="h-4 w-4" />
                      Prompt Input
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8"
                      onClick={() => copyToClipboard(prompt.content, "prompt")}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                    <pre className="text-sm whitespace-pre-wrap font-mono">
                      {prompt.content}
                    </pre>
                  </ScrollArea>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Wand2 className="h-4 w-4" />
                      System Prompt
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8"
                      onClick={() => copyToClipboard(prompt.systemPrompt, "system")}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                    <pre className="text-sm whitespace-pre-wrap font-mono">
                      {prompt.systemPrompt}
                    </pre>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="w-full md:w-64 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vote</CardTitle>
                <CardDescription>Share your opinion on this prompt</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant={prompt.userVote === 1 ? "default" : "outline"}
                    className="flex-1 flex items-center justify-center gap-2"
                    onClick={() => handleVote(1)}
                    disabled={votingInProgress}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>{prompt.upvotes}</span>
                  </Button>
                  <Button
                    variant={prompt.userVote === -1 ? "default" : "outline"}
                    className="flex-1 flex items-center justify-center gap-2"
                    onClick={() => handleVote(-1)}
                    disabled={votingInProgress}
                  >
                    <ThumbsDown className="h-4 w-4" />
                    <span>{prompt.downvotes}</span>
                  </Button>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">Score</p>
                  <p className="text-2xl font-bold">{prompt.score}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Try It</CardTitle>
                <CardDescription>Use this prompt in your project</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => {
                    // Store in local storage
                    localStorage.setItem("temp_prompt", prompt.content);
                    localStorage.setItem("temp_system_prompt", prompt.systemPrompt);
                    localStorage.setItem("temp_model", prompt.model);
                    
                    navigate("/");
                    
                    toast({
                      title: "Prompt loaded",
                      description: "The prompt has been loaded to the editor",
                    });
                  }}
                >
                  Use This Prompt
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}