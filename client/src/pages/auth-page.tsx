import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "../hooks/use-auth";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const [tab, setTab] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if already logged in
  if (user) {
    navigate("/");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    loginMutation.mutate({ username, password });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    registerMutation.mutate({ username, password });
  };

  const isLoading = loginMutation.isLoading || registerMutation.isLoading;

  return (
    <div className="flex flex-col md:flex-row max-w-5xl mx-auto gap-8 items-center">
      <div className="flex-1 w-full">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              {tab === "login" ? "Login to Your Account" : "Create an Account"}
            </CardTitle>
            <CardDescription>
              {tab === "login"
                ? "Enter your credentials to access your account"
                : "Join our community to share and collaborate on prompts"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="login"
              value={tab}
              onValueChange={setTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-username">Username</Label>
                    <Input
                      id="reg-username"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="Choose a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-muted-foreground">
            {tab === "login"
              ? "Don't have an account? Click Register above."
              : "Already have an account? Click Login above."}
          </CardFooter>
        </Card>
      </div>

      <div className="flex-1 p-8">
        <h2 className="text-3xl font-bold mb-4">Enhance Your Prompts</h2>
        <p className="text-lg mb-6">
          Join our community to access advanced prompt engineering tools and
          collaborate with others to create the perfect prompts for your AI
          projects.
        </p>
        <ul className="space-y-4">
          <li className="flex items-start">
            <div className="mr-2 mt-1 bg-primary rounded-full p-1 text-white">
              ✓
            </div>
            <span>Share your enhanced prompts with the community</span>
          </li>
          <li className="flex items-start">
            <div className="mr-2 mt-1 bg-primary rounded-full p-1 text-white">
              ✓
            </div>
            <span>Vote on prompts to highlight the most effective ones</span>
          </li>
          <li className="flex items-start">
            <div className="mr-2 mt-1 bg-primary rounded-full p-1 text-white">
              ✓
            </div>
            <span>Save your favorite prompts for later use</span>
          </li>
          <li className="flex items-start">
            <div className="mr-2 mt-1 bg-primary rounded-full p-1 text-white">
              ✓
            </div>
            <span>Fine-tune and personalize shared prompts</span>
          </li>
        </ul>
      </div>
    </div>
  );
}