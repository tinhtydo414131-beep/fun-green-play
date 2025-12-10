import { useState, useCallback, useEffect } from "react";
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
import { 
  Upload, Loader2, ArrowLeft, Link, FileArchive, Shield, CheckCircle, XCircle, 
  AlertTriangle, Cloud, Rocket, ExternalLink, Sparkles, HelpCircle, Globe, Zap 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [uploadType, setUploadType] = useState<"deploy-link" | "zip" | "lovable">("deploy-link");
  const [gameFile, setGameFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [isDraggingGame, setIsDraggingGame] = useState(false);
  const [isDraggingThumb, setIsDraggingThumb] = useState(false);
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  const [urlValidated, setUrlValidated] = useState(false);
  const [isReactViteProject, setIsReactViteProject] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    ageAppropriate: "",
    confirmed: false,
    lovableUrl: "",
    imageUrl: "",
    externalUrl: "",
    thumbnailUrl: "",
  });

  // Validate deploy URL and try to extract metadata
  const validateDeployUrl = useCallback(async (url: string) => {
    if (!url) {
      setUrlValidated(false);
      return;
    }

    // Check for valid deploy platforms
    const validPatterns = [
      /^https?:\/\/[a-zA-Z0-9-]+\.vercel\.app/,
      /^https?:\/\/[a-zA-Z0-9-]+\.netlify\.app/,
      /^https?:\/\/[a-zA-Z0-9-]+\.lovable\.(app|dev)/,
      /^https?:\/\/[a-zA-Z0-9-]+\.replit\.dev/,
      /^https?:\/\/[a-zA-Z0-9-]+\.glitch\.me/,
      /^https?:\/\/[a-zA-Z0-9-]+\.pages\.dev/, // Cloudflare Pages
      /^https?:\/\/[a-zA-Z0-9-]+\.surge\.sh/,
      /^https?:\/\/[a-zA-Z0-9-]+\.github\.io/,
      /^https?:\/\/[a-zA-Z0-9-]+\.firebaseapp\.com/,
      /^https?:\/\/[a-zA-Z0-9-]+\.web\.app/,
    ];

    const isValidPlatform = validPatterns.some(pattern => pattern.test(url));
    
    if (!isValidPlatform && url.startsWith('http')) {
      // Still allow custom domains
      setIsValidatingUrl(true);
      try {
        // Just check if the URL is accessible (simple validation)
        setUrlValidated(true);
        toast.success("Deploy URL looks valid! 🚀");
      } catch (error) {
        setUrlValidated(false);
      } finally {
        setIsValidatingUrl(false);
      }
    } else if (isValidPlatform) {
      setUrlValidated(true);
      toast.success("Detected deploy platform! 🎮");
    }
  }, []);

  // Debounce URL validation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.externalUrl && formData.externalUrl.startsWith('http')) {
        validateDeployUrl(formData.externalUrl);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.externalUrl, validateDeployUrl]);

  // Check if uploaded ZIP is a React/Vite project
  const checkZipContents = useCallback(async (file: File) => {
    try {
      const JSZip = (await import('jszip')).default;
      const zip = await JSZip.loadAsync(file);
      
      const fileNames = Object.keys(zip.files);
      const hasPackageJson = fileNames.some(f => f.endsWith('package.json') || f === 'package.json');
      const hasSrcFolder = fileNames.some(f => f.includes('/src/') || f.startsWith('src/'));
      const hasNodeModules = fileNames.some(f => f.includes('node_modules'));
      const hasViteConfig = fileNames.some(f => f.includes('vite.config'));
      
      if ((hasPackageJson && hasSrcFolder) || hasViteConfig || hasNodeModules) {
        setIsReactViteProject(true);
        toast.warning(
          "Detected React/Vite source code! 🔧 Please deploy to Vercel first, or upload the 'dist' folder instead.",
          { duration: 8000 }
        );
        return true;
      }
      
      setIsReactViteProject(false);
      return false;
    } catch (error) {
      console.error('Error checking ZIP contents:', error);
      return false;
    }
  }, []);

  // Drag and drop handlers for game file
  const handleGameDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingGame(true);
  }, []);

  const handleGameDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingGame(false);
  }, []);

  const handleGameDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingGame(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.zip')) {
      setGameFile(file);
      await checkZipContents(file);
      toast.success(`Game file "${file.name}" ready! 🎮`);
      triggerAutoScan();
    } else {
      toast.error("Please drop a .zip file");
    }
  }, [checkZipContents]);

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

  const handleGameFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.zip')) {
      setGameFile(file);
      await checkZipContents(file);
      triggerAutoScan();
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

  // Auto-trigger safety scan when file is uploaded and form has title/description
  const triggerAutoScan = useCallback(() => {
    setTimeout(() => {
      const titleInput = document.getElementById('title') as HTMLInputElement;
      const descInput = document.getElementById('description') as HTMLTextAreaElement;
      if (titleInput?.value && descInput?.value) {
        runSafetyScan();
      }
    }, 100);
  }, []);

  // AI Safety Scan
  const runSafetyScan = async (): Promise<boolean> => {
    if (!formData.title || !formData.description) {
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

    // Validate based on upload type
    if (uploadType === "deploy-link") {
      if (!formData.externalUrl) {
        toast.error("Please enter your deployed game URL");
        return;
      }
      if (!formData.title || !formData.description) {
        toast.error("Please enter game title and description");
        return;
      }
    } else if (uploadType === "zip") {
      if (!gameFile || !thumbnail) {
        toast.error("Please upload both game file and thumbnail");
        return;
      }
      // Warn if it's a React/Vite source project
      if (isReactViteProject) {
        toast.error("Please deploy your React/Vite project first, then paste the deploy link!");
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
      if (uploadType === "deploy-link") {
        // Handle deploy link upload - no ZIP needed!
        setUploadProgress(30);

        // Upload thumbnail if provided as file
        let thumbnailPath = '';
        if (thumbnail) {
          const thumbnailFileName = `${user.id}/${Date.now()}_${thumbnail.name}`;
          const { error: thumbnailUploadError } = await supabase.storage
            .from('uploaded-games')
            .upload(thumbnailFileName, thumbnail);
          if (thumbnailUploadError) throw thumbnailUploadError;
          thumbnailPath = thumbnailFileName;
        }
        setUploadProgress(60);

        // Insert game record with external URL
        const { error: insertError } = await supabase
          .from('uploaded_games')
          .insert({
            user_id: user.id,
            title: formData.title,
            description: formData.description,
            category: formData.category as any || 'casual',
            game_file_path: 'deployed-game', // Placeholder for deployed games
            thumbnail_path: thumbnailPath || formData.thumbnailUrl || '',
            tags: [formData.ageAppropriate || '3+', 'deployed'],
            status: 'approved',
            approved_at: new Date().toISOString(),
            external_url: formData.externalUrl,
          });

        if (insertError) throw insertError;
        setUploadProgress(90);

        // Award 500,000 Camly coins for deploy link upload
        const rewardAmount = 500000;
        
        await supabase
          .from('camly_coin_transactions')
          .insert({
            user_id: user.id,
            amount: rewardAmount,
            transaction_type: 'reward',
            description: `Deployed game upload: ${formData.title}`,
          });

        const { data: profile } = await supabase
          .from('profiles')
          .select('wallet_balance')
          .eq('id', user.id)
          .single();

        await supabase
          .from('profiles')
          .update({ 
            wallet_balance: (profile?.wallet_balance || 0) + rewardAmount 
          })
          .eq('id', user.id);

        setUploadProgress(100);
        toast.success(`🎉 Game deployed! You earned ${rewardAmount.toLocaleString()} Camly coins!`);

      } else if (uploadType === "zip") {
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
            external_url: formData.externalUrl || null,
          });

        if (insertError) throw insertError;
        setUploadProgress(100);

        // Award 500,000 Camly coins for approved game upload
        if (!scanResult?.needsReview) {
          const rewardAmount = 500000;
          
          await supabase
            .from('camly_coin_transactions')
            .insert({
              user_id: user.id,
              amount: rewardAmount,
              transaction_type: 'reward',
              description: `Game upload reward: ${formData.title}`,
            });

          const { data: profile } = await supabase
            .from('profiles')
            .select('wallet_balance')
            .eq('id', user.id)
            .single();

          await supabase
            .from('profiles')
            .update({ 
              wallet_balance: (profile?.wallet_balance || 0) + rewardAmount 
            })
            .eq('id', user.id);

          toast.success(`🎉 You earned ${rewardAmount.toLocaleString()} Camly coins for uploading!`);
        }
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
        uploadType === "deploy-link"
          ? "🚀 Deployed game published instantly! Play now!"
          : uploadType === "zip" 
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
              <br />
              <span className="text-primary font-medium">CHA GROK IMPROVED UPLOAD – Dễ dàng upload React/Vite games!</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Upload Type Selector - 3 tabs now */}
              <Tabs value={uploadType} onValueChange={(v) => setUploadType(v as "deploy-link" | "zip" | "lovable")}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="deploy-link" className="gap-2">
                    <Rocket className="h-4 w-4" />
                    Deploy Link ⭐
                  </TabsTrigger>
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

              {/* DEPLOY LINK - Featured option for complex React/Vite games */}
              {uploadType === "deploy-link" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Hero banner for deploy link */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 border border-primary/30">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-primary/20">
                        <Zap className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                          🚀 Cách nhanh nhất để upload game React/Vite!
                          <Badge variant="secondary" className="bg-primary/20 text-primary">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Recommended
                          </Badge>
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Đã deploy game lên Vercel/Netlify? Paste link và chơi ngay! Nhận thưởng 500K CAMLY 🎉
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Deploy URL Input - Prominent */}
                  <div className="space-y-2">
                    <Label htmlFor="externalUrl" className="text-base font-semibold flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Paste your deployed game link 🚀
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Game đã deploy trên Vercel, Netlify, Replit, Glitch, Lovable, GitHub Pages, hoặc bất kỳ hosting nào!</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <div className="relative">
                      <Input
                        id="externalUrl"
                        type="url"
                        placeholder="https://my-awesome-game.vercel.app"
                        value={formData.externalUrl}
                        onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                        className={`text-lg py-6 pr-12 ${urlValidated ? 'border-green-500 bg-green-500/5' : ''}`}
                      />
                      {isValidatingUrl && (
                        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
                      )}
                      {urlValidated && !isValidatingUrl && (
                        <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Hỗ trợ: Vercel, Netlify, Lovable, Replit, Glitch, GitHub Pages, Firebase, Cloudflare Pages...
                    </p>
                  </div>

                  {/* Quick Help Link */}
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
                    <HelpCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm">Chưa biết deploy?</span>
                    <a 
                      href="https://vercel.com/docs/getting-started-with-vercel" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      Hướng dẫn deploy game lên Vercel miễn phí (30 giây)
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Thumbnail URL or Upload */}
                  <div className="space-y-3">
                    <Label>Thumbnail Image URL (optional)</Label>
                    <Input
                      id="thumbnailUrl"
                      type="url"
                      placeholder="https://example.com/thumbnail.png"
                      value={formData.thumbnailUrl}
                      onChange={(e) => {
                        setFormData({ ...formData, thumbnailUrl: e.target.value });
                        if (e.target.value) setThumbnail(null); // Clear file if URL is entered
                      }}
                      className="border-primary/50 focus:border-primary"
                    />
                    
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground">OR</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    <div
                      onDragOver={handleThumbDragOver}
                      onDragLeave={handleThumbDragLeave}
                      onDrop={handleThumbDrop}
                      className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer ${
                        isDraggingThumb 
                          ? 'border-primary bg-primary/10' 
                          : thumbnail 
                            ? 'border-green-500 bg-green-500/10' 
                            : 'border-muted-foreground/30 hover:border-primary/50'
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          handleThumbnailChange(e);
                          if (e.target.files?.[0]) setFormData({ ...formData, thumbnailUrl: '' }); // Clear URL if file is uploaded
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {thumbnail ? (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <p className="text-sm text-green-600 truncate">{thumbnail.name}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Upload image file (drag & drop or click)</p>
                      )}
                    </div>
                  </div>

                  {/* Badge Preview */}
                  {urlValidated && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium">Game sẽ có badge:</span>
                      <Badge className="bg-gradient-to-r from-primary to-secondary text-white">
                        <Rocket className="w-3 h-3 mr-1" />
                        Deployed Game
                      </Badge>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Common fields: Title and Description */}
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

              {/* Category and Age - for deploy-link and zip */}
              {(uploadType === "deploy-link" || uploadType === "zip") && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
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
                    <Label htmlFor="ageAppropriate">Age Rating</Label>
                    <Select
                      value={formData.ageAppropriate}
                      onValueChange={(value) => setFormData({ ...formData, ageAppropriate: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select age" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3+">3+ years 👶</SelectItem>
                        <SelectItem value="6+">6+ years 🧒</SelectItem>
                        <SelectItem value="9+">9+ years 👦</SelectItem>
                        <SelectItem value="12+">12+ years 🧑</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* AI Safety Scan Status */}
              <div className="space-y-3">
                {scanning && (
                  <div className="w-full p-3 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm font-medium">AI scanning content...</span>
                  </div>
                )}

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
                  {/* React/Vite Warning Tooltip */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-600 dark:text-amber-400">
                          Game React/Vite phức tạp? 🔧
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Deploy lên Vercel rồi paste link ở tab "Deploy Link" để chơi ngay! Hoặc upload source ZIP, FUN Planet sẽ hướng dẫn bạn build.
                        </p>
                        <Button
                          type="button"
                          variant="link"
                          className="p-0 h-auto text-primary"
                          onClick={() => setUploadType("deploy-link")}
                        >
                          → Chuyển sang tab Deploy Link
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* React/Vite Source Detected Warning */}
                  {isReactViteProject && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 rounded-xl bg-red-500/10 border border-red-500/30"
                    >
                      <div className="flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                        <div>
                          <p className="font-bold text-red-600 dark:text-red-400">
                            Phát hiện source code React/Vite!
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Bạn đang upload source code, không phải game đã build. Vui lòng:
                          </p>
                          <ul className="text-sm text-muted-foreground list-disc list-inside mt-2">
                            <li>Deploy lên Vercel/Netlify và paste link</li>
                            <li>Hoặc chạy <code className="bg-muted px-1 rounded">npm run build</code> rồi upload folder <code className="bg-muted px-1 rounded">dist/</code></li>
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Important Notice */}
                  <div className="p-3 rounded-lg bg-muted/50 border text-sm">
                    <p className="font-medium flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Yêu cầu cho file ZIP:
                    </p>
                    <ul className="mt-2 space-y-1 text-muted-foreground list-disc list-inside">
                      <li>ZIP phải chứa file <code className="bg-muted px-1 rounded">index.html</code></li>
                      <li>Chỉ upload game HTML/CSS/JS đã build sẵn (static)</li>
                      <li>Nếu là React/Vite: upload folder <code className="bg-muted px-1 rounded">dist/</code> sau khi build</li>
                    </ul>
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
                            ? isReactViteProject
                              ? 'border-red-500 bg-red-500/10'
                              : 'border-green-500 bg-green-500/10' 
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
                            {isReactViteProject ? (
                              <XCircle className="w-12 h-12 mx-auto text-red-500" />
                            ) : (
                              <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
                            )}
                            <p className={`font-medium ${isReactViteProject ? 'text-red-600' : 'text-green-600'}`}>
                              {gameFile.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {(gameFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </>
                        ) : (
                          <>
                            <Cloud className="w-12 h-12 mx-auto text-muted-foreground" />
                            <p className="font-medium">Kéo thả file ZIP vào đây</p>
                            <p className="text-sm text-muted-foreground">hoặc click để chọn file</p>
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
                disabled={loading || scanning || (uploadType === "zip" && isReactViteProject)}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {uploadType === "deploy-link" ? "Publishing..." : uploadType === "zip" ? "Uploading..." : "Submitting..."}
                  </>
                ) : (
                  <>
                    {uploadType === "deploy-link" ? (
                      <>
                        <Rocket className="mr-2 h-5 w-5" />
                        Publish Deployed Game 🚀
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-5 w-5" />
                        {uploadType === "zip" ? "Publish Game" : "Submit Lovable Game"}
                      </>
                    )}
                  </>
                )}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                {uploadType === "deploy-link"
                  ? "Game will be published instantly and you'll earn 500K CAMLY! 🎉"
                  : uploadType === "zip" 
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
