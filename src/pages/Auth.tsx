import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Gamepad2, User, Wallet } from "lucide-react";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { web3Modal } from '@/lib/web3';

export default function Auth() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const openWalletModal = async () => {
    try {
      await web3Modal.open();
    } catch (error) {
      console.error("Error opening wallet modal:", error);
      toast.error("Không thể mở modal chọn ví!");
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast.success("Đã ngắt kết nối ví!");
  };

  const handleWalletAuth = async (e: React.FormEvent) => {
    e.preventDefault();

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

      // Thử đăng nhập trước
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: walletEmail,
        password: walletPassword,
      });

      if (signInError) {
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

          if (signUpError) throw signUpError;

          if (signUpData.session) {
            localStorage.setItem("funplanet_session", JSON.stringify(signUpData.session));
            
            // Cập nhật wallet address trong profile
            await supabase
              .from("profiles")
              .update({ wallet_address: address.toLowerCase() })
              .eq("id", signUpData.user!.id);

            toast.success("🎊 Chào mừng bạn đến với FUN Planet!");
            navigate("/");
          } else {
            toast.error("Không thể tạo tài khoản. Vui lòng thử lại!");
          }
        } else {
          throw signInError;
        }
      } else {
        // Đăng nhập thành công
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
      console.error("Auth error:", error);
      toast.error(error.message || "Có lỗi xảy ra! Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f5e9] via-[#fff9e5] to-[#fce4ec] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-[0_20px_60px_rgba(0,0,0,0.15)] rounded-3xl bg-background/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-primary to-secondary p-4 rounded-full">
              <Gamepad2 className="w-12 h-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-4xl font-fredoka text-primary">
            Chào mừng đến FUN Planet! 🎮
          </CardTitle>
          <CardDescription className="text-lg font-comic">
            Kết nối ví MetaMask để bắt đầu chơi game!
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Wallet Connection Status */}
          {isConnected && address ? (
            <div className="p-4 bg-accent/10 border-2 border-accent/30 rounded-xl">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-comic text-muted-foreground">Ví đã kết nối</p>
                    <p className="font-mono text-xs truncate">{address}</p>
                  </div>
                </div>
                <Button
                  onClick={handleDisconnect}
                  variant="ghost"
                  size="sm"
                  className="text-xs flex-shrink-0"
                >
                  Đổi ví
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={openWalletModal}
              disabled={loading}
              className="w-full text-lg font-bold py-6 border-0 transform hover:scale-[1.02] transition-all duration-300 shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #8B46FF 0%, #00F2FF 100%)',
                color: '#FFFFFF',
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(139, 70, 255, 0.3)',
              }}
            >
              <Wallet className="w-5 h-5 mr-3" />
              Kết nối ví 🔗
            </Button>
          )}

          {/* Login Form */}
          {isConnected && address && (
            <form onSubmit={handleWalletAuth} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Tên người dùng của bạn 😎"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 text-lg border-2 border-primary/30 focus:border-primary"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full text-lg font-bold py-6 border-0 transform hover:scale-[1.02] transition-all duration-300 shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #8B46FF 0%, #00F2FF 100%)',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(139, 70, 255, 0.3)',
                }}
              >
                {loading ? "Đang xử lý... ⏳" : "Đăng nhập / Đăng ký 🚀"}
              </Button>
            </form>
          )}

          {/* Info */}
          <div className="p-4 bg-muted/30 rounded-xl">
            <p className="text-sm font-comic text-muted-foreground text-center">
              🔒 Hỗ trợ nhiều loại ví: MetaMask, WalletConnect, Coinbase Wallet, Trust Wallet, và nhiều hơn nữa!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
