import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Sparkles, Play } from "lucide-react";

export const FeaturedGame = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-yellow-500 animate-pulse" />
            <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
              Featured Game
            </h2>
            <Sparkles className="h-8 w-8 text-yellow-500 animate-pulse" />
          </div>
          <p className="text-lg text-muted-foreground font-medium">New and exciting!</p>
        </div>

        {/* Featured Game Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-cyan-500/10 border-4 border-transparent">
          {/* Gradient Border Effect */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-75 blur-xl -z-10" />
          
          <div className="relative bg-background/95 backdrop-blur-sm rounded-lg p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Game Image */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                <img
                  src="/images/games/treasure-hunt.jpg"
                  alt="Thợ Đào Vàng"
                  className="relative rounded-2xl w-full aspect-square object-cover shadow-2xl group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Game Info */}
              <div className="space-y-6">
                {/* NEW Badge */}
                <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 text-sm font-bold">
                  <Sparkles className="h-4 w-4 mr-1" />
                  NEW
                  <Sparkles className="h-4 w-4 ml-1" />
                </Badge>

                {/* Title */}
                <h3 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  Thợ Đào Vàng
                </h3>

                {/* Description */}
                <p className="text-lg text-foreground/80">
                  Đào vàng, kim cương và kho báu quý giá! Mỗi lần đào có thể tìm thấy điều bất ngờ!
                </p>

                {/* Tags */}
                <div className="flex gap-3 flex-wrap">
                  <Badge variant="secondary" className="px-4 py-2 text-sm font-semibold">
                    🎮 casual
                  </Badge>
                  <Badge variant="outline" className="px-4 py-2 text-sm font-semibold border-2">
                    ⭐ easy
                  </Badge>
                </div>

                {/* Stats */}
                <div className="flex gap-6 text-sm font-medium text-muted-foreground">
                  <span className="flex items-center gap-2">
                    🎯 0 plays
                  </span>
                  <span className="flex items-center gap-2">
                    ❤️ 0 likes
                  </span>
                </div>

                {/* Play Button */}
                <Button
                  onClick={() => navigate("/games/treasure-hunt")}
                  size="lg"
                  className="w-full h-14 text-xl font-black bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 hover:from-purple-600 hover:via-pink-600 hover:to-cyan-600 shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
                >
                  <Play className="h-6 w-6 mr-2" />
                  Play Now!
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
