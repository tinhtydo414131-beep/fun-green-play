import { useState, useCallback } from "react";
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
import { Upload, Loader2, ArrowLeft, Link, FileArchive, Shield, CheckCircle, XCircle, AlertTriangle, Cloud } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation } from "@/components/Navigation";

interface ScanResult {
  safe: boolean;
  reason: string;
  confidence: number;
  needsReview?: boolean;
}

export default function UploadGame() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadType, setUploadType] = useState<"zip" | "lovable">("zip");
  const [gameFile, setGameFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [isDraggingGame, setIsDraggingGame] = useState(false);
  const [isDraggingThumb, setIsDraggingThumb] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    ageAppropriate: "",
    confirmed: false,
    lovableUrl: "",
    imageUrl: "",
  });

  // Drag and drop handlers for game file
  const handleGameDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingGame(true);
  }, []);

  const handleGameDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingGame(false);
  }, []);

  const handleGameDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingGame(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.zip')) {
      setGameFile(file);
      toast.success(`Game file "${file.name}" ready! 🎮`);
    } else {
      toast.error("Please drop a .zip file");
    }
  }, []);

  // Drag and drop handlers for thumbnail
  const handleThumbDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingThumb(true);
  }, []);

  const handleThumbDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingThumb(false);
  }, []);

  const handleThumbDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingThumb(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setThumbnail(file);
      toast.success(`Thumbnail "${file.name}" ready! 🖼️`);
    } else {
      toast.error("Please drop an image file");
    }
  }, []);

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

  const validateLovableUrl = (url: string) => {
    const lovablePattern = /^https?:\/\/[a-zA-Z0-9-]+\.lovable\.(app|dev)(\/.*)?$/;
    return lovablePattern.test(url);
  };

  // AI Safety Scan
  const runSafetyScan = async (): Promise<boolean> => {
    if (!formData.title || !formData.description) {
      toast.error("Please enter title and description first");
      return false;
    }

    setScanning(true);
    setScanResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('scan-game-content', {
        body: { 
          title: formData.title, 
          description: formData.description 
        }
      });

      if (error) throw error;

      setScanResult(data);
      
      if (data.safe) {
        toast.success("Content scan passed! ✅");
        return true;
      } else {
        toast.error(`Content flagged: ${data.reason}`);
        return false;
      }
    } catch (error) {
      console.error('Scan error:', error);
      // Allow upload to proceed with manual review
      setScanResult({
        safe: true,
        reason: "Scan unavailable - will require manual review",
        confidence: 0.5,
        needsReview: true
      });
      return true;
    } finally {
      setScanning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to upload games");
      navigate("/auth");
      return;
    }

    if (!formData.confirmed) {
      toast.error("Please confirm that your game has no bad content");
      return;
    }

    // Run safety scan first
    const isSafe = await runSafetyScan();
    if (!isSafe) {
      return;
    }

    if (uploadType === "zip") {
      if (!gameFile || !thumbnail) {
        toast.error("Please upload both game file and thumbnail");
        return;
      }
    } else {
      if (!formData.lovableUrl) {
        toast.error("Please enter your Lovable project URL");
        return;
      }
      if (!validateLovableUrl(formData.lovableUrl)) {
        toast.error("Please enter a valid Lovable URL (e.g., https://your-project.lovable.app)");
        return;
      }
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      if (uploadType === "zip") {
        // Upload game file with progress simulation
        setUploadProgress(10);
        const gameFileName = `${user.id}/${Date.now()}_${gameFile!.name}`;
        const { error: gameUploadError } = await supabase.storage
          .from('uploaded-games')
          .upload(gameFileName, gameFile!);

        if (gameUploadError) throw gameUploadError;
        setUploadProgress(50);

        // Upload thumbnail
        const thumbnailFileName = `${user.id}/${Date.now()}_${thumbnail!.name}`;
        const { error: thumbnailUploadError } = await supabase.storage
          .from('uploaded-games')
          .upload(thumbnailFileName, thumbnail!);

        if (thumbnailUploadError) throw thumbnailUploadError;
        setUploadProgress(80);

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
            status: scanResult?.needsReview ? 'pending' : 'approved',
            approved_at: scanResult?.needsReview ? null : new Date().toISOString(),
          });

        if (insertError) throw insertError;
        setUploadProgress(100);
      } else {
        // Insert into lovable_games table
        const { error: insertError } = await supabase
          .from('lovable_games')
          .insert({
            user_id: user.id,
            name: formData.title.toLowerCase().replace(/\s+/g, '-'),
            title: formData.title,
            description: formData.description,
            project_url: formData.lovableUrl,
            image_url: formData.imageUrl || null,
            approved: false,
          });

        if (insertError) throw insertError;
      }

      toast.success(
        uploadType === "zip" 
          ? "Game uploaded and published successfully! 🎉" 
          : "Lovable game submitted! It will be reviewed and published soon. 🎉"
      );
      navigate('/games');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || "Failed to upload game");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <Navigation />
      
      <div className="container max-w-2xl mx-auto py-8 px-4 pt-24">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <Card className="border-primary/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-3">
              <Upload className="w-8 h-8 text-primary" />
              Upload Your Game
            </CardTitle>
            <CardDescription className="text-base">
              Share your creation with the FUN Planet community! 🎮✨
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Upload Type Selector */}
              <Tabs value={uploadType} onValueChange={(v) => setUploadType(v as "zip" | "lovable")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="zip" className="gap-2">
                    <FileArchive className="h-4 w-4" />
                    Upload ZIP
                  </TabsTrigger>
                  <TabsTrigger value="lovable" className="gap-2">
                    <Link className="h-4 w-4" />
                    Lovable Link
                  </TabsTrigger>
                </TabsList>
              </Tabs>

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

              {/* AI Safety Scan Button */}
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={runSafetyScan}
                  disabled={scanning || !formData.title || !formData.description}
                  className="w-full gap-2"
                >
                  {scanning ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Scanning content...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" />
                      Run AI Safety Scan
                    </>
                  )}
                </Button>

                {/* Scan Result */}
                <AnimatePresence>
                  {scanResult && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`p-4 rounded-lg border ${
                        scanResult.safe 
                          ? 'bg-green-500/10 border-green-500/30' 
                          : 'bg-red-500/10 border-red-500/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {scanResult.safe ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">
                            {scanResult.safe ? 'Content Approved' : 'Content Flagged'}
                          </p>
                          <p className="text-sm text-muted-foreground">{scanResult.reason}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={scanResult.confidence > 0.7 ? "default" : "secondary"}>
                              {Math.round(scanResult.confidence * 100)}% confidence
                            </Badge>
                            {scanResult.needsReview && (
                              <Badge variant="outline" className="gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Manual review
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {uploadType === "zip" && (
                <>
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
                        <SelectItem value="action">Action 🎯</SelectItem>
                        <SelectItem value="puzzle">Puzzle 🧩</SelectItem>
                        <SelectItem value="adventure">Adventure 🗺️</SelectItem>
                        <SelectItem value="casual">Casual 🎮</SelectItem>
                        <SelectItem value="educational">Educational 📚</SelectItem>
                        <SelectItem value="racing">Racing 🏎️</SelectItem>
                        <SelectItem value="sports">Sports ⚽</SelectItem>
                        <SelectItem value="arcade">Arcade 👾</SelectItem>
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
                        <SelectItem value="3+">3+ years 👶</SelectItem>
                        <SelectItem value="6+">6+ years 🧒</SelectItem>
                        <SelectItem value="9+">9+ years 👦</SelectItem>
                        <SelectItem value="12+">12+ years 🧑</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Drag & Drop Game File */}
                  <div className="space-y-2">
                    <Label>Game File (.zip) *</Label>
                    <div
                      onDragOver={handleGameDragOver}
                      onDragLeave={handleGameDragLeave}
                      onDrop={handleGameDrop}
                      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                        isDraggingGame 
                          ? 'border-primary bg-primary/10 scale-[1.02]' 
                          : gameFile 
                            ? 'border-green-500 bg-green-500/10' 
                            : 'border-muted-foreground/30 hover:border-primary/50'
                      }`}
                    >
                      <input
                        type="file"
                        accept=".zip"
                        onChange={handleGameFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="space-y-2">
                        {gameFile ? (
                          <>
                            <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
                            <p className="font-medium text-green-600">{gameFile.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(gameFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </>
                        ) : (
                          <>
                            <Cloud className="w-12 h-12 mx-auto text-muted-foreground" />
                            <p className="font-medium">Drag & drop your ZIP file here</p>
                            <p className="text-sm text-muted-foreground">or click to browse</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Drag & Drop Thumbnail */}
                  <div className="space-y-2">
                    <Label>Game Thumbnail (Image) *</Label>
                    <div
                      onDragOver={handleThumbDragOver}
                      onDragLeave={handleThumbDragLeave}
                      onDrop={handleThumbDrop}
                      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                        isDraggingThumb 
                          ? 'border-primary bg-primary/10 scale-[1.02]' 
                          : thumbnail 
                            ? 'border-green-500 bg-green-500/10' 
                            : 'border-muted-foreground/30 hover:border-primary/50'
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="space-y-2">
                        {thumbnail ? (
                          <>
                            <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
                            <p className="font-medium text-green-600">{thumbnail.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(thumbnail.size / 1024).toFixed(0)} KB
                            </p>
                          </>
                        ) : (
                          <>
                            <Cloud className="w-12 h-12 mx-auto text-muted-foreground" />
                            <p className="font-medium">Drag & drop thumbnail here</p>
                            <p className="text-sm text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {uploadType === "lovable" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="lovableUrl">Lovable Project URL *</Label>
                    <Input
                      id="lovableUrl"
                      type="url"
                      value={formData.lovableUrl}
                      onChange={(e) => setFormData({ ...formData, lovableUrl: e.target.value })}
                      placeholder="https://your-project.lovable.app"
                      required={uploadType === "lovable"}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter your published Lovable project URL (e.g., https://my-game.lovable.app)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Thumbnail Image URL (optional)</Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://example.com/thumbnail.png"
                    />
                  </div>
                </>
              )}

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

              {/* Upload Progress */}
              {loading && uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || scanning}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {uploadType === "zip" ? "Uploading..." : "Submitting..."}
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    {uploadType === "zip" ? "Publish Game" : "Submit Lovable Game"}
                  </>
                )}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                {uploadType === "zip" 
                  ? "Your game will be published after AI safety scan! 🎉"
                  : "Your Lovable game will be reviewed before publishing. 🔍"
                }
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}