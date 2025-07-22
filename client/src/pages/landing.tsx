import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

export default function Landing() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const data = isLogin ? { email, password } : { email, password, name };
      
      const response = await apiRequest("POST", endpoint, data);
      const result = await response.json();
      
      login(result.user);
      toast({
        title: isLogin ? "Welcome back!" : "Account created!",
        description: isLogin ? "You've been logged in successfully." : "Your account has been created and you're logged in.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || (isLogin ? "Login failed" : "Registration failed"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mobile-container bg-white min-h-screen flex flex-col justify-center px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-instagram-gray mb-2">Scroll & Sold</h1>
        <p className="text-instagram-light-gray">Discover homes, cars & boats</p>
      </div>

      <Card className="border-none shadow-none">
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <Input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-instagram-blue"
              />
            )}
            
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-instagram-blue"
            />
            
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-instagram-blue"
            />
            
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-instagram-blue text-white py-3 rounded-lg font-semibold mb-4 hover:bg-instagram-blue/90"
            >
              {isLoading ? "Loading..." : (isLogin ? "Sign In" : "Sign Up")}
            </Button>
          </form>

          <p className="text-center text-instagram-light-gray">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-instagram-blue cursor-pointer hover:underline"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
