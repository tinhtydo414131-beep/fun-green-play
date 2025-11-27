import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Gamepad2, User, Wallet, BookOpen } from "lucide-react";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { web3Modal } from '@/lib/web3';

export default function Auth() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // Monitor wallet connection status
  useEffect(() => {
    console.log('🔵 Wallet Status Changed:', { address, isConnected });
  }, [address, isConnected]);

  const handleWalletClick = async (
    wallet: "metamask" | "coinbase" | "trust" | "walletconnect"
  ) => {
    console.log("🔵 Wallet button clicked:", wallet);

    try {
      const nameMap: Record<
        "metamask" | "coinbase" | "trust" | "walletconnect",
        string[]
      > = {
        metamask: ["MetaMask"],
        coinbase: ["Coinbase Wallet", "Coinbase"],
        trust: ["Trust Wallet", "Trust"],
        walletconnect: ["WalletConnect"],
      };

      const targetNames = nameMap[wallet].map((n) => n.toLowerCase());

      const connector = connectors.find((c) =>
        targetNames.some((name) => c.name.toLowerCase().includes(name))
      );

      if (!connector) {
        console.error("❌ No connector found for wallet:", wallet, connectors);
        toast.error(
          "Không tìm thấy ví phù hợp trên thiết bị này. Vui lòng kiểm tra lại app ví!"
        );
        return;
      }

      console.log("🔵 Connecting with connector:", {
        id: connector.id,
        name: connector.name,
      });

      await connectAsync({ connector });

      toast.success("🎉 Kết nối ví thành công!");
    } catch (error) {
      console.error("❌ Wallet connect error:", error);
      toast.error("Kết nối ví thất bại. Vui lòng mở app ví và thử lại!");
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast.success("Đã ngắt kết nối ví!");
  };

  const handleWalletAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🔵 Starting wallet auth...', { address, isConnected });

    if (!address) {
      toast.error("Vui lòng kết nối ví trước!");
      return;
    }

    if (!username.trim()) {
      toast.error("Vui lòng nhập tên người dùng!");
      return;
    }

    setLoading(true);

    try {
      // Tạo email giả từ wallet address để dùng với Supabase Auth
      const walletEmail = `${address.toLowerCase()}@wallet.funplanet`;
      const walletPassword = address.toLowerCase();

      console.log('🔵 Attempting sign in with wallet:', address);

      // Thử đăng nhập trước
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: walletEmail,
        password: walletPassword,
      });

      if (signInError) {
        console.log('⚠️ Sign in failed, attempting sign up...', signInError.message);
        // Nếu đăng nhập thất bại, có thể là tài khoản chưa tồn tại
        if (signInError.message.includes("Invalid login credentials")) {
          // Tạo tài khoản mới
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: walletEmail,
            password: walletPassword,
            options: {
              emailRedirectTo: `${window.location.origin}/`,
              data: {
                username: username,
                wallet_address: address.toLowerCase(),
              },
            },
          });

          if (signUpError) {
            console.error('❌ Sign up error:', signUpError);
            throw signUpError;
          }

          if (signUpData.session) {
            console.log('✅ Sign up successful!');
            localStorage.setItem("funplanet_session", JSON.stringify(signUpData.session));
            
            // Cập nhật wallet address trong profile
            await supabase
              .from("profiles")
              .update({ wallet_address: address.toLowerCase() })
              .eq("id", signUpData.user!.id);

            toast.success("🎊 Chào mừng bạn đến với FUN Planet!");
            navigate("/");
          } else {
            console.error('❌ No session after sign up');
            toast.error("Không thể tạo tài khoản. Vui lòng thử lại!");
          }
        } else {
          throw signInError;
        }
      } else {
        // Đăng nhập thành công
        console.log('✅ Sign in successful!');
        if (signInData.session) {
          localStorage.setItem("funplanet_session", JSON.stringify(signInData.session));
          
          // Lấy thông tin profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", signInData.user.id)
            .maybeSingle();

          toast.success(`🎉 Chào mừng trở lại, ${profile?.username || username}!`);
          navigate("/");
        }
      }
    } catch (error: any) {
      console.error("❌ Auth error:", error);
      toast.error(error.message || "Có lỗi xảy ra! Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-md border-0 shadow-[0_20px_60px_rgba(0,0,0,0.15)] rounded-2xl sm:rounded-3xl bg-white backdrop-blur-sm gradient-border">
        <CardHeader className="text-center space-y-2 px-4 sm:px-6 pt-6 sm:pt-8">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="bg-gradient-to-br from-primary to-secondary p-3 sm:p-4 rounded-full">
              <Gamepad2 className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-fredoka text-primary leading-tight">
            Chào mừng đến FUN Planet! 🎮
          </CardTitle>
          <CardDescription className="text-base sm:text-lg font-comic px-2">
            Kết nối ví crypto để bắt đầu chơi game và kiếm tiền!
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-6 sm:pb-8">
          {/* Wallet Connection Status */}
          {isConnected && address ? (
            <div className="p-3 sm:p-4 bg-accent/10 border-2 border-accent/30 rounded-xl">
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-accent to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-comic text-muted-foreground">Ví đã kết nối</p>
                    <p className="font-mono text-[10px] sm:text-xs truncate">{address}</p>
                  </div>
                </div>
                <Button
                  onClick={handleDisconnect}
                  variant="ghost"
                  size="sm"
                  className="text-xs flex-shrink-0 h-auto py-1.5 px-2 sm:px-3"
                >
                  Đổi ví
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {/* Wallet Options - tap card to open modal */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => handleWalletClick("metamask")}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    handleWalletClick("metamask");
                  }}
                  className="p-2.5 sm:p-3 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl text-center active:scale-95 transition-transform cursor-pointer touch-manipulation"
                >
                  <div className="text-xl sm:text-2xl mb-0.5 sm:mb-1">🦊</div>
                  <p className="text-[11px] sm:text-xs font-bold font-fredoka text-orange-900">MetaMask</p>
                  <p className="text-[9px] sm:text-[10px] font-comic text-orange-700">Nhấn để kết nối</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleWalletClick("coinbase")}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    handleWalletClick("coinbase");
                  }}
                  className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl text-center active:scale-95 transition-transform cursor-pointer touch-manipulation"
                >
                  <div className="text-xl sm:text-2xl mb-0.5 sm:mb-1">💙</div>
                  <p className="text-[11px] sm:text-xs font-bold font-fredoka text-blue-900">Coinbase</p>
                  <p className="text-[9px] sm:text-[10px] font-comic text-blue-700">Wallet</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleWalletClick("trust")}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    handleWalletClick("trust");
                  }}
                  className="p-2.5 sm:p-3 bg-gradient-to-br from-cyan-50 to-cyan-100 border-2 border-cyan-200 rounded-xl text-center active:scale-95 transition-transform cursor-pointer touch-manipulation"
                >
                  <div className="text-xl sm:text-2xl mb-0.5 sm:mb-1">💎</div>
                  <p className="text-[11px] sm:text-xs font-bold font-fredoka text-cyan-900">Trust</p>
                  <p className="text-[9px] sm:text-[10px] font-comic text-cyan-700">Wallet</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleWalletClick("walletconnect")}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    handleWalletClick("walletconnect");
                  }}
                  className="p-2.5 sm:p-3 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl text-center active:scale-95 transition-transform cursor-pointer touch-manipulation"
                >
                  <div className="text-xl sm:text-2xl mb-0.5 sm:mb-1">🌈</div>
                  <p className="text-[11px] sm:text-xs font-bold font-fredoka text-purple-900">Và nhiều</p>
                  <p className="text-[9px] sm:text-[10px] font-comic text-purple-700">ví khác</p>
                </button>
              </div>
              
              {/* Mobile Instruction */}
              <div className="p-3 sm:p-4 bg-gradient-to-r from-primary/5 to-secondary/5 border-2 border-primary/20 rounded-xl">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="text-xl sm:text-2xl">📱</div>
                  <div className="flex-1 text-left">
                    <p className="text-xs sm:text-sm font-bold font-fredoka text-primary mb-1">
                      Dùng trên điện thoại?
                    </p>
                    <p className="text-[11px] sm:text-xs font-comic text-muted-foreground leading-relaxed">
                      Nhấn vào thẻ <span className="font-bold text-orange-700">MetaMask</span> hoặc ví khác →
                      <span className="font-bold text-accent"> Tự động mở app ví</span> trên điện thoại bạn! 🚀
                    </p>
                  </div>
                </div>
              </div>

              {/* Hướng dẫn chi tiết */}
              <Button
                onClick={() => navigate("/wallet-guide")}
                variant="outline"
                className="w-full border-2 border-primary/30 hover:bg-primary/5 h-auto py-3 sm:py-4 touch-manipulation"
              >
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="font-fredoka font-bold text-xs sm:text-sm">Xem Hướng Dẫn Chi Tiết Kết Nối Ví</span>
              </Button>
            </div>
          )}

          {/* Login Form */}
          {isConnected && address && (
            <form onSubmit={handleWalletAuth} className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Tên người dùng của bạn 😎"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-9 sm:pl-10 text-base sm:text-lg border-2 border-primary/30 focus:border-primary h-12 sm:h-14 touch-manipulation"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full text-base sm:text-lg font-bold py-5 sm:py-6 border-0 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg gradient-animated text-white touch-manipulation"
              >
                {loading ? "Đang xử lý... ⏳" : "Đăng nhập / Đăng ký 🚀"}
              </Button>
            </form>
          )}

          {/* Info */}
          <div className="p-3 sm:p-4 bg-muted/30 rounded-xl space-y-2">
            <p className="text-xs sm:text-sm font-comic text-muted-foreground text-center font-bold">
              🔒 Hỗ trợ nhiều loại ví crypto
            </p>
            <p className="text-[10px] sm:text-xs font-comic text-muted-foreground text-center leading-relaxed">
              MetaMask (ưu tiên) • Coinbase Wallet • Trust Wallet • Rainbow • WalletConnect • Rabby và nhiều ví khác
            </p>
            <p className="text-[10px] sm:text-xs font-comic text-muted-foreground text-center mt-2 pt-2 border-t border-border">
              📱 Hoạt động trên cả <span className="font-bold text-primary">Web</span> và <span className="font-bold text-secondary">Mobile</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
