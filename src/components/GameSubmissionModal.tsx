import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Rocket, Send, Sparkles, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface GameSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GameSubmissionModal = ({ isOpen, onClose }: GameSubmissionModalProps) => {
  const [formData, setFormData] = useState({
    gameTitle: "",
    description: "",
    lovableUrl: "",
    githubUrl: "",
    creatorName: "",
    email: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.gameTitle || !formData.lovableUrl || !formData.creatorName) {
      toast.error("Please fill in all required fields!");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate submission - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    toast.success("Game submitted successfully! We'll review it soon. 🎉");
    
    // Reset after showing success
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        gameTitle: "",
        description: "",
        lovableUrl: "",
        githubUrl: "",
        creatorName: "",
        email: ""
      });
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg border-2 border-primary/50 bg-card/95 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-fredoka text-2xl text-foreground">
            <Rocket className="w-6 h-6 text-primary" />
            Submit Your Game
            <Sparkles className="w-5 h-5 text-secondary animate-pulse" />
          </DialogTitle>
          <DialogDescription className="font-comic text-muted-foreground">
            Share your Lovable creation with the community!
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
                Submitted Successfully! 🎉
              </h3>
              <p className="text-sm font-comic text-muted-foreground text-center">
                We'll review your game and add it to the hub soon!
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
                <Label htmlFor="gameTitle" className="font-fredoka font-bold">
                  Game Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="gameTitle"
                  name="gameTitle"
                  value={formData.gameTitle}
                  onChange={handleChange}
                  placeholder="My Awesome Game"
                  className="border-2 border-primary/30 focus:border-primary font-comic"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="font-fredoka font-bold">
                  Short Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="A fun game where you..."
                  className="border-2 border-primary/30 focus:border-primary font-comic resize-none"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lovableUrl" className="font-fredoka font-bold">
                  Lovable Project URL <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lovableUrl"
                  name="lovableUrl"
                  value={formData.lovableUrl}
                  onChange={handleChange}
                  placeholder="https://lovable.dev/projects/your-game"
                  className="border-2 border-primary/30 focus:border-primary font-comic"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="githubUrl" className="font-fredoka font-bold">
                  GitHub ZIP URL (optional)
                </Label>
                <Input
                  id="githubUrl"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleChange}
                  placeholder="https://github.com/you/game/archive/main.zip"
                  className="border-2 border-primary/30 focus:border-primary font-comic"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="creatorName" className="font-fredoka font-bold">
                    Your Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="creatorName"
                    name="creatorName"
                    value={formData.creatorName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="border-2 border-primary/30 focus:border-primary font-comic"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-fredoka font-bold">
                    Email (optional)
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@email.com"
                    className="border-2 border-primary/30 focus:border-primary font-comic"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 font-fredoka font-bold border-2"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 font-fredoka font-bold bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Game
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
