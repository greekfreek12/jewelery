"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";

export function PushNotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    setPermission(Notification.permission);

    // Only show if permission is default (not yet asked)
    if (Notification.permission !== "default") return;

    // Check if already dismissed recently
    const dismissed = localStorage.getItem("push-prompt-dismissed");
    if (dismissed) {
      const dismissedAt = new Date(dismissed);
      const daysSince = (Date.now() - dismissedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 3) return;
    }

    // Show after a delay
    const timer = setTimeout(() => setShowPrompt(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleEnable = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        // Register for push notifications
        const registration = await navigator.serviceWorker.ready;
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (vapidPublicKey) {
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
          });

          // Send subscription to server
          await fetch("/api/push/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(subscription.toJSON()),
          });
        }

        setShowPrompt(false);
      } else {
        handleDismiss();
      }
    } catch (error) {
      console.error("Push notification error:", error);
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("push-prompt-dismissed", new Date().toISOString());
    setShowPrompt(false);
  };

  if (!showPrompt || permission !== "default") return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 animate-slide-up">
      <div className="card p-4 shadow-lg border border-blue-200 bg-blue-50">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 text-sm">Enable Notifications</h3>
            <p className="text-xs text-slate-600 mt-1">
              Get notified instantly when you receive new messages or calls.
            </p>
            <div className="flex gap-2 mt-3">
              <button onClick={handleEnable} className="btn-accent text-xs py-1.5 px-3">
                Enable
              </button>
              <button onClick={handleDismiss} className="btn-secondary text-xs py-1.5 px-3">
                Not now
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
