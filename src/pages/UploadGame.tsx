import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";

export default function UploadGame() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [gameFile, setGameFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    ageAppropriate: "",
    confirmed: false,
  });

  const handleGameFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.zip')) {
      setGameFile(file);
    } else {
      toast.error("Please upload a .zip file");
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setThumbnail(file);
    } else {
      toast.error("Please upload an image file");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to upload games");
      return;
    }

    if (!gameFile || !thumbnail) {
      toast.error("Please upload both game file and thumbnail");
      return;
    }

    if (!formData.confirmed) {
      toast.error("Please confirm that your game has no bad content");
      return;
    }

    setLoading(true);

    try {
      // Upload game file
      const gameFileName = `${user.id}/${Date.now()}_${gameFile.name}`;
      const { error: gameUploadError } = await supabase.storage
        .from('uploaded-games')
        .upload(gameFileName, gameFile);

      if (gameUploadError) throw gameUploadError;

      // Upload thumbnail
      const thumbnailFileName = `${user.id}/${Date.now()}_${thumbnail.name}`;
      const { error: thumbnailUploadError } = await supabase.storage
        .from('uploaded-games')
        .upload(thumbnailFileName, thumbnail);

      if (thumbnailUploadError) throw thumbnailUploadError;

      // Insert game record
      const { error: insertError } = await supabase
        .from('uploaded_games')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category as any,
          game_file_path: gameFileName,
          thumbnail_path: thumbnailFileName,
          tags: [formData.ageAppropriate],
          status: 'pending',
        });

      if (insertError) throw insertError;

      toast.success("Game uploaded successfully! It will be reviewed by our team.");
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || "Failed to upload game");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      <div className="container max-w-2xl mx-auto py-8">
        <Card className="border-primary/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Upload Your Game
            </CardTitle>
            <CardDescription className="text-base">
              Share your creation with the FUN Planet community! Approved games earn 1,000,000 Camly Coins! 🎮✨
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Game Name *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter your game's name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your game..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="action">Action</SelectItem>
                    <SelectItem value="puzzle">Puzzle</SelectItem>
                    <SelectItem value="adventure">Adventure</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                    <SelectItem value="racing">Racing</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="arcade">Arcade</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ageAppropriate">Age Appropriate *</Label>
                <Select
                  value={formData.ageAppropriate}
                  onValueChange={(value) => setFormData({ ...formData, ageAppropriate: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select age range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3+">3+ years</SelectItem>
                    <SelectItem value="6+">6+ years</SelectItem>
                    <SelectItem value="9+">9+ years</SelectItem>
                    <SelectItem value="12+">12+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gameFile">Game File (.zip) *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="gameFile"
                    type="file"
                    accept=".zip"
                    onChange={handleGameFileChange}
                    required
                    className="cursor-pointer"
                  />
                  {gameFile && <span className="text-sm text-muted-foreground">✓</span>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">Game Thumbnail (Image) *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    required
                    className="cursor-pointer"
                  />
                  {thumbnail && <span className="text-sm text-muted-foreground">✓</span>}
                </div>
              </div>

              <div className="flex items-start space-x-2 bg-primary/5 p-4 rounded-lg">
                <Checkbox
                  id="confirm"
                  checked={formData.confirmed}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, confirmed: checked as boolean })
                  }
                  required
                />
                <Label
                  htmlFor="confirm"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  I confirm that this game contains no inappropriate content and has positive,
                  child-friendly content suitable for the FUN Planet community. *
                </Label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    Submit Game for Review
                  </>
                )}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                Your game will be manually reviewed by our team. Approved games will be published and
                you'll receive 1,000,000 Camly Coins! 🎉
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
