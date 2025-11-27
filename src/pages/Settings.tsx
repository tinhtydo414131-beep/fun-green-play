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
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AvatarUpload } from "@/components/AvatarUpload";
import { z } from "zod";

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

interface ProfileData {
  username: string;
  bio: string | null;
  avatar_url: string | null;
  email: string;
  wallet_address: string | null;
}

export default function Settings() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
        .select("username, bio, avatar_url, email, wallet_address")
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
        </div>
      </section>
    </div>
  );
}
