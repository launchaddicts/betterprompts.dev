import { ReactNode, createContext, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
  QueryClient,
} from "@tanstack/react-query";
import type { SelectUser, InsertUser } from "@db/schema";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

// Create a query client for authentication
const queryClient = new QueryClient();

// API request helper
async function apiRequest(method: string, url: string, data?: any) {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "An error occurred" }));
    throw new Error(errorData.message || "Request failed");
  }
  
  return response;
}

// Query function that can handle unauthorized requests
function getQueryFn({ on401 = "throw" }: { on401: "throw" | "returnNull" } = { on401: "throw" }) {
  return async ({ queryKey }: { queryKey: unknown[] }) => {
    const url = queryKey[0] as string;
    
    try {
      const res = await apiRequest("GET", url);
      if (res.status === 204) return null;
      return await res.json();
    } catch (error) {
      if (on401 === "returnNull" && (error as any).status === 401) {
        return null;
      }
      throw error;
    }
  };
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (newUser: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", newUser);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: `Welcome, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}