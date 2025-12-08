import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsIOS(isIOSDevice && !isStandalone);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after 20 seconds
      setTimeout(() => {
        if (!localStorage.getItem('pwa-prompt-dismissed')) {
          setShowPrompt(true);
        }
      }, 20000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show prompt after 20 seconds
    if (isIOSDevice && !isStandalone && !localStorage.getItem('pwa-prompt-dismissed')) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 20000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-20 md:bottom-4 left-4 right-4 z-[60] md:left-auto md:right-4 md:w-96"
      >
        <div className="bg-gradient-to-r from-primary/95 to-secondary/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/20">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">
                Install FUN Planet! 📱
              </h3>
              <p className="text-sm text-white/80 mb-3">
                {isIOS 
                  ? 'Tap Share → "Add to Home Screen" for the best experience!'
                  : 'Install our app for the best gaming experience!'}
              </p>
              
              {!isIOS && (
                <Button
                  onClick={handleInstall}
                  className="w-full bg-white text-primary hover:bg-white/90 font-bold rounded-xl"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Install Now
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
