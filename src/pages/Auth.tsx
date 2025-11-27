import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Gamepad2, User, Wallet, Mail, Lock } from "lucide-react";
import { web3Modal } from '@/lib/web3';
import { useAccount, useDisconnect } from 'wagmi';
import { z } from "zod";

// Email/Password validation schema
const emailSchema = z.string().email("Email không hợp lệ").max(255, "Email quá dài");
const passwordSchema = z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự").max(100, "Mật khẩu quá dài");
const usernameSchema = z.string().min(3, "Tên người dùng phải có ít nhất 3 ký tự").max(20, "Tên người dùng quá dài");

export default function Auth() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"connect" | "register">("connect");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  // Auto-proceed to register step when wallet connects
  useEffect(() => {
    if (isConnected && address && step === "connect") {
      setStep("register");
    }
  }, [isConnected, address, step]);

  // Redirect if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkAuth();
  }, [navigate]);

  const handleConnect = async () => {
    try {
      setLoading(true);
      
      // Open Web3Modal for wallet selection
      await web3Modal.open();
      
      toast.success("🎉 Vui lòng chọn ví trong popup!");
    } catch (error: any) {
      console.error("Wallet connect error:", error);
      if (error.message?.includes("User rejected")) {
        toast.error("Bạn đã từ chối kết nối ví!");
      } else {
        toast.error("Không thể mở modal kết nối ví. Vui lòng thử lại!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setStep("connect");
    setUsername("");
    toast.info("Đã ngắt kết nối ví");
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      if (authMode === "signup") {
        usernameSchema.parse(username);
        if (password !== confirmPassword) {
          toast.error("Mật khẩu xác nhận không khớp!");
          return;
        }
      }
    } catch (error: any) {
      toast.error(error.errors?.[0]?.message || "Dữ liệu không hợp lệ!");
      return;
    }

    setLoading(true);

    try {
      if (authMode === "login") {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        // Save session to localStorage if Remember Me is checked
        if (rememberMe && data.session) {
          localStorage.setItem("funplanet_session", JSON.stringify({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          }));
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", data.user.id)
          .single();

        toast.success(`🎉 Chào mừng trở lại, ${profile?.username || "bạn"}!`);
        navigate("/");
      } else {
        // Signup
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              username: username.trim(),
            },
          },
        });

        if (error) throw error;

        if (!data.session) {
          toast.success("🎊 Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.");
        } else {
          toast.success("🎊 Chào mừng đến với FUN Planet!");
          navigate("/");
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      if (error.message?.includes("already registered")) {
        toast.error("Email này đã được đăng ký!");
      } else if (error.message?.includes("Invalid login credentials")) {
        toast.error("Email hoặc mật khẩu không đúng!");
      } else {
        toast.error(error.message || "Có lỗi xảy ra. Vui lòng thử lại!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      emailSchema.parse(resetEmail);
    } catch (error: any) {
      toast.error(error.errors?.[0]?.message || "Email không hợp lệ!");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success("📧 Đã gửi email đặt lại mật khẩu! Vui lòng kiểm tra hộp thư.");
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error(error.message || "Không thể gửi email. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      toast.error("Ví chưa kết nối!");
      return;
    }

    if (!username.trim()) {
      toast.error("Vui lòng nhập tên người dùng!");
      return;
    }

    if (username.length < 3) {
      toast.error("Tên người dùng phải có ít nhất 3 ký tự!");
      return;
    }

    setLoading(true);

    try {
      const walletEmail = `${address.toLowerCase()}@wallet.funplanet`;
      const walletPassword = address.toLowerCase();

      // Try sign in first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: walletEmail,
        password: walletPassword,
      });

      if (signInError && signInError.message.includes("Invalid login credentials")) {
        // Account doesn't exist, create new
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: walletEmail,
          password: walletPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              username: username.trim(),
              wallet_address: address.toLowerCase(),
            },
          },
        });

        if (signUpError) {
          throw new Error(signUpError.message || "Không thể tạo tài khoản");
        }

        if (!signUpData.session) {
          throw new Error("Không thể tạo phiên đăng nhập");
        }

        localStorage.setItem("funplanet_session", JSON.stringify(signUpData.session));
        
        // Update profile
        await supabase
          .from("profiles")
          .update({ wallet_address: address.toLowerCase() })
          .eq("id", signUpData.user!.id);

        toast.success("🎊 Chào mừng đến với FUN Planet!");
        navigate("/");
      } else if (signInData?.session) {
        // Login successful
        localStorage.setItem("funplanet_session", JSON.stringify(signInData.session));
        
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", signInData.user.id)
          .single();

        toast.success(`🎉 Chào mừng trở lại, ${profile?.username || "bạn"}!`);
        navigate("/");
      } else {
        throw new Error(signInError?.message || "Đăng nhập thất bại");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  if (step === "connect") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-primary/20 shadow-2xl rounded-3xl">
          <CardHeader className="text-center space-y-4 pb-4">
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-primary to-secondary p-4 rounded-full">
                <Gamepad2 className="w-12 h-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-fredoka text-primary">
              Chào mừng! 🎮
            </CardTitle>
            <CardDescription className="text-base font-comic">
              Chọn cách đăng nhập
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-6 pb-6">
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="email" className="font-fredoka">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="wallet" className="font-fredoka">
                  <Wallet className="w-4 h-4 mr-2" />
                  Ví Crypto
                </TabsTrigger>
              </TabsList>

              {/* Email/Password Tab */}
              <TabsContent value="email" className="space-y-4">
                <div className="flex justify-center gap-2 mb-4">
                  <Button
                    variant={authMode === "login" ? "default" : "outline"}
                    onClick={() => setAuthMode("login")}
                    className="font-fredoka flex-1"
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    variant={authMode === "signup" ? "default" : "outline"}
                    onClick={() => setAuthMode("signup")}
                    className="font-fredoka flex-1"
                  >
                    Đăng ký
                  </Button>
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-4">
                  {authMode === "signup" && (
                    <div className="space-y-2">
                      <label className="text-sm font-comic text-muted-foreground flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Tên người dùng
                      </label>
                      <Input
                        type="text"
                        placeholder="Nhập tên người dùng"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="h-12 border-2 border-primary/30 focus:border-primary"
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-comic text-muted-foreground flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 border-2 border-primary/30 focus:border-primary"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-comic text-muted-foreground flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Mật khẩu
                    </label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 border-2 border-primary/30 focus:border-primary"
                      required
                    />
                  </div>

                  {authMode === "signup" && (
                    <div className="space-y-2">
                      <label className="text-sm font-comic text-muted-foreground flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Xác nhận mật khẩu
                      </label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-12 border-2 border-primary/30 focus:border-primary"
                        required
                      />
                    </div>
                  )}

                  {authMode === "login" && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      />
                      <label
                        htmlFor="remember"
                        className="text-sm font-comic leading-none cursor-pointer select-none"
                      >
                        Ghi nhớ đăng nhập
                      </label>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 text-lg font-fredoka font-bold bg-gradient-to-r from-primary to-secondary hover:shadow-xl transition-all"
                  >
                    {loading ? "Đang xử lý... ⏳" : authMode === "login" ? "Đăng nhập 🚀" : "Đăng ký 🎉"}
                  </Button>

                  {authMode === "login" && (
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => setShowForgotPassword(true)}
                      className="w-full font-comic text-sm text-muted-foreground hover:text-primary"
                    >
                      Quên mật khẩu? 🔑
                    </Button>
                  )}
                </form>
              </TabsContent>

              {/* Wallet Tab */}
              <TabsContent value="wallet" className="space-y-4">
                <Button
                  onClick={handleConnect}
                  disabled={loading}
                  className="w-full h-16 text-lg font-fredoka font-bold bg-gradient-to-r from-accent to-secondary hover:shadow-xl transition-all"
                >
                  {loading ? "Đang kết nối... ⏳" : "🦊 Kết nối ví"}
                </Button>

                <div className="p-4 bg-muted/50 rounded-xl space-y-2 text-sm font-comic text-muted-foreground">
                  <p className="font-bold text-foreground">📱 Hỗ trợ:</p>
                  <p>• MetaMask • Trust Wallet</p>
                  <p>• Coinbase • WalletConnect</p>
                  <p className="text-xs pt-2 border-t">Hoạt động trên web & mobile</p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Forgot Password Modal */}
            {showForgotPassword && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <Card className="w-full max-w-md border-2 border-primary/20 shadow-2xl rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-2xl font-fredoka text-primary">
                      Đặt lại mật khẩu 🔑
                    </CardTitle>
                    <CardDescription className="font-comic">
                      Nhập email của bạn để nhận link đặt lại mật khẩu
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-comic text-muted-foreground flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email
                        </label>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          className="h-12 border-2 border-primary/30 focus:border-primary"
                          required
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowForgotPassword(false);
                            setResetEmail("");
                          }}
                          className="flex-1 h-12 font-fredoka"
                          disabled={loading}
                        >
                          Hủy
                        </Button>
                        <Button
                          type="submit"
                          disabled={loading}
                          className="flex-1 h-12 font-fredoka font-bold bg-gradient-to-r from-primary to-secondary"
                        >
                          {loading ? "Đang gửi... ⏳" : "Gửi email 📧"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-primary/20 shadow-2xl rounded-3xl">
        <CardHeader className="text-center space-y-4 pb-4">
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-primary to-secondary p-4 rounded-full">
              <User className="w-12 h-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-fredoka text-primary">
            Bước cuối! 🎉
          </CardTitle>
          <CardDescription className="text-base font-comic">
            Chọn tên người dùng của bạn
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-6 pb-6">
          {/* Connected Wallet Info */}
          <div className="p-4 bg-accent/10 border-2 border-accent/30 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-secondary rounded-full flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Ví đã kết nối</p>
                <p className="font-mono text-xs truncate">{address}</p>
              </div>
              <Button
                onClick={handleDisconnect}
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                Đổi
              </Button>
            </div>
          </div>

          {/* Register Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Tên người dùng (tối thiểu 3 ký tự)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-14 text-base border-2 border-primary/30 focus:border-primary"
                required
                minLength={3}
                maxLength={20}
              />
            </div>

            <Button
              type="submit"
              disabled={loading || username.length < 3}
              className="w-full h-14 text-lg font-fredoka font-bold bg-gradient-to-r from-primary to-secondary hover:shadow-xl transition-all"
            >
              {loading ? "Đang xử lý... ⏳" : "Bắt đầu chơi! 🚀"}
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground font-comic">
            🔒 Thông tin của bạn được bảo mật an toàn
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
