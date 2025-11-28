import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Smartphone, CheckCircle2, Apple, Chrome } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-primary/5 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          ← Quay lại
        </Button>

        <div className="text-center space-y-4">
          <Smartphone className="w-16 h-16 mx-auto text-primary animate-bounce" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Cài đặt FUN Planet
          </h1>
          <p className="text-lg text-muted-foreground">
            Trải nghiệm tốt nhất với ứng dụng di động!
          </p>
        </div>

        {isInstalled ? (
          <Card className="p-8 text-center space-y-4 border-2 border-green-500/50 bg-green-500/5">
            <CheckCircle2 className="w-16 h-16 mx-auto text-green-500" />
            <h2 className="text-2xl font-bold text-green-500">Đã cài đặt!</h2>
            <p className="text-muted-foreground">
              FUN Planet đã được cài đặt trên thiết bị của bạn.
            </p>
            <Button onClick={() => navigate('/')} size="lg" className="w-full">
              Bắt đầu chơi
            </Button>
          </Card>
        ) : (
          <>
            {isIOS ? (
              <Card className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Apple className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Cài đặt trên iOS</h3>
                    <ol className="space-y-2 text-sm text-muted-foreground">
                      <li>1. Nhấn vào nút <strong>Chia sẻ</strong> (Share) ở thanh menu Safari</li>
                      <li>2. Cuộn xuống và chọn <strong>Thêm vào Màn hình chính</strong> (Add to Home Screen)</li>
                      <li>3. Nhấn <strong>Thêm</strong> (Add) để hoàn tất</li>
                    </ol>
                  </div>
                </div>
              </Card>
            ) : isInstallable ? (
              <Card className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Chrome className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Cài đặt trên Android</h3>
                    <p className="text-sm text-muted-foreground">
                      Nhấn nút bên dưới để cài đặt FUN Planet lên màn hình chính của bạn
                    </p>
                  </div>
                </div>
                <Button onClick={handleInstall} size="lg" className="w-full gap-2">
                  <Download className="w-5 h-5" />
                  Cài đặt ứng dụng
                </Button>
              </Card>
            ) : (
              <Card className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Chrome className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Cài đặt trên Android</h3>
                    <ol className="space-y-2 text-sm text-muted-foreground">
                      <li>1. Mở menu trình duyệt (⋮)</li>
                      <li>2. Chọn <strong>Thêm vào Màn hình chính</strong> hoặc <strong>Cài đặt ứng dụng</strong></li>
                      <li>3. Nhấn <strong>Cài đặt</strong> để hoàn tất</li>
                    </ol>
                  </div>
                </div>
              </Card>
            )}

            <Card className="p-6 space-y-3 bg-primary/5 border-primary/20">
              <h3 className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Lợi ích khi cài đặt
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Truy cập nhanh từ màn hình chính
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Hoạt động offline, chơi mọi lúc mọi nơi
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Trải nghiệm toàn màn hình như app native
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Tải nhanh hơn, hiệu suất tốt hơn
                </li>
              </ul>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Install;
