import { useState, useEffect, useCallback } from "react";

interface FullscreenDocument extends Document {
  webkitFullscreenElement?: Element;
  mozFullScreenElement?: Element;
  msFullscreenElement?: Element;
  webkitExitFullscreen?: () => Promise<void>;
  mozCancelFullScreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
}

interface FullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCSSFullscreen, setIsCSSFullscreen] = useState(false);

  // Check if native fullscreen API is supported
  const isFullscreenSupported = useCallback(() => {
    const doc = document as FullscreenDocument;
    return !!(
      document.fullscreenEnabled ||
      (doc as any).webkitFullscreenEnabled ||
      (doc as any).mozFullScreenEnabled ||
      (doc as any).msFullscreenEnabled
    );
  }, []);

  // Get current fullscreen element
  const getFullscreenElement = useCallback(() => {
    const doc = document as FullscreenDocument;
    return (
      document.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    );
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!getFullscreenElement());
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);
    
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, [getFullscreenElement]);

  const enterFullscreen = useCallback(async () => {
    const element = document.documentElement as FullscreenElement;
    
    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      } else {
        // Fallback for iOS and unsupported browsers - use CSS fullscreen
        setIsCSSFullscreen(true);
        setIsFullscreen(true);
        document.body.classList.add('css-fullscreen');
        // Lock scroll
        document.body.style.overflow = 'hidden';
        // Request landscape orientation if supported
        if (screen.orientation && (screen.orientation as any).lock) {
          try {
            await (screen.orientation as any).lock('landscape');
          } catch (e) {
            console.log('Orientation lock not supported');
          }
        }
      }
    } catch (error) {
      console.error("Error entering fullscreen:", error);
      // Fallback to CSS fullscreen
      setIsCSSFullscreen(true);
      setIsFullscreen(true);
      document.body.classList.add('css-fullscreen');
      document.body.style.overflow = 'hidden';
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    const doc = document as FullscreenDocument;
    
    try {
      if (isCSSFullscreen) {
        // Exit CSS fullscreen
        setIsCSSFullscreen(false);
        setIsFullscreen(false);
        document.body.classList.remove('css-fullscreen');
        document.body.style.overflow = '';
        // Unlock orientation
        if (screen.orientation && (screen.orientation as any).unlock) {
          (screen.orientation as any).unlock();
        }
        return;
      }
      
      if (getFullscreenElement()) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen();
        }
      }
    } catch (error) {
      console.error("Error exiting fullscreen:", error);
      setIsCSSFullscreen(false);
      setIsFullscreen(false);
      document.body.classList.remove('css-fullscreen');
      document.body.style.overflow = '';
    }
  }, [isCSSFullscreen, getFullscreenElement]);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen || isCSSFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, isCSSFullscreen, enterFullscreen, exitFullscreen]);

  return {
    isFullscreen: isFullscreen || isCSSFullscreen,
    isCSSFullscreen,
    isFullscreenSupported: isFullscreenSupported(),
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  };
}
