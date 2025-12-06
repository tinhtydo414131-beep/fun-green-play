import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Briefcase, GraduationCap, MapPin, Heart, 
  Edit2, Save, X, Plus, Wallet, Trophy, 
  Gamepad2, Users, MessageCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface AboutSectionProps {
  profile: {
    id: string;
    bio?: string | null;
    bio_full?: string | null;
    workplace?: string | null;
    education?: string | null;
    location?: string | null;
    relationship_status?: string | null;
    total_plays: number;
    total_friends: number;
    total_messages: number;
  };
  camlyBalance: number;
  userRank: number;
  isOwnProfile?: boolean;
  onProfileUpdate: (updates: any) => void;
}

export function AboutSection({ 
  profile, 
  camlyBalance, 
  userRank, 
  isOwnProfile = true, 
  onProfileUpdate 
}: AboutSectionProps) {
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    bio_full: profile.bio_full || '',
    workplace: profile.workplace || '',
    education: profile.education || '',
    location: profile.location || '',
    relationship_status: profile.relationship_status || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          bio_full: editForm.bio_full || null,
          workplace: editForm.workplace || null,
          education: editForm.education || null,
          location: editForm.location || null,
          relationship_status: editForm.relationship_status || null,
        })
        .eq('id', profile.id);

      if (error) throw error;

      onProfileUpdate(editForm);
      setEditing(false);
      toast.success('Profile updated!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const infoItems = [
    { 
      icon: Briefcase, 
      label: 'Works at', 
      value: profile.workplace,
      field: 'workplace',
      placeholder: 'Add workplace'
    },
    { 
      icon: GraduationCap, 
      label: 'Studied at', 
      value: profile.education,
      field: 'education',
      placeholder: 'Add education'
    },
    { 
      icon: MapPin, 
      label: 'Lives in', 
      value: profile.location,
      field: 'location',
      placeholder: 'Add current city'
    },
    { 
      icon: Heart, 
      label: 'Relationship', 
      value: profile.relationship_status,
      field: 'relationship_status',
      placeholder: 'Add relationship status'
    },
  ];

  const statsItems = [
    { icon: Wallet, label: 'CAMLY Balance', value: camlyBalance.toLocaleString() },
    { icon: Trophy, label: 'Leaderboard Rank', value: `#${userRank}` },
    { icon: Gamepad2, label: 'Games Played', value: profile.total_plays.toLocaleString() },
    { icon: Users, label: 'Friends', value: profile.total_friends.toLocaleString() },
    { icon: MessageCircle, label: 'Messages', value: profile.total_messages.toLocaleString() },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Left Column - Overview */}
      <div className="lg:col-span-2 space-y-4">
        {/* Bio */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold">About</CardTitle>
              {isOwnProfile && !editing && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setEditing(true)}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {editing ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div>
                  <label className="text-sm font-medium mb-1 block">Bio</label>
                  <Textarea
                    value={editForm.bio_full}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio_full: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>

                {infoItems.map((item) => (
                  <div key={item.field}>
                    <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </label>
                    <Input
                      value={editForm[item.field as keyof typeof editForm]}
                      onChange={(e) => setEditForm(prev => ({ ...prev, [item.field]: e.target.value }))}
                      placeholder={item.placeholder}
                    />
                  </div>
                ))}

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {/* Bio Text */}
                {profile.bio_full ? (
                  <p className="text-muted-foreground">{profile.bio_full}</p>
                ) : isOwnProfile ? (
                  <button 
                    onClick={() => setEditing(true)}
                    className="text-muted-foreground hover:text-foreground transition"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Add bio
                  </button>
                ) : null}

                {/* Info Items */}
                {infoItems.map((item) => (
                  item.value ? (
                    <div key={item.field} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-muted-foreground" />
                      <span>
                        <span className="text-muted-foreground">{item.label} </span>
                        <span className="font-medium">{item.value}</span>
                      </span>
                    </div>
                  ) : isOwnProfile ? (
                    <button 
                      key={item.field}
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition"
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="flex items-center gap-1">
                        <Plus className="w-4 h-4" />
                        {item.placeholder}
                      </span>
                    </button>
                  ) : null
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Stats */}
      <div className="space-y-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {statsItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="font-bold">{item.value}</p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
