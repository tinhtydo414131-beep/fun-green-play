import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, Gamepad2 } from "lucide-react";
import { z } from "zod";

const passwordSchema = z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự").max(100, "Mật khẩu quá dài");

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there's a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn!");
        setTimeout(() => navigate("/auth"), 2000);
      } else {
        setIsValidSession(true);
      }
    };

    checkSession();
  }, [navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    try {
      passwordSchema.parse(password);
      if (password !== confirmPassword) {
        toast.error("Mật khẩu xác nhận không khớp!");
        return;
      }
    } catch (error: any) {
      toast.error(error.errors?.[0]?.message || "Mật khẩu không hợp lệ!");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      toast.success("🎉 Đã đặt lại mật khẩu thành công!");
      
      // Sign out and redirect to login
      await supabase.auth.signOut();
      setTimeout(() => navigate("/auth"), 1500);
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error(error.message || "Không thể đặt lại mật khẩu. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-primary/20 shadow-2xl rounded-3xl">
          <CardContent className="p-8 text-center">
            <p className="font-comic text-lg">Đang kiểm tra...</p>
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
              <Gamepad2 className="w-12 h-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-fredoka text-primary">
            Đặt lại mật khẩu 🔑
          </CardTitle>
          <CardDescription className="text-base font-comic">
            Nhập mật khẩu mới của bạn
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-6 pb-6">
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-comic text-muted-foreground flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Mật khẩu mới
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

            <div className="space-y-2">
              <label className="text-sm font-comic text-muted-foreground flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Xác nhận mật khẩu mới
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 text-lg font-fredoka font-bold bg-gradient-to-r from-primary to-secondary hover:shadow-xl transition-all"
            >
              {loading ? "Đang xử lý... ⏳" : "Đặt lại mật khẩu 🚀"}
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground font-comic">
            🔒 Mật khẩu của bạn được mã hóa an toàn
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
