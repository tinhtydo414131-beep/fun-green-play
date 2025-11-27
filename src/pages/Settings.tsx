import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Save, Loader2, Lock, LogOut, Trash2, Key, Mail, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { AvatarUpload } from "@/components/AvatarUpload";
import { z } from "zod";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const profileSchema = z.object({
  username: z.string()
    .trim()
    .min(3, "Tên người dùng phải có ít nhất 3 ký tự")
    .max(20, "Tên người dùng không được vượt quá 20 ký tự")
    .regex(/^[a-zA-Z0-9_]+$/, "Tên người dùng chỉ được chứa chữ, số và dấu gạch dưới"),
  bio: z.string()
    .max(200, "Bio không được vượt quá 200 ký tự")
    .optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
  newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
  confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

interface ProfileData {
  username: string;
  bio: string | null;
  avatar_url: string | null;
  email: string;
  wallet_address: string | null;
  created_at: string;
}

export default function Settings() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, bio, avatar_url, email, wallet_address, created_at")
        .eq("id", user?.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData({
        username: data.username || "",
        bio: data.bio || "",
      });
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast.error("Không thể tải thông tin profile!");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    try {
      profileSchema.parse(formData);
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
        return;
      }
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: formData.username.trim(),
          bio: formData.bio.trim() || null,
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast.success("✅ Đã cập nhật thông tin!");
      
      // Refresh profile
      await fetchProfile();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Không thể cập nhật thông tin!");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password form
    try {
      passwordSchema.parse(passwordData);
      setPasswordErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setPasswordErrors(newErrors);
        return;
      }
    }

    setChangingPassword(true);

    try {
      // Verify current password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile?.email || "",
        password: passwordData.currentPassword,
      });

      if (signInError) {
        toast.error("Mật khẩu hiện tại không đúng!");
        setChangingPassword(false);
        return;
      }

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (updateError) throw updateError;

      toast.success("✅ Đã đổi mật khẩu thành công!");
      
      // Clear form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.message || "Không thể đổi mật khẩu!");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Đã đăng xuất!");
      navigate("/auth");
    } catch (error) {
      toast.error("Có lỗi khi đăng xuất!");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-32 px-4 text-center">
          <p className="text-2xl font-fredoka text-muted-foreground">Profile not found 😢</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <Navigation />
      
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-3xl">
          {/* Back Button */}
          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            className="mb-6 font-fredoka"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Quay lại Dashboard
          </Button>

          {/* Settings Card */}
          <Card className="border-4 border-primary/30 shadow-2xl">
            <CardHeader className="text-center space-y-2 pb-6">
              <CardTitle className="text-4xl font-fredoka text-primary">
                Cài đặt Profile ⚙️
              </CardTitle>
              <CardDescription className="text-lg font-comic">
                Chỉnh sửa thông tin cá nhân của bạn
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8 px-6 pb-8">
              {/* Avatar Section */}
              <div className="flex justify-center py-4">
                <AvatarUpload 
                  currentAvatarUrl={profile.avatar_url}
                  onAvatarUpdate={(url) => setProfile({ ...profile, avatar_url: url })}
                />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email (Read-only) */}
                <div className="space-y-2">
                  <Label className="text-base font-fredoka text-foreground">
                    Email 📧
                  </Label>
                  <Input
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-muted/50 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground font-comic">
                    Email không thể thay đổi
                  </p>
                </div>

                {/* Wallet Address (Read-only) */}
                {profile.wallet_address && (
                  <div className="space-y-2">
                    <Label className="text-base font-fredoka text-foreground">
                      Địa chỉ ví 🔗
                    </Label>
                    <Input
                      type="text"
                      value={profile.wallet_address}
                      disabled
                      className="bg-muted/50 cursor-not-allowed font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground font-comic">
                      Địa chỉ ví không thể thay đổi
                    </p>
                  </div>
                )}

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-base font-fredoka text-foreground">
                    Tên người dùng <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Nhập tên người dùng"
                    className={`border-2 ${errors.username ? 'border-destructive' : 'border-primary/30'}`}
                    maxLength={20}
                  />
                  {errors.username && (
                    <p className="text-sm text-destructive font-comic">{errors.username}</p>
                  )}
                  <p className="text-xs text-muted-foreground font-comic">
                    3-20 ký tự, chỉ chữ, số và dấu gạch dưới
                  </p>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-base font-fredoka text-foreground">
                    Giới thiệu bản thân 💬
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Viết vài dòng về bản thân..."
                    className={`border-2 min-h-24 ${errors.bio ? 'border-destructive' : 'border-primary/30'}`}
                    maxLength={200}
                  />
                  {errors.bio && (
                    <p className="text-sm text-destructive font-comic">{errors.bio}</p>
                  )}
                  <p className="text-xs text-muted-foreground font-comic text-right">
                    {formData.bio.length}/200 ký tự
                  </p>
                </div>

                {/* Save Button */}
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full h-14 text-lg font-fredoka font-bold bg-gradient-to-r from-primary to-secondary hover:shadow-xl transition-all"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 w-5 h-5" />
                      Lưu thay đổi ✓
                    </>
                  )}
                </Button>
              </form>

              {/* Info Box */}
              <div className="p-4 bg-primary/5 border-2 border-primary/20 rounded-xl">
                <p className="text-sm font-comic text-muted-foreground text-center">
                  💡 <span className="font-bold">Mẹo:</span> Thông tin profile của bạn sẽ hiển thị công khai cho người dùng khác
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card className="border-4 border-primary/30 shadow-2xl mt-6">
            <CardHeader className="text-center space-y-2 pb-6">
              <CardTitle className="text-3xl font-fredoka text-primary flex items-center justify-center gap-2">
                <Key className="w-8 h-8" />
                Đổi mật khẩu 🔐
              </CardTitle>
              <CardDescription className="text-base font-comic">
                Cập nhật mật khẩu để bảo mật tài khoản
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 px-6 pb-8">
              <form onSubmit={handlePasswordChange} className="space-y-6">
                {/* Current Password */}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-base font-fredoka text-foreground">
                    Mật khẩu hiện tại <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Nhập mật khẩu hiện tại"
                    className={`border-2 ${passwordErrors.currentPassword ? 'border-destructive' : 'border-primary/30'}`}
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-sm text-destructive font-comic">{passwordErrors.currentPassword}</p>
                  )}
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-base font-fredoka text-foreground">
                    Mật khẩu mới <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Nhập mật khẩu mới"
                    className={`border-2 ${passwordErrors.newPassword ? 'border-destructive' : 'border-primary/30'}`}
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-sm text-destructive font-comic">{passwordErrors.newPassword}</p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-base font-fredoka text-foreground">
                    Xác nhận mật khẩu mới <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Nhập lại mật khẩu mới"
                    className={`border-2 ${passwordErrors.confirmPassword ? 'border-destructive' : 'border-primary/30'}`}
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-sm text-destructive font-comic">{passwordErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Change Password Button */}
                <Button
                  type="submit"
                  disabled={changingPassword}
                  className="w-full h-14 text-lg font-fredoka font-bold bg-gradient-to-r from-accent to-secondary hover:shadow-xl transition-all"
                >
                  {changingPassword ? (
                    <>
                      <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                      Đang đổi...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 w-5 h-5" />
                      Đổi mật khẩu
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Management Card */}
          <Card className="border-4 border-primary/30 shadow-2xl mt-6">
            <CardHeader className="text-center space-y-2 pb-6">
              <CardTitle className="text-3xl font-fredoka text-primary flex items-center justify-center gap-2">
                <UserIcon className="w-8 h-8" />
                Quản lý tài khoản 🎮
              </CardTitle>
              <CardDescription className="text-base font-comic">
                Thông tin và hành động tài khoản
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 px-6 pb-8">
              {/* Account Info */}
              <div className="space-y-4 p-4 bg-muted/30 rounded-xl border-2 border-border/50">
                <div className="flex items-center justify-between">
                  <span className="font-fredoka text-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email:
                  </span>
                  <span className="font-comic text-muted-foreground">{profile?.email}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-fredoka text-foreground">Ngày tạo:</span>
                  <span className="font-comic text-muted-foreground">
                    {new Date(profile?.created_at || "").toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {/* Sign Out Button */}
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="w-full h-12 text-base font-fredoka border-2 border-orange-500/50 text-orange-600 hover:bg-orange-500/10 hover:text-orange-600 hover:border-orange-500"
                >
                  <LogOut className="mr-2 w-5 h-5" />
                  Đăng xuất
                </Button>

                {/* Delete Account Button */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-12 text-base font-fredoka border-2 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                    >
                      <Trash2 className="mr-2 w-5 h-5" />
                      Xóa tài khoản
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-fredoka text-2xl">Xác nhận xóa tài khoản?</AlertDialogTitle>
                      <AlertDialogDescription className="font-comic text-base">
                        ⚠️ Hành động này không thể hoàn tác! Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn bao gồm:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Thông tin profile</li>
                          <li>Lịch sử chơi game</li>
                          <li>Bạn bè và tin nhắn</li>
                          <li>Dữ liệu ví và giao dịch</li>
                        </ul>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="font-fredoka">Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        className="font-fredoka bg-destructive hover:bg-destructive/90"
                        onClick={async () => {
                          toast.info("Chức năng xóa tài khoản đang được phát triển. Vui lòng liên hệ admin.");
                        }}
                      >
                        Xác nhận xóa
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {/* Warning */}
              <div className="p-4 bg-destructive/5 border-2 border-destructive/20 rounded-xl">
                <p className="text-sm font-comic text-muted-foreground text-center">
                  ⚠️ <span className="font-bold">Cảnh báo:</span> Hãy cẩn thận khi thực hiện các hành động không thể hoàn tác
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
