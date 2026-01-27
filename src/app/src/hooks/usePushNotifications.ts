import { useState, useEffect } from "react";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://family-planner-backend-ugxx.onrender.com";
const API_URL = BASE_URL.endsWith("/api") ? BASE_URL : `${BASE_URL}/api`;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

import { useModal } from "../context/ModalContext";

export function usePushNotifications() {
  const { alert } = useModal();
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== "undefined" && "Notification" in window
      ? window.Notification.permission
      : "denied",
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if SW is supported
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager
          .getSubscription()
          .then(async (subscription) => {
            if (!subscription) {
              setIsSubscribed(false);
              return;
            }

            // If we have a subscription, verify if it belongs to THIS household
            const token = localStorage.getItem("auth_token");
            console.log("🔔 [usePushNotifications] Checking subscription...", {
              hasToken: !!token,
              endpoint: subscription.endpoint,
            });

            if (!token) {
              console.log(
                "🔔 [usePushNotifications] No token found during check.",
              );
              setIsSubscribed(false);
              return;
            }

            try {
              const url = `${API_URL}/subscription-status?endpoint=${encodeURIComponent(subscription.endpoint)}`;
              console.log(
                "🔔 [usePushNotifications] Fetching status from:",
                url,
              );

              const res = await fetch(url, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              console.log(
                "🔔 [usePushNotifications] Response status:",
                res.status,
              );

              if (res.ok) {
                const data = await res.json();
                console.log(
                  "🔔 [usePushNotifications] Server response data:",
                  data,
                );
                setIsSubscribed(data.isSubscribed);
              } else {
                console.warn(
                  "🔔 [usePushNotifications] Status check failed:",
                  res.status,
                );
                // Fallback if API fails or auth invalid
                setIsSubscribed(false);
              }
            } catch (err) {
              console.error("Error checking subscription status", err);
              setIsSubscribed(false);
            }
          });
      });
    }
  }, []);

  const subscribeToPush = async (familyMemberIds?: string[]) => {
    setLoading(true);
    try {
      if (!("serviceWorker" in navigator)) {
        throw new Error("Service Worker no soportado");
      }
      if (!("PushManager" in window)) {
        throw new Error("Push Manager no soportado");
      }

      const registration = await navigator.serviceWorker.register("/sw.js");

      await navigator.serviceWorker.ready;

      const perm = await window.Notification.requestPermission();
      setPermission(perm);

      if (perm !== "granted") {
        throw new Error("Permiso denegado");
      }

      const response = await fetch(`${API_URL}/vapid-public-key`);
      if (!response.ok) {
        throw new Error(`Failed to fetch VAPID key: ${response.status}`);
      }
      const data = await response.json();

      if (!data.publicKey) {
        throw new Error("VAPID public key is missing from server response");
      }

      const { publicKey } = data;
      const convertedVapidKey = urlBase64ToUint8Array(publicKey);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });

      const token = localStorage.getItem("auth_token");

      const subscribeResponse = await fetch(`${API_URL}/subscribe`, {
        method: "POST",
        body: JSON.stringify({
          subscription,
          familyMemberIds,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!subscribeResponse.ok) {
        throw new Error(
          `Failed to save subscription: ${subscribeResponse.status}`,
        );
      }

      setIsSubscribed(true);

      alert("¡Notificaciones activadas correctamente!");
    } catch (error) {
      console.error("❌ Error subscribing to push:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      alert(`Error al activar notificaciones: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeFromPush = async (silent: boolean = false) => {
    setLoading(true);
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        throw new Error("Push notifications no soportadas");
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        setIsSubscribed(false);
        return;
      }

      // 1. Unsubscribe from browser
      const successful = await subscription.unsubscribe();
      if (!successful) {
        throw new Error("No se pudo cancelar la suscripción en el navegador");
      }

      // 2. Unsubscribe from server
      await fetch(`${API_URL}/unsubscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });

      setIsSubscribed(false);
      if (!silent) {
        alert("Has desactivado las notificaciones.");
      }
    } catch (error) {
      console.error("Error unsubscribing", error);
      if (!silent) {
        alert("Error al desactivar notificaciones");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    permission,
    isSubscribed,
    subscribeToPush,
    unsubscribeFromPush,
    loading,
  };
}
