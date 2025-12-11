import { useEffect, useCallback, useState } from "react";
import { useAuth } from "./useAuth";

export function usePushNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if ("Notification" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, [isSupported]);

  const showNotification = useCallback(
    (title: string, options?: NotificationOptions & { renotify?: boolean }) => {
      if (!isSupported || permission !== "granted") return;

      // Only show if document is hidden (app in background)
      if (document.visibilityState === "hidden") {
        const notification = new Notification(title, {
          icon: "/pwa-192x192.png",
          badge: "/favicon-32x32.png",
          ...options,
        } as NotificationOptions);

        // Play notification sound
        const audio = new Audio("https://media.funplanet.life/audio/coin-reward.mp3");
        audio.volume = 0.3;
        audio.play().catch(() => {});

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        // Auto close after 5 seconds
        setTimeout(() => notification.close(), 5000);
      }
    },
    [isSupported, permission]
  );

  const notifyNewMessage = useCallback(
    (senderName: string, message: string) => {
      showNotification(`New message from ${senderName}`, {
        body: message.length > 50 ? message.substring(0, 50) + "..." : message,
        tag: "new-message",
      });
    },
    [showNotification]
  );

  const notifyFriendRequest = useCallback(
    (senderName: string) => {
      showNotification(`${senderName} sent you a friend request! 👋`, {
        body: "Tap to view and accept",
        tag: "friend-request",
      });
    },
    [showNotification]
  );

  const notifyTransfer = useCallback(
    (senderName: string, amount: number) => {
      showNotification(`${senderName} sent you ${amount.toLocaleString()} CAMLY! 💰`, {
        body: "Tap to view your balance",
        tag: "transfer",
      });
    },
    [showNotification]
  );

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
    notifyNewMessage,
    notifyFriendRequest,
    notifyTransfer,
  };
}
