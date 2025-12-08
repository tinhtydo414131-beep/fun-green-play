import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Baby, Users, Code, Sparkles } from 'lucide-react';
import { useUserRole, UserRoleType } from '@/hooks/useUserRole';
import { toast } from 'sonner';

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const roles = [
  {
    id: 'kid' as UserRoleType,
    title: 'I\'m a Kid! 👦👧',
    titleVi: 'Con là trẻ em!',
    description: 'Play games, earn rewards, and have fun!',
    descriptionVi: 'Chơi game, kiếm thưởng và vui chơi!',
    icon: Baby,
    color: 'from-pink-500 to-purple-500',
    emoji: '🎮',
  },
  {
    id: 'parent' as UserRoleType,
    title: 'I\'m a Parent 👨‍👩‍👧',
    titleVi: 'Tôi là phụ huynh',
    description: 'Monitor your child\'s activity and rewards',
    descriptionVi: 'Theo dõi hoạt động và phần thưởng của con',
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
    emoji: '👪',
  },
  {
    id: 'dev' as UserRoleType,
    title: 'I\'m a Developer 💻',
    titleVi: 'Tôi là lập trình viên',
    description: 'Create games and earn 1,000,000 CAMLY per game!',
    descriptionVi: 'Tạo game và kiếm 1,000,000 CAMLY mỗi game!',
    icon: Code,
    color: 'from-green-500 to-emerald-500',
    emoji: '🚀',
  },
];

export function RoleSelectionModal({ isOpen, onClose }: RoleSelectionModalProps) {
  const { selectRole } = useUserRole();
  const [selectedRole, setSelectedRole] = useState<UserRoleType>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectRole = async () => {
    if (!selectedRole) {
      toast.error('Please select a role first!');
      return;
    }

    setIsSubmitting(true);
    const success = await selectRole(selectedRole);
    setIsSubmitting(false);

    if (success) {
      toast.success(`Welcome to FUN Planet! 🎉`, {
        description: `You're now registered as a ${selectedRole}!`,
      });
      onClose();
    } else {
      toast.error('Failed to save role. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 border-4 border-primary/30">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-2"
            >
              <div className="text-5xl mb-2">🌍</div>
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Welcome to FUN Planet!
              </h2>
              <p className="text-muted-foreground text-base font-normal">
                Chào mừng đến FUN Planet! Bạn là ai?
              </p>
            </motion.div>
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {roles.map((role, index) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;

            return (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedRole(role.id)}
                className={`w-full p-4 rounded-2xl border-3 transition-all duration-300 text-left group ${
                  isSelected
                    ? 'border-primary bg-primary/10 scale-[1.02] shadow-lg'
                    : 'border-border hover:border-primary/50 hover:bg-primary/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${role.color} text-white shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{role.title}</span>
                      {isSelected && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-xl"
                        >
                          ✅
                        </motion.span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{role.descriptionVi}</p>
                  </div>
                  <span className="text-2xl">{role.emoji}</span>
                </div>
              </motion.button>
            );
          })}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={handleSelectRole}
              disabled={!selectedRole || isSubmitting}
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-secondary hover:shadow-xl transition-all rounded-2xl"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Continue to FUN Planet! 🚀
                </span>
              )}
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
