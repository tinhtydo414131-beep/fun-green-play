/**
 * Image Optimization Utilities
 * Helps with lazy loading, compression, and responsive images
 */

/**
 * Convert a blob to WebP format for better compression
 */
export const convertToWebP = async (blob: Blob): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob(
        (webpBlob) => {
          URL.revokeObjectURL(url);
          if (webpBlob) {
            resolve(webpBlob);
          } else {
            reject(new Error('Failed to convert to WebP'));
          }
        },
        'image/webp',
        0.85 // Quality setting
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};

/**
 * Compress an image to a target file size
 */
export const compressImage = async (
  blob: Blob,
  maxSizeKB: number = 500
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    
    img.onload = () => {
      let quality = 0.9;
      let width = img.width;
      let height = img.height;
      
      // Reduce dimensions if image is very large
      const maxDimension = 1920;
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width *= ratio;
        height *= ratio;
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      const tryCompress = (q: number) => {
        canvas.toBlob(
          (compressedBlob) => {
            URL.revokeObjectURL(url);
            
            if (!compressedBlob) {
              reject(new Error('Failed to compress'));
              return;
            }
            
            const sizeKB = compressedBlob.size / 1024;
            
            // If size is good or quality is already low, return
            if (sizeKB <= maxSizeKB || q <= 0.3) {
              resolve(compressedBlob);
            } else {
              // Try again with lower quality
              tryCompress(q - 0.1);
            }
          },
          'image/jpeg',
          q
        );
      };
      
      tryCompress(quality);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};

/**
 * Create a blur placeholder for an image
 */
export const createBlurPlaceholder = (imageUrl: string): string => {
  // This is a simple base64 blur placeholder
  // In production, you'd generate this server-side or use a service
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3C/filter%3E%3Cimage preserveAspectRatio='none' filter='url(%23b)' width='100%25' height='100%25' href='${imageUrl}'/%3E%3C/svg%3E`;
};

/**
 * Get optimized image URL with size parameters
 */
export const getOptimizedImageUrl = (
  url: string,
  width?: number,
  quality: number = 85
): string => {
  // If using Supabase storage or similar service that supports transformations
  if (url.includes('supabase')) {
    const urlObj = new URL(url);
    if (width) urlObj.searchParams.set('width', width.toString());
    urlObj.searchParams.set('quality', quality.toString());
    return urlObj.toString();
  }
  
  return url;
};

/**
 * Lazy load images with Intersection Observer
 */
export const setupLazyLoading = () => {
  if ('loading' in HTMLImageElement.prototype) {
    // Browser supports native lazy loading
    return;
  }
  
  // Fallback for browsers that don't support native lazy loading
  const images = document.querySelectorAll('img[loading="lazy"]');
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        imageObserver.unobserve(img);
      }
    });
  });
  
  images.forEach((img) => imageObserver.observe(img));
};
