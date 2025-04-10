import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Settings2, User, Share2 } from "lucide-react";
import { PromptEditor } from "./components/PromptEditor";
import { ModelSelector } from "./components/ModelSelector";
import { TemplateSelector } from "./components/TemplateSelector";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { EnhancedOutput } from "./components/EnhancedOutput";
import { improvementTemplates } from "./lib/templates";
import { Link, Route, Switch, useLocation } from "wouter";
import HomePage from "./pages/home-page";
import AuthPage from "./pages/auth-page";
import CommunityPage from "./pages/community-page";
import SharedPromptPage from "./pages/shared-prompt-page";
import MyPromptsPage from "./pages/my-prompts-page";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

function App() {
  const [location] = useLocation();

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4">
          <nav className="flex items-center justify-between mb-8 border-b pb-4">
            <Link href="/">
              <a className="text-xl font-semibold text-foreground hover:text-primary">
                Prompt Improver
              </a>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link href="/community">
                <a className={`text-sm font-medium ${location === "/community" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                  Community
                </a>
              </Link>
              <Link href="/my-prompts">
                <a className={`text-sm font-medium ${location === "/my-prompts" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                  My Prompts
                </a>
              </Link>
              <Link href="/auth">
                <a className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
                  <User className="h-4 w-4" />
                  Login/Register
                </a>
              </Link>
            </div>
          </nav>
          
          <main>
            <Switch>
              <Route path="/" component={HomePage} />
              <Route path="/auth" component={AuthPage} />
              <Route path="/community" component={CommunityPage} />
              <Route path="/shared-prompts/:id" component={SharedPromptPage} />
              <ProtectedRoute path="/my-prompts" component={MyPromptsPage} />
            </Switch>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;