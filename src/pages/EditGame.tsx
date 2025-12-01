import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Save, ArrowLeft } from "lucide-react";

export default function EditGame() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    ageAppropriate: "",
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (id) {
      loadGame();
    }
  }, [user, id]);

  const loadGame = async () => {
    if (!id) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('uploaded_games')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      toast.error("Failed to load game");
      console.error(error);
      navigate('/my-games');
      return;
    }

    if (!data) {
      toast.error("Game not found");
      navigate('/my-games');
      return;
    }

    if (data.user_id !== user?.id) {
      toast.error("You don't have permission to edit this game");
      navigate('/my-games');
      return;
    }

    setFormData({
      title: data.title,
      description: data.description || "",
      category: data.category,
      ageAppropriate: data.tags?.[0] || "",
    });
    setLoading(false);
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
    
    if (!user || !id) return;

    setSaving(true);

    try {
      let thumbnailPath = null;

      // Upload new thumbnail if provided
      if (thumbnail) {
        const thumbnailFileName = `${user.id}/${Date.now()}_${thumbnail.name}`;
        const { error: thumbnailUploadError } = await supabase.storage
          .from('uploaded-games')
          .upload(thumbnailFileName, thumbnail);

        if (thumbnailUploadError) throw thumbnailUploadError;
        thumbnailPath = thumbnailFileName;
      }

      // Update game record
      const updateData: any = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: [formData.ageAppropriate],
      };

      if (thumbnailPath) {
        updateData.thumbnail_path = thumbnailPath;
      }

      const { error: updateError } = await supabase
        .from('uploaded_games')
        .update(updateData)
        .eq('id', id);

      if (updateError) throw updateError;

      toast.success("Game updated successfully!");
      navigate('/my-games');
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error.message || "Failed to update game");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      <div className="container max-w-2xl mx-auto py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/my-games')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Games
        </Button>

        <Card className="border-primary/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Edit Game
            </CardTitle>
            <CardDescription className="text-base">
              Update your game's information
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
                <Label htmlFor="thumbnail">Update Thumbnail (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="cursor-pointer"
                  />
                  {thumbnail && <span className="text-sm text-muted-foreground">✓</span>}
                </div>
                <p className="text-xs text-muted-foreground">
                  Leave empty to keep current thumbnail
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/my-games')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
