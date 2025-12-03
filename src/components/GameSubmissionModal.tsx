import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Rocket, Send, Sparkles, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

interface GameSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const gameSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên của bạn").max(100, "Tên không được quá 100 ký tự"),
  title: z.string().trim().min(1, "Vui lòng nhập tên game").max(100, "Tên game không được quá 100 ký tự"),
  description: z.string().trim().max(150, "Mô tả không được quá 150 ký tự").optional(),
  projectUrl: z.string().trim().min(1, "Vui lòng nhập link dự án").refine(
    (url) => url.includes("lovable.app") || url.includes("lovable.dev"),
    "Link phải chứa lovable.app hoặc lovable.dev"
  ),
  imageUrl: z.string().trim().url("Vui lòng nhập URL hợp lệ").optional().or(z.literal("")),
  zipUrl: z.string().trim().url("Vui lòng nhập URL hợp lệ").optional().or(z.literal(""))
});

export const GameSubmissionModal = ({ isOpen, onClose }: GameSubmissionModalProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    description: "",
    projectUrl: "",
    imageUrl: "",
    zipUrl: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === "description") {
      setCharCount(value.length);
    }
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate with zod
    const result = gameSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    if (!user) {
      toast.error("Vui lòng đăng nhập để gửi game nha!");
      return;
    }

    setIsSubmitting(true);
    
    const { error } = await supabase.from("lovable_games").insert({
      name: formData.name.trim(),
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      project_url: formData.projectUrl.trim(),
      image_url: formData.imageUrl.trim() || null,
      zip_url: formData.zipUrl.trim() || null,
      user_id: user.id,
      approved: false
    });
    
    setIsSubmitting(false);
    
    if (error) {
      toast.error("Gửi game thất bại. Vui lòng thử lại nha!");
      console.error("Submission error:", error.message);
      return;
    }

    setIsSubmitted(true);
    toast.success("Cảm ơn bạn! Game đã được gửi, Cha sẽ duyệt và up lên sớm thôi! 🎉");
    
    // Reset after showing success
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: "",
        title: "",
        description: "",
        projectUrl: "",
        imageUrl: "",
        zipUrl: ""
      });
      setCharCount(0);
      onClose();
    }, 2500);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg border-2 border-primary/50 bg-card/95 backdrop-blur-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-fredoka text-2xl text-foreground">
            <Rocket className="w-6 h-6 text-primary" />
            Gửi Game Của Bạn Lên Fun Planet!
            <Sparkles className="w-5 h-5 text-secondary animate-pulse" />
          </DialogTitle>
          <DialogDescription className="font-comic text-muted-foreground">
            Chia sẻ trò chơi Lovable của bạn với cả cộng đồng nào!
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {isSubmitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="py-12 flex flex-col items-center justify-center gap-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10 }}
              >
                <CheckCircle className="w-20 h-20 text-green-500" />
              </motion.div>
              <h3 className="text-xl font-fredoka font-bold text-foreground">
                Cảm ơn bạn! 🎉
              </h3>
              <p className="text-sm font-comic text-muted-foreground text-center">
                Cha sẽ duyệt và up game của bạn lên sớm thôi!
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-4 mt-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name" className="font-fredoka font-bold">
                  Tên của bạn <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  className={`border-2 ${errors.name ? 'border-red-500' : 'border-primary/30'} focus:border-primary font-comic`}
                />
                {errors.name && <p className="text-xs text-red-500 font-comic">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="font-fredoka font-bold">
                  Tên game <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Game Siêu Vui"
                  className={`border-2 ${errors.title ? 'border-red-500' : 'border-primary/30'} focus:border-primary font-comic`}
                />
                {errors.title && <p className="text-xs text-red-500 font-comic">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="font-fredoka font-bold">
                  Mô tả ngắn <span className="text-muted-foreground text-sm">(tối đa {charCount}/150 ký tự)</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Một trò chơi vui nhộn..."
                  maxLength={150}
                  className={`border-2 ${errors.description ? 'border-red-500' : 'border-primary/30'} focus:border-primary font-comic resize-none`}
                  rows={2}
                />
                {errors.description && <p className="text-xs text-red-500 font-comic">{errors.description}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectUrl" className="font-fredoka font-bold">
                  Link dự án Lovable <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="projectUrl"
                  name="projectUrl"
                  value={formData.projectUrl}
                  onChange={handleChange}
                  placeholder="https://game-cua-ban.lovable.app"
                  className={`border-2 ${errors.projectUrl ? 'border-red-500' : 'border-primary/30'} focus:border-primary font-comic`}
                />
                {errors.projectUrl && <p className="text-xs text-red-500 font-comic">{errors.projectUrl}</p>}
                <p className="text-xs text-muted-foreground font-comic">Phải chứa lovable.app hoặc lovable.dev</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="font-fredoka font-bold">
                  Link ảnh thumbnail <span className="text-muted-foreground text-sm">(không bắt buộc)</span>
                </Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/anh-game.png"
                  className={`border-2 ${errors.imageUrl ? 'border-red-500' : 'border-primary/30'} focus:border-primary font-comic`}
                />
                {errors.imageUrl && <p className="text-xs text-red-500 font-comic">{errors.imageUrl}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipUrl" className="font-fredoka font-bold">
                  Link tải file ZIP <span className="text-muted-foreground text-sm">(không bắt buộc)</span>
                </Label>
                <Input
                  id="zipUrl"
                  name="zipUrl"
                  value={formData.zipUrl}
                  onChange={handleChange}
                  placeholder="https://github.com/user/repo/archive/main.zip"
                  className={`border-2 ${errors.zipUrl ? 'border-red-500' : 'border-primary/30'} focus:border-primary font-comic`}
                />
                {errors.zipUrl && <p className="text-xs text-red-500 font-comic">{errors.zipUrl}</p>}
                <p className="text-xs text-muted-foreground font-comic">GitHub, Dropbox hoặc link tải trực tiếp</p>
              </div>

              {!user && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm font-comic text-yellow-600 dark:text-yellow-400">
                    ⚠️ Vui lòng đăng nhập để gửi game nha!
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 font-fredoka font-bold border-2"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !user}
                  className="flex-1 font-fredoka font-bold bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Gửi Game Ngay!
                    </>
                  )}
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
