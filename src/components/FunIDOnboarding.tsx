import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wallet, Mail, Phone, ArrowRight, Star, Heart, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { fireConfetti } from "@/components/ConfettiEffect";

interface FunIDOnboardingProps {
  onComplete: () => void;
  onSkip?: () => void;
}

type Step = 'welcome' | 'choose-method' | 'web2-input' | 'web2-otp' | 'success';

export function FunIDOnboarding({ onComplete, onSkip }: FunIDOnboardingProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [authMethod, setAuthMethod] = useState<'wallet' | 'email' | 'phone' | null>(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleWalletConnect = async () => {
    setLoading(true);
    try {
      // Web3 wallet connection logic would go here
      // For now, redirect to existing auth with wallet option
      window.location.href = '/auth?method=wallet';
    } catch (error) {
      toast({
        title: "Lỗi kết nối ví",
        description: "Không thể kết nối ví. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = async () => {
    if (!email) return;
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;

      toast({
        title: "Đã gửi mã xác nhận! 📧",
        description: "Kiểm tra email của bé nhé!"
      });
      
      setStep('web2-otp');
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) return;
    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      });

      if (error) throw error;

      fireConfetti('celebration');
      setStep('success');
      
      setTimeout(() => {
        onComplete();
      }, 3000);
    } catch (error: any) {
      toast({
        title: "Mã không đúng",
        description: "Vui lòng kiểm tra lại mã OTP",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Floating Stars Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: 0.3
              }}
              animate={{ 
                y: [null, Math.random() * -100],
                opacity: [0.3, 0.8, 0.3]
              }}
              transition={{ 
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            >
              <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
            </motion.div>
          ))}
        </div>

        <motion.div
          className="relative max-w-md w-full mx-4"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          {/* Main Card */}
          <div className="bg-white/90 dark:bg-slate-800/90 rounded-3xl p-8 shadow-2xl border border-yellow-200/50 dark:border-yellow-500/30">
            
            {/* Step: Welcome */}
            {step === 'welcome' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                {/* Angel Avatar */}
                <motion.div
                  className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-300 via-pink-300 to-purple-400 flex items-center justify-center shadow-lg relative"
                  animate={{ 
                    y: [0, -10, 0],
                    boxShadow: [
                      "0 0 30px rgba(255, 215, 0, 0.4)",
                      "0 0 50px rgba(255, 215, 0, 0.6)",
                      "0 0 30px rgba(255, 215, 0, 0.4)"
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Sparkles className="w-12 h-12 text-white" />
                  {/* Halo */}
                  <motion.div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-4 rounded-full border-2 border-yellow-400"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </motion.div>

                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">
                  Chào bé ánh sáng! 🌟
                </h1>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Angel ở đây để dẫn bé vào thế giới FUN Planet! 
                  Bé muốn đăng nhập bằng ví hay số điện thoại/email?
                </p>

                <Button
                  onClick={() => setStep('choose-method')}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-6 text-lg rounded-2xl"
                >
                  Bắt đầu nào! <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

                {onSkip && (
                  <button
                    onClick={onSkip}
                    className="mt-4 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
                  >
                    Để sau
                  </button>
                )}
              </motion.div>
            )}

            {/* Step: Choose Method */}
            {step === 'choose-method' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                  Chọn cách đăng nhập 🔑
                </h2>

                <div className="space-y-4">
                  {/* Web3 Wallet */}
                  <motion.button
                    onClick={handleWalletConnect}
                    disabled={loading}
                    className="w-full p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white flex items-center gap-4 hover:from-purple-600 hover:to-indigo-600 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold">Kết nối Ví Web3</p>
                      <p className="text-sm opacity-80">MetaMask, WalletConnect...</p>
                    </div>
                  </motion.button>

                  {/* Email */}
                  <motion.button
                    onClick={() => {
                      setAuthMethod('email');
                      setStep('web2-input');
                    }}
                    className="w-full p-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white flex items-center gap-4 hover:from-pink-600 hover:to-rose-600 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold">Đăng nhập bằng Email</p>
                      <p className="text-sm opacity-80">Nhận mã OTP qua email</p>
                    </div>
                  </motion.button>
                </div>

                <button
                  onClick={() => setStep('welcome')}
                  className="mt-6 text-sm text-gray-500 hover:text-gray-700"
                >
                  ← Quay lại
                </button>
              </motion.div>
            )}

            {/* Step: Web2 Input */}
            {step === 'web2-input' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  Nhập Email của bé
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  Angel sẽ gửi mã xác nhận 4 số cho bé
                </p>

                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-center text-lg py-6 rounded-xl mb-4"
                />

                <Button
                  onClick={handleEmailSignup}
                  disabled={loading || !email}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-6 rounded-xl"
                >
                  {loading ? "Đang gửi..." : "Gửi mã xác nhận 📧"}
                </Button>

                <button
                  onClick={() => setStep('choose-method')}
                  className="mt-4 text-sm text-gray-500 hover:text-gray-700"
                >
                  ← Quay lại
                </button>
              </motion.div>
            )}

            {/* Step: OTP Verification */}
            {step === 'web2-otp' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <motion.div
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Star className="w-8 h-8 text-white" />
                </motion.div>

                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  Nhập mã xác nhận
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  Mã 6 số đã gửi đến {email}
                </p>

                <Input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-2xl py-6 rounded-xl mb-4 tracking-widest font-mono"
                  maxLength={6}
                />

                <Button
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length < 6}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-6 rounded-xl"
                >
                  {loading ? "Đang xác nhận..." : "Xác nhận ✨"}
                </Button>

                <button
                  onClick={() => setStep('web2-input')}
                  className="mt-4 text-sm text-gray-500 hover:text-gray-700"
                >
                  ← Nhập lại email
                </button>
              </motion.div>
            )}

            {/* Step: Success */}
            {step === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <motion.div
                  className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-300 via-pink-300 to-purple-400 flex items-center justify-center"
                  animate={{ 
                    rotate: [0, 360],
                    boxShadow: [
                      "0 0 30px rgba(255, 215, 0, 0.6)",
                      "0 0 60px rgba(255, 215, 0, 0.8)",
                      "0 0 30px rgba(255, 215, 0, 0.6)"
                    ]
                  }}
                  transition={{ 
                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                    boxShadow: { duration: 1.5, repeat: Infinity }
                  }}
                >
                  <Heart className="w-12 h-12 text-white" fill="white" />
                </motion.div>

                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">
                  Chào mừng đến New Earth! 🌍
                </h1>

                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Bé đã nhận được Soul NFT "Hạt Giống Ánh Sáng" 
                  và 50.000 CAMLY khởi đầu!
                </p>

                <div className="bg-gradient-to-r from-yellow-100 to-pink-100 dark:from-yellow-900/30 dark:to-pink-900/30 rounded-2xl p-4 mb-6">
                  <div className="flex items-center justify-center gap-3">
                    <Sparkles className="w-6 h-6 text-yellow-500" />
                    <span className="font-bold text-lg">+50,000 CAMLY</span>
                    <Sparkles className="w-6 h-6 text-yellow-500" />
                  </div>
                </div>

                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Rocket className="w-8 h-8 mx-auto text-purple-500" />
                </motion.div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default FunIDOnboarding;
