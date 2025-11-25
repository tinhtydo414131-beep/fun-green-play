import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Gamepad2, Mail, Lock, User } from "lucide-react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const navigate = useNavigate();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (rememberMe && data.session) {
          localStorage.setItem("kidcrypto_session", JSON.stringify(data.session));
        }

        toast.success("🎉 Welcome back to KidCrypto Games!");
        navigate("/");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              username: username || email.split("@")[0],
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          toast.success("🎊 Account created! You can now log in!");
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      if (error.message.includes("already registered")) {
        toast.error("This email is already registered. Please log in instead!");
      } else if (error.message.includes("Invalid login credentials")) {
        toast.error("Wrong email or password. Please try again!");
      } else {
        toast.error(error.message || "Something went wrong. Please try again!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error("Google auth error:", error);
      toast.error("Couldn't connect with Google. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-4 border-primary/30 shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-primary to-secondary p-4 rounded-full">
              <Gamepad2 className="w-12 h-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-4xl font-fredoka text-primary">
            {isLogin ? "Welcome Back! 🎮" : "Join the Fun! 🎉"}
          </CardTitle>
          <CardDescription className="text-lg font-comic">
            {isLogin ? "Log in to play amazing games!" : "Create your account to start playing!"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Your cool username 😎"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 text-lg border-2 border-primary/30 focus:border-primary"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="your@email.com 📧"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 text-lg border-2 border-primary/30 focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Super secret password 🔐"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 text-lg border-2 border-primary/30 focus:border-primary"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-primary/30"
                />
                <label htmlFor="remember" className="text-sm font-comic cursor-pointer">
                  Remember me on this device 💾
                </label>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full text-lg font-bold py-6 bg-gradient-to-r from-primary to-secondary hover:shadow-lg transform hover:scale-105 transition-all"
            >
              {loading ? "Loading... ⏳" : isLogin ? "Log In 🚀" : "Sign Up 🎨"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t-2 border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card px-4 text-muted-foreground font-comic">OR</span>
            </div>
          </div>

          <Button
            onClick={handleGoogleAuth}
            disabled={loading}
            variant="outline"
            className="w-full text-lg font-bold py-6 border-2 border-accent/30 hover:border-accent hover:bg-accent/10 transform hover:scale-105 transition-all"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google 🌈
          </Button>

          <div className="text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline font-comic text-lg font-bold"
              type="button"
            >
              {isLogin ? "Need an account? Sign up! ✨" : "Already have an account? Log in! 🎯"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
