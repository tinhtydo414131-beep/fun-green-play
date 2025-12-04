import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Medal, Crown, Star, Sparkles, Trophy, Gamepad2, 
  Users, Music, Upload, Shield
} from "lucide-react";
import { getEarnedBadges, REFERRAL_TIERS } from "@/utils/referralTiers";

interface ProfileBadgesProps {
  totalReferrals: number;
}

type BadgeRarity = "common" | "rare" | "epic" | "legendary";

interface BadgeItem {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  earned: boolean;
  description: string;
  rarity: BadgeRarity;
}

export function ProfileBadges({ totalReferrals }: ProfileBadgesProps) {
  const earnedReferralBadges = getEarnedBadges(totalReferrals);

  const getRarity = (tierId: string): BadgeRarity => {
    if (tierId === "legend") return "legendary";
    if (tierId === "diamond") return "epic";
    if (tierId === "gold") return "rare";
    return "common";
  };

  // All available badges
  const allBadges: BadgeItem[] = [
    // Referral badges from tiers
    ...REFERRAL_TIERS.filter(t => t.id !== "none").map(tier => ({
      id: tier.id,
      name: tier.name,
      icon: tier.id === "legend" ? Crown : tier.id === "diamond" ? Sparkles : tier.id === "gold" ? Star : Medal,
      color: tier.color,
      bgColor: `bg-${tier.color.replace("text-", "")}/10`,
      earned: earnedReferralBadges.includes(tier.name),
      description: `Invite ${tier.requiredReferrals} friends`,
      rarity: getRarity(tier.id)
    })),
    // Other achievement badges
    {
      id: "gamer",
      name: "Gamer Pro",
      icon: Gamepad2,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      earned: false,
      description: "Play 100 games",
      rarity: "rare" as BadgeRarity
    },
    {
      id: "social",
      name: "Social Star",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      earned: false,
      description: "Make 20 friends",
      rarity: "rare" as BadgeRarity
    },
    {
      id: "creator",
      name: "Game Creator",
      icon: Upload,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      earned: false,
      description: "Upload a game",
      rarity: "epic" as BadgeRarity
    },
    {
      id: "musician",
      name: "DJ Master",
      icon: Music,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
      earned: false,
      description: "Upload music",
      rarity: "rare" as BadgeRarity
    }
  ];

  const earnedBadges = allBadges.filter(b => b.earned);
  const lockedBadges = allBadges.filter(b => !b.earned);

  const rarityColors = {
    common: "border-gray-400",
    rare: "border-blue-400",
    epic: "border-purple-400",
    legendary: "border-yellow-400 shadow-yellow-400/50 shadow-lg"
  };

  const rarityGlow = {
    common: "",
    rare: "hover:shadow-blue-400/30",
    epic: "hover:shadow-purple-400/30",
    legendary: "hover:shadow-yellow-400/50 animate-pulse"
  };

  return (
    <div className="space-y-6">
      {/* Earned Badges */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
        <CardHeader>
          <CardTitle className="font-fredoka flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Earned Badges ({earnedBadges.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {earnedBadges.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {earnedBadges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`relative p-4 rounded-xl border-2 ${rarityColors[badge.rarity]} ${rarityGlow[badge.rarity]} ${badge.bgColor} transition-all hover:scale-105 cursor-pointer`}
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className={`p-3 rounded-full ${badge.bgColor} ring-2 ring-offset-2 ring-offset-background`} style={{ boxShadow: badge.rarity === "legendary" ? "0 0 20px currentColor" : undefined }}>
                      <badge.icon className={`w-8 h-8 ${badge.color}`} />
                    </div>
                    <span className="font-fredoka font-bold text-sm">{badge.name}</span>
                    <span className="text-xs text-muted-foreground">{badge.description}</span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {badge.rarity}
                    </Badge>
                  </div>
                  {badge.rarity === "legendary" && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-500/20 via-transparent to-orange-500/20 pointer-events-none animate-pulse" />
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Medal className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-comic">No badges earned yet! Start inviting friends to unlock badges 🎯</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Locked Badges */}
      <Card className="border-2 border-muted">
        <CardHeader>
          <CardTitle className="font-fredoka flex items-center gap-2 text-muted-foreground">
            <Shield className="w-5 h-5" />
            Locked Badges ({lockedBadges.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {lockedBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="relative p-4 rounded-xl border-2 border-muted bg-muted/20 opacity-60"
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="p-3 rounded-full bg-muted">
                    <badge.icon className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <span className="font-fredoka font-bold text-sm text-muted-foreground">{badge.name}</span>
                  <span className="text-xs text-muted-foreground">{badge.description}</span>
                  <Badge variant="secondary" className="text-xs">
                    🔒 Locked
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
