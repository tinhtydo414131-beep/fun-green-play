import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, Gamepad2, ArrowLeft } from "lucide-react";

const CATEGORIES = [
  { value: "action", label: "Action" },
  { value: "puzzle", label: "Puzzle" },
  { value: "adventure", label: "Adventure" },
  { value: "casual", label: "Casual" },
  { value: "educational", label: "Educational" },
  { value: "racing", label: "Racing" },
  { value: "sports", label: "Sports" },
  { value: "arcade", label: "Arcade" },
];

const UploadGame = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
  });
  const [gameFile, setGameFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'game' | 'thumbnail') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'game') {
      const validTypes = ['.zip', '.html', '.js'];
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!validTypes.includes(fileExt)) {
        toast.error("Invalid file type. Only .zip, .html, and .js files are allowed.");
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File too large. Maximum size is 50MB.");
        return;
      }
      setGameFile(file);
    } else {
      if (!file.type.startsWith('image/')) {
        toast.error("Thumbnail must be an image file.");
        return;
      }
      setThumbnail(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !gameFile) {
      toast.error("Please select a game file to upload.");
      return;
    }

    setUploading(true);
    try {
      // Upload game file
      const gameFileName = `${user.id}/${Date.now()}_${gameFile.name}`;
      const { error: gameUploadError } = await supabase.storage
        .from('uploaded-games')
        .upload(gameFileName, gameFile);

      if (gameUploadError) throw gameUploadError;

      // Upload thumbnail if provided
      let thumbnailPath = null;
      if (thumbnail) {
        const thumbFileName = `${user.id}/${Date.now()}_thumb_${thumbnail.name}`;
        const { error: thumbUploadError } = await supabase.storage
          .from('uploaded-games')
          .upload(thumbFileName, thumbnail);
        
        if (thumbUploadError) throw thumbUploadError;
        thumbnailPath = thumbFileName;
      }

      // Create game record
      const { error: dbError } = await supabase
        .from('uploaded_games')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category as any,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
          game_file_path: gameFileName,
          thumbnail_path: thumbnailPath,
        });

      if (dbError) throw dbError;

      // Award 10,000 coins
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', user.id)
        .single();

      if (currentProfile) {
        await supabase
          .from('profiles')
          .update({ 
            wallet_balance: (currentProfile.wallet_balance || 0) + 10000
          })
          .eq('id', user.id);
      }

      toast.success("🎮 Game uploaded successfully! You earned 10,000 Camly Coins!");
      navigate('/my-games');
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload game. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <p className="text-center">Please sign in to upload games.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="p-8 shadow-xl border-2 border-primary/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Gamepad2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Upload Your Game</h1>
              <p className="text-muted-foreground">Share your creation with the community!</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Game Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="My Awesome Game"
                required
                maxLength={100}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe your game..."
                rows={4}
                maxLength={500}
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({...formData, category: value})}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                placeholder="fun, multiplayer, kids"
              />
            </div>

            <div>
              <Label htmlFor="game">Game File * (.zip, .html, .js - Max 50MB)</Label>
              <Input
                id="game"
                type="file"
                onChange={(e) => handleFileChange(e, 'game')}
                accept=".zip,.html,.js"
                required
              />
              {gameFile && (
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {gameFile.name} ({(gameFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="thumbnail">Thumbnail (optional)</Label>
              <Input
                id="thumbnail"
                type="file"
                onChange={(e) => handleFileChange(e, 'thumbnail')}
                accept="image/*"
              />
              {thumbnail && (
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {thumbnail.name}
                </p>
              )}
            </div>

            <div className="bg-accent/20 p-4 rounded-lg border border-accent/30">
              <p className="text-sm font-medium flex items-center gap-2">
                <span className="text-2xl">💰</span>
                Upload Reward: 10,000 Camly Coins
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Get 1,000,000 coins if your game gets approved!
              </p>
            </div>

            <Button
              type="submit"
              disabled={uploading || !gameFile || !formData.title || !formData.category}
              className="w-full h-12 text-lg"
            >
              {uploading ? (
                <>Uploading...</>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Game
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default UploadGame;
