import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, BookOpen, Download, ExternalLink, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';

export const BuildGuide30Seconds = () => {
  const [open, setOpen] = useState(false);
  const { i18n } = useTranslation();
  const isVN = i18n.language === 'vi';

  const steps = [
    {
      icon: '🎨',
      title: isVN ? 'Bước 1: Tạo game trên Lovable' : 'Step 1: Create game on Lovable',
      description: isVN 
        ? 'Truy cập lovable.dev, mô tả game bạn muốn và để AI tạo cho bạn!'
        : 'Go to lovable.dev, describe your game and let AI create it!',
      time: '10s'
    },
    {
      icon: '📦',
      title: isVN ? 'Bước 2: Publish project' : 'Step 2: Publish project',
      description: isVN
        ? 'Click nút "Publish" để lấy link deploy hoặc download ZIP'
        : 'Click "Publish" button to get deploy link or download ZIP',
      time: '5s'
    },
    {
      icon: '📤',
      title: isVN ? 'Bước 3: Upload lên FUN Planet' : 'Step 3: Upload to FUN Planet',
      description: isVN
        ? 'Dán link deploy hoặc kéo thả file ZIP vào form upload!'
        : 'Paste deploy link or drag & drop ZIP file to upload form!',
      time: '15s'
    },
    {
      icon: '🎉',
      title: isVN ? 'Bước 4: Nhận 500K CAMLY!' : 'Step 4: Receive 500K CAMLY!',
      description: isVN
        ? 'Game được duyệt = nhận thưởng ngay lập tức!'
        : 'Game approved = receive reward instantly!',
      time: '⭐'
    }
  ];

  const platforms = [
    { 
      name: 'Lovable', 
      url: 'https://lovable.dev', 
      icon: '💜', 
      desc: isVN ? 'AI tạo game tự động' : 'AI auto-generates games' 
    },
    { 
      name: 'Vercel', 
      url: 'https://vercel.com', 
      icon: '▲', 
      desc: isVN ? 'Deploy miễn phí' : 'Free deployment' 
    },
    { 
      name: 'Glitch', 
      url: 'https://glitch.com', 
      icon: '🎏', 
      desc: isVN ? 'Code & host online' : 'Code & host online' 
    },
    { 
      name: 'GitHub Pages', 
      url: 'https://pages.github.com', 
      icon: '🐙', 
      desc: isVN ? 'Miễn phí từ repo' : 'Free from repo' 
    }
  ];

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="gap-2 border-2 border-primary/30 hover:border-primary hover:bg-primary/10"
      >
        <BookOpen className="w-4 h-4" />
        {isVN ? 'Hướng dẫn 30 giây 📖' : '30-second guide 📖'}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Clock className="w-5 h-5 text-primary" />
              {isVN ? 'Tạo & Upload Game trong 30 Giây! ⚡' : 'Create & Upload Game in 30 Seconds! ⚡'}
            </DialogTitle>
            <DialogDescription>
              {isVN 
                ? 'Không cần biết code! AI sẽ giúp bạn tạo game thật đơn giản.'
                : 'No coding required! AI will help you create games easily.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Steps */}
            <div className="space-y-3">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4 p-4 bg-muted/50 rounded-xl border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="text-3xl flex-shrink-0">{step.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-sm">{step.title}</h4>
                      <span className="text-xs text-primary font-mono bg-primary/10 px-2 py-0.5 rounded-full">
                        {step.time}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Platforms */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Download className="w-4 h-4" />
                {isVN ? 'Nền tảng được hỗ trợ' : 'Supported platforms'}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {platforms.map((platform) => (
                  <a
                    key={platform.name}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-card border rounded-lg hover:border-primary/50 transition-colors group"
                  >
                    <span className="text-xl">{platform.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm group-hover:text-primary transition-colors">
                        {platform.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {platform.desc}
                      </p>
                    </div>
                    <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>

            {/* Video tutorial placeholder */}
            <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl overflow-hidden flex items-center justify-center group cursor-pointer border border-primary/20">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative z-10 w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl"
              >
                <Play className="w-8 h-8 text-primary fill-primary ml-1" />
              </motion.div>
              <p className="absolute bottom-3 left-3 text-white text-sm font-medium">
                {isVN ? '📺 Xem video hướng dẫn' : '📺 Watch tutorial video'}
              </p>
            </div>

            {/* CTA */}
            <Button
              onClick={() => setOpen(false)}
              className="w-full gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              {isVN ? 'Bắt đầu upload ngay!' : 'Start uploading now!'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BuildGuide30Seconds;
