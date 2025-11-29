import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Video, Sparkles, Stars, Rocket } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface VideoOption {
  id: string;
  name: string;
  path: string;
  icon: React.ReactNode;
  description: string;
}

const videoOptions: VideoOption[] = [
  {
    id: "latest",
    name: "Mới nhất",
    path: "/videos/hero-background-latest.mp4",
    icon: <Sparkles className="h-6 w-6" />,
    description: "Video mới nhất và đẹp nhất",
  },
  {
    id: "funplanet",
    name: "FUN Planet",
    path: "/videos/hero-funplanet-user.mp4",
    icon: <Stars className="h-6 w-6" />,
    description: "Video chính thức FUN Planet",
  },
  {
    id: "original",
    name: "Nguyên bản",
    path: "/videos/hero-background.mp4",
    icon: <Rocket className="h-6 w-6" />,
    description: "Video đầu tiên của FUN Planet",
  },
];

interface BackgroundVideoSelectorProps {
  onVideoChange: (videoPath: string) => void;
  currentVideo: string;
}

export const BackgroundVideoSelector = ({
  onVideoChange,
  currentVideo,
}: BackgroundVideoSelectorProps) => {
  const [open, setOpen] = useState(false);

  const handleVideoSelect = (videoPath: string) => {
    onVideoChange(videoPath);
    localStorage.setItem("funplanet-background-video", videoPath);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="secondary"
          size="lg"
          className="fixed bottom-24 right-6 z-50 rounded-full shadow-lg hover:scale-105 transition-transform"
        >
          <Video className="h-5 w-5 mr-2" />
          Đổi nền 🎬
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[400px]">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-center">
            Chọn video nền yêu thích 🌟
          </SheetTitle>
          <SheetDescription className="text-center text-lg">
            Nhấn vào video để thay đổi nền trang chủ
          </SheetDescription>
        </SheetHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 px-4">
          {videoOptions.map((video) => (
            <button
              key={video.id}
              onClick={() => handleVideoSelect(video.path)}
              className={`
                relative p-6 rounded-2xl border-4 transition-all duration-300
                hover:scale-105 hover:shadow-2xl
                ${
                  currentVideo === video.path
                    ? "border-primary bg-primary/10 shadow-xl"
                    : "border-border bg-card hover:border-primary/50"
                }
              `}
            >
              <div className="flex flex-col items-center gap-3">
                <div
                  className={`
                  p-4 rounded-full transition-colors
                  ${
                    currentVideo === video.path
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }
                `}
                >
                  {video.icon}
                </div>
                <h3 className="font-bold text-xl">{video.name}</h3>
                <p className="text-sm text-muted-foreground text-center">
                  {video.description}
                </p>
                {currentVideo === video.path && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                    ✓ Đang dùng
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};
