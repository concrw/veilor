import { useState, useEffect } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  registerServiceWorker,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
} from "@/utils/registerSW";
import { useT } from "@/i18n/useT";

interface PushNotificationToggleProps {
  variant?: "button" | "switch";
  showLabel?: boolean;
  className?: string;
}

export const PushNotificationToggle = ({
  variant = "button",
  showLabel = true,
  className = "",
}: PushNotificationToggleProps) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupported, setIsSupported] = useState(false);
  const { toast } = useToast();
  const t = useT();
  const s = t.pushNotification;

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      // Check if push notifications are supported
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setIsSupported(false);
        setIsLoading(false);
        return;
      }

      setIsSupported(true);

      // Check current subscription status
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error("Error checking subscription status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async () => {
    if (!isSupported) {
      toast({ title: s.unsupportedTitle, description: s.unsupportedDesc, variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      if (isSubscribed) {
        await unsubscribeFromPushNotifications(supabase);
        setIsSubscribed(false);
        toast({ title: s.unsubscribedTitle, description: s.unsubscribedDesc });
      } else {
        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
          toast({ title: s.permissionTitle, description: s.permissionDesc, variant: "destructive" });
          setIsLoading(false);
          return;
        }

        const registration = await registerServiceWorker();
        if (!registration) {
          throw new Error(s.swError);
        }

        const subscription = await subscribeToPushNotifications(registration, supabase);

        if (subscription) {
          setIsSubscribed(true);
          toast({ title: s.subscribedTitle, description: s.subscribedDesc });
        } else {
          throw new Error(s.subscribeError);
        }
      }
    } catch (error) {
      console.error("Push notification toggle error:", error);
      toast({ title: s.errorTitle, description: s.errorDesc, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported && !isLoading) {
    return null;
  }

  if (variant === "switch") {
    return (
      <div className={`flex items-center justify-between ${className}`}>
        {showLabel && (
          <div className="flex items-center gap-2">
            {isSubscribed ? (
              <Bell className="w-4 h-4 text-primary" />
            ) : (
              <BellOff className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="text-sm">{s.label}</span>
          </div>
        )}
        <Switch
          checked={isSubscribed}
          onCheckedChange={handleToggle}
          disabled={isLoading}
        />
      </div>
    );
  }

  return (
    <Button
      variant={isSubscribed ? "default" : "outline"}
      size="sm"
      onClick={handleToggle}
      disabled={isLoading}
      className={`gap-2 ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isSubscribed ? (
        <Bell className="w-4 h-4" />
      ) : (
        <BellOff className="w-4 h-4" />
      )}
      {showLabel && (
        <span className="text-xs">
          {isLoading ? s.processing : isSubscribed ? s.enabled : s.enable}
        </span>
      )}
    </Button>
  );
};
