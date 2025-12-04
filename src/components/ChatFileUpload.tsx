import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, X, File, Image, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChatFileUploadProps {
  userId: string;
  roomId: string;
  onFileUploaded: (fileData: {
    url: string;
    type: string;
    name: string;
  }) => void;
  disabled?: boolean;
}

interface PendingFile {
  file: File;
  preview?: string;
}

export function ChatFileUpload({ userId, roomId, onFileUploaded, disabled }: ChatFileUploadProps) {
  const [pendingFile, setPendingFile] = useState<PendingFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileType = (file: File): string => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("audio/")) return "audio";
    if (file.type === "application/pdf") return "pdf";
    return "file";
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Max size is 10MB");
      return;
    }

    const fileType = getFileType(file);
    let preview: string | undefined;

    if (fileType === "image") {
      preview = URL.createObjectURL(file);
    }

    setPendingFile({ file, preview });
  };

  const uploadFile = async () => {
    if (!pendingFile) return;

    setUploading(true);
    try {
      const fileExt = pendingFile.file.name.split(".").pop();
      const fileName = `${userId}/${roomId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("chat-attachments")
        .upload(fileName, pendingFile.file);

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from("chat-attachments")
        .getPublicUrl(data.path);

      onFileUploaded({
        url: publicUrl.publicUrl,
        type: getFileType(pendingFile.file),
        name: pendingFile.file.name,
      });

      clearPendingFile();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const clearPendingFile = () => {
    if (pendingFile?.preview) {
      URL.revokeObjectURL(pendingFile.preview);
    }
    setPendingFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="w-4 h-4" />;
      case "pdf":
        return <FileText className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
      />
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || uploading}
        className="flex-shrink-0"
      >
        <Paperclip className="w-5 h-5" />
      </Button>

      {pendingFile && (
        <div className="absolute bottom-12 left-0 bg-card border rounded-lg p-3 shadow-lg min-w-[200px]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-sm font-medium truncate max-w-[150px]">
              {pendingFile.file.name}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={clearPendingFile}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {pendingFile.preview && (
            <img
              src={pendingFile.preview}
              alt="Preview"
              className="w-full h-24 object-cover rounded mb-2"
            />
          )}
          
          {!pendingFile.preview && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded mb-2">
              {getFileIcon(getFileType(pendingFile.file))}
              <span className="text-xs text-muted-foreground">
                {(pendingFile.file.size / 1024).toFixed(1)} KB
              </span>
            </div>
          )}

          <Button
            size="sm"
            className="w-full"
            onClick={uploadFile}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              "Send File"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

interface ChatAttachmentProps {
  url: string;
  type: string;
  name: string;
  isOwn: boolean;
}

export function ChatAttachment({ url, type, name, isOwn }: ChatAttachmentProps) {
  if (type === "image") {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <img
          src={url}
          alt={name}
          className="max-w-[250px] max-h-[200px] rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
        />
      </a>
    );
  }

  if (type === "video") {
    return (
      <video
        src={url}
        controls
        className="max-w-[250px] max-h-[200px] rounded-lg"
      />
    );
  }

  if (type === "audio") {
    return (
      <audio src={url} controls className="max-w-[250px]" />
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
        isOwn 
          ? "bg-white/20 hover:bg-white/30" 
          : "bg-primary/10 hover:bg-primary/20"
      }`}
    >
      {type === "pdf" ? (
        <FileText className="w-5 h-5 flex-shrink-0" />
      ) : (
        <File className="w-5 h-5 flex-shrink-0" />
      )}
      <span className="text-sm truncate max-w-[150px]">{name}</span>
    </a>
  );
}
